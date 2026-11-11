"use client";
import { useState } from "react";
import { ArrowLeft, CheckCircle2, HandHelping } from "lucide-react";
import { useJaga } from "@/lib/store";
import { SCHEMES, SENIORS, TAN_ID, ageOf } from "@/lib/mockData";
import { ScamWarning } from "@/components/ui";
import type { SchemeProfile } from "@/lib/types";

const held = SENIORS.find((s) => s.id === TAN_ID)!.schemesHeld;

// Short questionnaire: one question per screen, max 3 big answers each.
const QUESTIONS: { key: keyof SchemeProfile; q: string; options: { label: string; value: SchemeProfile[keyof SchemeProfile] }[] }[] = [
  { key: "birthYear", q: "When were you born?", options: [{ label: "Before 1950", value: 1945 }, { label: "1950 to 1959", value: 1955 }, { label: "1960 or later", value: 1962 }] },
  { key: "citizen", q: "Are you a Singapore Citizen?", options: [{ label: "Singapore Citizen", value: "citizen" }, { label: "Permanent Resident", value: "pr" }, { label: "Other", value: "other" }] },
  { key: "income", q: "About how much does each person at home earn a month?", options: [{ label: "Below $1,200", value: "low" }, { label: "$1,200 to $2,500", value: "mid" }, { label: "Above $2,500", value: "high" }] },
  { key: "housing", q: "What kind of home do you live in?", options: [{ label: "HDB 1 to 3 room", value: "hdb-small" }, { label: "HDB 4 room or bigger", value: "hdb-large" }, { label: "Private home", value: "private" }] },
  { key: "livesAlone", q: "Do you live alone?", options: [{ label: "Yes, I live alone", value: true }, { label: "No, I live with others", value: false }] },
  { key: "dailyHelp", q: "Do you need help with bathing, dressing or walking?", options: [{ label: "No help", value: "none" }, { label: "A little help", value: "some" }, { label: "A lot of help", value: "a-lot" }] },
];

export default function Schemes() {
  const profile = useJaga((s) => s.profile);
  const clock = useJaga((s) => s.clock);
  const cases = useJaga((s) => s.cases);
  const setProfile = useJaga((s) => s.setProfile);
  const askHelp = useJaga((s) => s.requestSchemeHelp);
  const [step, setStep] = useState<number | null>(null);
  const [draft, setDraft] = useState<SchemeProfile>(profile);

  if (step !== null) {
    const q = QUESTIONS[step];
    return (
      <div className="space-y-4">
        <p className="text-lg font-medium text-teal">Question {step + 1} of {QUESTIONS.length}</p>
        <h1 className="font-display text-4xl leading-tight text-teal">{q.q}</h1>
        {q.options.map((o) => (
          <button key={o.label} className="btn btn-secondary !min-h-[68px]" onClick={() => {
            const next = { ...draft, [q.key]: o.value } as SchemeProfile;
            setDraft(next);
            if (step + 1 < QUESTIONS.length) setStep(step + 1);
            else { setProfile(next); setStep(null); }
          }}>{o.label}</button>
        ))}
        <button className="flex min-h-[48px] items-center gap-2 text-lg text-teal underline" onClick={() => (step === 0 ? setStep(null) : setStep(step - 1))}>
          <ArrowLeft size={20} aria-hidden /> Back
        </button>
      </div>
    );
  }

  const age = ageOf(profile, clock);
  const have = SCHEMES.filter((s) => held.includes(s.id));
  const may = SCHEMES.filter((s) => !held.includes(s.id) && s.eligible(profile, age));
  const asked = (name: string) => cases.some((c) => c.seniorId === TAN_ID && c.title === `Help applying: ${name}` && c.status !== "resolved");

  return (
    <div className="space-y-5">
      <h1 className="h1">My schemes</h1>
      <ScamWarning />

      <section className="space-y-3">
        <h2 className="h2">Schemes you have</h2>
        {have.map((s) => (
          <div key={s.id} className="card">
            <p className="flex items-center gap-2 text-xl font-semibold"><CheckCircle2 className="text-teal" aria-hidden /> {s.name}</p>
            <p className="text-xl">{s.plain}</p>
          </div>
        ))}
      </section>

      <section className="space-y-3">
        <h2 className="h2">You may qualify for</h2>
        <p className="text-lg text-navy/80">Demo matching based on your answers. Not official. AAC staff will check for you.</p>
        {may.length === 0 && <p className="text-xl">Nothing new right now.</p>}
        {may.map((s) => (
          <div key={s.id} className="card space-y-2 border-2 border-gold">
            <p className="text-xl font-semibold">{s.name}</p>
            <p className="text-xl">{s.plain}</p>
            {asked(s.name) ? (
              <p className="flex items-center gap-2 text-xl font-semibold text-teal"><CheckCircle2 aria-hidden /> Asked. AAC will call you.</p>
            ) : (
              <button className="btn btn-primary" onClick={() => askHelp(s.name)}><HandHelping aria-hidden /> Ask AAC staff to help me apply</button>
            )}
          </div>
        ))}
      </section>

      <button className="btn btn-secondary" onClick={() => { setDraft(profile); setStep(0); }}>Update my answers</button>
    </div>
  );
}
