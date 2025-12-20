/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        govtBlue: "#0b5ed7",
        govtLight: "#f1f5f9"
      }
    }
  },
  plugins: [],
}
