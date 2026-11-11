// All mock data for the JAGA prototype. Nothing here is real. No real people, no real eligibility rules.
import { DAY, HOUR, at, dateKey } from "./time";
import type {
  Alert,
  Booking,
  Case,
  CheckupSlot,
  CoreState,
  Medication,
  Reminder,
  SchemeProfile,
  Senior,
  VolunteerRecord,
} from "./types";

export const TAN_ID = "tan";
export const CAREGIVER_NAME = "Mei Ling";
export const AAC_NAME = "AAC @ Bedok North";
export const AAC_STAFF = "Ms Siti";
export const STORAGE_KEY = "jaga-demo-v1";

export const NURSE_HOTLINE = process.env.NEXT_PUBLIC_NURSE_HOTLINE || "1800 123 4567";

// ---------- Medication ----------
export const MEDS: Medication[] = [
  { id: "amlodipine", name: "Amlodipine", dose: "5 mg · 1 tablet", time: "08:00", purpose: "For blood pressure", tip: "Take after breakfast." },
  { id: "metformin", name: "Metformin", dose: "500 mg · 1 tablet", time: "08:00", purpose: "For diabetes (blood sugar)", tip: "Take with food." },
  { id: "atorvastatin", name: "Atorvastatin", dose: "20 mg · 1 tablet", time: "20:00", purpose: "For cholesterol", tip: "Take at night." },
];

// ---------- Seniors ----------
const TAN_PROFILE: SchemeProfile = {
  birthYear: 1952, citizen: "citizen", income: "low", housing: "hdb-small", livesAlone: false, dailyHelp: "none",
};

export const SENIORS: Senior[] = [
  {
    id: TAN_ID, name: "Mr Tan Ah Huat", age: 74, block: "Blk 123 Bedok North Rd",
    livesWith: "Wife (71, also a caregiver)", conditions: ["Hypertension", "Diabetes"],
    languages: ["Mandarin", "Hokkien"], caregiver: `${CAREGIVER_NAME} (daughter)`,
    schemesHeld: ["chas", "medisave"], profile: TAN_PROFILE, missedDoses7d: 0, phone: "8XXX 0101 (demo)",
  },
  {
    id: "lim", name: "Mdm Lim Siew Eng", age: 81, block: "Blk 88 Bedok North St 2",
    livesWith: "Lives alone", conditions: ["Diabetes", "Poor eyesight"], languages: ["Hokkien", "Mandarin"],
    caregiver: null, schemesHeld: ["chas", "medisave"],
    profile: { birthYear: 1945, citizen: "citizen", income: "low", housing: "hdb-small", livesAlone: true, dailyHelp: "some" },
    missedDoses7d: 4, phone: "8XXX 0102 (demo)",
  },
  {
    id: "rajan", name: "Mr Rajan s/o Kumar", age: 77, block: "Blk 52 Bedok North Ave 3",
    livesWith: "Lives alone", conditions: ["Hypertension", "Knee osteoarthritis"], languages: ["Tamil", "English"],
    caregiver: "Priya (niece)", schemesHeld: ["chas", "medisave"],
    profile: { birthYear: 1949, citizen: "citizen", income: "mid", housing: "hdb-large", livesAlone: true, dailyHelp: "some" },
    missedDoses7d: 1, phone: "8XXX 0103 (demo)",
  },
  {
    id: "fatimah", name: "Mdm Fatimah binte Yusof", age: 69, block: "Blk 101 Bedok North St 4",
    livesWith: "Son and his family", conditions: ["High cholesterol"], languages: ["Malay", "English"],
    caregiver: "Hafiz (son)", schemesHeld: ["chas", "medisave"],
    profile: { birthYear: 1957, citizen: "citizen", income: "mid", housing: "hdb-large", livesAlone: false, dailyHelp: "none" },
    missedDoses7d: 0, phone: "8XXX 0104 (demo)",
  },
  {
    id: "lee", name: "Mr Lee Kok Wai", age: 85, block: "Blk 77 Bedok North Rd",
    livesWith: "Lives alone", conditions: ["Heart condition", "Mobility difficulty"], languages: ["Cantonese", "English"],
    caregiver: null, schemesHeld: ["chas", "medisave"],
    profile: { birthYear: 1941, citizen: "citizen", income: "low", housing: "hdb-small", livesAlone: true, dailyHelp: "a-lot" },
    missedDoses7d: 2, phone: "8XXX 0105 (demo)",
  },
  {
    id: "chua", name: "Mdm Chua Mei Hua", age: 72, block: "Blk 66 Bedok North Ave 1",
    livesWith: "Husband", conditions: ["Arthritis"], languages: ["Mandarin", "English"],
    caregiver: "Husband", schemesHeld: ["chas", "medisave", "merdeka"],
    profile: { birthYear: 1954, citizen: "citizen", income: "mid", housing: "hdb-large", livesAlone: false, dailyHelp: "none" },
    missedDoses7d: 0, phone: "8XXX 0106 (demo)",
  },
];

export const seniorById = (id: string) => SENIORS.find((s) => s.id === id)!;

// ---------- Schemes (mock rules, not real eligibility) ----------
export interface Scheme {
  id: string;
  name: string;
  plain: string; // plain-language explanation
  eligible: (p: SchemeProfile, age: number) => boolean;
  keywords: string[];
}

export const SCHEMES: Scheme[] = [
  {
    id: "chas", name: "CHAS card",
    plain: "Helps you pay less when you see a GP or dentist near your home.",
    eligible: (p) => p.citizen !== "other" && p.income !== "high", keywords: ["chas", "gp", "dentist", "clinic", "subsid"],
  },
  {
    id: "medisave", name: "MediSave",
    plain: "Your own health savings account. You can use it for hospital bills and some long-term illness care.",
    eligible: (p) => p.citizen !== "other", keywords: ["medisave", "savings", "hospital bill"],
  },
  {
    id: "merdeka", name: "Merdeka Generation Package",
    plain: "Extra help with healthcare costs for seniors born between 1950 and 1959.",
    eligible: (p) => p.citizen === "citizen" && p.birthYear >= 1950 && p.birthYear <= 1959, keywords: ["merdeka", "package", "generation"],
  },
  {
    id: "silver", name: "Silver Support Scheme",
    plain: "Small cash top-ups every few months for seniors with lower income who live in smaller flats.",
    eligible: (p, age) => p.citizen === "citizen" && age >= 65 && p.income === "low" && p.housing === "hdb-small",
    keywords: ["silver", "cash", "money", "income", "support"],
  },
  {
    id: "hcg", name: "Home Caregiving Grant",
    plain: "Monthly cash to help families who care for a senior who needs a lot of help at home.",
    eligible: (p) => p.dailyHelp === "a-lot", keywords: ["caregiving", "caregiver", "grant", "home care"],
  },
  {
    id: "smf", name: "Mobility and Enabling Fund",
    plain: "Helps pay for walking aids, wheelchairs and home safety items.",
    eligible: (p, age) => age >= 65 && p.dailyHelp !== "none", keywords: ["walking", "wheelchair", "mobility", "stick", "aid"],
  },
];

export const ageOf = (p: SchemeProfile, clock: number) => new Date(clock).getFullYear() - p.birthYear;

// ---------- Activities, volunteering, caregiver support ----------
export const ACTIVITIES = [
  { id: "a1", name: "Morning Tai Chi", where: "AAC @ Bedok North", when: "Tue & Thu, 8:00 am", cost: "Free" },
  { id: "a2", name: "Mahjong and kopi afternoon", where: "Bedok Community Club", when: "Wed, 2:00 pm", cost: "$2 per session" },
  { id: "a3", name: "Learn WhatsApp video calls", where: "AAC @ Bedok North", when: "Fri, 10:00 am", cost: "Free" },
  { id: "a4", name: "Community lunch and singalong", where: "AAC @ Bedok Reservoir", when: "Sat, 12:00 pm", cost: "$3 per meal" },
];

export const VOLUNTEER_OPPS = [
  { id: "v1", title: "Befriending visits", place: "Seniors near Bedok North", when: "1 hour a week", about: "Chat and have tea with a senior who lives alone." },
  { id: "v2", title: "AAC activity helper", place: "AAC @ Bedok North", when: "Tue & Thu mornings", about: "Help set up and guide group activities like Tai Chi." },
  { id: "v3", title: "Tech buddy", place: "AAC @ Bedok North", when: "Fri, 10:00 am", about: "Teach other seniors to use phones, video calls and apps safely." },
];

export const CAREGIVER_SUPPORT = {
  respite: [
    { name: "Day care respite (mock)", text: "Your loved one spends the day at a day care centre with meals and activities, so you can rest or work." },
    { name: "Home respite (mock)", text: "A trained helper comes to your home for a few hours so you can have a break." },
  ],
  groups: [
    { name: "Bedok Caregivers' Circle (mock)", text: "Meets on the first Saturday of the month at AAC @ Bedok North. Share tips and support." },
    { name: "Working Caregivers Online Chat (mock)", text: "Evening video chat for caregivers who work full-time." },
  ],
  grant: {
    name: "Caregivers Training Grant (mock details)",
    text: "Helps pay for approved caregiver training courses, such as safe lifting, dementia care and diabetes care. Check the official site for current amounts and rules.",
  },
};

export const VOLUNTEERS = ["Mr Alan Goh", "Mdm Noraini", "Ms Grace Lau", "Mr Suresh"];

// ---------- Seed builder ----------
/** Builds a fresh demo state. `now` is "today" for the demo. */
export function buildSeed(now: number): CoreState {
  const today = at(now, "09:00"); // the demo starts at 9:00 am
  const days = (n: number) => today + n * DAY;

  // Medication history for the past 7 days: all taken, except one missed Metformin 4 days ago.
  const doses: CoreState["doses"] = {};
  for (let i = 1; i <= 7; i++) {
    for (const m of MEDS) {
      const missed = i === 4 && m.id === "metformin";
      doses[`${dateKey(days(-i))}|${m.id}`] = { status: missed ? "missed" : "taken" };
    }
  }

  const slotAt = (d: number, hhmm: string) => at(days(d), hhmm);
  const slots: CheckupSlot[] = [
    { id: "s1", venue: "AAC @ Bedok North", kind: "AAC", address: "Blk 123 Bedok North Rd", distance: "0.4 km", ts: slotAt(3, "10:00"), baseline: false },
    { id: "s2", venue: "Bedok Community Club", kind: "CC", address: "850 New Upper Changi Rd", distance: "0.9 km", ts: slotAt(2, "09:30"), baseline: true },
    { id: "s3", venue: "AAC @ Bedok Reservoir", kind: "AAC", address: "Blk 702 Bedok Reservoir Rd", distance: "1.5 km", ts: slotAt(4, "14:00"), baseline: false },
    { id: "s4", venue: "Siglap Community Centre", kind: "CC", address: "Siglap Rd", distance: "2.2 km", ts: slotAt(5, "10:30"), baseline: true },
    { id: "s5", venue: "Kaki Bukit Community Club", kind: "CC", address: "Kaki Bukit Ave 1", distance: "2.6 km", ts: slotAt(6, "09:00"), baseline: false },
    { id: "s6", venue: "AAC @ Bedok North", kind: "AAC", address: "Blk 123 Bedok North Rd", distance: "0.4 km", ts: slotAt(8, "15:00"), baseline: true },
  ];

  const bookings: Booking[] = [
    {
      id: "b1", slotId: "s1", venue: "AAC @ Bedok North", address: "Blk 123 Bedok North Rd",
      ts: slotAt(3, "10:00"), baseline: false, status: "booked",
    },
    {
      id: "b0", slotId: "past", venue: "Bedok Community Club", address: "850 New Upper Changi Rd",
      ts: days(-80), baseline: true, status: "completed", completedAt: days(-80),
      results: {
        bp: "142/90 mmHg", bpNote: "A little high",
        glucose: "7.2 mmol/L", glucoseNote: "A little above target",
        cholesterol: "LDL 3.2 mmol/L", cholesterolNote: "Slightly above target",
      },
      nextDue: { ts: days(10), reason: "Your blood pressure was a little high, so we suggest a recheck in about 3 months." },
    },
  ];

  const reminders: Reminder[] = [
    { id: "r1", label: "Morning medicines", kind: "medication", time: "08:00", enabled: true },
    { id: "r2", label: "Night medicine", kind: "medication", time: "20:00", enabled: true },
    { id: "r3", label: "Check-up at AAC @ Bedok North", kind: "checkup", time: "09:00", enabled: true, date: dateKey(days(3)) },
    { id: "r4", label: "Polyclinic follow-up visit", kind: "appointment", time: "10:30", enabled: true, date: dateKey(days(12)) },
  ];

  const volunteer: VolunteerRecord[] = [
    { id: "vh1", oppId: "v2", title: "AAC activity helper", place: "AAC @ Bedok North", ts: days(-45), status: "done" },
    { id: "vh2", oppId: "v1", title: "Befriending visits", place: "Seniors near Bedok North", ts: days(-20), status: "done" },
  ];

  // An old, already-resolved FYI alert so the caregiver alerts page isn't empty at first.
  const alerts: Alert[] = [
    {
      id: "info_old", seniorId: TAN_ID, kind: "medication", severity: "info",
      title: "A dose was missed",
      detail: "Mr Tan missed his Metformin 4 days ago. He took all his medicines the next day.",
      safeDetail: "Mr Tan may have missed something. No action needed.",
      createdAt: days(-4), status: "resolved", note: "Back on track",
    },
  ];

  const tl = (ts: number, who: string, text: string) => ({ ts, who, text });
  const cases: Case[] = [
    {
      id: "case_lee", seniorId: "lee", urgency: "emergency", source: "chatbot", status: "in_progress",
      title: "Emergency: fall at home reported", reason: "Kaki detected the phrase \"I fell\" and the senior could not get up. Senior told to call 995.",
      createdAt: today - 40 * 60000,
      timeline: [
        tl(today - 40 * 60000, "Kaki (chatbot)", "Flagged emergency: fall at home"),
        tl(today - 40 * 60000, "System", "Senior shown 995 prompt. AAC notified."),
        tl(today - 30 * 60000, AAC_STAFF, "Called neighbour. Ambulance already on the way."),
      ],
    },
    {
      id: "case_lim", seniorId: "lim", urgency: "follow-up", source: "medication", status: "open",
      title: "Follow-up needed: missed medication", reason: "Missed diabetes medicine 3 days in a row. No caregiver on file, so this came straight to AAC.",
      createdAt: today - 5 * HOUR,
      timeline: [
        tl(today - 3 * DAY, "System", "First missed dose recorded"),
        tl(today - 5 * HOUR, "System", "Level 2: 3 days missed, no caregiver to notify. Case created."),
      ],
    },
    {
      id: "case_rajan", seniorId: "rajan", urgency: "urgent", source: "chatbot", status: "in_progress",
      title: "Urgent: dizzy after new BP medicine", reason: "Told Kaki he felt dizzy and nearly fell after starting a new blood pressure tablet. Nurse hotline suggested.",
      createdAt: today - 2 * HOUR,
      timeline: [
        tl(today - 2 * HOUR, "Kaki (chatbot)", "Flagged urgent: dizziness after new medicine"),
        tl(today - 2 * HOUR, "System", "Senior shown nurse hotline. AAC case created."),
        tl(today - 1 * HOUR, AAC_STAFF, "Called. Senior is sitting down and drinking water. Nurse to call back."),
      ],
    },
    {
      id: "case_fatimah", seniorId: "fatimah", urgency: "wellbeing", source: "chatbot", status: "open",
      title: "Wellbeing check: feeling lonely", reason: "Said she has felt lonely since her close friend passed away. Asked for gentle support.",
      createdAt: today - 4 * HOUR, dueBy: today + 20 * HOUR,
      timeline: [
        tl(today - 4 * HOUR, "Kaki (chatbot)", "Flagged wellbeing: loneliness"),
        tl(today - 4 * HOUR, "System", "Call within 24 hours requested."),
      ],
    },
    {
      id: "case_chua", seniorId: "chua", urgency: "follow-up", source: "senior-request", status: "resolved",
      title: "Help applying for a scheme", reason: "Asked AAC staff to help with a CHAS card renewal.",
      createdAt: today - 3 * DAY, resolvedAt: today - 1 * DAY,
      timeline: [
        tl(today - 3 * DAY, "Mdm Chua", "Asked AAC to help with CHAS renewal"),
        tl(today - 2 * DAY, AAC_STAFF, "Called and booked a desk appointment"),
        tl(today - 1 * DAY, AAC_STAFF, "Renewal done. Case resolved."),
      ],
    },
  ];

  return {
    clock: today,
    loggedIn: false,
    doses,
    reminders,
    slots,
    bookings,
    profile: TAN_PROFILE,
    volunteer,
    sharing: { medication: true, checkups: true, photos: false }, // photos OFF by default
    caregiverLevel: "all",
    alerts,
    cases,
    banners: [],
    risk: null,
    escalation: { lastStreakStart: null },
    lastRiskReal: {},
  };
}
