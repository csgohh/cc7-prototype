"use client";
// Runs Kaki's tools in the browser and provides scripted replies for typed "demo mode"
// (used when there is no OPENAI_API_KEY or the microphone is unavailable).
import { ACTIVITIES, NURSE_HOTLINE, SCHEMES, ageOf } from "./mockData";
import { parseTimeText } from "./time";
import { useJaga } from "./store";
import { checkEmergencyKeywords } from "./riskKeywords";
import type { RiskLevel } from "./types";

const RISK_REPLY: Record<RiskLevel, string> = {
  emergency: "Tell the senior calmly to call 995 now. Say that their family and the Active Ageing Centre have been told.",
  urgent: `Suggest the nurse hotline (${NURSE_HOTLINE}). Say the Active Ageing Centre has been told.`,
  wellbeing: "Be gentle. Say someone from the Active Ageing Centre will call within 24 hours.",
};

export function checkSchemeAnswer(question: string) {
  const { profile, clock } = useJaga.getState();
  const q = question.toLowerCase();
  const matches = SCHEMES.filter((s) => s.keywords.some((k) => q.includes(k)));
  const list = (matches.length ? matches : SCHEMES.slice(0, 4)).map((s) => ({
    name: s.name,
    explanation: s.plain,
    seniorMayQualify: s.eligible(profile, ageOf(profile, clock)),
  }));
  return { note: "Mock data. Not official eligibility. Suggest asking AAC staff for help applying.", schemes: list };
}

/** Executes a tool call from the Realtime model and returns the JSON result sent back to it. */
export function runKakiTool(name: string, args: Record<string, string>) {
  const st = useJaga.getState();
  switch (name) {
    case "flag_risk": {
      const level = (["emergency", "urgent", "wellbeing"].includes(args.level) ? args.level : "urgent") as RiskLevel;
      st.flagRisk(level, args.reason || "Flagged by Kaki", "kaki");
      return { ok: true, what_to_say: RISK_REPLY[level] };
    }
    case "set_reminder": {
      const time = parseTimeText(args.time || "");
      if (!time) return { ok: false, error: "Could not understand the time. Ask the senior to repeat it." };
      st.saveReminder({ label: args.what || "Reminder", kind: "other", time, enabled: true });
      return { ok: true, reminder: args.what, time };
    }
    case "find_activity":
      return { activities: ACTIVITIES.slice(0, 3) };
    case "check_scheme":
      return checkSchemeAnswer(args.question || "");
    default:
      return { ok: false, error: `Unknown tool ${name}` };
  }
}

/** Scripted replies for typed demo mode. Not AI. Just enough to show the flows. */
export function localReply(text: string): string {
  const st = useJaga.getState();
  const t = text.toLowerCase();

  const hit = checkEmergencyKeywords(text);
  if (hit) {
    st.flagRisk("emergency", hit.reason, "keyword");
    return "This sounds serious. Please call 995 now. I have told your family and your Active Ageing Centre.";
  }
  if (/dizz|giddy|vomit|nausea|side effect|swollen|new pain/.test(t)) {
    st.flagRisk("urgent", `Senior reported: ${text.slice(0, 80)}`, "kaki");
    return `I'm sorry you feel unwell. Please sit down and call the nurse hotline at ${NURSE_HOTLINE}. I have also told your Active Ageing Centre. I cannot diagnose, so please check with your doctor or pharmacist.`;
  }
  if (/lonely|alone|sad|no one|nobody|depress|worried/.test(t)) {
    st.flagRisk("wellbeing", `Senior said: ${text.slice(0, 80)}`, "kaki");
    const acts = ACTIVITIES.slice(0, 3).map((a) => `${a.name} (${a.when})`).join("; ");
    return `Thank you for telling me. You are not alone. Someone from your Active Ageing Centre will call you within 24 hours. In the meantime, there are activities nearby: ${acts}.`;
  }
  if (/remind/.test(t)) {
    const time = parseTimeText(text);
    if (time) {
      const label = text.replace(/remind me (to )?/i, "").replace(/\bat\b.*$/i, "").trim() || "Reminder";
      st.saveReminder({ label, kind: "other", time, enabled: true });
      return `Okay, I added a reminder: "${label}" at ${time}. You can see it in Smart reminders.`;
    }
    return "Sure. What time should I remind you?";
  }
  if (/activit|bored|class|exercise|tai chi|something to do/.test(t)) {
    return "Here are 3 activities near you: " + ACTIVITIES.slice(0, 3).map((a) => `${a.name} at ${a.where}, ${a.when}`).join("; ") + ".";
  }
  if (/scheme|chas|medisave|subsid|grant|help with cost|money/.test(t)) {
    const r = checkSchemeAnswer(text);
    return r.schemes.slice(0, 3).map((s) => `${s.name}: ${s.explanation}`).join(" ") + " Ask your AAC staff to help you apply.";
  }
  if (/medic|pill|tablet|dose/.test(t)) {
    return "I cannot change your medicine. Please follow what your doctor said. If you are unsure, ask your doctor or pharmacist.";
  }
  return "I'm here to listen. You can ask me about your health habits, activities nearby, or schemes. (Typed demo mode: connect an OpenAI key for full voice.)";
}
