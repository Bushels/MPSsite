import { ChangeEvent, FormEvent, useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { AmbientCard } from '../components/AmbientCard';
import { LiteCard } from '../components/LiteCard';
import { useDeviceCapability } from '../hooks/useDeviceCapability';
import {
  CareerOpening,
  isCareersIntegrationConfigured,
  listCareerOpenings,
  submitTalentPoolInterest,
} from '../services/careersCms';
import { trackLeadEvent } from '../services/analytics';
import styles from './CareersForge.module.css';

type CareersEnv = ImportMetaEnv & {
  VITE_CAREERS_PUBLIC_APPLICATION_URL?: string;
};

const env = import.meta.env as CareersEnv;
const PUBLIC_APPLICATION_URL =
  env.VITE_CAREERS_PUBLIC_APPLICATION_URL?.trim() || '/apply.html';
const FUTURE_APPLICATION_TYPE = 'Future Opportunity';
const FUTURE_FOCUS_OPTIONS = [
  'General expression of interest',
  'Fabrication and welding',
  'Field service and maintenance',
  'Piping and surface facilities',
  'Project support and coordination',
];
const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const introContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12 } },
};

const fadeUpBlur = {
  hidden: { opacity: 0, y: 24, filter: 'blur(6px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.9, ease: EASE },
  },
};

interface FutureFormState {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  careerFocus: string;
  message: string;
  resume: File | null;
}

interface FeedbackState {
  kind: 'success' | 'error';
  text: string;
}

const buildInitialFormState = (): FutureFormState => ({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  careerFocus: FUTURE_FOCUS_OPTIONS[0],
  message: '',
  resume: null,
});

const formatFileSize = (size: number) =>
  size >= 1024 * 1024
    ? `${(size / (1024 * 1024)).toFixed(1)} MB`
    : `${Math.max(1, Math.round(size / 1024))} KB`;

const buildApplicationUrl = (role: CareerOpening) => {
  const fallback = `${PUBLIC_APPLICATION_URL}?roleId=${encodeURIComponent(role.id)}&roleTitle=${encodeURIComponent(role.title)}`;

  if (typeof window === 'undefined') return fallback;

  try {
    const url = new URL(PUBLIC_APPLICATION_URL, window.location.origin);
    url.searchParams.set('roleId', role.id);
    url.searchParams.set('roleTitle', role.title);
    return url.toString();
  } catch {
    return fallback;
  }
};

const trackApplicationOpen = (role: CareerOpening) => {
  trackLeadEvent('careers_application_open', {
    role_id: role.id,
    role_title: role.title,
    department: role.department,
    location: role.location,
    employment_type: role.employmentType,
  });
};

export const CareersForge = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const resumeInputRef = useRef<HTMLInputElement>(null);
  const { prefersReducedMotion, tier } = useDeviceCapability();
  const integrationConfigured = isCareersIntegrationConfigured();
  const [roles, setRoles] = useState<CareerOpening[]>([]);
  const [isLoadingRoles, setIsLoadingRoles] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [formState, setFormState] = useState<FutureFormState>(buildInitialFormState);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });
  const orbY = useTransform(scrollYProgress, [0, 1], [60, -60]);
  const orbScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.92, 1, 0.95]);
  const roleCount = roles.length;
  const disciplineCount = new Set(roles.map((role) => role.department)).size;
  const roleCountLabel = String(roleCount).padStart(2, '0');
  const resumeLabel = formState.resume
    ? `${formState.resume.name} (${formatFileSize(formState.resume.size)})`
    : 'PDF, DOC or DOCX accepted';

  useEffect(() => {
    const controller = new AbortController();

    const loadRoles = async () => {
      setIsLoadingRoles(true);
      setLoadError('');

      try {
        const openings = await listCareerOpenings(controller.signal);
        setRoles(openings);
      } catch (error) {
        if (!controller.signal.aborted) {
          setLoadError(
            error instanceof Error
              ? error.message
              : 'Unable to load career openings right now.',
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingRoles(false);
        }
      }
    };

    void loadRoles();
    return () => controller.abort();
  }, []);

  const handleFieldChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.currentTarget;
    setFeedback(null);
    setFormState((current) => ({ ...current, [name]: value }));
  };

  const handleResumeChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextFile = event.currentTarget.files?.[0] ?? null;
    setFeedback(null);
    setFormState((current) => ({ ...current, resume: nextFile }));
  };

  const clearResume = () => {
    if (resumeInputRef.current) resumeInputRef.current.value = '';
    setFormState((current) => ({ ...current, resume: null }));
  };

  const handleFutureSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedback(null);

    if (!integrationConfigured) {
      setFeedback({
        kind: 'error',
        text:
          'Future-opportunity intake will activate when the secure careers bridge is connected.',
      });
      return;
    }

    if (!formState.resume) {
      setFeedback({
        kind: 'error',
        text: 'Attach a resume before sending your information to the talent pool.',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await submitTalentPoolInterest({
        firstName: formState.firstName,
        lastName: formState.lastName,
        email: formState.email,
        phone: formState.phone,
        cell: '',
        address: '',
        city: '',
        province: '',
        postal: '',
        message: formState.message,
        resume: formState.resume,
        applicationType: FUTURE_APPLICATION_TYPE,
        careerFocus: formState.careerFocus,
      });

      setFeedback({
        kind: 'success',
        text: 'Your information has been added to the future-opportunity intake.',
      });
      setFormState(buildInitialFormState());
      if (resumeInputRef.current) resumeInputRef.current.value = '';
    } catch (error) {
      setFeedback({
        kind: 'error',
        text:
          error instanceof Error
            ? error.message
            : 'Something went wrong while sending your information.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      id="careers"
      ref={sectionRef}
      className={styles.section}
      aria-labelledby="careers-title"
    >
      <div className={styles.background} aria-hidden="true">
        <motion.div
          className={styles.gradientOrb}
          style={prefersReducedMotion ? {} : { y: orbY, scale: orbScale }}
        />
        {tier === 'high' && <div className={styles.gridLines} />}
        <div className={styles.sideGlow} />
      </div>

      <div className={styles.container}>
        <div className={styles.headerRow}>
          <motion.div
            className={styles.intro}
            variants={introContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
          >
            <motion.span className={styles.label} variants={fadeUpBlur}>
              Careers
            </motion.span>
            <motion.h2
              id="careers-title"
              className={styles.title}
              variants={fadeUpBlur}
            >
              Build with the crews behind
              <br />
              <span className={styles.titleAccent}>
                Western Canada&apos;s hardest work
              </span>
            </motion.h2>
            <motion.p className={styles.subtitle} variants={fadeUpBlur}>
              Browse current openings first. If nothing fits today, leave a
              quick introduction and resume so MPS can keep you on file for the
              next opportunity.
            </motion.p>
          </motion.div>

          <motion.div
            variants={fadeUpBlur}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
          >
            <LiteCard className={styles.signalCard}>
              <div className={styles.signalInner}>
                <div className={styles.signalTop}>
                  <div>
                    <p className={styles.signalEyebrow}>Hiring Hub</p>
                    <h3 className={styles.signalTitle}>
                      Start with the live roles, then leave a light touchpoint
                    </h3>
                  </div>
                  <span className={styles.statusBadge} data-live={integrationConfigured}>
                    <span className={styles.statusDot} />
                    {integrationConfigured ? 'CMS Live' : 'CMS Bridge Pending'}
                  </span>
                </div>
                <p className={styles.signalCopy}>
                  Current hiring routes to a separate application page so the
                  homepage stays focused. The future-opportunity card below is
                  only for a simple introduction and resume drop.
                </p>
                <div className={styles.metricsGrid}>
                  <div className={styles.metric}>
                    <span className={styles.metricValue}>{roleCountLabel}</span>
                    <span className={styles.metricLabel}>Active openings</span>
                  </div>
                  <div className={styles.metric}>
                    <span className={styles.metricValue}>01</span>
                    <span className={styles.metricLabel}>Future intake card</span>
                  </div>
                  <div className={styles.metric}>
                    <span className={styles.metricValue}>
                      {String(Math.max(disciplineCount, 1)).padStart(2, '0')}
                    </span>
                    <span className={styles.metricLabel}>Hiring disciplines</span>
                  </div>
                </div>
              </div>
            </LiteCard>
          </motion.div>
        </div>

        <div className={styles.hubStack}>
          <motion.div
            variants={fadeUpBlur}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
          >
            <LiteCard className={styles.openingsCard}>
              <div className={styles.openingsInner}>
                <div className={styles.cardHeader}>
                  <div>
                    <span className={styles.cardKicker}>Current Hiring Focus</span>
                    <h3 className={styles.cardTitle}>Open roles</h3>
                  </div>
                  <p className={styles.headerNote}>
                    Each job opens a dedicated application page with the full
                    intake form.
                  </p>
                </div>

                {isLoadingRoles ? (
                  <div className={styles.loadingStack} aria-hidden="true">
                    <div className={styles.loadingItem} />
                    <div className={styles.loadingItem} />
                    <div className={styles.loadingItem} />
                  </div>
                ) : loadError ? (
                  <div className={styles.emptyState}>
                    <h4 className={styles.emptyTitle}>Feed unavailable</h4>
                    <p className={styles.emptyCopy}>{loadError}</p>
                  </div>
                ) : roles.length === 0 ? (
                  <div className={styles.emptyState}>
                    <h4 className={styles.emptyTitle}>No active postings</h4>
                    <p className={styles.emptyCopy}>
                      Nothing is publicly posted right now. Use the future-opportunity
                      card below to leave your details and resume.
                    </p>
                  </div>
                ) : (
                  <div className={styles.roleList}>
                    {roles.map((role, index) => (
                      <a
                        key={role.id}
                        href={buildApplicationUrl(role)}
                        className={styles.roleLink}
                        onClick={() => trackApplicationOpen(role)}
                      >
                        <span className={styles.roleIndex}>
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <div className={styles.roleBody}>
                          <span className={styles.roleTitle}>{role.title}</span>
                          <span className={styles.roleSummary}>{role.summary}</span>
                          <div className={styles.roleMetaRow}>
                            <span className={styles.roleMetaChip}>{role.department}</span>
                            <span className={styles.roleMetaChip}>{role.location}</span>
                            <span className={styles.roleMetaChip}>{role.employmentType}</span>
                          </div>
                        </div>
                        <span className={styles.roleCta}>Open application</span>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </LiteCard>
          </motion.div>

          <motion.div
            variants={fadeUpBlur}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
          >
            <AmbientCard className={styles.futureCard}>
              <div className={styles.futureInner}>
                <div className={styles.cardHeader}>
                  <div>
                    <span className={styles.cardKicker}>Future Opportunities</span>
                    <h3 className={styles.cardTitle}>Leave a lighter introduction</h3>
                  </div>
                </div>
                <p className={styles.futureCopy}>
                  If the right role is not listed, send a quick intro and your
                  resume. This is only for future follow-up, not a live job application.
                </p>

                <form className={styles.futureForm} onSubmit={handleFutureSubmit}>
                  <div className={styles.formGrid}>
                    <div className={styles.fieldGroup}>
                      <label htmlFor="future-first-name" className={styles.fieldLabel}>
                        First name
                      </label>
                      <input
                        id="future-first-name"
                        name="firstName"
                        className={styles.input}
                        type="text"
                        value={formState.firstName}
                        onChange={handleFieldChange}
                        required
                      />
                    </div>
                    <div className={styles.fieldGroup}>
                      <label htmlFor="future-last-name" className={styles.fieldLabel}>
                        Last name
                      </label>
                      <input
                        id="future-last-name"
                        name="lastName"
                        className={styles.input}
                        type="text"
                        value={formState.lastName}
                        onChange={handleFieldChange}
                        required
                      />
                    </div>
                    <div className={styles.fieldGroup}>
                      <label htmlFor="future-email" className={styles.fieldLabel}>
                        Email
                      </label>
                      <input
                        id="future-email"
                        name="email"
                        className={styles.input}
                        type="email"
                        value={formState.email}
                        onChange={handleFieldChange}
                        required
                      />
                    </div>
                    <div className={styles.fieldGroup}>
                      <label htmlFor="future-phone" className={styles.fieldLabel}>
                        Phone
                      </label>
                      <input
                        id="future-phone"
                        name="phone"
                        className={styles.input}
                        type="tel"
                        value={formState.phone}
                        onChange={handleFieldChange}
                        required
                      />
                    </div>
                    <div className={`${styles.fieldGroup} ${styles.fullSpan}`}>
                      <label htmlFor="future-focus" className={styles.fieldLabel}>
                        Career focus
                      </label>
                      <select
                        id="future-focus"
                        name="careerFocus"
                        className={styles.input}
                        value={formState.careerFocus}
                        onChange={handleFieldChange}
                      >
                        {FUTURE_FOCUS_OPTIONS.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className={`${styles.fieldGroup} ${styles.fullSpan}`}>
                      <span className={styles.fieldLabel}>Resume upload</span>
                      <label htmlFor="future-resume" className={styles.uploadSurface}>
                        <div className={styles.uploadCopy}>
                          <strong className={styles.uploadTitle}>
                            {formState.resume ? 'Resume attached' : 'Upload your resume'}
                          </strong>
                          <span className={styles.uploadText}>{resumeLabel}</span>
                        </div>
                        <span className={styles.uploadAction}>
                          {formState.resume ? 'Replace file' : 'Choose file'}
                        </span>
                      </label>
                      <input
                        ref={resumeInputRef}
                        id="future-resume"
                        className={styles.fileInput}
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleResumeChange}
                      />
                      {formState.resume && (
                        <button
                          type="button"
                          className={styles.clearFileButton}
                          onClick={clearResume}
                        >
                          Remove attached file
                        </button>
                      )}
                    </div>
                    <div className={`${styles.fieldGroup} ${styles.fullSpan}`}>
                      <label htmlFor="future-message" className={styles.fieldLabel}>
                        Short note
                      </label>
                      <textarea
                        id="future-message"
                        name="message"
                        className={styles.textarea}
                        rows={4}
                        value={formState.message}
                        onChange={handleFieldChange}
                        placeholder="Tell MPS the kind of work you want to hear about."
                      />
                    </div>
                  </div>

                  {feedback && (
                    <p className={styles.feedback} data-kind={feedback.kind} aria-live="polite">
                      {feedback.text}
                    </p>
                  )}

                  {!integrationConfigured && (
                    <p className={styles.pendingCopy}>
                      This resume drop will activate when the secure backend bridge is connected.
                    </p>
                  )}

                  <div className={styles.formActions}>
                    <button
                      type="submit"
                      className={styles.submitButton}
                      disabled={isSubmitting || !integrationConfigured}
                    >
                      {isSubmitting ? 'Sending...' : 'Leave My Resume'}
                    </button>
                    <a
                      href="mailto:careers@mpsgroup.ca"
                      className={styles.emailLink}
                      onClick={() =>
                        trackLeadEvent('contact_click', {
                          contact_method: 'email',
                          cta_location: 'careers_future_card',
                          link_text: 'Email careers@mpsgroup.ca',
                        })
                      }
                    >
                      Email careers@mpsgroup.ca
                    </a>
                  </div>
                </form>
              </div>
            </AmbientCard>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
