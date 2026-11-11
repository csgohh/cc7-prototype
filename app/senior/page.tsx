"use client";
import Link from "next/link";
import { CalendarCheck, ChevronRight, HandHeart, HeartPulse, MessageCircle, Pill } from "lucide-react";
import { useJaga } from "@/lib/store";
import { latestCompleted, needsExtraSupport, nextBooking, todayDoses } from "@/lib/selectors";
import { fmtDate, fmtDateTime, greeting } from "@/lib/time";

export default function SeniorHome() {
  const s = useJaga();
  const doses = todayDoses(s);
  const taken = doses.filter((d) => d.rec.status === "taken").length;
  const missed = doses.filter((d) => d.rec.status === "missed").length;
  const next = nextBooking(s);
  const done = latestCompleted(s);
  const medStatus = taken === doses.length ? "All done" : missed ? "Missed" : "To do";
  const medStyle = taken === doses.length ? "bg-teal text-white" : missed ? "bg-alert text-white" : "bg-gold text-navy";

  return (
    <div className="space-y-4">
      <h1 className="font-display text-5xl leading-tight text-teal">{greeting(s.clock)}, Mr Tan</h1>

      {needsExtraSupport(s) && (
        <div className="flex gap-3 rounded-2xl border-2 border-gold bg-gold/25 p-4" role="status">
          <HeartPulse className="mt-1 shrink-0 text-amber" aria-hidden />
          <p><strong>Extra support recommended.</strong> Your Active Ageing Centre may call you. You can also tap &quot;Call for help&quot; any time.</p>
        </div>
      )}

      <Link href="/senior/kaki" className="btn btn-primary !min-h-[88px] !text-3xl">
        <MessageCircle size={36} aria-hidden /> Talk to Kaki
      </Link>

      <Link href="/senior/medication" className="card block">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-display text-3xl text-teal"><Pill aria-hidden /> Today&apos;s medication</h2>
          <ChevronRight aria-hidden />
        </div>
        <p className="mt-1 text-xl">{taken} of {doses.length} taken</p>
        <span className={`chip mt-2 ${medStyle}`}>{medStatus}</span>
      </Link>

      <Link href="/senior/checkups" className="card block">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-display text-3xl text-teal"><CalendarCheck aria-hidden /> Next check-up</h2>
          <ChevronRight aria-hidden />
        </div>
        {next ? (
          <p className="mt-1 text-xl">{next.venue}<br />{fmtDateTime(next.ts)}</p>
        ) : done?.nextDue ? (
          <p className="mt-1 text-xl">Recommended: {fmtDate(done.nextDue.ts)}<br /><span className="text-lg">{done.nextDue.reason}</span></p>
        ) : (
          <p className="mt-1 text-xl">No check-up booked. Tap to find one.</p>
        )}
      </Link>

      <Link href="/senior/volunteer" className="card block">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-display text-3xl text-teal"><HandHeart aria-hidden /> Volunteer with us</h2>
          <ChevronRight aria-hidden />
        </div>
        <p className="mt-1 text-xl">Share your time. Befriend a neighbour or help at your AAC.</p>
      </Link>
    </div>
  );
}
