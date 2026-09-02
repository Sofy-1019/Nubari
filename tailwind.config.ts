import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        nb: {
          black: "#0f0e0d",
          ink: "#1a1817",
          bone: "#f6f2ea",
          sand: "#e9e2d3",
          taupe: "#8c8274",
          stone: "#5b564d",
          wood: "#a9713f",
          rose: "#c99a6c",
          roseDeep: "#a97a4a",
        },
      },
      fontFamily: {
        serif: ["var(--font-fraunces)", "Georgia", "serif"],
        sans: ["var(--font-manrope)", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        widest2: "0.28em",
      },
      maxWidth: {
        content: "1400px",
      },
      transitionTimingFunction: {
        soft: "cubic-bezier(.4,0,.2,1)",
      },
    },
  },
  plugins: [],
};
export default config;
