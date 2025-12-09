/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./docs/**/*.mdx", "./blog/**/*.mdx"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#00f2ff', // Neon Cyan (dark) / #0066cc (light)
          dark: '#00c8d4',
          light: '#5ff9ff',
        },
        secondary: {
          DEFAULT: '#7000ff', // Deep Purple
          light: '#9d4dff',
        },
        dark: {
          bg: '#050505', // Almost black
          card: '#0a0a0a',
          border: '#1f1f1f',
        },
        light: {
          bg: '#ffffff',
          card: '#f8f9fa',
          surface: '#f1f3f5',
          text: '#1a1a1a',
          'text-secondary': '#4a5568',
          border: '#e2e8f0',
        }
      },
      fontFamily: {
        sans: ['"Outfit"', 'sans-serif'],
        heading: ['"Outfit"', 'sans-serif'],
      },
      animation: {
        'blob': 'blob 7s infinite',
        'fade-in': 'fadeIn 0.5s ease-out forwards',
      },
      keyframes: {
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
  darkMode: ['class', '[data-theme="dark"]'],
  corePlugins: {
    preflight: false,
  },
  blocklist: ['container'],
};
