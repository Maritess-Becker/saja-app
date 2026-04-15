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
          background: '#9E6B47',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg
          width="112"
          height="112"
          viewBox="0 0 512 512"
          fill="none"
          style={{ transform: 'rotate(135deg)' }}
        >
          <path
            d="M 142.86 369.14 A 160 160 0 1 1 369.14 369.14"
            stroke="white"
            strokeWidth="36"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      </div>
    ),
    { width: 180, height: 180 }
  )
}
