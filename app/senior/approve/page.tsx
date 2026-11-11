"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";
import { useJaga } from "@/lib/store";

// Fake approval screen standing in for "approve in your Singpass app".
export default function Approve() {
  const router = useRouter();
  const login = useJaga((s) => s.login);
  return (
    <main className="flex min-h-screen flex-col justify-center gap-6 px-6 py-10">
      <p className="chip self-start bg-gold/30">Demo login · not the real Singpass</p>
      <h1 className="font-display text-6xl leading-tight text-teal">Approve this login</h1>
      <div className="card space-y-1 text-xl">
        <p className="font-semibold">JAGA (Demo) wants to log you in as:</p>
        <p>Mr Tan Ah Huat</p>
        <p>NRIC: S****123A (fake)</p>
      </div>
      <button
        className="btn btn-primary !min-h-[64px]"
        onClick={() => {
          login();
          router.replace("/senior");
        }}
      >
        <Check aria-hidden /> Approve
      </button>
      <Link href="/senior/login" className="btn btn-secondary"><X aria-hidden /> Cancel</Link>
    </main>
  );
}
