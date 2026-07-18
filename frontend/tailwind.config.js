/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        night: "#0a0e1a",
        panel: "#101827",
        ember: "#ff7849",
        coral: "#ff4f3f",
        smoke: "#9ba9bd",
      },
      boxShadow: {
        glow: "0 0 32px rgba(255, 120, 73, 0.18)",
      },
    },
  },
  plugins: [],
};
