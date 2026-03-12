<script lang="ts">
  // @ts-nocheck
  import LockableInput from '../inputs/LockableInput.svelte'
  import ModuleInputControl from '../inputs/ModuleInputControl.svelte'

  export let selectedGearKey = 'spur'
  export let unit = 'mm'
  export let outputUnit = 'mm'
  export let inputs = {}
  export let locks = {}
  export let isSpurOrRing = false
  export let moduleInputMode: 'module' | 'dp' = 'module'
  export let supportsDpMode = false
  export let moduleLabel = 'Module'
  export let moduleValue = NaN
  export let moduleSuffix = 'mm'
  export let moduleLock = false
  export let onModuleModeChange: (nextMode: 'module' | 'dp') => void = () => {}
  export let onModuleInput: (nextValue: number) => void = () => {}
  export let onModuleLockChange: (locked: boolean) => void = () => {}
</script>

<div class="inputs">
  {#if selectedGearKey === 'spur' || selectedGearKey === 'ring' || selectedGearKey === 'bevel' || selectedGearKey === 'helical'}
    <ModuleInputControl
      showModeToggle={unit === 'in' && supportsDpMode}
      {moduleInputMode}
      onModeChange={onModuleModeChange}
      label={moduleLabel}
      value={moduleValue}
      step={moduleInputMode === 'dp' ? 1 : 0.1}
      min={0.01}
      suffix={moduleSuffix}
      lock={moduleLock}
      onInput={onModuleInput}
      onLockChange={onModuleLockChange}
    />
  {/if}

  {#if selectedGearKey === 'helical'}
    <LockableInput
      label="Helix angle"
      bind:value={inputs.helixAngleDeg}
      bind:locked={locks.helixAngleDeg}
      step={0.5}
      suffix="°"
    />
  {/if}

  {#if selectedGearKey === 'worm'}
    <LockableInput
      label="Axial module"
      bind:value={inputs.axialModule}
      bind:locked={locks.axialModule}
      step={0.1}
      min={0.01}
      suffix={outputUnit}
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

  {#if selectedGearKey === 'spur' || selectedGearKey === 'ring'}
    <LockableInput
      label="Teeth"
      bind:value={inputs.teeth}
      bind:locked={locks.teeth}
      step={1}
      min={1}
    />
  {/if}

  {#if selectedGearKey === 'helical'}
    <LockableInput
      label="Teeth"
      bind:value={inputs.teeth}
      bind:locked={locks.teeth}
      step={1}
      min={1}
    />
  {/if}

  {#if selectedGearKey === 'bevel'}
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
      help={isSpurOrRing ? 'Standard spur/ring: 1.0' : 'Standard full-depth: 1.0'}
    />
    <LockableInput
      label="Dedendum coeff"
      bind:value={inputs.dedendumCoeff}
      bind:locked={locks.dedendumCoeff}
      step={isSpurOrRing ? 0.001 : 0.05}
      min={0.1}
      max={isSpurOrRing ? 1.157 : undefined}
      help={isSpurOrRing ? 'Standard spur/ring: 1.157' : 'Standard full-depth: 1.25'}
    />
  </div>
</div>

<style>
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
</style>
