/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        yg: {
          primary: '#176B52',
          primaryHover: '#125640',
          primarySoft: '#E8F3EE',
          secondary: '#16324F',
          secondarySoft: '#EAF0F6',
          accent: '#E5A43B',
          success: '#21865B',
          warning: '#C98320',
          danger: '#C84C4C',
          info: '#3478B8',
          bg: '#F6F8F7',
          surface: '#FFFFFF',
          surfaceSubtle: '#EEF2F0',
          border: '#DCE5E0',
          text: '#172B25',
          textSecondary: '#60736B',
          demandLow: '#72B99A',
          demandMedium: '#E5A43B',
          demandHigh: '#C84C4C',
          unserved: '#8B5CF6'
        }
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', "'Segoe UI'", 'sans-serif'],
      },
      boxShadow: {
        'yg-card': '0 1px 3px rgba(22, 50, 39, 0.06), 0 5px 16px rgba(22, 50, 39, 0.04)',
        'yg-popover': '0 12px 32px rgba(22, 50, 39, 0.14)',
      },
      borderRadius: {
        'yg-card': '16px',
        'yg-btn': '10px',
        'yg-pill': '999px',
      }
    },
  },
  plugins: [],
}
