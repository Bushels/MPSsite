import { useState, useEffect, useRef, useCallback, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTalkToUs } from '../context/talkToUs';
import { useDeviceCapability } from '../hooks/useDeviceCapability';
import { companyProfile } from '../data/company';
import { trackLeadEvent } from '../services/analytics';
import styles from './TalkToUsWizard.module.css';

/* ─── Constants ────────────────────────────────────────────── */

const EASE = [0.16, 1, 0.3, 1] as const;

type Step = 'department' | 'contact';

interface Department {
  id: string;
  name: string;
  desc: string;
  redirect?: string;
}

const DEPARTMENTS: Department[] = [
  {
    id: 'services',
    name: 'Surface Facilities',
    desc: 'SAGD plant work, piping, supports',
  },
  {
    id: 'wellfi',
    name: 'WellFi / Downhole Technology',
    desc: 'First MPS downhole product',
    redirect: '/wellfi/',
  },
  {
    id: 'general',
    name: 'General Inquiry',
    desc: 'Purchasing, careers, or other questions',
  },
];

const DEFAULT_DEPARTMENT = DEPARTMENTS[0];

const getDepartmentById = (id: string | undefined) =>
  DEPARTMENTS.find((dept) => dept.id === id) ?? DEFAULT_DEPARTMENT;

/* ─── Department SVG icons (stroke line art, matching site aesthetic) ── */
const svgProps = {
  width: 22,
  height: 22,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

const DeptIcon = ({ id }: { id: string }) => {
  switch (id) {
    case 'services':
      return (
        <svg {...svgProps}>
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
        </svg>
      );
    case 'wellfi':
      return (
        <svg {...svgProps}>
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="16" />
          <line x1="8" y1="12" x2="16" y2="12" />
          <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
        </svg>
      );
    case 'general':
      return (
        <svg {...svgProps}>
          <path d="M4 5h16v11H7l-3 3V5z" />
          <path d="M8 9h8M8 12h5" />
        </svg>
      );
    default:
      return null;
  }
};

/* ─── Animation variants ───────────────────────────────────── */

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.3 } },
};

const panelVariants = {
  hidden: { opacity: 0, y: 60 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 30 },
  },
  exit: { opacity: 0, y: 40, transition: { duration: 0.25, ease: EASE } },
};

const slideLeft = {
  initial: { opacity: 0, x: -30 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.3, ease: EASE } },
  exit: { opacity: 0, x: 30, transition: { duration: 0.2, ease: EASE } },
};

const slideRight = {
  initial: { opacity: 0, x: 30 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.3, ease: EASE } },
  exit: { opacity: 0, x: -30, transition: { duration: 0.2, ease: EASE } },
};

const staggerContainer = {
  animate: {
    transition: { staggerChildren: 0.08, delayChildren: 0.15 },
  },
};

const cardItem = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: EASE } },
};

/* ─── Component ────────────────────────────────────────────── */

export const TalkToUsWizard = () => {
  const { isOpen, options, closeWizard } = useTalkToUs();
  const { prefersReducedMotion } = useDeviceCapability();

  const modalRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  // Determine initial step and message based on context
  const inferredDepartmentId =
    options?.department ??
    (options?.service
      ? (options.service.toLowerCase().includes('wellfi') ? 'wellfi' : 'services')
      : undefined);
  const skipToContact = Boolean(inferredDepartmentId);
  const initialMessage = options?.service ? `Regarding: ${options.service}\n\n` : '';
  const initialDepartment = getDepartmentById(inferredDepartmentId);

  const [step, setStep] = useState<Step>(skipToContact ? 'contact' : 'department');
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [message, setMessage] = useState(initialMessage);
  const [selectedDepartment, setSelectedDepartment] = useState<Department>(initialDepartment);
  const [submitted, setSubmitted] = useState(false);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      triggerRef.current = document.activeElement as HTMLElement;
      setStep(skipToContact ? 'contact' : 'department');
      setName('');
      setCompany('');
      setMessage(initialMessage);
      setSelectedDepartment(initialDepartment);
      setSubmitted(false);
      trackLeadEvent('wizard_open', { source: options?.service ?? 'direct' });
    } else {
      // Return focus on close
      triggerRef.current?.focus();
    }
  }, [isOpen, skipToContact, initialMessage, initialDepartment, options?.service]);

  // Body scroll lock
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

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
        if (document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };

    modal.addEventListener('keydown', onTab);
    return () => modal.removeEventListener('keydown', onTab);
  }, [isOpen, step, submitted]);

  // ESC to close
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeWizard();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, closeWizard]);

  /* ─── Handlers ─────────────────────────────────────────── */

  const handleDeptClick = useCallback(
    (dept: Department) => {
      trackLeadEvent('wizard_department_select', { department: dept.id });
      if (dept.redirect) {
        closeWizard();
        window.location.href = dept.redirect;
      } else {
        setSelectedDepartment(dept);
        setStep('contact');
      }
    },
    [closeWizard]
  );

  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      if (!name.trim() || !message.trim()) return;

      trackLeadEvent('wizard_email_submit', {
        department: selectedDepartment.id,
        has_company: !!company.trim(),
        message_length: message.trim().length,
      });

      const subject = encodeURIComponent(
        `Inquiry from ${name.trim()}${company.trim() ? ` — ${company.trim()}` : ''}`
      );
      const body = encodeURIComponent(`Department: ${selectedDepartment.name}\n\n${message.trim()}`);
      window.location.href = `mailto:${companyProfile.primaryEmail}?subject=${subject}&body=${body}`;

      setSubmitted(true);
    },
    [name, company, message, selectedDepartment]
  );


  /* ─── Render ───────────────────────────────────────────── */

  const motionProps = prefersReducedMotion
    ? { initial: false, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {};

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={styles.backdrop}
          variants={prefersReducedMotion ? undefined : backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={closeWizard}
          aria-hidden="true"
        >
          <motion.div
            ref={modalRef}
            className={styles.panel}
            role="dialog"
            aria-modal="true"
            aria-label="Talk to us"
            variants={prefersReducedMotion ? undefined : panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              className={styles.closeBtn}
              onClick={closeWizard}
              aria-label="Close dialog"
              type="button"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
            </button>

            <AnimatePresence mode="wait">
              {/* ── Step 1: Department Select ── */}
              {step === 'department' && !submitted && (
                <motion.div
                  key="dept"
                  {...(prefersReducedMotion ? motionProps : slideRight)}
                >
                  <p className={styles.stepLabel}>Step 1 of 2</p>
                  <h2 className={styles.title}>How Can We Help?</h2>

                  <motion.div
                    className={styles.deptGrid}
                    variants={prefersReducedMotion ? undefined : staggerContainer}
                    initial="initial"
                    animate="animate"
                  >
                    {DEPARTMENTS.map((dept) => (
                      <motion.button
                        key={dept.id}
                        className={styles.deptCard}
                        variants={prefersReducedMotion ? undefined : cardItem}
                        onClick={() => handleDeptClick(dept)}
                        type="button"
                      >
                        <span className={styles.deptIcon} aria-hidden="true">
                          <DeptIcon id={dept.id} />
                        </span>
                        <div className={styles.deptInfo}>
                          <div className={styles.deptName}>{dept.name}</div>
                          <div className={styles.deptDesc}>{dept.desc}</div>
                        </div>
                        <span className={styles.deptArrow} aria-hidden="true">
                          →
                        </span>
                      </motion.button>
                    ))}
                  </motion.div>
                </motion.div>
              )}

              {/* ── Step 2: Contact Form ── */}
              {step === 'contact' && !submitted && (
                <motion.div
                  key="contact"
                  {...(prefersReducedMotion ? motionProps : slideLeft)}
                >
                  {!skipToContact && (
                    <button
                      className={styles.backBtn}
                      onClick={() => setStep('department')}
                      type="button"
                    >
                      ← Back
                    </button>
                  )}

                  <p className={styles.stepLabel}>
                    {skipToContact ? 'Get in Touch' : 'Step 2 of 2'}
                  </p>
                  <h2 className={styles.title}>{selectedDepartment.name}</h2>

                  <form className={styles.form} onSubmit={handleSubmit} noValidate>
                    <div className={styles.fieldGroup}>
                      <label className={styles.label} htmlFor="wizard-name">
                        Name *
                      </label>
                      <input
                        id="wizard-name"
                        className={styles.input}
                        type="text"
                        placeholder="Your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        autoComplete="name"
                      />
                    </div>

                    <div className={styles.fieldGroup}>
                      <label className={styles.label} htmlFor="wizard-company">
                        Company
                      </label>
                      <input
                        id="wizard-company"
                        className={styles.input}
                        type="text"
                        placeholder="Company name (optional)"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        autoComplete="organization"
                      />
                    </div>

                    <div className={styles.fieldGroup}>
                      <label className={styles.label} htmlFor="wizard-message">
                        Message *
                      </label>
                      <textarea
                        id="wizard-message"
                        className={styles.textarea}
                        placeholder="How can we help?"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        required
                      />
                    </div>

                    <button className={styles.submitBtn} type="submit">
                      Send Email
                    </button>
                  </form>

                </motion.div>
              )}

              {/* ── Success state ── */}
              {submitted && (
                <motion.div
                  key="success"
                  className={styles.successWrap}
                  {...(prefersReducedMotion ? motionProps : slideLeft)}
                >
                  <div className={styles.successIcon} aria-hidden="true">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><path d="M22 4L12 14.01l-3-3" /></svg>
                  </div>
                  <h2 className={styles.successTitle}>Email Client Opened</h2>
                  <p className={styles.successMsg}>
                    Your email app should have opened with the message pre-filled.
                    If it didn&apos;t, you can reach us directly at{' '}
                    <strong>{companyProfile.primaryEmail}</strong>.
                  </p>
                  <button
                    className={styles.successCloseBtn}
                    onClick={closeWizard}
                    type="button"
                  >
                    Close
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
