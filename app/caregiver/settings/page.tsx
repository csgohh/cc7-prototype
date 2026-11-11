"use client";
import { Check, Eye, EyeOff } from "lucide-react";
import { useJaga } from "@/lib/store";

const OPTIONS = [
  { id: "all", label: "All alerts", hint: "Including a single missed dose (FYI)." },
  { id: "important", label: "Important only", hint: "2 days of missed medicine, emergencies and urgent updates." },
] as const;

export default function CaregiverSettings() {
  const level = useJaga((s) => s.caregiverLevel);
  const set = useJaga((s) => s.setCaregiverLevel);
  const sharing = useJaga((s) => s.sharing);
  const rows = [
    ["Medication status", sharing.medication],
    ["Check-ups", sharing.checkups],
    ["Medicine photos", sharing.photos],
  ] as const;
  return (
    <>
      <h1 className="font-display text-4xl text-teal">Alert settings</h1>
      <div role="radiogroup" aria-label="Alert level" className="space-y-2">
        {OPTIONS.map((o) => (
          <button key={o.id} role="radio" aria-checked={level === o.id} onClick={() => set(o.id)}
            className={`flex w-full items-start justify-between gap-3 rounded-2xl border-2 p-4 text-left ${level === o.id ? "border-teal bg-teal/10" : "border-panel bg-card"}`}>
            <span><span className="block text-xl font-semibold">{o.label}</span><span>{o.hint}</span></span>
            {level === o.id && <Check className="shrink-0 text-teal" aria-label="Selected" />}
          </button>
        ))}
      </div>
      <p className="text-base">Emergencies are always sent to you, whatever you choose.</p>

      <section className="card">
        <h2 className="font-display text-2xl text-teal">What Mr Tan shares with you</h2>
        <p className="text-base">Mr Tan controls this on his phone (More → Privacy & sharing).</p>
        <ul className="mt-2 space-y-1">
          {rows.map(([label, on]) => (
            <li key={label} className="flex items-center gap-2">
              {on ? <Eye size={18} className="text-teal" aria-hidden /> : <EyeOff size={18} aria-hidden />} {label}: <strong>{on ? "Shared" : "Not shared"}</strong>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
