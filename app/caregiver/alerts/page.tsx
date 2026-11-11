"use client";
import { useMemo } from "react";
import { CheckCheck, Phone, PhoneOff } from "lucide-react";
import { useJaga } from "@/lib/store";
import { relTime } from "@/lib/time";
import { AAC_STAFF } from "@/lib/mockData";
import type { Alert } from "@/lib/types";

const SEVERITY = {
  emergency: { label: "Emergency", cls: "bg-alert text-white" },
  important: { label: "Important", cls: "bg-gold text-navy" },
  info: { label: "FYI", cls: "bg-panel text-navy" },
};

const STATUS: Record<Alert["status"], string> = {
  open: "Needs attention",
  called: "You called",
  cant_reach: "Could not reach. AAC informed",
  escalated: "Passed to AAC (Level 2)",
  resolved: "Resolved",
};

export default function CaregiverAlerts() {
  const alerts = useJaga((s) => s.alerts);
  const cases = useJaga((s) => s.cases);
  const level = useJaga((s) => s.caregiverLevel);
  const medShared = useJaga((s) => s.sharing.medication);
  const clock = useJaga((s) => s.clock);
  const act = useJaga((s) => s.caregiverAction);

  const list = useMemo(
    () => alerts.filter((a) => level === "all" || a.severity !== "info").sort((a, b) => Number(a.status === "resolved") - Number(b.status === "resolved") || b.createdAt - a.createdAt),
    [alerts, level],
  );

  return (
    <>
      <h1 className="font-display text-4xl text-teal">Alerts</h1>
      <p className="text-base">Showing {level === "all" ? "all alerts" : "important alerts only"}.</p>
      {list.length === 0 && <p className="card">No alerts. All good.</p>}
      {list.map((a) => {
        const sev = SEVERITY[a.severity];
        const c = a.caseId ? cases.find((x) => x.id === a.caseId) : undefined;
        const done = a.status === "resolved";
        const last = c?.timeline[c.timeline.length - 1];
        return (
          <article key={a.id} className={`card space-y-2 ${done ? "opacity-75" : ""}`}>
            <div className="flex flex-wrap items-center gap-2">
              <span className={`chip ${sev.cls}`}>{sev.label}</span>
              <span className="chip bg-white">{STATUS[a.status]}</span>
            </div>
            <h2 className="text-xl font-semibold">{a.title}</h2>
            <p>{a.kind === "medication" && !medShared ? a.safeDetail : a.detail}</p>
            <p className="text-base text-navy/70">{relTime(a.createdAt, clock)}{a.note ? ` · ${a.note}` : ""}</p>
            {c && (
              <p className="rounded-xl bg-white p-2 text-base">
                <strong>AAC @ Bedok North:</strong> {c.status === "resolved" ? "Case closed" : c.status === "in_progress" ? "Working on it" : "Case open"}
                {last && last.who === AAC_STAFF ? ` · ${last.text}` : ""}
              </p>
            )}
            {!done && (
              <div className="flex flex-col gap-2 pt-1">
                {a.status === "open" && <button className="btn btn-primary" onClick={() => act(a.id, "called")}><Phone aria-hidden /> I&apos;ve called them</button>}
                {a.status !== "cant_reach" && a.status !== "escalated" && (
                  <button className="btn btn-secondary !border-alert !text-alert" onClick={() => act(a.id, "cant_reach")}><PhoneOff aria-hidden /> Can&apos;t reach them</button>
                )}
                <button className="btn btn-secondary" onClick={() => act(a.id, "resolved")}><CheckCheck aria-hidden /> Mark resolved</button>
              </div>
            )}
          </article>
        );
      })}
    </>
  );
}
