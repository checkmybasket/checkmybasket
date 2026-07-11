"use client";
import { use, useCallback, useEffect, useMemo, useState } from "react";
import { Dice5, Gift, MessageCircle, Gamepad2, Settings, CheckCircle2, Circle, AlertTriangle, ExternalLink, Send, Plus, Trash2, Lock, ArrowRight, Share2, X, Trophy, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn, formatBudget, getInitials, timeAgo } from "@/lib/utils";
import Link from "next/link";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import type { DrawStatus, GiftCategory, MemberRole, PredictionRoundStatus, WishlistPriority } from "@/lib/types";

// ─── Row shapes (explicit columns — select=* is denied on locked-down tables) ─
interface GroupRow   { id:string; name:string; mode:string; budget_amount:number|null; exchange_date:string|null; exchange_location:string|null; invite_code:string; draw_status:DrawStatus; organiser_id:string; }
interface MemberRow  { id:string; user_id:string; role:MemberRole; name:string; likes:string|null; dislikes:string|null; sizes:string|null; joined_at:string; }
interface WishRow    { id:string; user_id:string; title:string; url:string|null; price:number|null; shop_name:string|null; notes:string|null; priority:WishlistPriority; created_at:string; }
interface ClaimRow   { id:string; wishlist_item_id:string; claimed_by:string; }
interface DrawRow    { id:string; giver_id:string; recipient_id:string; gift_bought:boolean; }
interface MsgRow     { id:string; recipient_id:string; content:string; is_reply:boolean; parent_message_id:string|null; created_at:string; }
interface ExclRow    { id:string; user_a_id:string; user_b_id:string; }
interface RoundRow   { id:string; status:PredictionRoundStatus; }
interface PredRow    { id:string; predictor_id:string; subject_id:string; predicted_category:GiftCategory; }
interface ActualRow  { id:string; recipient_id:string; actual_category:GiftCategory; }

interface DashData {
  me: string;
  group: GroupRow;
  members: MemberRow[];
  wishes: WishRow[];
  claims: ClaimRow[];
  myDraw: DrawRow | null;
  messages: MsgRow[];
  exclusions: ExclRow[];
  round: RoundRow | null;
  predictions: PredRow[];
  actuals: ActualRow[];
  giftsBought: { bought:number; total:number } | null;
}

const GIFT_CATEGORIES: { key:GiftCategory; emoji:string; label:string }[] = [
  { key:"mug",       emoji:"☕", label:"A Mug" },
  { key:"chocolate", emoji:"🍫", label:"Chocolate & Snacks" },
  { key:"bath_body", emoji:"🧴", label:"Bath & Body" },
  { key:"candle",    emoji:"🕯️", label:"A Candle" },
  { key:"cosy",      emoji:"🧣", label:"Something Cosy" },
  { key:"joke",      emoji:"🃏", label:"A Joke Gift" },
  { key:"book",      emoji:"📖", label:"A Book" },
  { key:"drinks",    emoji:"🍷", label:"Drinks" },
  { key:"gift_card", emoji:"💳", label:"A Gift Card" },
  { key:"experience",emoji:"🎟️", label:"An Experience" },
  { key:"useful",    emoji:"🧩", label:"Something Useful" },
  { key:"surprise",  emoji:"🎁", label:"Complete Surprise" },
];

type Tab = "draw"|"wishlists"|"messages"|"games";

// ─── Page ────────────────────────────────────────────────────────────────────
export default function GroupDashboard({ params }: { params: Promise<{ group_id: string }> }) {
  const { group_id } = use(params);
  const [tab, setTab] = useState<Tab>("draw");
  const [data, setData] = useState<DashData | null>(null);
  const [loadState, setLoadState] = useState<"loading"|"ready"|"noaccess">("loading");

  const refresh = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoadState("noaccess"); return; }

    const { data: group } = await supabase.from("groups")
      .select("id,name,mode,budget_amount,exchange_date,exchange_location,invite_code,draw_status,organiser_id")
      .eq("id", group_id).maybeSingle();
    if (!group) { setLoadState("noaccess"); return; }

    const [members, wishes, myDraw, messages, exclusions, round] = await Promise.all([
      supabase.from("group_members").select("id,user_id,role,name,likes,dislikes,sizes,joined_at").eq("group_id", group_id).order("joined_at"),
      supabase.from("wishlist_items").select("id,user_id,title,url,price,shop_name,notes,priority,created_at").eq("group_id", group_id).order("created_at"),
      supabase.from("draws").select("id,giver_id,recipient_id,gift_bought").eq("group_id", group_id).maybeSingle(),
      supabase.from("anon_messages").select("id,recipient_id,content,is_reply,parent_message_id,created_at").eq("group_id", group_id).order("created_at"),
      supabase.from("exclusions").select("id,user_a_id,user_b_id").eq("group_id", group_id),
      supabase.from("prediction_rounds").select("id,status").eq("group_id", group_id).maybeSingle(),
    ]);

    const itemIds = (wishes.data ?? []).map(w => w.id);
    const [claims, predictions, actuals, bought] = await Promise.all([
      itemIds.length
        ? supabase.from("wishlist_claims").select("id,wishlist_item_id,claimed_by").in("wishlist_item_id", itemIds)
        : Promise.resolve({ data: [] as ClaimRow[] }),
      round.data
        ? supabase.from("predictions").select("id,predictor_id,subject_id,predicted_category").eq("round_id", round.data.id)
        : Promise.resolve({ data: [] as PredRow[] }),
      round.data
        ? supabase.from("actual_gifts").select("id,recipient_id,actual_category").eq("round_id", round.data.id)
        : Promise.resolve({ data: [] as ActualRow[] }),
      group.organiser_id === user.id && group.draw_status !== "pending"
        ? supabase.rpc("gifts_bought_count", { p_group_id: group_id })
        : Promise.resolve({ data: null }),
    ]);

    setData({
      me: user.id,
      group: group as GroupRow,
      members: members.data ?? [],
      wishes: wishes.data ?? [],
      claims: claims.data ?? [],
      myDraw: myDraw.data ?? null,
      messages: messages.data ?? [],
      exclusions: exclusions.data ?? [],
      round: round.data ?? null,
      predictions: predictions.data ?? [],
      actuals: actuals.data ?? [],
      giftsBought: bought.data ?? null,
    });
    setLoadState("ready");
  }, [group_id]);

  useEffect(() => { refresh(); }, [refresh]);

  if (loadState === "loading") return (
    <div className="min-h-dvh flex items-center justify-center" style={{ background:"var(--cmb-bg)" }}>
      <div className="w-full max-w-2xl px-4 space-y-4">
        <div className="rounded-2xl h-36 skeleton" />
        <div className="rounded-2xl h-64 skeleton" />
      </div>
    </div>
  );

  if (loadState === "noaccess" || !data) return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-4 text-center" style={{ background:"var(--cmb-bg)" }}>
      <Lock size={36} strokeWidth={1.5} className="mb-4" style={{ color:"var(--cmb-text-muted)" }} />
      <h1 className="text-xl font-bold mb-2" style={{ fontFamily:"var(--font-fraunces)" }}>This group is private</h1>
      <p className="text-sm mb-6 max-w-sm" style={{ color:"var(--cmb-text-secondary)" }}>
        Open the invite link you were sent to join, or ask your organiser to share it again.
      </p>
      <Link href="/"><Button variant="outline" className="rounded-xl h-11 px-6" style={{ borderColor:"var(--cmb-border-strong)" }}>Back to home</Button></Link>
    </div>
  );

  const { group, members, me } = data;
  const isOrganiser = group.organiser_id === me;
  const unreadMessages = data.messages.some(m => m.recipient_id === me);

  return (
    <div className="flex flex-col min-h-dvh" style={{ background:"var(--cmb-bg)" }}>
      <header className="sticky top-0 z-30 border-b" style={{ borderColor:"var(--cmb-border)", background:"rgba(255,248,240,0.95)", backdropFilter:"blur(12px)" }}>
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <Gift size={18} strokeWidth={1.5} style={{ color:"var(--cmb-primary)", flexShrink:0 }}/>
            <span className="font-semibold truncate" style={{ fontFamily:"var(--font-fraunces)", color:"var(--cmb-primary)" }}>{group.name}</span>
            <span className="rounded-full px-2 py-0.5 text-xs font-medium flex-shrink-0" style={{ background:"rgba(27,67,50,0.1)", color:"var(--cmb-primary)" }}>
              {members.length} member{members.length===1?"":"s"}
            </span>
          </div>
          {isOrganiser && (
            <Link href={`/g/${group.id}/settings`}>
              <Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-lg" aria-label="Group settings"><Settings size={18} strokeWidth={1.5}/></Button>
            </Link>
          )}
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6 pb-28">
        {tab==="draw"      && <DrawTab data={data} isOrganiser={isOrganiser} refresh={refresh}/>}
        {tab==="wishlists" && <WishlistsTab data={data} refresh={refresh}/>}
        {tab==="messages"  && <MessagesTab data={data} refresh={refresh}/>}
        {tab==="games"     && <GamesTab data={data} refresh={refresh}/>}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-30 border-t tab-bar" style={{ background:"var(--cmb-surface)", borderColor:"var(--cmb-border)" }}>
        <div className="max-w-2xl mx-auto px-2 flex">
          {([
            { key:"draw",      icon:Dice5,         label:"Draw",      dot:false },
            { key:"wishlists", icon:Gift,          label:"Wishlists", dot:false },
            { key:"messages",  icon:MessageCircle, label:"Messages",  dot:unreadMessages },
            { key:"games",     icon:Gamepad2,      label:"Games",     dot:false },
          ] as const).map(({ key, icon:Icon, label, dot }) => (
            <button key={key} onClick={() => setTab(key)} className="flex-1 flex flex-col items-center pt-2 pb-1 gap-1 relative min-h-[56px]"
              style={{ color:tab===key?"var(--cmb-primary)":"var(--cmb-text-muted)" }} aria-label={label}>
              <Icon size={22} strokeWidth={1.5}/>
              <span className="text-xs font-medium">{label}</span>
              {dot && tab!==key && <span className="absolute top-1.5 right-1/4 w-2 h-2 rounded-full" style={{ background:"var(--cmb-accent)" }} aria-hidden/>}
              {tab===key && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full" style={{ background:"var(--cmb-primary)" }}/>}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}

// ─── Draw Tab ────────────────────────────────────────────────────────────────
function DrawTab({ data, isOrganiser, refresh }: { data:DashData; isOrganiser:boolean; refresh:()=>Promise<void> }) {
  const { group, members, wishes, me, myDraw, giftsBought } = data;
  const [showConfirm,    setShowConfirm]    = useState(false);
  const [showExclusions, setShowExclusions] = useState(false);
  const [drawBusy,       setDrawBusy]       = useState(false);
  const [reminderSent,   setReminderSent]   = useState(false);

  const joined    = members.length;
  const usersWithWishes = new Set(wishes.map(w=>w.user_id));
  const wishlists = members.filter(m=>usersWithWishes.has(m.user_id)).length;
  const drawn     = group.draw_status !== "pending";
  const progress  = Math.round(((Math.min(joined,3)/3)*0.5 + (joined?wishlists/joined:0)*0.3 + (drawn?0.2:0))*100);
  const organiserName = members.find(m=>m.role==="organiser")?.name ?? "The organiser";

  async function handleDraw() {
    if (!showConfirm) { setShowConfirm(true); return; }
    setDrawBusy(true);
    const supabase = createClient();
    const { error } = await supabase.rpc("execute_draw", { p_group_id: group.id });
    if (error) { toast.error(error.message); }
    else { toast.success("Names drawn! Everyone can now see their match."); }
    setShowConfirm(false); setDrawBusy(false);
    await refresh();
  }
  function sendReminder() {
    window.open(`https://wa.me/?text=${encodeURIComponent(`Reminder: haven't joined Secret Santa yet? 🎅\n${window.location.origin}/join/${group.invite_code}`)}`, "_blank", "noopener");
    setReminderSent(true); toast.success("Opening WhatsApp to send a reminder");
  }

  // ── Post-draw: both roles see their match card + trust messaging ──
  if (drawn) return (
    <div className="space-y-5">
      <div className="rounded-2xl p-8 text-center" style={{ background:"var(--cmb-primary)", boxShadow:"var(--shadow-lg)" }}>
        <div className="text-4xl mb-3">🎁</div>
        <h2 className="font-bold text-xl mb-2" style={{ color:"var(--cmb-text-inverse)", fontFamily:"var(--font-fraunces)" }}>Names have been drawn</h2>
        <p className="text-sm mb-5" style={{ color:"rgba(255,248,240,0.75)" }}>
          {myDraw ? "Your match is ready and waiting." : "You joined after the draw — ask your organiser about a redraw."}
        </p>
        {myDraw && (
          <Link href={`/g/${group.id}/reveal`}>
            <Button size="lg" className="h-12 px-8 rounded-xl font-semibold" style={{ background:"var(--cmb-accent)", color:"#fff" }}>
              See who you&apos;re buying for <ArrowRight size={18} strokeWidth={1.5} className="ml-2"/>
            </Button>
          </Link>
        )}
      </div>

      <div className="rounded-2xl p-5 space-y-3" style={{ background:"var(--cmb-surface)", border:"1px solid var(--cmb-border)", boxShadow:"var(--shadow-sm)" }}>
        {[
          { icon:CheckCircle2, text:`All ${joined} people matched successfully` },
          { icon:Lock,         text:"Your match is private. Nobody can see who picked who." },
          { icon:Lock,         text:"The organiser cannot see individual matches." },
        ].map(({ icon:Icon, text }) => (
          <div key={text} className="flex items-center gap-2.5 text-sm">
            <Icon size={16} strokeWidth={2} style={{ color:"var(--cmb-success)", flexShrink:0 }}/>
            <span style={{ color:"var(--cmb-text-secondary)" }}>{text}</span>
          </div>
        ))}
      </div>

      {isOrganiser && giftsBought && giftsBought.total > 0 && (
        <div className="rounded-2xl p-5" style={{ background:"var(--cmb-surface)", border:"1px solid var(--cmb-border)", boxShadow:"var(--shadow-sm)" }}>
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold text-sm">Gifts bought</h2>
            <span className="text-sm font-medium" style={{ color:"var(--cmb-primary)" }}>{giftsBought.bought} of {giftsBought.total}</span>
          </div>
          <Progress value={Math.round((giftsBought.bought/giftsBought.total)*100)} className="h-2 mb-2"/>
          <p className="text-xs" style={{ color:"var(--cmb-text-muted)" }}>Only visible to you. Individual names are private.</p>
        </div>
      )}
    </div>
  );

  // ── Pre-draw, non-organiser ──
  if (!isOrganiser) return (
    <div className="space-y-5">
      <div className="rounded-2xl p-8 text-center" style={{ background:"var(--cmb-surface)", border:"1px solid var(--cmb-border)", boxShadow:"var(--shadow-sm)" }}>
        <Dice5 size={36} strokeWidth={1.5} className="mx-auto mb-3" style={{ color:"var(--cmb-primary)" }}/>
        <h2 className="font-semibold text-lg mb-2" style={{ fontFamily:"var(--font-fraunces)" }}>Waiting for the draw</h2>
        <p style={{ color:"var(--cmb-text-secondary)" }}>{organiserName} will draw names when everyone&apos;s ready.</p>
      </div>
      <div className="rounded-xl p-4 flex gap-3" style={{ background:"rgba(27,67,50,0.06)", border:"1px solid rgba(27,67,50,0.15)" }}>
        <Gift size={18} strokeWidth={1.5} style={{ color:"var(--cmb-primary)", flexShrink:0 }}/>
        <p className="text-sm" style={{ color:"var(--cmb-text-secondary)" }}>While you wait, add your wishlist so your Secret Santa knows what to get you.</p>
      </div>
    </div>
  );

  // ── Pre-draw, organiser ──
  return (
    <div className="space-y-5">
      {/* Progress */}
      <div className="rounded-2xl p-5" style={{ background:"var(--cmb-surface)", border:"1px solid var(--cmb-border)", boxShadow:"var(--shadow-sm)" }}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">Setup progress</h2>
          <span className="text-sm font-medium" style={{ color:"var(--cmb-primary)" }}>{progress}% done</span>
        </div>
        <Progress value={progress} className="mb-4 h-2"/>
        <div className="space-y-3">
          {[
            { label:"Group created",                              done:true },
            { label:`${joined} ${joined===1?"person has":"people have"} joined${joined<3?` — ${3-joined} more needed`:""}`, done:joined>=3 },
            { label:`${wishlists} of ${joined} wishlists added`,  done:joined>0 && wishlists===joined },
            { label:"Names drawn",                                done:false },
          ].map(({ label, done }) => (
            <div key={label} className="flex items-center gap-2.5 text-sm">
              {done ? <CheckCircle2 size={16} strokeWidth={2} style={{ color:"var(--cmb-success)", flexShrink:0 }}/> : <Circle size={16} strokeWidth={1.5} style={{ color:"var(--cmb-border-strong)", flexShrink:0 }}/>}
              <span style={{ color:done?"var(--cmb-text-primary)":"var(--cmb-text-secondary)" }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Members + remind */}
      <div className="rounded-2xl overflow-hidden" style={{ background:"var(--cmb-surface)", border:"1px solid var(--cmb-border)", boxShadow:"var(--shadow-sm)" }}>
        <div className="px-5 py-3 border-b flex items-center justify-between" style={{ borderColor:"var(--cmb-border)" }}>
          <h2 className="font-semibold text-sm">Members</h2>
          <div className="flex items-center gap-2">
            <span className="text-xs" style={{ color:"var(--cmb-text-muted)" }}>{joined} joined</span>
            <Button size="sm" variant="outline" onClick={sendReminder} className="h-7 px-2.5 text-xs rounded-lg gap-1"
              style={{ borderColor:"#25D366", color:"#25D366" }} aria-label="Send reminder via WhatsApp">
              <Share2 size={12} strokeWidth={1.5}/> {reminderSent?"Sent":"Remind"}
            </Button>
          </div>
        </div>
        {members.map(m => (
          <div key={m.id} className="px-5 py-3 flex items-center gap-3 border-b last:border-0" style={{ borderColor:"var(--cmb-border)" }}>
            <Avatar name={m.name} size={32}/>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{m.name}{m.user_id===me?" (you)":""}</p>
              <p className="text-xs" style={{ color:"var(--cmb-text-muted)" }}>{m.role}</p>
            </div>
            <div className="flex gap-1.5 flex-wrap justify-end">
              <Badge variant="outline" className="text-xs rounded-full" style={{ borderColor:"var(--cmb-success)", color:"var(--cmb-success)" }}>Joined</Badge>
              {usersWithWishes.has(m.user_id) && <Badge variant="outline" className="text-xs rounded-full" style={{ borderColor:"var(--cmb-gold-strong)", color:"var(--cmb-gold-strong)" }}>Wishlist</Badge>}
            </div>
          </div>
        ))}
      </div>

      {/* Exclusions */}
      <ExclusionsEditor data={data} open={showExclusions} setOpen={setShowExclusions} refresh={refresh}/>

      {/* Draw button */}
      {showConfirm ? (
        <div className="rounded-2xl p-5" style={{ background:"rgba(193,18,31,0.06)", border:"1px solid rgba(193,18,31,0.2)" }}>
          <div className="flex gap-2 mb-3">
            <AlertTriangle size={18} strokeWidth={1.5} style={{ color:"var(--cmb-error)", flexShrink:0 }}/>
            <p className="text-sm font-medium" style={{ color:"var(--cmb-error)" }}>Once names are drawn, this can&apos;t be undone. Make sure everyone has joined first.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1 rounded-xl" disabled={drawBusy} onClick={()=>setShowConfirm(false)}>Cancel</Button>
            <Button className="flex-1 rounded-xl font-semibold" disabled={drawBusy} onClick={handleDraw} style={{ background:"var(--cmb-accent)", color:"#fff" }}>
              {drawBusy?"Drawing…":"Yes, draw names"}
            </Button>
          </div>
        </div>
      ) : (
        <Button size="lg" disabled={joined<3} onClick={handleDraw} className="w-full h-14 text-base rounded-xl font-semibold"
          style={{ background:joined>=3?"var(--cmb-primary)":undefined, color:joined>=3?"var(--cmb-text-inverse)":undefined }}>
          <Dice5 size={20} strokeWidth={1.5} className="mr-2"/>
          {joined<3?`Need ${3-joined} more member${3-joined===1?"":"s"} to draw`:"Draw names now"}
        </Button>
      )}
    </div>
  );
}

function ExclusionsEditor({ data, open, setOpen, refresh }: { data:DashData; open:boolean; setOpen:(f:(v:boolean)=>boolean)=>void; refresh:()=>Promise<void> }) {
  const { group, members, exclusions } = data;
  const [pendingA, setPendingA] = useState("");
  const [pendingB, setPendingB] = useState("");
  const nameOf = (uid:string) => members.find(m=>m.user_id===uid)?.name ?? "Unknown";

  async function addExclusion() {
    if (!pendingA || !pendingB) return;
    if (pendingA === pendingB) { toast.error("Pick two different people"); return; }
    const supabase = createClient();
    const { error } = await supabase.from("exclusions").insert({ group_id: group.id, user_a_id: pendingA, user_b_id: pendingB });
    if (error) { toast.error(error.message); return; }
    setPendingA(""); setPendingB("");
    await refresh();
  }
  async function removeExclusion(id:string) {
    const supabase = createClient();
    const { error } = await supabase.from("exclusions").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    await refresh();
  }

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background:"var(--cmb-surface)", border:"1px solid var(--cmb-border)", boxShadow:"var(--shadow-sm)" }}>
      <button className="w-full px-5 py-4 flex items-center justify-between text-left" onClick={() => setOpen(v=>!v)}>
        <div>
          <p className="font-semibold text-sm">Exclusion rules</p>
          <p className="text-xs mt-0.5" style={{ color:"var(--cmb-text-muted)" }}>
            {exclusions.length===0?"No exclusions set — couples, siblings, last year's match":`${exclusions.length} pair${exclusions.length===1?"":"s"} won't draw each other`}
          </p>
        </div>
        <span className="text-xs font-medium" style={{ color:"var(--cmb-primary)" }}>{open?"Done":"Edit"}</span>
      </button>
      {open && (
        <div className="px-5 pb-5 border-t space-y-3 pt-4" style={{ borderColor:"var(--cmb-border)" }}>
          <p className="text-xs" style={{ color:"var(--cmb-text-muted)" }}>These people won&apos;t draw each other (works both ways).</p>
          {exclusions.map(exc => (
            <div key={exc.id} className="flex items-center gap-2 text-sm">
              <span className="flex-1 truncate">{nameOf(exc.user_a_id)}</span>
              <span className="text-xs font-medium" style={{ color:"var(--cmb-text-muted)" }}>↔</span>
              <span className="flex-1 truncate">{nameOf(exc.user_b_id)}</span>
              <button onClick={() => removeExclusion(exc.id)} className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background:"var(--cmb-surface-hover)" }} aria-label="Remove exclusion">
                <X size={14} strokeWidth={2} style={{ color:"var(--cmb-text-muted)" }}/>
              </button>
            </div>
          ))}
          <div className="flex items-center gap-2">
            <select value={pendingA} onChange={e => setPendingA(e.target.value)}
              className="flex-1 h-10 rounded-xl border px-3 text-sm bg-white" style={{ borderColor:"var(--cmb-border-strong)" }} aria-label="First person">
              <option value="">Select person</option>
              {members.map(m=><option key={m.user_id} value={m.user_id}>{m.name}</option>)}
            </select>
            <span className="text-xs font-medium" style={{ color:"var(--cmb-text-muted)" }}>↔</span>
            <select value={pendingB} onChange={e => setPendingB(e.target.value)}
              className="flex-1 h-10 rounded-xl border px-3 text-sm bg-white" style={{ borderColor:"var(--cmb-border-strong)" }} aria-label="Second person">
              <option value="">Select person</option>
              {members.map(m=><option key={m.user_id} value={m.user_id}>{m.name}</option>)}
            </select>
          </div>
          <Button variant="outline" size="sm" onClick={addExclusion} disabled={!pendingA||!pendingB} className="rounded-xl text-xs h-9" style={{ borderColor:"var(--cmb-border-strong)" }}>
            <Plus size={14} strokeWidth={1.5} className="mr-1"/> Add exclusion
          </Button>
        </div>
      )}
    </div>
  );
}

// ─── Wishlists Tab ───────────────────────────────────────────────────────────
function WishlistsTab({ data, refresh }: { data:DashData; refresh:()=>Promise<void> }) {
  const { me, members, wishes, claims } = data;
  const [activeUser,  setActiveUser]  = useState(me);
  const [newItem,     setNewItem]     = useState("");
  const [busy,        setBusy]        = useState(false);
  const [editingMeta, setEditingMeta] = useState(false);
  const myMember = members.find(m=>m.user_id===me);
  const [pleaseAvoid, setPleaseAvoid] = useState(myMember?.dislikes ?? "");
  const [mySizes,     setMySizes]     = useState(myMember?.sizes ?? "");

  const isMyList = activeUser === me;
  const items    = wishes.filter(w=>w.user_id===activeUser);
  const activeMember = members.find(m=>m.user_id===activeUser);
  const claimsByItem = useMemo(() => new Map(claims.map(c=>[c.wishlist_item_id, c])), [claims]);
  const priorityLabel: Record<string,string> = { love:"Would love", like:"Would like", inspiration:"Just inspiration" };
  const priorityColor: Record<string,string> = { love:"var(--cmb-accent)", like:"var(--cmb-primary)", inspiration:"var(--cmb-text-muted)" };

  async function toggleBought(itemId:string) {
    const supabase = createClient();
    const existing = claimsByItem.get(itemId);
    if (existing) {
      if (existing.claimed_by !== me) { toast.info("Someone else is getting this one"); return; }
      const { error } = await supabase.from("wishlist_claims").delete().eq("id", existing.id);
      if (error) { toast.error(error.message); return; }
      toast.success("Unmarked");
    } else {
      const { error } = await supabase.from("wishlist_claims").insert({ wishlist_item_id: itemId, claimed_by: me });
      if (error) { toast.error(error.message); return; }
      toast.success("Marked as yours to buy — the owner can't see this");
    }
    await refresh();
  }

  async function addItem() {
    const title = newItem.trim();
    if (!title || busy) return;
    setBusy(true);
    const supabase = createClient();
    const isUrl = /^https?:\/\//i.test(title);
    const { error } = await supabase.from("wishlist_items").insert({
      user_id: me, group_id: data.group.id,
      title: isUrl ? title.replace(/^https?:\/\/(www\.)?/i,"").split(/[/?#]/)[0] : title,
      url: isUrl ? title : null,
    });
    if (error) toast.error(error.message);
    else { toast.success("Item added"); setNewItem(""); await refresh(); }
    setBusy(false);
  }

  async function deleteItem(id:string) {
    const supabase = createClient();
    const { error } = await supabase.from("wishlist_items").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    await refresh();
  }

  async function saveMeta() {
    const supabase = createClient();
    const { error } = await supabase.from("group_members")
      .update({ dislikes: pleaseAvoid.trim() || null, sizes: mySizes.trim() || null })
      .eq("group_id", data.group.id).eq("user_id", me);
    if (error) { toast.error(error.message); return; }
    setEditingMeta(false); toast.success("Saved");
    await refresh();
  }

  return (
    <div className="space-y-5">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {[...members].sort((a,b)=>(a.user_id===me?-1:0)-(b.user_id===me?-1:0)).map(m => (
          <button key={m.user_id} onClick={() => setActiveUser(m.user_id)}
            className={cn("flex-shrink-0 flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium border-2 transition-all duration-150",
              activeUser===m.user_id?"border-[var(--cmb-primary)] bg-[var(--cmb-primary)] text-[var(--cmb-text-inverse)]":"border-[var(--cmb-border)] bg-[var(--cmb-surface)]")}>
            <Avatar name={m.name} size={20}/>{m.user_id===me?"Mine":m.name.split(" ")[0]}
          </button>
        ))}
      </div>
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-lg" style={{ fontFamily:"var(--font-fraunces)" }}>
          {isMyList?"Your wishlist":`${activeMember?.name.split(" ")[0] ?? "Their"}'s wishlist`}
        </h2>
        {isMyList && <Badge className="text-xs" style={{ background:"rgba(27,67,50,0.1)", color:"var(--cmb-primary)" }}>{items.length} item{items.length===1?"":"s"}</Badge>}
      </div>
      {items.length===0 ? (
        <EmptyState title="No wishlist items yet"
          body={isMyList?"Add gift ideas from any shop — Etsy, John Lewis, Amazon, anywhere.":"They haven't added anything yet — try asking them a question in Messages after the draw."}
          icon={Gift}/>
      ) : (
        <div className="space-y-3">
          {items.map(item => {
            const claim = claimsByItem.get(item.id);
            const claimedByMe = claim?.claimed_by === me;
            return (
              <div key={item.id} className="rounded-2xl p-4" style={{ background:"var(--cmb-surface)", border:"1px solid var(--cmb-border)", boxShadow:"var(--shadow-sm)", opacity:!isMyList&&claim?0.6:1 }}>
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="rounded-full px-2 py-0.5 text-xs font-medium"
                        style={{ background:`color-mix(in srgb, ${priorityColor[item.priority]} 12%, transparent)`, color:priorityColor[item.priority] }}>
                        {priorityLabel[item.priority]}
                      </span>
                      {item.shop_name && <span className="text-xs" style={{ color:"var(--cmb-text-muted)" }}>{item.shop_name}</span>}
                    </div>
                    <p className={cn("font-medium", !isMyList&&claim&&"line-through")}>{item.title}</p>
                    {item.price != null && <p className="text-sm mt-0.5" style={{ color:"var(--cmb-text-secondary)" }}>~{formatBudget(item.price)}</p>}
                    {item.notes && <p className="text-xs mt-1" style={{ color:"var(--cmb-text-muted)" }}>{item.notes}</p>}
                  </div>
                  <div className="flex gap-1.5 flex-shrink-0">
                    {item.url && <a href={item.url} target="_blank" rel="noopener noreferrer"><Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-lg" aria-label="View product"><ExternalLink size={16} strokeWidth={1.5}/></Button></a>}
                    {!isMyList && (
                      <Button variant={claim?"default":"outline"} size="sm" onClick={()=>toggleBought(item.id)}
                        className="h-9 rounded-lg text-xs px-3" style={claim?{background:"var(--cmb-success)",color:"#fff"}:{}}>
                        {claim?<><CheckCircle2 size={13} strokeWidth={2} className="mr-1"/>{claimedByMe?"Got it":"Taken"}</>:"I'm getting this"}
                      </Button>
                    )}
                    {isMyList && (
                      <Button variant="ghost" size="sm" onClick={()=>deleteItem(item.id)} className="h-9 w-9 p-0 rounded-lg" aria-label="Delete item">
                        <Trash2 size={16} strokeWidth={1.5} style={{ color:"var(--cmb-text-muted)" }}/>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {isMyList && (
        <>
          <div className="rounded-2xl p-4" style={{ background:"var(--cmb-surface)", border:"1px solid var(--cmb-border)", boxShadow:"var(--shadow-sm)" }}>
            <Label htmlFor="new-wish" className="text-sm font-medium mb-2 block">Add a wish</Label>
            <div className="flex gap-2">
              <Input id="new-wish" placeholder="e.g. Heated blanket, or paste a link..." value={newItem}
                onChange={e=>setNewItem(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addItem()}
                className="h-11 text-base rounded-xl flex-1" style={{ borderColor:"var(--cmb-border-strong)" }}/>
              <Button className="h-11 w-11 p-0 rounded-xl flex-shrink-0" style={{ background:"var(--cmb-primary)", color:"var(--cmb-text-inverse)" }}
                aria-label="Add item" disabled={busy||!newItem.trim()} onClick={addItem}>
                <Plus size={18} strokeWidth={2}/>
              </Button>
            </div>
            <p className="text-xs mt-2" style={{ color:"var(--cmb-text-muted)" }}>Add links from any shop — Etsy, John Lewis, Amazon, anywhere</p>
          </div>
          <div className="rounded-2xl overflow-hidden" style={{ background:"var(--cmb-surface)", border:"1px solid var(--cmb-border)", boxShadow:"var(--shadow-sm)" }}>
            <button className="w-full px-5 py-4 flex items-center justify-between text-left" onClick={()=>setEditingMeta(v=>!v)}>
              <div>
                <p className="font-semibold text-sm">Please avoid &amp; my sizes</p>
                <p className="text-xs mt-0.5" style={{ color:"var(--cmb-text-muted)" }}>Allergies, dislikes, clothing sizes — visible to your Secret Santa</p>
              </div>
              <span className="text-xs font-medium" style={{ color:"var(--cmb-primary)" }}>{editingMeta?"Close":"Edit"}</span>
            </button>
            {editingMeta && (
              <div className="px-5 pb-5 border-t space-y-4 pt-4" style={{ borderColor:"var(--cmb-border)" }}>
                <div>
                  <Label className="text-sm font-medium mb-1.5 block">Please avoid</Label>
                  <Textarea placeholder="Allergies, things you hate, stuff you have plenty of..." value={pleaseAvoid}
                    onChange={e=>setPleaseAvoid(e.target.value)} className="min-h-[72px] rounded-xl text-sm resize-none" style={{ borderColor:"var(--cmb-border-strong)" }}/>
                </div>
                <div>
                  <Label className="text-sm font-medium mb-1.5 block">My sizes</Label>
                  <Input placeholder="e.g. Top: M, Shoe: UK 7, Ring: O" value={mySizes} onChange={e=>setMySizes(e.target.value)}
                    className="h-10 rounded-xl text-sm" style={{ borderColor:"var(--cmb-border-strong)" }}/>
                </div>
                <Button size="sm" onClick={saveMeta} className="rounded-xl" style={{ background:"var(--cmb-primary)", color:"var(--cmb-text-inverse)" }}>Save</Button>
              </div>
            )}
          </div>
        </>
      )}
      {!isMyList && activeMember && (activeMember.dislikes || activeMember.sizes || activeMember.likes) && (
        <div className="rounded-2xl p-4 space-y-3" style={{ background:"var(--cmb-surface)", border:"1px solid var(--cmb-border)" }}>
          {activeMember.likes    && <div><p className="text-xs font-semibold uppercase mb-1" style={{ color:"var(--cmb-text-muted)" }}>Likes</p><p className="text-sm">{activeMember.likes}</p></div>}
          {activeMember.dislikes && <div><p className="text-xs font-semibold uppercase mb-1" style={{ color:"var(--cmb-text-muted)" }}>Please avoid</p><p className="text-sm">{activeMember.dislikes}</p></div>}
          {activeMember.sizes    && <div><p className="text-xs font-semibold uppercase mb-1" style={{ color:"var(--cmb-text-muted)" }}>Sizes</p><p className="text-sm">{activeMember.sizes}</p></div>}
        </div>
      )}
    </div>
  );
}

// ─── Messages Tab ────────────────────────────────────────────────────────────
const SUGGESTED_QUESTIONS = [
  "Do you prefer tea, coffee, or hot chocolate?",
  "Any allergies I should know about?",
  "Funny gifts or practical gifts?",
  "What colours do you usually like?",
  "Would you rather have snacks, desk items, or something cosy?",
];

function MessagesTab({ data, refresh }: { data:DashData; refresh:()=>Promise<void> }) {
  const { me, group, members, messages, myDraw } = data;
  const [thread, setThread] = useState<"recipient"|"santa">("recipient");
  const [draft,  setDraft]  = useState("");
  const [busy,   setBusy]   = useState(false);

  const isPostDraw = group.draw_status !== "pending";

  // Direction: recipient_id === me → received; anything else visible is mine.
  // Received messages that reply to one of my sent messages belong to the
  // conversation with MY recipient; other received messages are from MY santa.
  const { recipientThread, santaThread, lastSantaMsgId } = useMemo(() => {
    const sent     = messages.filter(m => m.recipient_id !== me);
    const received = messages.filter(m => m.recipient_id === me);
    const mySentToRecipient = sent.filter(m => myDraw && m.recipient_id === myDraw.recipient_id);
    const mySentIds = new Set(mySentToRecipient.map(m => m.id));
    const repliesToMe = received.filter(m => m.parent_message_id && mySentIds.has(m.parent_message_id));
    const fromSanta   = received.filter(m => !(m.parent_message_id && mySentIds.has(m.parent_message_id)));
    const santaIds    = new Set(fromSanta.map(m => m.id));
    const myReplies   = sent.filter(m => m.parent_message_id && santaIds.has(m.parent_message_id));
    const sortByTime  = (a:MsgRow,b:MsgRow) => a.created_at.localeCompare(b.created_at);
    return {
      recipientThread: [...mySentToRecipient, ...repliesToMe].sort(sortByTime),
      santaThread:     [...fromSanta, ...myReplies].sort(sortByTime),
      lastSantaMsgId:  fromSanta.length ? fromSanta[fromSanta.length-1].id : null,
    };
  }, [messages, me, myDraw]);

  if (!isPostDraw) return (
    <EmptyState title="Messages open after the draw"
      body="Anonymous messaging opens after names are drawn. In the meantime, add your wishlist so your Secret Santa knows what to get you."
      icon={Lock}/>
  );

  const recipientName = myDraw ? members.find(m=>m.user_id===myDraw.recipient_id)?.name.split(" ")[0] ?? "your match" : null;
  const activeMessages = thread==="recipient" ? recipientThread : santaThread;
  const canSend = thread==="recipient" ? !!myDraw : !!lastSantaMsgId;

  async function sendMessage(content:string) {
    const text = content.trim();
    if (!text || busy || !canSend) return;
    setBusy(true);
    const supabase = createClient();
    let error;
    if (thread === "recipient" && myDraw) {
      ({ error } = await supabase.from("anon_messages").insert({
        group_id: group.id, sender_id: me, recipient_id: myDraw.recipient_id, content: text,
      }));
    } else {
      ({ error } = await supabase.rpc("reply_to_anon_message", { p_parent_id: lastSantaMsgId, p_content: text }));
    }
    if (error) toast.error(error.message);
    else { setDraft(""); await refresh(); }
    setBusy(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {([
          { key:"recipient", label:recipientName?`To ${recipientName} 🎁`:"To your match 🎁" },
          { key:"santa",     label:"Your Secret Santa 🤫" },
        ] as const).map(({ key, label }) => (
          <button key={key} onClick={()=>setThread(key)}
            className={cn("flex-1 rounded-full px-3 py-2 text-sm font-medium border-2 transition-all duration-150",
              thread===key?"border-[var(--cmb-primary)] bg-[var(--cmb-primary)] text-[var(--cmb-text-inverse)]":"border-[var(--cmb-border)] bg-[var(--cmb-surface)]")}>
            {label}
          </button>
        ))}
      </div>

      <div className="rounded-xl p-3 flex gap-2" style={{ background:"rgba(27,67,50,0.06)", border:"1px solid rgba(27,67,50,0.15)" }}>
        <Lock size={14} strokeWidth={1.5} style={{ color:"var(--cmb-primary)", flexShrink:0, marginTop:2 }}/>
        <p className="text-xs" style={{ color:"var(--cmb-text-secondary)" }}>
          {thread==="recipient"
            ? <>You&apos;re anonymous here — {recipientName ?? "they"} will only see &ldquo;Your Secret Santa 🤫&rdquo;</>
            : <>Questions from the person buying for you. They can&apos;t see who you are either.</>}
        </p>
      </div>

      {activeMessages.length===0 ? (
        <EmptyState title={thread==="recipient"?"Break the ice":"Nothing yet"}
          body={thread==="recipient"
            ? "Ask an anonymous question so you can buy something they'll actually love."
            : "When your Secret Santa asks you something, it'll show up here."}
          icon={MessageCircle}/>
      ) : (
        <div className="space-y-3">
          {activeMessages.map(msg => {
            const isMe = msg.recipient_id !== me;
            return (
              <div key={msg.id} className={cn("flex", isMe?"justify-end":"justify-start")}>
                <div className="rounded-2xl px-4 py-3 max-w-[80%]"
                  style={{ background:isMe?"var(--cmb-primary)":"var(--cmb-surface)", color:isMe?"var(--cmb-text-inverse)":"var(--cmb-text-primary)", border:isMe?"none":"1px solid var(--cmb-border)" }}>
                  {!isMe && <p className="text-xs font-medium mb-1" style={{ color:"var(--cmb-primary)" }}>
                    {thread==="santa"?"Your Secret Santa 🤫":`${recipientName ?? "Them"}`}
                  </p>}
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                  <p className="text-xs mt-1" style={{ color:isMe?"rgba(255,248,240,0.55)":"var(--cmb-text-muted)" }}>{timeAgo(msg.created_at)}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {thread==="recipient" && (
        <div>
          <p className="text-xs font-medium mb-2" style={{ color:"var(--cmb-text-muted)" }}>SUGGESTED QUESTIONS</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_QUESTIONS.map(q => (
              <button key={q} onClick={()=>sendMessage(q)} className="rounded-full px-3 py-1.5 text-xs border transition-colors duration-150 text-left"
                style={{ background:"var(--cmb-surface)", borderColor:"var(--cmb-border)", color:"var(--cmb-text-secondary)" }}>{q}</button>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <Input placeholder={canSend?(thread==="recipient"?"Ask a question...":"Reply to your Secret Santa..."):"You can reply once they message you"}
          value={draft} onChange={e=>setDraft(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendMessage(draft)} disabled={!canSend||busy}
          maxLength={500} className="h-11 text-base rounded-xl flex-1" style={{ borderColor:"var(--cmb-border-strong)" }}/>
        <Button onClick={()=>sendMessage(draft)} disabled={!draft.trim()||!canSend||busy} className="h-11 w-11 p-0 rounded-xl flex-shrink-0"
          style={{ background:"var(--cmb-primary)", color:"var(--cmb-text-inverse)" }} aria-label="Send message">
          <Send size={16} strokeWidth={1.5}/>
        </Button>
      </div>
      <p className="text-xs" style={{ color:"var(--cmb-text-muted)" }}>{draft.length}/500 · 10 messages per day</p>
    </div>
  );
}

// ─── Games Tab — Gift Predictions ────────────────────────────────────────────
function GamesTab({ data, refresh }: { data:DashData; refresh:()=>Promise<void> }) {
  const { me, group, members, round, predictions, actuals } = data;
  const [step,  setStep]  = useState(0);
  const [picks, setPicks] = useState<Record<string,GiftCategory>>({});
  const [busy,  setBusy]  = useState(false);
  const [predicting, setPredicting] = useState(false);
  const [showLog, setShowLog] = useState(false);

  const isOrganiser = group.organiser_id === me;
  const subjects = members.filter(m=>m.user_id!==me);
  const current  = subjects[step];
  const myPreds  = predictions.filter(p=>p.predictor_id===me);
  const hasSubmitted = myPreds.length > 0;
  const catOf = (key:GiftCategory) => GIFT_CATEGORIES.find(c=>c.key===key);
  const myActual = actuals.find(a=>a.recipient_id===me);

  if (group.draw_status === "pending") return (
    <EmptyState title="Games unlock after the draw" body="Hang tight — Gift Predictions opens once names have been drawn." icon={Gamepad2}/>
  );

  async function startRound() {
    if (busy) return;
    setBusy(true);
    const supabase = createClient();
    const { error } = await supabase.from("prediction_rounds").insert({ group_id: group.id });
    if (error && !error.message.includes("duplicate")) toast.error(error.message);
    await refresh();
    setBusy(false);
  }

  async function submitPredictions() {
    if (busy || !round) return;
    setBusy(true);
    const supabase = createClient();
    const rows = subjects.filter(s=>picks[s.user_id]).map(s => ({
      round_id: round.id, predictor_id: me, subject_id: s.user_id, predicted_category: picks[s.user_id],
    }));
    const { error } = await supabase.from("predictions").insert(rows);
    if (error) toast.error(error.message);
    else { toast.success("Predictions locked in!"); setPredicting(false); }
    await refresh();
    setBusy(false);
  }

  async function revealResults() {
    if (busy || !round) return;
    setBusy(true);
    const supabase = createClient();
    const { error } = await supabase.from("prediction_rounds").update({ status: "revealed", closed_at: new Date().toISOString() }).eq("id", round.id);
    if (error) toast.error(error.message);
    await refresh();
    setBusy(false);
  }

  async function logActual(key:GiftCategory) {
    if (busy || !round) return;
    setBusy(true);
    const supabase = createClient();
    const { error } = await supabase.from("actual_gifts").insert({ round_id: round.id, recipient_id: me, actual_category: key, logged_by: me });
    if (error) toast.error(error.message);
    await refresh();
    setBusy(false);
  }

  /* ── No round yet / intro ── */
  if (!round) return (
    <div className="space-y-5">
      <div className="rounded-2xl overflow-hidden" style={{ background:"var(--cmb-surface)", border:"1px solid var(--cmb-border)", boxShadow:"var(--shadow-md)" }}>
        <div className="px-5 py-4 border-b" style={{ background:"var(--cmb-primary)", borderColor:"var(--cmb-primary-dark)" }}>
          <div className="flex items-center gap-2">
            <Gamepad2 size={18} strokeWidth={1.5} style={{ color:"var(--cmb-warm)" }}/>
            <h2 className="font-semibold" style={{ color:"var(--cmb-text-inverse)", fontFamily:"var(--font-fraunces)" }}>Gift Predictions</h2>
          </div>
        </div>
        <div className="p-5 space-y-4">
          <p className="text-sm leading-relaxed" style={{ color:"var(--cmb-text-secondary)" }}>
            Think you know your group? Predict what type of Secret Santa gift everyone will get — then earn Stereotype Awards based on what the group said.
          </p>
          <div className="grid grid-cols-3 gap-2">
            {GIFT_CATEGORIES.slice(0,6).map(c => (
              <div key={c.key} className="rounded-xl p-2.5 text-center" style={{ background:"var(--cmb-bg)", border:"1px solid var(--cmb-border)" }}>
                <div className="text-xl mb-1">{c.emoji}</div>
                <p className="text-xs font-medium leading-tight">{c.label}</p>
              </div>
            ))}
          </div>
          {isOrganiser ? (
            <>
              <Button onClick={startRound} disabled={busy} size="lg" className="w-full h-12 rounded-xl font-semibold"
                style={{ background:"var(--cmb-primary)", color:"var(--cmb-text-inverse)" }}>
                {busy?"Starting…":<>Start the game <ArrowRight size={18} strokeWidth={1.5} className="ml-2"/></>}
              </Button>
              <p className="text-xs text-center" style={{ color:"var(--cmb-text-muted)" }}>
                Everyone predicts for {subjects.length} people — takes about 2 minutes
              </p>
            </>
          ) : (
            <p className="text-sm text-center" style={{ color:"var(--cmb-text-muted)" }}>
              Waiting for the organiser to start the game.
            </p>
          )}
        </div>
      </div>
    </div>
  );

  /* ── Round revealed: results ── */
  if (round.status === "revealed") {
    const bySubject = subjects.map(s => {
      const votes = predictions.filter(p=>p.subject_id===s.user_id);
      const dist: Partial<Record<GiftCategory, number>> = {};
      votes.forEach(v => { dist[v.predicted_category] = (dist[v.predicted_category] ?? 0) + 1; });
      const sorted = (Object.entries(dist) as [GiftCategory,number][]).sort(([,a],[,b])=>b-a);
      return { member:s, votes:votes.length, dist:sorted, top:sorted[0] ?? null };
    }).filter(r=>r.votes>0);

    // Stereotype awards, per the game brief's generation logic
    const awards: { emoji:string; title:string; winner:string; detail:string }[] = [];
    bySubject.forEach(r => {
      if (r.top && r.votes>=2 && r.top[1]===r.votes) {
        awards.push({ emoji:"🔮", title:"The Predictable One", winner:r.member.name, detail:`Unanimous — everyone said ${catOf(r.top[0])?.label.toLowerCase()}` });
      }
    });
    const wildcard = [...bySubject].filter(r=>r.votes>=3).sort((a,b)=>b.dist.length-a.dist.length)[0];
    if (wildcard && wildcard.dist.length>=3) {
      awards.push({ emoji:"🎭", title:"The Wildcard", winner:wildcard.member.name, detail:`Votes spread across ${wildcard.dist.length} different categories` });
    }
    bySubject.forEach(r => {
      if (r.top && r.top[1]/r.votes>=0.5 && r.top[1]<r.votes && awards.length<5) {
        awards.push({ emoji:catOf(r.top[0])?.emoji ?? "🎁", title:`Most Likely to Get ${catOf(r.top[0])?.label}`, winner:r.member.name, detail:`${r.top[1]} of ${r.votes} predicted it` });
      }
    });

    const correctForMe = myActual ? predictions.filter(p=>p.subject_id===me && p.predicted_category===myActual.actual_category).length : 0;
    const votesForMe   = predictions.filter(p=>p.subject_id===me).length;

    return (
      <div className="space-y-5">
        <div className="text-center mb-2">
          <p className="text-sm font-medium" style={{ color:"var(--cmb-accent)" }}>Gift Prediction Results</p>
          <h2 className="text-2xl font-bold" style={{ fontFamily:"var(--font-fraunces)" }}>The group has spoken</h2>
        </div>

        {bySubject.map(r => (
          <div key={r.member.user_id} className="rounded-2xl p-5" style={{ background:"var(--cmb-surface)", border:"1px solid var(--cmb-border)", boxShadow:"var(--shadow-sm)" }}>
            <div className="flex items-center gap-3 mb-3">
              <Avatar name={r.member.name} size={36}/>
              <div>
                <p className="font-semibold">{r.member.name}</p>
                {r.top && <p className="text-xs" style={{ color:"var(--cmb-text-muted)" }}>
                  The group predicted: <strong>{catOf(r.top[0])?.emoji} {catOf(r.top[0])?.label}</strong> ({r.top[1]}/{r.votes} votes)
                </p>}
              </div>
            </div>
            <div className="space-y-1.5">
              {r.dist.map(([key,votes]) => {
                const cat = catOf(key);
                if (!cat) return null;
                return (
                  <div key={key} className="flex items-center gap-2 text-xs">
                    <span className="w-24 flex-shrink-0 truncate" style={{ color:"var(--cmb-text-secondary)" }}>{cat.emoji} {cat.label}</span>
                    <div className="flex-1 rounded-full overflow-hidden h-2" style={{ background:"var(--cmb-border)" }}>
                      <div className="h-full rounded-full transition-all duration-500"
                        style={{ width:`${(votes/r.votes)*100}%`, background:r.top&&key===r.top[0]?"var(--cmb-primary)":"var(--cmb-warm)" }}/>
                    </div>
                    <span className="w-4 text-right font-medium" style={{ color:"var(--cmb-text-muted)" }}>{votes}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {awards.length>0 && (
          <div className="rounded-2xl overflow-hidden" style={{ background:"var(--cmb-primary)", boxShadow:"var(--shadow-lg)" }}>
            <div className="px-5 py-4 border-b" style={{ borderColor:"var(--cmb-primary-dark)" }}>
              <div className="flex items-center gap-2">
                <Trophy size={18} strokeWidth={1.5} style={{ color:"var(--cmb-warm)" }}/>
                <h2 className="font-bold" style={{ color:"var(--cmb-text-inverse)", fontFamily:"var(--font-fraunces)" }}>🏆 Gift Prediction Awards</h2>
              </div>
            </div>
            <div className="p-5 space-y-4">
              {awards.map(award => (
                <div key={award.title+award.winner} className="flex items-start gap-3">
                  <span className="text-xl flex-shrink-0">{award.emoji}</span>
                  <div>
                    <p className="font-semibold text-sm" style={{ color:"var(--cmb-text-inverse)" }}>{award.title}</p>
                    <p className="text-sm" style={{ color:"var(--cmb-warm)" }}>{award.winner}</p>
                    <p className="text-xs mt-0.5" style={{ color:"rgba(255,248,240,0.6)" }}>{award.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Post-Christmas reveal */}
        <div className="rounded-2xl overflow-hidden" style={{ background:"var(--cmb-surface)", border:"1px solid var(--cmb-border)", boxShadow:"var(--shadow-sm)" }}>
          {myActual ? (
            <div className="p-5 text-center">
              <div className="text-3xl mb-2">{catOf(myActual.actual_category)?.emoji}</div>
              <p className="font-semibold mb-1">You received: {catOf(myActual.actual_category)?.label}</p>
              {votesForMe>0 && (
                <p className="text-sm" style={{ color:"var(--cmb-text-secondary)" }}>
                  🎯 <strong>{correctForMe} out of {votesForMe}</strong> {votesForMe===1?"person":"people"} predicted correctly!
                </p>
              )}
            </div>
          ) : !showLog ? (
            <div className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <Star size={16} strokeWidth={1.5} style={{ color:"var(--cmb-warm)" }}/>
                <p className="font-semibold text-sm">Log what you actually received</p>
              </div>
              <p className="text-sm mb-4" style={{ color:"var(--cmb-text-secondary)" }}>
                Gifts have been exchanged? Log yours to see who predicted correctly.
              </p>
              <Button variant="outline" onClick={()=>setShowLog(true)} className="w-full h-10 rounded-xl text-sm" style={{ borderColor:"var(--cmb-border-strong)" }}>
                Log my actual gift
              </Button>
            </div>
          ) : (
            <div className="p-5">
              <p className="font-semibold text-sm mb-3">What did you actually receive?</p>
              <div className="grid grid-cols-3 gap-2 mb-2">
                {GIFT_CATEGORIES.map(cat => (
                  <button key={cat.key} onClick={()=>logActual(cat.key)} disabled={busy}
                    className="rounded-xl p-2.5 text-center transition-all duration-150"
                    style={{ background:"var(--cmb-bg)", border:"1px solid var(--cmb-border)" }}>
                    <div className="text-xl mb-1">{cat.emoji}</div>
                    <p className="text-xs font-medium leading-tight">{cat.label}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ── Round open, predicting flow ── */
  if (predicting && current) return (
    <div className="space-y-5">
      <div className="flex items-center justify-center gap-2">
        {subjects.map((_,i) => (
          <div key={i} className="rounded-full transition-all duration-200"
            style={{ width: i===step?16:8, height:8, background:i<=step?"var(--cmb-primary)":"var(--cmb-border)" }}/>
        ))}
      </div>
      <div className="rounded-2xl p-6 text-center" style={{ background:"var(--cmb-surface)", border:"1px solid var(--cmb-border)", boxShadow:"var(--shadow-md)" }}>
        <p className="text-sm mb-1" style={{ color:"var(--cmb-text-muted)" }}>What will</p>
        <h2 className="text-2xl font-bold mb-1" style={{ fontFamily:"var(--font-fraunces)" }}>{current.name}</h2>
        <p className="text-sm" style={{ color:"var(--cmb-text-muted)" }}>get for Secret Santa?</p>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {GIFT_CATEGORIES.map(cat => {
          const selected = picks[current.user_id] === cat.key;
          return (
            <button key={cat.key} onClick={()=>setPicks(p=>({...p,[current.user_id]:cat.key}))}
              className="rounded-2xl p-3 text-center transition-all duration-150"
              style={{ background:selected?"var(--cmb-primary)":"var(--cmb-surface)", border:`2px solid ${selected?"var(--cmb-primary)":"var(--cmb-border)"}`,
                color:selected?"var(--cmb-text-inverse)":"var(--cmb-text-primary)", transform:selected?"scale(1.04)":"scale(1)" }}>
              <div className="text-2xl mb-1">{cat.emoji}</div>
              <p className="text-xs font-medium leading-tight">{cat.label}</p>
            </button>
          );
        })}
      </div>
      <div className="flex gap-3">
        {step>0 && <Button variant="outline" className="flex-1 h-12 rounded-xl" onClick={()=>setStep(s=>s-1)}>← Back</Button>}
        <Button className="flex-1 h-12 rounded-xl font-semibold" disabled={!picks[current.user_id]||busy}
          onClick={() => { if (step<subjects.length-1){setStep(s=>s+1);}else{submitPredictions();} }}
          style={{ background:"var(--cmb-primary)", color:"var(--cmb-text-inverse)" }}>
          {step<subjects.length-1?"Next →":busy?"Submitting…":"Lock in predictions"}
        </Button>
      </div>
    </div>
  );

  /* ── Round open: submitted or ready to predict ── */
  if (hasSubmitted) return (
    <div className="space-y-4">
      <div className="rounded-2xl p-6 text-center animate-scale-in" style={{ background:"var(--cmb-surface)", border:"1px solid var(--cmb-border)", boxShadow:"var(--shadow-md)" }}>
        <div className="text-4xl mb-3">🔒</div>
        <h2 className="text-xl font-bold mb-2" style={{ fontFamily:"var(--font-fraunces)" }}>Your predictions are locked in!</h2>
        <p className="text-sm" style={{ color:"var(--cmb-text-secondary)" }}>
          Results unlock when the organiser reveals them — predictions stay secret until then.
        </p>
      </div>
      <div className="rounded-2xl p-5 space-y-3" style={{ background:"var(--cmb-surface)", border:"1px solid var(--cmb-border)" }}>
        <h3 className="font-semibold text-sm">Your predictions</h3>
        {subjects.map(m => {
          const pred = myPreds.find(p=>p.subject_id===m.user_id);
          const cat = pred ? catOf(pred.predicted_category) : null;
          return (
            <div key={m.user_id} className="flex items-center justify-between">
              <span className="text-sm">{m.name}</span>
              <span className="text-sm font-medium">{cat?`${cat.emoji} ${cat.label}`:"—"}</span>
            </div>
          );
        })}
      </div>
      {isOrganiser && (
        <Button onClick={revealResults} disabled={busy} className="w-full h-11 rounded-xl text-sm font-semibold" style={{ background:"var(--cmb-primary)", color:"var(--cmb-text-inverse)" }}>
          {busy?"Revealing…":"Reveal results to the group"}
        </Button>
      )}
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="rounded-2xl overflow-hidden" style={{ background:"var(--cmb-surface)", border:"1px solid var(--cmb-border)", boxShadow:"var(--shadow-md)" }}>
        <div className="px-5 py-4 border-b" style={{ background:"var(--cmb-primary)", borderColor:"var(--cmb-primary-dark)" }}>
          <div className="flex items-center gap-2">
            <Gamepad2 size={18} strokeWidth={1.5} style={{ color:"var(--cmb-warm)" }}/>
            <h2 className="font-semibold" style={{ color:"var(--cmb-text-inverse)", fontFamily:"var(--font-fraunces)" }}>Gift Predictions</h2>
          </div>
        </div>
        <div className="p-5 space-y-4">
          <p className="text-sm leading-relaxed" style={{ color:"var(--cmb-text-secondary)" }}>
            The game is on! Predict what type of Secret Santa gift each person will get.
          </p>
          <Button onClick={()=>setPredicting(true)} size="lg" className="w-full h-12 rounded-xl font-semibold"
            style={{ background:"var(--cmb-primary)", color:"var(--cmb-text-inverse)" }}>
            Make my predictions <ArrowRight size={18} strokeWidth={1.5} className="ml-2"/>
          </Button>
          <p className="text-xs text-center" style={{ color:"var(--cmb-text-muted)" }}>
            Predict for {subjects.length} people — takes about 2 minutes
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Shared ───────────────────────────────────────────────────────────────────
function Avatar({ name, size=36 }: { name:string; size?:number }) {
  const hue = name.charCodeAt(0)*13%360;
  return (
    <div className="rounded-full flex items-center justify-center font-semibold flex-shrink-0" aria-hidden
      style={{ width:size, height:size, fontSize:size*0.38, background:`hsl(${hue},40%,88%)`, color:`hsl(${hue},40%,30%)` }}>
      {getInitials(name)}
    </div>
  );
}

function EmptyState({ title, body, icon:Icon }: { title:string; body:string; icon:React.ElementType }) {
  return (
    <div className="rounded-2xl p-10 text-center" style={{ background:"var(--cmb-surface)", border:"2px dashed var(--cmb-border)" }}>
      <Icon size={32} strokeWidth={1.5} className="mx-auto mb-3" style={{ color:"var(--cmb-text-muted)" }}/>
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-sm max-w-xs mx-auto" style={{ color:"var(--cmb-text-secondary)" }}>{body}</p>
    </div>
  );
}
