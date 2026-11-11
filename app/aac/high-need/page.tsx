"use client";
import Link from "next/link";
import { useMemo } from "react";
import { useJaga } from "@/lib/store";
import { highNeedList } from "@/lib/selectors";

const THRESHOLD = 4;

export default function HighNeed() {
  const doses = useJaga((s) => s.doses);
  const clock = useJaga((s) => s.clock);
  const profile = useJaga((s) => s.profile);
  const cases = useJaga((s) => s.cases);
  // highNeedList reads the whole state, so rebuild it only when the relevant parts change.
  const list = useMemo(
    () => highNeedList({ ...useJaga.getState(), doses, clock, profile, cases }),
    [doses, clock, profile, cases],
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-5xl text-teal">High-need seniors</h1>
        <p className="max-w-3xl text-lg">
          Matched by the scheme matcher: lives alone, missed doses, eligible schemes not yet claimed, no caregiver, age 80+, open cases.
          Score {THRESHOLD} or more is shown as high need. (Mock scoring for the prototype.)
        </p>
      </div>
      <div className="space-y-3">
        {list.map(({ senior, score, reasons }) => {
          const high = score >= THRESHOLD;
          const open = cases.find((c) => c.seniorId === senior.id && c.status !== "resolved");
          return (
            <div key={senior.id} className={`flex flex-wrap items-start gap-4 rounded-2xl border-2 p-4 ${high ? "border-gold bg-gold/15" : "border-panel bg-card"}`}>
              <div className="w-20 text-center">
                <p className="font-display text-5xl text-navy">{score}</p>
                <p className="text-xs uppercase">score</p>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-lg font-semibold">{senior.name}, {senior.age} <span className={`chip ml-2 ${high ? "bg-gold text-navy" : "bg-panel"}`}>{high ? "High need" : "Monitor"}</span></p>
                <p className="text-sm text-navy/70">{senior.block} · {senior.livesWith}</p>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {reasons.map((r) => <li key={r} className="chip bg-white !text-sm">{r}</li>)}
                </ul>
              </div>
              {open && <Link href={`/aac/cases/${open.id}`} className="btn btn-secondary btn-sm">Open case</Link>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
