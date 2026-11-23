import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0f172a",
        sea: "#0f766e",
        sky: "#e0f2fe",
        sand: "#fff7ed",
      },
    },
  },
  plugins: [],
};

export default config;
