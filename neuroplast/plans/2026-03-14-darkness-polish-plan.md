# 2026-03-14 — Darkness Polish Plan
#plan

## Objective
Elevate the existing single-page Gear Calc application into a polished dark technical instrument experience while preserving current calculation behavior and workflow structure.

## Context
- Derived from implementation and concept artifacts:
  - [[Gear Workbench - High Level]]
  - [[Gear Workbench - Mid Level]]
  - [[Tech Stack Architecture]]

## Scope
### In Scope
- Dark-first visual theme tokenization across global and component styles.
- Improved contrast hierarchy for readability and visual calm.
- Refined control states (hover/focus/active/disabled) for keyboard and pointer users.
- Numeric readability improvements for engineering outputs.
- Consistent panel/card language and depth treatment.

### Out of Scope
- Adding new pages or routing.
- Changes to calculation formulas/business logic.
- Persistence, export, backend, or authentication features.

## Tasks
1. Introduce global dark design tokens and base surfaces in `src/app.css`.
2. Update layout/panel styles in `src/App.svelte` to adopt tokenized dark presentation.
3. Refine key UI components for dark theme consistency:
   - `src/lib/ui/layout/AppHeader.svelte`
   - `src/lib/ui/gear/GearTypeSelector.svelte`
   - `src/lib/ui/inputs/UnitToggle.svelte`
   - `src/lib/ui/inputs/NumberInput.svelte`
   - `src/lib/ui/inputs/LockableInput.svelte`
   - `src/lib/ui/inputs/ModuleInputControl.svelte`
   - `src/lib/ui/panels/EditableResultsPanel.svelte`
   - `src/lib/ui/results/ResultCard.svelte`
   - `src/lib/ui/visualizer/GearVisualizer.svelte`
4. Run quality checks: `npm run check`, `npm run test`, `npm run build`.
5. Update architecture/concept artifacts if implementation decisions materially changed.
6. Record changelog entry linked to this plan.
7. Capture one reusable learning note from execution.

## Verification Criteria
- App remains functionally equivalent for all existing gear workflows.
- Visual presentation is consistently dark-first across app shell and controls.
- Warnings, derived results, and visualizer remain legible and distinguishable.
- Keyboard focus states are visible on interactive controls.
- All checks pass (`check`, `test`, `build`).

## Links
- Changelog entry: [[2026-03-14]]
