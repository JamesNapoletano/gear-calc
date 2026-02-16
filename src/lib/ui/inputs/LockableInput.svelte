<script>
  import NumberInput from './NumberInput.svelte'

  export let label = ''
  export let value = 0
  export let step = 0.1
  export let min = undefined
  export let max = undefined
  export let suffix = ''
  export let help = ''
  export let locked = false
</script>

<div class="lockable">
  <NumberInput {label} bind:value {step} {min} {max} {suffix} {help} />
  <label class="lock">
    <input type="checkbox" bind:checked={locked} />
    <span>Lock</span>
  </label>
</div>

<style>
  .lockable {
    display: grid;
    gap: 0.5rem;
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
