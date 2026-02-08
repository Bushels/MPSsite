import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { PianoKeysBackground } from '../components/PianoKeysBackground';
import { MagneticElement } from '../components/MagneticElement';
import styles from './HeroPremium.module.css';

export const HeroPremium = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [, setMousePosition] = useState({ x: 0, y: 0 });

  // Scroll-based parallax
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"]
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.95]);

  // Smooth mouse parallax
  const smoothMouseX = useSpring(0, { stiffness: 50, damping: 20 });
  const smoothMouseY = useSpring(0, { stiffness: 50, damping: 20 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      setMousePosition({ x, y });
      smoothMouseX.set(x * 20);
      smoothMouseY.set(y * 20);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [smoothMouseX, smoothMouseY]);

  // Staggered animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.4,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 60, opacity: 0, filter: 'blur(10px)' },
    visible: {
      y: 0,
      opacity: 1,
      filter: 'blur(0px)',
      transition: {
        type: "spring",
        stiffness: 40,
        damping: 15,
        mass: 0.8,
      },
    },
  };

  const cardVariants = {
    hidden: {
      y: 40,
      opacity: 0,
      scale: 0.95,
      rotateX: -15,
    },
    visible: {
      y: 0,
      opacity: 1,
      scale: 1,
      rotateX: 0,
      transition: {
        type: "spring",
        stiffness: 60,
        damping: 20,
      },
    },
  };

  return (
    <motion.section
      ref={sectionRef}
      className={styles.hero}
      style={{ opacity, scale }}
    >
      {/* Piano keys background with refined aesthetic */}
      <PianoKeysBackground keyCount={20} interactive={true} />

      {/* Floating gradient orbs for depth */}
      <motion.div
        className={styles.orbsLayer}
        style={{
          x: smoothMouseX,
          y: smoothMouseY,
        }}
      >
        <div className={`${styles.orb} ${styles.orb1}`} />
        <div className={`${styles.orb} ${styles.orb2}`} />
        <div className={`${styles.orb} ${styles.orb3}`} />
      </motion.div>

      <div className={styles.container}>
        {/* Logo with parallax effect */}
        <motion.div
          className={styles.logoWrapper}
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          style={{
            x: useTransform(smoothMouseX, (value) => value * 0.3),
            y: useTransform(smoothMouseY, (value) => value * 0.3),
          }}
        >
          <img
            src="/MPS Logo.png"
            alt="MPS"
            className={styles.logo}
          />
        </motion.div>

        <motion.div
          className={styles.content}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Precision badge */}
          <motion.div variants={itemVariants} className={styles.badge}>
            <span className={styles.badgeDot} />
            <span className={styles.badgeText}>INDUSTRIAL EXCELLENCE SINCE 2000</span>
          </motion.div>

          {/* Hero title with architectural typography */}
          <div className={styles.titleWrapper}>
            <motion.h1 variants={itemVariants} className={styles.title}>
              <span className={styles.titleWord}>PRECISION</span>
            </motion.h1>
            <motion.h1 variants={itemVariants} className={styles.title}>
              <span className={styles.titleWord}>ENGINEERING</span>
            </motion.h1>
            <motion.div variants={itemVariants} className={styles.titleAccentLine}>
              <span className={styles.titleAccent}>Perfected.</span>
            </motion.div>
          </div>

          {/* Content cards in grid */}
          <motion.div
            className={styles.cardsGrid}
            variants={containerVariants}
          >
            {/* Main value proposition card */}
            <motion.div
              variants={cardVariants}
              className={`${styles.card} ${styles.cardMain}`}
            >
              <div className={styles.cardInner}>
                <h3 className={styles.cardTitle}>Industrial Services</h3>
                <p className={styles.cardDescription}>
                  From waste management to underground utilities, we build
                  the infrastructure that powers progress.
                </p>
                <div className={styles.cardMetric}>
                  <span className={styles.metricNumber}>25+</span>
                  <span className={styles.metricLabel}>Years Excellence</span>
                </div>
              </div>
            </motion.div>

            {/* Capabilities card */}
            <motion.div
              variants={cardVariants}
              className={`${styles.card} ${styles.cardSecondary}`}
            >
              <div className={styles.cardInner}>
                <h3 className={styles.cardTitle}>Core Capabilities</h3>
                <ul className={styles.capabilitiesList}>
                  <li>Waste Management</li>
                  <li>Underground Utilities</li>
                  <li>Site Development</li>
                  <li>Infrastructure</li>
                </ul>
              </div>
            </motion.div>

            {/* CTA card */}
            <motion.div
              variants={cardVariants}
              className={`${styles.card} ${styles.cardCta}`}
            >
              <div className={styles.cardInner}>
                <h3 className={styles.cardTitle}>Ready to Build?</h3>
                <p className={styles.cardDescription}>
                  Discover how precision engineering transforms projects.
                </p>
                <MagneticElement strength={0.3}>
                  <button className={styles.primaryBtn}>
                    <span className={styles.btnText}>Explore Services</span>
                    <span className={styles.btnArrow}>→</span>
                  </button>
                </MagneticElement>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Scroll indicator with refined animation */}
        <motion.div
          className={styles.scrollIndicator}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 2 }}
        >
          <motion.div
            className={styles.scrollLine}
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ duration: 0.8, delay: 2.2 }}
          >
            <motion.div
              className={styles.scrollDot}
              animate={{
                y: [0, 40, 0],
                opacity: [1, 0.3, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: [0.16, 1, 0.3, 1],
                delay: 2.5,
              }}
            />
          </motion.div>
          <span className={styles.scrollText}>SCROLL</span>
        </motion.div>
      </div>
    </motion.section>
  );
};
