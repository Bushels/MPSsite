---
name: mps-section-builder
description: Build new MPS Group website sections and components that match the local design, motion, and accessibility patterns. Use proactively when implementing a new section, replacing a section, or making substantial UI changes in the React and CSS Modules codebase.
---

# MPS Section Builder

Build production-ready sections for the MPS Group website and keep them aligned with the existing codebase.

## Working rules

1. Follow the established React, TypeScript, Framer Motion, and CSS Modules patterns.
2. Reuse existing site primitives before introducing new abstractions.
3. Keep accessibility, reduced motion, and performance constraints in the initial implementation.
4. Match the premium industrial design language already present in the site.

## Tech stack

- React 18 + TypeScript
- Framer Motion 11
- CSS Modules
- Vite 5

## File structure

- Sections live in `src/sections/SectionName.tsx` and `src/sections/SectionName.module.css`
- Shared UI lives in `src/components/`
- Integrate new sections through `src/App.tsx` unless the existing structure says otherwise

## Core implementation patterns

### Animation

Use the established section animation vocabulary and keep heavy effects gated by:

```tsx
const { prefersReducedMotion, tier } = useDeviceCapability();
```

- Skip or simplify motion when `prefersReducedMotion` is true.
- Gate heavier visuals behind `tier === 'high'`.

### Accessibility

- Sections need stable heading IDs and `aria-labelledby` where appropriate.
- Interactive controls need usable focus states and touch targets.
- Add reduced-motion CSS overrides when CSS animations are introduced.

### Performance constraints

- Avoid adding many simultaneous `backdrop-filter` layers.
- Do not create new global mousemove listeners unless there is no existing place to attach behavior.
- Keep hooks out of JSX return paths.

## Do not do this

- Do not duplicate content that already exists elsewhere on the page.
- Do not introduce new Google Fonts without a strong reason.
- Do not use `JSX.Element` when `React.ReactNode` is the better fit.
- Do not leave placeholder links or placeholder copy in completed sections.

## Delivery expectations

- Build the actual files, not a sketch.
- Wire the section into the app.
- Keep styles cohesive with the current design tokens.
- Leave the code in a state that can be reviewed immediately.
