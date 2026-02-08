import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { useDeviceCapability } from '../hooks/useDeviceCapability';
import styles from './ServicesCoverflow.module.css';

/* ═══════════════════════════════════════════════
   SERVICE DATA — Clean, no emoji, premium icons
   ═══════════════════════════════════════════════ */

interface Service {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  stat: { value: string; label: string };
  icon: React.ReactNode;
}

/* Minimal line-art SVGs — unified stroke style */
const IconFabrication = () => (
  <svg viewBox="0 0 48 48" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={styles.icon}>
    <path d="M6 42h36M10 42V22l8-8M26 42V22l8-8" stroke="currentColor" />
    <path d="M10 22h16M10 30h16M26 22h8M26 30h8" stroke="currentColor" opacity="0.5" />
    <path d="M18 14V6h12v8" stroke="currentColor" />
    <circle cx="24" cy="10" r="2" stroke="currentColor" />
  </svg>
);

const IconPipefitting = () => (
  <svg viewBox="0 0 48 48" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={styles.icon}>
    <path d="M6 16h12v16H6zM30 16h12v16H30z" stroke="currentColor" />
    <path d="M18 20h12v8H18z" stroke="currentColor" opacity="0.5" />
    <path d="M6 24h42" stroke="currentColor" strokeDasharray="2 3" opacity="0.3" />
    <circle cx="24" cy="24" r="2" stroke="currentColor" />
    <path d="M12 12v4M36 12v4M12 32v4M36 32v4" stroke="currentColor" opacity="0.4" />
  </svg>
);

const IconWelding = () => (
  <svg viewBox="0 0 48 48" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={styles.icon}>
    <path d="M8 40l12-20" stroke="currentColor" />
    <path d="M20 20l4-8 4 8" stroke="currentColor" />
    <path d="M20 20c0-6 8-6 8 0" stroke="currentColor" opacity="0.5" />
    <path d="M24 12V6" stroke="currentColor" />
    {/* Spark particles */}
    <circle cx="16" cy="28" r="1" fill="currentColor" opacity="0.6" />
    <circle cx="22" cy="25" r="0.8" fill="currentColor" opacity="0.4" />
    <circle cx="14" cy="32" r="0.6" fill="currentColor" opacity="0.3" />
    <path d="M28 20l12-12M32 24l8-4M26 28l6 2" stroke="currentColor" opacity="0.25" strokeWidth="1" />
  </svg>
);

const IconModular = () => (
  <svg viewBox="0 0 48 48" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={styles.icon}>
    <rect x="6" y="26" width="16" height="16" rx="2" stroke="currentColor" />
    <rect x="26" y="26" width="16" height="16" rx="2" stroke="currentColor" />
    <rect x="16" y="6" width="16" height="16" rx="2" stroke="currentColor" />
    <path d="M24 22v4M14 26v-4h20v4" stroke="currentColor" opacity="0.5" />
    <circle cx="24" cy="14" r="2" stroke="currentColor" opacity="0.4" />
    <circle cx="14" cy="34" r="2" stroke="currentColor" opacity="0.4" />
    <circle cx="34" cy="34" r="2" stroke="currentColor" opacity="0.4" />
  </svg>
);

const IconMachining = () => (
  <svg viewBox="0 0 48 48" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={styles.icon}>
    <circle cx="24" cy="24" r="14" stroke="currentColor" />
    <circle cx="24" cy="24" r="8" stroke="currentColor" opacity="0.5" />
    <circle cx="24" cy="24" r="2" stroke="currentColor" />
    {/* Crosshairs */}
    <path d="M24 6v4M24 38v4M6 24h4M38 24h4" stroke="currentColor" opacity="0.3" />
    {/* Measurement ticks */}
    <path d="M24 10v2M24 36v2M10 24h2M36 24h2" stroke="currentColor" opacity="0.6" />
    <path d="M33 15l-1.5 1.5M16.5 31.5L15 33" stroke="currentColor" opacity="0.3" />
  </svg>
);

const IconDownhole = () => (
  <svg viewBox="0 0 48 48" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={styles.icon}>
    <path d="M18 6h12v8l-2 4h-8l-2-4V6z" stroke="currentColor" />
    <path d="M16 18h16v4H16z" stroke="currentColor" opacity="0.5" />
    <path d="M18 22h12v20H18z" stroke="currentColor" />
    <path d="M18 28h12M18 34h12" stroke="currentColor" opacity="0.3" />
    {/* Ground line */}
    <path d="M6 14h36" stroke="currentColor" opacity="0.15" strokeDasharray="4 3" />
    {/* Depth arrow */}
    <path d="M12 22v18M12 40l-3-3M12 40l3-3" stroke="currentColor" opacity="0.3" />
  </svg>
);

const services: Service[] = [
  {
    id: 'fabrication',
    title: 'Fabrication',
    subtitle: 'Custom Surface Facilities',
    description:
      'Custom oil and gas surface facility fabrication — vessels, skids, and structural steel built to spec with CWB-certified precision.',
    stat: { value: 'CWB', label: 'Certified' },
    icon: <IconFabrication />,
  },
  {
    id: 'pipefitting',
    title: 'Pipefitting',
    subtitle: 'Precision Routing',
    description:
      'Precision pipe installation and routing for production facilities, from small bore to large diameter. B31.3 code compliant across every joint.',
    stat: { value: 'B31.3', label: 'Code Compliant' },
    icon: <IconPipefitting />,
  },
  {
    id: 'welding',
    title: 'Welding',
    subtitle: 'Multi-Process Expertise',
    description:
      'Certified welding services across all processes — SMAW, GMAW, FCAW, GTAW — for critical applications. Two decades of field-proven reliability.',
    stat: { value: '20+', label: 'Years Experience' },
    icon: <IconWelding />,
  },
  {
    id: 'modular',
    title: 'Modular Assembly',
    subtitle: 'Shop-Built Efficiency',
    description:
      'Complete modular packages built in-shop for efficient field deployment. Reduce site time by half while increasing quality control.',
    stat: { value: '50%', label: 'Faster Deployment' },
    icon: <IconModular />,
  },
  {
    id: 'machining',
    title: 'Machining',
    subtitle: 'Tight-Tolerance Precision',
    description:
      'Precision CNC and manual machining for custom components, repairs, and tight-tolerance downhole parts. Thousandth-of-an-inch accuracy.',
    stat: { value: '±0.001"', label: 'Tolerance' },
    icon: <IconMachining />,
  },
  {
    id: 'downhole',
    title: 'Downhole Tools',
    subtitle: 'Below-Surface Innovation',
    description:
      'Sand control tools and monitoring solutions — our newest division, bringing surface precision underground to the wellbore.',
    stat: { value: 'NEW', label: 'Division' },
    icon: <IconDownhole />,
  },
];

/* ═══════════════════════════════════════════════
   ANIMATION CONFIG
   ═══════════════════════════════════════════════ */
const EASE = [0.16, 1, 0.3, 1] as const;

const headerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12 },
  },
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

/* ═══════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════ */
export const ServicesCoverflow = () => {
  const { prefersReducedMotion } = useDeviceCapability();
  const [activeIndex, setActiveIndex] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const total = services.length;

  /* Parallax on header */
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });
  const headerY = useTransform(scrollYProgress, [0, 1], [50, -50]);

  /* Navigation */
  const goTo = useCallback(
    (index: number) => {
      const clamped = Math.max(0, Math.min(total - 1, index));
      setActiveIndex(clamped);
    },
    [total]
  );

  const next = useCallback(() => goTo(activeIndex + 1), [activeIndex, goTo]);
  const prev = useCallback(() => goTo(activeIndex - 1), [activeIndex, goTo]);

  /* Keyboard navigation */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [next, prev]);

  /* Touch swipe */
  const touchStartX = useRef(0);
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);
  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      const dx = e.changedTouches[0].clientX - touchStartX.current;
      if (Math.abs(dx) > 50) {
        dx < 0 ? next() : prev();
      }
    },
    [next, prev]
  );

  /* Compute 3D position for each card */
  const getCardTransform = useCallback(
    (index: number) => {
      const offset = index - activeIndex;
      const absOffset = Math.abs(offset);

      if (prefersReducedMotion) {
        return {
          x: offset * 120,
          rotateY: 0,
          scale: absOffset === 0 ? 1 : 0.85,
          z: absOffset === 0 ? 0 : -100,
          opacity: absOffset > 2 ? 0 : absOffset === 0 ? 1 : 0.5,
        };
      }

      return {
        x: offset * 220,
        rotateY: offset * -35,
        scale: absOffset === 0 ? 1 : 0.78 - absOffset * 0.04,
        z: absOffset === 0 ? 60 : -(absOffset * 120),
        opacity: absOffset > 2 ? 0 : absOffset === 0 ? 1 : 0.6 - absOffset * 0.15,
      };
    },
    [activeIndex, prefersReducedMotion]
  );

  /* Auto-advance timer */
  const autoplayRef = useRef<ReturnType<typeof setInterval>>();
  useEffect(() => {
    if (prefersReducedMotion) return;
    autoplayRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev >= total - 1 ? 0 : prev + 1));
    }, 6000);
    return () => {
      if (autoplayRef.current) clearInterval(autoplayRef.current);
    };
  }, [total, prefersReducedMotion]);

  /* Reset autoplay on manual interaction */
  const resetAutoplay = useCallback(() => {
    if (autoplayRef.current) {
      clearInterval(autoplayRef.current);
    }
    if (!prefersReducedMotion) {
      autoplayRef.current = setInterval(() => {
        setActiveIndex((prev) => (prev >= total - 1 ? 0 : prev + 1));
      }, 6000);
    }
  }, [total, prefersReducedMotion]);

  const handleCardClick = useCallback(
    (index: number) => {
      goTo(index);
      resetAutoplay();
    },
    [goTo, resetAutoplay]
  );

  const activeService = services[activeIndex];

  /* Memoize ordered indices so center card renders on top */
  const orderedIndices = useMemo(() => {
    const indices = services.map((_, i) => i);
    indices.sort((a, b) => {
      const distA = Math.abs(a - activeIndex);
      const distB = Math.abs(b - activeIndex);
      return distB - distA; // furthest first → active last (on top)
    });
    return indices;
  }, [activeIndex]);

  return (
    <section id="services" ref={sectionRef} className={styles.section}>
      {/* Background ambient */}
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

      {/* ─── Coverflow Stage ─── */}
      <div
        className={styles.stage}
        role="region"
        aria-label="Services carousel"
        aria-roledescription="carousel"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className={styles.perspective}>
          <div ref={trackRef} className={styles.track}>
            {orderedIndices.map((index) => {
              const service = services[index];
              const t = getCardTransform(index);
              const isActive = index === activeIndex;

              return (
                <motion.div
                  key={service.id}
                  className={`${styles.card} ${isActive ? styles.cardActive : ''}`}
                  animate={{
                    x: t.x,
                    rotateY: t.rotateY,
                    scale: t.scale,
                    z: t.z,
                    opacity: t.opacity,
                  }}
                  transition={{
                    duration: 0.7,
                    ease: EASE,
                  }}
                  onClick={() => handleCardClick(index)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleCardClick(index);
                    }
                  }}
                  tabIndex={isActive ? -1 : 0}
                  role="group"
                  aria-label={`${service.title}: ${service.subtitle}`}
                  aria-current={isActive ? 'true' : undefined}
                  style={{
                    zIndex: isActive ? 10 : 5 - Math.abs(index - activeIndex),
                    cursor: isActive ? 'default' : 'pointer',
                  }}
                >
                  {/* Glass layers */}
                  <div className={styles.cardGlass} />
                  <div className={styles.cardShine} />
                  <div className={styles.cardEdgeLight} />

                  {/* Content */}
                  <div className={styles.cardInner}>
                    <div className={styles.cardIconWrap}>
                      {service.icon}
                    </div>
                    <h3 className={styles.cardTitle}>{service.title}</h3>
                    <span className={styles.cardSubtitle}>{service.subtitle}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Navigation arrows */}
        <button
          className={`${styles.navBtn} ${styles.navPrev}`}
          onClick={() => {
            prev();
            resetAutoplay();
          }}
          disabled={activeIndex === 0}
          aria-label="Previous service"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
        <button
          className={`${styles.navBtn} ${styles.navNext}`}
          onClick={() => {
            next();
            resetAutoplay();
          }}
          disabled={activeIndex === total - 1}
          aria-label="Next service"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* ─── Detail Panel (below carousel) ─── */}
      <div className={styles.detail}>
        <AnimatePresence mode="popLayout">
          <motion.div
            key={activeService.id}
            className={styles.detailContent}
            initial={{ opacity: 0, y: 16, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
            transition={{ duration: 0.4, ease: EASE }}
          >
            <p className={styles.detailDescription}>{activeService.description}</p>
            <div className={styles.detailStat}>
              <span className={styles.statValue}>{activeService.stat.value}</span>
              <span className={styles.statLabel}>{activeService.stat.label}</span>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ─── Dot Indicators ─── */}
      <div className={styles.dots}>
        {services.map((s, i) => (
          <button
            key={s.id}
            className={`${styles.dot} ${i === activeIndex ? styles.dotActive : ''}`}
            onClick={() => handleCardClick(i)}
            aria-label={`Go to ${s.title}`}
          >
            <span className={styles.dotFill} />
          </button>
        ))}
      </div>

      {/* Fade edges */}
      <div className={styles.fadeLeft} />
      <div className={styles.fadeRight} />
    </section>
  );
};
