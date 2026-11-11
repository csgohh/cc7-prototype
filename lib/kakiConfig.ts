// Client-safe Kaki configuration (languages, modes, tool definitions).
// The system prompt itself lives in lib/kakiPrompt.ts and is only imported on the server.

export type KakiMode = "ask" | "chat";

export const MODES: { id: KakiMode; label: string }[] = [
  { id: "ask", label: "Ask a question" },
  { id: "chat", label: "Just chat" },
];

export const LANGUAGES = [
  { id: "auto", label: "Auto (English / Singlish)" },
  { id: "en", label: "English / Singlish" },
  { id: "zh", label: "Mandarin (华语)" },
  { id: "yue", label: "Cantonese (广东话)" },
  { id: "nan", label: "Hokkien (beta)" },
  { id: "ms", label: "Malay (Bahasa Melayu)" },
  { id: "ta", label: "Tamil (தமிழ்)" },
] as const;
export type KakiLanguage = (typeof LANGUAGES)[number]["id"];

/** Tools the Realtime model may call. Executed in the browser (lib/kakiRuntime.ts). */
export const KAKI_TOOLS = [
  {
    type: "function",
    name: "flag_risk",
    description:
      "Raise a safety flag when the senior mentions something risky. Use level 'emergency' for chest pain, cannot breathe, a fall they cannot recover from, stroke signs, or wanting to die. Use 'urgent' for symptoms that need a nurse soon (dizziness, vomiting, new pain, medicine side effects). Use 'wellbeing' for loneliness, low mood, or worry that needs a kind phone call.",
    parameters: {
      type: "object",
      properties: {
        level: { type: "string", enum: ["emergency", "urgent", "wellbeing"] },
        reason: { type: "string", description: "Short plain-language reason, in English." },
      },
      required: ["level", "reason"],
    },
  },
  {
    type: "function",
    name: "set_reminder",
    description: "Add a reminder to the senior's reminder list.",
    parameters: {
      type: "object",
      properties: {
        what: { type: "string", description: "What to be reminded about, e.g. 'Take blood pressure tablet'." },
        time: { type: "string", description: "Time of day, e.g. '8:00 am' or '20:00'." },
      },
      required: ["what", "time"],
    },
  },
  {
    type: "function",
    name: "find_activity",
    description: "Find 3 activities at nearby Active Ageing Centres. Use when the senior is bored, lonely, or asks what to do.",
    parameters: { type: "object", properties: {} },
  },
  {
    type: "function",
    name: "check_scheme",
    description: "Look up government help schemes (CHAS, MediSave, Merdeka Generation, Silver Support, etc.) from the app's mock data.",
    parameters: {
      type: "object",
      properties: { question: { type: "string", description: "The senior's question about help or subsidies." } },
      required: ["question"],
    },
  },
] as const;
