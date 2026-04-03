<script lang="ts">
  export let title = ''
  export let items: Array<{ label: string; value: string }> = []
</script>

<section class="card">
  <h3>{title}</h3>
  <dl>
    {#each items as item}
      <div class="row">
        <dt>{item.label}</dt>
        <dd>{item.value}</dd>
      </div>
    {/each}
  </dl>
</section>

<style>
  .card {
    background: var(--surface-2);
    border: 1px solid var(--border-1);
    border-radius: var(--radius-md);
    padding: 1.25rem;
    box-shadow: 0 12px 24px rgba(2, 6, 23, 0.25);
  }
  h3 {
    margin: 0 0 1rem;
    font-size: 1rem;
    color: var(--text-1);
  }
  dl {
    margin: 0;
    display: grid;
    gap: 0.75rem;
  }
  .row {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
  }
  dt {
    color: var(--text-2);
    font-size: 0.85rem;
  }
  dd {
    margin: 0;
    font-weight: 600;
    color: var(--text-1);
    font-variant-numeric: tabular-nums;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
  }
</style>
