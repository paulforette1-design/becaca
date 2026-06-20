/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        nunito: ['Nunito', 'sans-serif'],
      },
      colors: {
        caca: {
          bg:      '#FBF3E4',
          primary: '#7A4B2B',
          dark:    '#4A2510',
          accent:  '#C4852A',
          surface: '#F0E6D0',
          text:    '#3D1F0A',
          muted:   '#9C7A5A',
          success: '#6B8E23',
        },
      },
    },
  },
  plugins: [],
}
