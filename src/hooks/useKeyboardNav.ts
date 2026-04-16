import { useEffect } from 'react'

/**
 * On iOS, `position:fixed` elements track the visual viewport.
 * When the keyboard opens the visual viewport shrinks, and fixed elements
 * float up — placing the bottom nav between the keyboard and the input.
 *
 * This hook detects keyboard appearance via the `visualViewport` API and
 * pushes the mobile bottom nav *down* by the keyboard height so it
 * disappears behind the keyboard. When the keyboard closes it slides back.
 *
 * Only active on mobile (md breakpoint guard is in AppNav; here we just
 * target the element that carries the data attribute).
 */
export function useKeyboardNav() {
  useEffect(() => {
    if (typeof window === 'undefined') return
    const vv = window.visualViewport
    if (!vv) return

    function onViewportChange() {
      const nav = document.querySelector<HTMLElement>('[data-mobile-nav]')
      if (!nav) return

      // keyboardHeight is > 0 when the software keyboard is visible
      const keyboardHeight = window.innerHeight - vv!.height - vv!.offsetTop

      if (keyboardHeight > 80) {
        // Push nav down behind the keyboard; use a smooth transition
        nav.style.transition = 'transform 0.2s ease'
        nav.style.transform = `translateY(${keyboardHeight}px)`
      } else {
        nav.style.transition = 'transform 0.25s ease'
        nav.style.transform = ''
      }
    }

    vv.addEventListener('resize', onViewportChange)
    vv.addEventListener('scroll', onViewportChange)

    return () => {
      vv.removeEventListener('resize', onViewportChange)
      vv.removeEventListener('scroll', onViewportChange)
      // Reset on unmount
      const nav = document.querySelector<HTMLElement>('[data-mobile-nav]')
      if (nav) {
        nav.style.transition = ''
        nav.style.transform = ''
      }
    }
  }, [])
}
