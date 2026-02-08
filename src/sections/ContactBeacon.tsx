import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { LiteCard } from '../components/LiteCard';
import { MagneticElement } from '../components/MagneticElement';
import { useDeviceCapability } from '../hooks/useDeviceCapability';
import styles from './ContactBeacon.module.css';

/* ═══════════════════════════════════════════════════════════════
   CONTACT BEACON — Electromagnetic Radar Display

   The site's closing statement. A radar-pulse map centers MPS
   in the heart of Western Canada's energy corridor, surrounded
   by regional landmarks at compass bearings. Contact details
   are presented as a station identification block.

   Footer integrated at the absolute bottom.
   ═══════════════════════════════════════════════════════════════ */

/* ─── Regional Landmarks ─── */
interface Landmark {
  name: string;
  bearing: number; // degrees from north (clockwise)
  distance: number; // km from MPS
  ring: 1 | 2 | 3 | 4; // which distance ring (1=closest)
}

const landmarks: Landmark[] = [
  /* Bearings calibrated against satellite imagery centred on MPS pin (54.3244°N, 109.8404°W) */
  { name: 'Pierceland',    bearing: 80,   distance: 8,   ring: 1 },   // Just east
  { name: 'Goodsoil',      bearing: 55,   distance: 50,  ring: 2 },   // NE
  { name: 'Northern Pine',  bearing: 20,   distance: 40,  ring: 2 },   // NNE
  { name: 'Cherry Grove',  bearing: 255,  distance: 30,  ring: 1 },   // WSW
  { name: 'Beaver Crossing', bearing: 265, distance: 55,  ring: 2 },  // W
  { name: 'Peerless',      bearing: 75,   distance: 80,  ring: 3 },   // ENE
  { name: 'Golden Ridge',  bearing: 125,  distance: 90,  ring: 3 },   // SE
  { name: 'Meadow Lake',   bearing: 145,  distance: 130, ring: 4 },   // SE (far)
];

/* ─── Convert bearing + ring to SVG coordinates ─── */
const ringRadii = [22, 36, 52, 70]; // % of viewBox radius
const toXY = (bearing: number, ring: 1 | 2 | 3 | 4) => {
  const rad = ((bearing - 90) * Math.PI) / 180;
  const r = ringRadii[ring - 1];
  return {
    x: 50 + r * Math.cos(rad),
    y: 50 + r * Math.sin(rad),
  };
};

/* ─── Animation config ─── */
const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const introContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12 },
  },
};

const fadeUpBlur = {
  hidden: { opacity: 0, y: 24, filter: 'blur(6px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.9, ease: EASE },
  },
};

const radarEntrance = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 1.2,
      ease: EASE,
    },
  },
};

const panelStagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.3 },
  },
};

const panelItem = {
  hidden: { opacity: 0, y: 20, filter: 'blur(4px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.7, ease: EASE },
  },
};

const footerStagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const footerItem = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: EASE },
  },
};

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */
export const ContactBeacon = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const { prefersReducedMotion } = useDeviceCapability();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });
  const orbY = useTransform(scrollYProgress, [0, 1], [60, -60]);
  const orbScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.9, 1, 0.92]);

  return (
    <section
      id="contact"
      ref={sectionRef}
      className={styles.section}
      aria-labelledby="contact-title"
    >
      {/* ─── Background ─── */}
      <div className={styles.background}>
        <motion.div
          className={styles.gradientOrb}
          style={prefersReducedMotion ? {} : { y: orbY, scale: orbScale }}
        />
        <div className={styles.gridLines} />
      </div>

      <div className={styles.container}>
        {/* ─── Intro Header ─── */}
        <motion.div
          className={styles.intro}
          variants={introContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
        >
          <motion.span className={styles.label} variants={fadeUpBlur}>
            Location
          </motion.span>

          <motion.h2
            id="contact-title"
            className={styles.title}
            variants={fadeUpBlur}
          >
            The Heart of
            <br />
            <span className={styles.titleAccent}>Western Canada&apos;s Energy Corridor</span>
          </motion.h2>

          <motion.p className={styles.subtitle} variants={fadeUpBlur}>
            136 acres of secured facility. Direct highway access.
            <br />
            Positioned to deploy across the entire western basin.
          </motion.p>
        </motion.div>

        {/* ─── Radar + Contact Layout ─── */}
        <div className={styles.beaconLayout}>
          {/* Radar Display */}
          <motion.div
            className={styles.radarContainer}
            variants={radarEntrance}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
          >
            <div className={styles.radarFrame}>
              <svg
                viewBox="0 0 100 100"
                className={styles.radarSvg}
                aria-hidden="true"
              >
                {/* Distance rings */}
                {ringRadii.map((r, i) => (
                  <circle
                    key={`ring-${i}`}
                    cx="50"
                    cy="50"
                    r={r}
                    className={styles.distanceRing}
                    style={{
                      animationDelay: `${i * 0.2}s`,
                      opacity: 0.12 - i * 0.02,
                    }}
                  />
                ))}

                {/* Crosshair lines */}
                <line x1="50" y1="8" x2="50" y2="92" className={styles.crosshair} />
                <line x1="8" y1="50" x2="92" y2="50" className={styles.crosshair} />

                {/* Diagonal crosshairs (45 degree) */}
                <line x1="20" y1="20" x2="80" y2="80" className={styles.crosshairDiag} />
                <line x1="80" y1="20" x2="20" y2="80" className={styles.crosshairDiag} />

                {/* Cardinal labels */}
                <text x="50" y="6" className={styles.cardinalLabel}>N</text>
                <text x="94" y="51" className={styles.cardinalLabel}>E</text>
                <text x="50" y="97" className={styles.cardinalLabel}>S</text>
                <text x="6" y="51" className={styles.cardinalLabel}>W</text>

                {/* Radar sweep */}
                {!prefersReducedMotion && (
                  <line
                    x1="50"
                    y1="50"
                    x2="50"
                    y2="8"
                    className={styles.radarSweep}
                  />
                )}

                {/* Landmark dots */}
                {landmarks.map((lm) => {
                  const { x, y } = toXY(lm.bearing, lm.ring);
                  return (
                    <g key={lm.name}>
                      <circle
                        cx={x}
                        cy={y}
                        r="1.2"
                        className={styles.landmarkDot}
                      />
                      <text
                        x={x}
                        y={y - 2.5}
                        className={styles.landmarkLabel}
                      >
                        {lm.name}
                      </text>
                    </g>
                  );
                })}

                {/* MPS Center — Pulsing beacon */}
                <circle cx="50" cy="50" r="3" className={styles.beaconPulse} />
                <circle cx="50" cy="50" r="2" className={styles.beaconCore} />
                <text x="50" y="44" className={styles.mpsLabel}>MPS GROUP</text>
              </svg>

              {/* Distance labels outside SVG for better CSS control */}
              <span className={`${styles.distLabel} ${styles.distLabel1}`}>25 km</span>
              <span className={`${styles.distLabel} ${styles.distLabel2}`}>50 km</span>
              <span className={`${styles.distLabel} ${styles.distLabel3}`}>100 km</span>
              <span className={`${styles.distLabel} ${styles.distLabel4}`}>200 km</span>
            </div>

            {/* Coordinate readout */}
            <div className={styles.coordReadout}>
              <span className={styles.coordValue}>54.32&deg; N</span>
              <span className={styles.coordDivider}>/</span>
              <span className={styles.coordValue}>109.84&deg; W</span>
            </div>
          </motion.div>

          {/* Contact Info Panel */}
          <motion.div
            className={styles.contactPanel}
            variants={panelStagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
          >
            {/* Station ID */}
            <motion.div variants={panelItem}>
              <LiteCard className={styles.stationCard}>
                <div className={styles.stationHeader}>
                  <span className={styles.stationDot} />
                  <span className={styles.stationLabel}>Station Identification</span>
                </div>
                <h3 className={styles.stationName}>MPS Group</h3>
                <p className={styles.stationSub}>
                  Pierceland Fabrication &amp; Field Services Facility
                </p>
              </LiteCard>
            </motion.div>

            {/* Contact Details */}
            <motion.div variants={panelItem}>
              <LiteCard className={styles.contactCard}>
                <div className={styles.contactRow}>
                  <span className={styles.contactPrefix}>ADDR</span>
                  <span className={styles.contactDetail}>
                    Box 489, Pierceland, SK S0M 2K0
                  </span>
                </div>
                <div className={styles.contactRow}>
                  <span className={styles.contactPrefix}>TEL</span>
                  <a href="tel:+1-306-839-4955" className={styles.contactLink}>
                    306-839-4955
                  </a>
                </div>
                <div className={styles.contactRow}>
                  <span className={styles.contactPrefix}>FAX</span>
                  <span className={styles.contactDetail}>306-839-4440</span>
                </div>
                <div className={styles.contactRow}>
                  <span className={styles.contactPrefix}>COM</span>
                  <a href="mailto:info@mpsgroup.ca" className={styles.contactLink}>
                    info@mpsgroup.ca
                  </a>
                </div>
              </LiteCard>
            </motion.div>

            {/* Operations Info */}
            <motion.div variants={panelItem}>
              <LiteCard className={styles.opsCard}>
                <div className={styles.opsGrid}>
                  <div className={styles.opsItem}>
                    <span className={styles.opsValue}>136</span>
                    <span className={styles.opsLabel}>Acre Facility</span>
                  </div>
                  <div className={styles.opsItem}>
                    <span className={styles.opsValue}>24/7</span>
                    <span className={styles.opsLabel}>Operations</span>
                  </div>
                  <div className={styles.opsItem}>
                    <span className={styles.opsValue}>HWY 55</span>
                    <span className={styles.opsLabel}>Direct Access</span>
                  </div>
                  <div className={styles.opsItem}>
                    <span className={styles.opsValue}>200+</span>
                    <span className={styles.opsLabel}>km Service Radius</span>
                  </div>
                </div>
              </LiteCard>
            </motion.div>

            {/* CTA */}
            <motion.div variants={panelItem} className={styles.ctaRow}>
              <MagneticElement strength={0.35}>
                <a
                  href="https://maps.google.com/?q=54.3243751,-109.8403854"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.directionsBtn}
                >
                  <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
                    <path d="M3 11l19-9-9 19-2-8-8-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>Get Directions</span>
                </a>
              </MagneticElement>
              <MagneticElement strength={0.35}>
                <a
                  href="mailto:info@mpsgroup.ca"
                  className={styles.emailBtn}
                >
                  <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
                    <rect x="2" y="4" width="20" height="16" rx="3" stroke="currentColor" strokeWidth="2" />
                    <path d="M22 7l-10 6L2 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  <span>Send Message</span>
                </a>
              </MagneticElement>
            </motion.div>
          </motion.div>
        </div>

        {/* ─── Footer ─── */}
        <motion.footer
          className={styles.footer}
          variants={footerStagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
        >
          <div className={styles.footerContent}>
            <motion.div className={styles.footerLogo} variants={footerItem}>
              MPS Group
            </motion.div>
            <motion.p className={styles.copyright} variants={footerItem}>
              &copy; 2026 MPS Group. All rights reserved.
            </motion.p>
            <motion.div className={styles.footerLinks} variants={footerItem}>
              <a href="#privacy">Privacy</a>
              <a href="#terms">Terms</a>
              <a href="#careers">Careers</a>
              <a href="#contact">Contact</a>
            </motion.div>
          </div>
        </motion.footer>
      </div>
    </section>
  );
};
