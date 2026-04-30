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
          background: '#221080',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg width="160" height="160" viewBox="0 0 512 512" fill="none">
          <path
            d="M 256 115 A 141 141 0 1 1 115 256"
            stroke="#221080"
            strokeWidth="32"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      </div>
    ),
    { width: 180, height: 180 }
  )
}
