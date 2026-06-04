"use client";
import { use, useState } from "react";
import Link from "next/link";
import { ChevronLeft, Gift, Trash2, LogOut, AlertTriangle, Copy, Check, Calendar, MapPin, Edit2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const MOCK_GROUP = { name:"Marketing Team Secret Santa", exchange_date:"2026-12-19", location:"The Rose & Crown, 7pm", invite_code:"abc12345", organiser_id:"user-1" };
const MOCK_ME_ID = "user-1";
const isOrganiser = MOCK_ME_ID === MOCK_GROUP.organiser_id;

export default function SettingsPage({ params }: { params: Promise<{ group_id:string }> }) {
  const { group_id } = use(params);
  const [editName,          setEditName]          = useState(false);
  const [groupName,         setGroupName]         = useState(MOCK_GROUP.name);
  const [copied,            setCopied]            = useState(false);
  const [showLeaveConfirm,  setShowLeaveConfirm]  = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInput,       setDeleteInput]       = useState("");

  const inviteLink = typeof window!=="undefined" ? `${window.location.origin}/join/${MOCK_GROUP.invite_code}` : `https://www.checkmybasket.co.uk/join/${MOCK_GROUP.invite_code}`;

  async function copyLink() { await navigator.clipboard.writeText(inviteLink); setCopied(true); toast.success("Link copied"); setTimeout(()=>setCopied(false),2000); }
  function handleLeave()  { toast.success("You've left the group"); window.location.href="/"; }
  function handleDelete() {
    if (deleteInput!==MOCK_GROUP.name) { toast.error("Group name doesn't match"); return; }
    toast.success("Group deleted"); window.location.href="/";
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
                    <Button className="h-11 px-4 rounded-xl" style={{ background:"var(--gc-primary)", color:"var(--gc-text-inverse)" }}
                      onClick={()=>{setEditName(false);toast.success("Updated");}}>
                      <CheckCircle2 size={16} strokeWidth={2}/>
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <p className="flex-1 text-sm py-2">{groupName}</p>
                    <Button variant="ghost" size="sm" onClick={()=>setEditName(true)} className="h-8 w-8 p-0 rounded-lg" aria-label="Edit name"><Edit2 size={14} strokeWidth={1.5}/></Button>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3 text-sm" style={{ color:"var(--gc-text-secondary)" }}>
                <Calendar size={14} strokeWidth={1.5} style={{ flexShrink:0 }}/>
                <span>{new Date(MOCK_GROUP.exchange_date).toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"})}</span>
              </div>
              <div className="flex items-center gap-3 text-sm" style={{ color:"var(--gc-text-secondary)" }}>
                <MapPin size={14} strokeWidth={1.5} style={{ flexShrink:0 }}/><span>{MOCK_GROUP.location}</span>
              </div>
            </div>
          </Section>
        )}

        <Section title="Invite link">
          <div className="p-5 space-y-3">
            <p className="text-sm break-all" style={{ color:"var(--gc-primary)", fontFamily:"var(--font-jetbrains-mono)", fontSize:"0.8rem" }}>{inviteLink}</p>
            <Button variant="outline" onClick={copyLink} className="w-full h-10 rounded-xl text-sm font-medium"
              style={{ borderColor:copied?"var(--gc-success)":"var(--gc-border-strong)", color:copied?"var(--gc-success)":"var(--gc-text-primary)" }}>
              {copied?<><Check size={15} strokeWidth={2} className="mr-2"/>Copied</>:<><Copy size={15} strokeWidth={1.5} className="mr-2"/>Copy invite link</>}
            </Button>
          </div>
        </Section>

        <Section title="Your data">
          <div className="divide-y" style={{ borderColor:"var(--gc-border)" }}>
            {[
              { icon:Gift, label:"Your wishlist",    desc:"Delete all your wishlist items", action:"Clear wishlist" },
            ].map(({ icon:Icon, label, desc, action }) => (
              <div key={label} className="px-5 py-4 flex items-center gap-3">
                <Icon size={16} strokeWidth={1.5} style={{ color:"var(--gc-text-muted)", flexShrink:0 }}/>
                <div className="flex-1 min-w-0"><p className="text-sm font-medium">{label}</p><p className="text-xs" style={{ color:"var(--gc-text-muted)" }}>{desc}</p></div>
                <Button variant="outline" size="sm" className="h-8 px-3 text-xs rounded-lg" style={{ borderColor:"var(--gc-border-strong)" }}
                  onClick={()=>toast.success("Done")}>{action}</Button>
              </div>
            ))}
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
                    <Button variant="outline" className="flex-1 rounded-xl" onClick={()=>setShowLeaveConfirm(false)}>Cancel</Button>
                    <Button className="flex-1 rounded-xl font-semibold" style={{ background:"var(--gc-accent)", color:"#fff" }} onClick={handleLeave}>Yes, leave</Button>
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
                    <Label htmlFor="delete-confirm" className="text-sm font-medium mb-2 block">Type <strong>{MOCK_GROUP.name}</strong> to confirm</Label>
                    <Input id="delete-confirm" placeholder={MOCK_GROUP.name} value={deleteInput} onChange={e=>setDeleteInput(e.target.value)}
                      className="h-11 rounded-xl mb-3" style={{ borderColor:"var(--gc-border-strong)" }}/>
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" className="flex-1 rounded-xl" onClick={()=>{setShowDeleteConfirm(false);setDeleteInput("");}}>Cancel</Button>
                    <Button className="flex-1 rounded-xl font-semibold" disabled={deleteInput!==MOCK_GROUP.name}
                      style={{ background:"var(--gc-accent)", color:"#fff" }} onClick={handleDelete}>Delete permanently</Button>
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
