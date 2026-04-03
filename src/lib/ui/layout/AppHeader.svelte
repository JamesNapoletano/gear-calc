<script lang="ts">
  import UnitToggle from '../inputs/UnitToggle.svelte'
  import type { LengthUnit } from '../../gear/types'

  export let unit: LengthUnit = 'mm'
</script>

<header class="header">
  <div>
    <p class="eyebrow">Gear Calc</p>
    <h1>Gear Measurement Calculator</h1>
    <p class="subtitle">
      Lightweight gear geometry calculator for spur, helical, ring, worm, and bevel gears.
    </p>
  </div>
  <UnitToggle bind:unit />
</header>

<style>
  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    flex-wrap: wrap;
  }
  .eyebrow {
    text-transform: uppercase;
    letter-spacing: 0.2em;
    font-size: 0.7rem;
    color: var(--accent-strong);
    margin: 0 0 0.5rem;
  }
  h1 {
    font-size: 2.4rem;
    margin: 0 0 0.5rem;
    color: var(--text-1);
  }
  .subtitle {
    margin: 0;
    color: var(--text-2);
    max-width: 550px;
  }
</style>
