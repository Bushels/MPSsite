import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { AmbientCard } from '../components/AmbientCard';
import styles from './ServicesShowcase.module.css';

const services = [
  {
    id: 'fabrication',
    title: 'Fabrication',
    description: 'Custom oil and gas surface facility fabrication — vessels, skids, and structural steel built to spec.',
    icon: '🔩',
    color: 'rgba(59, 130, 246, 0.4)',
    stats: { value: 'CWB', label: 'Certified' },
  },
  {
    id: 'pipefitting',
    title: 'Pipefitting',
    description: 'Precision pipe installation and routing for production facilities, from small bore to large diameter.',
    icon: '⚙️',
    color: 'rgba(96, 165, 250, 0.4)',
    stats: { value: 'B31.3', label: 'Code Compliant' },
  },
  {
    id: 'welding',
    title: 'Welding',
    description: 'Certified welding services across all processes — SMAW, GMAW, FCAW, GTAW — for critical applications.',
    icon: '⚡',
    color: 'rgba(249, 115, 22, 0.4)',
    stats: { value: '20+', label: 'Years Experience' },
  },
  {
    id: 'modular',
    title: 'Modular Assembly',
    description: 'Complete modular packages built in-shop for efficient field deployment. Reduce site time, increase quality.',
    icon: '🏗️',
    color: 'rgba(168, 85, 247, 0.4)',
    stats: { value: '50%', label: 'Faster Deployment' },
  },
  {
    id: 'machining',
    title: 'Machining',
    description: 'Precision CNC and manual machining for custom components, repairs, and tight-tolerance downhole parts.',
    icon: '🔧',
    color: 'rgba(6, 182, 212, 0.4)',
    stats: { value: '±0.001"', label: 'Tolerance' },
  },
  {
    id: 'downhole',
    title: 'Downhole Tools',
    description: 'Sand control tools and monitoring solutions — our newest division, bringing surface precision underground.',
    icon: '🛢️',
    color: 'rgba(234, 179, 8, 0.4)',
    stats: { value: 'NEW', label: 'Division' },
  },
];

/* ─── Animation Variants ─── */
const headerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12 },
  },
};

const labelReveal = {
  hidden: { opacity: 0, y: 20, filter: 'blur(8px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  },
};

const titleReveal = {
  hidden: { opacity: 0, y: 30, filter: 'blur(6px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] },
  },
};

const cardReveal = {
  hidden: { opacity: 0, y: 60, scale: 0.95 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: i * 0.08,
      type: 'spring',
      stiffness: 40,
      damping: 18,
      mass: 1,
    },
  }),
};

const scrollHintVariant = {
  hidden: { opacity: 0, x: -10 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { delay: 0.6, duration: 0.8, ease: [0.16, 1, 0.3, 1] },
  },
};

export const ServicesShowcase = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  const x = useTransform(scrollYProgress, [0, 1], ['0%', '-50%']);

  // Subtle parallax on the section header
  const { scrollYProgress: sectionScroll } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });
  const headerY = useTransform(sectionScroll, [0, 1], [40, -40]);

  return (
    <section id="services" ref={sectionRef} className={styles.section}>
      <motion.div
        className={styles.header}
        variants={headerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        style={{ y: headerY }}
      >
        <motion.span className={styles.label} variants={labelReveal}>
          Capabilities
        </motion.span>
        <motion.h2 className={styles.title} variants={titleReveal}>
          Built for the Field. <br />
          <span className={styles.titleAccent}>Engineered to Flow.</span>
        </motion.h2>
      </motion.div>

      <div ref={containerRef} className={styles.scrollContainer}>
        <motion.div className={styles.track} style={{ x }}>
          {services.map((service, index) => (
            <motion.div
              key={service.id}
              className={styles.cardWrapper}
              variants={cardReveal}
              custom={index}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-40px' }}
            >
              <AmbientCard glowColor={service.color} className={styles.card}>
                <div className={styles.cardIconWrapper}>
                  <div className={styles.cardIcon}>{service.icon}</div>
                  <div className={styles.iconGlow} />
                </div>
                <h3 className={styles.cardTitle}>{service.title}</h3>
                <p className={styles.cardDescription}>{service.description}</p>
                <div className={styles.cardStats}>
                  <span className={styles.statsValue}>{service.stats.value}</span>
                  <span className={styles.statsLabel}>{service.stats.label}</span>
                </div>
                <button className={styles.cardButton}>
                  <span className={styles.btnLabel}>Learn More</span>
                  <span className={styles.btnArrow}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </span>
                </button>
              </AmbientCard>
            </motion.div>
          ))}
        </motion.div>
      </div>

      <motion.div
        className={styles.scrollHint}
        variants={scrollHintVariant}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <span>Scroll to explore services</span>
        <div className={styles.scrollArrows}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
      </motion.div>
    </section>
  );
};
