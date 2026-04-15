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
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '4px',
        }}
      >
        {/* Arc SVG */}
        <svg
          width="56"
          height="56"
          viewBox="0 0 160 160"
          fill="none"
          style={{ transform: 'rotate(135deg)' }}
        >
          <path
            d="M 33.43 113.13 A 66 66 0 1 1 126.57 113.13"
            stroke="white"
            strokeWidth="12"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
        <span
          style={{
            color: 'white',
            fontSize: 46,
            fontFamily: 'Georgia, serif',
            fontWeight: 600,
            letterSpacing: '-1px',
            lineHeight: 1,
          }}
        >
          Saja
        </span>
      </div>
    ),
    { width: 180, height: 180 }
  )
}
