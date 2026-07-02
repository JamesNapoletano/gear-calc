type Point = [number, number]

type Line = {
  start: Point
  end: Point
}

type ToothProfile = {
  toothPitchAngle: number
  rightFlank: Point[]
  leftFlank: Point[]
  tipArc: Point[]
  rootArc: Point[]
  pitchRadius: number
  rootRadius: number
  outsideRadius: number
  baseRadius: number
  teeth: number
  rightRootAngle: number
  leftRootAngle: number
}

type OutlineInput = {
  teeth: number
  pitchRadius: number
  outsideRadius: number
  rootRadius: number
  baseRadius: number
}

const isFinitePositive = (value: number): boolean => Number.isFinite(value) && value > 0

const polarToCartesian = (radius: number, angle: number): Point => [radius * Math.cos(angle), radius * Math.sin(angle)]

const rotate = ([x, y]: Point, angle: number): Point => {
  const c = Math.cos(angle)
  const s = Math.sin(angle)
  return [x * c - y * s, x * s + y * c]
}

const angleOf = ([x, y]: Point): number => Math.atan2(y, x)

const appendArcPoints = (
  points: Point[],
  radius: number,
  startAngle: number,
  endAngle: number,
  steps: number
): void => {
  if (!isFinitePositive(radius) || !Number.isFinite(startAngle) || !Number.isFinite(endAngle)) return
  for (let i = 1; i <= steps; i += 1) {
    const t = i / steps
    const angle = startAngle + (endAngle - startAngle) * t
    points.push(polarToCartesian(radius, angle))
  }
}

const toPath = (points: Point[]): string => {
  if (!points.length) return ''
  const [x0, y0] = points[0]
  const commands = [`M ${x0} ${y0}`]
  for (let i = 1; i < points.length; i += 1) {
    const [x, y] = points[i]
    commands.push(`L ${x} ${y}`)
  }
  commands.push('Z')
  return commands.join(' ')
}

const toOpenPath = (points: Point[]): string => {
  if (!points.length) return ''
  const [x0, y0] = points[0]
  const commands = [`M ${x0} ${y0}`]
  for (let i = 1; i < points.length; i += 1) {
    const [x, y] = points[i]
    commands.push(`L ${x} ${y}`)
  }
  return commands.join(' ')
}

const involutePoint = (baseRadius: number, t: number): Point => {
  const ct = Math.cos(t)
  const st = Math.sin(t)
  return [baseRadius * (ct + t * st), baseRadius * (st - t * ct)]
}

const involuteTAtRadius = (baseRadius: number, radius: number): number => {
  if (!isFinitePositive(baseRadius) || !isFinitePositive(radius) || radius < baseRadius) return 0
  return Math.sqrt((radius * radius) / (baseRadius * baseRadius) - 1)
}

const circlePath = (radius: number, reverse = false): string => {
  if (!isFinitePositive(radius)) return ''
  const sweep = reverse ? 0 : 1
  return `M ${radius} 0 A ${radius} ${radius} 0 1 ${sweep} ${-radius} 0 A ${radius} ${radius} 0 1 ${sweep} ${radius} 0 Z`
}

const normalizeAngle = (angle: number): number => {
  let a = angle
  const tau = Math.PI * 2
  while (a < 0) a += tau
  while (a >= tau) a -= tau
  return a
}

const shortestSignedDelta = (from: number, to: number): number => {
  const tau = Math.PI * 2
  let d = normalizeAngle(to) - normalizeAngle(from)
  if (d > Math.PI) d -= tau
  if (d < -Math.PI) d += tau
  return d
}

const buildToothProfile = ({ pitchRadius, outsideRadius, rootRadius, baseRadius, teeth }: OutlineInput): ToothProfile | null => {
  if (
    !isFinitePositive(pitchRadius) ||
    !isFinitePositive(outsideRadius) ||
    !isFinitePositive(rootRadius) ||
    !isFinitePositive(baseRadius) ||
    !isFinitePositive(teeth)
  ) {
    return null
  }

  const z = Math.max(6, Math.round(teeth))
  const circularHalfThickness = Math.PI / (2 * z)
  const toothPitchAngle = (Math.PI * 2) / z
  const rb = baseRadius
  const ra = outsideRadius
  const rr = rootRadius
  const rp = pitchRadius

  const involuteStartRadius = Math.max(rb, rr)
  const tAtPitch = involuteTAtRadius(rb, rp)
  const tAtStart = involuteTAtRadius(rb, involuteStartRadius)
  const tAtTip = involuteTAtRadius(rb, ra)
  const pitchPoint = involutePoint(rb, tAtPitch)

  const rotRight = circularHalfThickness - angleOf(pitchPoint)
  const rotLeft = -rotRight

  const flankSteps = 18
  const tipSteps = 8
  const rootSteps = 8

  const rightFlank: Point[] = []
  const leftFlank: Point[] = []
  for (let i = 0; i <= flankSteps; i += 1) {
    const t = tAtStart + (tAtTip - tAtStart) * (i / flankSteps)
    const p = involutePoint(rb, t)
    rightFlank.push(rotate(p, rotRight))
    leftFlank.push(rotate([p[0], -p[1]], rotLeft))
  }

  const rightTipAngle = angleOf(rightFlank[rightFlank.length - 1])
  const leftTipAngle = angleOf(leftFlank[leftFlank.length - 1])
  const rightRootAngle = angleOf(rightFlank[0])
  const leftRootAngle = angleOf(leftFlank[0])

  const tipArc: Point[] = []
  appendArcPoints(tipArc, ra, rightTipAngle, leftTipAngle, tipSteps)

  const rootArc: Point[] = []
  appendArcPoints(rootArc, rr, leftRootAngle, rightRootAngle + toothPitchAngle, rootSteps)

  return {
    toothPitchAngle,
    rightFlank,
    leftFlank,
    tipArc,
    rootArc,
    pitchRadius: rp,
    rootRadius: rr,
    outsideRadius: ra,
    baseRadius: rb,
    teeth: z,
    rightRootAngle,
    leftRootAngle
  }
}

const appendQuadPoints = (points: Point[], p0: Point, pc: Point, p1: Point, steps: number): void => {
  for (let i = 1; i <= steps; i += 1) {
    const t = i / steps
    const u = 1 - t
    points.push([
      u * u * p0[0] + 2 * u * t * pc[0] + t * t * p1[0],
      u * u * p0[1] + 2 * u * t * pc[1] + t * t * p1[1]
    ])
  }
}

const buildSpurOrHelicalOutline = ({ teeth, pitchRadius, outsideRadius, rootRadius, baseRadius }: OutlineInput): string => {
  if (
    !isFinitePositive(pitchRadius) ||
    !isFinitePositive(outsideRadius) ||
    !isFinitePositive(rootRadius) ||
    !isFinitePositive(baseRadius) ||
    !isFinitePositive(teeth)
  ) {
    return ''
  }

  const z = Math.max(6, Math.round(teeth))
  const tau = (Math.PI * 2) / z
  const halfThickness = Math.PI / (2 * z)
  const rb = baseRadius
  const ra = outsideRadius
  const rr = rootRadius
  const rp = pitchRadius

  // The involute is only defined from the base circle outward. When the root sits
  // below the base circle (true for standard ≥20° gears), the span between them is
  // bridged by a tangent fillet so the tooth blends smoothly into the root — no notch.
  const startRadius = Math.max(rb, rr)
  const tStart = involuteTAtRadius(rb, startRadius)
  const tTip = involuteTAtRadius(rb, ra)
  const tPitch = involuteTAtRadius(rb, rp)
  // The flank must converge toward the tooth centre as radius grows so the tooth is
  // thickest at the root and tapers to the tip (real involute behaviour). That means the
  // +angle (right) flank is the *mirrored* involute and the rotation adds the pitch roll.
  const flankRot = halfThickness + angleOf(involutePoint(rb, tPitch))

  const flankSteps = 16
  const right: Point[] = []
  const left: Point[] = []
  for (let i = 0; i <= flankSteps; i += 1) {
    const t = tStart + (tTip - tStart) * (i / flankSteps)
    const p = involutePoint(rb, t)
    right.push(rotate([p[0], -p[1]], flankRot))
    left.push(rotate(p, -flankRot))
  }

  const baseOffset = angleOf(right[0])
  // Tip angular offsets measured at the tooth-centre orientation (near 0), so the
  // top-land arc never straddles the ±π atan2 seam — using angleOf() on the already
  // rotated tips makes the tooth at ~180° sweep the wrong way around the whole gear.
  const tipOffsetLeft = angleOf(left[flankSteps])
  const tipOffsetRight = angleOf(right[flankSteps])
  const filletGap = rr < startRadius ? tau * 0.12 : 0
  const P = (radius: number, angle: number): Point => polarToCartesian(radius, angle)

  const points: Point[] = []
  for (let i = 0; i < z; i += 1) {
    const c = i * tau
    const leftBase = c - baseOffset
    const rightBase = c + baseOffset
    const leftRoot = leftBase - filletGap
    const rightRoot = rightBase + filletGap
    const leftRotated = left.map((p) => rotate(p, c))
    const rightRotated = right.map((p) => rotate(p, c))

    if (i === 0) points.push(P(rr, leftRoot))

    // fillet (or straight wall) up from the root into the left flank base
    if (filletGap > 0) appendQuadPoints(points, P(rr, leftRoot), P(rr, leftBase), P(startRadius, leftBase), 3)
    else points.push(P(startRadius, leftBase))

    points.push(...leftRotated) // left flank, base → tip
    appendArcPoints(points, ra, c + tipOffsetLeft, c + tipOffsetRight, 6) // top land
    for (let k = flankSteps; k >= 0; k -= 1) points.push(rightRotated[k]) // right flank, tip → base

    // fillet (or straight wall) down from the right flank base into the root
    if (filletGap > 0) appendQuadPoints(points, P(startRadius, rightBase), P(rr, rightBase), P(rr, rightRoot), 3)
    else points.push(P(rr, rightRoot))

    appendArcPoints(points, rr, rightRoot, leftRoot + tau, 6) // root land across the gap
  }

  return toPath(points)
}

const buildRingInvoluteOutline = ({ teeth, pitchRadius, outsideRadius, rootRadius, baseRadius }: OutlineInput): string => {
  if (!isFinitePositive(teeth) || !isFinitePositive(pitchRadius) || !isFinitePositive(outsideRadius) || !isFinitePositive(rootRadius) || !isFinitePositive(baseRadius)) {
    return ''
  }

  // Ring gear: outsideRadius = inner tip (< pitch), rootRadius = outer rim (> pitch)
  // buildToothProfile handles this because involuteStartRadius = max(base, root) = outer rim,
  // and the involute iterates from large t (outer rim) down to small t (inner tip), giving inward-pointing flanks.
  const profile = buildToothProfile({ teeth, pitchRadius, outsideRadius, rootRadius, baseRadius })
  if (!profile) return ''

  const innerPoints: Point[] = []
  const z = profile.teeth
  const tau = profile.toothPitchAngle

  for (let i = 0; i < z; i += 1) {
    const rot = i * tau
    const right = profile.rightFlank.map((p) => rotate(p, rot))
    const left = profile.leftFlank.map((p) => rotate(p, rot))
    const tip = profile.tipArc.map((p) => rotate(p, rot))
    const root = profile.rootArc.map((p) => rotate(p, rot))

    if (i === 0) {
      innerPoints.push(right[0])
    }
    innerPoints.push(...right)
    innerPoints.push(...tip)
    innerPoints.push(...left.reverse())
    innerPoints.push(...root)
  }

  const innerPath = toPath(innerPoints)
  const ringOuterRadius = rootRadius * 1.14
  const outerPath = circlePath(ringOuterRadius)
  return `${outerPath} ${innerPath}`.trim()
}

export const buildReferenceGeometry = ({
  teeth,
  pitchRadius,
  outsideRadius,
  rootRadius,
  baseRadius
}: OutlineInput): { toothCenterLines: Line[]; flankLines: Line[] } => {
  const profile = buildToothProfile({
    teeth,
    pitchRadius,
    outsideRadius,
    rootRadius,
    baseRadius
  })

  if (!profile) {
    return {
      toothCenterLines: [],
      flankLines: []
    }
  }

  const toothCenterLines: Line[] = []
  const flankLines: Line[] = []
  const z = profile.teeth
  const tau = profile.toothPitchAngle

  for (let i = 0; i < z; i += 1) {
    const center = i * tau
    const rootPt = polarToCartesian(profile.rootRadius, center)
    const tipPt = polarToCartesian(profile.outsideRadius, center)
    toothCenterLines.push({ start: rootPt, end: tipPt })

    const rightRootAngle = normalizeAngle(profile.rightRootAngle + center)
    const leftRootAngle = normalizeAngle(profile.leftRootAngle + center)
    const rightPt = polarToCartesian(profile.rootRadius, rightRootAngle)
    const leftPt = polarToCartesian(profile.rootRadius, leftRootAngle)
    flankLines.push({ start: [0, 0], end: rightPt })
    flankLines.push({ start: [0, 0], end: leftPt })
  }

  return {
    toothCenterLines,
    flankLines
  }
}

export const buildGearOutline = ({
  teeth,
  pitchRadius,
  outsideRadius,
  rootRadius,
  baseRadius,
  ring = false
}: {
  teeth: number
  pitchRadius: number
  outsideRadius?: number
  rootRadius?: number
  baseRadius?: number
  ring?: boolean
}): string => {
  if (!isFinitePositive(teeth) || !isFinitePositive(pitchRadius)) return ''

  const outer = isFinitePositive(outsideRadius ?? NaN) ? outsideRadius! : pitchRadius * 1.1
  const root = isFinitePositive(rootRadius ?? NaN) ? rootRadius! : pitchRadius * 0.82
  const base = isFinitePositive(baseRadius ?? NaN) ? baseRadius! : pitchRadius * 0.94

  if (ring) {
    return buildRingInvoluteOutline({
      teeth,
      pitchRadius,
      outsideRadius: Math.min(outer, pitchRadius * 0.995),
      rootRadius: Math.max(root, pitchRadius * 1.02),
      baseRadius: Math.min(base, pitchRadius)
    })
  }

  return buildSpurOrHelicalOutline({
    teeth,
    pitchRadius,
    outsideRadius: Math.max(outer, pitchRadius),
    rootRadius: Math.min(root, pitchRadius * 0.999),
    baseRadius: Math.min(base, Math.max(outer, pitchRadius))
  })
}

export const scaleToViewBox = (radius: number, padding = 18): { size: number; viewBox: string } => {
  const maxRadius = isFinitePositive(radius) ? radius : 1
  const size = (maxRadius + padding) * 2
  const viewBox = [-size / 2, -size / 2, size, size]
  return {
    size,
    viewBox: viewBox.join(' ')
  }
}

export const linePath = ({ start, end }: Line): string => toOpenPath([start, end])

export const angleBetween = (line: Line | null | undefined): number => {
  if (!line) return NaN
  const [x1, y1] = line.start
  const [x2, y2] = line.end
  return Math.atan2(y2 - y1, x2 - x1)
}

export const deltaAngleDeg = (a: number, b: number): number => {
  if (!Number.isFinite(a) || !Number.isFinite(b)) return NaN
  return (Math.abs(shortestSignedDelta(a, b)) * 180) / Math.PI
}
