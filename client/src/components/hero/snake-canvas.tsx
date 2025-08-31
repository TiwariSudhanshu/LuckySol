
"use client"

import { useEffect, useRef } from "react"

export function SnakeCanvas({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (prefersReduced) return

    const canvas = canvasRef.current!
    const parent = containerRef.current!
    const ctx = canvas.getContext("2d")!
    let raf = 0
    let running = true

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const { width, height } = parent.getBoundingClientRect()
      canvas.width = Math.max(1, Math.floor(width * dpr))
      canvas.height = Math.max(1, Math.floor(height * dpr))
      canvas.style.width = `${Math.max(1, Math.floor(width))}px`
      canvas.style.height = `${Math.max(1, Math.floor(height))}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(parent)

    const cell = 8
    const cols = () => Math.floor(parent.clientWidth / cell)
    const rows = () => Math.floor(parent.clientHeight / cell)
    let dir = { x: 1, y: 0 }
    let head = { x: Math.floor(cols() / 3), y: Math.floor(rows() / 2) }
    const snake: Array<{ x: number; y: number }> = [head]
    const maxLen = 40
    let tick = 0

    const io = new IntersectionObserver(
      (e) => {
        running = e[0]?.isIntersecting ?? true
        if (running) loop()
      },
      { root: null, threshold: 0.05 },
    )
    io.observe(parent)

    const step = () => {
      if (Math.random() < 0.05) {
        const choices = [
          { x: 1, y: 0 },
          { x: -1, y: 0 },
          { x: 0, y: 1 },
          { x: 0, y: -1 },
        ]
        const next = choices[Math.floor(Math.random() * choices.length)]
        if (snake.length < 2 || next.x !== -dir.x || next.y !== -dir.y) {
          dir = next
        }
      }

      head = { x: (head.x + dir.x + cols()) % cols(), y: (head.y + dir.y + rows()) % rows() }
      snake.push(head)
      if (snake.length > maxLen) snake.shift()
    }

    const draw = () => {
      ctx.clearRect(0, 0, parent.clientWidth, parent.clientHeight)

      ctx.globalAlpha = 0.08
      ctx.strokeStyle = "#27272a"
      for (let x = 0; x < parent.clientWidth; x += cell) {
        ctx.beginPath()
        ctx.moveTo(x + 0.5, 0)
        ctx.lineTo(x + 0.5, parent.clientHeight)
        ctx.stroke()
      }
      for (let y = 0; y < parent.clientHeight; y += cell) {
        ctx.beginPath()
        ctx.moveTo(0, y + 0.5)
        ctx.lineTo(parent.clientWidth, y + 0.5)
        ctx.stroke()
      }
      ctx.globalAlpha = 1

      for (let i = 0; i < snake.length; i++) {
        const p = snake[i]
        const t = i / Math.max(1, snake.length - 1)
        const color = t < 0.5 ? "#a78bfa" : t < 0.85 ? "#f472b6" : "#84cc16"
        ctx.fillStyle = color
        ctx.fillRect(p.x * cell, p.y * cell, cell - 1, cell - 1)
      }

      const h = snake[snake.length - 1]
      ctx.fillStyle = "#ffffff"
      ctx.globalAlpha = 0.9
      ctx.fillRect(h.x * cell, h.y * cell, cell - 2, cell - 2)
      ctx.globalAlpha = 1
    }

    const loop = () => {
      if (!running) return
      tick++
      if (tick % 3 === 0) step()
      draw()
      raf = requestAnimationFrame(loop)
    }
    loop()

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
    }
  }, [])

  return (
    <div ref={containerRef} className={className} aria-hidden="true">
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  )
}
