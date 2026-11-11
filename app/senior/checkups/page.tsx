"use client";
import { useState } from "react";
import { CalendarCheck, CheckCircle2, MapPin } from "lucide-react";
import { useJaga } from "@/lib/store";
import { latestCompleted, nextBooking } from "@/lib/selectors";
import { fmtDate, fmtDateLong, fmtDateTime } from "@/lib/time";
import type { Booking } from "@/lib/types";

function Results({ b }: { b: Booking }) {
  if (!b.results) return null;
  const rows = [
    ["Blood pressure", b.results.bp, b.results.bpNote],
    ["Blood sugar (glucose)", b.results.glucose, b.results.glucoseNote],
    ["Cholesterol", b.results.cholesterol, b.results.cholesterolNote],
  ];
  return (
    <div className="space-y-2">
      <p className="text-lg text-navy/80">Demo results, not real medical data.</p>
      {rows.map(([label, value, note]) => (
        <div key={label} className="rounded-xl bg-white p-3">
          <p className="text-lg font-medium text-teal">{label}</p>
          <p className="text-2xl font-semibold">{value}</p>
          <p className="text-lg">{note}</p>
        </div>
      ))}
    </div>
  );
}

export default function Checkups() {
  const slots = useJaga((s) => s.slots);
  const bookings = useJaga((s) => s.bookings);
  const clock = useJaga((s) => s.clock);
  const book = useJaga((s) => s.bookSlot);
  const upcoming = useJaga((s) => nextBooking(s));
  const latest = useJaga((s) => latestCompleted(s));
  const [tab, setTab] = useState<"regular" | "first">("regular");

  const bookedIds = new Set(bookings.filter((b) => b.status === "booked").map((b) => b.slotId));
  const list = slots
    .filter((sl) => sl.ts >= clock && (tab === "first" ? sl.baseline : true))
    .sort((a, b) => a.ts - b.ts)
    .slice(0, 4);

  return (
    <div className="space-y-5">
      <h1 className="h1">Check-ups</h1>

      {upcoming && (
        <section className="card border-2 border-teal">
          <h2 className="h2 flex items-center gap-2"><CalendarCheck aria-hidden /> You are booked</h2>
          <p className="text-xl">{upcoming.venue}<br />{fmtDateTime(upcoming.ts)}</p>
          {upcoming.baseline && <span className="chip mt-2 bg-gold">First-time baseline screening</span>}
        </section>
      )}

      {latest && (
        <section className="card space-y-3">
          <h2 className="h2">Your latest results</h2>
          <p className="text-lg">{latest.venue} · {fmtDateLong(latest.completedAt ?? latest.ts)}</p>
          <Results b={latest} />
          {latest.nextDue && (
            <div className="rounded-xl border-2 border-gold bg-gold/20 p-3">
              <p className="text-xl font-semibold">Next check-up recommended: {fmtDateLong(latest.nextDue.ts)}</p>
              <p className="text-lg">{latest.nextDue.reason}</p>
            </div>
          )}
        </section>
      )}

      <section className="space-y-3" aria-label="Find a check-up">
        <h2 className="h2">Find a check-up near you</h2>
        <div className="grid grid-cols-2 gap-2" role="tablist">
          <button role="tab" aria-selected={tab === "regular"} onClick={() => setTab("regular")}
            className={`btn !px-2 ${tab === "regular" ? "btn-primary" : "btn-secondary"}`}>All check-ups</button>
          <button role="tab" aria-selected={tab === "first"} onClick={() => setTab("first")}
            className={`btn !px-2 ${tab === "first" ? "btn-primary" : "btn-secondary"}`}>First time?</button>
        </div>
        {tab === "first" && (
          <p className="rounded-xl bg-panel p-3 text-lg">
            <strong>Baseline screening</strong> checks your blood pressure, blood sugar (glucose) and cholesterol. It is a good first step if you have never had a check-up.
          </p>
        )}
        {list.length === 0 && <p className="text-xl">No slots right now. Please check again soon.</p>}
        {list.map((sl) => {
          const booked = bookedIds.has(sl.id);
          return (
            <div key={sl.id} className="card space-y-2">
              <div className="flex items-start justify-between gap-2">
                <p className="text-xl font-semibold">{sl.venue}</p>
                <span className="chip bg-panel">{sl.kind === "AAC" ? "AAC" : "Community Centre"}</span>
              </div>
              <p className="text-xl">{fmtDate(sl.ts)}, {new Date(sl.ts).toLocaleTimeString("en-SG", { hour: "numeric", minute: "2-digit" })}</p>
              <p className="flex items-center gap-1 text-lg"><MapPin size={18} aria-hidden /> {sl.distance} away</p>
              {sl.baseline && <span className="chip bg-gold">Baseline: BP, glucose, cholesterol</span>}
              {booked ? (
                <p className="flex items-center gap-2 text-xl font-semibold text-teal"><CheckCircle2 aria-hidden /> Booked</p>
              ) : (
                <button className="btn btn-primary" onClick={() => book(sl.id)}>Book this slot</button>
              )}
            </div>
          );
        })}
      </section>
    </div>
  );
}
