import { useRef } from 'react';
import { motion } from 'framer-motion';
import { useDeviceCapability } from '../hooks/useDeviceCapability';
import { trackLeadEvent } from '../services/analytics';
import styles from './CareersForge.module.css';

const APPLICATION_URL = 'https://mps.cms.work/hiring/apply';
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

export const CareersForge = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const { prefersReducedMotion } = useDeviceCapability();

  return (
    <section
      id="careers"
      ref={sectionRef}
      className={styles.section}
      aria-labelledby="careers-title"
    >
      <div className={styles.container}>
        <motion.div
          className={styles.intro}
          variants={prefersReducedMotion ? undefined : introContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
        >
          <motion.span className={styles.label} variants={prefersReducedMotion ? undefined : fadeUpBlur}>
            Careers
          </motion.span>
          <motion.h2
            id="careers-title"
            className={styles.title}
            variants={prefersReducedMotion ? undefined : fadeUpBlur}
          >
            Build with the crews behind{' '}
            <span className={styles.titleAccent}>
              Western Canada&apos;s hardest work
            </span>
          </motion.h2>
          <motion.p className={styles.subtitle} variants={prefersReducedMotion ? undefined : fadeUpBlur}>
            We&apos;re always looking for skilled tradespeople who take pride in
            their craft. View current openings and apply directly.
          </motion.p>
          <motion.div variants={prefersReducedMotion ? undefined : fadeUpBlur}>
            <a
              href={APPLICATION_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.applyBtn}
              onClick={() =>
                trackLeadEvent('careers_application_open', {
                  cta_location: 'careers_section',
                })
              }
            >
              View Openings &amp; Apply
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M1 13L13 1M13 1H3M13 1V11"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
