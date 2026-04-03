<script lang="ts">
  import type { GearType } from '../../gear/types'

  type GearOption = {
    key: GearType
    label: string
  }

  export let gears: GearOption[] = []
  export let selectedKey: GearType
  export let onSelect: (key: GearType) => void
</script>

<section class="selector">
  {#each gears as gear}
    <button
      type="button"
      class:active={gear.key === selectedKey}
      on:click={() => onSelect(gear.key)}
    >
      {gear.label}
    </button>
  {/each}
</section>

<style>
  .selector {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
  }
  .selector button {
    border: 1px solid var(--border-1);
    background: var(--surface-1);
    padding: 0.5rem 1.2rem;
    border-radius: 999px;
    cursor: pointer;
    color: var(--text-2);
    font-weight: 600;
    transition: border-color 120ms ease, color 120ms ease, background-color 120ms ease;
  }
  .selector button:hover {
    border-color: var(--border-2);
    color: var(--text-1);
  }
  .selector button.active {
    background: rgba(124, 140, 255, 0.2);
    color: var(--text-1);
    border-color: var(--accent);
  }
</style>
