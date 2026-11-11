import Link from "next/link";
import { KeyRound } from "lucide-react";
import { DemoTag } from "@/components/ui";

// Mock Singpass login. This is NOT the real Singpass and sends nothing anywhere.
export default function Login() {
  return (
    <main className="flex min-h-screen flex-col justify-center gap-6 px-6 py-10">
      <div>
        <h1 className="font-display text-8xl leading-none text-teal">JAGA</h1>
        <p className="mt-2 text-2xl">Your friendly self-care helper.</p>
      </div>
      <div className="rounded-2xl border-2 border-gold bg-gold/15 p-4 text-lg">
        <strong>Demo login.</strong> This is a pretend Singpass screen for a university prototype. No real login happens and no real data is used.
      </div>
      <Link href="/senior/approve" className="btn btn-primary !min-h-[64px]">
        <KeyRound aria-hidden /> Log in with Singpass
      </Link>
      <div className="flex items-center justify-between">
        <DemoTag />
        <Link href="/" className="text-lg text-teal underline">Back to role switcher</Link>
      </div>
    </main>
  );
}
