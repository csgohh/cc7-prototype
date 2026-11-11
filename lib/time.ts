// Small date helpers. All dates use the viewer's local time.

export const HOUR = 60 * 60 * 1000;
export const DAY = 24 * HOUR;

export function dateKey(ts: number): string {
  const d = new Date(ts);
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

export function at(ts: number, hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  const d = new Date(ts);
  d.setHours(h, m, 0, 0);
  return d.getTime();
}

export const fmtDate = (ts: number) =>
  new Date(ts).toLocaleDateString("en-SG", { weekday: "short", day: "numeric", month: "short" });

export const fmtDateLong = (ts: number) =>
  new Date(ts).toLocaleDateString("en-SG", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

export const fmtTime = (ts: number) =>
  new Date(ts).toLocaleTimeString("en-SG", { hour: "numeric", minute: "2-digit" });

export const fmtDateTime = (ts: number) => `${fmtDate(ts)}, ${fmtTime(ts)}`;

/** "08:00" -> "8:00 am" */
export function fmtHHMM(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  const suffix = h >= 12 ? "pm" : "am";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${suffix}`;
}

export function greeting(ts: number): string {
  const h = new Date(ts).getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

/** "3 hours ago", "in 2 days" relative to `now`. */
export function relTime(ts: number, now: number): string {
  const diff = ts - now;
  const abs = Math.abs(diff);
  const mins = Math.round(abs / 60000);
  let text: string;
  if (mins < 1) return "just now";
  if (mins < 60) text = `${mins} min`;
  else if (abs < DAY) text = `${Math.round(abs / HOUR)} hr`;
  else text = `${Math.round(abs / DAY)} day${Math.round(abs / DAY) === 1 ? "" : "s"}`;
  return diff < 0 ? `${text} ago` : `in ${text}`;
}

/** Lenient time parser for voice/text input: "8am", "8:30 pm", "20:00", "7 in the evening". */
export function parseTimeText(input: string): string | null {
  const s = input.toLowerCase().trim();
  const m = s.match(/(\d{1,2})(?:[:.h](\d{2}))?\s*(a\.?m\.?|p\.?m\.?)?/);
  if (!m) return null;
  let h = parseInt(m[1], 10);
  const min = m[2] ? parseInt(m[2], 10) : 0;
  let suffix = m[3]?.replace(/\./g, "");
  if (!suffix) {
    if (/morning/.test(s)) suffix = "am";
    else if (/(evening|night|afternoon)/.test(s)) suffix = "pm";
  }
  if (suffix === "pm" && h < 12) h += 12;
  if (suffix === "am" && h === 12) h = 0;
  if (h > 23 || min > 59) return null;
  return `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
}
