/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{vue,js,ts,jsx,tsx}",
    "./components/**/*.{vue,js,ts,jsx,tsx}",
    "./layouts/**/*.{vue,js,ts,jsx,tsx}",
    "./pages/**/*.{vue,js,ts,jsx,tsx}",
    "./plugins/**/*.{js,ts}",
    "./nuxt.config.{js,ts}"
  ],

  darkMode: 'class',

  theme: {
    extend: {
      // PrimeVueテーマとの統合カラーパレット (Nuxt UI用に調整)
      colors: {
        primary: {
          50: '#f0f4ff',
          100: '#e0eaff',
          200: '#c7d7ff',
          300: '#a5bbff',
          400: '#8196ff',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b'
        },
        surface: {
          0: '#ffffff',
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617'
        }
      },

      fontFamily: {
        sans: ['Inter var', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      },

      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'bounce-in': 'bounceIn 0.6s ease-out',
        'shimmer': 'shimmer 2s linear infinite',
        'pulse-soft': 'pulseSoft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
      },

      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        bounceIn: {
          '0%': { opacity: '0', transform: 'scale(0.3)' },
          '50%': { transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' }
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' }
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' }
        }
      },

      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem'
      },

      borderRadius: {
        '4xl': '2rem'
      },

      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'medium': '0 4px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'large': '0 10px 40px -10px rgba(0, 0, 0, 0.1), 0 2px 9px -5px rgba(0, 0, 0, 0.06)'
      },

      backdropBlur: {
        xs: '2px'
      }
    }
  },

  plugins: [
    // カスタムユーティリティプラグイン
    function({ addUtilities, addComponents, theme }) {
      addUtilities({
        // ガラスモーフィズム効果
        '.glass': {
          'background': 'rgba(255, 255, 255, 0.1)',
          'backdrop-filter': 'blur(10px)',
          'border': '1px solid rgba(255, 255, 255, 0.2)',
        },
        '.glass-dark': {
          'background': 'rgba(0, 0, 0, 0.1)',
          'backdrop-filter': 'blur(10px)',
          'border': '1px solid rgba(255, 255, 255, 0.1)',
        },

        // グラデーションテキスト
        '.text-gradient': {
          'background': 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
          '-webkit-background-clip': 'text',
          'background-clip': 'text',
          '-webkit-text-fill-color': 'transparent'
        },

        // スクロールバーのスタイリング
        '.scrollbar-thin': {
          'scrollbar-width': 'thin',
          'scrollbar-color': theme('colors.gray.400') + ' transparent'
        },
        '.scrollbar-thin::-webkit-scrollbar': {
          width: '6px'
        },
        '.scrollbar-thin::-webkit-scrollbar-track': {
          background: 'transparent'
        },
        '.scrollbar-thin::-webkit-scrollbar-thumb': {
          'background-color': theme('colors.gray.400'),
          'border-radius': '3px'
        }
      })

      addComponents({
        // カスタムボタンコンポーネント
        '.btn-primary': {
          '@apply bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md': {}
        },
        '.btn-secondary': {
          '@apply bg-surface-100 hover:bg-surface-200 text-surface-700 px-4 py-2 rounded-lg font-medium transition-all duration-200 border border-surface-300': {}
        },

        // カスタムカードコンポーネント
        '.card': {
          '@apply bg-white dark:bg-surface-800 rounded-xl shadow-soft border border-surface-200 dark:border-surface-700 p-6': {}
        },
        '.card-hover': {
          '@apply card hover:shadow-medium transition-all duration-300 hover:-translate-y-1': {}
        }
      })
    }
  ]
}
