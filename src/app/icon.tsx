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
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg
          width="460"
          height="460"
          viewBox="0 0 512 512"
          fill="none"
          style={{ transform: 'rotate(135deg)' }}
        >
          <path
            d="M 68 444 A 212 212 0 1 1 444 444"
            stroke="white"
            strokeWidth="44"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      </div>
    ),
    { width: 512, height: 512 }
  )
}
