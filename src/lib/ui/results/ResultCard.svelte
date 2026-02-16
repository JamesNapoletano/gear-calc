<script>
  export let title = ''
  export let items = []
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
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 16px;
    padding: 1.25rem;
    box-shadow: 0 10px 30px rgba(15, 23, 42, 0.05);
  }
  h3 {
    margin: 0 0 1rem;
    font-size: 1rem;
    color: #111827;
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
    color: #6b7280;
    font-size: 0.85rem;
  }
  dd {
    margin: 0;
    font-weight: 600;
    color: #111827;
  }
</style>
