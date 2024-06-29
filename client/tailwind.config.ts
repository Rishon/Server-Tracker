import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "black-gray-dots": "radial-gradient(circle, #282b30 1.9px, #000 1px)",
        "graph-black-dots": "radial-gradient(ellipse, #000 1.9px, #0f0f10 1px)",
      },
      backgroundSize: {
        "dots-pattern": "20px 30px",
        "graph-pattern": "20px 20px",
      },
    },
  },
  plugins: [],
};
export default config;
