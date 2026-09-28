// Choreography for the hero: three movement traces, drawn like a chronophotograph
// (Marey-style stroboscopic samples of a moving body segment), that all cross one
// shared point at the same instant of every cycle. Pure math, no DOM, so it can be tested.

export const DESIGN = { width: 1000, height: 760 }
export const MEET = { x: 600, y: 400 }
export const MEET_TIME = 0.5 // fraction of the cycle at which every head crosses MEET
export const CYCLE_SECONDS = 11
export const FADE_START = 0.88 // the whole trace dissolves between here and the loop point

const TAU = Math.PI * 2
const clamp = (value, min, max) => Math.min(max, Math.max(min, value))
export const smoothstep = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t) }

// Each movement is a raw parametric path p(s), s ∈ [0, 1], plus the angle and length of the
// body segment it carries. `window` is the part of the cycle during which its head travels.
const raw = [
  {
    id: 'pulo', label: 'CRIANÇAS', samples: 58, length: 30, window: [0.04, 0.8],
    // A child's run of hops, each one a little lower than the last.
    point(s) {
      const hop = Math.abs(Math.sin(Math.PI * 4 * s))
      return { x: 40 + 880 * s, y: 720 - (420 - 300 * s) * hop }
    },
    angle(s) { return -Math.PI / 2 + 0.32 * Math.cos(Math.PI * 4 * s) },
  },
  {
    id: 'salto', label: 'ADULTOS', samples: 66, length: 82, window: [0.12, 0.6],
    // A gymnast's flight: a clean parabola with one full rotation of the body.
    point(s) { return { x: 70 + 700 * s, y: 720 - 610 * 4 * s * (1 - s) } },
    angle(s) { return -Math.PI / 2 + TAU * smoothstep(0.1, 0.92, s) },
  },
  {
    id: 'balanco', label: 'IDOSOS', samples: 54, length: 118, window: [0.08, 0.84],
    // A trapeze swing: the body hangs radially from a pivot, slowing at both extremes.
    pivot: { x: 470, y: -330 },
    radius: 690,
    swing(s) { return -0.62 * Math.cos(Math.PI * s) },
    point(s) {
      const phi = this.swing(s)
      return { x: this.pivot.x + this.radius * Math.sin(phi), y: this.pivot.y + this.radius * Math.cos(phi) }
    },
    angle(s) { return Math.PI / 2 - this.swing(s) },
  },
]

function closestParameter(movement) {
  let best = 0.5, bestDistance = Infinity
  for (let i = 0; i <= 4000; i++) {
    const s = 0.1 + 0.8 * i / 4000
    const p = movement.point(s)
    const distance = Math.hypot(p.x - MEET.x, p.y - MEET.y)
    if (distance < bestDistance) { bestDistance = distance; best = s }
  }
  return best
}

// Resolve each path so it passes exactly through MEET at `meetAt`, and give it a timing curve
// s(u) = w^k (w = normalised time inside its window) that reaches `meetAt` exactly at MEET_TIME.
export const movements = raw.map((movement) => {
  const meetAt = closestParameter(movement)
  const natural = movement.point(meetAt)
  const shift = { x: MEET.x - natural.x, y: MEET.y - natural.y }
  const [start, end] = movement.window
  const meetWindow = (MEET_TIME - start) / (end - start)
  const exponent = Math.log(meetAt) / Math.log(meetWindow)
  return {
    ...movement,
    meetAt,
    exponent,
    point(s) { const p = movement.point.call(movement, s); return { x: p.x + shift.x, y: p.y + shift.y } },
    angle(s) { return movement.angle.call(movement, s) },
  }
})

// Path parameter of a movement's head at cycle time u ∈ [0, 1).
export function headAt(movement, u) {
  const [start, end] = movement.window
  const w = clamp((u - start) / (end - start), 0, 1)
  return w ** movement.exponent
}

// Cycle time at which the head passes path parameter s (inverse of headAt).
export function timeAt(movement, s) {
  const [start, end] = movement.window
  return start + (end - start) * clamp(s, 0, 1) ** (1 / movement.exponent)
}

export function segment(movement, s) {
  const center = movement.point(s)
  const angle = movement.angle(s)
  const half = movement.length / 2
  const dx = Math.cos(angle) * half, dy = Math.sin(angle) * half
  return { x1: center.x - dx, y1: center.y - dy, x2: center.x + dx, y2: center.y + dy, center }
}

const TRAIL = 0.085 // cycle-time over which a fresh strobe mark settles to its residue
const RESIDUE = 0.2

// Strobe marks for one movement at cycle time u. Each mark: segment + opacity (0..1).
export function strobes(movement, u) {
  const marks = []
  const fade = 1 - smoothstep(FADE_START, 1, u)
  for (let j = 0; j < movement.samples; j++) {
    const s = (j + 0.5) / movement.samples
    const passed = timeAt(movement, s)
    if (u < passed) break
    const age = u - passed
    const alpha = (RESIDUE + (1 - RESIDUE) * Math.exp(-age / TRAIL)) * fade
    if (alpha > 0.004) marks.push({ ...segment(movement, s), alpha })
  }
  return marks
}

// The resting composition (reduced motion): every mark present, strongest near the encounter.
export function restingStrobes(movement) {
  const marks = []
  for (let j = 0; j < movement.samples; j++) {
    const s = (j + 0.5) / movement.samples
    const near = Math.exp(-(((s - movement.meetAt) / 0.2) ** 2))
    marks.push({ ...segment(movement, s), alpha: 0.2 + 0.68 * near })
  }
  return marks
}

// 0..1 pulse centred on the encounter; used to swell the meeting point.
export function meetingPulse(u) {
  const d = u - MEET_TIME
  return Math.exp(-((d / 0.022) ** 2))
}

// Maps the design space into a box of the given size ("contain" fit, centred).
export function fitDesign(width, height, padding = 0.04) {
  const scale = Math.min(width / DESIGN.width, height / DESIGN.height) * (1 - padding * 2)
  return { scale, x: (width - DESIGN.width * scale) / 2, y: (height - DESIGN.height * scale) / 2 }
}
