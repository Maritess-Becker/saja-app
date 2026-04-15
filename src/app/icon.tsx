import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const size = { width: 512, height: 512 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 512,
          height: 512,
          borderRadius: '114px',
          background: '#FAF8F4',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg width="460" height="460" viewBox="0 0 512 512" fill="none">
          <circle
            cx="256"
            cy="256"
            r="200"
            fill="none"
            stroke="#9E6B47"
            strokeWidth="44"
            strokeLinecap="round"
            strokeDasharray="942 314"
            transform="rotate(135, 256, 256)"
          />
        </svg>
      </div>
    ),
    { width: 512, height: 512 }
  )
}
