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
        // ── Core palette ──────────────────────────────────
        primary:      '#6B7B5A',   // Sage
        medium:       '#4A5840',   // Sage Dark
        deep:         '#2C1A0E',   // Espresso
        cream:        '#EAE0D5',   // Sand
        surface:      '#F2EBE2',   // Oat
        background:   '#EAE0D5',   // Sand
        // ── Text ──────────────────────────────────────────
        text:         '#2C1A0E',   // Espresso
        muted:        '#9A8A7A',   // Taupe
        subtle:       '#B5A898',   // Helles Taupe
        // ── Accents ───────────────────────────────────────
        terra:        '#B5522A',   // Terracotta
        sage:         '#6B7B5A',   // Sage (primär)
        gold:         '#C8A86A',   // Gold
        // ── Compatibility aliases ──────────────────────────
        moon:         '#EAE0D5',
        dark:         '#2C1A0E',
        light:        '#F2EBE2',
        sand:         '#EAE0D5',
        'on-primary': '#F2EBE2',
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
