import { motion } from 'framer-motion';
import { PhysicsCounter } from '../components/PhysicsCounter';
import styles from './ImpactStats.module.css';

const stats = [
  { end: 25, suffix: '+', label: 'Years of Excellence' },
  { end: 500, suffix: '+', label: 'Projects Delivered' },
  { end: 1000, suffix: '+', label: 'Team Members' },
  { end: 99, suffix: '%', label: 'Client Satisfaction' },
];

export const ImpactStats = () => {
  return (
    <section id="impact" className={styles.section}>
      <div className={styles.background}>
        <div className={styles.gridLines} />
        <div className={styles.glow} />
      </div>

      <div className={styles.content}>
        <motion.span
          className={styles.label}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          Our Impact
        </motion.span>
        
        <motion.h2
          className={styles.title}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          Numbers That Define <br />
          <span className={styles.titleAccent}>Our Commitment</span>
        </motion.h2>

        <div className={styles.statsGrid}>
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              className={styles.statCard}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
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
      </div>
    </section>
  );
};
