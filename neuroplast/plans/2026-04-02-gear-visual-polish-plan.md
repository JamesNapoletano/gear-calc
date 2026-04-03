# 2026-04-02 — Gear Visual Polish Plan
#plan

## Objective
Polish the visualizer further by making the worm wheel read more explicitly as a gear and by improving tooth-valley readability in spur and helical renderings.

## Context
- Follows [[2026-04-02-gear-visual-refinement-plan]].
- User requested another pass focused on:
  - more obviously gear-like worm wheel teeth
  - crisper spur/helical tooth valleys

## Scope
### In Scope
- Increase worm wheel tooth definition in the current side-profile worm view.
- Improve external gear tooth readability using subtle face/valley contrast cues.
- Preserve the clean technical 2.5D style.

### Out of Scope
- New calculator outputs.
- Heavy drafting overlays.
- Full manufacturing tooth modeling.

## Tasks
1. Improve worm wheel tooth treatment in `src/lib/ui/visualizer/GearVisualizer.svelte` so the wheel reads more like a meshing gear.
2. Add subtle tooth-valley readability cues for spur/helical gears without reintroducing heavy outlines.
3. Verify with `npm run check`, `npm run test`, and `npm run build`.
4. Update artifacts and learnings for the polish pass.

## Verification Criteria
- Worm wheel appears gear-like at a glance.
- Spur/helical tooth valleys are easier to distinguish.
- Visualizer remains clean and lightweight.
- All checks pass.

## Links
- Changelog entry: [[2026-04-02]]
- Related plan: [[2026-04-02-gear-visual-refinement-plan]]
