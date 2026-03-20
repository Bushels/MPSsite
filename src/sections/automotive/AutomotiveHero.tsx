import { motion } from 'framer-motion';
import { LiteCard } from '../../components/LiteCard';
import { automotiveHeroHighlights } from '../../data/automotive';
import { companyProfile } from '../../data/company';
import { useDeviceCapability } from '../../hooks/useDeviceCapability';
import { trackLeadEvent } from '../../services/analytics';
import styles from './AutomotiveHero.module.css';

const sgiBadge = '/images/sgi_300x300.jpg';

export interface AutomotiveHeroProps {
  bookingHref: string;
  nextAvailableLabel: string;
  productsHref: string;
}

export const AutomotiveHero = ({
  bookingHref,
  nextAvailableLabel,
  productsHref,
}: Readonly<AutomotiveHeroProps>) => {
  const { prefersReducedMotion } = useDeviceCapability();

  return (
    <section className={styles.section} aria-labelledby="automotive-hero-title">
      <div className={styles.background}>
        <div className={styles.orbPrimary} />
        <div className={styles.orbSecondary} />
        <div className={styles.grid} />
      </div>

      <div className={styles.layout}>
        <motion.div
          className={styles.copy}
          initial={prefersReducedMotion ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className={styles.eyebrow}>SGI-accredited shop on Highway 55</span>
          <h1 id="automotive-hero-title" className={styles.title}>
            Small-town service for the whole corridor.
            <span className={styles.titleAccent}>
              Book SGI inspections, maintenance, and fleet work online.
            </span>
          </h1>
          <p className={styles.lead}>
            MPS Group Automotive is a Pierceland shop serving the Cold Lake corridor and Highway
            55 communities. Choose the work, see the usual time and price range, and arrive with
            the shop already holding the details it needs.
          </p>

          <div className={styles.metaRow}>
            <div className={styles.metaBlock}>
              <span className={styles.metaLabel}>Shop</span>
              <span className={styles.metaValue}>{companyProfile.automotiveLocationShort}</span>
            </div>
            <div className={styles.metaBlock}>
              <span className={styles.metaLabel}>Serving</span>
              <span className={styles.metaValue}>Cold Lake corridor and Highway 55 communities</span>
            </div>
            <div className={styles.metaBlock}>
              <span className={styles.metaLabel}>Next opening</span>
              <span className={styles.metaValue}>{nextAvailableLabel}</span>
            </div>
          </div>

          <div className={styles.actions}>
            <a href={bookingHref} className={styles.primaryButton}>
              Book an Appointment
            </a>
            <a
              href={companyProfile.primaryPhoneHref}
              className={styles.secondaryButton}
              onClick={() => trackLeadEvent('auto_call_click', { location: 'hero' })}
            >
              Call {companyProfile.primaryPhoneDisplay}
            </a>
          </div>

          <div className={styles.highlights}>
            {automotiveHeroHighlights.map((item) => (
              <div key={item.title} className={styles.highlight}>
                <span className={styles.highlightTitle}>{item.title}</span>
                <span className={styles.highlightCopy}>{item.description}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          className={styles.sidecar}
          initial={prefersReducedMotion ? false : { opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.74, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
        >
          <LiteCard className={styles.trustCard} glowColor="rgba(227, 30, 36, 0.28)">
            <div className={styles.badgeRow}>
              <img src={sgiBadge} alt="SGI accredited" className={styles.badgeImage} />
              <div className={styles.badgeCopy}>
                <span className={styles.cardLabel}>Local trust signal</span>
                <p className={styles.cardTitle}>SGI-accredited inspection facility</p>
              </div>
            </div>

            <div className={styles.cardStats}>
              <div>
                <span className={styles.statValue}>93</span>
                <span className={styles.statLabel}>safety checkpoints</span>
              </div>
              <div>
                <span className={styles.statValue}>4</span>
                <span className={styles.statLabel}>steps to book</span>
              </div>
            </div>

            <div className={styles.cardFoot}>
              <span className={styles.cardFootLabel}>Why locals book here</span>
              <p>
                SGI accreditation means the inspection, paperwork, and follow-up can happen in one
                place for local drivers, commuters, and work trucks.
              </p>
            </div>
          </LiteCard>

          <LiteCard className={styles.coverageCard} glowColor="rgba(96, 165, 250, 0.24)">
            <span className={styles.cardLabel}>Shop reach</span>
            <p className={styles.coverageTitle}>Neighbourly shop, broad service area</p>

            <div className={styles.coverageTags}>
              <span>Pierceland</span>
              <span>Cold Lake corridor</span>
              <span>Work trucks</span>
              <span>Highway 55 traffic</span>
            </div>

            <div className={styles.coverageList}>
              <div>
                <strong>Book the bay</strong>
                <p>SGI inspections, oil changes, brakes, tires, and fleet checks all in one flow.</p>
              </div>
              <div>
                <strong>Grab the basics</strong>
                <p>See the mockup shelf for oils, filters, DEF, and seasonal counter items.</p>
              </div>
            </div>

            <a href={productsHref} className={styles.inlineLink}>
              See the in-store shelf preview
            </a>
          </LiteCard>
        </motion.div>
      </div>
    </section>
  );
};
