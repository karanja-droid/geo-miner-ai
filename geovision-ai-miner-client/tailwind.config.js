/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        // Geological color palette
        geological: {
          rock: '#8B4513',
          mineral: '#FFD700',
          soil: '#DEB887',
          water: '#4682B4',
          stone: '#696969',
          clay: '#CD853F',
          sand: '#F4A460',
          coal: '#2F4F4F',
          gold: '#FFD700',
          silver: '#C0C0C0',
          copper: '#B87333',
          iron: '#708090'
        },
        // Mining-specific colors
        mining: {
          primary: '#1976d2',
          secondary: '#dc004e',
          success: '#4caf50',
          warning: '#ff9800',
          error: '#f44336',
          info: '#2196f3'
        }
      },
      fontFamily: {
        'geological': ['Roboto', 'sans-serif'],
        'technical': ['Consolas', 'Monaco', 'monospace']
      },
      spacing: {
        'xs': '0.25rem',
        'sm': '0.5rem',
        'md': '1rem',
        'lg': '1.5rem',
        'xl': '2rem',
        '2xl': '3rem',
        '3xl': '4rem'
      },
      fontSize: {
        'h1': ['2.5rem', { lineHeight: '1.2' }],
        'h2': ['2rem', { lineHeight: '1.3' }],
        'h3': ['1.75rem', { lineHeight: '1.4' }],
        'body': ['1rem', { lineHeight: '1.5' }],
        'caption': ['0.875rem', { lineHeight: '1.4' }]
      },
      boxShadow: {
        'geological': '0 4px 6px -1px rgba(139, 69, 19, 0.1), 0 2px 4px -1px rgba(139, 69, 19, 0.06)',
        'mining': '0 10px 15px -3px rgba(25, 118, 210, 0.1), 0 4px 6px -2px rgba(25, 118, 210, 0.05)'
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
        'spin-slow': 'spin 3s linear infinite'
      }
    },
  },
  plugins: [
    // Custom plugin for geological utilities
    function({ addUtilities, theme }) {
      const newUtilities = {
        '.text-geological': {
          color: theme('colors.geological.rock')
        },
        '.bg-geological': {
          backgroundColor: theme('colors.geological.soil')
        },
        '.border-geological': {
          borderColor: theme('colors.geological.stone')
        },
        '.shadow-geological': {
          boxShadow: theme('boxShadow.geological')
        },
        '.shadow-mining': {
          boxShadow: theme('boxShadow.mining')
        }
      }
      addUtilities(newUtilities)
    }
  ],
} 