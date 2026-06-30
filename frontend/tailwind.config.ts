import type { Config } from 'tailwindcss'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0D0D0D",
        foreground: "#F5F5F0",
        accent: {
          DEFAULT: "#C8F135",
          foreground: "#0D0D0D",
        },
        card: {
          DEFAULT: "#1A1A1A",
          foreground: "#F5F5F0",
        },
        border: "#2A2A2A",
        input: "#1A1A1A",
        ring: "#C8F135",
        primary: {
          DEFAULT: "#C8F135",
          foreground: "#0D0D0D",
        },
        secondary: {
          DEFAULT: "#2A2A2A",
          foreground: "#F5F5F0",
        },
        muted: {
          DEFAULT: "#1A1A1A",
          foreground: "#A0A09A",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Courier New", "monospace"],
      },
    },
  },
  plugins: [],
} satisfies Config
