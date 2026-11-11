"use client";
import { useState } from "react";
import { Bell, ChevronRight, Plus, Save, Trash2, X } from "lucide-react";
import { useJaga } from "@/lib/store";
import BigTimePicker from "@/components/BigTimePicker";
import { fmtHHMM } from "@/lib/time";
import type { Reminder } from "@/lib/types";

const KINDS: { id: Reminder["kind"]; label: string }[] = [
  { id: "medication", label: "Medicine" },
  { id: "appointment", label: "Appointment" },
  { id: "checkup", label: "Check-up" },
  { id: "other", label: "Other" },
];

const blank = (): Omit<Reminder, "id"> & { id?: string } => ({ label: "", kind: "medication", time: "08:00", enabled: true });

export default function Reminders() {
  const reminders = useJaga((s) => s.reminders);
  const save = useJaga((s) => s.saveReminder);
  const del = useJaga((s) => s.deleteReminder);
  const push = useJaga((s) => s.pushBanner);
  const [draft, setDraft] = useState<(Omit<Reminder, "id"> & { id?: string }) | null>(null);

  if (draft) {
    return (
      <div className="space-y-4">
        <h1 className="h1">{draft.id ? "Edit reminder" : "New reminder"}</h1>
        <label className="block">
          <span className="mb-1 block text-xl font-medium">What should I remind you?</span>
          <input className="input" value={draft.label} onChange={(e) => setDraft({ ...draft, label: e.target.value })} placeholder="e.g. Take my tablet" />
        </label>
        <fieldset>
          <legend className="mb-1 text-xl font-medium">Type</legend>
          <div className="grid grid-cols-2 gap-2">
            {KINDS.map((k) => (
              <button key={k.id} type="button" aria-pressed={draft.kind === k.id}
                onClick={() => setDraft({ ...draft, kind: k.id })}
                className={`btn !px-2 ${draft.kind === k.id ? "btn-primary" : "btn-secondary"}`}>{k.label}</button>
            ))}
          </div>
        </fieldset>
        <div>
          <p className="mb-1 text-xl font-medium">What time?</p>
          <BigTimePicker value={draft.time} onChange={(time) => setDraft({ ...draft, time })} />
        </div>
        <button className="btn btn-primary" disabled={!draft.label.trim()} onClick={() => { save({ ...draft, label: draft.label.trim() }); setDraft(null); }}>
          <Save aria-hidden /> Save reminder
        </button>
        <div className="grid grid-cols-2 gap-2">
          <button className="btn btn-secondary" onClick={() => setDraft(null)}><X aria-hidden /> Cancel</button>
          {draft.id && <button className="btn btn-secondary !border-alert !text-alert" onClick={() => { del(draft.id!); setDraft(null); }}><Trash2 aria-hidden /> Delete</button>}
        </div>
      </div>
    );
  }

  const sorted = [...reminders].sort((a, b) => a.time.localeCompare(b.time));
  return (
    <div className="space-y-4">
      <h1 className="h1">Smart reminders</h1>
      <button className="btn btn-primary" onClick={() => setDraft(blank())}><Plus aria-hidden /> Add a reminder</button>
      <button className="btn btn-secondary" onClick={() => push("senior", "Reminder: morning medicines", "It is 8:00 am. Time to take your medicines.", "reminder")}>
        <Bell aria-hidden /> Show a sample alert
      </button>
      <p className="text-lg">Tap a reminder to change it. Alerts appear at the top of your screen.</p>
      <ul className="space-y-2">
        {sorted.map((r) => (
          <li key={r.id}>
            <button onClick={() => setDraft(r)} className="flex min-h-[72px] w-full items-center justify-between gap-3 rounded-2xl border-2 border-panel bg-card p-4 text-left">
              <span>
                <span className="block text-xl font-semibold">{r.label}</span>
                <span className="block text-lg">{fmtHHMM(r.time)}{r.date ? ` · ${r.date}` : " · every day"} · {KINDS.find((k) => k.id === r.kind)?.label}</span>
              </span>
              <ChevronRight aria-hidden />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
