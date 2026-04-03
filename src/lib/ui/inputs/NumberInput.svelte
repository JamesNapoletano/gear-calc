<script lang="ts">
  export let label = ''
  export let value: number = 0
  export let step = 0.1
  export let min: number | undefined = undefined
  export let max: number | undefined = undefined
  export let suffix = ''
  export let help = ''

  const handleInput = (event: Event): void => {
    const target = event.target as HTMLInputElement
    const next = target.value
    value = next === '' ? NaN : Number(next)
  }
</script>

<label class="field">
  <span class="label">{label}</span>
  <div class="control">
    <input
      type="number"
      value={Number.isFinite(value) ? value : ''}
      {step}
      {min}
      {max}
      on:input={handleInput}
    />
    {#if suffix}
      <span class="suffix">{suffix}</span>
    {/if}
  </div>
  {#if help}
    <span class="help">{help}</span>
  {/if}
</label>

<style>
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
  input {
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
</style>
