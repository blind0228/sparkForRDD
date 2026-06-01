/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "primary": "#0058be",
        "primary-container": "#2170e4",
        "secondary": "#545f73",
        "secondary-container": "#d5e0f8",
        "background": "#f9f9ff",
        "surface": "#f9f9ff",
        "surface-container": "#ecedf7",
        "surface-container-low": "#f2f3fd",
        "surface-container-high": "#e6e7f2",
        "surface-container-highest": "#e1e2ec",
        "surface-container-lowest": "#ffffff",
        "on-surface": "#191b23",
        "on-surface-variant": "#424754",
        "on-primary": "#ffffff",
        "on-secondary": "#ffffff",
        "outline": "#727785",
        "outline-variant": "#c2c6d6",
        "error": "#ba1a1a",
        "on-error": "#ffffff",
        "on-background": "#191b23",
      },
      spacing: {
        "sidebar_width": "260px",
        "gutter": "20px",
        "base": "4px",
        "xs": "8px",
        "sm": "12px",
        "md": "16px",
        "lg": "24px",
        "xl": "32px",
      },
      fontFamily: {
        display: ["Manrope", "sans-serif"],
        body: ["Inter", "sans-serif"],
      }
    },
  },
  plugins: [],
}
