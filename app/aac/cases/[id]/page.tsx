"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, CheckCheck, Home, Phone, UserPlus } from "lucide-react";
import { useJaga } from "@/lib/store";
import { SCHEMES, VOLUNTEERS, ageOf, seniorById } from "@/lib/mockData";
import { missedDoses7d } from "@/lib/selectors";
import { fmtDateTime, relTime } from "@/lib/time";
import { UrgencyBadge } from "@/components/ui";

export default function CaseDetail() {
  const { id } = useParams<{ id: string }>();
  const s = useJaga();
  const [volunteer, setVolunteer] = useState(VOLUNTEERS[0]);
  const c = s.cases.find((x) => x.id === id);

  if (!c) return <div><Link href="/aac" className="underline">Back to cases</Link><p className="mt-4">Case not found.</p></div>;

  const sn = seniorById(c.seniorId);
  const profile = sn.id === "tan" ? s.profile : sn.profile;
  const unclaimed = SCHEMES.filter((sc) => sc.eligible(profile, ageOf(profile, s.clock)) && !sn.schemesHeld.includes(sc.id));
  const closed = c.status === "resolved";
  const btn = "btn btn-secondary !justify-start";

  return (
    <div className="space-y-6">
      <Link href="/aac" className="inline-flex items-center gap-2 text-lg text-teal underline"><ArrowLeft size={18} aria-hidden /> All cases</Link>
      <div className="flex flex-wrap items-center gap-3">
        <UrgencyBadge urgency={c.urgency} />
        <span className="chip bg-panel">{c.status === "resolved" ? "Resolved" : c.status === "in_progress" ? "In progress" : "Open"}</span>
      </div>
      <h1 className="font-display text-5xl leading-tight text-teal">{c.title}</h1>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="card">
            <h2 className="font-display text-2xl text-teal">Why this was flagged</h2>
            <p className="mt-1 text-lg">{c.reason}</p>
            {c.dueBy && !closed && <p className="mt-2 font-semibold text-amber">Call within 24 hours · due {fmtDateTime(c.dueBy)}</p>}
            {c.homeVisitAt && <p className="mt-2 font-semibold">Home visit: {fmtDateTime(c.homeVisitAt)}</p>}
            {c.assignedVolunteer && <p className="mt-1 font-semibold">Volunteer: {c.assignedVolunteer}</p>}
          </section>

          <section className="card">
            <h2 className="font-display text-2xl text-teal">Timeline</h2>
            <ol className="mt-2 space-y-3 border-l-4 border-panel pl-4">
              {c.timeline.map((t, i) => (
                <li key={i}>
                  <p className="text-sm text-navy/70">{fmtDateTime(t.ts)} · {t.who}</p>
                  <p className="text-lg">{t.text}</p>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <div className="space-y-6">
          <section className="card space-y-2">
            <h2 className="font-display text-2xl text-teal">Actions</h2>
            <button className={btn} disabled={closed} onClick={() => s.aacAction(c.id, "called")}><Phone size={18} aria-hidden /> Called</button>
            <button className={btn} disabled={closed} onClick={() => s.aacAction(c.id, "visit")}><Home size={18} aria-hidden /> Home visit scheduled</button>
            <div className="flex gap-2">
              <select aria-label="Choose volunteer" className="min-h-[44px] flex-1 rounded-xl border-2 border-panel bg-white px-2" value={volunteer} onChange={(e) => setVolunteer(e.target.value)}>
                {VOLUNTEERS.map((v) => <option key={v}>{v}</option>)}
              </select>
              <button className="btn btn-secondary btn-sm" disabled={closed} onClick={() => s.aacAction(c.id, "volunteer", volunteer)}><UserPlus size={18} aria-hidden /> Assign volunteer</button>
            </div>
            <button className="btn btn-primary !justify-start" disabled={closed} onClick={() => s.aacAction(c.id, "resolved")}><CheckCheck size={18} aria-hidden /> Resolved</button>
          </section>

          <section className="card">
            <h2 className="font-display text-2xl text-teal">Senior profile</h2>
            <dl className="mt-2 space-y-1 text-base">
              <div><dt className="inline font-semibold">Name: </dt><dd className="inline">{sn.name}, {sn.age}</dd></div>
              <div><dt className="inline font-semibold">Address: </dt><dd className="inline">{sn.block}</dd></div>
              <div><dt className="inline font-semibold">Lives: </dt><dd className="inline">{sn.livesWith}</dd></div>
              <div><dt className="inline font-semibold">Conditions: </dt><dd className="inline">{sn.conditions.join(", ")}</dd></div>
              <div><dt className="inline font-semibold">Languages: </dt><dd className="inline">{sn.languages.join(", ")}</dd></div>
              <div><dt className="inline font-semibold">Caregiver: </dt><dd className="inline">{sn.caregiver ?? "None on file"}</dd></div>
              <div><dt className="inline font-semibold">Missed doses (7 days): </dt><dd className="inline">{missedDoses7d(s, sn)}</dd></div>
              <div><dt className="inline font-semibold">Schemes held: </dt><dd className="inline">{sn.schemesHeld.map((h) => SCHEMES.find((x) => x.id === h)?.name).join(", ")}</dd></div>
              {unclaimed.length > 0 && <div><dt className="inline font-semibold text-amber">May qualify, not yet on: </dt><dd className="inline">{unclaimed.map((u) => u.name).join(", ")}</dd></div>}
              <div><dt className="inline font-semibold">Phone: </dt><dd className="inline">{sn.phone}</dd></div>
            </dl>
            <p className="mt-2 text-sm text-navy/70">Created {relTime(c.createdAt, s.clock)}. Mock data.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
