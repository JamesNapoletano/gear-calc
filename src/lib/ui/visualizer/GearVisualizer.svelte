<script>
  import { formatNumber } from '../../gear/format.js'
  import { fromMillimeters } from '../../gear/units.js'
  import { buildGearOutline, scaleToViewBox } from '../../gear/visualize.js'

  export let selectedGear
  export let inputs
  export let results
  export let unit

  const toRadians = (deg) => (deg * Math.PI) / 180
  const polarToCartesian = (radius, angleRad) => [radius * Math.cos(angleRad), radius * Math.sin(angleRad)]
  const arcPath = (radius, angleDeg) => {
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
  const lengthValue = (value, decimals = 2) =>
    Number.isFinite(value) ? formatNumber(fromMillimeters(value, unit), decimals) : '—'

  $: isRing = selectedGear?.key === 'ring'
  $: isWorm = selectedGear?.key === 'worm'
  $: isBevel = selectedGear?.key === 'bevel'
  $: pitchDiameter = results?.pitchDiameter
  $: outsideDiameter = results?.outsideDiameter
  $: rootDiameter = results?.rootDiameter
  $: baseCircle = results?.baseCircle
  $: teethCount = isWorm ? inputs?.wheelTeeth : inputs?.teeth ?? inputs?.gearTeeth
  $: circularPitchAngle = Number.isFinite(teethCount) && teethCount > 0 ? 360 / teethCount : NaN
  $: circularPitchAngleLabel = Number.isFinite(circularPitchAngle)
    ? `${formatNumber(circularPitchAngle, 2)}°`
    : '—'
  $: pitchRadius = Number.isFinite(pitchDiameter) ? pitchDiameter / 2 : NaN
  $: outsideRadius = Number.isFinite(outsideDiameter) ? outsideDiameter / 2 : NaN
  $: rootRadius = Number.isFinite(rootDiameter) ? rootDiameter / 2 : NaN
  $: baseRadius = Number.isFinite(baseCircle) ? baseCircle / 2 : NaN
  $: maxRadius = Math.max(pitchRadius || 0, outsideRadius || 0, rootRadius || 0, baseRadius || 0)
  $: wormWheelRadius = Number.isFinite(outsideRadius) ? outsideRadius / 2 : pitchRadius
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
  /** @type {'standard' | 'soft' | 'worm'} */
  const profileMode = 'standard'
  $: outlineProfile = isWorm ? 'worm' : isRing ? 'soft' : profileMode
  $: outlinePath = buildGearOutline(
    /** @type {any} */ ({
      teeth: isWorm ? inputs?.wheelTeeth : inputs?.teeth ?? inputs?.gearTeeth,
      pitchRadius,
      outsideRadius,
      rootRadius,
      ring: isRing,
      profile: outlineProfile
    })
  )
  $: view = isWorm
    ? {
        size: Math.max(maxRadius * 3.4, 180),
        viewBox: [
          -Math.max(maxRadius * 3.4, 180) / 2,
          -Math.max(maxRadius * 2.2, 120) / 2,
          Math.max(maxRadius * 3.4, 180),
          Math.max(maxRadius * 2.2, 120)
        ].join(' ')
      }
    : scaleToViewBox(maxRadius, Math.max(maxRadius * 0.16, 24))
  $: legendItems = [
    {
      key: 'outside',
      color: '#ea580c',
      label: `Outside ⌀ ${lengthValue(outsideDiameter)} ${unit}`,
      value: outsideRadius
    },
    {
      key: 'pitch',
      color: '#4f46e5',
      label: `Pitch ⌀ ${lengthValue(pitchDiameter)} ${unit}`,
      value: pitchRadius
    },
    {
      key: 'root',
      color: '#059669',
      label: `Root ⌀ ${lengthValue(rootDiameter)} ${unit}`,
      value: rootRadius
    },
    {
      key: 'base',
      color: '#0284c7',
      label: `Base ⌀ ${lengthValue(baseCircle)} ${unit}`,
      value: baseRadius
    }
  ].filter((item) => Number.isFinite(item.value) && item.value > 0)
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
    {/if}
  </div>
  {#if hasShape}
    <svg
      class="gear"
      viewBox={view.viewBox}
      width={view.size}
      height={view.size}
      aria-label="Gear visualizer"
      role="img"
    >
      <defs>
        <filter id="gear-shadow" x="-25%" y="-25%" width="150%" height="150%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#94a3b8" flood-opacity="0.2" />
        </filter>
        <radialGradient id="gear-fill" cx="50%" cy="45%" r="65%">
          <stop offset="0%" stop-color="#f8fafc" />
          <stop offset="100%" stop-color="#e2e8f0" />
        </radialGradient>
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
          <circle r={wormWheelRadius} class="worm-wheel-outline" filter="url(#gear-shadow)" />
          {#if pitchArcPath}
            <path d={pitchArcPath} class="pitch-arc" />
            <text x={arcLabelX} y={arcLabelY} class="pitch-arc-label">θp</text>
          {/if}
        </g>
        <g class="worm" filter="url(#gear-shadow)">
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
        <path d={outlinePath} class="outline" filter="url(#gear-shadow)" />
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
      <p>Diameter legend</p>
      <ul>
        {#each legendItems as item}
          <li>
            <span class="swatch" style={`background:${item.color}`}></span>
            <span>{item.label}</span>
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
    border: 1px solid #e2e8f0;
    border-radius: 16px;
    padding: 1.25rem;
    display: grid;
    gap: 1rem;
    box-shadow: 0 10px 25px rgba(15, 23, 42, 0.08);
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
    background: #f1f5f9;
    color: #0f172a;
    border: 1px solid #cbd5f5;
    padding: 0.2rem 0.5rem;
    border-radius: 999px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }
  .gear {
    width: 100%;
    height: auto;
    display: block;
    background: radial-gradient(circle at center, rgba(15, 23, 42, 0.02), rgba(15, 23, 42, 0));
    border-radius: 18px;
  }
  .guide {
    fill: none;
    stroke-width: 1.4;
    stroke-linecap: round;
  }
  .guide.base {
    stroke: #0284c7;
    stroke-dasharray: 4 4;
  }
  .guide.root {
    stroke: #059669;
    stroke-dasharray: 8 4;
  }
  .guide.pitch {
    stroke: #4f46e5;
    stroke-dasharray: 2 3;
  }
  .guide.outside {
    stroke: #ea580c;
    stroke-dasharray: 10 6;
  }
  .outline {
    fill: url(#gear-fill);
    stroke: #0f172a;
    stroke-width: 1.4;
  }
  .worm-wheel-outline {
    fill: url(#gear-fill);
    stroke: #0f172a;
    stroke-width: 1.4;
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
    font-size: 10px;
    fill: #0f172a;
    font-weight: 600;
  }
  .worm {
    transform: translateY(0);
  }
  .worm-shell {
    fill: #e2e8f0;
    stroke: #0f172a;
    stroke-width: 1.2;
  }
  .worm-grooves line {
    stroke: #94a3b8;
    stroke-width: 1;
  }
  .legend {
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 0.75rem 1rem;
    background: #f8fafc;
  }
  .legend p {
    margin: 0 0 0.5rem;
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #475569;
  }
  .legend ul {
    list-style: none;
    padding: 0;
    margin: 0;
    display: grid;
    gap: 0.4rem;
  }
  .legend li {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.78rem;
    color: #0f172a;
    font-weight: 600;
  }
  .legend .swatch {
    width: 14px;
    height: 14px;
    border-radius: 999px;
    display: inline-block;
    box-shadow: inset 0 0 0 1px rgba(15, 23, 42, 0.25);
  }
  .legend-meta {
    margin-top: 0.75rem;
    padding-top: 0.65rem;
    border-top: 1px solid #e2e8f0;
    display: flex;
    justify-content: space-between;
    font-size: 0.78rem;
    color: #0f172a;
    font-weight: 600;
  }
  .legend-meta span {
    font-weight: 500;
    color: #475569;
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
