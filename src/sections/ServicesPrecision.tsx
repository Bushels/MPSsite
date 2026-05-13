import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useDeviceCapability } from '../hooks/useDeviceCapability';
import {
  FabricationVisual,
  PipefittingVisual,
  WeldingVisual,
  ModularVisual,
  MachiningVisual,
  DownholeVisual,
} from '../components/illustrations';
import { trackLeadEvent } from '../services/analytics';
import { useTalkToUs } from '../context/talkToUs';
import styles from './ServicesPrecision.module.css';

/* ═══════════════════════════════════════════════
   SERVICE DATA
   ═══════════════════════════════════════════════ */

interface Service {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  stat: { value: string; label: string };
  Visual: React.ComponentType<{ isActive: boolean; reduced?: boolean }>;
}

const services: Service[] = [
  {
    id: 'surface-facilities',
    title: 'Surface Facilities',
    subtitle: 'SAGD & Heavy-Oil Plant Work',
    description:
      'Heavy-oil and SAGD surface-facility execution for plant modifications, produced-water systems, PSV discharge work, pump packages, and re-rate projects.',
    stat: { value: 'SAGD', label: 'Surface' },
    Visual: ModularVisual,
  },
  {
    id: 'pipefitting',
    title: 'Piping & Supports',
    subtitle: 'Spools, Shoes, Clamps',
    description:
      'Piping, pipe supports, shoes, clamps, racks, and B31.3 execution for operating facilities, field tie-ins, and fabrication packages.',
    stat: { value: 'B31.3', label: 'Code Work' },
    Visual: PipefittingVisual,
  },
  {
    id: 'fabrication',
    title: 'Structural Fabrication',
    subtitle: 'Shop-Built Packages',
    description:
      'Structural steel, skids, supports, and plant packages built from drawings, specifications, and turnover requirements at the Pierceland facility.',
    stat: { value: 'CWB', label: 'Certified' },
    Visual: FabricationVisual,
  },
  {
    id: 'welding',
    title: 'Welding',
    subtitle: 'Multi-Process Expertise',
    description:
      'Certified welding services across SMAW, GMAW, FCAW, and GTAW processes for oilfield, industrial, structural, and piping applications.',
    stat: { value: '20+', label: 'Years' },
    Visual: WeldingVisual,
  },
  {
    id: 'turnover',
    title: 'Execution & Turnover',
    subtitle: 'QC, Traceability, As-Builts',
    description:
      'Bid, award, fabrication, field support, QC, MTR, NDE, traceability, and as-built turnover workflows for operating-plant work.',
    stat: { value: 'QC', label: 'Turnover' },
    Visual: ModularVisual,
  },
  {
    id: 'machining',
    title: 'Machining & Repair',
    subtitle: 'Mill & Lathe Services',
    description:
      'CNC and manual machining for custom components, repairs, fixtures, and WellFi/downhole parts where fit and repeatability matter.',
    stat: { value: 'PRO', label: 'Machining' },
    Visual: MachiningVisual,
  },
  {
    id: 'wellfi',
    title: 'WellFi',
    subtitle: 'Downhole Technology',
    description:
      'WellFi is the first public MPS downhole technology product, and the starting point for future sand-control and flow-control development.',
    stat: { value: 'NEW', label: 'Platform' },
    Visual: DownholeVisual,
  },
];

/* ═══════════════════════════════════════════════
   ANIMATION CONFIG
   ═══════════════════════════════════════════════ */
const EASE = [0.16, 1, 0.3, 1] as const;

const headerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 24, filter: 'blur(8px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.8, ease: EASE },
  },
};

const tileReveal = {
  hidden: { opacity: 0, y: 40, scale: 0.96 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: 0.1 + i * 0.1,
      type: 'spring' as const,
      stiffness: 50,
      damping: 18,
      mass: 0.9,
    },
  }),
};

/* ═══════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════ */
export const ServicesPrecision = () => {
  const { prefersReducedMotion } = useDeviceCapability();
  const { openWizard } = useTalkToUs();
  const sectionRef = useRef<HTMLElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [expandedService, setExpandedService] = useState<Service | null>(null);

  /* Parallax header */
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });
  const headerY = useTransform(scrollYProgress, [0, 1], [50, -50]);

  /* Close modal — return focus to trigger tile */
  const closeModal = useCallback(() => {
    setExpandedService(null);
    // Return focus to the tile that triggered the modal
    setTimeout(() => triggerRef.current?.focus(), 50);
  }, []);

  /* Close modal on ESC */
  useEffect(() => {
    if (!expandedService) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [expandedService, closeModal]);

  /* Focus trap inside modal */
  useEffect(() => {
    if (!expandedService || !modalRef.current) return;
    const modal = modalRef.current;
    const focusable = modal.querySelectorAll<HTMLElement>(
      'button, a[href], [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    // Auto-focus close button
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
  }, [expandedService]);

  /* Lock body scroll when modal open */
  useEffect(() => {
    if (expandedService) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [expandedService]);

  const handleTileClick = useCallback((service: Service, el: HTMLDivElement) => {
    triggerRef.current = el;
    setExpandedService(service);
  }, []);

  const handleQuoteRequestClick = useCallback((service: Service) => {
    trackLeadEvent('service_inquiry_click', {
      cta_location: 'services_modal',
      service_id: service.id,
      service_name: service.title,
    });
    closeModal();
    openWizard({
      department: service.id === 'wellfi' ? 'wellfi' : 'services',
      service: service.title,
    });
  }, [closeModal, openWizard]);

  return (
    <section id="services" ref={sectionRef} className={styles.section}>
      {/* Background atmosphere */}
      <div className={styles.bgGlow} />
      <div className={styles.bgGrid} />

      {/* Header */}
      <motion.div
        className={styles.header}
        variants={headerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        style={prefersReducedMotion ? undefined : { y: headerY }}
      >
        <motion.span className={styles.label} variants={fadeUp}>
          Services
        </motion.span>
        <motion.h2 className={styles.title} variants={fadeUp}>
          Built for the Field.
          <br />
          <span className={styles.titleAccent}>Engineered to Flow.</span>
        </motion.h2>
      </motion.div>

      {/* ─── Precision Grid ─── */}
      <div className={styles.grid}>
        {services.map((service, index) => {
          const isHovered = hoveredId === service.id;
          return (
            <motion.div
              key={service.id}
              id={service.id}
              className={`${styles.tile} ${styles[`tile${index}`]}`}
              variants={tileReveal}
              custom={index}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-40px' }}
              onMouseEnter={() => setHoveredId(service.id)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={(e) => handleTileClick(service, e.currentTarget)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleTileClick(service, e.currentTarget);
                }
              }}
              tabIndex={0}
              role="button"
              aria-label={`${service.title}: ${service.subtitle}. Click to learn more.`}
            >
              {/* Glass material */}
              <div className={styles.tileGlass} />
              <div className={styles.tileShine} />

              {/* Living visual */}
              <div className={styles.tileVisual}>
                <service.Visual
                  isActive={isHovered}
                  reduced={prefersReducedMotion}
                />
              </div>

              {/* Overlay — fades in on hover */}
              <motion.div
                className={styles.tileOverlay}
                initial={false}
                animate={{ opacity: isHovered ? 1 : 0 }}
                transition={{ duration: 0.4, ease: EASE }}
              >
                <p className={styles.tileDescription}>{service.description}</p>
              </motion.div>

              {/* Always-visible info bar */}
              <div className={styles.tileInfo}>
                <div className={styles.tileMeta}>
                  <h3 className={styles.tileTitle}>{service.title}</h3>
                  <span className={styles.tileSubtitle}>{service.subtitle}</span>
                </div>
                <div className={styles.tileStat}>
                  <span className={styles.statValue}>{service.stat.value}</span>
                  <span className={styles.statLabel}>{service.stat.label}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ─── Modal ─── */}
      <AnimatePresence>
        {expandedService && (
          <motion.div
            className={styles.modalBackdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={closeModal}
          >
            <motion.div
              ref={modalRef}
              className={styles.modalPanel}
              initial={{ y: 60, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 40, opacity: 0, scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="service-modal-title"
              aria-describedby="service-modal-desc"
            >
              <button
                className={styles.modalClose}
                onClick={closeModal}
                aria-label="Close dialog"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>

              <div className={styles.modalVisual}>
                <expandedService.Visual isActive={true} reduced={prefersReducedMotion} />
              </div>

              <div className={styles.modalContent}>
                <span className={styles.modalLabel}>{expandedService.subtitle}</span>
                <h3 id="service-modal-title" className={styles.modalTitle}>{expandedService.title}</h3>
                <p id="service-modal-desc" className={styles.modalDescription}>{expandedService.description}</p>
                <div className={styles.modalStatRow}>
                  <span className={styles.modalStatValue}>{expandedService.stat.value}</span>
                  <span className={styles.modalStatLabel}>{expandedService.stat.label}</span>
                </div>
                <button
                  type="button"
                  className={styles.modalCta}
                  onClick={() => handleQuoteRequestClick(expandedService)}
                >
                  Start an Inquiry
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M1 13L13 1M13 1H3M13 1V11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
