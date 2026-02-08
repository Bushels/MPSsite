import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { PhysicsCounter } from '../components/PhysicsCounter';
import styles from './ImpactStats.module.css';

const stats = [
  { end: 20, suffix: '+', label: 'Years in the Field' },
  { end: 500, suffix: '+', label: 'Projects Delivered' },
  { end: 99, suffix: '%', label: 'Client Retention' },
  { end: 24, suffix: '/7', label: 'Field Support' },
];

/* ─── Animation Variants ─── */
const headerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const slideUp = {
  hidden: { opacity: 0, y: 30, filter: 'blur(6px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
  },
};

const cardStagger = {
  hidden: { opacity: 0, y: 50, scale: 0.94 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: i * 0.12,
      type: 'spring',
      stiffness: 40,
      damping: 18,
      mass: 1,
    },
  }),
};

export const ImpactStats = () => {
  const sectionRef = useRef<HTMLElement>(null);

  // Parallax on background glow
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });
  const glowY = useTransform(scrollYProgress, [0, 1], [40, -40]);
  const glowScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.85, 1, 0.9]);

  return (
    <section id="impact" ref={sectionRef} className={styles.section}>
      <div className={styles.background}>
        <div className={styles.gridLines} />
        <motion.div
          className={styles.glow}
          style={{ y: glowY, scale: glowScale }}
        />
      </div>

      <motion.div
        className={styles.content}
        variants={headerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
      >
        <motion.span className={styles.label} variants={slideUp}>
          Our Impact
        </motion.span>

        <motion.h2 className={styles.title} variants={slideUp}>
          Numbers That Define <br />
          <span className={styles.titleAccent}>Our Commitment</span>
        </motion.h2>

        <div className={styles.statsGrid}>
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              className={styles.statCard}
              variants={cardStagger}
              custom={index}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-40px' }}
            >
              <PhysicsCounter
                end={stat.end}
                suffix={stat.suffix}
                label={stat.label}
                duration={2500}
              />
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
};
