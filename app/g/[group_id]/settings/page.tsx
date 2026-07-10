"use client";
import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, Gift, Trash2, LogOut, AlertTriangle, Copy, Check, Calendar, MapPin, Edit2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { QRCodeSvg } from "@/components/qr-code";

interface GroupInfo { id:string; name:string; exchange_date:string|null; exchange_location:string|null; invite_code:string; organiser_id:string; }

export default function SettingsPage({ params }: { params: Promise<{ group_id:string }> }) {
  const { group_id } = use(params);
  const router = useRouter();
  const [group, setGroup] = useState<GroupInfo | null>(null);
  const [me, setMe] = useState<string | null>(null);
  const [editName,          setEditName]          = useState(false);
  const [groupName,         setGroupName]         = useState("");
  const [copied,            setCopied]            = useState(false);
  const [busy,              setBusy]              = useState(false);
  const [showLeaveConfirm,  setShowLeaveConfirm]  = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInput,       setDeleteInput]       = useState("");

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace(`/g/${group_id}`); return; }
      setMe(user.id);
      const { data } = await supabase.from("groups")
        .select("id,name,exchange_date,exchange_location,invite_code,organiser_id")
        .eq("id", group_id).maybeSingle();
      if (!data) { router.replace(`/g/${group_id}`); return; }
      setGroup(data); setGroupName(data.name);
    })();
  }, [group_id, router]);

  if (!group || !me) return (
    <div className="min-h-dvh flex items-center justify-center" style={{ background:"var(--gc-bg)" }}>
      <div className="w-full max-w-xl px-4 space-y-4"><div className="rounded-2xl h-40 skeleton"/><div className="rounded-2xl h-40 skeleton"/></div>
    </div>
  );

  const isOrganiser = me === group.organiser_id;
  const inviteLink = `${window.location.origin}/join/${group.invite_code}`;

  async function copyLink() { await navigator.clipboard.writeText(inviteLink); setCopied(true); toast.success("Link copied"); setTimeout(()=>setCopied(false),2000); }

  async function saveName() {
    if (!group || !groupName.trim() || busy) return;
    setBusy(true);
    const supabase = createClient();
    const { error } = await supabase.from("groups").update({ name: groupName.trim() }).eq("id", group.id);
    if (error) toast.error(error.message);
    else { setGroup(g => g ? { ...g, name: groupName.trim() } : g); setEditName(false); toast.success("Updated"); }
    setBusy(false);
  }

  async function clearWishlist() {
    if (!group || busy) return;
    setBusy(true);
    const supabase = createClient();
    const { error } = await supabase.from("wishlist_items").delete().eq("group_id", group.id).eq("user_id", me!);
    if (error) toast.error(error.message);
    else toast.success("Wishlist cleared");
    setBusy(false);
  }

  async function handleLeave() {
    if (!group || busy) return;
    setBusy(true);
    const supabase = createClient();
    // Wishlist first, then membership — both are own-row RLS deletes.
    await supabase.from("wishlist_items").delete().eq("group_id", group.id).eq("user_id", me!);
    const { error } = await supabase.from("group_members").delete().eq("group_id", group.id).eq("user_id", me!);
    if (error) { toast.error(error.message); setBusy(false); return; }
    toast.success("You've left the group");
    router.push("/");
  }

  async function handleDelete() {
    if (!group || busy) return;
    if (deleteInput !== group.name) { toast.error("Group name doesn't match"); return; }
    setBusy(true);
    const supabase = createClient();
    const { error } = await supabase.from("groups").delete().eq("id", group.id);
    if (error) { toast.error(error.message); setBusy(false); return; }
    toast.success("Group deleted");
    router.push("/");
  }

  return (
    <div className="min-h-dvh" style={{ background:"var(--gc-bg)" }}>
      <header className="sticky top-0 z-30 border-b" style={{ borderColor:"var(--gc-border)", background:"rgba(255,248,240,0.92)", backdropFilter:"blur(12px)" }}>
        <div className="max-w-xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link href={`/g/${group_id}`}><Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-lg"><ChevronLeft size={20} strokeWidth={1.5}/></Button></Link>
          <div className="flex items-center gap-2" style={{ color:"var(--gc-primary)" }}>
            <Gift size={18} strokeWidth={1.5}/><span className="font-semibold" style={{ fontFamily:"var(--font-fraunces)" }}>Group settings</span>
          </div>
        </div>
      </header>
      <main className="max-w-xl mx-auto px-4 py-8 space-y-5">
        {isOrganiser && (
          <Section title="Group details">
            <div className="space-y-4 p-5">
              <div>
                <Label className="text-sm font-medium mb-1.5 block">Group name</Label>
                {editName ? (
                  <div className="flex gap-2">
                    <Input value={groupName} onChange={e=>setGroupName(e.target.value)} className="h-11 rounded-xl flex-1" style={{ borderColor:"var(--gc-border-strong)" }}/>
                    <Button className="h-11 px-4 rounded-xl" disabled={busy} style={{ background:"var(--gc-primary)", color:"var(--gc-text-inverse)" }}
                      onClick={saveName} aria-label="Save name">
                      <CheckCircle2 size={16} strokeWidth={2}/>
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <p className="flex-1 text-sm py-2">{group.name}</p>
                    <Button variant="ghost" size="sm" onClick={()=>setEditName(true)} className="h-8 w-8 p-0 rounded-lg" aria-label="Edit name"><Edit2 size={14} strokeWidth={1.5}/></Button>
                  </div>
                )}
              </div>
              {group.exchange_date && (
                <div className="flex items-center gap-3 text-sm" style={{ color:"var(--gc-text-secondary)" }}>
                  <Calendar size={14} strokeWidth={1.5} style={{ flexShrink:0 }}/>
                  <span>{new Date(group.exchange_date).toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"})}</span>
                </div>
              )}
              {group.exchange_location && (
                <div className="flex items-center gap-3 text-sm" style={{ color:"var(--gc-text-secondary)" }}>
                  <MapPin size={14} strokeWidth={1.5} style={{ flexShrink:0 }}/><span>{group.exchange_location}</span>
                </div>
              )}
            </div>
          </Section>
        )}

        <Section title="Invite link">
          <div className="p-5 space-y-3">
            <p className="text-sm break-all" style={{ color:"var(--gc-primary)", fontFamily:"var(--font-jetbrains-mono)", fontSize:"0.8rem" }}>{inviteLink}</p>
            <div className="w-32 h-32 rounded-xl mx-auto overflow-hidden" style={{ background:"#fff", border:"1px solid var(--gc-border)" }}>
              <QRCodeSvg value={inviteLink} size={126} />
            </div>
            <Button variant="outline" onClick={copyLink} className="w-full h-10 rounded-xl text-sm font-medium"
              style={{ borderColor:copied?"var(--gc-success)":"var(--gc-border-strong)", color:copied?"var(--gc-success)":"var(--gc-text-primary)" }}>
              {copied?<><Check size={15} strokeWidth={2} className="mr-2"/>Copied</>:<><Copy size={15} strokeWidth={1.5} className="mr-2"/>Copy invite link</>}
            </Button>
          </div>
        </Section>

        <Section title="Your data">
          <div className="divide-y" style={{ borderColor:"var(--gc-border)" }}>
            <div className="px-5 py-4 flex items-center gap-3">
              <Gift size={16} strokeWidth={1.5} style={{ color:"var(--gc-text-muted)", flexShrink:0 }}/>
              <div className="flex-1 min-w-0"><p className="text-sm font-medium">Your wishlist</p><p className="text-xs" style={{ color:"var(--gc-text-muted)" }}>Delete all your wishlist items</p></div>
              <Button variant="outline" size="sm" className="h-8 px-3 text-xs rounded-lg" style={{ borderColor:"var(--gc-border-strong)" }}
                disabled={busy} onClick={clearWishlist}>Clear wishlist</Button>
            </div>
          </div>
        </Section>

        {!isOrganiser && (
          <Section title="Leave group">
            <div className="p-5">
              {!showLeaveConfirm ? (
                <Button variant="outline" className="w-full h-11 rounded-xl font-medium" style={{ borderColor:"var(--gc-accent)", color:"var(--gc-accent)" }} onClick={()=>setShowLeaveConfirm(true)}>
                  <LogOut size={16} strokeWidth={1.5} className="mr-2"/> Leave this group
                </Button>
              ) : (
                <div className="space-y-3">
                  <div className="rounded-xl p-4 flex gap-2" style={{ background:"rgba(193,18,31,0.06)", border:"1px solid rgba(193,18,31,0.2)" }}>
                    <AlertTriangle size={16} strokeWidth={1.5} style={{ color:"var(--gc-error)", flexShrink:0 }}/>
                    <p className="text-sm" style={{ color:"var(--gc-error)" }}>You&apos;ll be removed and your wishlist deleted. This can&apos;t be undone.</p>
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" className="flex-1 rounded-xl" disabled={busy} onClick={()=>setShowLeaveConfirm(false)}>Cancel</Button>
                    <Button className="flex-1 rounded-xl font-semibold" disabled={busy} style={{ background:"var(--gc-accent)", color:"#fff" }} onClick={handleLeave}>
                      {busy?"Leaving…":"Yes, leave"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Section>
        )}

        {isOrganiser && (
          <Section title="Delete group">
            <div className="p-5">
              {!showDeleteConfirm ? (
                <>
                  <p className="text-sm mb-4" style={{ color:"var(--gc-text-secondary)" }}>Permanently deletes the group, all wishlists, messages, and prediction data. Cannot be undone.</p>
                  <Button variant="outline" className="w-full h-11 rounded-xl font-medium" style={{ borderColor:"var(--gc-accent)", color:"var(--gc-accent)" }} onClick={()=>setShowDeleteConfirm(true)}>
                    <Trash2 size={16} strokeWidth={1.5} className="mr-2"/> Delete this group
                  </Button>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="rounded-xl p-4 flex gap-2" style={{ background:"rgba(193,18,31,0.06)", border:"1px solid rgba(193,18,31,0.2)" }}>
                    <AlertTriangle size={16} strokeWidth={1.5} style={{ color:"var(--gc-error)", flexShrink:0 }}/>
                    <p className="text-sm" style={{ color:"var(--gc-error)" }}>This permanently deletes all data for all members. Cannot be undone.</p>
                  </div>
                  <div>
                    <Label htmlFor="delete-confirm" className="text-sm font-medium mb-2 block">Type <strong>{group.name}</strong> to confirm</Label>
                    <Input id="delete-confirm" placeholder={group.name} value={deleteInput} onChange={e=>setDeleteInput(e.target.value)}
                      className="h-11 rounded-xl mb-3" style={{ borderColor:"var(--gc-border-strong)" }}/>
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" className="flex-1 rounded-xl" disabled={busy} onClick={()=>{setShowDeleteConfirm(false);setDeleteInput("");}}>Cancel</Button>
                    <Button className="flex-1 rounded-xl font-semibold" disabled={busy||deleteInput!==group.name}
                      style={{ background:"var(--gc-accent)", color:"#fff" }} onClick={handleDelete}>
                      {busy?"Deleting…":"Delete permanently"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Section>
        )}

        <p className="text-xs text-center pb-8" style={{ color:"var(--gc-text-muted)" }}>
          Your data is stored securely and never shared with advertisers.
        </p>
      </main>
    </div>
  );
}

function Section({ title, children }: { title:string; children:React.ReactNode }) {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background:"var(--gc-surface)", border:"1px solid var(--gc-border)", boxShadow:"var(--shadow-sm)" }}>
      <div className="px-5 py-3 border-b" style={{ borderColor:"var(--gc-border)", background:"var(--gc-bg)" }}>
        <h2 className="text-sm font-semibold" style={{ color:"var(--gc-text-secondary)" }}>{title.toUpperCase()}</h2>
      </div>
      {children}
    </div>
  );
}
