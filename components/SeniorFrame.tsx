"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Home, Menu, MessageCircle, Landmark, Pill, Phone } from "lucide-react";
import { useJaga } from "@/lib/store";
import { useHydrated } from "@/lib/selectors";
import BannerStack from "./BannerStack";
import DemoTools from "./DemoTools";
import RiskAlertCard from "./RiskAlertCard";
import { DemoTag, Loading } from "./ui";

const NAV = [
  { href: "/senior", label: "Home", Icon: Home },
  { href: "/senior/medication", label: "Medication", Icon: Pill },
  { href: "/senior/kaki", label: "Talk to Kaki", Icon: MessageCircle },
  { href: "/senior/schemes", label: "Schemes", Icon: Landmark },
  { href: "/senior/more", label: "More", Icon: Menu },
];

const isActive = (path: string, href: string) => {
  if (href === "/senior") return path === "/senior";
  if (href === "/senior/more")
    return ["/senior/more", "/senior/checkups", "/senior/reminders", "/senior/volunteer", "/senior/privacy", "/senior/hotline"].includes(path);
  return path.startsWith(href);
};

/** Phone-sized frame (designed for 390px). Handles the mock login guard, header, nav and banners. */
export default function SeniorFrame({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const ready = useHydrated();
  const loggedIn = useJaga((s) => s.loggedIn);
  const bare = path === "/senior/login" || path === "/senior/approve";

  useEffect(() => {
    if (ready && !loggedIn && !bare) router.replace("/senior/login");
  }, [ready, loggedIn, bare, router]);

  return (
    <div className="min-h-screen bg-panel/50">
      <div className="senior-app relative mx-auto min-h-screen w-full max-w-[430px] bg-white shadow-xl">
        {!ready ? (
          <Loading />
        ) : bare ? (
          <>{children}</>
        ) : !loggedIn ? (
          <Loading />
        ) : (
          <>
            <BannerStack audience="senior" large />
            <header className="sticky top-0 z-40 flex items-center justify-between gap-3 border-b border-panel bg-white px-4 py-2">
              <div>
                <div className="font-display text-4xl leading-none text-teal">JAGA</div>
                <DemoTag />
              </div>
              <Link href="/senior/hotline" className="btn btn-danger !w-auto !px-4" aria-label="Call for help">
                <Phone aria-hidden /> Call for help
              </Link>
            </header>
            <main className="px-4 pb-40 pt-4">
              <RiskAlertCard />
              {children}
            </main>
            <nav aria-label="Main" className="fixed inset-x-0 bottom-0 z-40 mx-auto grid w-full max-w-[430px] grid-cols-5 border-t-2 border-panel bg-white">
              {NAV.map(({ href, label, Icon }) => {
                const active = isActive(path, href);
                return (
                  <Link key={href} href={href} aria-current={active ? "page" : undefined}
                    className={`flex min-h-[72px] flex-col items-center justify-center gap-1 px-1 text-center text-[15px] leading-tight ${active ? "bg-teal font-semibold text-white" : "text-navy"}`}>
                    <Icon size={26} aria-hidden />
                    {label}
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
