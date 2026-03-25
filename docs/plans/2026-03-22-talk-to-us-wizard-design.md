# Talk to Us — Contact Routing Wizard

## Summary

A 2-step modal wizard that routes "Talk to Us" inquiries to the correct department. Services get an inline contact form; Pipe Storage, Downhole Tools, and Automotive redirect to their dedicated pages.

## Routing

| Card | Covers | Action |
|------|--------|--------|
| **Services** | Fabrication, Pipefitting, Welding, Modular, Machining | Step 2: contact form |
| **Pipe Storage** | Secured yard, logistics, inventory | Redirect to `/storage/` |
| **Downhole Tools** | Sand control, monitoring, wellbore tech | Redirect to `/wellfi/` |
| **Automotive** | SGI vehicle maintenance | Redirect to `/automotive/` |

4 department cards total, 3 are redirects, 1 advances to step 2.

## User Flow

### Step 1: "What can we help with?"

Four cards in the modal. Each card uses an SVG line-art icon (stroke-based, no fill). Clicking Pipe Storage, Downhole, or Automotive immediately navigates to their landing pages. Clicking Services advances to step 2.

### Step 2: Contact Form (Services)

Form-only — no phone card, no Teams, no live chat divider. Fields:

- Name (required)
- Company (optional)
- Brief message (required)
- Submit button

**Phase 1 (current):** Submit builds a `mailto:` link with pre-filled subject and body, then opens the user's mail client. No phone fallback.

**Phase 2 (after Wix Business upgrade):** `createSubmission()` to Wix Forms, which flows into Wix CRM. Set up Wix Automation for email notifications on submission.

### Success State

After submit, a success screen shows an SVG checkmark icon and expected response time. "Done" button closes the wizard.

### Context Pass-Through

When triggered from a service modal's "Request a Quote" button, the wizard pre-selects "Services" and pre-fills the service name in the message (e.g., "Regarding: Welding"). Skips step 1.

## Entry Points

All of these open the wizard modal:

- `FluidNav.tsx` — "Let's Talk" button
- `ServicesPrecision.tsx` — "Request a Quote" in service modals
- `ContactBeacon.tsx` — "Send Message" button
- Future: Hero CTA

## Technical Design

### Files
- `src/components/TalkToUsWizard.tsx` — modal wizard component
- `src/components/TalkToUsWizard.module.css` — styles
- `src/context/TalkToUsContext.tsx` — shared state for opening wizard with pre-filled context

### Modified Files
- `FluidNav.tsx` — "Let's Talk" opens wizard
- `ServicesPrecision.tsx` — "Request a Quote" opens wizard with service context
- `ContactBeacon.tsx` — "Send Message" opens wizard

### Component Architecture

```
<TalkToUsProvider>        <- context provider (wraps App)
  <TalkToUsWizard />      <- the modal itself
</TalkToUsProvider>

// Any component can open it:
const { openWizard } = useTalkToUs();
openWizard();                          // step 1
openWizard({ department: 'services', service: 'Welding' }); // skip to step 2
```

### Icons

All icons are inline SVGs with stroke-based rendering (no fill). This includes:
- Department card icons (wrench, grid, globe, car)
- Close button (X)
- Back arrow
- Submit arrow
- Success checkmark

### Patterns Followed
- AnimatePresence step transitions (like BookingWizard)
- Focus trap + ESC close (like ServicesPrecision modal, lines 165-188)
- fadeUpBlur entrance animation
- CSS Modules, dark glass aesthetic (solid dark bg, no backdrop-filter)
- `useDeviceCapability()` for reduced motion

## Live Chat Decision

Teams deep links were evaluated but dropped in favor of form-only contact for headless simplicity. Wix AI Chat (Wix Chat) is confirmed Editor-only and not available in a headless deployment. If live chat is revisited, it would need a third-party widget (Slack bridge via Social Intents, Chatlio, or ClearFeed).

## Design Notes
- Modal slides up from bottom (mobile) or center (desktop)
- Dark glass cards with hover glow, consistent with service tiles
- Step transitions animate horizontally (slide left/right)
- Back button on step 2 to return to step 1
- Mobile: full-screen takeover. Desktop: centered modal with backdrop
