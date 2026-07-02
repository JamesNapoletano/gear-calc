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

  // Parallel hatch lines at the helix angle, clipped to the gear outline — the
  // standard way a helical gear is hinted at on a flat technical drawing.
  const buildHelixHatch = (radius: number, angleDeg: number, count: number): string[] => {
    if (!Number.isFinite(radius) || radius <= 0 || !Number.isFinite(angleDeg)) return []
    const n = Math.max(5, count)
    const clamped = Math.max(-60, Math.min(60, angleDeg))
    const dx = radius * Math.tan(toRadians(clamped))
    const span = radius * 2.3
    return Array.from({ length: n }, (_, i) => {
      const x = -radius * 1.15 + ((i + 0.5) / n) * span
      return `M ${x - dx} ${-radius} L ${x + dx} ${radius}`
    })
  }

  // Worm thread shown as slanted crest lines across the cylinder — the standard
  // simplified screw-thread convention. Clipped to the cylinder body when drawn.
  const buildWormThreadLines = (x: number, length: number, radius: number, starts: number): string[] => {
    if (!Number.isFinite(length) || !Number.isFinite(radius) || length <= 0 || radius <= 0) return []
    const startCount = Number.isFinite(starts) ? Math.max(1, Math.round(starts)) : 1
    const pitchCount = Math.max(6, Math.round(length / (radius * 0.95)))
    const seg = length / pitchCount
    const slant = seg * 0.42 * Math.min(startCount, 3)
    const lines: string[] = []
    for (let i = -1; i <= pitchCount + 1; i += 1) {
      const lx = x + i * seg
      lines.push(`M ${lx - slant / 2} ${-radius} L ${lx + slant / 2} ${radius}`)
    }
    return lines
  }

  const svgUid = Math.random().toString(36).slice(2, 10)
  const makeSvgId = (name: string): string => `gearviz-${svgUid}-${name}`

  const lengthValue = (value: number, decimals = 2): string =>
    Number.isFinite(value) ? formatNumber(fromMillimeters(value, unit), decimals) : '—'

  $: isRing = selectedGear?.key === 'ring'
  $: isWorm = selectedGear?.key === 'worm'
  $: isBevel = selectedGear?.key === 'bevel'
  $: isHelical = selectedGear?.key === 'helical'
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
  $: refExtent = maxRadius > 0 ? maxRadius * 1.08 : 0
  $: helixAngleDeg = typeof inputs?.helixAngleDeg === 'number' ? inputs.helixAngleDeg : NaN
  $: wormStarts = typeof inputs?.wormStarts === 'number' ? inputs.wormStarts : NaN
  $: visualModeLabel = isRing ? 'Internal gear' : isWorm ? 'Worm set' : isBevel ? 'Bevel gear' : isHelical ? 'Helical gear' : 'Spur gear'

  $: outlinePath = buildGearOutline({
    teeth: Number.isFinite(teethCount) ? teethCount : NaN,
    pitchRadius,
    outsideRadius,
    rootRadius,
    baseRadius,
    ring: isRing
  })

  $: holeBaseRadius = Number.isFinite(rootRadius) ? rootRadius : pitchRadius
  $: centerHoleRadius = Number.isFinite(holeBaseRadius) ? Math.max(holeBaseRadius * 0.16, maxRadius * 0.05) : maxRadius * 0.08
  $: centerDotRadius = Math.max(maxRadius * 0.012, 1.2)
  $: showAddRootCircles = !isWorm && !isRing
  $: helixHatch = isHelical ? buildHelixHatch(outsideRadius || pitchRadius || maxRadius, helixAngleDeg, Math.max(6, Math.round((teethCount || 12) / 3))) : []

  // ---- worm set layout: wheel centred at origin, worm tangent across its top ----
  $: wormPitchDiameter = typeof results?.pitchDiameterWorm === 'number' ? results.pitchDiameterWorm : NaN
  $: wormPitchRadius = Number.isFinite(wormPitchDiameter) ? wormPitchDiameter / 2 : NaN
  $: wormWheelRadius = Number.isFinite(outsideRadius) ? outsideRadius : pitchRadius
  $: wormBodyRadius = Number.isFinite(wormPitchRadius) ? Math.max(wormPitchRadius * 0.62, 7) : Math.max(maxRadius * 0.26, 7)
  $: wormBodyLength = Math.max(wormWheelRadius * 2.4, wormBodyRadius * 6.5)
  $: wormShaftLength = wormBodyRadius * 1.4
  $: wormShaftRadius = wormBodyRadius * 0.42
  // the worm meshes at the top of the wheel: its underside drops to the wheel pitch line
  $: wormCenterY = -((Number.isFinite(pitchRadius) ? pitchRadius : wormWheelRadius) + wormBodyRadius * 0.92)
  $: wormThreadLines = buildWormThreadLines(-wormBodyLength / 2, wormBodyLength, wormBodyRadius, wormStarts)
  $: wormWheelPitchRadius = pitchRadius
  $: wormWheelBore = Math.max((rootRadius || wormWheelRadius) * 0.22, wormWheelRadius * 0.14)

  $: wormHalfWidth = Math.max(wormBodyLength / 2 + wormShaftLength + wormBodyRadius, wormWheelRadius) * 1.08
  $: wormTop = wormCenterY - wormBodyRadius * 1.5
  $: wormBottom = wormWheelRadius * 1.12
  $: view = isWorm
    ? { viewBox: [-wormHalfWidth, wormTop, wormHalfWidth * 2, wormBottom - wormTop].join(' ') }
    : scaleToViewBox(maxRadius, Math.max(maxRadius * 0.18, 24))
  $: wormAspect = isWorm ? (wormHalfWidth * 2) / (wormBottom - wormTop) : 1

  $: wormClipId = makeSvgId('worm-clip')
  $: helixClipId = makeSvgId('helix-clip')

  $: legendItems = [
    { key: 'outside', code: 'da', label: 'Outside', diameter: outsideDiameter, value: outsideRadius },
    { key: 'pitch', code: 'd', label: 'Pitch', diameter: pitchDiameter, value: pitchRadius },
    { key: 'root', code: 'df', label: 'Root', diameter: rootDiameter, value: rootRadius },
    { key: 'base', code: 'db', label: 'Base', diameter: baseCircle, value: baseRadius }
  ].filter((item) => Number.isFinite(item.value) && item.value > 0)

  $: hasShape = maxRadius > 0 && (isWorm || outlinePath)
</script>

<section class="visualizer">
  <div class="header">
    <h3>Visualizer</h3>
    <span class="badge">{visualModeLabel}</span>
  </div>
  {#if hasShape}
    <svg class:worm-mode={isWorm} class="gear" viewBox={view.viewBox} style={isWorm ? `aspect-ratio: ${wormAspect};` : ''} aria-label={visualModeLabel} role="img">
      <defs>
        {#if isHelical}
          <clipPath id={helixClipId}>
            <path d={outlinePath} />
          </clipPath>
        {/if}
        {#if isWorm}
          <clipPath id={wormClipId}>
            <rect x={-wormBodyLength / 2} y={-wormBodyRadius} width={wormBodyLength} height={wormBodyRadius * 2} rx={wormBodyRadius} ry={wormBodyRadius} />
          </clipPath>
        {/if}
      </defs>

      {#if isWorm}
        <!-- worm wheel (toothed gear, front view) centred at origin -->
        <g class="worm-wheel">
          <line x1={-wormWheelRadius * 1.15} y1="0" x2={wormWheelRadius * 1.15} y2="0" class="centerline" />
          <line x1="0" y1={-wormWheelRadius * 1.15} x2="0" y2={wormWheelRadius * 1.15} class="centerline" />
          {#if Number.isFinite(wormWheelPitchRadius) && wormWheelPitchRadius > 0}
            <circle r={wormWheelPitchRadius} class="ref-pitch" />
          {/if}
          <path d={outlinePath} class="gear-outline" />
          {#if Number.isFinite(wormWheelBore) && wormWheelBore > 0}
            <circle r={wormWheelBore} class="bore" />
          {/if}
        </g>
        <!-- worm: horizontal threaded cylinder tangent across the top of the wheel -->
        <g class="worm" transform={`translate(0 ${wormCenterY})`}>
          <line x1={-wormBodyLength / 2 - wormShaftLength} y1="0" x2={wormBodyLength / 2 + wormShaftLength} y2="0" class="centerline" />
          <rect x={-wormBodyLength / 2 - wormShaftLength} y={-wormShaftRadius} width={wormShaftLength} height={wormShaftRadius * 2} class="worm-shaft" />
          <rect x={wormBodyLength / 2} y={-wormShaftRadius} width={wormShaftLength} height={wormShaftRadius * 2} class="worm-shaft" />
          <rect x={-wormBodyLength / 2} y={-wormBodyRadius} width={wormBodyLength} height={wormBodyRadius * 2} rx={wormBodyRadius * 0.35} ry={wormBodyRadius * 0.35} class="outline" />
          <g clip-path={`url(#${wormClipId})`} class="thread">
            {#each wormThreadLines as threadPath}
              <path d={threadPath} />
            {/each}
          </g>
        </g>
      {:else}
        <!-- centerlines -->
        <line x1={-refExtent} y1="0" x2={refExtent} y2="0" class="centerline" />
        <line x1="0" y1={-refExtent} x2="0" y2={refExtent} class="centerline" />

        <!-- reference circles -->
        {#if showAddRootCircles}
          <circle r={outsideRadius} class="ref-solid" />
          <circle r={rootRadius} class="ref-solid" />
          {#if Number.isFinite(baseRadius) && baseRadius > 0}
            <circle r={baseRadius} class="ref-dash" />
          {/if}
        {/if}
        {#if Number.isFinite(pitchRadius) && pitchRadius > 0}
          <circle r={pitchRadius} class="ref-pitch" />
        {/if}

        <!-- helix hint -->
        {#if isHelical && helixHatch.length}
          <g class="helix-hatch" clip-path={`url(#${helixClipId})`}>
            {#each helixHatch as hatchPath}
              <path d={hatchPath} />
            {/each}
          </g>
        {/if}

        <!-- gear tooth outline -->
        <path d={outlinePath} class="gear-outline" class:is-ring={isRing} />

        <!-- bore -->
        {#if !isRing && Number.isFinite(centerHoleRadius) && centerHoleRadius > 0}
          <circle r={centerHoleRadius} class="bore" />
        {/if}
        <circle r={centerDotRadius} class="center-dot" />
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
        <strong>Technical line drawing</strong>
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
  .worm-shaft {
    fill: rgba(150, 173, 214, 0.13);
    stroke: #d4e0f7;
    stroke-width: 1.4;
    vector-effect: non-scaling-stroke;
  }

  /* technical line-drawing styles */
  .gear-outline {
    fill: rgba(150, 173, 214, 0.13);
    stroke: #d4e0f7;
    stroke-width: 1.6;
    stroke-linejoin: round;
    fill-rule: evenodd;
    vector-effect: non-scaling-stroke;
  }
  .gear-outline.is-ring {
    fill: rgba(150, 173, 214, 0.13);
  }
  .ref-solid {
    fill: none;
    stroke: rgba(159, 179, 209, 0.4);
    stroke-width: 1;
    vector-effect: non-scaling-stroke;
  }
  .ref-dash {
    fill: none;
    stroke: rgba(159, 179, 209, 0.32);
    stroke-width: 1;
    stroke-dasharray: 3 3;
    vector-effect: non-scaling-stroke;
  }
  .ref-pitch {
    fill: none;
    stroke: #6ea8fe;
    stroke-width: 1;
    stroke-dasharray: 7 3 1.5 3;
    vector-effect: non-scaling-stroke;
  }
  .centerline {
    stroke: rgba(159, 179, 209, 0.4);
    stroke-width: 0.8;
    stroke-dasharray: 7 3 1.5 3;
    vector-effect: non-scaling-stroke;
  }
  .helix-hatch path {
    fill: none;
    stroke: rgba(180, 200, 230, 0.22);
    stroke-width: 0.8;
    vector-effect: non-scaling-stroke;
  }
  .bore {
    fill: #0a1120;
    stroke: #d4e0f7;
    stroke-width: 1.4;
    vector-effect: non-scaling-stroke;
  }
  .center-dot {
    fill: #d4e0f7;
  }
  .worm .outline {
    fill: rgba(150, 173, 214, 0.13);
    stroke: #d4e0f7;
    stroke-width: 1.6;
    vector-effect: non-scaling-stroke;
  }
  .worm .thread path {
    fill: none;
    stroke: rgba(196, 213, 248, 0.6);
    stroke-width: 1;
    vector-effect: non-scaling-stroke;
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
    border-top: 1px solid var(--border-1);
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
