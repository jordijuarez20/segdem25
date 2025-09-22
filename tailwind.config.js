/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        capsule: "#7494ec"
      },
      boxShadow: {
        card: "0 10px 30px rgba(0,0,0,.15)"
      },
      borderRadius: {
        mega: "28px"
      }
    }
  },
  plugins: []
};
