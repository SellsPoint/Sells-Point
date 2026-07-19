/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,jsx}",
    "./src/components/**/*.{js,jsx}",
    "./src/context/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eefdf4",
          100: "#d6fae3",
          200: "#aef3c9",
          300: "#75e6a9",
          400: "#3ecf85",
          500: "#18b568",
          600: "#0e9354",
          700: "#0d7546",
          800: "#0e5c3a",
          900: "#0d4c31",
          950: "#042a1b",
        },
        ink: {
          50: "#f5f6f8",
          100: "#e7e9ee",
          200: "#cbd0da",
          300: "#a1a9ba",
          400: "#707c95",
          500: "#535e78",
          600: "#414a61",
          700: "#363d4f",
          800: "#2b303e",
          900: "#191c25",
          950: "#0e1017",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 8px 30px rgba(15, 23, 42, 0.08)",
        neutral: "0 8px 28px rgba(15, 23, 42, 0.07)",
        glow: "0 0 0 1px rgba(24, 181, 104, 0.15), 0 8px 24px rgba(24, 181, 104, 0.18)",
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(135deg, #18b568 0%, #0e9354 55%, #0d7546 100%)",
        "hero-gradient": "radial-gradient(circle at 20% 20%, rgba(62,207,133,0.25), transparent 45%), radial-gradient(circle at 80% 0%, rgba(14,92,58,0.35), transparent 50%), linear-gradient(180deg, #0e1017 0%, #191c25 100%)",
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease-out",
        "slide-up": "slideUp 0.35s ease-out",
        float: "float 6s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: { "0%": { opacity: 0 }, "100%": { opacity: 1 } },
        slideUp: {
          "0%": { opacity: 0, transform: "translateY(12px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
    },
  },
  plugins: [],
};
