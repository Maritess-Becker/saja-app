import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Saja — Bewusstes Dating',
    short_name: 'Saja',
    description: 'Bewusstes Dating für echte Verbindung',
    start_url: '/discover',
    display: 'standalone',
    background_color: '#7A3E1E',
    theme_color: '#7A3E1E',
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
