import { cn } from '@/lib/utils'

interface Props {
  size?: 'sm' | 'md' | 'lg'
  showTagline?: boolean
  className?: string
}

export function SajaLogo({ size = 'md', showTagline = false, className }: Props) {
  const arcSize = size === 'sm' ? 22 : size === 'lg' ? 36 : 28
  const textSize = size === 'sm' ? 'text-xl' : size === 'lg' ? 'text-3xl' : 'text-2xl'
  const stroke = size === 'sm' ? 1.5 : 2

  const r = arcSize / 2 - stroke
  const cx = arcSize / 2
  const cy = arcSize / 2

  const startAngle = 135 * (Math.PI / 180)
  const endAngle = 45 * (Math.PI / 180)

  const x1 = cx + r * Math.cos(startAngle)
  const y1 = cy + r * Math.sin(startAngle)
  const x2 = cx + r * Math.cos(endAngle)
  const y2 = cy + r * Math.sin(endAngle)

  return (
    <div className={cn('flex flex-col', className)}>
      <div className="flex items-center gap-2.5">
        {/* Arc icon */}
        <svg
          width={arcSize}
          height={arcSize}
          viewBox={`0 0 ${arcSize} ${arcSize}`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ transform: 'rotate(135deg)', transformOrigin: 'center' }}
        >
          <path
            d={`M ${x1} ${y1} A ${r} ${r} 0 1 1 ${x2} ${y2}`}
            stroke="#9E6B47"
            strokeWidth={stroke}
            strokeLinecap="round"
            fill="none"
          />
        </svg>

        {/* Wordmark — Cormorant Garamond Light */}
        <span
          className={cn('font-heading font-semibold leading-none', textSize)}
          style={{ color: '#1A1410' }}
        >
          Saja
        </span>
      </div>

    </div>
  )
}
