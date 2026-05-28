/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        heading: ['Playfair Display', 'sans-serif'],
      }
    },
  },
  plugins: [require("daisyui")],
}