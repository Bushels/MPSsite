import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useDeviceCapability } from '../hooks/useDeviceCapability';
import styles from './ClientStream.module.css';

/**
 * ClientStream — Floating Conversation Cards
 *
 * Client logos appear as glass "message cards" that float upward
 * in staggered columns, like bubbles rising or chat messages
 * appearing in a conversation. Creates an ambient, living trust
 * signal that doesn't demand attention but rewards it.
 *
 * Architecture:
 * - 3 vertical "streams" (columns) with different drift speeds
 * - Each card: glass surface + logo + subtle glow
 * - CSS animation for infinite upward drift
 * - Scroll-linked parallax on the section header
 * - Cards are duplicated for seamless infinite loop
 */

interface Client {
  name: string;
  logo: string;
  /** Optional size hint — 'sm' for shorter/icon logos, 'lg' for wider wordmarks */
  size?: 'sm' | 'md' | 'lg';
}

const clients: Client[] = [
  { name: 'Cenovus Energy', logo: '/logos/2021-CVE-Logo-RGB.png', size: 'lg' },
  { name: 'Canadian Natural', logo: '/logos/Canadian_Natural_Logo.svg', size: 'lg' },
  { name: 'Strathcona Resources', logo: '/logos/Strathcona_Resources_Ltd__Strathcona_Resources_Ltd__Announces_In.jpg', size: 'lg' },
  { name: 'Obsidian Energy', logo: '/logos/Obsidian_Energy_Logo,_2022.svg', size: 'md' },
  { name: 'Athabasca Oil', logo: '/logos/Athabasca_Oil_Corporation_Logo.svg', size: 'md' },
  { name: 'Connacher Oil and Gas', logo: '/logos/Connacher_Oil_and_Gas_Logo.svg', size: 'md' },
];

// Distribute clients across 3 streams with different orderings
// Each stream gets all clients but in a shuffled order for visual variety
const stream1 = [clients[0], clients[3], clients[1], clients[5], clients[2], clients[4]];
const stream2 = [clients[2], clients[4], clients[0], clients[1], clients[5], clients[3]];
const stream3 = [clients[1], clients[5], clients[3], clients[4], clients[0], clients[2]];

const ClientCard = ({ client, index }: { client: Client; index: number }) => (
  <div
    className={`${styles.card} ${styles[`card${client.size || 'md'}`]}`}
    style={{ '--card-delay': `${index * 0.12}s` } as React.CSSProperties}
  >
    <div className={styles.cardGlass} />
    <div className={styles.cardContent}>
      <img
        src={client.logo}
        alt={client.name}
        className={styles.logo}
        loading="lazy"
      />
    </div>
    <div className={styles.cardShine} />
  </div>
);

export const ClientStream = () => {
  const { prefersReducedMotion, tier } = useDeviceCapability();
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const headerY = useTransform(scrollYProgress, [0, 1], [30, -30]);
  const headerOpacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  /* Performance: render fewer streams on lower-tier devices.
     3 streams × 12 cards = 36 DOM nodes with backdrop-filter.
     On mid/low tier, drop to 2 streams (24 nodes — 33% reduction). */
  const showThirdStream = tier === 'high';

  return (
    <section ref={sectionRef} className={styles.section}>
      {/* Ambient background glow */}
      <div className={styles.bgGlow} />

      {/* Section heading — subtle, not loud */}
      <motion.div
        className={styles.header}
        style={prefersReducedMotion ? {} : { y: headerY, opacity: headerOpacity }}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        viewport={{ once: true, margin: '-50px' }}
      >
        <span className={styles.label}>Trusted Partners</span>
        <p className={styles.subtitle}>
          Powering Western Canada's energy infrastructure
        </p>
      </motion.div>

      {/* Floating card streams */}
      <div className={styles.streams}>
        {/* Stream 1 — slow drift */}
        <div
          className={`${styles.stream} ${styles.streamSlow}`}
          aria-hidden="true"
        >
          <div className={prefersReducedMotion ? styles.streamStatic : styles.streamTrack}>
            {stream1.map((c, i) => <ClientCard key={`s1a-${c.name}`} client={c} index={i} />)}
            {/* Duplicate for seamless loop */}
            {stream1.map((c, i) => <ClientCard key={`s1b-${c.name}`} client={c} index={i} />)}
          </div>
        </div>

        {/* Stream 2 — medium drift (reverse direction for visual tension) */}
        <div
          className={`${styles.stream} ${styles.streamMedium}`}
          aria-hidden="true"
        >
          <div className={prefersReducedMotion ? styles.streamStatic : `${styles.streamTrack} ${styles.streamReverse}`}>
            {stream2.map((c, i) => <ClientCard key={`s2a-${c.name}`} client={c} index={i} />)}
            {stream2.map((c, i) => <ClientCard key={`s2b-${c.name}`} client={c} index={i} />)}
          </div>
        </div>

        {/* Stream 3 — fast drift (high-tier only to reduce backdrop-filter load) */}
        {showThirdStream && (
          <div
            className={`${styles.stream} ${styles.streamFast}`}
            aria-hidden="true"
          >
            <div className={prefersReducedMotion ? styles.streamStatic : styles.streamTrack}>
              {stream3.map((c, i) => <ClientCard key={`s3a-${c.name}`} client={c} index={i} />)}
              {stream3.map((c, i) => <ClientCard key={`s3b-${c.name}`} client={c} index={i} />)}
            </div>
          </div>
        )}
      </div>

      {/* Fade edges — top and bottom gradient masks */}
      <div className={styles.fadeMaskTop} />
      <div className={styles.fadeMaskBottom} />
    </section>
  );
};
