import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        nb: {
          // Fondos (antes tonos oscuros — ahora tonos crema/claros)
          black: "#FDFBF7",
          carbon: "#F4EBDD",
          ink: "#EEE2CE",
          card: "#FFFFFF",
          line: "#E6D9C2",
          // Textos (antes tonos claros — ahora tonos oscuros)
          cream: "#3B3128",
          beige: "#5B4E3F",
          taupe: "#8C7A63",
          // Acentos bronce/terracota, a tono con el logo nuevo
          champagne: "#B25B3B",
          gold: "#9C4A2E",
          roseGold: "#A9714F",
        },
      },
      fontFamily: {
        serif: ["var(--font-fraunces)", "Georgia", "serif"],
        sans: ["var(--font-manrope)", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        widest2: "0.28em",
        widest3: "0.18em",
      },
      maxWidth: {
        content: "1440px",
      },
      transitionTimingFunction: {
        soft: "cubic-bezier(.4,0,.2,1)",
      },
    },
  },
  plugins: [],
};
export default config;
