"use client";
// "Simulate time" panel (DEMO ONLY). Lets a presenter run the whole escalation flow live.
import Link from "next/link";
import { useState } from "react";
import { CalendarClock, CalendarCheck, FlaskConical, Pill, RotateCcw, Siren, X } from "lucide-react";
import { useJaga } from "@/lib/store";
import { missedStreak } from "@/lib/escalation";
import { fmtDateTime } from "@/lib/time";

export default function DemoTools({ position = "above-nav" }: { position?: "above-nav" | "corner" }) {
  const [open, setOpen] = useState(false);
  const s = useJaga();
  const streak = missedStreak(s.doses, s.clock);
  const medAlert = s.alerts.find((a) => a.kind === "medication" && a.severity === "important");
  const l1 = !medAlert ? "not triggered yet" : medAlert.status === "escalated" ? "done (caregiver notified)" : medAlert.status === "resolved" ? "closed" : "ACTIVE: caregiver notified";
  const l2 = medAlert?.status === "escalated" ? "ACTIVE: AAC case created" : "not triggered yet";

  const btn = "btn btn-secondary !min-h-[52px] !justify-start !text-lg";
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={`fixed z-50 flex min-h-[44px] items-center gap-2 rounded-full bg-navy px-4 text-base text-white shadow-lg ${position === "above-nav" ? "bottom-24 right-3" : "bottom-4 left-4"}`}
      >
        <FlaskConical size={18} aria-hidden /> Demo tools
      </button>
      {open && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-navy/50 sm:items-center" role="dialog" aria-label="Simulate time (demo only)">
          <div className="max-h-[90vh] w-full max-w-md space-y-3 overflow-y-auto rounded-t-3xl bg-white p-5 text-navy sm:rounded-3xl">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-display text-3xl text-teal">Simulate time</h2>
                <p className="text-sm uppercase tracking-wide text-amber">Demo only. Not part of the real app</p>
              </div>
              <button onClick={() => setOpen(false)} aria-label="Close demo tools" className="flex h-11 w-11 items-center justify-center rounded-full bg-panel"><X /></button>
            </div>

            <div className="rounded-2xl bg-card p-3 text-base">
              <p><strong>Demo date:</strong> {fmtDateTime(s.clock)}</p>
              <p><strong>Days missed in a row:</strong> {streak.days}</p>
              <p><strong>Level 1 (caregiver):</strong> {l1}</p>
              <p><strong>Level 2 (AAC):</strong> {l2}</p>
            </div>

            <button className={btn} onClick={s.missTodayDoses}><Pill aria-hidden /> Miss today&apos;s dose</button>
            <button className={btn} onClick={s.skipDay}><CalendarClock aria-hidden /> Skip 1 day <span className="text-sm">(untaken doses count as missed)</span></button>
            <button className={btn} onClick={() => s.flagRisk("emergency", "chest pain (demo)", "demo", true)}><Siren aria-hidden /> Trigger chatbot emergency</button>
            <button className={btn} onClick={s.completeNextCheckup}><CalendarCheck aria-hidden /> Complete booked check-up</button>
            <button className={`${btn} !border-alert !text-alert`} onClick={() => { if (confirm("Reset all demo data?")) s.resetDemo(); }}><RotateCcw aria-hidden /> Reset demo data</button>

            <p className="pt-1 text-sm font-medium">Try this flow: Miss today&apos;s dose → Skip 1 day → Miss today&apos;s dose (Level 1) → Skip 1 day (Level 2).</p>
            <div className="flex flex-wrap gap-2 text-base">
              <Link href="/senior" className="underline">Senior app</Link>
              <Link href="/caregiver" className="underline">Caregiver app</Link>
              <Link href="/aac" className="underline">AAC dashboard</Link>
              <Link href="/" className="underline">Role switcher</Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
