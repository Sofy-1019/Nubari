import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        nb: {
          black: "#0b0a09",
          carbon: "#171412",
          ink: "#211d1a",
          card: "#1c1815",
          line: "#332e28",
          cream: "#f7f2ea",
          beige: "#e9e0d1",
          taupe: "#a89a86",
          champagne: "#d9b98a",
          gold: "#c9a15a",
          roseGold: "#c99a82",
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
