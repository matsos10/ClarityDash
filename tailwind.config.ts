import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  darkMode: "class",
  safelist: ["text-good", "text-warn", "text-bad", "bg-good", "bg-warn", "bg-bad"],
  theme: {
    extend: {
      fontFamily: {
        mono: ['"JetBrains Mono"', "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      colors: {
        bg: "rgb(var(--bg) / <alpha-value>)",
        card: "rgb(var(--card) / <alpha-value>)",
        fg: "rgb(var(--fg) / <alpha-value>)",
        muted: "rgb(var(--muted) / <alpha-value>)",
        line: "rgb(var(--line) / <alpha-value>)",
        accent: "rgb(var(--accent) / <alpha-value>)",
        good: "rgb(var(--good) / <alpha-value>)",
        bad: "rgb(var(--bad) / <alpha-value>)",
        warn: "rgb(var(--warn) / <alpha-value>)",
      },
    },
  },
  plugins: [],
} satisfies Config;
