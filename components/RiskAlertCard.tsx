"use client";
import { AlertTriangle, HeartHandshake, Phone, Siren, X } from "lucide-react";
import { useJaga } from "@/lib/store";
import { NURSE_HOTLINE } from "@/lib/mockData";

/** Full-width card shown to the senior when Kaki (or the keyword check) flags a risk. */
export default function RiskAlertCard() {
  const risk = useJaga((s) => s.risk);
  const dismiss = useJaga((s) => s.dismissRisk);
  if (!risk) return null;
  const tel = (n: string) => `tel:${n.replace(/\s/g, "")}`;

  if (risk.level === "emergency") {
    return (
      <section role="alert" className="mb-4 space-y-3 rounded-2xl bg-alert p-5 text-white">
        <h2 className="flex items-center gap-2 font-display text-4xl"><Siren aria-hidden /> This sounds like an emergency</h2>
        <p className="text-xl">Please call 995 now. We have told your family and your Active Ageing Centre.</p>
        <a href="tel:995" className="btn bg-white !text-alert"><Phone aria-hidden /> Call 995 now</a>
        {risk.sos && <a href="tel:1767" className="btn border-2 border-white text-white"><HeartHandshake aria-hidden /> Samaritans of Singapore 1767</a>}
        <button onClick={dismiss} className="btn border-2 border-white/70 text-white"><X aria-hidden /> I am safe. Close this</button>
      </section>
    );
  }
  if (risk.level === "urgent") {
    return (
      <section role="alert" className="mb-4 space-y-3 rounded-2xl bg-amber p-5 text-white">
        <h2 className="flex items-center gap-2 font-display text-4xl"><AlertTriangle aria-hidden /> Please speak to a nurse</h2>
        <p className="text-xl">Call the nurse hotline now. Your Active Ageing Centre has also been told and will check on you.</p>
        <a href={tel(NURSE_HOTLINE)} className="btn bg-white !text-amber"><Phone aria-hidden /> Call nurse: {NURSE_HOTLINE}</a>
        <button onClick={dismiss} className="btn border-2 border-white/70 text-white"><X aria-hidden /> Close</button>
      </section>
    );
  }
  return (
    <section role="alert" className="mb-4 space-y-3 rounded-2xl border-2 border-teal bg-panel p-5">
      <h2 className="flex items-center gap-2 font-display text-4xl text-teal"><HeartHandshake aria-hidden /> Thank you for telling me</h2>
      <p className="text-xl">You are not alone. Ms Siti from your AAC will call you within 24 hours.</p>
      <p className="text-lg">If you ever feel unsafe, call Samaritans of Singapore on 1767.</p>
      <button onClick={dismiss} className="btn btn-secondary"><X aria-hidden /> Close</button>
    </section>
  );
}
