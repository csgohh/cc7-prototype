// Shared types for the JAGA prototype. Everything here is mock/demo data.

export type Urgency = "emergency" | "urgent" | "follow-up" | "wellbeing";
export type RiskLevel = "emergency" | "urgent" | "wellbeing";
export type Audience = "senior" | "caregiver" | "aac";

/** Short questionnaire used by the mock scheme matcher. */
export interface SchemeProfile {
  birthYear: number;
  citizen: "citizen" | "pr" | "other";
  income: "low" | "mid" | "high"; // household income per person (mock bands)
  housing: "hdb-small" | "hdb-large" | "private";
  livesAlone: boolean;
  dailyHelp: "none" | "some" | "a-lot";
}

export interface Senior {
  id: string;
  name: string;
  age: number;
  block: string;
  livesWith: string;
  conditions: string[];
  languages: string[];
  caregiver: string | null;
  schemesHeld: string[];
  profile: SchemeProfile;
  missedDoses7d: number; // static for demo seniors; Mr Tan's is computed live
  phone: string; // fake
}

export interface Medication {
  id: string;
  name: string;
  dose: string;
  time: string; // "HH:MM"
  purpose: string;
  tip: string;
}

export type DoseStatus = "pending" | "taken" | "missed";
export interface DoseRecord {
  status: DoseStatus;
  photo?: boolean; // only a flag. The photo itself never leaves the phone.
}

export interface Reminder {
  id: string;
  label: string;
  kind: "medication" | "appointment" | "checkup" | "other";
  time: string; // "HH:MM"
  enabled: boolean;
  date?: string; // "YYYY-MM-DD" for one-off reminders
}

export interface CheckupSlot {
  id: string;
  venue: string;
  kind: "CC" | "AAC";
  address: string;
  distance: string;
  ts: number;
  baseline: boolean;
}

export interface CheckupResults {
  bp: string;
  bpNote: string;
  glucose: string;
  glucoseNote: string;
  cholesterol: string;
  cholesterolNote: string;
}

export interface Booking {
  id: string;
  slotId: string;
  venue: string;
  address: string;
  ts: number;
  baseline: boolean;
  status: "booked" | "completed";
  completedAt?: number;
  results?: CheckupResults;
  nextDue?: { ts: number; reason: string };
}

export interface VolunteerRecord {
  id: string;
  oppId: string;
  title: string;
  place: string;
  ts: number;
  status: "signed-up" | "done";
}

export interface TimelineEntry {
  ts: number;
  who: string;
  text: string;
}

export interface Case {
  id: string;
  seniorId: string;
  urgency: Urgency;
  title: string;
  reason: string;
  source: "medication" | "chatbot" | "caregiver" | "senior-request" | "seed";
  status: "open" | "in_progress" | "resolved";
  createdAt: number;
  resolvedAt?: number;
  dueBy?: number; // e.g. "call within 24h"
  assignedVolunteer?: string;
  homeVisitAt?: number;
  alertId?: string;
  timeline: TimelineEntry[];
}

/** Caregiver-facing alert. */
export interface Alert {
  id: string;
  seniorId: string;
  kind: "medication" | "chatbot";
  severity: "info" | "important" | "emergency"; // "important only" mode hides "info"
  level?: 1 | 2;
  title: string;
  detail: string; // full text
  safeDetail: string; // shown if the senior has NOT shared medication details
  createdAt: number;
  status: "open" | "called" | "cant_reach" | "escalated" | "resolved";
  caseId?: string;
  note?: string;
}

export interface Banner {
  id: string;
  audience: Audience;
  title: string;
  body: string;
  tone: "info" | "reminder" | "alert";
  ts: number;
}

/** The full-width alert card shown to the senior after a chatbot risk flag. */
export interface ActiveRisk {
  id: string;
  level: RiskLevel;
  reason: string;
  ts: number;
  sos: boolean; // also show Samaritans of Singapore 1767
}

/** Everything that is saved to localStorage. */
export interface CoreState {
  clock: number; // simulated "now" (ms). Moved by the Simulate time panel.
  loggedIn: boolean;
  doses: Record<string, DoseRecord>; // key = `${YYYY-MM-DD}|${medId}`
  reminders: Reminder[];
  slots: CheckupSlot[];
  bookings: Booking[];
  profile: SchemeProfile;
  volunteer: VolunteerRecord[];
  sharing: { medication: boolean; checkups: boolean; photos: boolean };
  caregiverLevel: "all" | "important";
  alerts: Alert[];
  cases: Case[];
  banners: Banner[];
  risk: ActiveRisk | null;
  escalation: { lastStreakStart: string | null };
  lastRiskReal: Partial<Record<RiskLevel, number>>;
}
