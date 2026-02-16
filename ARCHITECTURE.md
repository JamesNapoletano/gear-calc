# Gear Calc - Architecture

## Overview
Gear Calc is a lightweight, client-only Svelte application for calculating
gear geometry across multiple gear types (spur, helical, ring/internal, worm,
and bevel). It provides a simple UI with configurable tooth proportions and a
unit toggle (mm/in). All calculations run in the browser; no backend or
persistent storage is used.

## Goals
- Fast, intuitive, single-page experience
- Deterministic, CAD-friendly outputs
- Clear separation between UI and calculation logic
- Extensible gear type registry

## Technology Stack
- Svelte + Vite (frontend only)
- TypeScript for calculation modules
- Plain CSS for lightweight styling

## Architecture Principles
- **Pure calculations:** Each gear calculator is a pure function with
  deterministic inputs/outputs.
- **Shared formatting:** Unit conversion and output formatting live in shared
  utilities.
- **Configurable proportions:** Addendum/dedendum coefficients are per-gear
  inputs with defaults.
- **Single registry:** Gear types are registered in one place to drive UI and
  calculation mapping.

## Application Layers

### 1) UI Layer
- Components for inputs, unit toggle, and results
- Gear type selector drives dynamic input panels

### 2) Domain Layer
- Shared types for inputs and results
- Gear calculator modules per type
- Validation and warning generation

### 3) Utility Layer
- Unit conversion (mm/in)
- Formatting helpers (precision, labels)

## Key Modules

```
src/
  App.svelte
  lib/
    gear/
      types.ts
      units.ts
      format.ts
      index.ts
      calc/
        spur.ts
        helical.ts
        ring.ts
        worm.ts
        bevel.ts
    ui/
      inputs/
      results/
```

## Data Flow
1. User selects a gear type and edits inputs.
2. Inputs are normalized to mm.
3. Calculator returns results + warnings.
4. Results are formatted and rendered in UI.

## Extensibility
- Add a new gear type by implementing a calculator module and registering it
  in `lib/gear/index.ts`.
- UI auto-renders based on registry schema.
