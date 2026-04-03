# Gear Visualizer 2.5D Rendering Direction
#learning

## Context
When a technical visualizer uses one generic geometry style for multiple mechanical families, the output may be mathematically adjacent but visually misleading.

## Reusable Practice
1. Separate shared geometry helpers from gear-family-specific render treatments.
2. Fix correctness issues in the most obviously wrong family first (for this repo: ring/internal gears).
3. Default to a clean render and add technical overlays back only when they help interpretation.
4. Use lightweight 2.5D depth cues to differentiate families before reaching for heavier rendering tech.
5. Add at least one deterministic SVG contract test whenever visualization logic is refactored.
6. When layered depth reduces readability, reduce rear-layer opacity/stroke before reducing tooth detail.
7. For worm gears, a side-profile worm-and-wheel relationship is more recognizable than decorative thread lines on a centered cylinder.
8. Tooth readability cues work best near the rim/tooth annulus; long face-spanning marks quickly read as spokes or striping instead of tooth structure.

## Why It Helps
- Makes different gear families recognizable at a glance.
- Reduces false confidence caused by one-size-fits-all silhouettes.
- Keeps the visualizer lightweight while still improving realism.

## Related
- [[Tech Stack Architecture]]
- [[Gear Workbench - Mid Level]]
- [[Dark Theme Token Migration for Componentized UI]]
