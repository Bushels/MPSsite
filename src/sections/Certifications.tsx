import { type ReactElement } from 'react';
import { motion } from 'framer-motion';
import { LiteCard } from '../components/LiteCard';
import { useDeviceCapability } from '../hooks/useDeviceCapability';
import styles from './Certifications.module.css';

/* ═══════════════════════════════════════════════
   CERTIFICATIONS — Safety & Compliance

   Showcases MPS Group's industry certifications
   with inline SVG shield/badge icons per cert.
   Sits between ElectromagneticStats and AboutMPS.
   ═══════════════════════════════════════════════ */

/* ─── Data ─── */

interface CertData {
  id: string;
  name: string;
  fullName: string;
  description: string;
  icon: JSX.Element;
}

const CERTS: CertData[] = [
  {
    id: 'isn',
    name: 'ISN',
    fullName: 'ISNetworld',
    description:
      'Contractor safety management and compliance verification. Global standard for contractor risk management.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none">
        <path
          d="M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
        <path d="M12 9v0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'acsa',
    name: 'ACSA',
    fullName: 'Alberta Construction Safety Association',
    description:
      'COR (Certificate of Recognition) holder. Highest safety standard in Alberta\'s construction industry.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none">
        <path
          d="M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M9 12l2 2 4-4"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    id: 'complyworks',
    name: 'ComplyWorks',
    fullName: 'Compliance & Risk Management',
    description:
      'Third-party compliance and risk management platform. Ensures regulatory and safety compliance.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none">
        <path
          d="M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M8 12h8M8 9h8M8 15h5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    id: 'canqual',
    name: 'CanQual',
    fullName: 'CanQual Network',
    description:
      'Pre-qualification and safety compliance platform. Verification of contractor capabilities.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none">
        <path
          d="M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12 8l1.5 3 3.5.5-2.5 2.4.6 3.5-3.1-1.6-3.1 1.6.6-3.5L7 11.5l3.5-.5L12 8z"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
];

/* ─── Animation Variants ─── */

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const fadeUpBlur = {
  hidden: { opacity: 0, y: 24, filter: 'blur(6px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.9, ease: EASE },
  },
};

const cardStagger = {
  hidden: { opacity: 0, y: 24, filter: 'blur(6px)' },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.9,
      ease: EASE,
      delay: 0.15 + i * 0.12,
    },
  }),
};

/* ═══════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════ */

export const Certifications = (): ReactElement => {
  const { prefersReducedMotion } = useDeviceCapability();

  return (
    <section id="certifications" className={styles.section}>
      {/* Background atmosphere */}
      <div className={styles.bgGlow} />
      <div className={styles.bgGrid} />

      <div className={styles.container}>
        {/* ─── Header ─── */}
        <div className={styles.header}>
          <motion.span
            className={styles.label}
            variants={fadeUpBlur}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
          >
            Safety &amp; Compliance
          </motion.span>

          <motion.h2
            className={styles.title}
            variants={fadeUpBlur}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
          >
            Certified to the{' '}
            <span className={styles.titleAccent}>Highest Standards</span>
          </motion.h2>

          <motion.p
            className={styles.subtitle}
            variants={fadeUpBlur}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
          >
            Every project operates under rigorous safety and quality frameworks,
            verified by the industry&apos;s leading compliance platforms.
          </motion.p>
        </div>

        {/* ─── Certification Cards ─── */}
        <div className={styles.certGrid}>
          {CERTS.map((cert, i) => (
            <motion.div
              key={cert.id}
              variants={prefersReducedMotion ? undefined : cardStagger}
              custom={i}
              initial={prefersReducedMotion ? undefined : 'hidden'}
              whileInView={prefersReducedMotion ? undefined : 'visible'}
              viewport={{ once: true, margin: '-40px' }}
            >
              <LiteCard>
                <div
                  className={styles.certCardInner}
                  role="article"
                  aria-label={`${cert.name} — ${cert.fullName}`}
                  tabIndex={0}
                >
                  <div className={styles.shieldWrapper}>
                    <div className={styles.shieldIcon}>{cert.icon}</div>
                  </div>
                  <div className={styles.certMeta}>
                    <h3 className={styles.certName}>{cert.name}</h3>
                    <span className={styles.certFullName}>{cert.fullName}</span>
                    <p className={styles.certDescription}>{cert.description}</p>
                  </div>
                </div>
              </LiteCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
