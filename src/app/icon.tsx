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
          background: '#221080',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg width="460" height="460" viewBox="0 0 512 512" fill="none">
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
    { width: 512, height: 512 }
  )
}
