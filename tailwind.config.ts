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
        primary:      '#2F4A3C',   // Tiefes Waldgrün
        medium:       '#3D5E4E',   // Besondere Momente
        deep:         '#1E3028',   // Sehr dunkles Waldgrün
        cream:        '#E7DFD6',   // Warmes Steinbeige (Haupthintergrund)
        surface:      '#F2EBE2',   // Card / erhöhte Flächen
        background:   '#2F4A3C',
        // ── Text ──────────────────────────────────────────
        text:         '#232323',   // Dunkles Anthrazit
        muted:        '#6B6058',   // Sekundärtext
        subtle:       '#9A8E84',   // Tertiärtext / Placeholder
        // ── Accents ───────────────────────────────────────
        terra:        '#A8654C',   // Gedämpftes Terrakotta
        sage:         '#7A9E8A',   // Akzent Salbeigrün
        gold:         '#BFA76A',   // Akzent Gold
        // ── Compatibility aliases ──────────────────────────
        moon:         '#E7DFD6',
        dark:         '#1E3028',
        light:        '#F2EBE2',
        sand:         '#2F4A3C',
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
