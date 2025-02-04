/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      colors: {
        berkeleyBlue: "#0f2d50",
        berkeleyBlueTranslucent: "#0f2d507f",
        chineseViolet: "#7e5977",
        chineseVioletTranslucent: "#7e59777f",
        rosyBrown: "#c7949d",
        rosyBrownTranslucent: "#c7949d7f",
        tan: "#e6c198",
        tanTranslucent: "#e6c1987f",
        yaleBlue: "#0c3a6b",
        yaleBlueTranslucent: "#0c3a6b7f",
        bar: "#282D3E"
      }
    },
  },
  plugins: [
    require("@tailwindcss/aspect-ratio"),
    require("@tailwindcss/forms"),
    require("@tailwindcss/line-clamp"),
    require("@tailwindcss/typography"),
  ],
};