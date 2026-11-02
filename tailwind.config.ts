import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        warden: {
          bg: "#0B0E14",
          surface: {
            base: "#11151F",
            card: "#161B26",
            elevated: "#1D2332",
            border: "#252D3D",
            hover: "#222A3B",
          },
          text: {
            primary: "#F1F5F9",
            secondary: "#94A3B8",
            muted: "#64748B",
            faint: "#475569",
          },
          accent: {
            DEFAULT: "#00D8F6",
            hover: "#38BDF8",
            muted: "rgba(0, 216, 246, 0.12)",
            border: "rgba(0, 216, 246, 0.3)",
          },
          status: {
            allow: "#10B981", // Green exclusively for ALLOW / Pass
            allowMuted: "rgba(16, 185, 129, 0.12)",
            allowBorder: "rgba(16, 185, 129, 0.3)",
            warn: "#F59E0B",  // Amber exclusively for WARN / Review
            warnMuted: "rgba(245, 158, 11, 0.12)",
            warnBorder: "rgba(245, 158, 11, 0.3)",
            block: "#EF4444", // Red exclusively for BLOCK / Critical finding
            blockMuted: "rgba(239, 68, 68, 0.12)",
            blockBorder: "rgba(239, 68, 68, 0.3)",
          },
        },
      },
      fontFamily: {
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
