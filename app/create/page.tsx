"use client";
import { BasketMark } from "@/components/receipt/logo";
import { SITE_ORIGIN } from "@/lib/site";

import { userError } from "@/lib/user-errors";
import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Gift, Copy, MessageCircle, QrCode, ChevronLeft, Check, Share2, ArrowRight } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { trackCreation } from "@/lib/analytics";

const EmailRecovery = dynamic(() => import("@/components/email-recovery").then(value => value.EmailRecovery), {
  loading: () => <div className="min-h-48 skeleton" role="status" aria-label="Loading email recovery options" />,
});
const QRCodeSvg = dynamic(() => import("@/components/qr-code").then(value => value.QRCodeSvg), {
  loading: () => <div className="h-32 w-32 skeleton" role="status" aria-label="Loading invite QR code" />,
});

const BUDGET_PRESETS = [500, 1000, 1500, 2000, 2500] as const;
interface FormData { groupName: string; budget: number; customBudget: string; exchangeDate: string; location: string; yourName: string; email: string; }

export default function CreatePage() {
  const [step, setStep]       = useState<"form"|"share">("form");
  const [inviteCode, setInviteCode] = useState("");
  const [groupId, setGroupId] = useState("");
  const [busy, setBusy]       = useState(false);
  const [copied, setCopied]   = useState(false);
  const [sharing, setSharing] = useState(false);
  const shareInProgress = useRef(false);
  const [form, setForm]       = useState<FormData>({ groupName:"", budget:-1, customBudget:"", exchangeDate:"", location:"", yourName:"", email:"" });
  const [errors, setErrors]   = useState<Partial<Record<keyof FormData,string>>>({});

  const inviteLink = typeof window !== "undefined"
    ? `${window.location.origin}/join/${inviteCode}`
    : `${SITE_ORIGIN}/join/${inviteCode}`;

  function validate() {
    const e: typeof errors = {};
    if (!form.groupName.trim()) e.groupName = "Please name your group";
    if (!form.yourName.trim())  e.yourName  = "Please enter your name";
    if (form.budget === 0) { const b = parseInt(form.customBudget)*100; if (isNaN(b)||b<=0) e.customBudget="Please enter a valid amount"; }
    if (form.email.trim() && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email.trim())) e.email = "Please enter a valid email address or leave it blank";
    setErrors(e);
    const firstInvalid = (["groupName", "customBudget", "yourName", "email"] as const).find(key => e[key]);
    const inputIds = { groupName: "group-name", customBudget: "custom-budget", yourName: "organiser-name", email: "email" };
    if (firstInvalid) document.getElementById(inputIds[firstInvalid])?.focus();
    return !firstInvalid;
  }

  async function handleCreate() {
    if (!validate() || busy) return;
    setBusy(true);
    try {
      const [{ ensureSession }, { createClient }] = await Promise.all([import("@/lib/supabase/auth"), import("@/lib/supabase/client")]);
      await ensureSession();
      const budgetPence = form.budget === -1 ? null
        : form.budget === 0 ? Math.round(parseFloat(form.customBudget) * 100)
        : form.budget;
      const supabase = createClient();
      {
        const { error: emailError } = await supabase.rpc("set_my_email", { p_email: form.email.trim() });
        if (emailError) throw new Error("Could not save your email. Please try again or leave it blank.");
      }
      const { data, error } = await supabase.rpc("create_group", {
        p_name: form.groupName,
        // Retain the existing default required by the group-creation API.
        p_mode: "friends",
        p_budget_amount: budgetPence,
        p_exchange_date: form.exchangeDate || null,
        p_location: form.location || null,
        p_organiser_name: form.yourName,
      });
      if (error) throw new Error(error.message);
      trackCreation("draw_created");
      setInviteCode(data.invite_code);
      setGroupId(data.group_id);
      setStep("share");
    } catch (err) {
      toast.error(userError(err, "create your draw"));
    } finally {
      setBusy(false);
    }
  }
  async function copyLink() {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true); toast.success("Link copied"); setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy the link. Select the invite link below and copy it manually.");
    }
  }
  async function shareInvite() {
    if (shareInProgress.current) return;
    if (typeof navigator.share !== "function") {
      await copyLink();
      return;
    }
    shareInProgress.current = true;
    setSharing(true);
    try {
      await navigator.share({
        title: `${form.groupName} — CheckMyBasket`,
        text: "Join our Secret Santa draw!",
        url: inviteLink,
      });
    } catch (error) {
      // Dismissing the device's share menu is a normal choice.
      if (!(error instanceof Error && error.name === "AbortError")) {
        toast.error("Could not open sharing. Use WhatsApp or copy the invite link below.");
      }
    } finally {
      shareInProgress.current = false;
      setSharing(false);
    }
  }

  function shareWhatsApp() {
    window.open(`https://wa.me/?text=${encodeURIComponent(`Join our Secret Santa! 🎅\n${inviteLink}`)}`, "_blank", "noopener");
  }

  if (step === "share") return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-4 py-12 bg-[var(--cmb-bg)]">
      <div className="w-full max-w-sm text-center">
        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 animate-scale-in bg-[var(--cmb-primary)] shadow-[var(--shadow-lg)]">
          <Check size={36} strokeWidth={2} className="text-[var(--cmb-text-inverse)]" />
        </div>
        <h1 className="text-2xl font-bold mb-1 animate-fade-up font-display">{form.groupName} is ready</h1>
        <p className="text-sm mb-8 animate-fade-up animate-delay-100 text-[var(--cmb-text-secondary)]">Share the link below to invite your group</p>

        <div className="mb-6 space-y-3 animate-fade-up animate-delay-200">
          <Button onClick={shareInvite} disabled={sharing} size="lg" className="w-full h-14 rounded-xl font-semibold bg-[var(--cmb-primary)] text-[var(--cmb-text-inverse)]">
            <Share2 size={20} strokeWidth={1.5} className="mr-2" />
            {sharing ? "Sharing…" : typeof navigator !== "undefined" && typeof navigator.share === "function" ? "Share invite" : "Copy invite link"}
          </Button>
          <Link href={`/g/${groupId}`} className={cn(buttonVariants({ variant: "outline", size: "lg" }), "w-full h-12 rounded-xl font-semibold border-[var(--cmb-border-strong)]")}>
            Go to your group <ArrowRight size={18} strokeWidth={1.5} className="ml-2" />
          </Link>
        </div>

        <div className="min-h-48"><EmailRecovery groupId={groupId} /></div>

        {/* Direct WhatsApp sharing remains available on every device. */}
        <Button onClick={shareWhatsApp} size="lg" className="w-full h-14 rounded-xl font-semibold mb-3 animate-fade-up animate-delay-200 text-white"
          style={{ background:"#25D366" }}>
          <MessageCircle size={20} strokeWidth={1.5} className="mr-2" /> Share via WhatsApp
        </Button>

        {/* Copy link — secondary */}
        <div className="rounded-2xl p-5 mb-4 text-left animate-fade-up animate-delay-300 bg-[var(--cmb-surface)] border border-[var(--cmb-border)] shadow-[var(--shadow-md)]">
          <p className="text-xs font-medium mb-2 text-[var(--cmb-text-muted)]">OR COPY THE LINK</p>
          <p className="text-sm break-all mb-3 text-[var(--cmb-primary)]" style={{ fontFamily:"var(--font-ibm-plex-mono)", fontSize:"0.8rem" }}>{inviteLink}</p>
          <Button onClick={copyLink} variant="outline" className="w-full h-10 rounded-xl font-medium text-sm"
            style={{ borderColor:copied?"var(--cmb-success)":"var(--cmb-border-strong)", color:copied?"var(--cmb-success)":"var(--cmb-text-primary)" }}>
            {copied ? <><Check size={15} strokeWidth={2} className="mr-2"/>Copied</> : <><Copy size={15} strokeWidth={1.5} className="mr-2"/>Copy link</>}
          </Button>
        </div>

        {/* QR code */}
        <div className="rounded-2xl p-5 text-center animate-fade-up animate-delay-400 bg-[var(--cmb-surface)] border border-[var(--cmb-border)]">
          <QrCode size={18} strokeWidth={1.5} className="mx-auto mb-1 text-[var(--cmb-text-muted)]" />
          <p className="text-xs mb-3 text-[var(--cmb-text-muted)]">QR code for in-person sharing</p>
          <div className="w-32 h-32 rounded-xl mx-auto overflow-hidden bg-white border border-[var(--cmb-border)]">
            <QRCodeSvg value={inviteLink} size={126} />
          </div>
        </div>

      </div>
    </div>
  );

  return (
    <div className="min-h-dvh bg-[var(--cmb-bg)]">
      <header className="sticky top-0 z-30 border-b border-[var(--cmb-border)]" style={{ background:"var(--cmb-header-bg)" }}>
        <div className="max-w-xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/" aria-label="Back to home" className={buttonVariants({ variant: "ghost", size: "sm", className: "h-11 w-11 p-0 rounded-lg" })}><ChevronLeft size={20} strokeWidth={1.5}/></Link>
          <div className="flex items-center gap-2 text-[var(--cmb-primary)]">
            <BasketMark size={20} />
            <span className="font-semibold font-display">CheckMyBasket</span>
          </div>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 py-8 pb-28 space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2 font-display">Create your draw</h1>
          <p className="text-[var(--cmb-text-secondary)]">Fill in the details below, then share the invite link with your group.</p>
        </div>

        {/* Group name */}
        <Field htmlFor="group-name" label="Group name" error={errors.groupName} required>
          <Input id="group-name" aria-required="true" aria-invalid={!!errors.groupName} aria-describedby={errors.groupName ? "group-name-error" : undefined} placeholder="e.g. Office Secret Santa 2026" value={form.groupName}
            onChange={e => setForm(f => ({ ...f, groupName:e.target.value }))}
            className="h-12 text-base rounded-xl" style={{ borderColor:errors.groupName?"var(--cmb-error)":"var(--cmb-border-strong)" }}/>
        </Field>

        {/* Budget — optional */}
        <div>
          <Label className="text-base font-medium mb-1 block">Budget per person</Label>
          <p className="text-sm mb-3 text-[var(--cmb-text-muted)]">Optional — this is per person, everyone buys one gift</p>
          <div className="flex gap-2 flex-wrap">
            {([[-1,"No budget"],...BUDGET_PRESETS.map(p=>[p,`£${p/100}`]),[0,"Custom"]] as [number,string][]).map(([val,label]) => (
              <button key={val} type="button" onClick={() => setForm(f => ({ ...f, budget:val, customBudget:"" }))}
                className={cn("rounded-full px-4 py-2 text-sm font-medium border-2 transition-all duration-150",
                  form.budget===val?"border-[var(--cmb-primary)] bg-[var(--cmb-primary)] text-[var(--cmb-text-inverse)]":"border-[var(--cmb-border)] bg-[var(--cmb-surface)]")}>
                {label}
              </button>
            ))}
          </div>
          {form.budget === 0 && (
            <div className="mt-3 relative">
              <Label htmlFor="custom-budget" className="sr-only">Custom budget in pounds</Label>
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--cmb-text-secondary)]">£</span>
              <Input id="custom-budget" aria-invalid={!!errors.customBudget} aria-describedby={errors.customBudget ? "custom-budget-error" : undefined} type="number" inputMode="decimal" placeholder="Enter amount" value={form.customBudget}
                onChange={e => setForm(f => ({ ...f, customBudget:e.target.value }))}
                className="h-12 pl-7 text-base rounded-xl" style={{ borderColor:errors.customBudget?"var(--cmb-error)":"var(--cmb-border-strong)" }}/>
              {errors.customBudget && <p id="custom-budget-error" role="alert" className="mt-1 text-sm text-[var(--cmb-error)]">{errors.customBudget}</p>}
            </div>
          )}
        </div>

        <Field htmlFor="exchange-date" label="Gift exchange day" hint="Optional">
          <Input id="exchange-date" aria-describedby="exchange-date-hint" type="date" value={form.exchangeDate} onChange={e => setForm(f => ({ ...f, exchangeDate:e.target.value }))}
            className="h-12 text-base rounded-xl border border-[var(--cmb-border-strong)]"/>
        </Field>
        <Field htmlFor="exchange-location" label="Exchange location" hint="Optional">
          <Input id="exchange-location" aria-describedby="exchange-location-hint" placeholder="e.g. The Rose & Crown, 7pm" value={form.location} onChange={e => setForm(f => ({ ...f, location:e.target.value }))}
            className="h-12 text-base rounded-xl border border-[var(--cmb-border-strong)]"/>
        </Field>
        <Field htmlFor="organiser-name" label="Your name" error={errors.yourName} required>
          <Input id="organiser-name" aria-required="true" aria-invalid={!!errors.yourName} aria-describedby={errors.yourName ? "organiser-name-error" : undefined} placeholder="What should we call you?" value={form.yourName} onChange={e => setForm(f => ({ ...f, yourName:e.target.value }))}
            className="h-12 text-base rounded-xl" style={{ borderColor:errors.yourName?"var(--cmb-error)":"var(--cmb-border-strong)" }}/>
        </Field>
        <div>
          <Label htmlFor="email" className="text-base font-medium mb-1.5 block">Email (optional)</Label>
          <p id="email-hint" className="text-sm mb-2 text-[var(--cmb-text-muted)]">Get an email when names are drawn. Private from your group. Leave blank to skip.</p>
          <Input id="email" type="email" inputMode="email" autoComplete="email" placeholder="you@example.com" value={form.email}
            onChange={e => setForm(f => ({ ...f, email:e.target.value }))} aria-describedby={errors.email ? "email-hint email-error" : "email-hint"} aria-invalid={!!errors.email}
            className="h-12 text-base rounded-xl border border-[var(--cmb-border-strong)]"/>
          {errors.email && <p id="email-error" role="alert" className="mt-1 text-sm text-[var(--cmb-error)]">{errors.email}</p>}
          <p className="text-xs mt-2 text-[var(--cmb-text-muted)]">This updates your notification email across your groups; leaving it blank turns notifications off. Notifications require email verification after joining; creating and using your group does not require email. <Link href="/privacy" className="underline">Privacy policy</Link></p>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 z-20 px-4 pt-4 border-t safe-bottom bg-[var(--cmb-bg)] border-[var(--cmb-border)]">
        <div className="max-w-xl mx-auto">
          <Button onClick={handleCreate} disabled={busy} size="lg" className="w-full h-14 text-base rounded-xl font-semibold bg-[var(--cmb-primary)] text-[var(--cmb-text-inverse)]">
            <Gift size={20} strokeWidth={1.5} className="mr-2"/> {busy ? "Creating…" : "Create your draw"}
          </Button>
          <p className="text-center mt-2 text-xs pb-2 text-[var(--cmb-text-muted)]">Free forever. No account needed.</p>
        </div>
      </div>
    </div>
  );
}

function Field({ htmlFor, label, children, hint, error, required }: { htmlFor:string; label:string; children:React.ReactNode; hint?:string; error?:string; required?:boolean }) {
  return (
    <div>
      <Label htmlFor={htmlFor} className="text-base font-medium mb-1.5 flex items-center gap-1">
        {label}{required && <span className="text-[var(--cmb-accent)]">*</span>}
      </Label>
      {hint && <p id={`${htmlFor}-hint`} className="text-sm mb-2 text-[var(--cmb-text-muted)]">{hint}</p>}
      {children}
      {error && <p id={`${htmlFor}-error`} role="alert" className="mt-1 text-sm text-[var(--cmb-error)]">{error}</p>}
    </div>
  );
}
