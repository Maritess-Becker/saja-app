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
        primary:    '#7A3E1E',
        medium:     '#A05830',
        deep:       '#4A2010',
        cream:      '#FDF5E8',
        moon:       '#FDF5E8',   // alias
        background: '#7A3E1E',
        // compatibility aliases
        dark:       '#4A2010',
        light:      '#FDF5E8',
        sand:       '#7A3E1E',
        surface:    '#A05830',
        text:       '#7A3E1E',
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
