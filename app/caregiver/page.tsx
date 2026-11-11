"use client";
import Link from "next/link";
import { Bell, CalendarCheck, Camera, Check, Eye, EyeOff, Pill, X } from "lucide-react";
import { useJaga } from "@/lib/store";
import { nextBooking, todayDoses } from "@/lib/selectors";
import { fmtDateTime, fmtHHMM, relTime } from "@/lib/time";

export default function CaregiverHome() {
  const s = useJaga();
  const doses = todayDoses(s);
  const next = nextBooking(s);
  const latest = s.alerts.filter((a) => s.caregiverLevel === "all" || a.severity !== "info")[0];
  const photoCount = doses.filter((d) => d.rec.status === "taken" && "photo" in d.rec && d.rec.photo).length;

  return (
    <>
      <section className="card">
        <p className="text-base font-medium uppercase tracking-wide text-teal">You are caring for</p>
        <h1 className="font-display text-4xl text-navy">Mr Tan Ah Huat, 74</h1>
        <p>Lives with wife · Hypertension, diabetes</p>
        <p className="mt-2 flex items-center gap-2 text-base">
          <Eye size={18} aria-hidden /> You only see what Mr Tan has chosen to share.
          <Link href="/caregiver/settings" className="underline">See details</Link>
        </p>
      </section>

      <section className={`rounded-2xl border-2 p-4 ${latest?.status !== "resolved" && latest ? (latest.severity === "emergency" ? "border-alert bg-alert/10" : "border-gold bg-gold/20") : "border-panel bg-card"}`}>
        <h2 className="flex items-center gap-2 font-display text-2xl text-teal"><Bell size={22} aria-hidden /> Latest alert</h2>
        {latest ? (
          <>
            <p className="font-semibold">{latest.title}</p>
            <p>{latest.kind === "medication" && !s.sharing.medication ? latest.safeDetail : latest.detail}</p>
            <p className="text-base text-navy/70">{relTime(latest.createdAt, s.clock)} · {latest.status === "resolved" ? "Resolved" : "Needs attention"}</p>
            <Link href="/caregiver/alerts" className="btn btn-primary btn-sm mt-3">Open alerts</Link>
          </>
        ) : <p>No alerts. All good.</p>}
      </section>

      <section className="card">
        <h2 className="flex items-center gap-2 font-display text-2xl text-teal"><Pill size={22} aria-hidden /> Today&apos;s medicines</h2>
        {s.sharing.medication ? (
          <ul className="mt-2 space-y-2">
            {doses.map(({ med, rec }) => (
              <li key={med.id} className="flex items-center justify-between">
                <span>{med.name} <span className="text-base text-navy/70">({fmtHHMM(med.time)})</span></span>
                <span className={`chip ${rec.status === "taken" ? "bg-teal text-white" : rec.status === "missed" ? "bg-alert text-white" : "bg-gold text-navy"}`}>
                  {rec.status === "taken" ? <Check size={16} aria-hidden /> : rec.status === "missed" ? <X size={16} aria-hidden /> : null}
                  {rec.status === "taken" ? "Taken" : rec.status === "missed" ? "Missed" : "Not yet"}
                </span>
              </li>
            ))}
          </ul>
        ) : <p className="mt-1 flex items-center gap-2"><EyeOff size={18} aria-hidden /> Mr Tan has not shared this.</p>}
      </section>

      <section className="card">
        <h2 className="flex items-center gap-2 font-display text-2xl text-teal"><CalendarCheck size={22} aria-hidden /> Upcoming check-up</h2>
        {s.sharing.checkups
          ? next ? <p className="mt-1">{next.venue}<br />{fmtDateTime(next.ts)}</p> : <p className="mt-1">No check-up booked.</p>
          : <p className="mt-1 flex items-center gap-2"><EyeOff size={18} aria-hidden /> Mr Tan has not shared this.</p>}
      </section>

      <section className="card">
        <h2 className="flex items-center gap-2 font-display text-2xl text-teal"><Camera size={22} aria-hidden /> Medicine photos</h2>
        {s.sharing.photos
          ? <p className="mt-1">Shared. {photoCount} photo{photoCount === 1 ? "" : "s"} taken today. (Photos stay on Mr Tan&apos;s phone in this demo.)</p>
          : <p className="mt-1 flex items-center gap-2"><EyeOff size={18} aria-hidden /> Not shared (default).</p>}
      </section>
    </>
  );
}
