const polarToCartesian = (radius, angle) => [radius * Math.cos(angle), radius * Math.sin(angle)]

const addPoint = (points, radius, angle) => {
  const [x, y] = polarToCartesian(radius, angle)
  points.push([x, y])
}

const makeSegment = (startAngle, endAngle, steps, radius, points) => {
  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps
    const angle = startAngle + (endAngle - startAngle) * t
    addPoint(points, radius, angle)
  }
}

const toPath = (points, reverse = false) => {
  if (!points.length) return ''
  const pathPoints = reverse ? [...points].reverse() : points
  const [firstX, firstY] = pathPoints[0]
  const commands = [`M ${firstX} ${firstY}`]
  for (let i = 1; i < pathPoints.length; i += 1) {
    const [x, y] = pathPoints[i]
    commands.push(`L ${x} ${y}`)
  }
  commands.push('Z')
  return commands.join(' ')
}

const circlePath = (radius, reverse = false) => {
  if (!isFinitePositive(radius)) return ''
  const sweep = reverse ? 0 : 1
  const r = radius
  return `M ${r} 0 A ${r} ${r} 0 1 ${sweep} ${-r} 0 A ${r} ${r} 0 1 ${sweep} ${r} 0 Z`
}

const buildGearPoints = ({
  count,
  toothAngle,
  tipAngle,
  rootAngle,
  tipRadius,
  baseRadius,
  detailSteps,
  tipSteps,
  rootSteps
}) => {
  const points = []
  for (let i = 0; i < count; i += 1) {
    const base = i * toothAngle
    const rootStart = base - rootAngle * 0.5
    const rootEnd = base + rootAngle * 0.5
    const tipStart = base - tipAngle * 0.5
    const tipEnd = base + tipAngle * 0.5

    if (i === 0) {
      addPoint(points, baseRadius, rootStart)
    }

    makeSegment(rootStart, tipStart, detailSteps, baseRadius, points)
    makeSegment(tipStart, tipEnd, tipSteps, tipRadius, points)
    makeSegment(tipEnd, rootEnd, detailSteps, baseRadius, points)
    makeSegment(rootEnd, rootStart + toothAngle, rootSteps, baseRadius, points)
  }

  return points
}

const isFinitePositive = (value) => Number.isFinite(value) && value > 0

/**
 * @param {Object} options
 * @param {number} options.teeth
 * @param {number} options.pitchRadius
 * @param {number} [options.outsideRadius]
 * @param {number} [options.rootRadius]
 * @param {boolean} [options.ring]
 * @param {'standard' | 'soft' | 'worm'} [options.profile]
 */
export const buildGearOutline = ({
  teeth,
  pitchRadius,
  outsideRadius,
  rootRadius,
  ring = false,
  profile = 'standard'
}) => {
  if (!isFinitePositive(teeth) || !isFinitePositive(pitchRadius)) return ''
  const count = Math.max(6, Math.round(teeth))
  const toothAngle = (Math.PI * 2) / count
  const profileSettings = {
    standard: { tipRatio: 0.38, rootRatio: 0.42 },
    soft: { tipRatio: 0.48, rootRatio: 0.55 },
    worm: { tipRatio: 0.6, rootRatio: 0.7 }
  }
  const { tipRatio, rootRatio } = profileSettings[profile] || profileSettings.standard
  const tipAngle = toothAngle * tipRatio
  const rootAngle = toothAngle * rootRatio
  const tipRadius = isFinitePositive(outsideRadius) ? outsideRadius : pitchRadius
  const baseRadius = isFinitePositive(rootRadius) ? rootRadius : pitchRadius * 0.85
  const detailSteps = Math.max(3, Math.round(72 / count))
  const tipSteps = Math.max(3, Math.round(90 / count))
  const rootSteps = Math.max(2, Math.round(60 / count))

  if (ring) {
    const innerPoints = buildGearPoints({
      count,
      toothAngle,
      tipAngle,
      rootAngle,
      tipRadius,
      baseRadius,
      detailSteps,
      tipSteps,
      rootSteps
    })
    const outer = circlePath(baseRadius)
    const inner = toPath(innerPoints, true)
    return `${outer} ${inner}`.trim()
  }

  const points = buildGearPoints({
    count,
    toothAngle,
    tipAngle,
    rootAngle,
    tipRadius,
    baseRadius,
    detailSteps,
    tipSteps,
    rootSteps
  })

  return toPath(points)
}

export const scaleToViewBox = (radius, padding = 18) => {
  const maxRadius = isFinitePositive(radius) ? radius : 1
  const size = (maxRadius + padding) * 2
  const viewBox = [-size / 2, -size / 2, size, size]
  return {
    size,
    viewBox: viewBox.join(' ')
  }
}
