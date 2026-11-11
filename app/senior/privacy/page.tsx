"use client";
import { Lock } from "lucide-react";
import { useJaga } from "@/lib/store";
import { Toggle } from "@/components/ui";

export default function Privacy() {
  const sharing = useJaga((s) => s.sharing);
  const setSharing = useJaga((s) => s.setSharing);
  return (
    <div className="space-y-4">
      <h1 className="h1">Privacy & sharing</h1>
      <p className="text-xl">You decide what your daughter Mei Ling can see. You can change this any time.</p>
      <Toggle checked={sharing.medication} onChange={(v) => setSharing("medication", v)} label="My medication" hint="Taken or missed each day" />
      <Toggle checked={sharing.checkups} onChange={(v) => setSharing("checkups", v)} label="My check-ups" hint="Booked and upcoming visits" />
      <Toggle checked={sharing.photos} onChange={(v) => setSharing("photos", v)} label="My medicine photos" hint="Off unless you turn it on" />
      <div className="card flex gap-3 text-lg">
        <Lock className="mt-1 shrink-0 text-teal" aria-hidden />
        <p>
          <strong>Always private:</strong> what you say to Kaki. If Kaki thinks you are in danger, your caregiver and your AAC will be told so they can help.
        </p>
      </div>
      <p className="text-base text-navy/70">Demo only. No real personal data is collected or sent anywhere.</p>
    </div>
  );
}
