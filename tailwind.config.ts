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
        ambient: "0 28px 60px rgba(87, 43, 59, 0.12)",
        soft: "0 18px 36px rgba(87, 43, 59, 0.08)"
      },
      borderRadius: {
        shell: "1.75rem",
        panel: "1.5rem"
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(135deg, var(--brand) 0%, var(--brand-soft) 100%)",
        "hero-mesh": "radial-gradient(circle at top left, rgba(198, 91, 131, 0.28), transparent 32%), radial-gradient(circle at top right, rgba(122, 82, 114, 0.18), transparent 24%), linear-gradient(180deg, rgba(255,255,255,0.78), rgba(255,255,255,0))"
      }
    }
  },
  plugins: []
};

export default config;
