<script>
  export let label = ''
  export let value = 0
  export let step = 0.1
  export let min = undefined
  export let max = undefined
  export let suffix = ''
  export let help = ''

  const handleInput = (event) => {
    const next = event.target.value
    value = next === '' ? NaN : Number(next)
  }
</script>

<label class="field">
  <span class="label">{label}</span>
  <div class="control">
    <input
      type="number"
      bind:value
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
  input {
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
</style>
