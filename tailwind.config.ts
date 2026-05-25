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
        ink: {
          50: "#F5EFE6",
          100: "#EBE2D2",
          200: "#D4C7B5",
          500: "#7A6A58",
          700: "#4A3828",
          900: "#1F1814"
        },
        accent: {
          500: "#B5683A",
          600: "#9A5230"
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
