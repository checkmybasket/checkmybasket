"use client";
import { useState } from "react";
import { Dice5, Gift, MessageCircle, Gamepad2, Settings, Users, CheckCircle2, Circle, AlertTriangle, ExternalLink, Send, Plus, Trash2, Lock, ArrowRight, Share2, X, Trophy, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn, formatBudget, getInitials } from "@/lib/utils";
import Link from "next/link";
import { toast } from "sonner";

// ─── Mock data ───────────────────────────────────────────────────────────────
const MOCK_GROUP = { id:"demo-group-id", name:"Marketing Team Secret Santa", mode:"workplace", budget:1500, draw_status:"pending" as const, organiser_id:"user-1", invite_code:"abc12345" };
const MOCK_ME = { id:"user-1", name:"Priya Sharma", role:"organiser" as const };
const MOCK_MEMBERS = [
  { id:"user-1", name:"Priya Sharma",  role:"organiser", hasWishlist:true,  joined:true },
  { id:"user-2", name:"James O'Brien", role:"member",    hasWishlist:true,  joined:true },
  { id:"user-3", name:"Aisha Khan",    role:"member",    hasWishlist:false, joined:true },
  { id:"user-4", name:"Tom Fletcher",  role:"member",    hasWishlist:false, joined:true },
  { id:"user-5", name:"Sara Müller",   role:"member",    hasWishlist:true,  joined:true },
  { id:"user-6", name:"Luca Romano",   role:"member",    hasWishlist:false, joined:false },
];
const MOCK_WISHLISTS: Record<string,Array<{ id:string; title:string; url?:string; price?:number; priority:string; shop?:string }>> = {
  "user-1": [
    { id:"w1", title:"Jo Malone Lime Basil & Mandarin", url:"https://jomalone.co.uk", price:4500, priority:"love", shop:"Jo Malone" },
    { id:"w2", title:"Kindle Paperwhite",               url:"https://amazon.co.uk",   price:13999, priority:"like", shop:"Amazon" },
    { id:"w3", title:"Cosy socks — any festive pattern",                               priority:"inspiration" },
  ],
  "user-2": [
    { id:"w4", title:"Coffee subscription box", url:"https://example.com", price:1800, priority:"love", shop:"Onyx" },
    { id:"w5", title:"Moleskine notebook",                                              priority:"like" },
  ],
  "user-5": [
    { id:"w6", title:"Plant pot — terracotta",    priority:"like" },
    { id:"w7", title:"Bottle of prosecco",        price:1200, priority:"inspiration" },
  ],
};
const MOCK_MESSAGES = [
  { id:"m1", sender:"Your Secret Santa 🤫", content:"Do you prefer tea, coffee, or hot chocolate?", time:"2h ago", isMe:false },
  { id:"m2", sender:"You",                  content:"Definitely coffee — oat milk if possible!",     time:"1h ago", isMe:true },
  { id:"m3", sender:"Your Secret Santa 🤫", content:"Any colours you love or hate?",                time:"45m ago",isMe:false },
];

// ─── Gift Prediction categories ──────────────────────────────────────────────
const GIFT_CATEGORIES = [
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

// Mock results data
const MOCK_RESULTS = [
  { id:"user-2", name:"James O'Brien", topCat:{ key:"mug",emoji:"☕",label:"A Mug" }, topVotes:5, total:6, dist:{ mug:5, chocolate:1 } },
  { id:"user-3", name:"Aisha Khan",    topCat:{ key:"candle",emoji:"🕯️",label:"A Candle" }, topVotes:3, total:6, dist:{ candle:3, bath_body:2, cosy:1 } },
  { id:"user-4", name:"Tom Fletcher",  topCat:{ key:"chocolate",emoji:"🍫",label:"Chocolate & Snacks" }, topVotes:6, total:6, dist:{ chocolate:6 } },
  { id:"user-5", name:"Sara Müller",   topCat:{ key:"bath_body",emoji:"🧴",label:"Bath & Body" }, topVotes:4, total:6, dist:{ bath_body:4, candle:1, cosy:1 } },
  { id:"user-6", name:"Luca Romano",   topCat:{ key:"drinks",emoji:"🍷",label:"Drinks" }, topVotes:3, total:6, dist:{ drinks:3, useful:2, book:1 } },
];

const STEREOTYPE_AWARDS = [
  { emoji:"☕", title:"Most Likely to Get a Mug",  winner:"James O'Brien", detail:"5 out of 6 predicted it" },
  { emoji:"🔮", title:"The Predictable One",        winner:"Tom Fletcher",  detail:"Unanimous — everyone said chocolate" },
  { emoji:"🕯️", title:"Candle Magnet",              winner:"Aisha Khan",    detail:"Most candle predictions in the group" },
  { emoji:"🎭", title:"The Wildcard",               winner:"Luca Romano",   detail:"Votes spread across 4 different categories" },
];

type Tab = "draw"|"wishlists"|"messages"|"games";
type GameState = "pre_draw"|"ready"|"predicting"|"submitted"|"results";

// ─── Page ────────────────────────────────────────────────────────────────────
export default function GroupDashboard() {
  const [tab, setTab] = useState<Tab>("draw");
  const isOrganiser = MOCK_ME.role === "organiser";
  return (
    <div className="flex flex-col min-h-dvh" style={{ background:"var(--gc-bg)" }}>
      <header className="sticky top-0 z-30 border-b" style={{ borderColor:"var(--gc-border)", background:"rgba(255,248,240,0.95)", backdropFilter:"blur(12px)" }}>
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <Gift size={18} strokeWidth={1.5} style={{ color:"var(--gc-primary)", flexShrink:0 }}/>
            <span className="font-semibold truncate" style={{ fontFamily:"var(--font-fraunces)", color:"var(--gc-primary)" }}>{MOCK_GROUP.name}</span>
            <span className="rounded-full px-2 py-0.5 text-xs font-medium flex-shrink-0" style={{ background:"rgba(27,67,50,0.1)", color:"var(--gc-primary)" }}>
              {MOCK_MEMBERS.filter(m=>m.joined).length} members
            </span>
          </div>
          {isOrganiser && (
            <Link href={`/g/${MOCK_GROUP.id}/settings`}>
              <Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-lg" aria-label="Group settings"><Settings size={18} strokeWidth={1.5}/></Button>
            </Link>
          )}
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6 pb-28">
        {tab==="draw"      && <DrawTab isOrganiser={isOrganiser}/>}
        {tab==="wishlists" && <WishlistsTab/>}
        {tab==="messages"  && <MessagesTab/>}
        {tab==="games"     && <GamesTab/>}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-30 border-t tab-bar" style={{ background:"var(--gc-surface)", borderColor:"var(--gc-border)" }}>
        <div className="max-w-2xl mx-auto px-2 flex">
          {([
            { key:"draw",      icon:Dice5,         label:"Draw",      badge:undefined as number|undefined },
            { key:"wishlists", icon:Gift,          label:"Wishlists", badge:2 as number|undefined },
            { key:"messages",  icon:MessageCircle, label:"Messages",  badge:1 as number|undefined },
            { key:"games",     icon:Gamepad2,      label:"Games",     badge:undefined as number|undefined },
          ] as const).map(({ key, icon:Icon, label, badge }) => (
            <button key={key} onClick={() => setTab(key)} className="flex-1 flex flex-col items-center pt-2 pb-1 gap-1 relative min-h-[56px]"
              style={{ color:tab===key?"var(--gc-primary)":"var(--gc-text-muted)" }} aria-label={label}>
              <Icon size={22} strokeWidth={1.5}/>
              <span className="text-xs font-medium">{label}</span>
              {badge && tab!==key && <span className="absolute top-1.5 right-1/4 w-2 h-2 rounded-full" style={{ background:"var(--gc-accent)" }} aria-hidden/>}
              {tab===key && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full" style={{ background:"var(--gc-primary)" }}/>}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}

// ─── Draw Tab ────────────────────────────────────────────────────────────────
function DrawTab({ isOrganiser }: { isOrganiser:boolean }) {
  const [showConfirm,    setShowConfirm]    = useState(false);
  const [showExclusions, setShowExclusions] = useState(false);
  const [exclusions,     setExclusions]     = useState([{ a:"user-1", b:"user-2" }]);
  const [reminderSent,   setReminderSent]   = useState(false);
  const joined    = MOCK_MEMBERS.filter(m=>m.joined).length;
  const total     = MOCK_MEMBERS.length;
  const wishlists = MOCK_MEMBERS.filter(m=>m.hasWishlist).length;
  const giftsBought = 3;
  const progress  = Math.round(((joined+wishlists)/(total*2))*100);
  const joinedMembers = MOCK_MEMBERS.filter(m=>m.joined);

  function handleDraw() { if (!showConfirm){setShowConfirm(true);return;} toast.success("Names drawn! Everyone has been notified."); setShowConfirm(false); }
  function sendReminder() {
    window.open(`https://wa.me/?text=${encodeURIComponent(`Reminder: haven't joined Secret Santa yet? 🎅\nhttps://www.checkmybasket.co.uk/join/${MOCK_GROUP.invite_code}`)}`, "_blank", "noopener");
    setReminderSent(true); toast.success("Opening WhatsApp to send a reminder");
  }

  if (!isOrganiser) return (
    <div className="space-y-5">
      <div className="rounded-2xl p-8 text-center" style={{ background:"var(--gc-surface)", border:"1px solid var(--gc-border)", boxShadow:"var(--shadow-sm)" }}>
        <Dice5 size={36} strokeWidth={1.5} className="mx-auto mb-3" style={{ color:"var(--gc-primary)" }}/>
        <h2 className="font-semibold text-lg mb-2" style={{ fontFamily:"var(--font-fraunces)" }}>Waiting for the draw</h2>
        <p style={{ color:"var(--gc-text-secondary)" }}>Priya will draw names when everyone&apos;s ready. You&apos;ll get a notification.</p>
      </div>
      <div className="rounded-xl p-4 flex gap-3" style={{ background:"rgba(27,67,50,0.06)", border:"1px solid rgba(27,67,50,0.15)" }}>
        <Gift size={18} strokeWidth={1.5} style={{ color:"var(--gc-primary)", flexShrink:0 }}/>
        <p className="text-sm" style={{ color:"var(--gc-text-secondary)" }}>While you wait, add your wishlist so your Secret Santa knows what to get you.</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-5">
      {/* Progress */}
      <div className="rounded-2xl p-5" style={{ background:"var(--gc-surface)", border:"1px solid var(--gc-border)", boxShadow:"var(--shadow-sm)" }}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">Setup progress</h2>
          <span className="text-sm font-medium" style={{ color:"var(--gc-primary)" }}>{progress}% done</span>
        </div>
        <Progress value={progress} className="mb-4 h-2"/>
        <div className="space-y-3">
          {[
            { label:"Group created",                             done:true },
            { label:`${joined} of ${total} people joined`,      done:joined===total },
            { label:`${wishlists} of ${joined} wishlists added`,done:wishlists===joined },
            { label:"Names drawn",                              done:false },
          ].map(({ label, done }) => (
            <div key={label} className="flex items-center gap-2.5 text-sm">
              {done ? <CheckCircle2 size={16} strokeWidth={2} style={{ color:"var(--gc-success)", flexShrink:0 }}/> : <Circle size={16} strokeWidth={1.5} style={{ color:"var(--gc-border-strong)", flexShrink:0 }}/>}
              <span style={{ color:done?"var(--gc-text-primary)":"var(--gc-text-secondary)" }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Members + remind */}
      <div className="rounded-2xl overflow-hidden" style={{ background:"var(--gc-surface)", border:"1px solid var(--gc-border)", boxShadow:"var(--shadow-sm)" }}>
        <div className="px-5 py-3 border-b flex items-center justify-between" style={{ borderColor:"var(--gc-border)" }}>
          <h2 className="font-semibold text-sm">Members</h2>
          <div className="flex items-center gap-2">
            <span className="text-xs" style={{ color:"var(--gc-text-muted)" }}>{joined}/{total} joined</span>
            <Button size="sm" variant="outline" onClick={sendReminder} className="h-7 px-2.5 text-xs rounded-lg gap-1"
              style={{ borderColor:"#25D366", color:"#25D366" }} aria-label="Send reminder via WhatsApp">
              <Share2 size={12} strokeWidth={1.5}/> {reminderSent?"Sent":"Remind"}
            </Button>
          </div>
        </div>
        {MOCK_MEMBERS.map(m => (
          <div key={m.id} className="px-5 py-3 flex items-center gap-3 border-b last:border-0" style={{ borderColor:"var(--gc-border)" }}>
            <Avatar name={m.name} size={32}/>
            <div className="flex-1 min-w-0"><p className="font-medium text-sm truncate">{m.name}</p><p className="text-xs" style={{ color:"var(--gc-text-muted)" }}>{m.role}</p></div>
            <div className="flex gap-1.5 flex-wrap justify-end">
              {m.joined    && <Badge variant="outline" className="text-xs rounded-full" style={{ borderColor:"var(--gc-success)", color:"var(--gc-success)" }}>Joined</Badge>}
              {m.hasWishlist && <Badge variant="outline" className="text-xs rounded-full" style={{ borderColor:"var(--gc-warm)", color:"var(--gc-warm)" }}>Wishlist</Badge>}
              {!m.joined   && <Badge variant="outline" className="text-xs rounded-full" style={{ borderColor:"var(--gc-border-strong)", color:"var(--gc-text-muted)" }}>Pending</Badge>}
            </div>
          </div>
        ))}
      </div>

      {/* Gifts bought aggregate */}
      <div className="rounded-2xl p-5" style={{ background:"var(--gc-surface)", border:"1px solid var(--gc-border)", boxShadow:"var(--shadow-sm)" }}>
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold text-sm">Gifts bought</h2>
          <span className="text-sm font-medium" style={{ color:"var(--gc-primary)" }}>{giftsBought} of {joined}</span>
        </div>
        <Progress value={Math.round((giftsBought/joined)*100)} className="h-2 mb-2"/>
        <p className="text-xs" style={{ color:"var(--gc-text-muted)" }}>Only visible to you. Individual names are private.</p>
      </div>

      {/* Exclusions */}
      <div className="rounded-2xl overflow-hidden" style={{ background:"var(--gc-surface)", border:"1px solid var(--gc-border)", boxShadow:"var(--shadow-sm)" }}>
        <button className="w-full px-5 py-4 flex items-center justify-between text-left" onClick={() => setShowExclusions(v=>!v)}>
          <div>
            <p className="font-semibold text-sm">Exclusion rules</p>
            <p className="text-xs mt-0.5" style={{ color:"var(--gc-text-muted)" }}>
              {exclusions.length===0?"No exclusions set":`${exclusions.length} pair${exclusions.length===1?"":"s"} — couples, siblings, last year's match`}
            </p>
          </div>
          <span className="text-xs font-medium" style={{ color:"var(--gc-primary)" }}>{showExclusions?"Done":"Edit"}</span>
        </button>
        {showExclusions && (
          <div className="px-5 pb-5 border-t space-y-3 pt-4" style={{ borderColor:"var(--gc-border)" }}>
            <p className="text-xs" style={{ color:"var(--gc-text-muted)" }}>These people won&apos;t draw each other (bidirectional).</p>
            {exclusions.map((exc,i) => (
              <div key={i} className="flex items-center gap-2">
                <select value={exc.a} onChange={e => setExclusions(prev=>prev.map((x,idx)=>idx===i?{...x,a:e.target.value}:x))}
                  className="flex-1 h-10 rounded-xl border px-3 text-sm bg-white" style={{ borderColor:"var(--gc-border-strong)" }}>
                  <option value="">Select person</option>
                  {joinedMembers.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
                <span className="text-xs font-medium" style={{ color:"var(--gc-text-muted)" }}>↔</span>
                <select value={exc.b} onChange={e => setExclusions(prev=>prev.map((x,idx)=>idx===i?{...x,b:e.target.value}:x))}
                  className="flex-1 h-10 rounded-xl border px-3 text-sm bg-white" style={{ borderColor:"var(--gc-border-strong)" }}>
                  <option value="">Select person</option>
                  {joinedMembers.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
                <button onClick={() => setExclusions(prev=>prev.filter((_,idx)=>idx!==i))} className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background:"var(--gc-surface-hover)" }} aria-label="Remove exclusion">
                  <X size={14} strokeWidth={2} style={{ color:"var(--gc-text-muted)" }}/>
                </button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={() => setExclusions(prev=>[...prev,{a:"",b:""}])} className="rounded-xl text-xs h-9" style={{ borderColor:"var(--gc-border-strong)" }}>
              <Plus size={14} strokeWidth={1.5} className="mr-1"/> Add exclusion
            </Button>
          </div>
        )}
      </div>

      {/* Draw button */}
      {showConfirm ? (
        <div className="rounded-2xl p-5" style={{ background:"rgba(193,18,31,0.06)", border:"1px solid rgba(193,18,31,0.2)" }}>
          <div className="flex gap-2 mb-3">
            <AlertTriangle size={18} strokeWidth={1.5} style={{ color:"var(--gc-error)", flexShrink:0 }}/>
            <p className="text-sm font-medium" style={{ color:"var(--gc-error)" }}>Once names are drawn, this can&apos;t be undone without a full redraw. Everyone will be notified.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1 rounded-xl" onClick={()=>setShowConfirm(false)}>Cancel</Button>
            <Button className="flex-1 rounded-xl font-semibold" onClick={handleDraw} style={{ background:"var(--gc-accent)", color:"#fff" }}>Yes, draw names</Button>
          </div>
        </div>
      ) : (
        <Button size="lg" disabled={joined<3} onClick={handleDraw} className="w-full h-14 text-base rounded-xl font-semibold"
          style={{ background:joined>=3?"var(--gc-primary)":undefined, color:joined>=3?"var(--gc-text-inverse)":undefined }}>
          <Dice5 size={20} strokeWidth={1.5} className="mr-2"/>
          {joined<3?`Need ${3-joined} more member${3-joined===1?"":"s"} to draw`:"Draw names now"}
        </Button>
      )}
    </div>
  );
}

// ─── Wishlists Tab ───────────────────────────────────────────────────────────
function WishlistsTab() {
  const [activeUser,  setActiveUser]  = useState("user-1");
  const [newItem,     setNewItem]     = useState("");
  const [boughtItems, setBoughtItems] = useState<Set<string>>(new Set());
  const [pleaseAvoid, setPleaseAvoid] = useState("Candles (have too many), anything lime-flavoured");
  const [mySizes,     setMySizes]     = useState("Top: M, Shoe: UK 7");
  const [editingMeta, setEditingMeta] = useState(false);

  const isMyList = activeUser === MOCK_ME.id;
  const items    = MOCK_WISHLISTS[activeUser] ?? [];
  const membersWithLists = MOCK_MEMBERS.filter(m=>MOCK_WISHLISTS[m.id]);
  const priorityLabel: Record<string,string> = { love:"Would love", like:"Would like", inspiration:"Just inspiration" };
  const priorityColor: Record<string,string> = { love:"var(--gc-accent)", like:"var(--gc-primary)", inspiration:"var(--gc-text-muted)" };

  function toggleBought(id:string) {
    setBoughtItems(prev => { const n=new Set(prev); n.has(id)?n.delete(id):n.add(id); return n; });
    toast.success(boughtItems.has(id)?"Unmarked as bought":"Marked as bought — only you can see this");
  }

  return (
    <div className="space-y-5">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {membersWithLists.map(m => (
          <button key={m.id} onClick={() => setActiveUser(m.id)}
            className={cn("flex-shrink-0 flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium border-2 transition-all duration-150",
              activeUser===m.id?"border-[var(--gc-primary)] bg-[var(--gc-primary)] text-[var(--gc-text-inverse)]":"border-[var(--gc-border)] bg-[var(--gc-surface)]")}>
            <Avatar name={m.name} size={20}/>{m.id===MOCK_ME.id?"Mine":m.name.split(" ")[0]}
          </button>
        ))}
        {membersWithLists.length < MOCK_MEMBERS.filter(m=>m.joined).length && (
          <span className="flex-shrink-0 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm border"
            style={{ borderColor:"var(--gc-border)", color:"var(--gc-text-muted)", background:"var(--gc-surface)" }}>
            +{MOCK_MEMBERS.filter(m=>m.joined&&!MOCK_WISHLISTS[m.id]).length} no list yet
          </span>
        )}
      </div>
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-lg" style={{ fontFamily:"var(--font-fraunces)" }}>
          {isMyList?"Your wishlist":`${MOCK_MEMBERS.find(m=>m.id===activeUser)?.name.split(" ")[0]}'s wishlist`}
        </h2>
        {isMyList && <Badge className="text-xs" style={{ background:"rgba(27,67,50,0.1)", color:"var(--gc-primary)" }}>{items.length} items</Badge>}
      </div>
      {items.length===0 ? (
        <EmptyState title="No wishlist items yet" body="Add gift ideas from any shop — Etsy, John Lewis, Amazon, anywhere." cta="Add your first wish" icon={Gift}/>
      ) : (
        <div className="space-y-3">
          {items.map(item => (
            <div key={item.id} className="rounded-2xl p-4" style={{ background:"var(--gc-surface)", border:"1px solid var(--gc-border)", boxShadow:"var(--shadow-sm)", opacity:boughtItems.has(item.id)?0.6:1 }}>
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="rounded-full px-2 py-0.5 text-xs font-medium"
                      style={{ background:`color-mix(in srgb, ${priorityColor[item.priority]} 12%, transparent)`, color:priorityColor[item.priority] }}>
                      {priorityLabel[item.priority]}
                    </span>
                    {item.shop && <span className="text-xs" style={{ color:"var(--gc-text-muted)" }}>{item.shop}</span>}
                  </div>
                  <p className={cn("font-medium",boughtItems.has(item.id)&&"line-through")}>{item.title}</p>
                  {item.price && <p className="text-sm mt-0.5" style={{ color:"var(--gc-text-secondary)" }}>~{formatBudget(item.price)}</p>}
                </div>
                <div className="flex gap-1.5 flex-shrink-0">
                  {item.url && <a href={item.url} target="_blank" rel="noopener noreferrer"><Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-lg" aria-label="View product"><ExternalLink size={16} strokeWidth={1.5}/></Button></a>}
                  {!isMyList && (
                    <Button variant={boughtItems.has(item.id)?"default":"outline"} size="sm" onClick={()=>toggleBought(item.id)}
                      className="h-9 rounded-lg text-xs px-3" style={boughtItems.has(item.id)?{background:"var(--gc-success)",color:"#fff"}:{}}>
                      {boughtItems.has(item.id)?<><CheckCircle2 size={13} strokeWidth={2} className="mr-1"/>Got it</>:"I'm getting this"}
                    </Button>
                  )}
                  {isMyList && <Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-lg" aria-label="Delete item"><Trash2 size={16} strokeWidth={1.5} style={{ color:"var(--gc-text-muted)" }}/></Button>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {isMyList && (
        <>
          <div className="rounded-2xl p-4" style={{ background:"var(--gc-surface)", border:"1px solid var(--gc-border)", boxShadow:"var(--shadow-sm)" }}>
            <Label htmlFor="new-wish" className="text-sm font-medium mb-2 block">Add a wish</Label>
            <div className="flex gap-2">
              <Input id="new-wish" placeholder="e.g. Heated blanket, link from any shop..." value={newItem}
                onChange={e=>setNewItem(e.target.value)} className="h-11 text-base rounded-xl flex-1" style={{ borderColor:"var(--gc-border-strong)" }}/>
              <Button className="h-11 w-11 p-0 rounded-xl flex-shrink-0" style={{ background:"var(--gc-primary)", color:"var(--gc-text-inverse)" }}
                aria-label="Add item" onClick={()=>{toast.success("Item added");setNewItem("");}}>
                <Plus size={18} strokeWidth={2}/>
              </Button>
            </div>
            <p className="text-xs mt-2" style={{ color:"var(--gc-text-muted)" }}>Add links from any shop — Etsy, John Lewis, Amazon, anywhere</p>
          </div>
          <div className="rounded-2xl overflow-hidden" style={{ background:"var(--gc-surface)", border:"1px solid var(--gc-border)", boxShadow:"var(--shadow-sm)" }}>
            <button className="w-full px-5 py-4 flex items-center justify-between text-left" onClick={()=>setEditingMeta(v=>!v)}>
              <div>
                <p className="font-semibold text-sm">Please avoid &amp; my sizes</p>
                <p className="text-xs mt-0.5" style={{ color:"var(--gc-text-muted)" }}>Allergies, dislikes, clothing sizes — visible to your Secret Santa</p>
              </div>
              <span className="text-xs font-medium" style={{ color:"var(--gc-primary)" }}>{editingMeta?"Done":"Edit"}</span>
            </button>
            {editingMeta && (
              <div className="px-5 pb-5 border-t space-y-4 pt-4" style={{ borderColor:"var(--gc-border)" }}>
                <div>
                  <Label className="text-sm font-medium mb-1.5 block">Please avoid</Label>
                  <Textarea placeholder="Allergies, things you hate, stuff you have plenty of..." value={pleaseAvoid}
                    onChange={e=>setPleaseAvoid(e.target.value)} className="min-h-[72px] rounded-xl text-sm resize-none" style={{ borderColor:"var(--gc-border-strong)" }}/>
                </div>
                <div>
                  <Label className="text-sm font-medium mb-1.5 block">My sizes</Label>
                  <Input placeholder="e.g. Top: M, Shoe: UK 7, Ring: O" value={mySizes} onChange={e=>setMySizes(e.target.value)}
                    className="h-10 rounded-xl text-sm" style={{ borderColor:"var(--gc-border-strong)" }}/>
                </div>
                <Button size="sm" onClick={()=>{setEditingMeta(false);toast.success("Saved");}} className="rounded-xl" style={{ background:"var(--gc-primary)", color:"var(--gc-text-inverse)" }}>Save</Button>
              </div>
            )}
          </div>
        </>
      )}
      {!isMyList && activeUser==="user-1" && (
        <div className="rounded-2xl p-4 space-y-3" style={{ background:"var(--gc-surface)", border:"1px solid var(--gc-border)" }}>
          {pleaseAvoid && <div><p className="text-xs font-semibold uppercase mb-1" style={{ color:"var(--gc-text-muted)" }}>Please avoid</p><p className="text-sm">{pleaseAvoid}</p></div>}
          {mySizes    && <div><p className="text-xs font-semibold uppercase mb-1" style={{ color:"var(--gc-text-muted)" }}>Sizes</p><p className="text-sm">{mySizes}</p></div>}
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

function MessagesTab() {
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const [draft,    setDraft]    = useState("");
  const isPostDraw = MOCK_GROUP.draw_status !== "pending";
  if (!isPostDraw) return (
    <EmptyState title="Messages open after the draw"
      body="Anonymous messaging opens after names are drawn. In the meantime, add your wishlist so your Secret Santa knows what to get you."
      icon={Lock}/>
  );
  function sendMessage(content:string) {
    if (!content.trim()) return;
    setMessages(prev=>[...prev,{ id:String(Date.now()), sender:"You", content, time:"just now", isMe:true }]);
    setDraft("");
  }
  return (
    <div className="space-y-4">
      <div className="rounded-xl p-3 flex gap-2" style={{ background:"rgba(27,67,50,0.06)", border:"1px solid rgba(27,67,50,0.15)" }}>
        <Lock size={14} strokeWidth={1.5} style={{ color:"var(--gc-primary)", flexShrink:0, marginTop:2 }}/>
        <p className="text-xs" style={{ color:"var(--gc-text-secondary)" }}>Your identity stays hidden. They&apos;ll only see &ldquo;Your Secret Santa 🤫&rdquo;</p>
      </div>
      <div className="space-y-3">
        {messages.map(msg => (
          <div key={msg.id} className={cn("flex",msg.isMe?"justify-end":"justify-start")}>
            <div className="rounded-2xl px-4 py-3 max-w-[80%]"
              style={{ background:msg.isMe?"var(--gc-primary)":"var(--gc-surface)", color:msg.isMe?"var(--gc-text-inverse)":"var(--gc-text-primary)", border:msg.isMe?"none":"1px solid var(--gc-border)" }}>
              {!msg.isMe && <p className="text-xs font-medium mb-1" style={{ color:"var(--gc-warm)" }}>{msg.sender}</p>}
              <p className="text-sm leading-relaxed">{msg.content}</p>
              <p className="text-xs mt-1" style={{ color:msg.isMe?"rgba(255,248,240,0.55)":"var(--gc-text-muted)" }}>{msg.time}</p>
            </div>
          </div>
        ))}
      </div>
      <div>
        <p className="text-xs font-medium mb-2" style={{ color:"var(--gc-text-muted)" }}>SUGGESTED QUESTIONS</p>
        <div className="flex flex-wrap gap-2">
          {SUGGESTED_QUESTIONS.map(q => (
            <button key={q} onClick={()=>sendMessage(q)} className="rounded-full px-3 py-1.5 text-xs border transition-colors duration-150 text-left"
              style={{ background:"var(--gc-surface)", borderColor:"var(--gc-border)", color:"var(--gc-text-secondary)" }}>{q}</button>
          ))}
        </div>
      </div>
      <div className="flex gap-2">
        <Input placeholder="Ask a question..." value={draft} onChange={e=>setDraft(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendMessage(draft)}
          maxLength={500} className="h-11 text-base rounded-xl flex-1" style={{ borderColor:"var(--gc-border-strong)" }}/>
        <Button onClick={()=>sendMessage(draft)} disabled={!draft.trim()} className="h-11 w-11 p-0 rounded-xl flex-shrink-0"
          style={{ background:"var(--gc-primary)", color:"var(--gc-text-inverse)" }} aria-label="Send message">
          <Send size={16} strokeWidth={1.5}/>
        </Button>
      </div>
      <p className="text-xs" style={{ color:"var(--gc-text-muted)" }}>{draft.length}/500</p>
    </div>
  );
}

// ─── Games Tab — Gift Predictions ────────────────────────────────────────────
function GamesTab() {
  const [gameState, setGameState] = useState<GameState>("ready");
  const [step,      setStep]      = useState(0);   // which member we're predicting for
  const [picks,     setPicks]     = useState<Record<string,string>>({});
  const [loggedGift,setLoggedGift]= useState<string|null>(null);
  const [showLog,   setShowLog]   = useState(false);

  const subjects = MOCK_MEMBERS.filter(m=>m.joined && m.id!==MOCK_ME.id);
  const current  = subjects[step];

  if (MOCK_GROUP.draw_status === "pending") return (
    <EmptyState title="Games unlock after the draw" body="Hang tight — Gift Predictions opens once names have been drawn." icon={Gamepad2}/>
  );

  /* ── Ready state ── */
  if (gameState === "ready") return (
    <div className="space-y-5">
      <div className="rounded-2xl overflow-hidden" style={{ background:"var(--gc-surface)", border:"1px solid var(--gc-border)", boxShadow:"var(--shadow-md)" }}>
        <div className="px-5 py-4 border-b" style={{ background:"var(--gc-primary)", borderColor:"var(--gc-primary-dark)" }}>
          <div className="flex items-center gap-2">
            <Gamepad2 size={18} strokeWidth={1.5} style={{ color:"var(--gc-warm)" }}/>
            <h2 className="font-semibold" style={{ color:"var(--gc-text-inverse)", fontFamily:"var(--font-fraunces)" }}>Gift Predictions</h2>
          </div>
        </div>
        <div className="p-5 space-y-4">
          <p className="text-sm leading-relaxed" style={{ color:"var(--gc-text-secondary)" }}>
            Think you know your group? Predict what type of Secret Santa gift everyone will get — then earn Stereotype Awards based on what the group said.
          </p>
          <div className="grid grid-cols-3 gap-2">
            {GIFT_CATEGORIES.slice(0,6).map(c => (
              <div key={c.key} className="rounded-xl p-2.5 text-center" style={{ background:"var(--gc-bg)", border:"1px solid var(--gc-border)" }}>
                <div className="text-xl mb-1">{c.emoji}</div>
                <p className="text-xs font-medium leading-tight">{c.label}</p>
              </div>
            ))}
          </div>
          <Button onClick={()=>setGameState("predicting")} size="lg" className="w-full h-12 rounded-xl font-semibold"
            style={{ background:"var(--gc-primary)", color:"var(--gc-text-inverse)" }}>
            Make my predictions <ArrowRight size={18} strokeWidth={1.5} className="ml-2"/>
          </Button>
          <p className="text-xs text-center" style={{ color:"var(--gc-text-muted)" }}>
            Predict for {subjects.length} people — takes about 2 minutes
          </p>
        </div>
      </div>
    </div>
  );

  /* ── Predicting ── */
  if (gameState === "predicting" && current) return (
    <div className="space-y-5">
      {/* Progress dots */}
      <div className="flex items-center justify-center gap-2">
        {subjects.map((_,i) => (
          <div key={i} className="rounded-full transition-all duration-200"
            style={{ width: i===step?16:8, height:8, background:i<step?"var(--gc-primary)":i===step?"var(--gc-primary)":"var(--gc-border)" }}/>
        ))}
      </div>
      <div className="rounded-2xl p-6 text-center" style={{ background:"var(--gc-surface)", border:"1px solid var(--gc-border)", boxShadow:"var(--shadow-md)" }}>
        <p className="text-sm mb-1" style={{ color:"var(--gc-text-muted)" }}>What will</p>
        <h2 className="text-2xl font-bold mb-1" style={{ fontFamily:"var(--font-fraunces)" }}>{current.name}</h2>
        <p className="text-sm" style={{ color:"var(--gc-text-muted)" }}>get for Secret Santa?</p>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {GIFT_CATEGORIES.map(cat => {
          const selected = picks[current.id] === cat.key;
          return (
            <button key={cat.key} onClick={()=>setPicks(p=>({...p,[current.id]:cat.key}))}
              className="rounded-2xl p-3 text-center transition-all duration-150"
              style={{ background:selected?"var(--gc-primary)":"var(--gc-surface)", border:`2px solid ${selected?"var(--gc-primary)":"var(--gc-border)"}`,
                color:selected?"var(--gc-text-inverse)":"var(--gc-text-primary)", transform:selected?"scale(1.04)":"scale(1)" }}>
              <div className="text-2xl mb-1">{cat.emoji}</div>
              <p className="text-xs font-medium leading-tight">{cat.label}</p>
            </button>
          );
        })}
      </div>
      <div className="flex gap-3">
        {step>0 && <Button variant="outline" className="flex-1 h-12 rounded-xl" onClick={()=>setStep(s=>s-1)}>← Back</Button>}
        <Button className="flex-1 h-12 rounded-xl font-semibold" disabled={!picks[current.id]}
          onClick={() => { if (step<subjects.length-1){setStep(s=>s+1);}else{setGameState("submitted");} }}
          style={{ background:"var(--gc-primary)", color:"var(--gc-text-inverse)" }}>
          {step<subjects.length-1?"Next →":"Review predictions"}
        </Button>
      </div>
    </div>
  );

  /* ── Submitted / confirmation ── */
  if (gameState === "submitted") return (
    <div className="space-y-4">
      <div className="rounded-2xl p-6 text-center animate-scale-in" style={{ background:"var(--gc-surface)", border:"1px solid var(--gc-border)", boxShadow:"var(--shadow-md)" }}>
        <div className="text-4xl mb-3">🔒</div>
        <h2 className="text-xl font-bold mb-2" style={{ fontFamily:"var(--font-fraunces)" }}>All predictions locked in!</h2>
        <p className="text-sm mb-4" style={{ color:"var(--gc-text-secondary)" }}>Waiting for 3 more people to submit before results unlock.</p>
        <Progress value={Math.round((3/subjects.length)*100)} className="h-2 mb-2"/>
        <p className="text-xs" style={{ color:"var(--gc-text-muted)" }}>3 of {subjects.length} predictions submitted</p>
      </div>
      <div className="rounded-2xl p-5 space-y-3" style={{ background:"var(--gc-surface)", border:"1px solid var(--gc-border)" }}>
        <h3 className="font-semibold text-sm">Your predictions</h3>
        {subjects.map(m => {
          const cat = GIFT_CATEGORIES.find(c=>c.key===picks[m.id]);
          return (
            <div key={m.id} className="flex items-center justify-between">
              <span className="text-sm">{m.name}</span>
              <span className="text-sm font-medium">{cat?`${cat.emoji} ${cat.label}`:"—"}</span>
            </div>
          );
        })}
      </div>
      <Button variant="outline" onClick={()=>setGameState("results")} className="w-full h-11 rounded-xl text-sm" style={{ borderColor:"var(--gc-border-strong)" }}>
        Preview results (demo)
      </Button>
    </div>
  );

  /* ── Results ── */
  if (gameState === "results") return (
    <div className="space-y-5">
      <div className="text-center mb-2">
        <p className="text-sm font-medium" style={{ color:"var(--gc-accent)" }}>Gift Prediction Results</p>
        <h2 className="text-2xl font-bold" style={{ fontFamily:"var(--font-fraunces)" }}>The group has spoken</h2>
      </div>

      {MOCK_RESULTS.map(r => (
        <div key={r.id} className="rounded-2xl p-5" style={{ background:"var(--gc-surface)", border:"1px solid var(--gc-border)", boxShadow:"var(--shadow-sm)" }}>
          <div className="flex items-center gap-3 mb-3">
            <Avatar name={r.name} size={36}/>
            <div>
              <p className="font-semibold">{r.name}</p>
              <p className="text-xs" style={{ color:"var(--gc-text-muted)" }}>
                The group predicted: <strong>{r.topCat.emoji} {r.topCat.label}</strong> ({r.topVotes}/{r.total} votes)
              </p>
            </div>
          </div>
          {/* Vote bar */}
          <div className="space-y-1.5">
            {Object.entries(r.dist).sort(([,a],[,b])=>b-a).map(([key,votes]) => {
              const cat = GIFT_CATEGORIES.find(c=>c.key===key);
              if (!cat) return null;
              return (
                <div key={key} className="flex items-center gap-2 text-xs">
                  <span className="w-16 flex-shrink-0 truncate" style={{ color:"var(--gc-text-secondary)" }}>{cat.emoji} {cat.label}</span>
                  <div className="flex-1 rounded-full overflow-hidden h-2" style={{ background:"var(--gc-border)" }}>
                    <div className="h-full rounded-full transition-all duration-500"
                      style={{ width:`${(votes/r.total)*100}%`, background:key===r.topCat.key?"var(--gc-primary)":"var(--gc-warm)" }}/>
                  </div>
                  <span className="w-4 text-right font-medium" style={{ color:"var(--gc-text-muted)" }}>{votes}</span>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Stereotype Awards */}
      <div className="rounded-2xl overflow-hidden" style={{ background:"var(--gc-primary)", boxShadow:"var(--shadow-lg)" }}>
        <div className="px-5 py-4 border-b" style={{ borderColor:"var(--gc-primary-dark)" }}>
          <div className="flex items-center gap-2">
            <Trophy size={18} strokeWidth={1.5} style={{ color:"var(--gc-warm)" }}/>
            <h2 className="font-bold" style={{ color:"var(--gc-text-inverse)", fontFamily:"var(--font-fraunces)" }}>🏆 Gift Prediction Awards</h2>
          </div>
        </div>
        <div className="p-5 space-y-4">
          {STEREOTYPE_AWARDS.map(award => (
            <div key={award.title} className="flex items-start gap-3">
              <span className="text-xl flex-shrink-0">{award.emoji}</span>
              <div>
                <p className="font-semibold text-sm" style={{ color:"var(--gc-text-inverse)" }}>{award.title}</p>
                <p className="text-sm" style={{ color:"var(--gc-warm)" }}>{award.winner}</p>
                <p className="text-xs mt-0.5" style={{ color:"rgba(255,248,240,0.6)" }}>{award.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Post-Christmas reveal */}
      <div className="rounded-2xl overflow-hidden" style={{ background:"var(--gc-surface)", border:"1px solid var(--gc-border)", boxShadow:"var(--shadow-sm)" }}>
        {!showLog ? (
          <div className="p-5">
            <div className="flex items-center gap-2 mb-2">
              <Star size={16} strokeWidth={1.5} style={{ color:"var(--gc-warm)" }}/>
              <p className="font-semibold text-sm">Log what you actually received</p>
            </div>
            <p className="text-sm mb-4" style={{ color:"var(--gc-text-secondary)" }}>
              Gifts have been exchanged? Log yours to see who predicted correctly.
            </p>
            <Button variant="outline" onClick={()=>setShowLog(true)} className="w-full h-10 rounded-xl text-sm" style={{ borderColor:"var(--gc-border-strong)" }}>
              Log my actual gift
            </Button>
          </div>
        ) : loggedGift ? (
          <div className="p-5 text-center">
            <div className="text-3xl mb-2">{GIFT_CATEGORIES.find(c=>c.key===loggedGift)?.emoji}</div>
            <p className="font-semibold mb-1">You received: {GIFT_CATEGORIES.find(c=>c.key===loggedGift)?.label}</p>
            <p className="text-sm" style={{ color:"var(--gc-text-secondary)" }}>
              🎯 <strong>4 out of {subjects.length}</strong> people predicted correctly!
            </p>
          </div>
        ) : (
          <div className="p-5">
            <p className="font-semibold text-sm mb-3">What did you actually receive?</p>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {GIFT_CATEGORIES.map(cat => (
                <button key={cat.key} onClick={()=>setLoggedGift(cat.key)}
                  className="rounded-xl p-2.5 text-center transition-all duration-150"
                  style={{ background:"var(--gc-bg)", border:"1px solid var(--gc-border)" }}>
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

  return null;
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

function EmptyState({ title, body, cta, icon:Icon }: { title:string; body:string; cta?:string; icon:React.ElementType }) {
  return (
    <div className="rounded-2xl p-10 text-center" style={{ background:"var(--gc-surface)", border:"2px dashed var(--gc-border)" }}>
      <Icon size={32} strokeWidth={1.5} className="mx-auto mb-3" style={{ color:"var(--gc-text-muted)" }}/>
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-sm max-w-xs mx-auto" style={{ color:"var(--gc-text-secondary)" }}>{body}</p>
      {cta && <Button size="sm" className="mt-4 rounded-xl" style={{ background:"var(--gc-primary)", color:"var(--gc-text-inverse)" }}>{cta}</Button>}
    </div>
  );
}
