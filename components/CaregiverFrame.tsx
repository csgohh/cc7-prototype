"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { Bell, HandHeart, Home, Settings } from "lucide-react";
import { useJaga } from "@/lib/store";
import { useHydrated } from "@/lib/selectors";
import { CAREGIVER_NAME } from "@/lib/mockData";
import BannerStack from "./BannerStack";
import DemoTools from "./DemoTools";
import { DemoTag, Loading } from "./ui";

const NAV = [
  { href: "/caregiver", label: "Overview", Icon: Home },
  { href: "/caregiver/alerts", label: "Alerts", Icon: Bell },
  { href: "/caregiver/support", label: "Support", Icon: HandHeart },
  { href: "/caregiver/settings", label: "Settings", Icon: Settings },
];

export default function CaregiverFrame({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const ready = useHydrated();
  const alerts = useJaga((s) => s.alerts);
  const level = useJaga((s) => s.caregiverLevel);
  const openCount = useMemo(
    () => alerts.filter((a) => a.status !== "resolved" && (level === "all" || a.severity !== "info")).length,
    [alerts, level],
  );

  return (
    <div className="min-h-screen bg-panel/50">
      <div className="relative mx-auto min-h-screen w-full max-w-[430px] bg-white text-lg shadow-xl">
        {!ready ? (
          <Loading />
        ) : (
          <>
            <BannerStack audience="caregiver" />
            <header className="sticky top-0 z-40 flex items-center justify-between border-b border-panel bg-white px-4 py-3">
              <div>
                <div className="font-display text-3xl leading-none text-teal">JAGA · Caregiver</div>
                <DemoTag />
              </div>
              <div className="text-right text-base">
                <p className="font-medium">{CAREGIVER_NAME}</p>
                <Link href="/" className="text-teal underline">Switch role</Link>
              </div>
            </header>
            <main className="space-y-4 px-4 pb-36 pt-4">{children}</main>
            <nav aria-label="Main" className="fixed inset-x-0 bottom-0 z-40 mx-auto grid w-full max-w-[430px] grid-cols-4 border-t-2 border-panel bg-white">
              {NAV.map(({ href, label, Icon }) => {
                const active = href === "/caregiver" ? path === href : path.startsWith(href);
                return (
                  <Link key={href} href={href} aria-current={active ? "page" : undefined}
                    className={`relative flex min-h-[68px] flex-col items-center justify-center gap-1 text-base ${active ? "bg-teal font-semibold text-white" : "text-navy"}`}>
                    <Icon size={24} aria-hidden />
                    {label}
                    {label === "Alerts" && openCount > 0 && (
                      <span className="absolute right-[22%] top-1.5 flex h-6 min-w-6 items-center justify-center rounded-full bg-alert px-1 text-sm font-bold text-white">{openCount}</span>
                    )}
                  </Link>
                );
              })}
            </nav>
            <DemoTools />
          </>
        )}
      </div>
    </div>
  );
}
