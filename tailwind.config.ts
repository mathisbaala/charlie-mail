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
          50: "#FCFAF4",
          100: "#F4EFE4",
          200: "#E2DACB",
          500: "#857D72",
          700: "#2B2722",
          900: "#2B2722"
        },
        accent: {
          500: "#9A4222",
          600: "#82371B"
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
