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
    color: var(--text-2);
  }
  .mode-toggle button {
    border: 1px solid var(--border-1);
    background: var(--surface-1);
    color: var(--text-2);
    padding: 0.2rem 0.55rem;
    border-radius: 999px;
    font-size: 0.75rem;
    cursor: pointer;
  }
  .mode-toggle button.active {
    background: rgba(124, 140, 255, 0.2);
    border-color: var(--accent);
    color: var(--text-1);
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
    color: var(--text-2);
  }
  .control {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: var(--surface-2);
    border: 1px solid var(--border-1);
    border-radius: var(--radius-sm);
    padding: 0.5rem 0.75rem;
    transition: border-color 120ms ease, box-shadow 120ms ease;
  }
  .control:focus-within {
    border-color: var(--accent);
    box-shadow: 0 0 0 2px rgba(124, 140, 255, 0.2);
  }
  .control input {
    border: none;
    background: transparent;
    outline: none;
    width: 100%;
    font-size: 1rem;
    color: var(--text-1);
  }
  .suffix {
    font-size: 0.85rem;
    color: var(--text-3);
  }
  .help {
    font-size: 0.75rem;
    color: var(--text-3);
  }
  .lock {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.75rem;
    color: var(--text-3);
  }
  .lock input {
    accent-color: var(--accent);
  }
</style>
