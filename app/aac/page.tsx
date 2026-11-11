"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Activity, CheckCircle2, Timer } from "lucide-react";
import { useJaga } from "@/lib/store";
import { seniorById } from "@/lib/mockData";
import { sortCases } from "@/lib/selectors";
import { DAY, relTime } from "@/lib/time";
import { URGENCY_BORDER, UrgencyBadge } from "@/components/ui";

const STATUS_LABEL = { open: "Open", in_progress: "In progress", resolved: "Resolved" };

export default function AacDashboard() {
  const cases = useJaga((s) => s.cases);
  const clock = useJaga((s) => s.clock);
  const [tab, setTab] = useState<"active" | "resolved" | "all">("active");

  const sorted = useMemo(() => sortCases(cases), [cases]);
  const active = sorted.filter((c) => c.status !== "resolved").length;
  const resolvedWeek = cases.filter((c) => c.status === "resolved" && c.resolvedAt && clock - c.resolvedAt <= 7 * DAY).length;
  const list = sorted.filter((c) => (tab === "all" ? true : tab === "active" ? c.status !== "resolved" : c.status === "resolved"));

  const tiles = [
    { label: "Active cases", value: String(active), Icon: Activity },
    { label: "Resolved this week", value: String(resolvedWeek), Icon: CheckCircle2 },
    { label: "Average response time (mock)", value: "38 min", Icon: Timer },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-5xl text-teal">Cases</h1>
        <p className="text-lg">Sorted by urgency. Emergencies first.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {tiles.map(({ label, value, Icon }) => (
          <div key={label} className="rounded-2xl bg-panel p-5">
            <Icon className="text-teal" aria-hidden />
            <p className="font-display text-5xl text-navy">{value}</p>
            <p className="text-base">{label}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-2" role="tablist">
        {(["active", "resolved", "all"] as const).map((t) => (
          <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)}
            className={`btn btn-sm capitalize ${tab === t ? "btn-primary" : "btn-secondary"}`}>{t}</button>
        ))}
      </div>

      <div className="space-y-3">
        {list.length === 0 && <p className="card">No cases here.</p>}
        {list.map((c) => {
          const sn = seniorById(c.seniorId);
          return (
            <Link key={c.id} href={`/aac/cases/${c.id}`}
              className={`flex flex-wrap items-center gap-4 rounded-2xl border border-panel border-l-8 bg-card p-4 transition hover:bg-panel/50 ${URGENCY_BORDER[c.urgency]} ${c.status === "resolved" ? "opacity-70" : ""}`}>
              <div className="w-44"><UrgencyBadge urgency={c.urgency} /></div>
              <div className="min-w-0 flex-1">
                <p className="text-lg font-semibold">{sn.name}, {sn.age}</p>
                <p className="truncate">{c.title}</p>
              </div>
              <div className="text-right text-sm">
                <p className="font-medium">{STATUS_LABEL[c.status]}</p>
                <p>{relTime(c.createdAt, clock)}</p>
                {c.dueBy && c.status !== "resolved" && (
                  <p className="font-semibold text-amber">{c.dueBy < clock ? "Call overdue" : `Call ${relTime(c.dueBy, clock)}`}</p>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
