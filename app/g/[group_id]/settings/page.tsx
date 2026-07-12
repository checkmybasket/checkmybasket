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
    <div className="min-h-dvh flex items-center justify-center bg-[var(--cmb-bg)]">
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
    <div className="min-h-dvh bg-[var(--cmb-bg)]">
      <header className="sticky top-0 z-30 border-b border-[var(--cmb-border)]" style={{ background:"rgba(255,248,240,0.92)", backdropFilter:"blur(12px)" }}>
        <div className="max-w-xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link href={`/g/${group_id}`}><Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-lg"><ChevronLeft size={20} strokeWidth={1.5}/></Button></Link>
          <div className="flex items-center gap-2 text-[var(--cmb-primary)]">
            <Gift size={18} strokeWidth={1.5}/><span className="font-semibold font-display">Group settings</span>
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
                    <Input value={groupName} onChange={e=>setGroupName(e.target.value)} className="h-11 rounded-xl flex-1 border border-[var(--cmb-border-strong)]"/>
                    <Button className="h-11 px-4 rounded-xl bg-[var(--cmb-primary)] text-[var(--cmb-text-inverse)]" disabled={busy}
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
                <div className="flex items-center gap-3 text-sm text-[var(--cmb-text-secondary)]">
                  <Calendar size={14} strokeWidth={1.5} className="shrink-0"/>
                  <span>{new Date(group.exchange_date).toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"})}</span>
                </div>
              )}
              {group.exchange_location && (
                <div className="flex items-center gap-3 text-sm text-[var(--cmb-text-secondary)]">
                  <MapPin size={14} strokeWidth={1.5} className="shrink-0"/><span>{group.exchange_location}</span>
                </div>
              )}
            </div>
          </Section>
        )}

        <Section title="Invite link">
          <div className="p-5 space-y-3">
            <p className="text-sm break-all text-[var(--cmb-primary)]" style={{ fontFamily:"var(--font-jetbrains-mono)", fontSize:"0.8rem" }}>{inviteLink}</p>
            <div className="w-32 h-32 rounded-xl mx-auto overflow-hidden bg-white border border-[var(--cmb-border)]">
              <QRCodeSvg value={inviteLink} size={126} />
            </div>
            <Button variant="outline" onClick={copyLink} className="w-full h-10 rounded-xl text-sm font-medium"
              style={{ borderColor:copied?"var(--cmb-success)":"var(--cmb-border-strong)", color:copied?"var(--cmb-success)":"var(--cmb-text-primary)" }}>
              {copied?<><Check size={15} strokeWidth={2} className="mr-2"/>Copied</>:<><Copy size={15} strokeWidth={1.5} className="mr-2"/>Copy invite link</>}
            </Button>
          </div>
        </Section>

        <Section title="Your data">
          <div className="divide-y border-[var(--cmb-border)]">
            <div className="px-5 py-4 flex items-center gap-3">
              <Gift size={16} strokeWidth={1.5} className="text-[var(--cmb-text-muted)] shrink-0"/>
              <div className="flex-1 min-w-0"><p className="text-sm font-medium">Your wishlist</p><p className="text-xs text-[var(--cmb-text-muted)]">Delete all your wishlist items</p></div>
              <Button variant="outline" size="sm" className="h-8 px-3 text-xs rounded-lg border border-[var(--cmb-border-strong)]"
                disabled={busy} onClick={clearWishlist}>Clear wishlist</Button>
            </div>
          </div>
        </Section>

        {!isOrganiser && (
          <Section title="Leave group">
            <div className="p-5">
              {!showLeaveConfirm ? (
                <Button variant="outline" className="w-full h-11 rounded-xl font-medium border border-[var(--cmb-accent)] text-[var(--cmb-accent)]" onClick={()=>setShowLeaveConfirm(true)}>
                  <LogOut size={16} strokeWidth={1.5} className="mr-2"/> Leave this group
                </Button>
              ) : (
                <div className="space-y-3">
                  <div className="rounded-xl p-4 flex gap-2" style={{ background:"rgba(193,18,31,0.06)", border:"1px solid rgba(193,18,31,0.2)" }}>
                    <AlertTriangle size={16} strokeWidth={1.5} className="text-[var(--cmb-error)] shrink-0"/>
                    <p className="text-sm text-[var(--cmb-error)]">You&apos;ll be removed and your wishlist deleted. This can&apos;t be undone.</p>
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" className="flex-1 rounded-xl" disabled={busy} onClick={()=>setShowLeaveConfirm(false)}>Cancel</Button>
                    <Button className="flex-1 rounded-xl font-semibold bg-[var(--cmb-accent)] text-white" disabled={busy} onClick={handleLeave}>
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
                  <p className="text-sm mb-4 text-[var(--cmb-text-secondary)]">Permanently deletes the group, all wishlists, messages, and prediction data. Cannot be undone.</p>
                  <Button variant="outline" className="w-full h-11 rounded-xl font-medium border border-[var(--cmb-accent)] text-[var(--cmb-accent)]" onClick={()=>setShowDeleteConfirm(true)}>
                    <Trash2 size={16} strokeWidth={1.5} className="mr-2"/> Delete this group
                  </Button>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="rounded-xl p-4 flex gap-2" style={{ background:"rgba(193,18,31,0.06)", border:"1px solid rgba(193,18,31,0.2)" }}>
                    <AlertTriangle size={16} strokeWidth={1.5} className="text-[var(--cmb-error)] shrink-0"/>
                    <p className="text-sm text-[var(--cmb-error)]">This permanently deletes all data for all members. Cannot be undone.</p>
                  </div>
                  <div>
                    <Label htmlFor="delete-confirm" className="text-sm font-medium mb-2 block">Type <strong>{group.name}</strong> to confirm</Label>
                    <Input id="delete-confirm" placeholder={group.name} value={deleteInput} onChange={e=>setDeleteInput(e.target.value)}
                      className="h-11 rounded-xl mb-3 border border-[var(--cmb-border-strong)]"/>
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" className="flex-1 rounded-xl" disabled={busy} onClick={()=>{setShowDeleteConfirm(false);setDeleteInput("");}}>Cancel</Button>
                    <Button className="flex-1 rounded-xl font-semibold bg-[var(--cmb-accent)] text-white" disabled={busy||deleteInput!==group.name}
                      onClick={handleDelete}>
                      {busy?"Deleting…":"Delete permanently"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Section>
        )}

        <p className="text-xs text-center pb-8 text-[var(--cmb-text-muted)]">
          Your data is stored securely and never shared with advertisers.
        </p>
      </main>
    </div>
  );
}

function Section({ title, children }: { title:string; children:React.ReactNode }) {
  return (
    <div className="rounded-2xl overflow-hidden bg-[var(--cmb-surface)] border border-[var(--cmb-border)] shadow-[var(--shadow-sm)]">
      <div className="px-5 py-3 border-b border-[var(--cmb-border)] bg-[var(--cmb-bg)]">
        <h2 className="text-sm font-semibold text-[var(--cmb-text-secondary)]">{title.toUpperCase()}</h2>
      </div>
      {children}
    </div>
  );
}
