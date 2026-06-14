/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#f0fbf7",
          100: "#d8f3ea",
          500: "#83d2c2",
          600: "#2fa891",
          700: "#167a6d",
        },
        violetTech: "#aeb7ff",
        aqua: "#8ed9e7",
        mint: "#b8e6d8",
        coral: "#f49bb6",
        sun: "#f2c66d",
        ink: "#111114",
        paper: "#fffdf8",
      },
      boxShadow: {
        soft: "0 20px 55px rgba(17, 17, 20, 0.10)",
        float: "0 18px 38px rgba(17, 17, 20, 0.12)",
      },
    },
  },
  plugins: [],
}
