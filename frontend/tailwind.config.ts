import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        base: "var(--bg-base)",
        surface: "var(--bg-surface)",
        elevated: "var(--bg-elevated)",
        "border-subtle": "var(--border-subtle)",
        "border-default": "var(--border-default)",
        "celo-yellow": "var(--celo-yellow)",
        "celo-yellow-dim": "var(--celo-yellow-dim)",
        "celo-green": "var(--celo-green)",
        "celo-green-dim": "var(--celo-green-dim)",
        "celo-green-darker": "var(--celo-green-darker)",
        "text-primary": "var(--text-primary)",
        "text-secondary": "var(--text-secondary)",
        "text-muted": "var(--text-muted)",
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        }
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
      }
    },
  },
  plugins: [],
};
export default config;
