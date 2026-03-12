<script lang="ts">
  import { formatNumber } from '../../gear/format'
  import { fromMillimeters } from '../../gear/units'
  import { buildGearOutline, buildReferenceGeometry, linePath, scaleToViewBox } from '../../gear/visualize'
  import type { GearType, LengthUnit } from '../../gear/types'

  type LooseInputs = Record<string, number | undefined>
  type VisualResults = {
    pitchDiameter: number
    outsideDiameter: number
    rootDiameter: number
    baseCircle: number
  }

  export let selectedGear: { key: GearType } = { key: 'spur' }
  export let inputs: LooseInputs = {}
  export let results: VisualResults = {
    pitchDiameter: NaN,
    outsideDiameter: NaN,
    rootDiameter: NaN,
    baseCircle: NaN
  }
  export let unit: LengthUnit

  const toRadians = (deg: number): number => (deg * Math.PI) / 180
  const polarToCartesian = (radius: number, angleRad: number): [number, number] => [radius * Math.cos(angleRad), radius * Math.sin(angleRad)]
  const arcPath = (radius: number, angleDeg: number): string => {
    if (!Number.isFinite(radius) || radius <= 0 || !Number.isFinite(angleDeg) || angleDeg <= 0) {
      return ''
    }
    const clamped = Math.min(angleDeg, 359.9)
    const start = toRadians(-clamped / 2)
    const end = toRadians(clamped / 2)
    const [startX, startY] = polarToCartesian(radius, start)
    const [endX, endY] = polarToCartesian(radius, end)
    const largeArc = clamped > 180 ? 1 : 0
    return `M ${startX} ${startY} A ${radius} ${radius} 0 ${largeArc} 1 ${endX} ${endY}`
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
  $: circularPitchAngle = Number.isFinite(teethCount) && teethCount > 0 ? 360 / teethCount : NaN
  $: circularPitchAngleLabel = Number.isFinite(circularPitchAngle)
    ? `${formatNumber(circularPitchAngle, 2)}°`
    : '—'
  $: pitchRadius = Number.isFinite(pitchDiameter) ? pitchDiameter / 2 : NaN
  $: outsideRadius = Number.isFinite(outsideDiameter) ? outsideDiameter / 2 : NaN
  $: rootRadius = Number.isFinite(rootDiameter) ? rootDiameter / 2 : NaN
  $: baseRadius = Number.isFinite(baseCircle) ? baseCircle / 2 : NaN
  $: maxRadius = Math.max(pitchRadius || 0, outsideRadius || 0, rootRadius || 0, baseRadius || 0)
  $: wormWheelRadius = Number.isFinite(outsideRadius) ? outsideRadius : pitchRadius
  $: wormBodyRadius = Math.max(maxRadius * 0.28, 6)
  $: wormBodyLength = Math.max(maxRadius * 2.4, wormBodyRadius * 6)
  $: wormBodyX = -wormBodyLength * 0.7
  $: wormBodyY = -wormBodyRadius
  $: wormWheelX = maxRadius * 0.9
  $: wormGrooveCount = Math.max(6, Math.round(wormBodyLength / (wormBodyRadius * 0.55)))
  $: wormGrooves = Array.from({ length: wormGrooveCount })
  $: holeBaseRadius = Number.isFinite(rootRadius) ? rootRadius : pitchRadius
  $: centerHoleRadius = Number.isFinite(holeBaseRadius)
    ? Math.max(holeBaseRadius * 0.18, maxRadius * 0.05)
    : maxRadius * 0.08
  $: visualModeLabel = isRing ? 'Internal gear drafting view' : 'Involute drafting view'
  $: outlinePath = buildGearOutline({
    teeth: Number.isFinite(teethCount) ? teethCount : NaN,
    pitchRadius,
    outsideRadius,
    rootRadius,
    baseRadius,
    ring: isRing
  })
  $: referenceGeometry = buildReferenceGeometry({
    teeth: Number.isFinite(teethCount) ? teethCount : NaN,
    pitchRadius,
    outsideRadius,
    rootRadius,
    baseRadius
  })
  $: wormViewWidth = Math.max(maxRadius * 3.4, 180)
  $: wormViewHeight = Math.max(maxRadius * 2.2, 120)
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
  $: centerlineExtent = Math.max(maxRadius * 1.2, 70)
  $: view = isWorm
    ? {
        viewBox: [-wormViewWidth / 2, -wormViewHeight / 2, wormViewWidth, wormViewHeight].join(' ')
      }
    : scaleToViewBox(maxRadius, Math.max(maxRadius * 0.22, 28))
  $: arcRadius = Number.isFinite(pitchRadius) ? pitchRadius : maxRadius * 0.7
  $: arcLabelX = arcRadius + Math.max(10, arcRadius * 0.08)
  $: arcLabelY = 0
  $: pitchArcPath = arcPath(arcRadius, circularPitchAngle)
  $: hasShape = maxRadius > 0 && (isWorm || outlinePath)
</script>

<section class="visualizer">
  <div class="header">
    <h3>Visualizer</h3>
    {#if isWorm}
      <span class="badge">Wheel projection</span>
    {:else if isBevel}
      <span class="badge">Bevel projection</span>
    {:else}
      <span class="badge">{visualModeLabel}</span>
    {/if}
  </div>
  {#if hasShape}
    <svg
      class="gear"
      viewBox={view.viewBox}
      aria-label="Gear visualizer"
      role="img"
    >
      <defs>
        <pattern id="gear-hatch" patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(30)">
          <line x1="0" y1="0" x2="0" y2="6" class="hatch-line" />
        </pattern>
        {#if isWorm}
          <clipPath id="worm-clip">
            <rect
              x={wormBodyX}
              y={wormBodyY}
              width={wormBodyLength}
              height={wormBodyRadius * 2}
              rx={wormBodyRadius}
              ry={wormBodyRadius}
            />
          </clipPath>
        {/if}
      </defs>
      {#if isWorm}
        <g class="centerlines">
          <line class="centerline" x1={-centerlineExtent} y1="0" x2={centerlineExtent * 1.6} y2="0" />
          <line class="centerline" x1={wormWheelX} y1={-centerlineExtent} x2={wormWheelX} y2={centerlineExtent} />
        </g>
        <g class="worm-wheel" transform={`translate(${wormWheelX} 0)`}>
          {#if Number.isFinite(outsideRadius)}
            <circle r={outsideRadius} class="guide outside" />
          {/if}
          {#if Number.isFinite(pitchRadius)}
            <circle r={pitchRadius} class="guide pitch" />
          {/if}
          {#if Number.isFinite(rootRadius)}
            <circle r={rootRadius} class="guide root" />
          {/if}
          <circle r={wormWheelRadius} class="worm-wheel-outline" />
          {#if pitchArcPath}
            <path d={pitchArcPath} class="pitch-arc" />
            <text x={arcLabelX} y={arcLabelY} class="pitch-arc-label">θp</text>
          {/if}
        </g>
        <g class="worm">
          <rect
            x={wormBodyX}
            y={wormBodyY}
            width={wormBodyLength}
            height={wormBodyRadius * 2}
            rx={wormBodyRadius}
            ry={wormBodyRadius}
            class="worm-shell"
          />
          <g clip-path="url(#worm-clip)" class="worm-grooves">
            {#each wormGrooves as _, index}
              <line
                x1={wormBodyX + (index / (wormGrooveCount - 1)) * wormBodyLength}
                y1={wormBodyY - wormBodyRadius}
                x2={wormBodyX + (index / (wormGrooveCount - 1)) * wormBodyLength + wormBodyRadius * 1.2}
                y2={wormBodyY + wormBodyRadius * 2 + wormBodyRadius}
              />
            {/each}
          </g>
          <circle class="axis" r={wormBodyRadius * 0.18} />
        </g>
      {:else}
        <g class="centerlines">
          <line class="centerline" x1={-centerlineExtent} y1="0" x2={centerlineExtent} y2="0" />
          <line class="centerline" x1="0" y1={-centerlineExtent} x2="0" y2={centerlineExtent} />
        </g>
        <g class="guides">
          {#if Number.isFinite(baseRadius)}
            <circle r={baseRadius} class="guide base" />
          {/if}
          {#if Number.isFinite(rootRadius)}
            <circle r={rootRadius} class="guide root" />
          {/if}
          {#if Number.isFinite(pitchRadius)}
            <circle r={pitchRadius} class="guide pitch" />
          {/if}
          {#if Number.isFinite(outsideRadius)}
            <circle r={outsideRadius} class="guide outside" />
          {/if}
        </g>
        {#if !isRing}
          <g class="reference-lines">
            {#each referenceGeometry.toothCenterLines as line}
              <path d={linePath(line)} class="reference-line center" />
            {/each}
            {#each referenceGeometry.flankLines as line}
              <path d={linePath(line)} class="reference-line flank" />
            {/each}
          </g>
        {/if}
        <path d={outlinePath} class="outline" />
        {#if pitchArcPath}
          <path d={pitchArcPath} class="pitch-arc" />
          <text x={arcLabelX} y={arcLabelY} class="pitch-arc-label">θp</text>
        {/if}
        {#if !isRing && Number.isFinite(centerHoleRadius) && centerHoleRadius > 0}
          <circle r={centerHoleRadius} class="center-hole" />
        {/if}
        <circle class="axis" r={maxRadius * 0.02} />
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
        <span>Circular pitch angle (θp)</span>
        <strong>{circularPitchAngleLabel}</strong>
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
    background: #ffffff;
    border: 1px solid #cbd5e1;
    border-radius: 16px;
    padding: 1.25rem;
    display: grid;
    gap: 1rem;
    box-shadow: none;
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
    color: #111827;
  }
  .badge {
    font-size: 0.7rem;
    background: #f8fafc;
    color: #0f172a;
    border: 1px solid #cbd5e1;
    padding: 0.2rem 0.5rem;
    border-radius: 999px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }
  .gear {
    width: 100%;
    height: auto;
    display: block;
    background: #ffffff;
    border-radius: 4px;
    border: 1px solid #e2e8f0;
  }
  .centerline {
    stroke: #64748b;
    stroke-width: 0.9;
    stroke-dasharray: 7 4 2 4;
  }
  .guide {
    fill: none;
    stroke-width: 1;
    stroke-linecap: round;
  }
  .guide.base {
    stroke: #6b7280;
    stroke-dasharray: 4 3;
  }
  .guide.root {
    stroke: #6b7280;
    stroke-dasharray: 6 4;
  }
  .guide.pitch {
    stroke: #374151;
    stroke-dasharray: 2 3;
  }
  .guide.outside {
    stroke: #4b5563;
    stroke-dasharray: 10 4;
  }
  .outline {
    fill: url(#gear-hatch);
    stroke: #0f172a;
    stroke-width: 1.6;
    fill-rule: evenodd;
  }
  .hatch-line {
    stroke: #d1d5db;
    stroke-width: 0.9;
  }
  .reference-lines {
    opacity: 0.42;
  }
  .reference-line {
    fill: none;
    stroke-linecap: round;
  }
  .reference-line.center {
    stroke: rgba(15, 23, 42, 0.24);
    stroke-width: 0.9;
    stroke-dasharray: 2 3;
  }
  .reference-line.flank {
    stroke: rgba(15, 23, 42, 0.22);
    stroke-width: 0.7;
    stroke-dasharray: 4 6;
  }
  .worm-wheel-outline {
    fill: url(#gear-hatch);
    stroke: #0f172a;
    stroke-width: 1.6;
  }
  .center-hole {
    fill: #ffffff;
    stroke: #0f172a;
    stroke-width: 1.4;
  }
  .axis {
    fill: #0f172a;
    opacity: 0.75;
  }
  .pitch-arc {
    fill: none;
    stroke: #0f172a;
    stroke-width: 1.1;
    stroke-dasharray: 3 4;
  }
  .pitch-arc-label {
    font-size: 9px;
    fill: #0f172a;
    font-weight: 600;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
  }
  .worm {
    transform: translateY(0);
  }
  .worm-shell {
    fill: #f8fafc;
    stroke: #0f172a;
    stroke-width: 1.2;
  }
  .worm-grooves line {
    stroke: #94a3b8;
    stroke-width: 1;
  }
  .legend {
    border: 1px solid #cbd5e1;
    border-radius: 12px;
    padding: 0.75rem 1rem;
    background: #ffffff;
  }
  .legend p {
    margin: 0 0 0.5rem;
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #475569;
  }
  .legend-meta {
    margin-top: 0.35rem;
    padding-top: 0.35rem;
    border-top: 1px solid #e2e8f0;
    display: flex;
    justify-content: space-between;
    font-size: 0.76rem;
    color: #0f172a;
    font-weight: 600;
  }
  .legend-meta span {
    font-weight: 500;
    color: #475569;
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
    border-bottom: 1px dashed #e2e8f0;
    padding-bottom: 0.2rem;
  }
  .dimension-results li span {
    color: #475569;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
  }
  .dimension-results li strong {
    color: #0f172a;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', monospace;
  }
  .placeholder {
    padding: 1.5rem;
    background: #f8fafc;
    border-radius: 12px;
    border: 1px dashed #e2e8f0;
    text-align: center;
    color: #64748b;
    font-size: 0.9rem;
  }
</style>
