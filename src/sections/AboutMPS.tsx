import { useRef, useState, useCallback, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring, useMotionValue } from 'framer-motion';
import { AmbientCard } from '../components/AmbientCard';
import { LiteCard } from '../components/LiteCard';
import { useDeviceCapability } from '../hooks/useDeviceCapability';
import styles from './AboutMPS.module.css';

/* ═══════════════════════════════════════════════════════════════
   ABOUT MPS — The Trust Field

   After electromagnetic stats scream "look at our power",
   this section says "here's why you can trust it."

   Two-zone asymmetric layout:
   LEFT  — Company story glass card with certification logos
   RIGHT — 4 value pillars stacked with magnetic hover

   Certification logos start desaturated and reveal to full color
   on hover with a subtle magnetic micro-shift effect.
   ═══════════════════════════════════════════════════════════════ */

/* ─── Certifications ─── */
interface Certification {
  name: string;
  fullName: string;
  logo: string;
}

const certifications: Certification[] = [
  {
    name: 'ACSA',
    fullName: 'Alberta Construction Safety Association',
    logo: '/logos/Certifications/ACSA.png',
  },
  {
    name: 'CanQual',
    fullName: 'CanQual Network',
    logo: '/logos/Certifications/CanQual-Network-Logo.jpg',
  },
  {
    name: 'ComplyWorks',
    fullName: 'ComplyWorks — a Veriforce Company',
    logo: '/logos/Certifications/CW-logo-tag-2-sm-min.png',
  },
  {
    name: 'ISN',
    fullName: 'ISNetworld',
    logo: '/logos/Certifications/ISN.png',
  },
];

/* ─── Values ─── */
interface Value {
  title: string;
  description: string;
  icon: JSX.Element;
}

const values: Value[] = [
  {
    title: 'Safety First',
    description:
      'Every project begins and ends with safety. Our zero-incident policy drives every decision we make.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none">
        <path
          d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
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
    title: 'Innovation',
    description:
      'We leverage cutting-edge technology and methods to deliver superior results efficiently.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none">
        <path
          d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    title: 'Integrity',
    description:
      'Honest communication and transparent practices build the lasting relationships we value.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M12 21a9 9 0 100-18 9 9 0 000 18z" stroke="currentColor" strokeWidth="2" />
        <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: 'Excellence',
    description:
      'We set the standard in industrial services through uncompromising quality in every project.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none">
        <path
          d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
];

/* ─── Animation Variants ─── */
const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const introContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const fadeUpSlow = {
  hidden: { opacity: 0, y: 20, filter: 'blur(4px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.9, ease: EASE },
  },
};

const storyCardEntrance = {
  hidden: { opacity: 0, x: -30, scale: 0.98 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      delay: 0.2,
      type: 'spring' as const,
      stiffness: 40,
      damping: 20,
      mass: 1.0,
    },
  },
};

const valueCardStagger = {
  hidden: { opacity: 0, y: 40, scale: 0.96 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: 0.4 + i * 0.12,
      type: 'spring' as const,
      stiffness: 45,
      damping: 19,
      mass: 1.0,
    },
  }),
};

const certLogoStagger = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: {
      delay: 0.5 + i * 0.12,
      duration: 0.6,
      ease: EASE,
    },
  }),
};

/* ─── Magnetic Cert Logo ─── */
const CertLogo = ({
  cert,
  index,
  mousePos,
  isHighTier,
}: {
  cert: Certification;
  index: number;
  mousePos: { x: number; y: number };
  isHighTier: boolean;
}) => {
  const logoRef = useRef<HTMLDivElement>(null);

  // Use motion values + effect instead of DOM access during render
  const motionX = useMotionValue(0);
  const motionY = useMotionValue(0);
  const springX = useSpring(motionX, { stiffness: 120, damping: 18 });
  const springY = useSpring(motionY, { stiffness: 120, damping: 18 });

  useEffect(() => {
    if (!isHighTier || !logoRef.current) return;
    const rect = logoRef.current.getBoundingClientRect();
    const logoCX = rect.left + rect.width / 2;
    const logoCY = rect.top + rect.height / 2;
    const dx = mousePos.x - logoCX;
    const dy = mousePos.y - logoCY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const maxDist = 350;
    const strength = Math.max(0, 1 - dist / maxDist) * 6;
    motionX.set((dx / (dist || 1)) * strength);
    motionY.set((dy / (dist || 1)) * strength);
  }, [mousePos.x, mousePos.y, isHighTier, motionX, motionY]);

  return (
    <motion.div
      ref={logoRef}
      className={styles.certCard}
      variants={certLogoStagger}
      custom={index}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-40px' }}
      style={isHighTier ? { x: springX, y: springY } : undefined}
      role="img"
      aria-label={`${cert.fullName} — Certified Member`}
      tabIndex={0}
    >
      <div className={styles.certGlass} />
      <img
        src={cert.logo}
        alt={`${cert.fullName} — Certified Member`}
        className={styles.certLogo}
        loading="lazy"
      />
      <span className={styles.certLabel}>{cert.name}</span>
    </motion.div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */
export const AboutMPS = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const { prefersReducedMotion, tier } = useDeviceCapability();
  const isHighTier = tier === 'high';

  // Mouse tracking for magnetic cert logos
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const lastCallRef = useRef(0);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const now = performance.now();
    if (now - lastCallRef.current < 16) return;
    lastCallRef.current = now;
    setMousePos({ x: e.clientX, y: e.clientY });
  }, []);

  useEffect(() => {
    if (!isHighTier || prefersReducedMotion) return;
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [handleMouseMove, isHighTier, prefersReducedMotion]);

  // Subtle parallax on intro text
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });
  const introY = useTransform(scrollYProgress, [0, 1], [20, -20]);

  return (
    <section id="about" ref={sectionRef} className={styles.section}>
      {/* Background atmosphere */}
      <div className={styles.bgGlow} />
      <div className={styles.bgGrid} />

      <div className={styles.container}>
        {/* ─── Intro Header ─── */}
        <motion.div
          className={styles.intro}
          variants={introContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          style={prefersReducedMotion ? {} : { y: introY }}
        >
          <motion.span className={styles.label} variants={fadeUpSlow}>
            About MPS Group
          </motion.span>

          <motion.h2 className={styles.title} variants={fadeUpSlow}>
            Building Western Canada&apos;s Oil &amp; Gas{' '}
            <br />
            <span className={styles.titleAccent}>Infrastructure Since 2004</span>
          </motion.h2>

          <motion.p className={styles.description} variants={fadeUpSlow}>
            From our roots in Pierceland, Saskatchewan, MPS Group has grown into
            a trusted name in oil and gas surface facility fabrication. We build
            the infrastructure that keeps production flowing — from pipe to
            wellhead.
          </motion.p>
        </motion.div>

        {/* ─── Two-Zone Content ─── */}
        <div className={styles.contentGrid}>
          {/* LEFT: Story + Certifications */}
          <motion.div
            variants={storyCardEntrance}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
          >
            <AmbientCard className={styles.storyCard}>
              <div className={styles.storyContent}>
                <p className={styles.storyText}>
                  Established in 2004 and headquartered in Pierceland,
                  Saskatchewan, MPS Group operates from 136 acres of secured
                  facilities with direct access to Western Canada&apos;s oil and
                  gas infrastructure. We specialize in surface facility
                  fabrication, downhole tools, and comprehensive industrial
                  services.
                </p>

                {/* Certification Trust Bar */}
                <div className={styles.certSection}>
                  <span className={styles.certTitle}>
                    Verified Certifications
                  </span>
                  <div className={styles.certGrid}>
                    {certifications.map((cert, i) => (
                      <CertLogo
                        key={cert.name}
                        cert={cert}
                        index={i}
                        mousePos={mousePos}
                        isHighTier={isHighTier && !prefersReducedMotion}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </AmbientCard>
          </motion.div>

          {/* RIGHT: Value Pillars */}
          <div className={styles.valuesColumn}>
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                variants={valueCardStagger}
                custom={index}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-60px' }}
                tabIndex={0}
                role="article"
                aria-label={value.title}
              >
                <LiteCard className={styles.valueCard}>
                  <div className={styles.valueInner}>
                    <div className={styles.iconWrapper}>
                      <div className={styles.icon}>{value.icon}</div>
                    </div>
                    <div className={styles.valueMeta}>
                      <h3 className={styles.valueTitle}>{value.title}</h3>
                      <p className={styles.valueDescription}>
                        {value.description}
                      </p>
                    </div>
                  </div>
                </LiteCard>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
