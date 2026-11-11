"use client";
import { useEffect, useState } from "react";
import { MEDS, SCHEMES, SENIORS, TAN_ID, ageOf } from "./mockData";
import { dayStatus, doseKey, missedStreak } from "./escalation";
import { DAY } from "./time";
import { useJaga } from "./store";
import type { Case, CoreState, Senior, Urgency } from "./types";

/** True once the persisted state has been loaded from localStorage (client only). */
export function useHydrated(): boolean {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (useJaga.persist.hasHydrated()) setReady(true);
    return useJaga.persist.onFinishHydration(() => setReady(true));
  }, []);
  return ready;
}

export const URGENCY_ORDER: Record<Urgency, number> = { emergency: 0, urgent: 1, "follow-up": 2, wellbeing: 3 };

export const URGENCY_LABEL: Record<Urgency, string> = {
  emergency: "Emergency",
  urgent: "Urgent",
  "follow-up": "Follow-up needed",
  wellbeing: "Wellbeing check",
};

export const todayDoses = (s: CoreState) =>
  MEDS.map((m) => ({ med: m, rec: s.doses[doseKey(s.clock, m.id)] ?? { status: "pending" as const } }));

export const nextBooking = (s: CoreState) =>
  [...s.bookings].filter((b) => b.status === "booked").sort((a, b) => a.ts - b.ts)[0];

export const latestCompleted = (s: CoreState) =>
  [...s.bookings].filter((b) => b.status === "completed").sort((a, b) => (b.completedAt ?? 0) - (a.completedAt ?? 0))[0];

export const openCasesFor = (s: CoreState, seniorId: string) =>
  s.cases.filter((c) => c.seniorId === seniorId && c.status !== "resolved");

/** The "Extra support recommended" banner on the senior home screen. */
export const needsExtraSupport = (s: CoreState) =>
  openCasesFor(s, TAN_ID).length > 0 || missedStreak(s.doses, s.clock).days >= 2;

export const sortCases = (cases: Case[]) =>
  [...cases].sort((a, b) => {
    const resolved = Number(a.status === "resolved") - Number(b.status === "resolved");
    if (resolved) return resolved;
    return URGENCY_ORDER[a.urgency] - URGENCY_ORDER[b.urgency] || b.createdAt - a.createdAt;
  });

/** Missed doses over the last 7 days for Mr Tan (computed) or the stored number for demo seniors. */
export function missedDoses7d(s: CoreState, senior: Senior): number {
  if (senior.id !== TAN_ID) return senior.missedDoses7d;
  let n = 0;
  for (let i = 0; i < 7; i++) for (const m of MEDS) if (s.doses[doseKey(s.clock - i * DAY, m.id)]?.status === "missed") n++;
  return n;
}

export interface HighNeed {
  senior: Senior;
  score: number;
  reasons: string[];
  unclaimed: string[];
}

/** "High-need" = lives alone + missed doses + eligible schemes not yet claimed (+ a few other signals). */
export function highNeedList(s: CoreState): HighNeed[] {
  return SENIORS.map((senior) => {
    const profile = senior.id === TAN_ID ? s.profile : senior.profile;
    const reasons: string[] = [];
    let score = 0;
    if (profile.livesAlone) { score += 2; reasons.push("Lives alone"); }
    if (!senior.caregiver) { score += 1; reasons.push("No caregiver on file"); }
    const missed = missedDoses7d(s, senior);
    if (missed >= 3) { score += 2; reasons.push(`Missed ${missed} doses this week`); }
    else if (missed >= 1) { score += 1; reasons.push(`Missed ${missed} dose${missed > 1 ? "s" : ""} this week`); }
    const unclaimed = SCHEMES.filter((sc) => sc.eligible(profile, ageOf(profile, s.clock)) && !senior.schemesHeld.includes(sc.id)).map((sc) => sc.name);
    if (unclaimed.length) { score += Math.min(unclaimed.length, 2); reasons.push(`Not yet on: ${unclaimed.join(", ")}`); }
    if (senior.age >= 80) { score += 1; reasons.push("Aged 80+"); }
    if (openCasesFor(s, senior.id).length) { score += 1; reasons.push("Has an open case"); }
    return { senior, score, reasons, unclaimed };
  }).sort((a, b) => b.score - a.score);
}

export { dayStatus };
