/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        heading: ['Space Grotesk', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        sans: ['Inter', 'sans-serif'],
      },
      animation: {
        'spin-slow': 'spin 8s linear infinite',
      },
      colors: {
        cyber: {
          950: '#070a11',
          900: '#0b0f19',
          800: '#111827',
          700: '#1f293d',
          600: '#374151',
        },
        tech: {
          cyan: '#00f2fe',
          blue: '#38bdf8',
          glow: 'rgba(0, 242, 254, 0.25)',
        },
        ethics: {
          amber: '#fbbf24',
          gold: '#f59e0b',
          glow: 'rgba(251, 191, 36, 0.25)',
        },
        crisis: {
          rose: '#f43f5e',
          neon: '#ff2a6d',
        },
        neural: {
          light: '#a78bfa',
          medium: '#8b5cf6',
          dark: '#7c3aed',
          glow: 'rgba(139, 92, 246, 0.25)',
        }
      },
    },
  },
  plugins: [],
}

