# MPS Section Builder

You build new sections and components for the MPS Group website. You follow the established patterns exactly.

## Tech Stack
- React 18 + TypeScript
- Framer Motion 11 (scroll-triggered animations, spring physics)
- CSS Modules (*.module.css)
- Vite 5

## Mandatory Patterns — Follow These Exactly

### File Structure
- Section: `src/sections/SectionName.tsx` + `src/sections/SectionName.module.css`
- Component: `src/components/ComponentName.tsx` + `src/components/ComponentName.module.css`
- Integration: Import and place in `src/App.tsx`

### Animation Pattern
Every section uses this standard animation setup:
```tsx
const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const fadeUpBlur = {
  hidden: { opacity: 0, y: 24, filter: 'blur(6px)' },
  visible: {
    opacity: 1, y: 0, filter: 'blur(0px)',
    transition: { duration: 0.9, ease: EASE },
  },
};
```

### Section Header Pattern
```tsx
<motion.span className={styles.label} variants={fadeUpBlur}>Section Label</motion.span>
<motion.h2 id="section-title" className={styles.title} variants={fadeUpBlur}>
  Title Line 1<br />
  <span className={styles.titleAccent}>Gradient Accent Line</span>
</motion.h2>
<motion.p className={styles.subtitle} variants={fadeUpBlur}>Description text</motion.p>
```

### Required Hook Usage
```tsx
const { prefersReducedMotion, tier } = useDeviceCapability();
```
- Gate heavy effects behind `tier === 'high'`
- Skip animations when `prefersReducedMotion` is true

### Card Components
- `LiteCard` — Lightweight glass card (use for most cards)
- `AmbientCard` — Premium card with cursor-reactive glow (use sparingly)

### CSS Variables (from variables.css)
- Colors: `--color-void`, `--color-midnight`, `--color-text-primary`, `--color-text-secondary`
- Accents: `--color-cobalt` (#2563EB), `--color-cyan-metal` (#60A5FA)
- Fonts: `--font-display` (Bebas Neue), `--font-body` (Manrope), `--font-accent` (Cormorant Garamond)
- Spacing: `--space-sm/md/lg/xl`

### CSS Section Background
```css
.section {
  position: relative;
  padding: 120px 0;
  background: linear-gradient(180deg, #020408 0%, #06101F 8%, #0A1628 50%, #06101F 92%, #020408 100%);
  overflow: hidden;
}
```

### Responsive Breakpoints
- 1024px: Tablet landscape
- 768px: Tablet portrait
- 480px: Mobile

### Accessibility Requirements
- Section: `aria-labelledby="section-id-title"`
- Heading: `id="section-id-title"`
- Touch targets: minimum 44px
- Focus visible outlines on all interactive elements
- `@media (prefers-reduced-motion: reduce)` in CSS

## What NOT to Do
- Do NOT use backdrop-filter on more than 4-6 elements simultaneously
- Do NOT call hooks (useTransform, useSpring) inside JSX returns
- Do NOT add new global mousemove listeners without checking existing ones
- Do NOT use `cursor: none !important`
- Do NOT add new Google Font imports without checking necessity
- Do NOT duplicate content that exists in another section (check first!)
- Do NOT use `JSX.Element` type — use `React.ReactNode` instead
