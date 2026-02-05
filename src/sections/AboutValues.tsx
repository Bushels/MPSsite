import { motion } from 'framer-motion';
import { AmbientCard } from '../components/AmbientCard';
import styles from './AboutValues.module.css';

const values = [
  {
    title: 'Safety First',
    description: 'Every project begins and ends with safety. Our zero-incident policy drives every decision we make.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className={styles.icon}>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    title: 'Innovation',
    description: 'We leverage cutting-edge technology and methods to deliver superior results efficiently.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className={styles.icon}>
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    title: 'Integrity',
    description: 'Honest communication and transparent practices build the lasting relationships we value.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className={styles.icon}>
        <path d="M12 21a9 9 0 100-18 9 9 0 000 18z" stroke="currentColor" strokeWidth="2"/>
        <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    title: 'Excellence',
    description: 'We set the standard in industrial services through uncompromising quality in every project.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className={styles.icon}>
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
];

export const AboutValues = () => {
  return (
    <section id="about" className={styles.section}>
      <div className={styles.container}>
        <div className={styles.intro}>
          <motion.span
            className={styles.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            About MPS Group
          </motion.span>
          
          <motion.h2
            className={styles.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            Building Alberta's Industrial <br />
            <span className={styles.titleAccent}>Infrastructure Since 2000</span>
          </motion.h2>

          <motion.p
            className={styles.description}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            MPS Group is a leading industrial construction and maintenance service provider 
            in Alberta, Canada. We combine industry expertise with innovative technology and 
            equipment to safely deliver exceptional results across all our service offerings.
          </motion.p>
        </div>

        <div className={styles.valuesGrid}>
          {values.map((value, index) => (
            <motion.div
              key={value.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <AmbientCard className={styles.valueCard}>
                <div className={styles.iconWrapper}>
                  {value.icon}
                </div>
                <h3 className={styles.valueTitle}>{value.title}</h3>
                <p className={styles.valueDescription}>{value.description}</p>
              </AmbientCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
