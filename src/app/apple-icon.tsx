import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          borderRadius: '40px',
          background: '#FAF8F4',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg width="160" height="160" viewBox="0 0 512 512" fill="none">
          <g transform="rotate(135, 256, 256)">
            <path
              d="M 68 444 A 212 212 0 1 1 444 444"
              stroke="#9E6B47"
              strokeWidth="44"
              strokeLinecap="round"
              fill="none"
            />
          </g>
        </svg>
      </div>
    ),
    { width: 180, height: 180 }
  )
}
