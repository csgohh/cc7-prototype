"use client";
// Client state for the whole demo (Zustand), saved to localStorage so changes survive a refresh.
// All three roles (senior / caregiver / AAC) read and write this same store, which is what makes
// the live escalation demo possible without a backend.
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  AAC_NAME, AAC_STAFF, CAREGIVER_NAME, MEDS, STORAGE_KEY, TAN_ID, buildSeed,
} from "./mockData";
import { applyChatbotRisk, doseKey, escalateAlert, evaluateEscalation, pushBanner, uid } from "./escalation";
import { DAY, dateKey, fmtDate, fmtDateTime } from "./time";
import type {
  Audience, Booking, CheckupResults, CoreState, Case, Reminder, RiskLevel, SchemeProfile, TimelineEntry,
} from "./types";

interface Actions {
  login: () => void;
  logout: () => void;
  // medication
  takeDose: (medId: string, photo: boolean) => void;
  // simulated time (demo only)
  skipDay: () => void;
  missTodayDoses: () => void;
  // reminders
  saveReminder: (r: Omit<Reminder, "id"> & { id?: string }) => void;
  deleteReminder: (id: string) => void;
  // check-ups
  bookSlot: (slotId: string) => void;
  completeNextCheckup: () => void;
  // schemes / requests
  setProfile: (p: SchemeProfile) => void;
  requestAacCall: () => void;
  requestSchemeHelp: (schemeName: string) => void;
  // volunteering
  signUpVolunteer: (oppId: string, title: string, place: string) => void;
  // privacy / settings
  setSharing: (key: keyof CoreState["sharing"], value: boolean) => void;
  setCaregiverLevel: (level: "all" | "important") => void;
  // chatbot
  flagRisk: (level: RiskLevel, reason: string, source: "kaki" | "keyword" | "demo", force?: boolean) => boolean;
  dismissRisk: () => void;
  // caregiver
  caregiverAction: (alertId: string, action: "called" | "cant_reach" | "resolved") => void;
  // AAC
  aacAction: (caseId: string, action: "called" | "visit" | "volunteer" | "resolved", arg?: string) => void;
  // banners (simulated push notifications)
  pushBanner: (audience: Audience, title: string, body: string, tone?: "info" | "reminder" | "alert") => void;
  dismissBanner: (id: string) => void;
  resetDemo: () => void;
}

export type JagaState = CoreState & Actions;

/** Run the escalation rules on top of a partial update. */
const withEscalation = (st: CoreState, patch: Partial<CoreState>): Partial<CoreState> => {
  const merged = { ...st, ...patch };
  return { ...patch, ...evaluateEscalation(merged) };
};

const addTimeline = (c: Case, entry: TimelineEntry): Case => ({ ...c, timeline: [...c.timeline, entry] });

export const useJaga = create<JagaState>()(
  persist(
    (set, get) => ({
      ...buildSeed(Date.now()),

      login: () => set({ loggedIn: true }),
      logout: () => set({ loggedIn: false }),

      // ---- Medication ----
      takeDose: (medId, photo) =>
        set((st) => {
          const doses = { ...st.doses, [doseKey(st.clock, medId)]: { status: "taken" as const, photo } };
          return withEscalation(st, { doses });
        }),

      // ---- Simulate time ----
      /** Moves the clock forward 1 day. Any dose still not taken on the day we leave counts as missed. */
      skipDay: () =>
        set((st) => {
          const doses = { ...st.doses };
          for (const m of MEDS) {
            const k = doseKey(st.clock, m.id);
            if (doses[k]?.status !== "taken") doses[k] = { status: "missed" };
          }
          const clock = st.clock + DAY;
          const banners = pushBanner(
            st.banners,
            { audience: "senior", tone: "reminder", title: "Good morning", body: "Time for your morning medicines (8:00 am)." },
            clock,
          );
          return withEscalation(st, { doses, clock, banners });
        }),

      missTodayDoses: () =>
        set((st) => {
          const doses = { ...st.doses };
          for (const m of MEDS) {
            const k = doseKey(st.clock, m.id);
            if (doses[k]?.status !== "taken") doses[k] = { status: "missed" };
          }
          return withEscalation(st, { doses });
        }),

      // ---- Reminders ----
      saveReminder: (r) =>
        set((st) => {
          const banners = pushBanner(st.banners, { audience: "senior", tone: "info", title: "Reminder saved", body: `${r.label} at ${r.time}` }, st.clock);
          if (r.id && st.reminders.some((x) => x.id === r.id)) {
            return { reminders: st.reminders.map((x) => (x.id === r.id ? { ...x, ...r, id: r.id! } : x)), banners };
          }
          return { reminders: [...st.reminders, { ...r, id: uid("r") }], banners };
        }),
      deleteReminder: (id) => set((st) => ({ reminders: st.reminders.filter((r) => r.id !== id) })),

      // ---- Check-ups ----
      bookSlot: (slotId) =>
        set((st) => {
          const slot = st.slots.find((s) => s.id === slotId);
          if (!slot || st.bookings.some((b) => b.slotId === slotId && b.status === "booked")) return {};
          const booking: Booking = {
            id: uid("b"), slotId, venue: slot.venue, address: slot.address, ts: slot.ts,
            baseline: slot.baseline, status: "booked",
          };
          const reminder: Reminder = {
            id: uid("r"), label: `Check-up at ${slot.venue}`, kind: "checkup", time: "09:00", enabled: true,
            date: dateKey(slot.ts),
          };
          return {
            bookings: [booking, ...st.bookings],
            reminders: [...st.reminders, reminder],
            banners: pushBanner(st.banners, { audience: "senior", tone: "info", title: "Check-up booked", body: `${slot.venue}, ${fmtDateTime(slot.ts)}` }, st.clock),
          };
        }),

      /** Demo helper: pretend the next booked check-up has happened and show mock results. */
      completeNextCheckup: () =>
        set((st) => {
          const next = [...st.bookings].filter((b) => b.status === "booked").sort((a, b) => a.ts - b.ts)[0];
          if (!next) return {};
          const results: CheckupResults = {
            bp: "138/86 mmHg", bpNote: "A little above target",
            glucose: "7.6 mmol/L", glucoseNote: "Above target. Keep taking your medicine.",
            cholesterol: "LDL 2.9 mmol/L", cholesterolNote: "Close to target",
          };
          const nextDue = {
            ts: st.clock + 90 * DAY,
            reason: "Your blood pressure was a little high, so we suggest a recheck in about 3 months.",
          };
          return {
            bookings: st.bookings.map((b) =>
              b.id === next.id ? { ...b, status: "completed" as const, completedAt: st.clock, results, nextDue } : b,
            ),
            banners: pushBanner(st.banners, { audience: "senior", tone: "info", title: "Check-up results ready", body: "Tap Check-ups to see your results." }, st.clock),
          };
        }),

      // ---- Schemes & requests ----
      setProfile: (profile) => set({ profile }),

      requestAacCall: () =>
        set((st) => {
          if (st.cases.some((c) => c.seniorId === TAN_ID && c.source === "senior-request" && c.status !== "resolved")) return {};
          const c: Case = {
            id: uid("case"), seniorId: TAN_ID, urgency: "follow-up", source: "senior-request", status: "open",
            title: "Mr Tan asked AAC to call him", reason: "Requested a call from the Hotline screen.",
            createdAt: st.clock, timeline: [{ ts: st.clock, who: "Mr Tan", text: "Asked AAC to call him." }],
          };
          return {
            cases: [c, ...st.cases],
            banners: pushBanner(st.banners, { audience: "aac", tone: "alert", title: "Call request", body: "Mr Tan Ah Huat asked for a call." }, st.clock),
          };
        }),

      requestSchemeHelp: (schemeName) =>
        set((st) => {
          const title = `Help applying: ${schemeName}`;
          if (st.cases.some((c) => c.seniorId === TAN_ID && c.title === title && c.status !== "resolved")) return {};
          const c: Case = {
            id: uid("case"), seniorId: TAN_ID, urgency: "follow-up", source: "senior-request", status: "open",
            title, reason: `Mr Tan would like AAC staff to help him apply for ${schemeName}.`,
            createdAt: st.clock, timeline: [{ ts: st.clock, who: "Mr Tan", text: `Asked for help applying for ${schemeName}.` }],
          };
          return { cases: [c, ...st.cases] };
        }),

      // ---- Volunteering ----
      signUpVolunteer: (oppId, title, place) =>
        set((st) =>
          st.volunteer.some((v) => v.oppId === oppId && v.status === "signed-up")
            ? {}
            : { volunteer: [{ id: uid("vh"), oppId, title, place, ts: st.clock, status: "signed-up" as const }, ...st.volunteer] },
        ),

      // ---- Settings ----
      setSharing: (key, value) => set((st) => ({ sharing: { ...st.sharing, [key]: value } })),
      setCaregiverLevel: (caregiverLevel) => set({ caregiverLevel }),

      // ---- Chatbot ----
      /** Returns false if it was ignored as a duplicate (same level flagged in the last minute). */
      flagRisk: (level, reason, source, force = false) => {
        const st = get();
        const last = st.lastRiskReal[level] ?? 0;
        if (!force && Date.now() - last < 60_000) return false;
        set((cur) => ({
          ...applyChatbotRisk(cur, level, reason, source),
          lastRiskReal: { ...cur.lastRiskReal, [level]: Date.now() },
        }));
        return true;
      },
      dismissRisk: () => set({ risk: null }),

      // ---- Caregiver actions on an alert ----
      caregiverAction: (alertId, action) =>
        set((st) => {
          const alert = st.alerts.find((a) => a.id === alertId);
          if (!alert) return {};
          if (action === "cant_reach") {
            // Level 2: caregiver cannot reach the senior -> AAC case
            const slice = escalateAlert(st, alertId, "caregiver");
            return { alerts: slice.alerts, cases: slice.cases, banners: slice.banners };
          }
          const cases = alert.caseId
            ? st.cases.map((c) =>
                c.id === alert.caseId
                  ? addTimeline(c, { ts: st.clock, who: `${CAREGIVER_NAME} (caregiver)`, text: action === "called" ? "Called Mr Tan." : "Marked the alert resolved." })
                  : c,
              )
            : st.cases;
          return {
            cases,
            alerts: st.alerts.map((a) =>
              a.id === alertId ? { ...a, status: action === "called" ? ("called" as const) : ("resolved" as const) } : a,
            ),
          };
        }),

      // ---- AAC actions on a case ----
      aacAction: (caseId, action, arg) =>
        set((st) => {
          const target = st.cases.find((c) => c.id === caseId);
          if (!target) return {};
          const now = st.clock;
          const entry = (text: string): TimelineEntry => ({ ts: now, who: AAC_STAFF, text });
          let banners = st.banners;
          const tellTan = target.seniorId === TAN_ID;

          const cases = st.cases.map((c) => {
            if (c.id !== caseId) return c;
            switch (action) {
              case "called":
                return { ...addTimeline(c, entry("Called the senior.")), status: "in_progress" as const };
              case "visit": {
                const t = now + DAY;
                return { ...addTimeline(c, entry(`Home visit scheduled for ${fmtDate(t)}, 10:00 am.`)), status: "in_progress" as const, homeVisitAt: t };
              }
              case "volunteer":
                return { ...addTimeline(c, entry(`Assigned volunteer ${arg}.`)), status: "in_progress" as const, assignedVolunteer: arg };
              case "resolved":
                return { ...addTimeline(c, entry("Case resolved.")), status: "resolved" as const, resolvedAt: now };
            }
          });

          if (tellTan) {
            const msg = {
              called: `${AAC_STAFF} from ${AAC_NAME} has called Mr Tan.`,
              visit: `${AAC_STAFF} has scheduled a home visit for Mr Tan tomorrow.`,
              volunteer: `${AAC_NAME} has assigned a volunteer buddy to Mr Tan.`,
              resolved: `${AAC_NAME} has closed the case. Mr Tan is OK.`,
            }[action];
            banners = pushBanner(banners, { audience: "caregiver", tone: "info", title: "AAC update", body: msg }, now);
            if (action !== "resolved") banners = pushBanner(banners, { audience: "senior", tone: "info", title: "From your AAC", body: msg }, now);
          }

          // Closing a case also closes the caregiver alert that led to it.
          const alerts =
            action === "resolved"
              ? st.alerts.map((a) => (a.caseId === caseId && a.status !== "resolved" ? { ...a, status: "resolved" as const, note: "Closed by AAC" } : a))
              : st.alerts;
          return { cases, alerts, banners };
        }),

      // ---- Banners ----
      pushBanner: (audience, title, body, tone = "info") =>
        set((st) => ({ banners: pushBanner(st.banners, { audience, title, body, tone }, st.clock) })),
      dismissBanner: (id) => set((st) => ({ banners: st.banners.filter((b) => b.id !== id) })),

      resetDemo: () => set({ ...buildSeed(Date.now()) }),
    }),
    {
      name: STORAGE_KEY,
      version: 1,
      storage: createJSONStorage(() => localStorage),
      skipHydration: true, // we rehydrate on the client in <Hydrate/> to avoid SSR mismatches
    },
  ),
);
