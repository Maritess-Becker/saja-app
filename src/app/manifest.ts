import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Saja — Bewusstes Dating',
    short_name: 'Saja',
    description: 'Bewusstes Dating für echte Verbindung',
    start_url: '/discover',
    display: 'standalone',
    background_color: '#FAF8F4',
    theme_color: '#9E6B47',
    orientation: 'portrait',
    categories: ['lifestyle', 'social'],
    icons: [
      {
        src: '/icon',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/apple-icon',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  }
}
