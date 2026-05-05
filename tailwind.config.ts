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
        primary:    '#3B1F0A',
        medium:     '#6B3018',
        deep:       '#240E04',
        cream:      '#FDF5E8',
        moon:       '#FDF5E8',   // alias
        background: '#3B1F0A',
        // compatibility aliases
        dark:       '#240E04',
        light:      '#FDF5E8',
        sand:       '#3B1F0A',
        surface:    '#6B3018',
        text:       '#3B1F0A',
        muted:      '#907060',
        'on-primary': '#FDF5E8',
      },
      fontFamily: {
        heading:    ['Cormorant Garamond', 'Georgia', 'serif'],
        instrument: ['Instrument Serif', 'Georgia', 'serif'],
        body:       ['Outfit', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config
