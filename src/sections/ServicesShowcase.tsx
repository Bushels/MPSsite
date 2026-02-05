import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { AmbientCard } from '../components/AmbientCard';
import styles from './ServicesShowcase.module.css';

const services = [
  {
    id: 'waste',
    title: 'Total Waste Management',
    description: 'Comprehensive management of industrial byproducts with environmentally responsible disposal solutions.',
    icon: '♻️',
    color: 'rgba(34, 197, 94, 0.4)',
    stats: { value: '10K+', label: 'Tons Processed' },
  },
  {
    id: 'facilities',
    title: 'Facilities Services',
    description: 'Technical cleaning and management of industrial paint systems and manufacturing environments.',
    icon: '🏭',
    color: 'rgba(59, 130, 246, 0.4)',
    stats: { value: '50+', label: 'Facilities Managed' },
  },
  {
    id: 'industrial',
    title: 'Industrial Services',
    description: 'Ultra-high-pressure water blasting up to 40K PSI, vacuum services, and chemical cleaning.',
    icon: '⚡',
    color: 'rgba(168, 85, 247, 0.4)',
    stats: { value: '40K', label: 'PSI Capability' },
  },
  {
    id: 'wastewater',
    title: 'Wastewater Treatment',
    description: 'On-site comprehensive industrial wastewater management ensuring environmental compliance.',
    icon: '💧',
    color: 'rgba(6, 182, 212, 0.4)',
    stats: { value: '99%', label: 'Compliance Rate' },
  },
  {
    id: 'maintenance',
    title: 'Industrial Maintenance',
    description: 'Welding, fabrication, facility upgrades, and support for industrial construction.',
    icon: '🔧',
    color: 'rgba(249, 115, 22, 0.4)',
    stats: { value: '24/7', label: 'On-Call Service' },
  },
  {
    id: 'underground',
    title: 'Underground Services',
    description: 'Turnkey solutions for data, communication, electric, water, and sewer line installation.',
    icon: '🔌',
    color: 'rgba(236, 72, 153, 0.4)',
    stats: { value: '100+', label: 'KM Installed' },
  },
];

export const ServicesShowcase = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  const x = useTransform(scrollYProgress, [0, 1], ['0%', '-50%']);

  return (
    <section id="services" className={styles.section}>
      <div className={styles.header}>
        <motion.span
          className={styles.label}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          What We Do
        </motion.span>
        <motion.h2
          className={styles.title}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          Industrial Solutions <br />
          <span className={styles.titleAccent}>Engineered for Excellence</span>
        </motion.h2>
      </div>

      <div ref={containerRef} className={styles.scrollContainer}>
        <motion.div className={styles.track} style={{ x }}>
          {services.map((service, index) => (
            <motion.div
              key={service.id}
              className={styles.cardWrapper}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <AmbientCard glowColor={service.color} className={styles.card}>
                <div className={styles.cardIcon}>{service.icon}</div>
                <h3 className={styles.cardTitle}>{service.title}</h3>
                <p className={styles.cardDescription}>{service.description}</p>
                <div className={styles.cardStats}>
                  <span className={styles.statsValue}>{service.stats.value}</span>
                  <span className={styles.statsLabel}>{service.stats.label}</span>
                </div>
                <button className={styles.cardButton}>
                  Learn More
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </button>
              </AmbientCard>
            </motion.div>
          ))}
        </motion.div>
      </div>

      <div className={styles.scrollHint}>
        <span>Scroll to explore services</span>
        <div className={styles.scrollArrows}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
      </div>
    </section>
  );
};
