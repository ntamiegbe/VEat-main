/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}"
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
    },
  },
  plugins: [],
}