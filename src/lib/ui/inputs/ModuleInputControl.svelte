<script lang="ts">
  export let label = 'Module'
  export let value: number = NaN
  export let suffix = 'mm'
  export let step = 0.1
  export let min = 0.01
  export let lock = false
  export let showModeToggle = false
  export let moduleInputMode: 'module' | 'dp' = 'module'
  export let onModeChange: (nextMode: 'module' | 'dp') => void = () => {}
  export let onInput: (nextValue: number) => void = () => {}
  export let onLockChange: (locked: boolean) => void = () => {}

  const handleInput = (event: Event): void => {
    const target = event.target as HTMLInputElement
    const raw = target.value
    onInput(raw === '' ? NaN : Number(raw))
  }

  const handleLockChange = (event: Event): void => {
    const target = event.target as HTMLInputElement
    onLockChange(target.checked)
  }
</script>

{#if showModeToggle}
  <div class="mode-toggle">
    <span>Input basis</span>
    <button
      type="button"
      class:active={moduleInputMode === 'module'}
      on:click={() => onModeChange('module')}
    >
      Module
    </button>
    <button
      type="button"
      class:active={moduleInputMode === 'dp'}
      on:click={() => onModeChange('dp')}
    >
      DP
    </button>
  </div>
{/if}

<div class="lockable-custom">
  <label class="field">
    <span class="label">{label}</span>
    <div class="control">
      <input
        type="number"
        value={Number.isFinite(value) ? value : ''}
        {step}
        {min}
        on:input={handleInput}
      />
      <span class="suffix">{suffix}</span>
    </div>
    {#if moduleInputMode === 'dp'}
      <span class="help">Diametral pitch input converts internally to module.</span>
    {/if}
  </label>
  <label class="lock">
    <input type="checkbox" checked={lock} on:change={handleLockChange} />
    <span>Lock</span>
  </label>
</div>

<style>
  .mode-toggle {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.78rem;
    color: #475569;
  }
  .mode-toggle button {
    border: 1px solid #cbd5e1;
    background: #ffffff;
    color: #334155;
    padding: 0.2rem 0.55rem;
    border-radius: 999px;
    font-size: 0.75rem;
    cursor: pointer;
  }
  .mode-toggle button.active {
    background: #111827;
    border-color: #111827;
    color: #ffffff;
  }
  .lockable-custom {
    display: grid;
    gap: 0.5rem;
  }
  .field {
    display: grid;
    gap: 0.4rem;
  }
  .label {
    font-size: 0.9rem;
    color: #4b5563;
  }
  .control {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 0.5rem 0.75rem;
  }
  .control input {
    border: none;
    background: transparent;
    outline: none;
    width: 100%;
    font-size: 1rem;
  }
  .suffix {
    font-size: 0.85rem;
    color: #6b7280;
  }
  .help {
    font-size: 0.75rem;
    color: #9ca3af;
  }
  .lock {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.75rem;
    color: #64748b;
  }
  .lock input {
    accent-color: #4f46e5;
  }
</style>
