// Backup safety net that runs in the browser on everything the senior says or types.
// Even if the AI model forgets to call flag_risk, these phrases still raise an emergency.
// Covers English, Mandarin (+ common Cantonese/Hokkien written forms), Malay and Tamil.

interface Rule {
  re: RegExp;
  reason: string;
}

const RULES: Rule[] = [
  // English
  { re: /chest (pain|tight)|pain in (my )?chest|heart attack/i, reason: "chest pain" },
  { re: /can'?t breathe|cannot breathe|can not breathe|hard to breathe|short of breath|difficulty breathing/i, reason: "cannot breathe" },
  { re: /\bi (have )?(fell|fallen)\b|\bi fell\b|fell down|can'?t get up|cannot get up/i, reason: "fall at home" },
  { re: /want to die|wanna die|kill myself|end my life|don'?t want to live/i, reason: "wants to die" },
  { re: /\bstroke\b|face (is )?drooping|unconscious|bleeding (a lot|heavily)/i, reason: "possible stroke or heavy bleeding" },
  // Mandarin / Cantonese / Hokkien (written Chinese)
  { re: /胸痛|胸口痛|胸口很痛|心口痛|心脏病/, reason: "chest pain" },
  { re: /喘不过气|呼吸困难|透不过气|唔够气|喘唔到气|无法呼吸|不能呼吸/, reason: "cannot breathe" },
  { re: /跌倒|摔倒|跌低|我跌了|爬不起来|起不来/, reason: "fall at home" },
  { re: /想死|不想活|想自杀|唔想活|活不下去/, reason: "wants to die" },
  // Malay
  { re: /sakit dada/i, reason: "chest pain" },
  { re: /tak boleh bernafas|sukar bernafas|sesak nafas|susah bernafas/i, reason: "cannot breathe" },
  { re: /saya jatuh|aku jatuh|terjatuh|tak boleh bangun/i, reason: "fall at home" },
  { re: /nak mati|ingin mati|mahu mati|tak nak hidup/i, reason: "wants to die" },
  // Tamil
  { re: /நெஞ்சு வலி|நெஞ்சில் வலி/, reason: "chest pain" },
  { re: /மூச்சு (விட )?முடியவில்லை|மூச்சுத் திணறல்/, reason: "cannot breathe" },
  { re: /விழுந்துவிட்டேன்|கீழே விழுந்தேன்|எழுந்திருக்க முடியவில்லை/, reason: "fall at home" },
  { re: /சாக வேண்டும்|சாகணும்|வாழ விரும்பவில்லை/, reason: "wants to die" },
];

export interface EmergencyHit {
  reason: string;
}

export function checkEmergencyKeywords(text: string): EmergencyHit | null {
  for (const r of RULES) if (r.re.test(text)) return { reason: r.reason };
  return null;
}
