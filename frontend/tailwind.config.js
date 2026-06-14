/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#eefdf8",
          100: "#d6f8ee",
          500: "#55d6c2",
          600: "#21a992",
          700: "#137f73",
        },
        violetTech: "#b8a7ff",
        aqua: "#7eddf1",
        mint: "#c7f2e7",
        coral: "#f6a7c9",
        sun: "#ffbd73",
        signal: "#5b7cfa",
        ink: "#07111f",
        paper: "#f7fafc",
      },
      boxShadow: {
        soft: "0 24px 70px rgba(7, 17, 31, 0.10)",
        float: "0 22px 46px rgba(7, 17, 31, 0.13)",
        glow: "0 26px 90px rgba(85, 214, 194, 0.22)",
      },
    },
  },
  plugins: [],
}
