import type { Metadata, Viewport } from "next";
import { Bebas_Neue, Rubik } from "next/font/google";
import Hydrate from "@/components/Hydrate";
import "./globals.css";

const bebas = Bebas_Neue({ weight: "400", subsets: ["latin"], variable: "--font-bebas", display: "swap" });
const rubik = Rubik({ subsets: ["latin"], variable: "--font-rubik", display: "swap" });

export const metadata: Metadata = {
  title: "JAGA (Demo): self-care companion for seniors",
  description: "University prototype. A self-care companion for seniors, caregivers and Active Ageing Centres. Demo data only.",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${bebas.variable} ${rubik.variable}`}>
      <body className="bg-white font-sans text-navy">
        <Hydrate />
        {children}
      </body>
    </html>
  );
}
