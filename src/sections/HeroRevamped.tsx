import { motion } from 'framer-motion';
import { ParticleCanvas } from '../components/ParticleCanvas';
import { MagneticElement } from '../components/MagneticElement';
import { VelocityText } from '../components/VelocityText';
import styles from './HeroRevamped.module.css';

export const HeroRevamped = () => {
  return (
    <section className={styles.hero}>
      <ParticleCanvas particleCount={100} color="mixed" />
      
      <div className={styles.gradientOrb} />
      <div className={styles.gradientOrb2} />
      
      <div className={styles.content}>
        <motion.div
          className={styles.badge}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <span className={styles.badgeDot} />
          Industrial Excellence Since 2000
        </motion.div>

        <VelocityText className={styles.titleWrapper}>
          <motion.h1
            className={styles.title}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <span className={styles.titleLine}>Precision</span>
            <span className={styles.titleLine}>Performance</span>
            <span className={styles.titleAccent}>Delivered</span>
          </motion.h1>
        </VelocityText>

        <motion.p
          className={styles.subtitle}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          Industrial services engineered for excellence. From waste management 
          to underground utilities, we build the infrastructure that powers progress.
        </motion.p>

        <motion.div
          className={styles.actions}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
        >
          <MagneticElement strength={0.3}>
            <button className={styles.primaryBtn}>
              <span>Explore Services</span>
              <svg className={styles.btnIcon} viewBox="0 0 24 24" fill="none">
                <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </MagneticElement>
          
          <MagneticElement strength={0.3}>
            <button className={styles.secondaryBtn}>
              View Projects
            </button>
          </MagneticElement>
        </motion.div>

        <motion.div
          className={styles.scrollIndicator}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.2 }}
        >
          <div className={styles.scrollLine}>
            <motion.div
              className={styles.scrollDot}
              animate={{ y: [0, 24, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>
          <span>Scroll to explore</span>
        </motion.div>
      </div>

      <div className={styles.heroStats}>
        <motion.div
          className={styles.stat}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <span className={styles.statValue}>25+</span>
          <span className={styles.statLabel}>Years Experience</span>
        </motion.div>
        <motion.div
          className={styles.stat}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.9 }}
        >
          <span className={styles.statValue}>500+</span>
          <span className={styles.statLabel}>Projects Completed</span>
        </motion.div>
        <motion.div
          className={styles.stat}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
        >
          <span className={styles.statValue}>100%</span>
          <span className={styles.statLabel}>Safety Focused</span>
        </motion.div>
      </div>
    </section>
  );
};
