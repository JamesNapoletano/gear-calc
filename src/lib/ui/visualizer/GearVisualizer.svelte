<script lang="ts">
  import { formatNumber } from '../../gear/format'
  import { fromMillimeters } from '../../gear/units'
  import { buildGearOutline, scaleToViewBox } from '../../gear/visualize'
  import type { GearType, LengthUnit } from '../../gear/types'

  type LooseInputs = Record<string, number | undefined>
  type VisualResults = {
    pitchDiameter: number
    outsideDiameter: number
    rootDiameter: number
    baseCircle: number
    pitchDiameterWorm?: number
  }

  export let selectedGear: { key: GearType } = { key: 'spur' }
  export let inputs: LooseInputs = {}
  export let results: VisualResults = {
    pitchDiameter: NaN,
    outsideDiameter: NaN,
    rootDiameter: NaN,
    baseCircle: NaN,
    pitchDiameterWorm: NaN
  }
  export let unit: LengthUnit

  const toRadians = (deg: number): number => (deg * Math.PI) / 180
  const polarToCartesian = (radius: number, angleRad: number): [number, number] => [radius * Math.cos(angleRad), radius * Math.sin(angleRad)]
  const buildHelicalFaceLines = (radius: number, angleDeg: number, count: number): string[] => {
    if (!Number.isFinite(radius) || radius <= 0 || !Number.isFinite(angleDeg) || count <= 0) return []
    const slant = Math.max(8, Math.min(radius * 0.22, 24)) * Math.sin(toRadians(angleDeg))
    return Array.from({ length: count }, (_, index) => {
      const t = count === 1 ? 0.5 : index / (count - 1)
      const y = -radius * 0.78 + t * radius * 1.56
      const x1 = -radius * 0.86 + (index % 2 === 0 ? 0 : radius * 0.04)
      const x2 = radius * 0.86 + slant
      return `M ${x1} ${y} C ${x1 + radius * 0.35} ${y - slant * 0.45} ${x2 - radius * 0.35} ${y - slant * 0.55} ${x2} ${y - slant}`
    })
  }

  const buildToothValleyLines = (radius: number, count: number, helical = false): string[] => {
    if (!Number.isFinite(radius) || radius <= 0 || count <= 0) return []
    const step = count > 48 ? 2 : 1
    const lineCount = Math.max(8, Math.min(count, 48))
    return Array.from({ length: lineCount }, (_, index) => {
      const valleyIndex = index * step
      const angle = ((valleyIndex + 0.5) / Math.max(count, 1)) * Math.PI * 2
      const outer = polarToCartesian(radius * 0.985, angle)
      const inner = polarToCartesian(radius * (helical ? 0.91 : 0.87), angle)
      return `M ${inner[0]} ${inner[1]} L ${outer[0]} ${outer[1]}`
    })
  }

  const buildWormThreadPath = (x: number, y: number, length: number, radius: number, starts: number): string => {
    if (!Number.isFinite(length) || !Number.isFinite(radius) || length <= 0 || radius <= 0) return ''
    const startCount = Number.isFinite(starts) ? Math.max(1, Math.round(starts)) : 1
    const loops = Math.max(5, Math.round(length / (radius * 0.9)))
    const laneGap = (radius * 2) / startCount
    const parts: string[] = []

    for (let lane = 0; lane < startCount; lane += 1) {
      const baseY = y + laneGap * (lane + 0.5)
      let currentX = x
      parts.push(`M ${currentX} ${baseY}`)
      for (let loop = 0; loop < loops; loop += 1) {
        const seg = length / loops
        const cp1x = currentX + seg * 0.32
        const cp2x = currentX + seg * 0.68
        const nextX = currentX + seg
        const crest = radius * 0.95
        parts.push(`C ${cp1x} ${baseY - crest} ${cp2x} ${baseY + crest} ${nextX} ${baseY}`)
        currentX = nextX
      }
    }

    return parts.join(' ')
  }

  const buildWormHelixSidePath = (x: number, y: number, length: number, radius: number, starts: number): string[] => {
    if (!Number.isFinite(length) || !Number.isFinite(radius) || length <= 0 || radius <= 0) return []
    const startCount = Number.isFinite(starts) ? Math.max(1, Math.round(starts)) : 1
    const bandHeight = (radius * 2) / (startCount + 1)
    const loops = Math.max(4, Math.round(length / (radius * 1.25)))

    return Array.from({ length: startCount }, (_, lane) => {
      const midY = y + bandHeight * (lane + 1)
      let currentX = x
      const parts = [`M ${currentX} ${midY}`]

      for (let loop = 0; loop < loops; loop += 1) {
        const seg = length / loops
        const nextX = currentX + seg
        const crest = Math.min(radius * 0.88, bandHeight * 0.42)
        const cp1x = currentX + seg * 0.28
        const cp2x = currentX + seg * 0.72
        parts.push(`C ${cp1x} ${midY - crest} ${cp2x} ${midY + crest} ${nextX} ${midY}`)
        currentX = nextX
      }

      return parts.join(' ')
    })
  }

  const buildWormWheelRimTicks = (radius: number, count: number): string[] => {
    if (!Number.isFinite(radius) || radius <= 0 || count <= 0) return []
    const tickCount = Math.max(10, Math.min(count, 36))
    const rx = radius * 0.82
    const ry = radius
    return Array.from({ length: tickCount }, (_, index) => {
      const angle = -1.08 + (index / Math.max(1, tickCount - 1)) * 2.16
      const cos = Math.cos(angle)
      const sin = Math.sin(angle)
      const innerX = cos * (rx * 0.84)
      const innerY = sin * (ry * 0.84)
      const outerX = cos * rx
      const outerY = sin * ry
      return `M ${innerX} ${innerY} L ${outerX} ${outerY}`
    })
  }

  const buildWormContactPath = (wormRightX: number, wheelLeftX: number, offsetY: number): string => {
    if (!Number.isFinite(wormRightX) || !Number.isFinite(wheelLeftX)) return ''
    const midX = (wormRightX + wheelLeftX) / 2
    return `M ${wormRightX} ${offsetY - 8} C ${midX} ${offsetY - 18} ${midX} ${offsetY + 18} ${wheelLeftX} ${offsetY + 8}`
  }

  const svgUid = Math.random().toString(36).slice(2, 10)
  const makeSvgId = (name: string): string => `gearviz-${svgUid}-${name}`

  const buildBevelSidePath = (frontRadius: number, backRadius: number, depth: number): string => {
    if (!Number.isFinite(frontRadius) || frontRadius <= 0 || !Number.isFinite(backRadius) || backRadius <= 0 || !Number.isFinite(depth) || depth <= 0) return ''
    const frontTop = polarToCartesian(frontRadius, toRadians(-52))
    const frontBottom = polarToCartesian(frontRadius, toRadians(52))
    const backTop: [number, number] = [frontTop[0] - depth, frontTop[1] * (backRadius / frontRadius)]
    const backBottom: [number, number] = [frontBottom[0] - depth, frontBottom[1] * (backRadius / frontRadius)]
    return `M ${backTop[0]} ${backTop[1]} L ${frontTop[0]} ${frontTop[1]} L ${frontBottom[0]} ${frontBottom[1]} L ${backBottom[0]} ${backBottom[1]} Z`
  }

  const buildBevelBackPath = (radius: number, depth: number): string => {
    if (!Number.isFinite(radius) || radius <= 0) return ''
    const rx = radius * 0.58
    const ry = radius * 0.9
    return `M ${-depth + rx} 0 A ${rx} ${ry} 0 1 0 ${-depth - rx} 0 A ${rx} ${ry} 0 1 0 ${-depth + rx} 0 Z`
  }
  const lengthValue = (value: number, decimals = 2): string =>
    Number.isFinite(value) ? formatNumber(fromMillimeters(value, unit), decimals) : '—'

  $: isRing = selectedGear?.key === 'ring'
  $: isWorm = selectedGear?.key === 'worm'
  $: isBevel = selectedGear?.key === 'bevel'
  $: pitchDiameter = results?.pitchDiameter
  $: outsideDiameter = results?.outsideDiameter
  $: rootDiameter = results?.rootDiameter
  $: baseCircle = results?.baseCircle
  $: rawTeethCount = isWorm ? inputs?.wheelTeeth : inputs?.teeth ?? inputs?.gearTeeth
  $: teethCount = typeof rawTeethCount === 'number' ? rawTeethCount : NaN
  $: pitchRadius = Number.isFinite(pitchDiameter) ? pitchDiameter / 2 : NaN
  $: outsideRadius = Number.isFinite(outsideDiameter) ? outsideDiameter / 2 : NaN
  $: rootRadius = Number.isFinite(rootDiameter) ? rootDiameter / 2 : NaN
  $: baseRadius = Number.isFinite(baseCircle) ? baseCircle / 2 : NaN
  $: maxRadius = Math.max(pitchRadius || 0, outsideRadius || 0, rootRadius || 0, baseRadius || 0)
  $: wormPitchDiameter = typeof results?.pitchDiameterWorm === 'number' ? results.pitchDiameterWorm : NaN
  $: wormPitchRadius = Number.isFinite(wormPitchDiameter) ? wormPitchDiameter / 2 : NaN
  $: wormWheelRadius = Number.isFinite(outsideRadius) ? outsideRadius : pitchRadius
  $: wormBodyRadius = Number.isFinite(wormPitchRadius) ? Math.max(wormPitchRadius * 0.52, 7) : Math.max(maxRadius * 0.24, 7)
  $: wormBodyLength = Math.max(wormBodyRadius * 7.8, maxRadius * 1.8)
  $: wormBodyX = -wormBodyLength * 0.72
  $: wormBodyY = -wormBodyRadius
  $: wormWheelX = wormBodyX + wormBodyLength + wormBodyRadius + Math.max(gearDepth * 0.5, 6) + wormWheelRadius
  $: wormWheelToothCount = Number.isFinite(teethCount) ? Math.round(teethCount) : 12
  $: wormHelixPaths = buildWormHelixSidePath(wormBodyX, wormBodyY, wormBodyLength, wormBodyRadius, wormStarts)
  $: wormWheelRimTicks = buildWormWheelRimTicks(wormWheelRadius, wormWheelToothCount)
  $: wormContactPath = buildWormContactPath(wormBodyX + wormBodyLength, wormWheelX - wormWheelRadius, 0)
  $: holeBaseRadius = Number.isFinite(rootRadius) ? rootRadius : pitchRadius
  $: centerHoleRadius = Number.isFinite(holeBaseRadius)
    ? Math.max(holeBaseRadius * 0.18, maxRadius * 0.05)
    : maxRadius * 0.08
  $: helixAngleDeg = typeof inputs?.helixAngleDeg === 'number' ? inputs.helixAngleDeg : NaN
  $: wormStarts = typeof inputs?.wormStarts === 'number' ? inputs.wormStarts : NaN
  $: visualModeLabel = isRing ? 'Internal gear' : isWorm ? 'Worm set' : isBevel ? 'Bevel gear' : selectedGear?.key === 'helical' ? 'Helical gear' : 'Spur gear'
  $: outlinePath = buildGearOutline({
    teeth: Number.isFinite(teethCount) ? teethCount : NaN,
    pitchRadius,
    outsideRadius,
    rootRadius,
    baseRadius,
    ring: isRing
  })
  $: gearDepth = Math.max(maxRadius * 0.16, 8)
  $: faceOffsetX = isRing ? -gearDepth * 0.45 : gearDepth * 0.5
  $: faceOffsetY = -gearDepth * 0.34
  $: wormViewWidth = Math.max(wormBodyLength + wormWheelRadius * 2.6 + wormBodyRadius * 3.2, 240)
  $: wormViewHeight = Math.max(wormWheelRadius * 2.5, wormBodyRadius * 5.4, 140)
  $: legendItems = [
    {
      key: 'outside',
      code: 'da',
      label: `Outside`,
      diameter: outsideDiameter,
      value: outsideRadius
    },
    {
      key: 'pitch',
      code: 'd',
      label: `Pitch`,
      diameter: pitchDiameter,
      value: pitchRadius
    },
    {
      key: 'root',
      code: 'df',
      label: `Root`,
      diameter: rootDiameter,
      value: rootRadius
    },
    {
      key: 'base',
      code: 'db',
      label: `Base`,
      diameter: baseCircle,
      value: baseRadius
    }
  ].filter((item) => Number.isFinite(item.value) && item.value > 0)
  $: view = isWorm
    ? {
        viewBox: [-wormViewWidth / 2, -wormViewHeight / 2, wormViewWidth, wormViewHeight].join(' ')
      }
    : scaleToViewBox(maxRadius, Math.max(maxRadius * 0.22, 28))
  $: backOutlineTransform = `translate(${faceOffsetX} ${faceOffsetY})`
  $: helicalFaceLines = selectedGear?.key === 'helical' ? buildHelicalFaceLines(outsideRadius || pitchRadius || maxRadius, helixAngleDeg, Math.max(5, Math.round((teethCount || 12) / 4))) : []
  $: toothValleyLines = !isWorm && !isBevel && !isRing ? buildToothValleyLines(outsideRadius || pitchRadius || maxRadius, Math.round(teethCount || 12), selectedGear?.key === 'helical') : []
  $: faceGradientId = makeSvgId('face-gradient')
  $: sideGradientId = makeSvgId('side-gradient')
  $: coreGradientId = makeSvgId('core-gradient')
  $: ringGradientId = makeSvgId('ring-gradient')
  $: wormClipId = makeSvgId('worm-clip')
  $: wormWheelClipId = makeSvgId('worm-wheel-clip')
  $: helicalClipId = makeSvgId('helical-clip')
  $: bevelFrontRadius = Number.isFinite(outsideRadius) ? outsideRadius : maxRadius
  $: bevelBackRadius = Math.max(bevelFrontRadius * 0.58, 6)
  $: bevelDepth = Math.max(bevelFrontRadius * 0.52, 12)
  $: bevelSidePath = buildBevelSidePath(bevelFrontRadius, bevelBackRadius, bevelDepth)
  $: bevelBackPath = buildBevelBackPath(bevelBackRadius, bevelDepth)
  $: hasShape = maxRadius > 0 && (isWorm || outlinePath)
</script>

<section class="visualizer">
  <div class="header">
    <h3>Visualizer</h3>
    <span class="badge">{visualModeLabel}</span>
  </div>
  {#if hasShape}
    <svg
      class:worm-mode={isWorm}
      class="gear"
      viewBox={view.viewBox}
      aria-label={visualModeLabel}
      role="img"
    >
      <defs>
        <linearGradient id={faceGradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#c6d2ef" />
          <stop offset="45%" stop-color="#8fa3cd" />
          <stop offset="100%" stop-color="#4b5f88" />
        </linearGradient>
        <linearGradient id={sideGradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#32415f" />
          <stop offset="100%" stop-color="#1b263b" />
        </linearGradient>
        <radialGradient id={coreGradientId} cx="40%" cy="35%" r="70%">
          <stop offset="0%" stop-color="#eef4ff" stop-opacity="0.95" />
          <stop offset="60%" stop-color="#9eb2dc" stop-opacity="0.9" />
          <stop offset="100%" stop-color="#55698e" stop-opacity="0.92" />
        </radialGradient>
        <radialGradient id={ringGradientId} cx="50%" cy="45%" r="70%">
          <stop offset="0%" stop-color="#6f84ad" stop-opacity="0.82" />
          <stop offset="100%" stop-color="#24324b" stop-opacity="0.98" />
        </radialGradient>
        {#if selectedGear?.key === 'helical'}
          <clipPath id={helicalClipId}>
            <path d={outlinePath} />
          </clipPath>
        {/if}
        {#if isWorm}
          <clipPath id={wormClipId}>
            <rect
              x={wormBodyX}
              y={wormBodyY}
              width={wormBodyLength}
              height={wormBodyRadius * 2}
              rx={wormBodyRadius}
              ry={wormBodyRadius}
            />
          </clipPath>
          <clipPath id={wormWheelClipId}>
            <ellipse rx={wormWheelRadius * 0.82} ry={wormWheelRadius} />
          </clipPath>
        {/if}
      </defs>
      {#if isWorm}
        <path d={wormContactPath} class="worm-contact" />
        <g class="worm">
          <rect
            x={wormBodyX + gearDepth * 0.22}
            y={wormBodyY - gearDepth * 0.2}
            width={wormBodyLength}
            height={wormBodyRadius * 2}
            rx={wormBodyRadius}
            ry={wormBodyRadius}
            class="worm-shadow"
          />
          <rect
            x={wormBodyX}
            y={wormBodyY}
            width={wormBodyLength}
            height={wormBodyRadius * 2}
            rx={wormBodyRadius}
            ry={wormBodyRadius}
            class="worm-shell"
            style={`fill: url(#${faceGradientId});`}
          />
          <g clip-path={`url(#${wormClipId})`} class="worm-grooves">
            {#each wormHelixPaths as helixPath}
              <path d={helixPath} />
            {/each}
          </g>
          <line x1={wormBodyX + wormBodyRadius * 0.5} y1={0} x2={wormBodyX + wormBodyLength - wormBodyRadius * 0.5} y2={0} class="worm-axis-line" />
          <circle class="axis" r={wormBodyRadius * 0.18} />
        </g>
        <g class="worm-wheel" transform={`translate(${wormWheelX} 0)`}>
          <ellipse rx={wormWheelRadius + gearDepth * 0.28} ry={wormWheelRadius * 0.92} class="shadow-disc wheel-shadow" />
          <ellipse rx={wormWheelRadius * 0.82} ry={wormWheelRadius} class="worm-wheel-outline" style={`fill: url(#${coreGradientId});`} />
          <g class="worm-wheel-rim">
            {#each wormWheelRimTicks as tickPath}
              <path d={tickPath} />
            {/each}
          </g>
          <ellipse rx={Math.max((rootRadius || wormWheelRadius) * 0.42, wormWheelRadius * 0.22)} ry={Math.max((rootRadius || wormWheelRadius) * 0.3, wormWheelRadius * 0.16)} class="wheel-core" />
        </g>
      {:else}
        {#if isBevel}
          <g class="bevel-gear">
            {#if bevelBackPath}
              <path d={bevelBackPath} class="bevel-back" style={`fill: url(#${sideGradientId});`} />
            {/if}
            {#if bevelSidePath}
              <path d={bevelSidePath} class="bevel-side" style={`fill: url(#${sideGradientId});`} />
            {/if}
            <path d={outlinePath} class="gear-front bevel-front" style={`fill: url(#${coreGradientId});`} />
            {#if Number.isFinite(centerHoleRadius) && centerHoleRadius > 0}
              <ellipse cx="0" cy="0" rx={centerHoleRadius * 0.92} ry={centerHoleRadius * 0.66} class="center-hole bevel-hole" />
            {/if}
          </g>
        {:else}
          <g class="gear-stack">
            <g transform={backOutlineTransform} class="gear-back-layer">
              <path d={outlinePath} class={`gear-back ${isRing ? 'is-ring-back' : ''}`} style={!isRing ? `fill: url(#${sideGradientId});` : undefined} />
            </g>
            <path d={outlinePath} class:gear-ring={isRing} class="gear-front" style={`fill: url(#${isRing ? ringGradientId : coreGradientId});`} />
            {#if toothValleyLines.length}
              <g class="tooth-valleys">
                {#each toothValleyLines as valleyPath}
                  <path d={valleyPath} />
                {/each}
              </g>
            {/if}
            {#if selectedGear?.key === 'helical'}
              <g class="helical-flow" clip-path={`url(#${helicalClipId})`}>
                {#each helicalFaceLines as flowPath}
                  <path d={flowPath} />
                {/each}
              </g>
            {/if}
            {#if !isRing && Number.isFinite(centerHoleRadius) && centerHoleRadius > 0}
              <circle r={centerHoleRadius} class="center-hole" />
            {/if}
          </g>
        {/if}
        <circle class="axis" r={Math.max(maxRadius * 0.016, 1.6)} />
      {/if}

    </svg>
    <div class="legend">
      <p>Dimension results</p>
      <ul class="dimension-results">
        {#each legendItems as item}
          <li>
            <span>{item.code} ({item.label})</span>
            <strong>⌀{lengthValue(item.diameter)} {unit}</strong>
          </li>
        {/each}
      </ul>
      <div class="legend-meta">
        <span>Render mode</span>
        <strong>Clean technical 2.5D</strong>
      </div>
    </div>
  {:else}
    <div class="placeholder">
      <p>Adjust inputs to generate a gear shape.</p>
    </div>
  {/if}
</section>

<style>
  .visualizer {
    background: var(--surface-2);
    border: 1px solid var(--border-1);
    border-radius: var(--radius-md);
    padding: 1.25rem;
    display: grid;
    gap: 1rem;
    box-shadow: 0 12px 22px rgba(2, 6, 23, 0.25);
  }
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.5rem;
  }
  h3 {
    margin: 0;
    font-size: 1rem;
    color: var(--text-1);
  }
  .badge {
    font-size: 0.7rem;
    background: rgba(124, 140, 255, 0.16);
    color: var(--text-1);
    border: 1px solid var(--border-2);
    padding: 0.2rem 0.5rem;
    border-radius: 999px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }
  .gear {
    width: 100%;
    height: auto;
    aspect-ratio: 1 / 1;
    min-height: 20rem;
    display: block;
    background: #0a1120;
    border-radius: 4px;
    border: 1px solid var(--border-1);
  }
  .gear-back-layer {
    opacity: 0.54;
  }
  .gear-back,
  .bevel-back,
  .bevel-side {
    stroke: rgba(146, 165, 204, 0.2);
    stroke-width: 0.95;
    fill-rule: evenodd;
    vector-effect: non-scaling-stroke;
  }
  .gear-front,
  .worm-wheel-outline,
  .bevel-front {
    stroke: #edf3ff;
    stroke-width: 1.15;
    fill-rule: evenodd;
    vector-effect: non-scaling-stroke;
  }
  .is-ring-back {
    fill: #1b263b;
    stroke: rgba(111, 130, 171, 0.3);
  }
  .helical-flow path {
    fill: none;
    stroke: rgba(233, 241, 255, 0.22);
    stroke-width: 0.8;
    stroke-linecap: round;
    vector-effect: non-scaling-stroke;
  }
  .tooth-valleys path {
    fill: none;
    stroke: rgba(18, 27, 44, 0.28);
    stroke-width: 0.7;
    stroke-linecap: round;
    vector-effect: non-scaling-stroke;
  }
  .shadow-disc {
    fill: rgba(12, 18, 31, 0.22);
  }
  .wheel-shadow {
    fill: rgba(12, 18, 31, 0.18);
  }
  .wheel-core {
    fill: #152033;
    stroke: rgba(228, 237, 255, 0.75);
    stroke-width: 1.25;
  }
  .center-hole {
    fill: #0a1120;
    stroke: #d9e4ff;
    stroke-width: 1.4;
  }
  .bevel-hole {
    fill: #09101d;
  }
  .axis {
    fill: #d9e4ff;
    opacity: 0.75;
  }
  .worm {
    transform: translateY(0);
  }
  .worm-shadow {
    fill: rgba(10, 17, 32, 0.28);
    stroke: none;
  }
  .worm-shell {
    stroke: #d9e4ff;
    stroke-width: 1.05;
    vector-effect: non-scaling-stroke;
  }
  .worm-grooves path {
    stroke: #9db0dc;
    stroke-width: 0.95;
    fill: none;
    opacity: 0.88;
    vector-effect: non-scaling-stroke;
  }
  .worm-axis-line {
    stroke: rgba(231, 239, 255, 0.4);
    stroke-width: 0.85;
    stroke-dasharray: 4 4;
    vector-effect: non-scaling-stroke;
  }
  .worm-wheel-rim path {
    stroke: rgba(237, 243, 255, 0.52);
    stroke-width: 0.95;
    fill: none;
    vector-effect: non-scaling-stroke;
  }
  .worm-contact {
    stroke: rgba(196, 213, 248, 0.35);
    stroke-width: 0.9;
    fill: none;
    stroke-dasharray: 4 4;
    vector-effect: non-scaling-stroke;
  }
  :global(svg.gear.worm-mode) {
    aspect-ratio: 16 / 9;
  }
  .bevel-back {
    opacity: 0.92;
  }
  .bevel-side {
    opacity: 0.95;
  }
  .legend {
    border: 1px solid var(--border-1);
    border-radius: var(--radius-sm);
    padding: 0.75rem 1rem;
    background: var(--surface-1);
  }
  .legend p {
    margin: 0 0 0.5rem;
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--text-3);
  }
  .legend-meta {
    margin-top: 0.35rem;
    padding-top: 0.35rem;
    border-top: 1px solid #e2e8f0;
    border-top-color: var(--border-1);
    display: flex;
    justify-content: space-between;
    font-size: 0.76rem;
    color: var(--text-1);
    font-weight: 600;
  }
  .legend-meta span {
    font-weight: 500;
    color: var(--text-3);
  }
  .dimension-results {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: 0.35rem;
  }
  .dimension-results li {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.78rem;
    border-bottom: 1px dashed var(--border-1);
    padding-bottom: 0.2rem;
  }
  .dimension-results li span {
    color: var(--text-2);
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
  }
  .dimension-results li strong {
    color: var(--text-1);
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', monospace;
    font-variant-numeric: tabular-nums;
  }
  .placeholder {
    padding: 1.5rem;
    background: rgba(17, 26, 46, 0.6);
    border-radius: var(--radius-sm);
    border: 1px dashed var(--border-1);
    text-align: center;
    color: var(--text-3);
    font-size: 0.9rem;
  }
</style>
