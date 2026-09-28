import test from 'node:test'
import assert from 'node:assert/strict'
import { DESIGN, FADE_START, MEET, MEET_TIME, fitDesign, headAt, meetingPulse, movements, restingStrobes, segment, strobes, timeAt } from '../src/trajectories.mjs'

const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y)

test('there are three distinct movements', () => {
  assert.equal(movements.length, 3)
  assert.equal(new Set(movements.map((m) => m.id)).size, 3)
})

for (const movement of movements) {
  test(`${movement.id}: passes exactly through the meeting point at the shared instant`, () => {
    assert.ok(distance(movement.point(movement.meetAt), MEET) < 1e-6)
    assert.ok(Math.abs(headAt(movement, MEET_TIME) - movement.meetAt) < 1e-9, 'head reaches the meeting point at MEET_TIME')
  })

  test(`${movement.id}: timing is monotonic, invertible and gentle`, () => {
    const [start, end] = movement.window
    assert.ok(start < MEET_TIME && MEET_TIME < end && end <= FADE_START, 'travels inside the cycle, before the fade')
    assert.ok(movement.exponent > 0.6 && movement.exponent < 1.6, `exponent ${movement.exponent} keeps speed changes subtle`)
    assert.equal(headAt(movement, 0), 0)
    assert.equal(headAt(movement, 0.999), 1)
    let previous = -1
    for (let u = 0; u <= 1; u += 0.01) {
      const s = headAt(movement, u)
      assert.ok(s >= previous)
      previous = s
      if (s > 0 && s < 1) assert.ok(Math.abs(timeAt(movement, s) - u) < 1e-9)
    }
  })

  test(`${movement.id}: the path stays near the design frame and marks are finite`, () => {
    for (let i = 0; i <= 200; i++) {
      const p = movement.point(i / 200)
      assert.ok(Number.isFinite(p.x) && Number.isFinite(p.y))
      assert.ok(p.x > -0.1 * DESIGN.width && p.x < 1.1 * DESIGN.width, `x ${p.x}`)
      assert.ok(p.y > -0.1 * DESIGN.height && p.y < 1.1 * DESIGN.height, `y ${p.y}`)
    }
    const mark = segment(movement, 0.3)
    assert.ok(Math.abs(Math.hypot(mark.x2 - mark.x1, mark.y2 - mark.y1) - movement.length) < 1e-9)
  })
}

test('strobe marks accumulate as the heads travel and dissolve before the loop', () => {
  for (const movement of movements) {
    assert.equal(strobes(movement, 0).length, 0, 'empty at the start of the cycle')
    const early = strobes(movement, MEET_TIME - 0.1).length
    const atMeet = strobes(movement, MEET_TIME).length
    assert.ok(atMeet > early && early >= 0)
    for (const mark of strobes(movement, MEET_TIME)) assert.ok(mark.alpha > 0 && mark.alpha <= 1)
    assert.equal(strobes(movement, 0.9999).length, 0, 'nothing left to pop at the loop point')
  }
})

test('resting frame shows every mark, strongest around the encounter', () => {
  for (const movement of movements) {
    const marks = restingStrobes(movement)
    assert.equal(marks.length, movement.samples)
    const nearest = marks.reduce((best, mark) => distance(mark.center, MEET) < distance(best.center, MEET) ? mark : best)
    assert.equal(Math.max(...marks.map((m) => m.alpha)), nearest.alpha)
  }
})

test('meeting pulse peaks at the encounter only', () => {
  assert.equal(meetingPulse(MEET_TIME), 1)
  assert.ok(meetingPulse(MEET_TIME + 0.1) < 0.01)
  assert.ok(meetingPulse(0) < 1e-6)
})

test('design fits inside desktop and mobile boxes', () => {
  for (const [width, height] of [[806, 650], [436, 360], [366, 320]]) {
    const fit = fitDesign(width, height)
    assert.ok(fit.x >= 0 && fit.y >= 0)
    assert.ok(fit.x * 2 + DESIGN.width * fit.scale <= width + 1e-9)
    assert.ok(fit.y * 2 + DESIGN.height * fit.scale <= height + 1e-9)
  }
})
