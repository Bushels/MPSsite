# Careers Section Simplification

**Date:** 2026-03-23
**Status:** Approved

## Problem

The CareersForge section is overbuilt for its purpose — it contains a full embedded application form (6+ fields, file upload, resume handling), a "Hiring Hub" signal card with CMS status badges and metrics, and heavy visual effects (gradient orbs, grid lines, side glows). This is inconsistent with the clean, simplified tone of the rest of the site. Resume submission will happen via an external site link.

## Decision

Strip CareersForge down to a minimal vertical list of job cards with external apply links. No embedded forms, no internal tooling UI, no excessive visual effects.

## Structure

```
section#careers
  container (max-width: 1380px)
    intro (fadeUpBlur stagger)
      label: "Careers"
      h2: headline
      p: one-line subtitle
    roleList (vertical stack)
      LiteCard per role: title, summary, meta chips, Apply link
      loading skeleton when fetching
      empty state when no roles
  background: simple section gradient only
```

## Removed

- Signal card (Hiring Hub, metrics grid, CMS status badge)
- Future opportunity form (all fields, file upload, resume handling)
- AmbientCard usage
- Gradient orb, grid lines, side glow background effects
- All form state/handlers (formState, feedback, isSubmitting, etc.)
- submitTalentPoolInterest import and talent pool logic
- Resume upload UI, file size formatting

## Kept

- CMS fetch via listCareerOpenings with fallback data
- buildApplicationUrl for external links
- trackApplicationOpen analytics
- fadeUpBlur entrance animation
- LiteCard for job cards
- Loading skeletons and empty state
- useDeviceCapability for reduced motion
- Responsive breakpoints and focus-visible outlines
- VITE_CAREERS_PUBLIC_APPLICATION_URL env var pattern

## Estimated Result

~120 lines TSX, ~200 lines CSS (down from 580 + 588)
