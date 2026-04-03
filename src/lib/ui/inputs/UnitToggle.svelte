<script lang="ts">
  import type { LengthUnit } from '../../gear/types'

  export let unit: LengthUnit = 'mm'
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
    background: var(--surface-2);
    border: 1px solid var(--border-1);
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
    color: var(--text-3);
    cursor: pointer;
    transition: background-color 120ms ease, color 120ms ease;
  }
  button:hover {
    color: var(--text-1);
  }
  button.active {
    background: rgba(124, 140, 255, 0.22);
    color: var(--text-1);
  }
</style>
