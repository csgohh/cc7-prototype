"use client";
import { Minus, Plus } from "lucide-react";

/** Large hour / minute / am-pm controls. No tiny native time wheel. */
export default function BigTimePicker({ value, onChange }: { value: string; onChange: (hhmm: string) => void }) {
  const [h24, min] = value.split(":").map(Number);
  const isPm = h24 >= 12;
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;

  const set = (h: number, m: number) =>
    onChange(`${String(((h % 24) + 24) % 24).padStart(2, "0")}:${String(((m % 60) + 60) % 60).padStart(2, "0")}`);

  const stepper = (label: string, text: string, down: () => void, up: () => void) => (
    <div className="flex flex-1 flex-col items-center gap-2">
      <span className="text-lg font-medium">{label}</span>
      <button type="button" onClick={up} aria-label={`More ${label}`} className="btn btn-secondary !min-h-[56px] !px-0"><Plus aria-hidden /></button>
      <span className="font-display text-6xl text-teal" aria-live="polite">{text}</span>
      <button type="button" onClick={down} aria-label={`Less ${label}`} className="btn btn-secondary !min-h-[56px] !px-0"><Minus aria-hidden /></button>
    </div>
  );

  return (
    <div className="flex items-start gap-3" role="group" aria-label="Choose a time">
      {stepper("Hour", String(h12), () => set(h24 - 1, min), () => set(h24 + 1, min))}
      {stepper("Minute", String(min).padStart(2, "0"), () => set(h24, min - 5), () => set(h24, min + 5))}
      <div className="flex flex-1 flex-col items-center gap-2">
        <span className="text-lg font-medium">am / pm</span>
        <button type="button" onClick={() => set(h24 + 12, min)} className="btn btn-gold !px-0 !text-3xl" aria-label="Switch between am and pm">
          {isPm ? "pm" : "am"}
        </button>
        <span className="text-base text-navy/80">Tap to switch</span>
      </div>
    </div>
  );
}
