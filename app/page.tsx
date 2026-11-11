import Link from "next/link";
import { FlaskConical, HeartHandshake, LayoutDashboard, Smartphone } from "lucide-react";

const ROLES = [
  {
    href: "/senior/login", title: "Senior", who: "Mr Tan Ah Huat, 74",
    text: "Large-text phone app with medication log, Talk to Kaki voice companion, check-ups, schemes and one-tap help.",
    Icon: Smartphone, tag: "Mobile · 390px",
  },
  {
    href: "/caregiver", title: "Caregiver", who: "Mei Ling, daughter",
    text: "See only what Mr Tan chooses to share. Get alerts and say \"I've called them\" or \"Can't reach them\".",
    Icon: HeartHandshake, tag: "Mobile · 390px",
  },
  {
    href: "/aac", title: "AAC / Social worker", who: "Ms Siti, AAC @ Bedok North",
    text: "Desktop dashboard with cases sorted by urgency, case timelines, actions and a high-need seniors list.",
    Icon: LayoutDashboard, tag: "Desktop",
  },
];

export default function Landing() {
  return (
    <main className="mx-auto max-w-5xl px-5 py-10">
      <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-gold/30 px-4 py-1 text-sm font-medium uppercase tracking-wide">
        <FlaskConical size={16} aria-hidden /> Prototype · Demo data · University project
      </div>
      <h1 className="font-display text-7xl leading-none text-teal">JAGA</h1>
      <p className="mt-2 max-w-2xl text-xl">
        A self-care companion for home-dwelling seniors in Singapore, their family caregivers, and Active Ageing Centre
        (AAC) staff. Choose a role to start the demo.
      </p>

      <div className="mt-8 grid gap-5 md:grid-cols-3">
        {ROLES.map(({ href, title, who, text, Icon, tag }) => (
          <Link key={href} href={href} className="flex flex-col gap-3 rounded-3xl border-2 border-panel bg-card p-6 transition hover:border-teal">
            <Icon size={36} className="text-teal" aria-hidden />
            <h2 className="font-display text-4xl text-teal">{title}</h2>
            <p className="text-sm font-medium uppercase tracking-wide text-navy/70">{tag}</p>
            <p className="font-medium">{who}</p>
            <p className="text-lg">{text}</p>
            <span className="btn btn-primary mt-auto">Open {title.toLowerCase()} view</span>
          </Link>
        ))}
      </div>

      <section className="mt-10 grid gap-5 md:grid-cols-2">
        <div className="rounded-3xl bg-panel p-6">
          <h2 className="font-display text-3xl text-teal">Run the escalation demo</h2>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-lg">
            <li>Open the Senior view and log in (mock Singpass).</li>
            <li>Tap <strong>Demo tools</strong>: <em>Miss today&apos;s dose</em>, then <em>Skip 1 day</em>, then <em>Miss today&apos;s dose</em>.</li>
            <li><strong>Level 1:</strong> the Caregiver app shows a new alert.</li>
            <li><em>Skip 1 day</em> again (or tap &quot;Can&apos;t reach them&quot;). <strong>Level 2:</strong> the AAC dashboard shows &quot;Follow-up needed&quot;.</li>
            <li>Or tap <em>Trigger chatbot emergency</em> to see the 995 flow.</li>
          </ol>
        </div>
        <div className="rounded-3xl border-2 border-gold p-6 text-lg">
          <h2 className="font-display text-3xl text-teal">About this prototype</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>All people, schemes, slots and cases are <strong>mock data</strong>. No real personal data is collected.</li>
            <li>The Singpass login is a <strong>fake demo screen</strong>. There are no government integrations.</li>
            <li>Tip: open the Senior and Caregiver views in two browser windows. They stay in sync.</li>
            <li>Kaki does not diagnose. Always check with your doctor or pharmacist.</li>
          </ul>
        </div>
      </section>
    </main>
  );
}
