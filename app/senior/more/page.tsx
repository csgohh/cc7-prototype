"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, CalendarCheck, ChevronRight, HandHeart, LogOut, ShieldCheck } from "lucide-react";
import { useJaga } from "@/lib/store";

const ITEMS = [
  { href: "/senior/checkups", label: "Check-ups", Icon: CalendarCheck },
  { href: "/senior/reminders", label: "Smart reminders", Icon: Bell },
  { href: "/senior/volunteer", label: "Volunteering", Icon: HandHeart },
  { href: "/senior/privacy", label: "Privacy & sharing", Icon: ShieldCheck },
];

export default function More() {
  const logout = useJaga((s) => s.logout);
  const router = useRouter();
  return (
    <div className="space-y-4">
      <h1 className="h1">More</h1>
      {ITEMS.map(({ href, label, Icon }) => (
        <Link key={href} href={href} className="btn btn-secondary !min-h-[68px] !justify-between">
          <span className="flex items-center gap-3"><Icon aria-hidden /> {label}</span>
          <ChevronRight aria-hidden />
        </Link>
      ))}
      <div className="flex items-center justify-between pt-2 text-lg">
        <button className="flex min-h-[48px] items-center gap-2 text-teal underline" onClick={() => { logout(); router.replace("/senior/login"); }}>
          <LogOut size={20} aria-hidden /> Log out
        </button>
        <Link href="/" className="text-teal underline">Demo role switcher</Link>
      </div>
    </div>
  );
}
