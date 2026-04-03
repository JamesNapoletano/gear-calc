# Gear Workbench — Mid Level Architecture
#project-concept

## Linked High-Level
[[Gear Workbench - High Level]]

## Purpose
Define the page architecture, interaction model, and quality expectations for the single-page gear engineering workbench, while evolving it toward a polished dark technical experience.

## Primary Audiences
- Mechanical designers validating candidate gear dimensions quickly.
- Makers/hobbyists translating conceptual gear ideas into practical dimensions.
- Engineering students learning relationships between gear parameters.
- CAD workflow users who need quick drafting reference values before model creation.

## Page Information Architecture
- **Header Region**
  - Product identity, short context copy, global unit mode control.
- **Gear Mode Region**
  - Button set for selecting active gear family.
- **Input Region (Left / Top on mobile)**
  - Core numeric inputs (module/DP, tooth counts, gear-specific fields).
  - Advanced coefficient controls and lock states.
- **Results Region (Right / Middle on mobile)**
  - Warning stack for validation guidance.
  - Editable result cards with reversible calculations where supported.
  - Derived values card for ratio/center distance/base circle.
- **Visualization Region**
  - Clean technical 2.5D SVG with gear-family-specific shapes, lighter readable edge treatment, worm side-profile mesh view, and compact dimensional legend.

## Navigation Model
- In-page interaction only (no route transitions).
- Primary flow: select gear type → enter/lock inputs → inspect warnings/results → optionally edit outputs → inspect visualization.
- Responsive flow stacks regions vertically below tablet breakpoints without removing any workflow capability.

## Functional Requirements
- Gear selection swaps to corresponding defaults and calculation logic.
- Unit mode conversion preserves semantic values across mm/in contexts.
- DP input mode is exposed only for eligible gears in inch mode.
- Lockable fields prevent unintended recomputation of constrained dimensions.
- Editable outputs back-solve inputs when model constraints allow.
- Validation warnings update in real time and remain human-readable.
- Visualizer updates deterministically on every valid calculation cycle.

## UX and Visual Behavior
- Adopt a dark-first visual system with high legibility for prolonged use.
- Emphasize numeric hierarchy with mono/tabular figures for measured outputs.
- Use subdued panel contrast and focused accent color for active states only.
- Preserve spacious card rhythm and panel grouping for cognitive chunking.
- Ensure keyboard-first interaction for all editable controls and toggles.
- Keep motion subtle (state transitions under ~150ms, no decorative animation).
- Maintain clear warning severity cues without overpowering the primary workflow.

## Data and Integration Notes
- All calculations run client-side through per-gear calculator modules.
- App state is local and ephemeral (no persistence or backend integration).
- Output formatting relies on shared conversion/format helpers.
- Visualizer consumes normalized result values and selected gear metadata.
- No external API dependencies required for core operation.

## Error and Edge Cases
- Empty/NaN numeric inputs should degrade gracefully (placeholder display, no crashes).
- Unsupported reverse edits should be disabled at control level.
- Invalid ranges (angles, coefficients, tooth counts) trigger explicit warnings.
- Unit toggles during partial/invalid input states should preserve recoverability.
- Bevel approximation caveats must remain visible when relevant.

## Security and Compliance
- No sensitive data collection or user accounts in current scope.
- Maintain dependency hygiene and lockfile integrity for frontend packages.
- Prevent unsafe HTML injection patterns in warning and label rendering.
- Accessibility compliance target: WCAG 2.2 AA contrast and keyboard operability.

## Content Dependencies
- Product framing copy supporting the “dark technical instrument” identity.
- Clear microcopy for lock behavior and DP conversion semantics.
- Warning text style guide for consistent tone and actionability.
- Future onboarding/help copy for non-expert users (optional).

## Relationship to Other Pages
- Current architecture is intentionally single-page.
- Future optional pages (not in current scope): preset library, compare sessions, export center.

## Open Questions
- Should dark mode be the only mode or paired with a light mode toggle?
- Should warning severities be expanded into info/warn/error tiers?
- Is short-lived local persistence (session/local storage) desirable in next phase?
- Should export workflows (JSON/CSV/DXF) be introduced in near-term roadmap?

## Link to Global Tech Stack
[[Tech Stack Architecture]]
