"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClipboardList, Users } from "lucide-react";
import { useHydrated } from "@/lib/selectors";
import { AAC_NAME, AAC_STAFF } from "@/lib/mockData";
import BannerStack from "./BannerStack";
import DemoTools from "./DemoTools";
import { DemoTag, Loading } from "./ui";

const NAV = [
  { href: "/aac", label: "Cases", Icon: ClipboardList },
  { href: "/aac/high-need", label: "High-need seniors", Icon: Users },
];

/** Desktop layout for AAC / social-worker staff. */
export default function AacFrame({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const ready = useHydrated();
  return (
    <div className="flex min-h-screen bg-white text-base">
      <aside className="hidden w-64 shrink-0 flex-col gap-6 bg-panel p-5 md:flex">
        <div>
          <div className="font-display text-4xl leading-none text-teal">JAGA</div>
          <p className="font-display text-xl text-navy">AAC dashboard</p>
          <DemoTag className="mt-2" />
        </div>
        <nav aria-label="Dashboard" className="flex flex-col gap-1">
          {NAV.map(({ href, label, Icon }) => {
            const active = href === "/aac" ? path === "/aac" || path.startsWith("/aac/cases") : path.startsWith(href);
            return (
              <Link key={href} href={href} aria-current={active ? "page" : undefined}
                className={`flex min-h-[48px] items-center gap-3 rounded-xl px-3 text-lg ${active ? "bg-teal font-semibold text-white" : "hover:bg-card"}`}>
                <Icon size={20} aria-hidden /> {label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto text-sm">
          <p className="font-semibold">{AAC_NAME}</p>
          <p>Logged in as {AAC_STAFF}</p>
          <Link href="/" className="mt-1 inline-block text-teal underline">Switch role</Link>
        </div>
      </aside>
      <div className="min-w-0 flex-1">
        <header className="flex items-center justify-between border-b border-panel px-6 py-3 md:hidden">
          <span className="font-display text-3xl text-teal">JAGA · AAC</span>
          <nav className="flex gap-3 text-base underline"><Link href="/aac">Cases</Link><Link href="/aac/high-need">High-need</Link></nav>
        </header>
        <main className="mx-auto max-w-6xl p-6">{ready ? children : <Loading />}</main>
      </div>
      {ready && <BannerStack audience="aac" />}
      {ready && <DemoTools position="corner" />}
    </div>
  );
}
