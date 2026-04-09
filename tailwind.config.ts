import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0b1220',
        panel: '#101b2f',
        border: '#1f2a44',
        muted: '#94a3b8',
        success: '#22c55e',
        danger: '#ef4444',
      },
      boxShadow: {
        panel: '0 6px 24px rgba(0,0,0,0.25)',
      },
    },
  },
  plugins: [],
} satisfies Config;
