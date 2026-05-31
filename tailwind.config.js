/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  // Gluestack v2's provider sets the colour scheme manually, which NativeWind
  // only permits with class-based dark mode.
  darkMode: 'class',
  presets: [require('nativewind/preset'), require('./gluestack-ui.preset.js')],
  theme: {
    extend: {
      fontFamily: {
        sans: ['SF Pro Text', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
