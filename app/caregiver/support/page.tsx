import { GraduationCap, Home, Users } from "lucide-react";
import { CAREGIVER_SUPPORT as C } from "@/lib/mockData";

export default function Support() {
  return (
    <>
      <h1 className="font-display text-4xl text-teal">Caregiver support</h1>
      <p className="chip bg-gold/30">Mock content for the prototype. Check official sources.</p>

      <section className="space-y-2">
        <h2 className="flex items-center gap-2 font-display text-2xl text-teal"><Home size={22} aria-hidden /> Respite care</h2>
        {C.respite.map((r) => (
          <div key={r.name} className="card"><p className="font-semibold">{r.name}</p><p>{r.text}</p></div>
        ))}
      </section>

      <section className="space-y-2">
        <h2 className="flex items-center gap-2 font-display text-2xl text-teal"><Users size={22} aria-hidden /> Support groups</h2>
        {C.groups.map((g) => (
          <div key={g.name} className="card"><p className="font-semibold">{g.name}</p><p>{g.text}</p></div>
        ))}
      </section>

      <section className="space-y-2">
        <h2 className="flex items-center gap-2 font-display text-2xl text-teal"><GraduationCap size={22} aria-hidden /> Training grant</h2>
        <div className="card"><p className="font-semibold">{C.grant.name}</p><p>{C.grant.text}</p></div>
      </section>
    </>
  );
}
