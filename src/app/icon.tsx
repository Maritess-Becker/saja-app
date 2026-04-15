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
          background: '#9E6B47',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
        }}
      >
        {/* Arc SVG */}
        <svg
          width="160"
          height="160"
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
        {/* Wordmark */}
        <span
          style={{
            color: 'white',
            fontSize: 128,
            fontFamily: 'Georgia, serif',
            fontWeight: 600,
            letterSpacing: '-3px',
            lineHeight: 1,
            marginTop: '-8px',
          }}
        >
          Saja
        </span>
      </div>
    ),
    { width: 512, height: 512 }
  )
}
