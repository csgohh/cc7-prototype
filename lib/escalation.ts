// ============================================================================
// ESCALATION LOGIC  (the core safety feature of JAGA, simulated for the demo)
//
//  Medication path
//  ---------------
//  Level 0  A single missed day  -> optional FYI alert to the caregiver
//                                   (only visible if caregiver alert level = "all").
//  Level 1  Medication missed on 2 CONSECUTIVE days
//                                -> caregiver is notified (Alerts tab of the caregiver app).
//  Level 2  Level 1 alert still not dealt with after a further 24 hours, OR the
//           caregiver taps "Can't reach them"
//                                -> a case appears in the AAC dashboard as "Follow-up needed".
//
//  If the senior takes a dose again, the streak breaks and any open Level 1 alert
//  closes itself ("Back on track").
//
//  Chatbot path (Kaki's flag_risk tool, or the client-side keyword check)
//  ----------------------------------------------------------------------
//  emergency -> senior sees a 995 prompt  + caregiver alert + AAC case (emergency)
//  urgent    -> senior sees nurse hotline + AAC case (urgent)
//  wellbeing -> gentle support message    + AAC case (wellbeing, "call within 24h")
//
//  Everything in this file is a pure function of the state, so it is easy to read and
//  to test. The store (lib/store.ts) calls evaluateEscalation() after every change that
//  could affect it (a dose is taken/missed, the simulated clock moves).
// ============================================================================
import { AAC_NAME, CAREGIVER_NAME, MEDS, TAN_ID } from "./mockData";
import { DAY, HOUR, dateKey, fmtDate } from "./time";
import type { Alert, Banner, Case, CoreState, RiskLevel, Urgency } from "./types";

export const L1_MISSED_DAYS = 2; // consecutive days missed before the caregiver is told
export const L2_WAIT_MS = 24 * HOUR; // extra wait before AAC is told

let counter = 0;
export const uid = (prefix: string) =>
  `${prefix}_${Date.now().toString(36)}${(counter++).toString(36)}${Math.random().toString(36).slice(2, 5)}`;

export const doseKey = (ts: number, medId: string) => `${dateKey(ts)}|${medId}`;

export type DayStatus = "taken" | "missed" | "partial" | "pending" | "nodata";

/** Status of one calendar day, looking at all 3 medicines. */
export function dayStatus(doses: CoreState["doses"], ts: number, clock: number): DayStatus {
  const statuses = MEDS.map((m) => doses[doseKey(ts, m.id)]?.status);
  if (statuses.includes("missed")) return "missed";
  if (statuses.every((s) => s === "taken")) return "taken";
  if (statuses.includes("taken")) return "partial";
  return dateKey(ts) === dateKey(clock) ? "pending" : "nodata";
}

/** How many days in a row (counting back from today) have a missed dose. */
export function missedStreak(doses: CoreState["doses"], clock: number) {
  let days = 0;
  let startKey: string | null = null;
  for (let i = 0; i < 30; i++) {
    const ts = clock - i * DAY;
    const st = dayStatus(doses, ts, clock);
    if (st === "missed") {
      days++;
      startKey = dateKey(ts);
    } else if (i === 0 && (st === "pending" || st === "partial")) {
      continue; // today isn't over yet, so it neither breaks nor extends the streak
    } else {
      break;
    }
  }
  return { days, startKey };
}

export function pushBanner(banners: Banner[], b: Omit<Banner, "id" | "ts">, ts: number): Banner[] {
  return [...banners, { ...b, id: uid("bn"), ts }];
}

type Slice = Pick<CoreState, "alerts" | "cases" | "banners" | "clock">;

/** Level 2: turn a caregiver alert into an AAC case. */
export function escalateAlert(st: Slice, alertId: string, via: "timeout" | "caregiver"): Slice {
  const alert = st.alerts.find((a) => a.id === alertId);
  if (!alert) return st;
  let { alerts, cases, banners } = st;
  const who = via === "timeout" ? "System" : `${CAREGIVER_NAME} (caregiver)`;
  const why =
    via === "timeout"
      ? "No caregiver confirmation within 24 hours of the Level 1 alert."
      : `${CAREGIVER_NAME} tapped "Can't reach them".`;

  if (alert.caseId) {
    // A case already exists (e.g. a chatbot emergency). Just record what the caregiver said.
    cases = cases.map((c) =>
      c.id === alert.caseId
        ? { ...c, timeline: [...c.timeline, { ts: st.clock, who, text: "Caregiver could not reach Mr Tan." }] }
        : c,
    );
    alerts = alerts.map((a) => (a.id === alertId ? { ...a, status: "cant_reach" as const } : a));
  } else {
    const c: Case = {
      id: uid("case"),
      seniorId: alert.seniorId,
      urgency: "follow-up",
      title: "Follow-up needed: missed medication",
      reason: `Mr Tan has missed his medicine on consecutive days. ${why}`,
      source: via === "timeout" ? "medication" : "caregiver",
      status: "open",
      createdAt: st.clock,
      alertId,
      timeline: [
        { ts: alert.createdAt, who: "System", text: "Level 1: missed 2 days in a row. Caregiver notified." },
        { ts: st.clock, who, text: `Level 2: ${why} Case sent to ${AAC_NAME}.` },
      ],
    };
    cases = [c, ...cases];
    alerts = alerts.map((a) =>
      a.id === alertId ? { ...a, status: "escalated" as const, level: 2 as const, caseId: c.id } : a,
    );
  }
  banners = pushBanner(banners, { audience: "aac", tone: "alert", title: "Follow-up needed", body: "Mr Tan Ah Huat: missed medication, caregiver could not reach him." }, st.clock);
  banners = pushBanner(banners, { audience: "caregiver", tone: "info", title: "AAC has been informed", body: "Ms Siti at AAC @ Bedok North will follow up with Mr Tan." }, st.clock);
  return { alerts, cases, banners, clock: st.clock };
}

/** Called after every change. Creates Level 1 / Level 2 items when the rules are met. */
export function evaluateEscalation(s: CoreState): Partial<CoreState> {
  let { alerts, cases, banners } = s;
  let escalation = s.escalation;
  const streak = missedStreak(s.doses, s.clock);

  // Level 0: single missed day -> FYI alert (hidden when caregiver chose "important only").
  for (let i = 0; i < 2; i++) {
    const ts = s.clock - i * DAY;
    const key = dateKey(ts);
    if (dayStatus(s.doses, ts, s.clock) === "missed" && streak.days < L1_MISSED_DAYS && !alerts.some((a) => a.id === `info_${key}`)) {
      alerts = [
        {
          id: `info_${key}`, seniorId: TAN_ID, kind: "medication", severity: "info",
          title: "A dose was missed",
          detail: `Mr Tan missed a medicine on ${fmtDate(ts)}. No action needed yet.`,
          safeDetail: "Mr Tan may need a check-in. No action needed yet.",
          createdAt: s.clock, status: "open",
        },
        ...alerts,
      ];
    }
  }

  // Level 1: 2 consecutive missed days (once per streak).
  if (streak.days >= L1_MISSED_DAYS && escalation.lastStreakStart !== streak.startKey) {
    const a: Alert = {
      id: uid("al"), seniorId: TAN_ID, kind: "medication", severity: "important", level: 1,
      title: `Level 1 · Missed medicine ${streak.days} days in a row`,
      detail: `Mr Tan has not taken his medicines for ${streak.days} days in a row (since ${streak.startKey}). Please check in on him.`,
      safeDetail: "Mr Tan may need a check-in. Please call or visit him.",
      createdAt: s.clock, status: "open",
    };
    alerts = [a, ...alerts.map((x) => (x.id.startsWith("info_") && x.status === "open" ? { ...x, status: "resolved" as const, note: "Replaced by Level 1 alert" } : x))];
    banners = pushBanner(banners, { audience: "caregiver", tone: "alert", title: "Mr Tan needs a check-in", body: `He has missed his medicines for ${streak.days} days in a row.` }, s.clock);
    escalation = { lastStreakStart: streak.startKey };
  }

  // The streak is over (a dose was taken): close any open Level 1 alert.
  if (streak.days < L1_MISSED_DAYS) {
    alerts = alerts.map((a) =>
      a.kind === "medication" && a.level === 1 && (a.status === "open" || a.status === "called")
        ? { ...a, status: "resolved" as const, note: "Back on track: Mr Tan took his medicine." }
        : a,
    );
  }

  // Level 2 (timeout): Level 1 still open after a further 24 hours.
  const due = alerts.filter(
    (a) => a.kind === "medication" && a.level === 1 && (a.status === "open" || a.status === "called") && s.clock - a.createdAt >= L2_WAIT_MS,
  );
  let slice: Slice = { alerts, cases, banners, clock: s.clock };
  for (const a of due) slice = escalateAlert(slice, a.id, "timeout");

  return { alerts: slice.alerts, cases: slice.cases, banners: slice.banners, escalation };
}

// ---------- Chatbot risk flags ----------
const TITLES: Record<RiskLevel, string> = {
  emergency: "Emergency",
  urgent: "Urgent",
  wellbeing: "Wellbeing check",
};

/** Creates the AAC case (and the caregiver alert for emergencies) for a chatbot risk flag. */
export function applyChatbotRisk(
  s: CoreState,
  level: RiskLevel,
  reason: string,
  source: "kaki" | "keyword" | "demo",
): Partial<CoreState> {
  const now = s.clock;
  const via = source === "kaki" ? "Kaki (chatbot)" : source === "keyword" ? "Kaki (keyword safety check)" : "Kaki (demo button)";
  const sos = /die|suicid|kill myself|self.?harm|想死|不想活|nak mati/i.test(reason);

  const timeline = [
    { ts: now, who: via, text: `Flagged ${level}: ${reason}` },
    {
      ts: now,
      who: "System",
      text:
        level === "emergency"
          ? "Senior shown 995 prompt. Caregiver alerted. AAC notified."
          : level === "urgent"
            ? "Senior shown nurse hotline prompt. AAC case created."
            : "Gentle support message shown. Call within 24 hours requested.",
    },
  ];

  const c: Case = {
    id: uid("case"),
    seniorId: TAN_ID,
    urgency: level as Urgency,
    title: `${TITLES[level]}: ${reason.length > 60 ? reason.slice(0, 57) + "..." : reason}`,
    reason: `Mr Tan told Kaki: ${reason}`,
    source: "chatbot",
    status: "open",
    createdAt: now,
    dueBy: level === "wellbeing" ? now + DAY : undefined,
    timeline,
  };

  let alerts = s.alerts;
  let banners = pushBanner(s.banners, { audience: "aac", tone: "alert", title: `${TITLES[level]} case`, body: `Mr Tan Ah Huat: ${reason}` }, now);

  if (level === "emergency") {
    const a: Alert = {
      id: uid("al"), seniorId: TAN_ID, kind: "chatbot", severity: "emergency",
      title: "Emergency: Mr Tan may need help now",
      detail: `Mr Tan said something that sounds like an emergency: "${reason}". He was told to call 995 and AAC has been informed.`,
      safeDetail: `Mr Tan may need help now. He was told to call 995.`,
      createdAt: now, status: "open", caseId: c.id,
    };
    c.alertId = a.id;
    alerts = [a, ...alerts];
    banners = pushBanner(banners, { audience: "caregiver", tone: "alert", title: "Emergency alert", body: "Mr Tan may need urgent help. Please call him now." }, now);
  }

  return {
    cases: [c, ...s.cases],
    alerts,
    banners,
    risk: { id: uid("risk"), level, reason, ts: now, sos },
  };
}
