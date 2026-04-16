import { useEffect, type RefObject } from 'react'

/**
 * Handles the three keyboard-related layout problems in a chat page on iOS:
 *
 * 1. Container height — set to `visualViewport.height` so the flex layout
 *    always fills exactly the visible screen, even when the keyboard is open.
 *    This keeps the form glued to the top of the keyboard regardless of
 *    how far the user has scrolled in the message list.
 *
 * 2. Nav spacer — collapses to 0 while the keyboard is open so the input
 *    sits *directly* above the keyboard rather than floating `navHeight` px
 *    above it.
 *
 * 3. Mobile bottom nav — slides down behind the keyboard (translateY) so it
 *    doesn't appear between the keyboard and the input field.
 */
export function useChatLayout(
  containerRef: RefObject<HTMLElement | null>,
  spacerRef: RefObject<HTMLElement | null>,
) {
  useEffect(() => {
    if (typeof window === 'undefined') return
    const vv = window.visualViewport
    if (!vv) return

    function adjust() {
      const keyboardHeight =
        window.innerHeight - (vv?.height ?? window.innerHeight) - (vv?.offsetTop ?? 0)
      const isKeyboardOpen = keyboardHeight > 80

      // 1. Shrink/grow container to match the visible viewport
      if (containerRef.current) {
        containerRef.current.style.height = `${vv!.height}px`
      }

      // 2. Collapse nav spacer when keyboard is open
      if (spacerRef.current) {
        spacerRef.current.style.height = isKeyboardOpen
          ? '0px'
          : 'calc(4rem + env(safe-area-inset-bottom, 0px))'
        spacerRef.current.style.transition = 'height 0.2s ease'
      }

      // 3. Push mobile nav behind the keyboard
      const nav = document.querySelector<HTMLElement>('[data-mobile-nav]')
      if (nav) {
        nav.style.transition = 'transform 0.2s ease'
        nav.style.transform = isKeyboardOpen
          ? `translateY(${keyboardHeight}px)`
          : ''
      }
    }

    adjust() // run once on mount to set initial height
    vv.addEventListener('resize', adjust)
    vv.addEventListener('scroll', adjust)

    return () => {
      vv.removeEventListener('resize', adjust)
      vv.removeEventListener('scroll', adjust)
      // Restore defaults on unmount
      if (containerRef.current) containerRef.current.style.height = ''
      if (spacerRef.current) {
        spacerRef.current.style.height = ''
        spacerRef.current.style.transition = ''
      }
      const nav = document.querySelector<HTMLElement>('[data-mobile-nav]')
      if (nav) {
        nav.style.transition = ''
        nav.style.transform = ''
      }
    }
  }, [containerRef, spacerRef])
}
