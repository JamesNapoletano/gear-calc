# Dark Theme Token Migration for Componentized UI
#learning

## Context
When migrating a component-based frontend from light styling to dark styling, direct color swaps create inconsistent contrast and fragmented interaction states.

## Reusable Practice
1. Define global semantic tokens first (`bg`, `surface`, `border`, `text`, `accent`, `warning`).
2. Migrate shell/layout containers before leaf controls.
3. Update focus-visible and focus-within behavior early to avoid inaccessible interim states.
4. Standardize numeric readability in results with tabular monospace figures.
5. Run full validation (`type/check`, `test`, `build`) after style migration, even if behavior logic is untouched.

## Why It Helps
- Prevents piecemeal color drift.
- Keeps contrast relationships stable during iteration.
- Preserves engineering-readability in data-heavy interfaces.

## Related
- [[Tech Stack Architecture]]
- [[Gear Workbench - Mid Level]]
