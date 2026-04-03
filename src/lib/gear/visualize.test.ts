import { describe, expect, it } from 'vitest'

import { buildGearOutline, scaleToViewBox } from './visualize'

describe('gear visualization contracts', () => {
  const spurInput = {
    teeth: 24,
    pitchRadius: 48,
    outsideRadius: 52,
    rootRadius: 39,
    baseRadius: 45
  }

  it('generates an external gear outline for sane spur-like inputs', () => {
    const outline = buildGearOutline(spurInput)

    expect(outline).toMatch(/^M /)
    expect(outline).toContain(' L ')
    expect(outline.endsWith('Z')).toBe(true)
  })

  it('generates a ring outline that differs from the spur outline in the same pitch context', () => {
    const spurOutline = buildGearOutline(spurInput)
    const ringOutline = buildGearOutline({ ...spurInput, ring: true })

    expect(ringOutline).toMatch(/^M /)
    expect(ringOutline).toContain(' A ')
    expect(ringOutline).not.toBe(spurOutline)
  })

  it('returns an empty outline for invalid inputs', () => {
    expect(buildGearOutline({ teeth: 0, pitchRadius: 48 })).toBe('')
    expect(buildGearOutline({ teeth: 24, pitchRadius: Number.NaN })).toBe('')
  })

  it('returns a stable positive viewBox', () => {
    const first = scaleToViewBox(52)
    const second = scaleToViewBox(52)

    expect(first).toEqual(second)
    expect(first.size).toBe(140)
    expect(first.viewBox).toBe('-70 -70 140 140')
  })
})
