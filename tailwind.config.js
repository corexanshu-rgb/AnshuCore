/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#0B0D12",
        paper: "#F6F5F1",
        core: {
          50: "#EEF6FF",
          100: "#D9EBFF",
          400: "#4C8DFF",
          500: "#2F6BFF",
          600: "#1E4FDB",
          900: "#0B1E4A",
        },
        ember: "#FF6A3D",
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      letterSpacing: {
        tightest2: "-0.04em",
      },
    },
  },
  plugins: [],
};
