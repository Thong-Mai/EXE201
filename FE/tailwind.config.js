/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          light: '#F8FAFC',
          dark: '#0F172A',
          teal: '#0D9488',
          teallight: '#14B8A6',
          green: '#10B981',
          gold: '#F59E0B',
          graybg: '#1E293B',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Outfit', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
