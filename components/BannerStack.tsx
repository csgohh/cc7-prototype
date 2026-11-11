"use client";
import { useMemo } from "react";
import { Bell, X } from "lucide-react";
import { useJaga } from "@/lib/store";
import type { Audience } from "@/lib/types";

const TONE = {
  info: "border-teal bg-white text-navy",
  reminder: "border-gold bg-gold/25 text-navy",
  alert: "border-alert bg-alert text-white",
};

/** Simulated push notifications. Shows the 3 newest banners for this audience. */
export default function BannerStack({ audience, large = false }: { audience: Audience; large?: boolean }) {
  const all = useJaga((s) => s.banners);
  const dismiss = useJaga((s) => s.dismissBanner);
  const banners = useMemo(() => all.filter((b) => b.audience === audience).slice(-3).reverse(), [all, audience]);
  if (!banners.length) return null;
  return (
    <div className="pointer-events-none fixed inset-x-0 top-2 z-50 mx-auto flex w-full max-w-[430px] flex-col gap-2 px-3" aria-live="polite">
      {banners.map((b) => (
        <div key={b.id} role="status" className={`pointer-events-auto flex items-start gap-3 rounded-2xl border-2 p-3 shadow-lg ${TONE[b.tone]}`}>
          <Bell className="mt-1 shrink-0" size={22} aria-hidden />
          <div className="flex-1">
            <p className={`font-semibold ${large ? "text-xl" : "text-lg"}`}>{b.title}</p>
            <p className={large ? "text-xl" : "text-base"}>{b.body}</p>
            <p className="text-xs opacity-70">Demo push notification</p>
          </div>
          <button onClick={() => dismiss(b.id)} aria-label="Dismiss notification" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full">
            <X aria-hidden />
          </button>
        </div>
      ))}
    </div>
  );
}
