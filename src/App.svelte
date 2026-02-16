<script>
  // @ts-nocheck
  import { gearList, gearRegistry } from './lib/gear/index.js'
  import { defaultGearOutputs } from './lib/gear/types.js'
  import { convertLengthValue, fromMillimeters } from './lib/gear/units.js'
  import { formatNumber, labelUnit } from './lib/gear/format.js'
  import LockableInput from './lib/ui/inputs/LockableInput.svelte'
  import UnitToggle from './lib/ui/inputs/UnitToggle.svelte'
  import ResultCard from './lib/ui/results/ResultCard.svelte'
  import GearVisualizer from './lib/ui/visualizer/GearVisualizer.svelte'

  let selectedGear = gearList[0]
  let unit = 'mm'
  let inputs = { ...selectedGear.calculator.defaults, unit }
  let locks = {}
  let results = { ...defaultGearOutputs }
  let warnings = []
  $: isSpurOrRing = selectedGear.key === 'spur' || selectedGear.key === 'ring'

  const updateGear = (gearKey) => {
    const next = gearRegistry[gearKey]
    selectedGear = next
    inputs = { ...next.calculator.defaults, unit }
    locks = {}
  }

  const updateUnit = (nextUnit) => {
    if (inputs.unit === nextUnit) return
    const lengthFields = ['module', 'normalModule', 'axialModule']
    const updated = { ...inputs, unit: nextUnit }
    lengthFields.forEach((field) => {
      if (typeof updated[field] === 'number') {
        updated[field] = convertLengthValue(updated[field], inputs.unit, nextUnit)
      }
    })
    inputs = updated
  }

  $: if (inputs.unit !== unit) {
    updateUnit(unit)
  }

  const toRadians = (deg) => (deg * Math.PI) / 180

  const applyResultEdit = (field, displayValue) => {
    if (!Number.isFinite(displayValue)) return
    const calculator = selectedGear.calculator
    const nextInputs = { ...inputs }
    const moduleField = Object.keys(nextInputs).find((key) => key.includes('module'))
    const moduleValue = moduleField ? nextInputs[moduleField] : null
    const displayValueMm = convertLengthValue(displayValue, unit, 'mm')
    const moduleValueMm = moduleValue ? convertLengthValue(moduleValue, unit, 'mm') : null
    const helixAngleRad = toRadians(nextInputs.helixAngleDeg ?? 0)

    const transverseModuleMm =
      selectedGear.key === 'helical' ? moduleValueMm / Math.cos(helixAngleRad) : moduleValueMm
    const activeModuleMm =
      selectedGear.key === 'helical'
        ? transverseModuleMm
        : selectedGear.key === 'worm'
          ? convertLengthValue(nextInputs.axialModule, unit, 'mm')
          : moduleValueMm

    if (field === 'pitchDiameter') {
      if (selectedGear.key === 'worm') {
        if (locks.wheelTeeth) return
        const axialModuleMm = convertLengthValue(nextInputs.axialModule, unit, 'mm')
        nextInputs.wheelTeeth = displayValueMm / axialModuleMm
        inputs = nextInputs
        return
      }

      if (selectedGear.key === 'bevel') {
        if (locks.module) return
        const ratio = nextInputs.gearTeeth / nextInputs.pinionTeeth
        const shaftAngleRad = toRadians(nextInputs.shaftAngleDeg)
        const deltaPinion = Math.atan(
          Math.sin(shaftAngleRad) / (ratio + Math.cos(shaftAngleRad))
        )
        const virtualTeeth = nextInputs.pinionTeeth / Math.cos(deltaPinion)
        nextInputs.module = displayValueMm / virtualTeeth
        inputs = nextInputs
        return
      }

      if (!locks.teeth) {
        nextInputs.teeth = displayValueMm / transverseModuleMm
      } else if (!locks[moduleField]) {
        if (selectedGear.key === 'helical') {
          nextInputs.normalModule = (displayValueMm * Math.cos(helixAngleRad)) / nextInputs.teeth
        } else {
          nextInputs[moduleField] = displayValueMm / nextInputs.teeth
        }
      } else {
        return
      }
      inputs = nextInputs
      return
    }

    if (field === 'outsideDiameter' && !locks.addendumCoeff) {
      const pitch = calculator.calculate(nextInputs).pitchDiameter
      const addendum =
        selectedGear.key === 'ring'
          ? (pitch - displayValueMm) / 2
          : (displayValueMm - pitch) / 2
      nextInputs.addendumCoeff = addendum / activeModuleMm
      inputs = nextInputs
      return
    }

    if (field === 'rootDiameter' && !locks.dedendumCoeff) {
      const pitch = calculator.calculate(nextInputs).pitchDiameter
      const dedendum =
        selectedGear.key === 'ring'
          ? (displayValueMm - pitch) / 2
          : (pitch - displayValueMm) / 2
      nextInputs.dedendumCoeff = dedendum / activeModuleMm
      inputs = nextInputs
      return
    }

    if (field === 'addendum' && !locks.addendumCoeff) {
      nextInputs.addendumCoeff = displayValueMm / activeModuleMm
      inputs = nextInputs
      return
    }

    if (field === 'dedendum' && !locks.dedendumCoeff) {
      nextInputs.dedendumCoeff = displayValueMm / activeModuleMm
      inputs = nextInputs
      return
    }

    if (field === 'circularPitch' && !locks[moduleField]) {
      const transverseModule = displayValueMm / Math.PI
      if (selectedGear.key === 'helical') {
        nextInputs.normalModule = transverseModule * Math.cos(helixAngleRad)
      } else if (selectedGear.key === 'worm') {
        nextInputs.axialModule = transverseModule
      } else {
        nextInputs[moduleField] = transverseModule
      }
      inputs = nextInputs
      return
    }

    inputs = nextInputs
  }

  $: {
    const calculator = selectedGear.calculator
    warnings = calculator.validate(inputs)
    results = calculator.calculate(inputs)
  }

  const outputUnit = () => labelUnit(unit)
  const lengthValue = (value) => formatNumber(fromMillimeters(value, unit))
  const lengthNumber = (value) => fromMillimeters(value, unit)
</script>

<main class="app">
  <header class="header">
    <div>
      <p class="eyebrow">Gear Calc</p>
      <h1>Gear Measurement Calculator</h1>
      <p class="subtitle">
        Lightweight gear geometry calculator for spur, helical, ring, worm, and bevel gears.
      </p>
    </div>
    <UnitToggle bind:unit />
  </header>

  <section class="selector">
    {#each gearList as gear}
      <button
        type="button"
        class:active={gear.key === selectedGear.key}
        on:click={() => updateGear(gear.key)}
      >
        {gear.label}
      </button>
    {/each}
  </section>

  <section class="layout">
    <div class="panel">
      <h2>Inputs</h2>
      <div class="inputs">
        {#if selectedGear.key === 'spur' || selectedGear.key === 'ring' || selectedGear.key === 'bevel'}
          <LockableInput
            label="Module"
            bind:value={inputs.module}
            bind:locked={locks.module}
            step={0.1}
            min={0.01}
            suffix={outputUnit()}
          />
        {/if}

        {#if selectedGear.key === 'helical'}
          <LockableInput
            label="Normal module"
            bind:value={inputs.normalModule}
            bind:locked={locks.normalModule}
            step={0.1}
            min={0.01}
            suffix={outputUnit()}
          />
          <LockableInput
            label="Helix angle"
            bind:value={inputs.helixAngleDeg}
            bind:locked={locks.helixAngleDeg}
            step={0.5}
            suffix="°"
          />
        {/if}

        {#if selectedGear.key === 'worm'}
          <LockableInput
            label="Axial module"
            bind:value={inputs.axialModule}
            bind:locked={locks.axialModule}
            step={0.1}
            min={0.01}
            suffix={outputUnit()}
          />
          <LockableInput
            label="Worm starts"
            bind:value={inputs.wormStarts}
            bind:locked={locks.wormStarts}
            step={1}
            min={1}
          />
          <LockableInput
            label="Wheel teeth"
            bind:value={inputs.wheelTeeth}
            bind:locked={locks.wheelTeeth}
            step={1}
            min={1}
          />
          <LockableInput
            label="Lead angle"
            bind:value={inputs.leadAngleDeg}
            bind:locked={locks.leadAngleDeg}
            step={0.5}
            suffix="°"
          />
        {/if}

        {#if selectedGear.key === 'spur' || selectedGear.key === 'ring'}
          <LockableInput
            label="Teeth"
            bind:value={inputs.teeth}
            bind:locked={locks.teeth}
            step={1}
            min={1}
          />
        {/if}

        {#if selectedGear.key === 'helical'}
          <LockableInput
            label="Teeth"
            bind:value={inputs.teeth}
            bind:locked={locks.teeth}
            step={1}
            min={1}
          />
        {/if}

        {#if selectedGear.key === 'bevel'}
          <LockableInput
            label="Pinion teeth"
            bind:value={inputs.pinionTeeth}
            bind:locked={locks.pinionTeeth}
            step={1}
            min={1}
          />
          <LockableInput
            label="Gear teeth"
            bind:value={inputs.gearTeeth}
            bind:locked={locks.gearTeeth}
            step={1}
            min={1}
          />
          <LockableInput
            label="Shaft angle"
            bind:value={inputs.shaftAngleDeg}
            bind:locked={locks.shaftAngleDeg}
            step={1}
            suffix="°"
          />
        {/if}

        <LockableInput
          label="Pressure angle"
          bind:value={inputs.pressureAngleDeg}
          bind:locked={locks.pressureAngleDeg}
          step={0.5}
          min={isSpurOrRing ? 14.5 : undefined}
          max={isSpurOrRing ? 20 : undefined}
          suffix="°"
        />

        <div class="advanced">
          <h3>Advanced</h3>
          <LockableInput
            label="Addendum coeff"
            bind:value={inputs.addendumCoeff}
            bind:locked={locks.addendumCoeff}
            step={isSpurOrRing ? 0.01 : 0.05}
            min={0.1}
            max={isSpurOrRing ? 1 : undefined}
            help={
              isSpurOrRing ? 'Standard spur/ring: 1.0' : 'Standard full-depth: 1.0'
            }
          />
          <LockableInput
            label="Dedendum coeff"
            bind:value={inputs.dedendumCoeff}
            bind:locked={locks.dedendumCoeff}
            step={isSpurOrRing ? 0.001 : 0.05}
            min={0.1}
            max={isSpurOrRing ? 1.157 : undefined}
            help={
              isSpurOrRing ? 'Standard spur/ring: 1.157' : 'Standard full-depth: 1.25'
            }
          />
        </div>
      </div>
    </div>

      <div class="panel results">
        <h2>Results</h2>
      {#if warnings.length}
        <div class="warnings">
          {#each warnings as warning}
            <p>⚠ {warning}</p>
          {/each}
        </div>
      {/if}

      <div class="result-grid">
        <section class="card editable">
          <h3>Diameters (editable)</h3>
          <div class="editable-list">
            <label>
              Pitch diameter
              <input
                type="number"
                value={
                  Number.isFinite(lengthNumber(results.pitchDiameter))
                    ? lengthNumber(results.pitchDiameter)
                    : ''
                }
                disabled={
                  selectedGear.key === 'worm'
                    ? locks.wheelTeeth
                    : selectedGear.key === 'bevel'
                      ? locks.module
                      : locks.teeth && locks.module
                }
                on:change={(event) =>
                  applyResultEdit('pitchDiameter', Number(event.target.value))
                }
              />
            </label>
            <label>
              Outside diameter
              <input
                type="number"
                value={
                  Number.isFinite(lengthNumber(results.outsideDiameter))
                    ? lengthNumber(results.outsideDiameter)
                    : ''
                }
                disabled={locks.addendumCoeff}
                on:change={(event) =>
                  applyResultEdit('outsideDiameter', Number(event.target.value))
                }
              />
            </label>
            <label>
              Root diameter
              <input
                type="number"
                value={
                  Number.isFinite(lengthNumber(results.rootDiameter))
                    ? lengthNumber(results.rootDiameter)
                    : ''
                }
                disabled={locks.dedendumCoeff}
                on:change={(event) =>
                  applyResultEdit('rootDiameter', Number(event.target.value))
                }
              />
            </label>
          </div>
          <p class="unit">Unit: {outputUnit()}</p>
        </section>

        <section class="card editable">
          <h3>Tooth Proportions (editable)</h3>
          <div class="editable-list">
            <label>
              Addendum
              <input
                type="number"
                value={
                  Number.isFinite(lengthNumber(results.addendum))
                    ? lengthNumber(results.addendum)
                    : ''
                }
                disabled={locks.addendumCoeff}
                on:change={(event) => applyResultEdit('addendum', Number(event.target.value))}
              />
            </label>
            <label>
              Dedendum
              <input
                type="number"
                value={
                  Number.isFinite(lengthNumber(results.dedendum))
                    ? lengthNumber(results.dedendum)
                    : ''
                }
                disabled={locks.dedendumCoeff}
                on:change={(event) => applyResultEdit('dedendum', Number(event.target.value))}
              />
            </label>
            <label>
              Circular pitch
              <input
                type="number"
                value={
                  Number.isFinite(lengthNumber(results.circularPitch))
                    ? lengthNumber(results.circularPitch)
                    : ''
                }
                disabled={locks.module || locks.normalModule || locks.axialModule}
                on:change={(event) => applyResultEdit('circularPitch', Number(event.target.value))}
              />
            </label>
          </div>
          <p class="unit">Unit: {outputUnit()}</p>
        </section>
        <ResultCard
          title="Derived"
          items={[
            { label: 'Base circle', value: `${lengthValue(results.baseCircle)} ${outputUnit()}` },
            { label: 'Ratio', value: Number.isFinite(results.ratio) ? formatNumber(results.ratio, 3) : '—' },
            {
              label: 'Center distance',
              value: Number.isFinite(results.centerDistance)
                ? `${lengthValue(results.centerDistance)} ${outputUnit()}`
                : '—'
            }
          ]}
        />
        {#if Number.isFinite(results.pitchDiameterWorm)}
          <ResultCard
            title="Worm"
            items={[
              {
                label: 'Worm pitch diameter',
                value: `${lengthValue(results.pitchDiameterWorm)} ${outputUnit()}`
              }
            ]}
          />
        {/if}
        <GearVisualizer
          {selectedGear}
          {inputs}
          {results}
          {unit}
        />
      </div>
    </div>
  </section>
</main>

<style>
  .app {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }
  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    flex-wrap: wrap;
  }
  .eyebrow {
    text-transform: uppercase;
    letter-spacing: 0.2em;
    font-size: 0.7rem;
    color: #6366f1;
    margin: 0 0 0.5rem;
  }
  h1 {
    font-size: 2.4rem;
    margin: 0 0 0.5rem;
  }
  .subtitle {
    margin: 0;
    color: #64748b;
    max-width: 550px;
  }
  .selector {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
  }
  .selector button {
    border: 1px solid #e2e8f0;
    background: #ffffff;
    padding: 0.5rem 1.2rem;
    border-radius: 999px;
    cursor: pointer;
    color: #475569;
    font-weight: 600;
  }
  .selector button.active {
    background: #111827;
    color: #ffffff;
    border-color: #111827;
  }
  .layout {
    display: grid;
    grid-template-columns: minmax(260px, 1fr) minmax(320px, 1.2fr);
    gap: 2rem;
  }
  .panel {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 20px;
    padding: 1.5rem;
  }
  .panel h2 {
    margin-top: 0;
    font-size: 1.2rem;
  }
  .inputs {
    display: grid;
    gap: 1.1rem;
  }
  .advanced {
    border-top: 1px solid #e5e7eb;
    padding-top: 1rem;
    display: grid;
    gap: 0.75rem;
  }
  .advanced h3 {
    margin: 0;
    font-size: 0.95rem;
    color: #475569;
  }
  .results {
    display: grid;
    gap: 1.25rem;
  }
  .warnings {
    background: #fff7ed;
    border: 1px solid #fdba74;
    padding: 0.75rem 1rem;
    border-radius: 12px;
    color: #c2410c;
    font-size: 0.85rem;
  }
  .warnings p {
    margin: 0;
  }
  .result-grid {
    display: grid;
    gap: 1rem;
  }
  .editable {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 16px;
    padding: 1.25rem;
  }
  .editable h3 {
    margin: 0 0 1rem;
  }
  .editable-list {
    display: grid;
    gap: 0.75rem;
  }
  .editable label {
    display: grid;
    gap: 0.35rem;
    font-size: 0.85rem;
    color: #6b7280;
  }
  .editable input {
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 0.45rem 0.6rem;
    font-size: 0.95rem;
  }
  .editable input:disabled {
    background: #f1f5f9;
    color: #94a3b8;
  }
  .editable .unit {
    margin: 0.75rem 0 0;
    font-size: 0.75rem;
    color: #94a3b8;
  }
  @media (max-width: 900px) {
    .layout {
      grid-template-columns: 1fr;
    }
  }
</style>
