/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        montserrat: ["Montserrat", "sans-serif"], // ✅ custom font
      },
      backgroundImage: {
        'gradient-rida': "linear-gradient(135deg, #E92EFB, #FF2079, #440BD4, #04005E)", // ✅ your provided gradient
      },
      textColor: {
        'gradient': 'transparent', // for gradient text
      },
      backgroundClip: {
        'text': 'text', // needed for gradient text
      },
      colors: {
        neonPink: "#E92EFB",
        hotPink: "#FF2079",
        deepBlue: "#440BD4",
        midnight: "#04005E",
      },
    },
  },
  plugins: [],
};
