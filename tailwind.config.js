/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,jsx,ts,tsx}",
    "./src/components/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['BananaGrotesk-Regular'],
        'thin': ['BananaGrotesk-Thin'],
        'extralight': ['BananaGrotesk-ExtraLight'],
        'light': ['BananaGrotesk-Light'],
        'regular': ['BananaGrotesk-Regular'],
        'medium': ['BananaGrotesk-Medium'],
        'bold': ['BananaGrotesk-Bold'],
        'extrabold': ['BananaGrotesk-ExtraBold'],
      },
      colors: {
        primary: {
          main: '#34AA87',
          neutral: '#FFFFFF',
        },
        tc: {
          primary: '#020202',
          dark: '#002C1F',  
        },
        secondary: {
          subtext: '#5E5E5E',
          disabled: '#08080866',
          caption: "#6B707A",
          divider: "#E5E5E5", 
          icons: "#808080",
          stroke: "#D0D2D5"
        },
        background: {
          input: '#F6F7F9',
          disabled: '#F1F2F4',
        },
        accent: {
          error: "#FF0000",
          success: "#0E8345",
          warning: "#FFCE00",
          info: "#0C6FF9",
          overlay: "#EFFAF7"
        },
      },
    },
  },
  plugins: [],
}