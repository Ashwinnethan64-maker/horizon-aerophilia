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
          primary: '#0866F5',
          primaryHover: '#064DB8',
          primarySoft: '#EAF2FF',
          secondary: '#10233F',
          secondarySoft: '#EAF2FF',
          accent: '#FFD93D',
          violet: '#C4B5FD',
          success: '#178653',
          warning: '#D99127',
          danger: '#D93636',
          info: '#0866F5',
          bg: '#FFFDF5',
          surface: '#FFFFFF',
          surfaceSubtle: '#F6F4EA',
          border: '#111111',
          text: '#111111',
          textSecondary: '#454545',
          demandLow: '#178653',
          demandMedium: '#D99127',
          demandHigh: '#D93636',
          unserved: '#C4B5FD'
        }
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', "'Segoe UI'", 'sans-serif'],
      },
      boxShadow: {
        'yg-card': '4px 4px 0 0 #111111',
        'yg-md': '6px 6px 0 0 #111111',
        'yg-lg': '8px 8px 0 0 #111111',
        'yg-popover': '6px 6px 0 0 #111111',
      },
      borderRadius: {
        'yg-card': '4px',
        'yg-btn': '4px',
        'yg-pill': '999px',
      }
    },
  },
  plugins: [],
};
