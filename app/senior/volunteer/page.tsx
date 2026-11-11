"use client";
import { CheckCircle2, Clock, MapPin } from "lucide-react";
import { useJaga } from "@/lib/store";
import { VOLUNTEER_OPPS } from "@/lib/mockData";
import { fmtDate } from "@/lib/time";

export default function Volunteer() {
  const history = useJaga((s) => s.volunteer);
  const signUp = useJaga((s) => s.signUpVolunteer);
  const signed = new Set(history.filter((v) => v.status === "signed-up").map((v) => v.oppId));
  return (
    <div className="space-y-5">
      <h1 className="h1">Volunteer with us</h1>
      <p className="text-xl">Your time and experience matter. Pick something that suits you.</p>
      {VOLUNTEER_OPPS.map((o) => (
        <div key={o.id} className="card space-y-2">
          <h2 className="h2">{o.title}</h2>
          <p className="text-xl">{o.about}</p>
          <p className="flex items-center gap-2 text-lg"><MapPin size={18} aria-hidden /> {o.place}</p>
          <p className="flex items-center gap-2 text-lg"><Clock size={18} aria-hidden /> {o.when}</p>
          {signed.has(o.id) ? (
            <p className="flex items-center gap-2 text-xl font-semibold text-teal"><CheckCircle2 aria-hidden /> You signed up. We will call you.</p>
          ) : (
            <button className="btn btn-primary" onClick={() => signUp(o.id, o.title, o.place)}>Sign up</button>
          )}
        </div>
      ))}
      <section>
        <h2 className="h2">My volunteering</h2>
        <ul className="mt-2 space-y-2">
          {history.map((v) => (
            <li key={v.id} className="rounded-xl border border-panel p-3">
              <p className="text-xl font-medium">{v.title}</p>
              <p className="text-lg">{v.place} · {fmtDate(v.ts)} · {v.status === "done" ? "Completed" : "Signed up"}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
