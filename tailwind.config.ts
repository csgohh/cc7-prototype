import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        teal: { DEFAULT: "#1F7A80", dark: "#165A5F" },
        navy: "#2E3756",
        panel: "#D5E3E6",
        card: "#F2F7F8",
        alert: "#B3261E",
        gold: "#D4A35A",
        // Extra shade used only for the "urgent" level so it differs from red and gold.
        amber: "#9A4A00",
      },
      fontFamily: {
        display: ["var(--font-bebas)", "Impact", "sans-serif"],
        sans: ["var(--font-rubik)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
