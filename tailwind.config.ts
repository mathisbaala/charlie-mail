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
        // Palette alignée sur Charlie Prospection / Charlie Investissement :
        // surfaces neutres/lin (quasi-achromatiques, hue 90) — pas de crème
        // chaude — seule la marque porte la couleur via l'accent clay (hue 38).
        ink: {
          50: "oklch(0.99 0.003 95 / <alpha-value>)", // paper — cartes & panneaux
          100: "oklch(0.94 0.006 90 / <alpha-value>)", // paper-2 — surfaces/hover
          200: "oklch(0.83 0.008 90 / <alpha-value>)", // line — bordures & séparateurs
          500: "oklch(0.58 0.006 90 / <alpha-value>)", // muted — texte tertiaire
          700: "oklch(0.35 0.005 90 / <alpha-value>)", // ink-2 — texte secondaire
          900: "oklch(0.22 0.005 90 / <alpha-value>)" // ink — texte principal
        },
        accent: {
          500: "oklch(0.5 0.13 38 / <alpha-value>)", // clay
          600: "oklch(0.45 0.125 38 / <alpha-value>)" // clay — hover
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
