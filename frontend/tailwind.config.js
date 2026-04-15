/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'helios-dark': '#0A0F1A',
        'helios-card': '#141B2B',
        'helios-sun': '#F59E0B',
        'helios-success': '#10B981',
        'helios-danger': '#EF4444',
        'helios-text': '#E2E8F0',
        'helios-text-secondary': '#94A3B8',
      }
    },
  },
  plugins: [],
}