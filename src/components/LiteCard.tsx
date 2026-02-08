import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import styles from './LiteCard.module.css';

interface LiteCardProps {
  children: ReactNode;
  className?: string;
  glowColor?: string;
}

/**
 * LiteCard — Lightweight Glass Surface
 *
 * Same visual DNA as AmbientCard but zero per-card JS overhead:
 * - No global mousemove listener (eliminates layout thrash)
 * - No proximity tracking state
 * - No mouse-tracked light position
 * - Pure CSS hover glow (no JS at all)
 * - Static specular reflection + caustic streak
 * - Adaptive glass via CSS vars (same as AmbientCard)
 *
 * Use this for mass-rendered cards (career positions, grid items)
 * where 8-12+ instances would create listener hell with AmbientCard.
 *
 * Visual quality: ~90% of AmbientCard at ~5% of the JS cost.
 */
export const LiteCard = ({
  children,
  className,
  glowColor = 'rgba(96, 165, 250, 0.4)',
}: LiteCardProps) => {
  return (
    <motion.div
      className={clsx(styles.card, className)}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      viewport={{ once: true, margin: '-50px' }}
      style={{ '--glow-color': glowColor } as React.CSSProperties}
    >
      {/* Layer 1: Static ambient glow (CSS hover only, no JS) */}
      <div className={styles.ambientLight} />
      {/* Layer 2: Specular reflection (same as AmbientCard) */}
      <div className={styles.reflectiveEdge} />
      {/* Content */}
      <div className={styles.content}>
        {children}
      </div>
    </motion.div>
  );
};
