'use client'

import { useEffect } from 'react'
import { motion, useAnimation } from 'framer-motion'
import { cn } from '@/lib/utils'

interface Props {
  size?: 'sm' | 'md' | 'lg'
  showTagline?: boolean
  className?: string
  variant?: 'default' | 'match' | 'begegnung'
  animate?: boolean
  onDark?: boolean
}

export function SajaLogo({
  size = 'md',
  showTagline = false,
  className,
  variant = 'default',
  animate: shouldAnimate = false,
  onDark = false,
}: Props) {
  const arcSize = size === 'sm' ? 22 : size === 'lg' ? 36 : 28
  const textSize = size === 'sm' ? 'text-xl' : size === 'lg' ? 'text-3xl' : 'text-2xl'
  const stroke = size === 'sm' ? 1.5 : 2

  const r = arcSize / 2 - stroke
  const cx = arcSize / 2
  const cy = arcSize / 2

  const startAngle = 135 * (Math.PI / 180)
  const endAngle   = 45  * (Math.PI / 180)
  const midAngle   = 90  * (Math.PI / 180)

  const x1   = cx + r * Math.cos(startAngle)
  const y1   = cy + r * Math.sin(startAngle)
  const x2   = cx + r * Math.cos(endAngle)
  const y2   = cy + r * Math.sin(endAngle)
  const xMid = cx + r * Math.cos(midAngle)
  const yMid = cy + r * Math.sin(midAngle)

  // Two halves of the gap, each animates from endpoint toward center
  const gapLeft  = `M ${x1} ${y1} A ${r} ${r} 0 0 0 ${xMid} ${yMid}`
  const gapRight = `M ${x2} ${y2} A ${r} ${r} 0 0 1 ${xMid} ${yMid}`

  const gapLeftControls   = useAnimation()
  const gapRightControls  = useAnimation()
  const svgRotateControls = useAnimation()

  const matchColor   = '#C4A882'
  const defaultColor = onDark ? '#FDF8F2' : '#221080'
  const mainColor    = variant === 'match' ? matchColor : defaultColor
  const gapColor     = variant === 'match' ? matchColor : defaultColor

  useEffect(() => {
    if (!shouldAnimate || variant === 'default') return
    async function run() {
      if (variant === 'match') {
        await Promise.all([
          gapLeftControls.start({ pathLength: 1, transition: { duration: 1.2, ease: 'easeInOut' } }),
          gapRightControls.start({ pathLength: 1, transition: { duration: 1.2, ease: 'easeInOut' } }),
        ])
      } else if (variant === 'begegnung') {
        await Promise.all([
          gapLeftControls.start({ pathLength: 1, transition: { duration: 0.8, ease: 'easeInOut' } }),
          gapRightControls.start({ pathLength: 1, transition: { duration: 0.8, ease: 'easeInOut' } }),
        ])
        await svgRotateControls.start({
          rotate: 360,
          transition: { duration: 1.5, ease: 'easeInOut' },
        })
      }
    }
    run()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldAnimate, variant])

  return (
    <div className={cn('flex flex-col', className)}>
      <div className="flex items-center gap-2.5">
        {/* Wrapper div for base 135° rotation */}
        <div
          style={{
            width: arcSize,
            height: arcSize,
            transform: 'rotate(135deg)',
            transformOrigin: 'center',
            display: 'inline-block',
            flexShrink: 0,
          }}
        >
          <motion.svg
            width={arcSize}
            height={arcSize}
            viewBox={`0 0 ${arcSize} ${arcSize}`}
            fill="none"
            animate={svgRotateControls}
            initial={{ rotate: 0 }}
            style={{ transformOrigin: 'center' }}
          >
            {/* Main 270° arc */}
            <path
              d={`M ${x1} ${y1} A ${r} ${r} 0 1 1 ${x2} ${y2}`}
              stroke={mainColor}
              strokeWidth={stroke}
              strokeLinecap="round"
              fill="none"
            />
            {/* Animated gap fillers */}
            {variant !== 'default' && (
              <>
                <motion.path
                  d={gapLeft}
                  stroke={gapColor}
                  strokeWidth={stroke}
                  strokeLinecap="round"
                  fill="none"
                  initial={{ pathLength: 0 }}
                  animate={gapLeftControls}
                />
                <motion.path
                  d={gapRight}
                  stroke={gapColor}
                  strokeWidth={stroke}
                  strokeLinecap="round"
                  fill="none"
                  initial={{ pathLength: 0 }}
                  animate={gapRightControls}
                />
              </>
            )}
          </motion.svg>
        </div>

        <span
          className={cn('font-heading font-semibold leading-none', textSize)}
          style={{ color: onDark ? '#FDF8F2' : '#221080' }}
        >
          Saja
        </span>
      </div>

      {showTagline && (
        <p
          className="text-[10px] tracking-widest uppercase mt-1"
          style={{ color: onDark ? 'rgba(253,248,242,0.45)' : 'rgba(26,16,64,0.4)' }}
        >
          Bewusstes Dating
        </p>
      )}
    </div>
  )
}
