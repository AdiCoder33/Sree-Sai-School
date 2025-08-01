import * as React from "react"

import { useIsMobile } from "@/hooks/use-mobile"
import { useSidebar } from "@/components/ui/sidebar"

export function useSwipeOpen(threshold = 50, edge = 20) {
  const { setOpenMobile, openMobile } = useSidebar()
  const isMobile = useIsMobile()

  React.useEffect(() => {
    if (!isMobile) return

    let startX: number | null = null

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return
      const touch = e.touches[0]
      startX = touch.clientX <= edge ? touch.clientX : null
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
  }, [isMobile, threshold, edge, setOpenMobile, openMobile])
}
