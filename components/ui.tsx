"use client";
import { ShieldAlert, FlaskConical } from "lucide-react";
import type { Urgency } from "@/lib/types";
import { URGENCY_LABEL } from "@/lib/selectors";

export function DemoTag({ className = "" }: { className?: string }) {
  return (
    <span className={`chip bg-gold/30 !py-0.5 !text-sm uppercase tracking-wide text-navy ${className}`}>
      <FlaskConical size={14} aria-hidden /> Prototype · Demo data
    </span>
  );
}

export function Loading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center text-xl text-teal" role="status">
      Loading…
    </div>
  );
}

/** Colour + text label for each urgency level (never colour alone). */
const URGENCY_STYLE: Record<Urgency, string> = {
  emergency: "bg-alert text-white",
  urgent: "bg-amber text-white",
  "follow-up": "bg-gold text-navy",
  wellbeing: "bg-teal text-white",
};

export function UrgencyBadge({ urgency }: { urgency: Urgency }) {
  return <span className={`chip ${URGENCY_STYLE[urgency]}`}>{URGENCY_LABEL[urgency]}</span>;
}

export const URGENCY_BORDER: Record<Urgency, string> = {
  emergency: "border-l-alert",
  urgent: "border-l-amber",
  "follow-up": "border-l-gold",
  wellbeing: "border-l-teal",
};

/** Big on/off switch with a text label, used on the Privacy and Settings screens. */
export function Toggle({
  checked, onChange, label, hint,
}: { checked: boolean; onChange: (v: boolean) => void; label: string; hint?: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex min-h-[72px] w-full items-center justify-between gap-4 rounded-2xl border-2 border-panel bg-white p-4 text-left"
    >
      <span>
        <span className="block text-xl font-medium">{label}</span>
        {hint && <span className="block text-lg text-navy/80">{hint}</span>}
      </span>
      <span className={`flex shrink-0 items-center gap-2 rounded-full px-3 py-2 text-lg font-medium ${checked ? "bg-teal text-white" : "bg-panel text-navy"}`}>
        {checked ? "ON" : "OFF"}
      </span>
    </button>
  );
}

export function ScamWarning() {
  return (
    <div className="flex gap-3 rounded-2xl border-2 border-gold bg-gold/15 p-4" role="note">
      <ShieldAlert className="mt-1 shrink-0 text-amber" aria-hidden />
      <p className="text-lg">
        <strong>Scam warning:</strong> KampungLink will never ask for your NRIC, bank details or OTP.
        If anyone does, hang up and call your AAC.
      </p>
    </div>
  );
}
