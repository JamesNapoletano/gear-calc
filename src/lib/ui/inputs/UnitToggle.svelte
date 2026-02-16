<script>
  export let unit = 'mm'
</script>

<div class="toggle">
  <button
    class:active={unit === 'mm'}
    on:click={() => (unit = 'mm')}
    type="button"
  >
    mm
  </button>
  <button
    class:active={unit === 'in'}
    on:click={() => (unit = 'in')}
    type="button"
  >
    in
  </button>
</div>

<style>
  .toggle {
    display: inline-flex;
    background: #f3f4f6;
    border-radius: 999px;
    padding: 0.25rem;
    gap: 0.25rem;
  }
  button {
    border: none;
    background: transparent;
    padding: 0.35rem 0.9rem;
    border-radius: 999px;
    font-size: 0.85rem;
    color: #6b7280;
    cursor: pointer;
  }
  button.active {
    background: #111827;
    color: #fff;
  }
</style>
