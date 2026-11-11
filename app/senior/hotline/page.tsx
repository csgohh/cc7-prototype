"use client";
import { CheckCircle2, HeartHandshake, Phone, PhoneCall, Siren, Stethoscope } from "lucide-react";
import { useJaga } from "@/lib/store";
import { NURSE_HOTLINE } from "@/lib/mockData";

export default function Hotline() {
  const request = useJaga((s) => s.requestAacCall);
  const requested = useJaga((s) => s.cases.some((c) => c.seniorId === "tan" && c.source === "senior-request" && c.title.startsWith("Mr Tan asked") && c.status !== "resolved"));
  return (
    <div className="space-y-4">
      <h1 className="h1">Call for help</h1>
      <a href="tel:995" className="btn btn-danger !min-h-[84px] !text-3xl"><Siren size={34} aria-hidden /> Emergency 995</a>
      <p className="-mt-2 text-lg">For an ambulance. Call if you have chest pain, cannot breathe, or have fallen.</p>

      <a href={`tel:${NURSE_HOTLINE.replace(/\s/g, "")}`} className="btn btn-primary !min-h-[72px]"><Stethoscope aria-hidden /> Nurse hotline<br />{NURSE_HOTLINE}</a>
      <a href="tel:1767" className="btn btn-primary !min-h-[72px]"><HeartHandshake aria-hidden /> Samaritans of Singapore 1767</a>
      <p className="-mt-2 text-lg">If you feel very sad or alone. Free and private, 24 hours.</p>

      {requested ? (
        <div className="card flex items-center gap-3 border-2 border-teal text-xl" role="status">
          <CheckCircle2 className="shrink-0 text-teal" aria-hidden />
          <p>Request sent. Ms Siti from your AAC will call you soon.</p>
        </div>
      ) : (
        <button className="btn btn-gold !min-h-[72px]" onClick={request}><PhoneCall aria-hidden /> Ask my AAC to call me</button>
      )}
      <p className="flex items-center gap-2 text-base text-navy/70"><Phone size={16} aria-hidden /> Demo: the nurse number is a placeholder. 995 and 1767 are the real numbers.</p>
    </div>
  );
}
