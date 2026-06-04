"use client";
import { useState } from "react";
import Link from "next/link";
import { Gift, Copy, MessageCircle, QrCode, ChevronLeft, Check, Heart, Briefcase, GraduationCap, Smile } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn, generateInviteCode } from "@/lib/utils";
import type { GroupMode } from "@/lib/types";
import { toast } from "sonner";

const BUDGET_PRESETS = [500, 1000, 1500, 2000, 2500] as const;
const GROUP_MODES: { value: GroupMode; label: string; icon: React.ElementType; desc: string }[] = [
  { value: "family",    label: "Family",    icon: Heart,          desc: "Parents, kids, extended family" },
  { value: "friends",   label: "Friends",   icon: Smile,          desc: "Friend groups, flatmates" },
  { value: "workplace", label: "Workplace", icon: Briefcase,      desc: "Colleagues and office teams" },
  { value: "students",  label: "Students",  icon: GraduationCap,  desc: "Uni friends, class groups" },
];

interface FormData { groupName: string; mode: GroupMode; budget: number; customBudget: string; exchangeDate: string; location: string; yourName: string; }

export default function CreatePage() {
  const [step, setStep]       = useState<"form"|"share">("form");
  const [inviteCode]          = useState(generateInviteCode);
  const [copied, setCopied]   = useState(false);
  const [form, setForm]       = useState<FormData>({ groupName:"", mode:"friends", budget:-1, customBudget:"", exchangeDate:"", location:"", yourName:"" });
  const [errors, setErrors]   = useState<Partial<Record<keyof FormData,string>>>({});

  const inviteLink = typeof window !== "undefined"
    ? `${window.location.origin}/join/${inviteCode}`
    : `https://www.checkmybasket.co.uk/join/${inviteCode}`;

  function validate() {
    const e: typeof errors = {};
    if (!form.groupName.trim()) e.groupName = "Please name your group";
    if (!form.yourName.trim())  e.yourName  = "Please enter your name";
    if (form.budget === 0) { const b = parseInt(form.customBudget)*100; if (isNaN(b)||b<=0) e.customBudget="Please enter a valid amount"; }
    setErrors(e); return Object.keys(e).length === 0;
  }

  function handleCreate() { if (!validate()) return; setStep("share"); }
  async function copyLink() {
    await navigator.clipboard.writeText(inviteLink);
    setCopied(true); toast.success("Link copied"); setTimeout(() => setCopied(false), 2000);
  }
  function shareWhatsApp() {
    window.open(`https://wa.me/?text=${encodeURIComponent(`Join our Secret Santa! 🎅\n${inviteLink}`)}`, "_blank", "noopener");
  }

  if (step === "share") return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-4 py-12" style={{ background:"var(--gc-bg)" }}>
      <div className="w-full max-w-sm text-center">
        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 animate-scale-in" style={{ background:"var(--gc-primary)", boxShadow:"var(--shadow-lg)" }}>
          <Check size={36} strokeWidth={2} style={{ color:"var(--gc-text-inverse)" }} />
        </div>
        <h1 className="text-2xl font-bold mb-1 animate-fade-up" style={{ fontFamily:"var(--font-fraunces)" }}>{form.groupName} is ready</h1>
        <p className="text-sm mb-8 animate-fade-up animate-delay-100" style={{ color:"var(--gc-text-secondary)" }}>Share the link below to invite your group</p>

        {/* WhatsApp — primary */}
        <Button onClick={shareWhatsApp} size="lg" className="w-full h-14 rounded-xl font-semibold mb-3 animate-fade-up animate-delay-200"
          style={{ background:"#25D366", color:"#fff" }}>
          <MessageCircle size={20} strokeWidth={1.5} className="mr-2" /> Share via WhatsApp
        </Button>

        {/* Copy link — secondary */}
        <div className="rounded-2xl p-5 mb-4 text-left animate-fade-up animate-delay-300"
          style={{ background:"var(--gc-surface)", border:"1px solid var(--gc-border)", boxShadow:"var(--shadow-md)" }}>
          <p className="text-xs font-medium mb-2" style={{ color:"var(--gc-text-muted)" }}>OR COPY THE LINK</p>
          <p className="text-sm break-all mb-3" style={{ color:"var(--gc-primary)", fontFamily:"var(--font-jetbrains-mono)", fontSize:"0.8rem" }}>{inviteLink}</p>
          <Button onClick={copyLink} variant="outline" className="w-full h-10 rounded-xl font-medium text-sm"
            style={{ borderColor:copied?"var(--gc-success)":"var(--gc-border-strong)", color:copied?"var(--gc-success)":"var(--gc-text-primary)" }}>
            {copied ? <><Check size={15} strokeWidth={2} className="mr-2"/>Copied</> : <><Copy size={15} strokeWidth={1.5} className="mr-2"/>Copy link</>}
          </Button>
        </div>

        {/* QR placeholder */}
        <div className="rounded-2xl p-5 text-center animate-fade-up animate-delay-400" style={{ background:"var(--gc-surface)", border:"1px solid var(--gc-border)" }}>
          <QrCode size={18} strokeWidth={1.5} className="mx-auto mb-1" style={{ color:"var(--gc-text-muted)" }} />
          <p className="text-xs mb-3" style={{ color:"var(--gc-text-muted)" }}>QR code for in-person sharing</p>
          <div className="w-32 h-32 rounded-xl mx-auto flex items-center justify-center skeleton">
            <QrCode size={56} strokeWidth={0.75} style={{ color:"var(--gc-border)" }} />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-dvh" style={{ background:"var(--gc-bg)" }}>
      <header className="sticky top-0 z-30 border-b" style={{ borderColor:"var(--gc-border)", background:"rgba(255,248,240,0.92)", backdropFilter:"blur(12px)" }}>
        <div className="max-w-xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/"><Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-lg"><ChevronLeft size={20} strokeWidth={1.5}/></Button></Link>
          <div className="flex items-center gap-2" style={{ color:"var(--gc-primary)" }}>
            <Gift size={20} strokeWidth={1.5}/>
            <span className="font-semibold" style={{ fontFamily:"var(--font-fraunces)" }}>CheckMyBasket</span>
          </div>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 py-8 pb-28 space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2" style={{ fontFamily:"var(--font-fraunces)" }}>Create your draw</h1>
          <p style={{ color:"var(--gc-text-secondary)" }}>Fill in the details below, then share the invite link with your group.</p>
        </div>

        {/* Group name */}
        <Field label="Group name" error={errors.groupName} required>
          <Input id="group-name" placeholder="e.g. Office Secret Santa 2026" value={form.groupName}
            onChange={e => setForm(f => ({ ...f, groupName:e.target.value }))}
            className="h-12 text-base rounded-xl" style={{ borderColor:errors.groupName?"var(--gc-error)":"var(--gc-border-strong)" }}/>
        </Field>

        {/* Mode */}
        <div>
          <Label className="text-base font-medium mb-3 block">Group type</Label>
          <div className="grid grid-cols-2 gap-3">
            {GROUP_MODES.map(({ value, label, icon:Icon, desc }) => (
              <button key={value} type="button" onClick={() => setForm(f => ({ ...f, mode:value }))}
                className={cn("rounded-xl p-4 text-left border-2 transition-all duration-150", form.mode===value?"border-[var(--gc-primary)]":"border-[var(--gc-border)]")}
                style={{ background:form.mode===value?"rgba(27,67,50,0.06)":"var(--gc-surface)" }}>
                <Icon size={20} strokeWidth={1.5} className="mb-2" style={{ color:form.mode===value?"var(--gc-primary)":"var(--gc-text-muted)" }}/>
                <p className="font-semibold text-sm">{label}</p>
                <p className="text-xs mt-0.5" style={{ color:"var(--gc-text-muted)" }}>{desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Budget — optional */}
        <div>
          <Label className="text-base font-medium mb-1 block">Budget per person</Label>
          <p className="text-sm mb-3" style={{ color:"var(--gc-text-muted)" }}>Optional — this is per person, everyone buys one gift</p>
          <div className="flex gap-2 flex-wrap">
            {([[-1,"No budget"],...BUDGET_PRESETS.map(p=>[p,`£${p/100}`]),[0,"Custom"]] as [number,string][]).map(([val,label]) => (
              <button key={val} type="button" onClick={() => setForm(f => ({ ...f, budget:val, customBudget:"" }))}
                className={cn("rounded-full px-4 py-2 text-sm font-medium border-2 transition-all duration-150",
                  form.budget===val?"border-[var(--gc-primary)] bg-[var(--gc-primary)] text-[var(--gc-text-inverse)]":"border-[var(--gc-border)] bg-[var(--gc-surface)]")}>
                {label}
              </button>
            ))}
          </div>
          {form.budget === 0 && (
            <div className="mt-3 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color:"var(--gc-text-secondary)" }}>£</span>
              <Input type="number" inputMode="decimal" placeholder="Enter amount" value={form.customBudget}
                onChange={e => setForm(f => ({ ...f, customBudget:e.target.value }))}
                className="h-12 pl-7 text-base rounded-xl" style={{ borderColor:errors.customBudget?"var(--gc-error)":"var(--gc-border-strong)" }}/>
              {errors.customBudget && <p className="mt-1 text-sm" style={{ color:"var(--gc-error)" }}>{errors.customBudget}</p>}
            </div>
          )}
        </div>

        <Field label="Gift exchange day" hint="Optional">
          <Input type="date" value={form.exchangeDate} onChange={e => setForm(f => ({ ...f, exchangeDate:e.target.value }))}
            className="h-12 text-base rounded-xl" style={{ borderColor:"var(--gc-border-strong)" }}/>
        </Field>
        <Field label="Exchange location" hint="Optional">
          <Input placeholder="e.g. The Rose & Crown, 7pm" value={form.location} onChange={e => setForm(f => ({ ...f, location:e.target.value }))}
            className="h-12 text-base rounded-xl" style={{ borderColor:"var(--gc-border-strong)" }}/>
        </Field>
        <Field label="Your name" error={errors.yourName} required>
          <Input placeholder="What should we call you?" value={form.yourName} onChange={e => setForm(f => ({ ...f, yourName:e.target.value }))}
            className="h-12 text-base rounded-xl" style={{ borderColor:errors.yourName?"var(--gc-error)":"var(--gc-border-strong)" }}/>
        </Field>
      </main>

      <div className="fixed bottom-0 left-0 right-0 z-20 px-4 pt-4 border-t safe-bottom" style={{ background:"var(--gc-bg)", borderColor:"var(--gc-border)" }}>
        <div className="max-w-xl mx-auto">
          <Button onClick={handleCreate} size="lg" className="w-full h-14 text-base rounded-xl font-semibold" style={{ background:"var(--gc-primary)", color:"var(--gc-text-inverse)" }}>
            <Gift size={20} strokeWidth={1.5} className="mr-2"/> Create your draw
          </Button>
          <p className="text-center mt-2 text-xs pb-2" style={{ color:"var(--gc-text-muted)" }}>Free forever. No account needed.</p>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children, hint, error, required }: { label:string; children:React.ReactNode; hint?:string; error?:string; required?:boolean }) {
  return (
    <div>
      <Label className="text-base font-medium mb-1.5 flex items-center gap-1">
        {label}{required && <span style={{ color:"var(--gc-accent)" }}>*</span>}
      </Label>
      {hint && <p className="text-sm mb-2" style={{ color:"var(--gc-text-muted)" }}>{hint}</p>}
      {children}
      {error && <p className="mt-1 text-sm" style={{ color:"var(--gc-error)" }}>{error}</p>}
    </div>
  );
}
