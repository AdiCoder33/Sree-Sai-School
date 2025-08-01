import * as React from "react"

import { useIsMobile } from "@/hooks/use-mobile"
import { useSidebar } from "@/components/ui/sidebar"

// Detects a left-to-right swipe starting roughly from the middle of the screen.
// `threshold` determines the minimum swipe distance in pixels.
// `startFraction` sets the center point of the swipe zone, expressed as a
// fraction of the screen width (e.g. 0.5 is dead center).
// `zoneFraction` determines how wide the swipe zone is relative to the screen
// width. The swipe must begin within this zone to trigger the sidebar.
export function useSwipeOpen(
  threshold = 50,
  startFraction = 0.5,
  zoneFraction = 0.2,
) {
  const { setOpenMobile, openMobile } = useSidebar()
  const isMobile = useIsMobile()

  React.useEffect(() => {
    if (!isMobile) return

    let startX: number | null = null

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return
      const touch = e.touches[0]
      const zoneCenter = window.innerWidth * startFraction
      const halfZone = (window.innerWidth * zoneFraction) / 2
      startX =
        touch.clientX >= zoneCenter - halfZone &&
        touch.clientX <= zoneCenter + halfZone
          ? touch.clientX
          : null
    }

    const handleTouchEnd = (e: TouchEvent) => {
      if (startX === null) return
      const touch = e.changedTouches[0]
      const distance = touch.clientX - startX
      if (distance > threshold && !openMobile) {
        setOpenMobile(true)
      }
      startX = null
    }

    window.addEventListener("touchstart", handleTouchStart)
    window.addEventListener("touchend", handleTouchEnd)
    return () => {
      window.removeEventListener("touchstart", handleTouchStart)
      window.removeEventListener("touchend", handleTouchEnd)
    }
  }, [isMobile, threshold, startFraction, zoneFraction, setOpenMobile, openMobile])
}
