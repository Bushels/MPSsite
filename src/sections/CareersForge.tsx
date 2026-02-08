import { useRef, useState, useCallback } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { AmbientCard } from '../components/AmbientCard';
import { LiteCard } from '../components/LiteCard';
import { MagneticElement } from '../components/MagneticElement';
import { useDeviceCapability } from '../hooks/useDeviceCapability';
import styles from './CareersForge.module.css';

/* ═══════════════════════════════════════════════════════════════
   CAREERS FORGE — The Final Statement

   After About MPS establishes trust, this section says:
   "We're building the future — and we need you."

   Central hub CTA surrounded by 8 position cards in an
   asymmetric orbital grid. Magnetic hover, department color
   coding, drag-drop resume upload, and a premium application CTA.

   Footer integrated at the bottom as the site's closing.
   ═══════════════════════════════════════════════════════════════ */

/* ─── Types ─── */
interface Position {
  id: string;
  title: string;
  department: 'Fabrication' | 'Field' | 'Engineering' | 'Safety' | 'Management';
  location: string;
  type: 'Full-Time' | 'Contract';
  requiresCert?: string;
  icon: JSX.Element;
}

interface Benefit {
  label: string;
  value: string;
  icon: JSX.Element;
}

/* ─── Department Colors ─── */
const deptColors: Record<Position['department'], string> = {
  Fabrication: 'rgba(59, 130, 246, 0.4)',
  Field: 'rgba(96, 165, 250, 0.4)',
  Engineering: 'rgba(168, 85, 247, 0.4)',
  Safety: 'rgba(249, 115, 22, 0.35)',
  Management: 'rgba(6, 182, 212, 0.4)',
};

const deptAccent: Record<Position['department'], string> = {
  Fabrication: '#3B82F6',
  Field: '#60A5FA',
  Engineering: '#A855F7',
  Safety: '#F97316',
  Management: '#06B6D4',
};

/* ─── Positions Data ─── */
const positions: Position[] = [
  {
    id: 'journeyman-welder',
    title: 'Journeyman Welder',
    department: 'Fabrication',
    location: 'Pierceland, SK',
    type: 'Full-Time',

    requiresCert: 'CWB Certified',
    icon: (
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M14 2l-4 20M6 6l-4 6 4 6M18 6l4 6-4 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: 'heavy-equipment-op',
    title: 'Heavy Equipment Operator',
    department: 'Field',
    location: 'Pierceland, SK',
    type: 'Full-Time',

    icon: (
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M2 17h2m16 0h2M6 17a2 2 0 100-4 2 2 0 000 4zM18 17a2 2 0 100-4 2 2 0 000 4z" stroke="currentColor" strokeWidth="2" />
        <path d="M8 17h8M5 13l1-5h4l2 5M14 8h4l2 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: 'pipefitter',
    title: 'Pipefitter & Steamfitter',
    department: 'Fabrication',
    location: 'Pierceland, SK',
    type: 'Full-Time',
    requiresCert: 'Red Seal Preferred',
    icon: (
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M6 4v16M18 4v16M6 8h12M6 16h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'project-manager',
    title: 'Project Manager',
    department: 'Management',
    location: 'Pierceland, SK',
    type: 'Full-Time',
    icon: (
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" stroke="currentColor" strokeWidth="2" />
        <rect x="8" y="2" width="8" height="4" rx="1" stroke="currentColor" strokeWidth="2" />
        <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: 'safety-coordinator',
    title: 'Safety Coordinator',
    department: 'Safety',
    location: 'Pierceland, SK',
    type: 'Full-Time',
    requiresCert: 'CSO/CRSP',
    icon: (
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'electrical-tech',
    title: 'Electrical Technician',
    department: 'Field',
    location: 'Pierceland, SK',
    type: 'Full-Time',
    requiresCert: '442A/309A',
    icon: (
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: 'qc-inspector',
    title: 'QC Inspector',
    department: 'Safety',
    location: 'Pierceland, SK',
    type: 'Contract',
    icon: (
      <svg viewBox="0 0 24 24" fill="none">
        <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
        <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'civil-engineer',
    title: 'Civil/Structural Engineer',
    department: 'Engineering',
    location: 'Remote / Hybrid',
    type: 'Full-Time',
    requiresCert: 'P.Eng.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M2 20h20M4 20V10l8-6 8 6v10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 20v-6h6v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

/* ─── Benefits Data ─── */
const benefits: Benefit[] = [
  {
    label: 'Premium Pay',
    value: 'Top-tier compensation',
    icon: (
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: 'Full Benefits',
    value: 'Health, Dental, Vision',
    icon: (
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: 'Training',
    value: 'Continuous upskilling',
    icon: (
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: 'Growth',
    value: 'Career advancement',
    icon: (
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M22 2L15 22l-4-9-9-4z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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

const cardStagger = {
  hidden: { opacity: 0, y: 50, scale: 0.96 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: 0.3 + i * 0.08,
      type: 'spring' as const,
      stiffness: 45,
      damping: 18,
      mass: 1.0,
    },
  }),
};

const hubEntrance = {
  hidden: { opacity: 0, y: 60, scale: 0.94 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: 0.15,
      type: 'spring' as const,
      stiffness: 50,
      damping: 22,
      mass: 1.0,
    },
  },
};

const benefitPop = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: {
      delay: 0.6 + i * 0.06,
      type: 'spring' as const,
      stiffness: 80,
      damping: 18,
    },
  }),
};

/* ─── Position Card Sub-component ─── */
const PositionCard = ({
  position,
  index,
}: {
  position: Position;
  index: number;
}) => {
  const accent = deptAccent[position.department];
  const [dragOver, setDragOver] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set false when cursor actually leaves the drop zone (not child elements)
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragOver(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && (file.type === 'application/pdf' || file.name.endsWith('.pdf') || file.name.endsWith('.doc') || file.name.endsWith('.docx'))) {
      setUploadedFile(file.name);
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file.name);
    }
  }, []);

  const handleDropZoneClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <motion.div
      className={`${styles.posCard} ${styles[`pos${index}`]}`}
      variants={cardStagger}
      custom={index}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-40px' }}
      role="article"
      aria-label={`${position.title} — ${position.department} — ${position.location}`}
    >
      <LiteCard
        className={styles.posCardInner}
        glowColor={deptColors[position.department]}
      >
        <div className={styles.posHeader}>
          <div
            className={styles.posIcon}
            style={{ color: accent }}
          >
            {position.icon}
          </div>
          <span
            className={styles.posDept}
            style={{ color: accent }}
          >
            {position.department}
          </span>
        </div>

        <h3 className={styles.posTitle}>{position.title}</h3>

        <div className={styles.posMeta}>
          <span className={styles.posLocation}>
            <svg viewBox="0 0 24 24" fill="none" width="12" height="12">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" />
              <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2" />
            </svg>
            {position.location}
          </span>
          <span className={styles.posType}>{position.type}</span>
        </div>

        {position.requiresCert && (
          <div className={styles.posCertRow}>
            <span className={styles.posCert}>{position.requiresCert}</span>
          </div>
        )}

        {/* Drop Zone for Resume */}
        <div
          className={`${styles.dropZone} ${dragOver ? styles.dropZoneActive : ''} ${uploadedFile ? styles.dropZoneUploaded : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleDropZoneClick}
          role="button"
          tabIndex={0}
          aria-label={uploadedFile ? `Resume uploaded: ${uploadedFile}` : `Drop resume for ${position.title}`}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleDropZoneClick(); } }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleFileSelect}
            className={styles.fileInput}
            tabIndex={-1}
            aria-hidden="true"
          />

          <AnimatePresence mode="wait">
            {uploadedFile ? (
              <motion.div
                key="uploaded"
                className={styles.dropZoneContent}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, ease: EASE }}
              >
                <svg viewBox="0 0 24 24" fill="none" width="16" height="16" className={styles.dropZoneIcon}>
                  <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                </svg>
                <span className={styles.dropZoneText}>{uploadedFile}</span>
              </motion.div>
            ) : (
              <motion.div
                key="idle"
                className={styles.dropZoneContent}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <svg viewBox="0 0 24 24" fill="none" width="16" height="16" className={styles.dropZoneIcon}>
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <path d="M17 8l-5-5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M12 3v12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <span className={styles.dropZoneText}>
                  {dragOver ? 'Drop Resume' : 'Drop Resume Here'}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </LiteCard>
    </motion.div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */
export const CareersForge = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const { prefersReducedMotion } = useDeviceCapability();

  // Parallax for background orb
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });
  const orbY = useTransform(scrollYProgress, [0, 1], [80, -80]);
  const orbScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.85, 1, 0.9]);

  return (
    <section
      id="careers"
      ref={sectionRef}
      className={styles.section}
      aria-labelledby="careers-title"
    >
      {/* ─── Background ─── */}
      <div className={styles.background}>
        <motion.div
          className={styles.gradientOrb}
          style={prefersReducedMotion ? {} : { y: orbY, scale: orbScale }}
        />
        <div className={styles.gridLines} />
        <div className={styles.vaultGlow} />
      </div>

      <div className={styles.container}>
        {/* ─── Intro Header ─── */}
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
            We Don&apos;t Just Build Infrastructure.
            <br />
            <span className={styles.titleAccent}>We Build Futures.</span>
          </motion.h2>

          <motion.p className={styles.subtitle} variants={fadeUpBlur}>
            Premium pay. Cutting-edge projects. A team that sets the standard.
            <br />
            If you&apos;re the best at what you do — we want you on our crew.
          </motion.p>
        </motion.div>

        {/* ─── Positions Grid with Central Hub ─── */}
        <div className={styles.orbitalGrid}>
          {/* Top row: 3 positions */}
          {positions.slice(0, 3).map((pos, i) => (
            <PositionCard key={pos.id} position={pos} index={i} />
          ))}

          {/* Central Hub */}
          <motion.div
            className={styles.hub}
            variants={hubEntrance}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
          >
            <AmbientCard className={styles.hubCard}>
              <div className={styles.hubContent}>
                <div className={styles.hubBadge}>
                  <span className={styles.hubBadgeDot} />
                  <span>Now Hiring</span>
                </div>

                <h3 className={styles.hubTitle}>
                  Join a Team That <span className={styles.hubAccent}>Gets It Done</span>
                </h3>

                <p className={styles.hubText}>
                  From pipe to wellhead — we build the infrastructure that
                  keeps Western Canada&apos;s energy sector moving. And we pay
                  our people like they deserve.
                </p>

                {/* Benefits Grid */}
                <div className={styles.benefitsGrid}>
                  {benefits.map((benefit, i) => (
                    <motion.div
                      key={benefit.label}
                      className={styles.benefitItem}
                      variants={benefitPop}
                      custom={i}
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true }}
                    >
                      <div className={styles.benefitIcon}>
                        {benefit.icon}
                      </div>
                      <div className={styles.benefitMeta}>
                        <span className={styles.benefitLabel}>{benefit.label}</span>
                        <span className={styles.benefitValue}>{benefit.value}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Primary CTA */}
                <MagneticElement strength={0.4}>
                  <button type="button" className={styles.applyBtn} aria-label="Start your application">
                    <span className={styles.applyBtnText}>Start Your Application</span>
                    <div className={styles.applyBtnShine} />
                    <div className={styles.applyBtnGlow} />
                  </button>
                </MagneticElement>

                {/* Secondary contact */}
                <div className={styles.hubContact}>
                  <a href="mailto:careers@mpsgroup.ca" className={styles.hubEmail}>
                    careers@mpsgroup.ca
                  </a>
                  <span className={styles.hubDivider}>|</span>
                  <a href="tel:+1-306-839-4955" className={styles.hubPhone}>
                    306-839-4955
                  </a>
                </div>
              </div>
            </AmbientCard>
          </motion.div>

          {/* Bottom rows: 5 positions */}
          {positions.slice(3).map((pos, i) => (
            <PositionCard key={pos.id} position={pos} index={i + 3} />
          ))}
        </div>

      </div>
    </section>
  );
};
