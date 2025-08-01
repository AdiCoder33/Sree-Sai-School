import * as React from "react"

import { useIsMobile } from "@/hooks/use-mobile"
import { useSidebar } from "@/components/ui/sidebar"

// Detects a left-to-right swipe starting from the middle of the screen.
// `threshold` determines the minimum swipe distance in pixels.
// `startFraction` determines how far from the left edge the swipe must begin
// (e.g. 0.5 means the swipe must start on the right half of the screen).
export function useSwipeOpen(threshold = 50, startFraction = 0.5) {
  const { setOpenMobile, openMobile } = useSidebar()
  const isMobile = useIsMobile()

  React.useEffect(() => {
    if (!isMobile) return

    let startX: number | null = null

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return
      const touch = e.touches[0]
      const startZone = window.innerWidth * startFraction
      startX = touch.clientX >= startZone ? touch.clientX : null
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
  }, [isMobile, threshold, startFraction, setOpenMobile, openMobile])
}
