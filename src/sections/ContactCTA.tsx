import { motion } from 'framer-motion';
import { MagneticElement } from '../components/MagneticElement';
import styles from './ContactCTA.module.css';

export const ContactCTA = () => {
  return (
    <section id="contact" className={styles.section}>
      <div className={styles.background}>
        <div className={styles.gradientOrb} />
        <div className={styles.gridLines} />
      </div>

      <div className={styles.content}>
        <motion.h2
          className={styles.title}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          Ready to Start Your <br />
          <span className={styles.titleAccent}>Next Project?</span>
        </motion.h2>

        <motion.p
          className={styles.description}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          Let's discuss how MPS Group can deliver precision performance 
          for your industrial needs. Our team is ready to help.
        </motion.p>

        <motion.div
          className={styles.actions}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <MagneticElement strength={0.4}>
            <button className={styles.primaryBtn}>
              <span className={styles.btnText}>Get in Touch</span>
              <div className={styles.btnGlow} />
            </button>
          </MagneticElement>

          <MagneticElement strength={0.3}>
            <a href="tel:+1-780-555-0123" className={styles.secondaryBtn}>
              <svg className={styles.phoneIcon} viewBox="0 0 24 24" fill="none">
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              Call Us
            </a>
          </MagneticElement>
        </motion.div>

        <motion.div
          className={styles.contactInfo}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Email</span>
            <a href="mailto:info@mpsgroup.ca" className={styles.infoValue}>info@mpsgroup.ca</a>
          </div>
          <div className={styles.divider} />
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Location</span>
            <span className={styles.infoValue}>Alberta, Canada</span>
          </div>
          <div className={styles.divider} />
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Service</span>
            <span className={styles.infoValue}>24/7 Emergency</span>
          </div>
        </motion.div>
      </div>

      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerLogo}>MPS Group</div>
          <p className={styles.copyright}>
            © 2026 MPS Group. All rights reserved.
          </p>
          <div className={styles.footerLinks}>
            <a href="#privacy">Privacy</a>
            <a href="#terms">Terms</a>
            <a href="#careers">Careers</a>
          </div>
        </div>
      </footer>
    </section>
  );
};
