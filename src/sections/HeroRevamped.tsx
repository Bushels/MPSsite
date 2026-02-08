import { motion } from 'framer-motion';
import { PianoKeysBackground } from '../components/PianoKeysBackground';
import { MagneticElement } from '../components/MagneticElement';
import styles from './HeroRevamped.module.css';

export const HeroRevamped = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 50,
        damping: 20,
      },
    },
  };

  return (
    <section className={styles.hero}>
      {/* Piano keys glassmorphic background - The Star Show */}
      <PianoKeysBackground keyCount={18} interactive={true} />
      
      <div className={styles.container}>
        <motion.div 
          className={styles.content}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className={styles.badgeWrapper}>
            <span className={styles.badge}>
              <span className={styles.badgeDot} />
              Industrial Excellence Since 2000
            </span>
          </motion.div>

          <div className={styles.titleWrapper}>
            <motion.h1 className={styles.title} variants={itemVariants}>
              <span className={styles.titleLine}>Precision</span>
            </motion.h1>
            <motion.h1 className={styles.title} variants={itemVariants}>
              <span className={styles.titleLine}>Performance</span>
            </motion.h1>
            <motion.h1 className={styles.title} variants={itemVariants}>
              <span className={styles.titleAccent}>Delivered.</span>
            </motion.h1>
          </div>

          <motion.p variants={itemVariants} className={styles.subtitle}>
            Industrial services engineered for excellence. From waste management 
            to underground utilities, we build the infrastructure that powers progress.
          </motion.p>

          <motion.div variants={itemVariants} className={styles.actions}>
            <MagneticElement strength={0.2}>
              <button className={styles.primaryBtn}>
                Explore Services
              </button>
            </MagneticElement>
            
            <MagneticElement strength={0.2}>
              <button className={styles.secondaryBtn}>
                View Projects
              </button>
            </MagneticElement>
          </motion.div>
        </motion.div>
      </div>

      <motion.div
        className={styles.scrollIndicator}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.5 }}
      >
        <span className={styles.scrollText}>Scroll to explore</span>
        <div className={styles.scrollLine}>
          <motion.div
            className={styles.scrollDot}
            animate={{ y: [0, 60, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
      </motion.div>
    </section>
  );
};
