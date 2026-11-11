"use client";
import { useEffect, useRef, useState } from "react";
import { Camera, Check, CircleDashed, X } from "lucide-react";
import { useJaga } from "@/lib/store";
import { todayDoses } from "@/lib/selectors";
import { dayStatus, type DayStatus } from "@/lib/escalation";
import { DAY, fmtHHMM } from "@/lib/time";

const DAY_UI: Record<DayStatus, { text: string; cls: string; Icon: typeof Check }> = {
  taken: { text: "Taken", cls: "bg-teal text-white", Icon: Check },
  missed: { text: "Missed", cls: "bg-alert text-white", Icon: X },
  partial: { text: "Some", cls: "bg-gold text-navy", Icon: CircleDashed },
  pending: { text: "Today", cls: "bg-white text-navy border-2 border-teal", Icon: CircleDashed },
  nodata: { text: "No data", cls: "bg-panel text-navy", Icon: CircleDashed },
};

export default function Medication() {
  const s = useJaga();
  const takeDose = useJaga((st) => st.takeDose);
  const doses = todayDoses(s);
  const nextDose = doses.find((d) => d.rec.status !== "taken");
  const fileRef = useRef<HTMLInputElement>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [justTaken, setJustTaken] = useState<string | null>(null);

  // Photo stays in this phone's memory only. Nothing is uploaded or saved to the demo state.
  useEffect(() => () => { if (photoUrl) URL.revokeObjectURL(photoUrl); }, [photoUrl]);

  const week = Array.from({ length: 7 }, (_, i) => s.clock - (6 - i) * DAY);

  return (
    <div className="space-y-5">
      <h1 className="h1">Medication</h1>

      {nextDose ? (
        <section className="card space-y-3" aria-label="Next medicine">
          <p className="text-lg font-medium text-teal">
            {nextDose.rec.status === "missed" ? "Missed earlier. You can still take it:" : "Next medicine"}
          </p>
          <h2 className="font-display text-5xl leading-none">{nextDose.med.name}</h2>
          <p className="text-xl">{nextDose.med.dose} · {fmtHHMM(nextDose.med.time)}<br />{nextDose.med.purpose}. {nextDose.med.tip}</p>
          {photoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photoUrl} alt="Your photo, kept on this phone" className="h-40 w-full rounded-xl object-cover" />
          )}
          <button className="btn btn-primary !min-h-[72px] !text-2xl" onClick={() => { takeDose(nextDose.med.id, !!photoUrl); setJustTaken(nextDose.med.name); setPhotoUrl(null); }}>
            <Check size={30} aria-hidden /> I&apos;ve taken it
          </button>
          <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) setPhotoUrl(URL.createObjectURL(f)); }} />
          <button className="btn btn-secondary" onClick={() => fileRef.current?.click()}>
            <Camera aria-hidden /> Take photo (optional)
          </button>
          <p className="text-lg">Photos stay on this phone. They are not uploaded.</p>
        </section>
      ) : (
        <section className="card text-center">
          <Check size={48} className="mx-auto text-teal" aria-hidden />
          <h2 className="font-display text-4xl text-teal">All medicines taken today</h2>
          <p className="text-xl">Well done, Mr Tan!{justTaken ? ` You took ${justTaken}.` : ""}</p>
        </section>
      )}

      <section aria-label="Today's doses" className="space-y-2">
        <h2 className="h2">Today</h2>
        {doses.map(({ med, rec }) => (
          <div key={med.id} className="flex items-center justify-between rounded-2xl border border-panel p-3">
            <div>
              <p className="text-xl font-medium">{med.name}</p>
              <p className="text-lg">{fmtHHMM(med.time)}</p>
            </div>
            <span className={`chip !text-lg ${rec.status === "taken" ? "bg-teal text-white" : rec.status === "missed" ? "bg-alert text-white" : "bg-gold text-navy"}`}>
              {rec.status === "taken" ? "Taken" : rec.status === "missed" ? "Missed" : "To do"}
            </span>
          </div>
        ))}
      </section>

      <section aria-label="This week">
        <h2 className="h2">This week</h2>
        <div className="mt-2 grid grid-cols-7 gap-1.5">
          {week.map((ts) => {
            const st = dayStatus(s.doses, ts, s.clock);
            const { text, cls, Icon } = DAY_UI[st];
            return (
              <div key={ts} className={`flex flex-col items-center rounded-xl p-1.5 text-center ${cls}`}>
                <span className="text-sm font-medium">{new Date(ts).toLocaleDateString("en-SG", { weekday: "short" })}</span>
                <span className="text-sm">{new Date(ts).getDate()}</span>
                <Icon size={22} aria-hidden />
                <span className="text-[12px] leading-tight">{text}</span>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
