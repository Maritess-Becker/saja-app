'use client'

import { useEffect, useRef } from 'react'
import { motion, AnimatePresence, useAnimation } from 'framer-motion'
import { useRouter } from 'next/navigation'

export type CircleAnimationVariant = 'match' | 'begegnung'

interface Props {
  variant: CircleAnimationVariant
  visible: boolean
  navigateTo: string
  onDone?: () => void
}

const CONFIG = {
  match: {
    overlayBg: '#F7F2EA',
    circleColor: '#C17A4E',
    textColor: '#2D1B0E',
    closeDuration: 1.5,
    line1: 'Ein Match',
    line2: 'jetzt kannst du eine Begegnung anfragen.',
    line3: null,
  },
  begegnung: {
    overlayBg: '#4A2510',
    circleColor: '#F7F2EA',
    textColor: '#F7F2EA',
    closeDuration: 2,
    line1: 'Eine Begegnung',
    line2: '— auf einmal.',
    line3: 'Ihr seid beide füreinander reserviert.',
  },
} as const

export function SajaCircleAnimation({ variant, visible, navigateTo, onDone }: Props) {
  const router = useRouter()
  const cfg = CONFIG[variant]
  const circleControls = useAnimation()
  const containerControls = useAnimation()
  const doneRef = useRef(false)

  useEffect(() => {
    if (!visible || doneRef.current) return
    doneRef.current = false

    async function runSequence() {
      // Mobile vibration
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(200)
      }

      // Step 1: Close the arc → full circle
      await circleControls.start({
        pathLength: 1,
        transition: { duration: cfg.closeDuration, ease: 'easeInOut' },
      })

      // Step 2: Pulse
      await circleControls.start({
        scale: 1.06,
        transition: { duration: 0.15, ease: 'easeOut' },
      })
      await circleControls.start({
        scale: 1,
        transition: { duration: 0.2, ease: 'easeIn' },
      })

      // Step 3: Hold with text visible, then fade out
      await new Promise((r) => setTimeout(r, 2500))

      // Step 4: Fade out entire overlay
      await containerControls.start({
        opacity: 0,
        transition: { duration: 0.6, ease: 'easeInOut' },
      })

      doneRef.current = true
      onDone?.()
      router.push(navigateTo)
    }

    runSequence()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible])

  // Reset when hidden
  useEffect(() => {
    if (!visible) {
      doneRef.current = false
      circleControls.set({ pathLength: 0.75, scale: 1 })
      containerControls.set({ opacity: 1 })
    }
  }, [visible, circleControls, containerControls])

  const size = 200
  const r = 80
  const cx = size / 2
  const cy = size / 2

  // Total time when text should appear: after arc closes
  const textDelay = cfg.closeDuration + 0.1

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="circle-anim-overlay"
          animate={containerControls}
          initial={{ opacity: 0 }}
          exit={{ opacity: 0 }}
          style={{ backgroundColor: cfg.overlayBg }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
          // Fade in
          transition={{ duration: 0.4 }}
          onAnimationStart={() => containerControls.start({ opacity: 1, transition: { duration: 0.4 } })}
        >
          {/* Arc / Circle SVG */}
          <motion.svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            style={{ rotate: '-135deg' }} // positions gap at lower-right, matching Saja logo
          >
            {/* Track (faint) */}
            <circle
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={cfg.circleColor}
              strokeWidth={5}
              opacity={0.15}
            />
            {/* Animated arc */}
            <motion.circle
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={cfg.circleColor}
              strokeWidth={5}
              strokeLinecap="round"
              initial={{ pathLength: 0.75, scale: 1 }}
              animate={circleControls}
            />
          </motion.svg>

          {/* Text */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: textDelay, duration: 0.6 }}
            className="mt-8 text-center px-8 max-w-xs"
          >
            <p
              className="font-heading text-3xl mb-2 leading-tight"
              style={{ color: cfg.textColor }}
            >
              {cfg.line1}
            </p>
            <p
              className="text-base leading-relaxed"
              style={{ color: cfg.textColor, opacity: 0.8 }}
            >
              {cfg.line2}
            </p>
            {cfg.line3 && (
              <p
                className="text-sm mt-2"
                style={{ color: cfg.textColor, opacity: 0.55 }}
              >
                {cfg.line3}
              </p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
