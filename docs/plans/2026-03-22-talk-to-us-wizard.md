# Talk to Us Wizard — Implementation Plan

> **Status: IMPLEMENTED (2026-03-23).** The current build differs from this plan: Step 2 is form-only (no phone card, no Teams/live chat). Department cards use SVG line-art icons (stroke-based, no fill), not emoji. Pipe Storage redirects to `/storage/`. Phase 1 uses `mailto:` with no phone fallback. See the updated design doc at `docs/plans/2026-03-22-talk-to-us-wizard-design.md` for the current state.

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a 2-step modal wizard that routes "Talk to Us" inquiries to the correct department — Services get an inline contact form, Pipe Storage/Downhole/Automotive redirect to their dedicated pages.

**Architecture:** A React context (`TalkToUsContext`) manages wizard open/close state and optional pre-filled context (e.g. which service triggered it). The wizard component (`TalkToUsWizard`) renders as a modal overlay with AnimatePresence step transitions. Entry points (FluidNav, ServicesPrecision, ContactBeacon) call `openWizard()` from context instead of scrolling to `#contact`.

**Tech Stack:** React 18, TypeScript, Framer Motion 11, CSS Modules, existing design system (LiteCard, MagneticElement, useDeviceCapability, trackLeadEvent)

**Design doc:** `docs/plans/2026-03-22-talk-to-us-wizard-design.md`

---

## Task 1: Create TalkToUsContext

**Files:**
- Create: `src/context/TalkToUsContext.tsx`

**Step 1: Create the context directory and file**

```tsx
// src/context/TalkToUsContext.tsx
import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

export interface WizardOptions {
  /** Pre-select 'services' department and skip step 1 */
  department?: 'services';
  /** Pre-fill service name in message (e.g. "Regarding: Welding") */
  service?: string;
}

interface TalkToUsContextValue {
  isOpen: boolean;
  options: WizardOptions | null;
  openWizard: (opts?: WizardOptions) => void;
  closeWizard: () => void;
}

const TalkToUsContext = createContext<TalkToUsContextValue | null>(null);

export const useTalkToUs = () => {
  const ctx = useContext(TalkToUsContext);
  if (!ctx) throw new Error('useTalkToUs must be inside TalkToUsProvider');
  return ctx;
};

export const TalkToUsProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<WizardOptions | null>(null);

  const openWizard = useCallback((opts?: WizardOptions) => {
    setOptions(opts ?? null);
    setIsOpen(true);
  }, []);

  const closeWizard = useCallback(() => {
    setIsOpen(false);
    setOptions(null);
  }, []);

  return (
    <TalkToUsContext.Provider value={{ isOpen, options, openWizard, closeWizard }}>
      {children}
    </TalkToUsContext.Provider>
  );
};
```

**Step 2: Commit**

```bash
git add src/context/TalkToUsContext.tsx
git commit -m "feat: add TalkToUs context for wizard state management"
```

---

## Task 2: Create TalkToUsWizard Component — Step 1 (Department Picker)

**Files:**
- Create: `src/components/TalkToUsWizard.tsx`
- Create: `src/components/TalkToUsWizard.module.css`

**Step 1: Create the wizard component with step 1 UI**

The wizard is a modal overlay with 4 department cards. Three are redirect links, one advances to step 2.

```tsx
// src/components/TalkToUsWizard.tsx
import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTalkToUs } from '../context/TalkToUsContext';
import { useDeviceCapability } from '../hooks/useDeviceCapability';
import { companyProfile } from '../data/company';
import { trackLeadEvent } from '../services/analytics';
import styles from './TalkToUsWizard.module.css';

type Step = 'department' | 'contact';

interface Department {
  id: string;
  title: string;
  subtitle: string;
  icon: 'services' | 'storage' | 'downhole' | 'automotive';
  action: 'step2' | 'redirect';
  href?: string;
}

const departments: Department[] = [
  {
    id: 'services',
    title: 'Services & Fabrication',
    subtitle: 'Fab, Welding, Pipefitting, Modular, Machining',
    icon: 'services',
    action: 'step2',
  },
  {
    id: 'storage',
    title: 'Pipe Storage',
    subtitle: 'Secured yard, logistics, inventory',
    icon: 'storage',
    action: 'redirect',
    href: '/storage/',
  },
  {
    id: 'downhole',
    title: 'Downhole Tools',
    subtitle: 'Sand control & monitoring solutions',
    icon: 'downhole',
    action: 'redirect',
    href: '/wellfi/',
  },
  {
    id: 'automotive',
    title: 'Automotive',
    subtitle: 'SGI accredited vehicle maintenance',
    icon: 'automotive',
    action: 'redirect',
    href: '/automotive/',
  },
];

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const panelVariants = {
  hidden: { y: 60, opacity: 0, scale: 0.95 },
  visible: {
    y: 0,
    opacity: 1,
    scale: 1,
    transition: { type: 'spring', stiffness: 300, damping: 30 },
  },
  exit: {
    y: 40,
    opacity: 0,
    scale: 0.97,
    transition: { duration: 0.25, ease: EASE },
  },
};

const cardStagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.15 },
  },
};

const cardItem = {
  hidden: { opacity: 0, y: 20, filter: 'blur(4px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.5, ease: EASE },
  },
};

/* ─── Department icon SVGs ─── */
const DeptIcon = ({ type }: { type: Department['icon'] }) => {
  const shared = { width: 28, height: 28, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  switch (type) {
    case 'services':
      return <svg {...shared}><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /></svg>;
    case 'storage':
      return <svg {...shared}><rect x="1" y="3" width="22" height="18" rx="2" /><line x1="1" y1="9" x2="23" y2="9" /><line x1="1" y1="15" x2="23" y2="15" /><line x1="12" y1="3" x2="12" y2="21" /></svg>;
    case 'downhole':
      return <svg {...shared}><circle cx="12" cy="12" r="10" /><line x1="12" y1="2" x2="12" y2="22" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>;
    case 'automotive':
      return <svg {...shared}><path d="M5 17h14v-5l-2-5H7L5 12z" /><circle cx="7.5" cy="17.5" r="1.5" /><circle cx="16.5" cy="17.5" r="1.5" /></svg>;
  }
};

export const TalkToUsWizard = () => {
  const { isOpen, options, closeWizard } = useTalkToUs();
  const { prefersReducedMotion } = useDeviceCapability();
  const modalRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  // Step state — skip to 'contact' if context provides department
  const [step, setStep] = useState<Step>('department');
  const [formData, setFormData] = useState({ name: '', company: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  // Reset on open/close
  useEffect(() => {
    if (isOpen) {
      triggerRef.current = document.activeElement as HTMLElement;
      if (options?.department === 'services') {
        setStep('contact');
        if (options.service) {
          setFormData(prev => ({ ...prev, message: `Regarding: ${options.service}\n\n` }));
        }
      } else {
        setStep('department');
      }
      setSubmitted(false);
      trackLeadEvent('wizard_open', { source: options?.service ?? 'direct' });
    }
  }, [isOpen, options]);

  // Close on ESC
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeWizard();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, closeWizard]);

  // Focus trap
  useEffect(() => {
    if (!isOpen || !modalRef.current) return;
    const modal = modalRef.current;
    const focusable = modal.querySelectorAll<HTMLElement>(
      'button, a[href], input, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    first?.focus();

    const onTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last?.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first?.focus(); }
      }
    };
    modal.addEventListener('keydown', onTab);
    return () => modal.removeEventListener('keydown', onTab);
  }, [isOpen, step, submitted]);

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      // Return focus
      triggerRef.current?.focus();
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleDeptClick = useCallback((dept: Department) => {
    trackLeadEvent('wizard_department_select', { department: dept.id });
    if (dept.action === 'redirect' && dept.href) {
      closeWizard();
      window.location.href = dept.href;
    } else {
      setStep('contact');
    }
  }, [closeWizard]);

  const handleSubmitEmail = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    trackLeadEvent('wizard_email_submit', {
      has_company: !!formData.company,
      message_length: formData.message.length,
    });
    // Phase 1: mailto fallback. Phase 2: Wix createSubmission()
    const subject = encodeURIComponent('MPS Services Inquiry');
    const body = encodeURIComponent(
      `Name: ${formData.name}\nCompany: ${formData.company}\n\n${formData.message}`
    );
    window.location.href = `mailto:${companyProfile.primaryEmail}?subject=${subject}&body=${body}`;
    setSubmitted(true);
  }, [formData]);

  const handleBack = useCallback(() => {
    setStep('department');
    setFormData({ name: '', company: '', message: '' });
    setSubmitted(false);
  }, []);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={styles.backdrop}
          variants={prefersReducedMotion ? undefined : backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ duration: 0.3 }}
          onClick={closeWizard}
        >
          <motion.div
            ref={modalRef}
            className={styles.panel}
            variants={prefersReducedMotion ? undefined : panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={e => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="wizard-title"
          >
            {/* Close button */}
            <button className={styles.closeBtn} onClick={closeWizard} aria-label="Close">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>

            <AnimatePresence mode="wait">
              {step === 'department' && (
                <motion.div
                  key="step-dept"
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.3, ease: EASE }}
                  className={styles.stepContent}
                >
                  <span className={styles.label}>Talk to Us</span>
                  <h2 id="wizard-title" className={styles.title}>
                    What can we help with?
                  </h2>

                  <motion.div
                    className={styles.deptGrid}
                    variants={cardStagger}
                    initial="hidden"
                    animate="visible"
                  >
                    {departments.map(dept => (
                      <motion.button
                        key={dept.id}
                        className={styles.deptCard}
                        variants={cardItem}
                        onClick={() => handleDeptClick(dept)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className={styles.deptIcon}>
                          <DeptIcon type={dept.icon} />
                        </div>
                        <div className={styles.deptText}>
                          <span className={styles.deptTitle}>{dept.title}</span>
                          <span className={styles.deptSub}>{dept.subtitle}</span>
                        </div>
                        <svg className={styles.deptArrow} width="14" height="14" viewBox="0 0 14 14" fill="none">
                          <path d="M1 13L13 1M13 1H3M13 1V11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </motion.button>
                    ))}
                  </motion.div>
                </motion.div>
              )}

              {step === 'contact' && !submitted && (
                <motion.div
                  key="step-contact"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 30 }}
                  transition={{ duration: 0.3, ease: EASE }}
                  className={styles.stepContent}
                >
                  <button className={styles.backBtn} onClick={handleBack} aria-label="Back to departments">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M13 7H1M1 7l5-5M1 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span>Back</span>
                  </button>

                  <span className={styles.label}>Services & Fabrication</span>
                  <h2 id="wizard-title" className={styles.title}>
                    How would you like to connect?
                  </h2>

                  <div className={styles.contactOptions}>
                    {/* Email Form */}
                    <div className={styles.contactCard}>
                      <div className={styles.contactCardHeader}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <rect x="2" y="4" width="20" height="16" rx="3" />
                          <path d="M22 7l-10 6L2 7" strokeLinecap="round" />
                        </svg>
                        <span>Send a Message</span>
                      </div>
                      <form onSubmit={handleSubmitEmail} className={styles.form}>
                        <input
                          type="text"
                          placeholder="Your name *"
                          required
                          value={formData.name}
                          onChange={e => setFormData(d => ({ ...d, name: e.target.value }))}
                          className={styles.input}
                        />
                        <input
                          type="text"
                          placeholder="Company (optional)"
                          value={formData.company}
                          onChange={e => setFormData(d => ({ ...d, company: e.target.value }))}
                          className={styles.input}
                        />
                        <textarea
                          placeholder="Brief message *"
                          required
                          rows={3}
                          value={formData.message}
                          onChange={e => setFormData(d => ({ ...d, message: e.target.value }))}
                          className={styles.textarea}
                        />
                        <button type="submit" className={styles.submitBtn}>
                          <span>Send</span>
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <path d="M1 13L13 1M13 1H3M13 1V11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                      </form>
                    </div>

                    {/* Phone */}
                    <a href={companyProfile.primaryPhoneHref} className={styles.phoneCard} onClick={() => trackLeadEvent('wizard_phone_click')}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <div className={styles.phoneMeta}>
                        <span className={styles.phoneLabel}>Call Us</span>
                        <span className={styles.phoneNumber}>{companyProfile.primaryPhoneDisplay}</span>
                      </div>
                    </a>
                  </div>
                </motion.div>
              )}

              {step === 'contact' && submitted && (
                <motion.div
                  key="step-success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, ease: EASE }}
                  className={styles.successContent}
                >
                  <div className={styles.successIcon}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M22 11.08V12a10 10 0 11-5.93-9.14" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M22 4L12 14.01l-3-3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <h3 className={styles.successTitle}>Message Sent</h3>
                  <p className={styles.successSub}>We typically respond within one business day.</p>
                  <button className={styles.successBtn} onClick={closeWizard}>Done</button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
```

**Step 2: Create the CSS Module**

Reference variables from `src/styles/variables.css`. Dark glass aesthetic, consistent with existing modals. Key CSS considerations:
- `--z-overlay: 1000` for the backdrop
- `--color-surface-glass` for card backgrounds
- `--color-border-chrome` for borders
- `--radius-card: 16px`
- `--font-body: 'Manrope'` for form text, `--font-display: 'Bebas Neue'` for the title
- Mobile: full-width panel. Desktop: max-width ~520px, centered
- No `backdrop-filter` on the panel (GPU performance — lesson from MEMORY.md)
- Use solid dark backgrounds with slight transparency instead

The CSS file should define these classes:
`.backdrop` `.panel` `.closeBtn` `.stepContent` `.label` `.title` `.deptGrid` `.deptCard` `.deptIcon` `.deptText` `.deptTitle` `.deptSub` `.deptArrow` `.backBtn` `.contactOptions` `.contactCard` `.contactCardHeader` `.form` `.input` `.textarea` `.submitBtn` `.phoneCard` `.phoneMeta` `.phoneLabel` `.phoneNumber` `.successContent` `.successIcon` `.successTitle` `.successSub` `.successBtn`

**Step 3: Commit**

```bash
git add src/components/TalkToUsWizard.tsx src/components/TalkToUsWizard.module.css
git commit -m "feat: add TalkToUsWizard component with department routing and contact form"
```

---

## Task 3: Wire Provider into App and Render Wizard

**Files:**
- Modify: `src/App.tsx`

**Step 1: Add TalkToUsProvider and TalkToUsWizard to App**

Wrap the entire app in `TalkToUsProvider`. Render `TalkToUsWizard` inside the provider (it self-manages visibility via context).

Changes to `src/App.tsx`:
- Import `TalkToUsProvider` from `../context/TalkToUsContext`
- Import `TalkToUsWizard` from `../components/TalkToUsWizard`
- Wrap `<CustomCursor>` children in `<TalkToUsProvider>`
- Add `<TalkToUsWizard />` just before the closing `</TalkToUsProvider>`

The structure becomes:
```tsx
<CustomCursor>
  <TalkToUsProvider>
    <div className={styles.container}>
      ...existing sections...
    </div>
    <TalkToUsWizard />
  </TalkToUsProvider>
</CustomCursor>
```

**Step 2: Commit**

```bash
git add src/App.tsx
git commit -m "feat: wire TalkToUsProvider and wizard into App"
```

---

## Task 4: Wire FluidNav "Let's Talk" Button

**Files:**
- Modify: `src/components/FluidNav.tsx` (lines 114-137)

**Step 1: Update Let's Talk button**

Change the `<a href="#contact">` at line 115 to a `<button>` that calls `openWizard()`.

- Import `useTalkToUs` from the context
- Call `const { openWizard } = useTalkToUs()` inside the component
- Replace lines 114-137: change `<a href="#contact" className={styles.contactBtn}>` to `<button type="button" className={styles.contactBtn} onClick={openWizard}>`
- Remove the wrapping `<MagneticElement>` is fine to keep — it works with buttons too
- Also update the mobile nav: the "Contact" item at line 13 (`{ label: 'Contact', href: '#contact' }`) should open the wizard on click instead of navigating. Change it to trigger `openWizard()` via `onClick` and `e.preventDefault()`.

**Step 2: Verify the wizard opens when clicking "Let's Talk"**

Test in browser: click "Let's Talk" → wizard modal should appear with 4 department cards.

**Step 3: Commit**

```bash
git add src/components/FluidNav.tsx
git commit -m "feat: wire Let's Talk button to TalkToUs wizard"
```

---

## Task 5: Wire ServicesPrecision "Request a Quote"

**Files:**
- Modify: `src/sections/ServicesPrecision.tsx` (lines 206-213, 351-360)

**Step 1: Update Request a Quote link**

The "Request a Quote" link at line 351 currently does `href="#contact"` with an onClick that calls `handleQuoteRequestClick`. Change it to open the wizard with the service pre-selected.

- Import `useTalkToUs` from context
- Call `const { openWizard } = useTalkToUs()` inside the component
- In `handleQuoteRequestClick` (line 206), instead of `closeModal()` at the end, call:
  ```tsx
  closeModal();
  openWizard({ department: 'services', service: service.title });
  ```
- Change the `<a href="#contact">` at line 351 to a `<button type="button">` (remove the href, keep the className and onClick)

**Step 2: Verify**

Test: click a service tile → modal opens → click "Request a Quote" → service modal closes → wizard opens at step 2 with "Regarding: [Service Name]" pre-filled.

**Step 3: Commit**

```bash
git add src/sections/ServicesPrecision.tsx
git commit -m "feat: wire Request a Quote to TalkToUs wizard with service context"
```

---

## Task 6: Wire ContactBeacon "Send Message"

**Files:**
- Modify: `src/sections/ContactBeacon.tsx` (lines 400-418)

**Step 1: Update Send Message button**

The "Send Message" link at line 401 currently does `href={companyProfile.primaryEmailHref}`. Change to open wizard.

- Import `useTalkToUs` from context
- Call `const { openWizard } = useTalkToUs()` inside the component
- Change lines 400-418: replace the `<a>` with a `<button type="button">` that calls `openWizard()`
- Keep the analytics tracking onClick
- Keep the envelope SVG icon and "Send Message" label

**Step 2: Verify**

Test: scroll to contact section → click "Send Message" → wizard opens.

**Step 3: Commit**

```bash
git add src/sections/ContactBeacon.tsx
git commit -m "feat: wire ContactBeacon Send Message to TalkToUs wizard"
```

---

## Task 7: Style the Wizard CSS Module

**Files:**
- Modify: `src/components/TalkToUsWizard.module.css`

**Step 1: Write comprehensive styles**

Key design requirements (reference `src/styles/variables.css`):
- **Backdrop:** `position: fixed; inset: 0; z-index: var(--z-overlay); background: rgba(0, 0, 0, 0.7);` — NO backdrop-filter (GPU killer per MEMORY.md)
- **Panel:** solid dark bg `rgba(8, 15, 35, 0.98)` with `border: 1px solid var(--color-border-chrome)`, `border-radius: var(--radius-card)`, max-width 520px centered
- **Department cards:** `var(--color-surface-glass)` bg, 1px chrome border, hover glow using `box-shadow: var(--shadow-glow)`, `border-color: var(--color-border-glow)` on hover
- **Form inputs:** dark bg, chrome border, focus glow ring, `font-family: var(--font-body)`
- **Title:** `font-family: var(--font-display); text-transform: uppercase; letter-spacing: 0.05em`
- **Label:** `font-family: var(--font-body); text-transform: uppercase; font-size: 0.75rem; letter-spacing: 0.15em; color: var(--color-cyan-metal)`
- **Submit button:** solid cobalt bg `var(--color-cobalt)`, white text, hover brighten
- **Mobile (max-width 768px):** panel goes full-width, bottom-anchored, border-radius top only
- **Phone card:** horizontal layout, icon + text, subtle border, hover glow
- **Success state:** centered content, checkmark icon in cyan-metal

**Step 2: Verify visual quality**

Check in browser at desktop and mobile widths. Verify:
- Cards have proper spacing and hover effects
- Form inputs are usable and visible against dark bg
- Mobile layout fills properly
- Transitions between steps are smooth
- Success state displays correctly after form submit

**Step 3: Commit**

```bash
git add src/components/TalkToUsWizard.module.css
git commit -m "style: polish TalkToUsWizard with dark glass aesthetic"
```

---

## Task 8: Final Integration Test & Polish

**Files:**
- All files from above

**Step 1: End-to-end testing**

Test every entry point:
1. **FluidNav "Let's Talk"** → wizard opens at step 1 → pick Services → step 2 shows form + phone
2. **FluidNav "Let's Talk"** → wizard opens → pick Automotive → redirects to `/automotive/`
3. **FluidNav "Let's Talk"** → wizard opens → pick Downhole → redirects to `/wellfi/`
4. **FluidNav "Let's Talk"** → wizard opens → pick Pipe Storage → redirects to `/storage/`
5. **ServicesPrecision "Request a Quote"** → wizard opens at step 2 with service pre-filled
6. **ContactBeacon "Send Message"** → wizard opens at step 1
7. **ESC key** → wizard closes
8. **Backdrop click** → wizard closes
9. **Tab key** → focus stays trapped in modal
10. **Mobile** → panel fills screen, all interactions work

**Step 2: Check analytics**

Verify these events fire (check browser console for gtag calls):
- `wizard_open` with source
- `wizard_department_select` with department
- `wizard_email_submit` with metadata
- `wizard_phone_click`

**Step 3: Final commit**

```bash
git add -A
git commit -m "feat: complete Talk to Us wizard with routing, form, and analytics"
```
