# 2026-04-02 — Gear Visual Refinement Plan
#plan

## Objective
Refine the new technical 2.5D visualizer so gear outlines read lighter and clearer, and replace the current worm rendering with a mechanically recognizable side-profile worm-and-wheel mesh.

## Context
- Follows the broader visual realism work in [[2026-04-02-gear-visual-realism-plan]].
- User feedback from the current implementation:
  - gear outlines feel too thick and reduce tooth readability
  - worm rendering still does not visually resemble a real worm gear set
- Selected worm direction for this pass: side-profile mesh.

## Scope
### In Scope
- Reduce visual weight of non-worm gear renderings.
- Rebalance depth, stroke, and contrast so tooth boundaries are easier to read.
- Replace the worm visual with a side-profile worm and mating wheel layout.
- Preserve the existing clean technical 2.5D style and existing calculator workflow.

### Out of Scope
- Full physical worm-tooth modeling.
- New calculator formulas.
- New UI controls or render-mode toggles.
- WebGL/3D rendering.

## Tasks
1. Tune non-worm gear styling in `src/lib/ui/visualizer/GearVisualizer.svelte`:
   - thinner primary outline
   - subtler back-depth layer
   - lower silhouette heaviness so teeth remain legible
2. Rebuild worm rendering as a side-profile mesh using existing worm result geometry and wheel dimensions.
3. Add or update shared geometry helpers if needed to support the worm side-profile layout cleanly.
4. Verify representative visual cases and run project quality checks:
   - `npm run check`
   - `npm run test`
   - `npm run build`
5. Update architecture/concept/changelog/learning artifacts for the refinement.

## Verification Criteria
- Spur/helical/ring/bevel outlines feel lighter and tooth edges are easier to discern.
- Worm mode clearly reads as a worm screw meshing with a wheel in side profile.
- Existing visualizer behavior remains stable for common inputs.
- All checks pass (`check`, `test`, `build`).

## Links
- Changelog entry: [[2026-04-02]]
- Related plan: [[2026-04-02-gear-visual-realism-plan]]
