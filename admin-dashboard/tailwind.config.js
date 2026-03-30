/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#4169E1',
        secondary: '#5CE1E6'
      }
    },
  },
  plugins: [],
}
