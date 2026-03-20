import { LiteCard } from '../../components/LiteCard';
import {
  automotiveContactDetails,
  bookingAssurancePoints,
  bookingPrepChecklist,
  inspectionCoverage,
} from '../../data/automotive';
import { trackLeadEvent } from '../../services/analytics';
import styles from './TrustInfo.module.css';

export const TrustInfo = () => (
  <section id="trust" className={styles.section} aria-labelledby="trust-info-title">
    <div className={styles.header}>
      <span className={styles.eyebrow}>Trust & info</span>
      <h2 id="trust-info-title" className={styles.title}>
        What SGI checks, what to bring, and how to reach the shop.
      </h2>
    </div>

    <div className={styles.grid}>
      <LiteCard className={styles.card}>
        <div className={styles.cardHeader}>
          <span className={styles.cardLabel}>What SGI covers</span>
          <h3>93-point inspection focus</h3>
        </div>

        <div className={styles.stack}>
          {inspectionCoverage.map((item) => (
            <div key={item.title} className={styles.item}>
              <strong>{item.title}</strong>
              <p>{item.description}</p>
            </div>
          ))}
        </div>
      </LiteCard>

      <LiteCard className={styles.card}>
        <div className={styles.cardHeader}>
          <span className={styles.cardLabel}>Customer prep</span>
          <h3>Arrival checklist</h3>
        </div>

        <ul className={styles.list}>
          {bookingPrepChecklist.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </LiteCard>

      <LiteCard className={styles.card}>
        <div className={styles.cardHeader}>
          <span className={styles.cardLabel}>Shop details</span>
          <h3>Where to find us</h3>
        </div>

        <div className={styles.stack}>
          {automotiveContactDetails.map((detail) => (
            <div key={detail.label} className={styles.contactRow}>
              <span>{detail.label}</span>
              {detail.href ? (
                <a
                  href={detail.href}
                  onClick={() => {
                    if (detail.label === 'Phone') {
                      trackLeadEvent('auto_call_click', { location: 'trust' });
                    }
                  }}
                >
                  {detail.value}
                </a>
              ) : (
                <strong>{detail.value}</strong>
              )}
            </div>
          ))}
        </div>
      </LiteCard>

      <LiteCard className={styles.card}>
        <div className={styles.cardHeader}>
          <span className={styles.cardLabel}>Why people use it</span>
          <h3>Built for local drivers and work trucks</h3>
        </div>

        <div className={styles.stack}>
          {bookingAssurancePoints.map((item) => (
            <div key={item.title} className={styles.item}>
              <strong>{item.title}</strong>
              <p>{item.description}</p>
            </div>
          ))}
        </div>
      </LiteCard>
    </div>
  </section>
);
