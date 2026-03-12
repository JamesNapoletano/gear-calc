<script lang="ts">
  // @ts-nocheck
  import type { GearOutputs } from '../../gear/types.ts'

  export let results: Partial<GearOutputs> = {}
  export let unit = 'mm'
  export let locks: Record<string, boolean> = {}
  export let canEditPitchDiameter = false
  export let canEditCircularPitch = false
  export let lengthNumber: (value: number) => number = (value) => value
  export let onResultChange: (field: string, value: number) => void = () => {}
</script>

<section class="card editable">
  <h3>Diameters (editable)</h3>
  <div class="editable-list">
    <label>
      Pitch diameter
      <input
        type="number"
        value={Number.isFinite(lengthNumber(results.pitchDiameter)) ? lengthNumber(results.pitchDiameter) : ''}
        disabled={!canEditPitchDiameter}
        on:change={(event) => onResultChange('pitchDiameter', Number((event.target as HTMLInputElement).value))}
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
        on:change={(event) => onResultChange('outsideDiameter', Number((event.target as HTMLInputElement).value))}
      />
    </label>
    <label>
      Root diameter
      <input
        type="number"
        value={Number.isFinite(lengthNumber(results.rootDiameter)) ? lengthNumber(results.rootDiameter) : ''}
        disabled={locks.dedendumCoeff}
        on:change={(event) => onResultChange('rootDiameter', Number((event.target as HTMLInputElement).value))}
      />
    </label>
  </div>
  <p class="unit">Unit: {unit}</p>
</section>

<section class="card editable">
  <h3>Tooth Proportions (editable)</h3>
  <div class="editable-list">
    <label>
      Addendum
      <input
        type="number"
        value={Number.isFinite(lengthNumber(results.addendum)) ? lengthNumber(results.addendum) : ''}
        disabled={locks.addendumCoeff}
        on:change={(event) => onResultChange('addendum', Number((event.target as HTMLInputElement).value))}
      />
    </label>
    <label>
      Dedendum
      <input
        type="number"
        value={Number.isFinite(lengthNumber(results.dedendum)) ? lengthNumber(results.dedendum) : ''}
        disabled={locks.dedendumCoeff}
        on:change={(event) => onResultChange('dedendum', Number((event.target as HTMLInputElement).value))}
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
        disabled={!canEditCircularPitch}
        on:change={(event) => onResultChange('circularPitch', Number((event.target as HTMLInputElement).value))}
      />
    </label>
  </div>
  <p class="unit">Unit: {unit}</p>
</section>

<style>
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
</style>
