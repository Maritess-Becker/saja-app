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
        primary:    '#221080',
        medium:     '#3D1F9E',
        deep:       '#120850',
        cream:      '#FFF6E8',
        moon:       '#FFF6E8',   // alias
        background: '#221080',
        // compatibility aliases
        dark:       '#120850',
        light:      '#FFF6E8',
        sand:       '#221080',
        surface:    '#3D1F9E',
        text:       '#221080',
        muted:      '#7070A8',
        'on-primary': '#FFF6E8',
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
