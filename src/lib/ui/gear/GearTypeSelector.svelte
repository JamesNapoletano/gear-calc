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
    border: 1px solid #e2e8f0;
    background: #ffffff;
    padding: 0.5rem 1.2rem;
    border-radius: 999px;
    cursor: pointer;
    color: #475569;
    font-weight: 600;
  }
  .selector button.active {
    background: #111827;
    color: #ffffff;
    border-color: #111827;
  }
</style>
