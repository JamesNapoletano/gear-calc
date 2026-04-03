# 2026-04-02 — Gear Visual Realism Plan
#plan

## Objective
Make the visualizer renderings look like the gear families they represent while preserving the current calculator workflow, deterministic SVG output, and technical readability.

## Context
- Derived from implementation and concept artifacts:
  - [[Gear Workbench - High Level]]
  - [[Gear Workbench - Mid Level]]
  - [[Tech Stack Architecture]]
- User-selected direction for this execution cycle:
  - technical 2.5D visual style
  - all five gear types in first pass
  - clean render by default instead of prominent drafting overlays

## Scope
### In Scope
- Upgrade the visualizer from drafting-first to clean technical 2.5D SVG output.
- Make spur, helical, ring/internal, worm, and bevel renderings visually distinct.
- Refactor visualization geometry generation to support gear-type-specific render layers.
- Reduce or remove drafting overlays from the default presentation.
- Preserve existing input, calculation, and editable-result workflows.

### Out of Scope
- WebGL/3D engine adoption.
- Exact manufacturing-grade tooth modeling.
- Export or persistence features.
- New pages or routing changes.
- Reworking calculator formulas beyond minimal visualization support.

## Tasks
1. Refactor `src/lib/gear/visualize.ts` to produce gear-type-aware render geometry instead of a single generic outline pipeline.
2. Rebuild `src/lib/ui/visualizer/GearVisualizer.svelte` around layered SVG rendering primitives for clean 2.5D presentation.
3. Improve cylindrical gear family visuals:
   - spur reads as a machined external gear
   - helical shows visible helix-driven tooth slant cues
   - ring renders as a correct internal gear with readable rim thickness
4. Replace schematic special-case visuals:
   - worm renders as screw + wheel geometry with lead/start cues
   - bevel renders as a conical/projection-based gear instead of a flat spur-like disc
5. Verify behavior across representative inputs and run project quality checks:
   - `npm run check`
   - `npm run test`
   - `npm run build`
6. Update architecture/concept/changelog/learning artifacts to reflect the new visualizer direction.

## Verification Criteria
- All five gear types are visually distinguishable at a glance.
- Ring, worm, and bevel no longer read as generic or schematic stand-ins.
- Default visualizer presentation is clean-render first, with drafting overlays removed or heavily de-emphasized.
- Visual output remains responsive and stable for common input ranges.
- No regressions in the existing calculation workflow.
- All checks pass (`check`, `test`, `build`).

## Likely Files
- `src/lib/gear/visualize.ts`
- `src/lib/ui/visualizer/GearVisualizer.svelte`
- `ARCHITECTURE.md`
- `neuroplast/project-concept/Gear Workbench - High Level.md`
- `neuroplast/project-concept/Gear Workbench - Mid Level.md`
- `neuroplast/project-concept/changelog/2026-04-02.md`
- `neuroplast/learning/frontend/`

## Links
- Changelog entry: [[2026-04-02]]
- Previous related plan: [[2026-03-14-darkness-polish-plan]]
