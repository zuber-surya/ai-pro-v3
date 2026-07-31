/**
 * Tailwind config mirror for tooling / docs.
 * Runtime theme is defined in `src/app/globals.css` (@theme) + `src/styles/tokens.css`
 * to match design_reference HTML class names (Tailwind v4 CSS-first).
 *
 * Do not invent colors here — change DESIGN.md / HTML SOT first.
 */
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;
