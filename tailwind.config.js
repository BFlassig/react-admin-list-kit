/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Manrope', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['IBM Plex Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      backgroundImage: {
        'app-gradient': 'radial-gradient(circle at top, #f8fbff 0%, #eef2f8 48%, #e9eef5 100%)',
      },
      boxShadow: {
        panel: '0 1px 2px rgba(15, 23, 42, 0.06), 0 20px 40px -24px rgba(15, 23, 42, 0.35)',
      },
    },
  },
  plugins: [],
}
