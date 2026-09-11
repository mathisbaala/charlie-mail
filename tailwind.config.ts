import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        // Nouveau design système Charlie : encre + blanc + un seul accent vert.
        // Surfaces quasi achromatiques froides-neutres ; le vert (#15715a)
        // signale une action, un gain, une preuve — jamais une décoration.
        ink: {
          50: "rgb(253 254 254 / <alpha-value>)", // #fdfefe — fond de page
          100: "rgb(247 248 249 / <alpha-value>)", // #f7f8f9 — surface douce/hover
          200: "rgb(229 229 229 / <alpha-value>)", // #e5e5e5 — bordures & séparateurs
          500: "rgb(107 114 128 / <alpha-value>)", // #6b7280 — texte atténué (plancher)
          700: "rgb(64 64 64 / <alpha-value>)", // #404040 — texte secondaire
          800: "rgb(23 23 23 / <alpha-value>)", // #171717 — hover des CTA encre / surface sombre
          900: "rgb(10 10 10 / <alpha-value>)" // #0a0a0a — encre / texte principal
        },
        accent: {
          500: "rgb(21 113 90 / <alpha-value>)", // #15715a — accent vert profond
          600: "rgb(15 90 72 / <alpha-value>)" // #0f5a48 — accent foncé / hover
        }
      },
      boxShadow: {
        soft: "0 18px 42px -24px rgba(17, 24, 39, 0.45)"
      }
    }
  },
  plugins: []
};

export default config;
