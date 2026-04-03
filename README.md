# Gear Calc

Gear Calc is a browser-based gear geometry calculator built with **Svelte + Vite**. It supports multiple gear types, unit conversion (`mm`/`in`), editable computed dimensions, and a CAD-style 2D visualizer.

## Features

- Supports **spur, helical, ring (internal), worm, and bevel** gear workflows.
- Calculates common geometry values:
  - pitch, outside, root, and base diameters
  - addendum and dedendum
  - circular pitch
  - ratio and center distance (where applicable)
- **Editable results**: change key computed values and back-solve inputs when possible.
- **Unit toggle** between millimeters and inches.
- **DP mode** (Diametral Pitch) for inch workflows on supported gears.
- Built-in warnings for out-of-range and non-typical input combinations.
- 2D involute-style visualizer with reference circles and drafting-oriented overlays.
- Dark, high-contrast technical UI tuned for extended engineering sessions.

## Tech Stack

- Svelte 5
- Vite 7
- TypeScript (calculation/domain modules)
- Vitest (test runner)

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Install

```bash
npm install
```

### Run locally

```bash
npm run dev
```

Then open the local URL printed by Vite (typically `http://localhost:5173`).

## Available Scripts

- `npm run dev` — start the development server
- `npm run build` — create production build in `dist/`
- `npm run preview` — preview production build locally
- `npm run check` — run Svelte/TypeScript checks
- `npm run test` — run test suite with Vitest

## Project Structure (high-level)

```txt
src/
  App.svelte
  lib/
    gear/
      calc/        # per-gear calculation modules
      config.ts    # gear capability mapping (DP support/module fields)
      editable.ts  # reverse-edit logic from result fields back to inputs
      format.ts    # formatting helpers
      index.ts     # gear registry
      types.ts     # shared input/output contracts
      units.ts     # mm/in conversion and DP conversion
      visualize.ts # outline + reference geometry generators
    ui/
      gear/
      inputs/
      layout/
      panels/
      results/
      visualizer/
```

## Notes

- This is a **client-only app** (no backend, no persistence).
- Calculations are deterministic and run entirely in the browser.
- Bevel outputs include approximation warnings by design.

## Known Limitations / Assumptions

- **Bevel gear math is approximate** (virtual-tooth approach) and intended for quick design iteration, not final manufacturing sign-off.
- **No data persistence**: inputs/results are not saved between refreshes.
- **No CAD export** currently (DXF/STEP/etc. are not generated).
- **No guaranteed standards compliance** is enforced automatically (AGMA/ISO checks are not built in).
- **Testing baseline is minimal** in the current repo (no existing test files at the time of writing).

## Roadmap

- Add unit and integration tests for per-gear calculation modules.
- Add export options for geometry/output data (e.g., CSV/JSON, potential CAD-friendly formats).
- Improve standards guidance with optional AGMA/ISO-oriented validation hints.
- Expand visualizer fidelity for additional gear-specific geometry details.
- Add optional save/share workflows for common gear setups.

For architecture details, see [ARCHITECTURE.md](./ARCHITECTURE.md).
