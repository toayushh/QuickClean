/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#ff3b3b',
          light: '#ff6b6b',
          dark: '#e63030',
        },
      },
      backgroundColor: {
        'light': '#ffffff',
        'light-secondary': '#f8f8f8',
        'dark': '#1a1a1a',
        'dark-secondary': '#2d2d2d',
      },
      textColor: {
        'light-primary': '#1a1a1a',
        'light-secondary': '#666666',
        'dark-primary': '#ffffff',
        'dark-secondary': '#b0b0b0',
      },
    },
  },
  plugins: [],
}
