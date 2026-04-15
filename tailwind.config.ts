import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary:    '#9E6B47',
        dark:       '#7A4E30',
        light:      '#F6F2EC',
        background: '#FAF8F4',
        sand:       '#E2DAD0',
        accent:     '#7A8F7C',
        text:       '#1A1410',
        muted:      '#A89888',
      },
      fontFamily: {
        heading:    ['Cormorant Garamond', 'Georgia', 'serif'],
        instrument: ['Instrument Serif', 'Georgia', 'serif'],
        body:       ['DM Sans', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config
