import { motion } from 'framer-motion';
import { GlassCard } from '../components/GlassCard';
import { InteractiveButton } from '../components/InteractiveButton';
import styles from './Hero.module.css';

export const Hero = () => {
  return (
    <section className={styles.hero}>
      <div className={styles.background}>
        {/* Placeholder for 3D Scene */}
        <div className={styles.blob} />
        <div className={styles.grid} />
      </div>

      <div className={styles.content}>
        <motion.div 
          className={styles.textStack}
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h1 className={styles.title}>MPS</h1>
          <h2 className={styles.subtitle}>FORWARD LOOKING</h2>
          <p className={styles.description}>
            Precision performance protocols for the next generation of data evolution.
          </p>
          <div className={styles.actions}>
            <InteractiveButton variant="primary">Explore Ecosystem</InteractiveButton>
            <InteractiveButton variant="secondary">Contact Us</InteractiveButton>
          </div>
        </motion.div>

        <div className={styles.tileStack}>
          <GlassCard className={styles.card1} hoverEffect>
            <h3>Live Metrics</h3>
            <div className={styles.metric}>+12.4%</div>
          </GlassCard>
          
          <GlassCard className={styles.card2} hoverEffect>
            <h3>Security</h3>
            <div className={styles.status}>Encrypted</div>
          </GlassCard>
          
          <GlassCard className={styles.card3} hoverEffect>
            <h3>Core System</h3>
            <div className={styles.indicator} />
          </GlassCard>
        </div>
      </div>
    </section>
  );
};
