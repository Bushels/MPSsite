import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { LiteCard } from '../components/LiteCard';
import { MagneticElement } from '../components/MagneticElement';
import { useDeviceCapability } from '../hooks/useDeviceCapability';
import styles from './CareersForge.module.css';

/* ═══════════════════════════════════════════════════════════════
   CAREERS — Minimal Hiring CTA

   A concise, confident section: brief headline, key benefits,
   and a single CTA button linking to external application page.
   ═══════════════════════════════════════════════════════════════ */

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const introContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.14 },
  },
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

/* Placeholder — replace with actual external hiring page URL */
const HIRING_URL = '#careers';

export const CareersForge = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const { prefersReducedMotion } = useDeviceCapability();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });
  const orbY = useTransform(scrollYProgress, [0, 1], [60, -60]);

  return (
    <section
      id="careers"
      ref={sectionRef}
      className={styles.section}
      aria-labelledby="careers-title"
    >
      {/* Background */}
      <div className={styles.background}>
        <motion.div
          className={styles.gradientOrb}
          style={prefersReducedMotion ? {} : { y: orbY }}
        />
      </div>

      <div className={styles.container}>
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
            Build Your Future
            <br />
            <span className={styles.titleAccent}>With MPS Group</span>
          </motion.h2>

          <motion.p className={styles.subtitle} variants={fadeUpBlur}>
            Premium pay, full benefits, and the chance to work on
            Western Canada&apos;s most demanding energy infrastructure projects.
          </motion.p>
        </motion.div>

        {/* CTA Card */}
        <motion.div
          className={styles.ctaCard}
          variants={fadeUpBlur}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
        >
          <LiteCard className={styles.ctaCardInner}>
            <div className={styles.ctaBadge}>
              <span className={styles.ctaBadgeDot} />
              <span>Now Hiring</span>
            </div>

            <div className={styles.perks}>
              <div className={styles.perk}>
                <span className={styles.perkValue}>Top-Tier</span>
                <span className={styles.perkLabel}>Compensation</span>
              </div>
              <div className={styles.perkDivider} />
              <div className={styles.perk}>
                <span className={styles.perkValue}>Full</span>
                <span className={styles.perkLabel}>Benefits Package</span>
              </div>
              <div className={styles.perkDivider} />
              <div className={styles.perk}>
                <span className={styles.perkValue}>Continuous</span>
                <span className={styles.perkLabel}>Training & Growth</span>
              </div>
            </div>

            <MagneticElement strength={0.35}>
              <a
                href={HIRING_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.applyBtn}
              >
                <span className={styles.applyBtnText}>View Open Positions</span>
                <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
                  <path d="M7 17L17 7M17 7H7M17 7v10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            </MagneticElement>

            <a href="mailto:careers@mpsgroup.ca" className={styles.emailLink}>
              Or email careers@mpsgroup.ca
            </a>
          </LiteCard>
        </motion.div>
      </div>
    </section>
  );
};
