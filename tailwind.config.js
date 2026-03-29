/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: '#121212',
        darker: '#0a0a0a',
        card: '#1e1e1e',
        primary: '#4f46e5',
        primaryHover: '#4338ca',
        success: '#10b981',
        danger: '#ef4444',
      }
    },
  },
  plugins: [],
}
