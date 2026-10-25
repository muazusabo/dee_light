import type { Config } from 'tailwindcss';
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: '#18351B', 600: '#294B2B', 50: '#EEF3EE' },
        gold: { DEFAULT: '#E0A91B', 600: '#B88708' },
        paper: '#F8F8F5', ink: '#242820', muted: '#5E6258', line: '#E7E8E1',
      },
      fontFamily: { display: ['var(--font-display)', 'Georgia', 'serif'], sans: ['var(--font-sans)', 'system-ui', 'sans-serif'] },
      boxShadow: { card: '0 1px 2px rgba(24,53,27,.06), 0 4px 12px rgba(24,53,27,.06)' },
    },
  },
  plugins: [],
};
export default config;
