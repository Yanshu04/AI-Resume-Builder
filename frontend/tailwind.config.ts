import type { Config } from 'tailwindcss'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#FBFBFA", // Manga newsprint paper canvas
        foreground: "#111111", // Deep ink black
        accent: {
          DEFAULT: "#E11D48", // Shonen Jump dramatic crimson / comic red
          foreground: "#FFFFFF",
        },
        card: {
          DEFAULT: "#FFFFFF", // Crisp white comic panel
          foreground: "#111111",
        },
        border: "#111111", // Heavy ink black stroke
        input: "#FFFFFF",
        ring: "#E11D48",
        primary: {
          DEFAULT: "#111111", // Ink black
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#F3F3F0", // Screentone light gray
          foreground: "#111111",
        },
        muted: {
          DEFAULT: "#E8E8E4",
          foreground: "#555555",
        },
      },
      boxShadow: {
        'manga-sm': '2px 2px 0px 0px #111111',
        'manga': '3.5px 3.5px 0px 0px #111111',
        'manga-lg': '5px 5px 0px 0px #111111',
        'manga-accent': '4px 4px 0px 0px #E11D48',
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Courier New", "monospace"],
      },
    },
  },
  plugins: [],
} satisfies Config
