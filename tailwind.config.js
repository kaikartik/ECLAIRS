/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    colors: {
      white: '#FFFFFF',
      black: '#000000',
      'brand-beige': '#FDFBF8',
      'brand-brown-light': '#D4C9BF',
      'brand-brown': '#8A6E59',
      'brand-brown-dark': '#4A3F35',
      'brand-text': '#3D3D3D',
      red: {
        '100': '#FEE',
        '700': '#C33',
      },
    },
    fontFamily: {
      sans: ['Inter', 'sans-serif'],
      serif: ['Lora', 'serif'],
    },
  },
  plugins: [],
}