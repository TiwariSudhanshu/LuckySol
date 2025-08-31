"use client"

import type React from "react"

import { useEffect, useRef } from "react"
// import { cn } from "@/lib/utils"

export function SnakeBorder({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  const prefersReducedRef = useRef(false)

  useEffect(() => {
    prefersReducedRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches
  }, [])

  return (
    <div className={"relative"}>
      {/* Card content */}
      <div className="relative z-10">{children}</div>

      {/* Animated border overlay */}
      <svg className="pointer-events-none absolute inset-0 z-0" aria-hidden="true" width="100%" height="100%">
        <defs>
          {/* Soft glow */}
          <filter id="snakeGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#84cc16" floodOpacity="0.25" />
          </filter>
        </defs>
        <rect
          x="6"
          y="6"
          width="calc(100% - 12px)"
          height="calc(100% - 12px)"
          rx="16"
          ry="16"
          // Backing hairline
          stroke="#27272a"
          strokeWidth="1"
          fill="none"
        />
        {/* Moving dash - lime */}
        <rect
          x="6"
          y="6"
          width="calc(100% - 12px)"
          height="calc(100% - 12px)"
          rx="16"
          ry="16"
          stroke="#84cc16"
          strokeWidth="2"
          strokeDasharray="12 10"
          style={{
            // If reduced motion is on, don't animate
            animation: prefersReducedRef.current ? undefined : "snakeLoop 2800ms linear infinite",
            filter: "url(#snakeGlow)",
          }}
          fill="none"
        />
        {/* Accent pass - violet/pink alternating segments */}
        <rect
          x="6"
          y="6"
          width="calc(100% - 12px)"
          height="calc(100% - 12px)"
          rx="16"
          ry="16"
          stroke="#a78bfa"
          strokeWidth="2"
          strokeDasharray="2 20"
          style={{
            animation: prefersReducedRef.current ? undefined : "snakeLoop 3200ms linear infinite reverse",
            opacity: 0.7,
          }}
          fill="none"
        />
      </svg>

      <style>{`@keyframes snakeLoop { to { stroke-dashoffset: -22; } }`}</style>
    </div>
  )
}
