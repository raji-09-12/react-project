/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./src/**/*.{js,jsx,ts,tsx}",],
  theme: {
      extend: {
          colors: {
              // Custom Colors (optional)
              primary: '#007bff',
              secondary: '#28a745',
              danger: '#dc3545',
          },
          fontFamily: {
              // Custom fonts (optional)
              sans: ['"Helvetica Neue"', 'Arial', 'sans-serif'],
          },
},
  },
  plugins: [],
}

