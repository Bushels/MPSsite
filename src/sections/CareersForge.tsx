import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { LiteCard } from '../components/LiteCard';
import { useDeviceCapability } from '../hooks/useDeviceCapability';
import {
  CareerOpening,
  listCareerOpenings,
} from '../services/careersCms';
import { trackLeadEvent } from '../services/analytics';
import styles from './CareersForge.module.css';

type CareersEnv = ImportMetaEnv & {
  VITE_CAREERS_PUBLIC_APPLICATION_URL?: string;
};

const env = import.meta.env as CareersEnv;
const PUBLIC_APPLICATION_URL =
  env.VITE_CAREERS_PUBLIC_APPLICATION_URL?.trim() || '/apply.html';
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
  const { prefersReducedMotion } = useDeviceCapability();
  const [roles, setRoles] = useState<CareerOpening[]>([]);
  const [isLoadingRoles, setIsLoadingRoles] = useState(true);
  const [loadError, setLoadError] = useState('');

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
            Browse current openings and apply directly. Each role links to a
            dedicated application page.
          </motion.p>
        </motion.div>

        {isLoadingRoles ? (
          <div className={styles.loadingStack} aria-hidden="true">
            <div className={styles.loadingItem} />
            <div className={styles.loadingItem} />
            <div className={styles.loadingItem} />
          </div>
        ) : loadError ? (
          <div className={styles.emptyState}>
            <h3 className={styles.emptyTitle}>Feed unavailable</h3>
            <p className={styles.emptyCopy}>{loadError}</p>
          </div>
        ) : roles.length === 0 ? (
          <div className={styles.emptyState}>
            <h3 className={styles.emptyTitle}>No active postings</h3>
            <p className={styles.emptyCopy}>
              Nothing is publicly posted right now. Check back soon or reach out
              to <a href="mailto:careers@mpsgroup.ca" className={styles.inlineLink}>careers@mpsgroup.ca</a>.
            </p>
          </div>
        ) : (
          <div className={styles.roleList}>
            {roles.map((role) => (
              <LiteCard key={role.id} className={styles.roleCard}>
                <a
                  href={buildApplicationUrl(role)}
                  className={styles.roleLink}
                  onClick={() => trackApplicationOpen(role)}
                >
                  <div className={styles.roleBody}>
                    <span className={styles.roleTitle}>{role.title}</span>
                    <span className={styles.roleSummary}>{role.summary}</span>
                    <div className={styles.roleMetaRow}>
                      <span className={styles.roleMetaChip}>{role.department}</span>
                      <span className={styles.roleMetaChip}>{role.location}</span>
                      <span className={styles.roleMetaChip}>{role.employmentType}</span>
                    </div>
                  </div>
                  <span className={styles.roleCta}>Apply &rarr;</span>
                </a>
              </LiteCard>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
