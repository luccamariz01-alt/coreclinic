import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        border: "var(--border)",
        muted: "var(--muted)",
        "muted-foreground": "var(--muted-foreground)",
        card: "var(--card)",
        accent: "var(--accent)",
        brand: {
          DEFAULT: "var(--brand)",
          soft: "var(--brand-soft)",
          contrast: "var(--brand-contrast)"
        },
        success: "var(--success)",
        warning: "var(--warning)"
      },
      boxShadow: {
        ambient: "0 24px 56px rgba(56, 33, 45, 0.12)",
        soft: "0 14px 34px rgba(56, 33, 45, 0.09)"
      },
      borderRadius: {
        shell: "1.5rem",
        panel: "1.25rem"
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(135deg, var(--brand) 0%, var(--brand-soft) 100%)",
        "hero-mesh": "radial-gradient(circle at top left, rgba(188, 95, 134, 0.24), transparent 34%), radial-gradient(circle at top right, rgba(125, 67, 93, 0.14), transparent 24%), linear-gradient(180deg, rgba(255,255,255,0.76), rgba(255,255,255,0))"
      }
    }
  },
  plugins: []
};

export default config;
