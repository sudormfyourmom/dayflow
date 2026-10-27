/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#0c0d0e',
        surface: {
          DEFAULT: '#141618',
          subtle: '#181b1e',
          elevated: '#1e2126',
          hover: '#24282f',
          active: '#2b3038',
        },
        border: {
          subtle: '#202428',
          DEFAULT: '#272c33',
          strong: '#373e48',
        },
        accent: {
          DEFAULT: '#6366f1', // Indigo accent
          hover: '#4f46e5',
          light: '#818cf8',
          subtle: 'rgba(99, 102, 241, 0.12)',
        },
        text: {
          primary: '#f3f4f6',
          secondary: '#9ca3af',
          muted: '#6b7280',
          dim: '#4b5563',
        },
        status: {
          success: '#10b981',
          warning: '#f59e0b',
          danger: '#ef4444',
          info: '#3b82f6',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      },
      borderRadius: {
        sm: '4px',
        DEFAULT: '6px',
        md: '8px',
        lg: '10px',
        xl: '14px',
      },
    },
  },
  plugins: [],
}
