import { useEffect, useRef } from 'react'
import { CYCLE_SECONDS, MEET, MEET_TIME, fitDesign, headAt, meetingPulse, movements, restingStrobes, segment, strobes } from './trajectories.mjs'
import './hero.css'

const INK = '73, 48, 46'
const PAPER = '246, 244, 235'
const START = 0.24 // open mid-phrase: traces already on the page, first encounter ~3s in
const LABELS = {
  pulo: { s: 1, dx: 0, dy: 22, align: 'right' },
  salto: { s: 0, dx: 14, dy: -6, align: 'left' },
  balanco: { s: 0, dx: 0, dy: -18, align: 'left' },
}

// Hairline "score" of each full trajectory, in design units.
const spines = typeof Path2D === 'undefined' ? [] : movements.map((movement) => {
  const path = new Path2D()
  for (let i = 0; i <= 240; i++) {
    const p = movement.point(i / 240)
    if (i === 0) path.moveTo(p.x, p.y)
    else path.lineTo(p.x, p.y)
  }
  return path
})

export default function HeroMotion({ paused }) {
  const wrapper = useRef(null)
  const canvasRef = useRef(null)
  const pausedRef = useRef(paused)
  const syncRef = useRef(() => {})

  useEffect(() => { pausedRef.current = paused; syncRef.current() }, [paused])

  useEffect(() => {
    const box = wrapper.current
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')
    if (!context) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)')
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)')
    const hero = box.closest('.hero') || box
    const font = getComputedStyle(box).fontFamily
    const trail = []
    let width = 0, height = 0, dpr = 1, fit = fitDesign(1, 1)
    let time = START * CYCLE_SECONDS
    let frame = 0, last = 0, onscreen = true, lastPointer = null

    const toScreen = (p) => ({ x: fit.x + p.x * fit.scale, y: fit.y + p.y * fit.scale })
    let forceStill = false // dev inspection only
    const resting = () => forceStill || reduce.matches

    function strokeSegment(mark, alpha, lineWidth) {
      context.strokeStyle = `rgba(${INK}, ${alpha})`
      context.lineWidth = lineWidth
      context.beginPath()
      context.moveTo(mark.x1, mark.y1)
      context.lineTo(mark.x2, mark.y2)
      context.stroke()
    }

    function draw() {
      const still = resting()
      const u = (time / CYCLE_SECONDS) % 1
      const px = 1 / fit.scale // one CSS pixel in design units
      context.setTransform(dpr, 0, 0, dpr, 0, 0)
      context.clearRect(0, 0, width, height)
      context.save()
      context.translate(fit.x, fit.y)
      context.scale(fit.scale, fit.scale)
      context.lineCap = 'round'

      movements.forEach((movement, index) => {
        context.strokeStyle = `rgba(${INK}, 0.16)`
        context.lineWidth = px
        context.stroke(spines[index])
        const marks = still ? restingStrobes(movement) : strobes(movement, u)
        for (const mark of marks) strokeSegment(mark, mark.alpha * 0.92, 1.3 * px)
        if (still) return
        const [start, end] = movement.window
        if (u > start && u < end) {
          const head = segment(movement, headAt(movement, u))
          strokeSegment(head, 0.95, 1.7 * px)
          context.fillStyle = `rgb(${INK})`
          context.beginPath()
          context.arc(head.center.x, head.center.y, 2.6 * px, 0, Math.PI * 2)
          context.fill()
        }
      })

      // The encounter: a paper-white point that swells once as the three heads cross it.
      const pulse = still ? 0 : meetingPulse(u)
      const since = u - MEET_TIME
      if (!still && since > 0 && since < 0.09) {
        context.strokeStyle = `rgba(${PAPER}, ${0.7 * (1 - since / 0.09)})`
        context.lineWidth = 1.2 * px
        context.beginPath()
        context.arc(MEET.x, MEET.y, (7 + 520 * since) * px, 0, Math.PI * 2)
        context.stroke()
      }
      context.fillStyle = `rgb(${PAPER})`
      context.beginPath()
      context.arc(MEET.x, MEET.y, (4.5 + 3.5 * pulse) * px, 0, Math.PI * 2)
      context.fill()
      context.restore()

      context.font = `600 9px ${font}`
      if ('letterSpacing' in context) context.letterSpacing = '1.4px'
      context.fillStyle = `rgba(${INK}, 0.7)`
      movements.forEach((movement) => {
        const label = LABELS[movement.id]
        const p = toScreen(movement.point(label.s))
        context.textAlign = label.align
        const x = Math.min(width - 4, Math.max(4, p.x + label.dx))
        const y = Math.min(height - 6, Math.max(12, p.y + label.dy))
        context.textAlign = x === 4 ? 'left' : x === width - 4 ? 'right' : label.align
        context.fillText(movement.label, x, y)
      })

      // Your own movement joins in: the cursor leaves paper-white strobe marks.
      const now = performance.now()
      while (trail.length && now - trail[0].born > 1100) trail.shift()
      context.lineCap = 'round'
      for (const mark of trail) {
        context.strokeStyle = `rgba(${PAPER}, ${0.85 * (1 - (now - mark.born) / 1100)})`
        context.lineWidth = 1.2
        context.beginPath()
        context.moveTo(mark.x1, mark.y1)
        context.lineTo(mark.x2, mark.y2)
        context.stroke()
      }
    }

    function tick(now) {
      time += Math.min(0.05, (now - last) / 1000)
      last = now
      draw()
      frame = requestAnimationFrame(tick)
    }

    function sync() {
      const run = !pausedRef.current && !resting() && onscreen && !document.hidden
      if (run && !frame) { last = performance.now(); frame = requestAnimationFrame(tick) }
      else if (!run && frame) { cancelAnimationFrame(frame); frame = 0 }
      if (!run) { trail.length = 0; draw() }
    }
    syncRef.current = sync
    // Dev-only hook for inspecting a given cycle phase: el.__heroPhase(0.5)
    if (import.meta.env.DEV) {
      box.__heroPhase = (u) => { time = u * CYCLE_SECONDS; draw() }
      box.__heroStill = (still) => { forceStill = still; sync() }
    }

    function resize() {
      const rect = box.getBoundingClientRect()
      width = Math.max(1, rect.width)
      height = Math.max(1, rect.height)
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      fit = fitDesign(width, height)
      draw()
    }

    function pointer(event) {
      if (!frame || event.pointerType !== 'mouse' || !finePointer.matches) return
      const rect = canvas.getBoundingClientRect()
      const x = event.clientX - rect.left, y = event.clientY - rect.top
      if (x < 0 || y < 0 || x > rect.width || y > rect.height) { lastPointer = null; return }
      if (!lastPointer) { lastPointer = { x, y }; return }
      const dx = x - lastPointer.x, dy = y - lastPointer.y
      const distance = Math.hypot(dx, dy)
      if (distance < 13) return
      const nx = -dy / distance * 12, ny = dx / distance * 12
      trail.push({ x1: x - nx, y1: y - ny, x2: x + nx, y2: y + ny, born: performance.now() })
      if (trail.length > 48) trail.shift()
      lastPointer = { x, y }
    }

    const observer = new IntersectionObserver(([entry]) => { onscreen = entry.isIntersecting; sync() })
    const resizer = new ResizeObserver(resize)
    const leave = () => { lastPointer = null }
    observer.observe(box)
    resizer.observe(box)
    reduce.addEventListener('change', sync)
    document.addEventListener('visibilitychange', sync)
    hero.addEventListener('pointermove', pointer, { passive: true })
    hero.addEventListener('pointerleave', leave)
    resize()
    sync()
    document.fonts?.ready.then(() => { if (!frame) draw() })
    return () => {
      cancelAnimationFrame(frame)
      frame = 0
      syncRef.current = () => {}
      observer.disconnect()
      resizer.disconnect()
      reduce.removeEventListener('change', sync)
      document.removeEventListener('visibilitychange', sync)
      hero.removeEventListener('pointermove', pointer)
      hero.removeEventListener('pointerleave', leave)
    }
  }, [])

  return <div className="hero-motion" ref={wrapper} aria-hidden="true">
    <canvas ref={canvasRef} className="hero-motion-canvas" />
    <div className="hero-motion-meet"><i /><span>Ponto de encontro</span><strong>12/12/26</strong><span>Vila Mariana · SP</span></div>
  </div>
}
