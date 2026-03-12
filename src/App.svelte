<script>
  // @ts-nocheck
  import { gearList, gearRegistry } from './lib/gear/index'
  import { defaultGearOutputs } from './lib/gear/types'
  import { supportsDpMode, moduleFieldForGear, isSpurOrRingGear } from './lib/gear/config'
  import {
    canEditCircularPitch,
    canEditPitchDiameter,
    applyResultEditToInputs
  } from './lib/gear/editable'
  import {
    convertLengthValue,
    diametralPitchToModule,
    fromMillimeters,
    moduleToDiametralPitch
  } from './lib/gear/units'
  import { formatNumber, labelUnit } from './lib/gear/format'
  import ResultCard from './lib/ui/results/ResultCard.svelte'
  import GearVisualizer from './lib/ui/visualizer/GearVisualizer.svelte'
  import AppHeader from './lib/ui/layout/AppHeader.svelte'
  import GearTypeSelector from './lib/ui/gear/GearTypeSelector.svelte'
  import GearInputsPanel from './lib/ui/panels/GearInputsPanel.svelte'
  import EditableResultsPanel from './lib/ui/panels/EditableResultsPanel.svelte'

  let selectedGear = gearList[0]
  let unit = 'mm'
  let inputs = { ...selectedGear.calculator.defaults, unit }
  let locks = {}
  let results = { ...defaultGearOutputs }
  let warnings = []
  let moduleInputMode = 'module'

  $: isSpurOrRing = isSpurOrRingGear(selectedGear.key)
  $: activeModuleField = moduleFieldForGear(selectedGear.key)
  $: dpSupported = supportsDpMode(selectedGear.key)

  const activeModuleLabel = () => {
    if (moduleInputMode === 'dp' && unit === 'in') return 'Diametral pitch'
    if (selectedGear.key === 'helical') return 'Normal module'
    if (selectedGear.key === 'worm') return 'Axial module'
    return 'Module'
  }

  const activeModuleSuffix = () => (moduleInputMode === 'dp' && unit === 'in' ? 'DP' : outputUnit())

  const activeModuleValue = () => {
    const field = activeModuleField
    if (!field) return NaN
    const rawValue = inputs[field]
    if (!Number.isFinite(rawValue)) return NaN
    if (moduleInputMode === 'dp' && unit === 'in' && dpSupported) {
      return moduleToDiametralPitch(rawValue, unit)
    }
    return rawValue
  }

  const updateActiveModuleValue = (displayValue) => {
    const field = activeModuleField
    if (!field) return
    const nextInputs = { ...inputs }
    if (!Number.isFinite(displayValue)) {
      nextInputs[field] = NaN
      inputs = nextInputs
      return
    }
    if (moduleInputMode === 'dp' && unit === 'in' && dpSupported) {
      nextInputs[field] = diametralPitchToModule(displayValue, unit)
    } else {
      nextInputs[field] = displayValue
    }
    inputs = nextInputs
  }

  const moduleLockValue = () => {
    const field = activeModuleField
    return field ? !!locks[field] : false
  }

  const setModuleLock = (locked) => {
    const field = activeModuleField
    if (!field) return
    locks = { ...locks, [field]: locked }
  }

  $: if (unit !== 'in' && moduleInputMode === 'dp') {
    moduleInputMode = 'module'
  }

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

  const applyResultEdit = (field, displayValue) => {
    const calculator = selectedGear.calculator
    inputs = applyResultEditToInputs({
      field,
      displayValue,
      gearKey: selectedGear.key,
      inputs,
      locks,
      results,
      unit,
      calculate: (nextInputs) => calculator.calculate(nextInputs)
    })
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
  <AppHeader bind:unit />

  <GearTypeSelector
    gears={gearList}
    selectedKey={selectedGear.key}
    onSelect={updateGear}
  />

  <section class="layout">
    <div class="panel">
      <h2>Inputs</h2>
      <GearInputsPanel
        selectedGearKey={selectedGear.key}
        {unit}
        outputUnit={outputUnit()}
        {inputs}
        {locks}
        {isSpurOrRing}
        {moduleInputMode}
        supportsDpMode={dpSupported}
        moduleLabel={activeModuleLabel()}
        moduleValue={activeModuleValue()}
        moduleSuffix={activeModuleSuffix()}
        moduleLock={moduleLockValue()}
        onModuleModeChange={(nextMode) => (moduleInputMode = nextMode)}
        onModuleInput={updateActiveModuleValue}
        onModuleLockChange={setModuleLock}
      />
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
        <EditableResultsPanel
          {results}
          unit={outputUnit()}
          {locks}
          canEditPitchDiameter={canEditPitchDiameter(selectedGear.key, locks)}
          canEditCircularPitch={canEditCircularPitch(selectedGear.key, locks)}
          {lengthNumber}
          onResultChange={applyResultEdit}
        />

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
  @media (max-width: 900px) {
    .layout {
      grid-template-columns: 1fr;
    }
  }
</style>
