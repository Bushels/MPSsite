import { ReactNode, useRef, useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { useDeviceCapability } from '../hooks/useDeviceCapability';
import styles from './AmbientCard.module.css';

interface AmbientCardProps {
  children: ReactNode;
  className?: string;
  glowColor?: string;
}

/**
 * AmbientCard — Premium Glass Surface
 *
 * Upgraded to match the hero's 5-layer glass quality:
 * - Mouse-tracked ambient light with proximity intensity
 * - Specular reflection (diagonal highlight)
 * - Caustic light streak (internal refraction)
 * - Adaptive glass responding to scroll depth via CSS vars
 * - Hover elevation with shadow depth
 *
 * Performance: Throttled mousemove (16ms), disabled on touch/reduced-motion.
 */
export const AmbientCard = ({
  children,
  className,
  glowColor = 'rgba(96, 165, 250, 0.4)',
}: AmbientCardProps) => {
  const { isTouch, prefersReducedMotion } = useDeviceCapability();
  const cardRef = useRef<HTMLDivElement>(null);
  const [lightPosition, setLightPosition] = useState({ x: 50, y: 50 });
  const [proximity, setProximity] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const lastCallRef = useRef(0);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    // 60fps throttle
    const now = performance.now();
    if (now - lastCallRef.current < 16) return;
    lastCallRef.current = now;

    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();

    // Light position as % of card
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setLightPosition({ x, y });

    // Proximity: distance from card center, normalized 0-1
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dist = Math.sqrt(
      Math.pow(e.clientX - cx, 2) + Math.pow(e.clientY - cy, 2)
    );
    const maxDist = 400;
    const prox = Math.max(0, 1 - dist / maxDist);
    setProximity(prox);
  }, []);

  useEffect(() => {
    // Skip mouse tracking on touch devices and reduced motion
    if (isTouch || prefersReducedMotion) return;

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [handleMouseMove, isTouch, prefersReducedMotion]);

  return (
    <motion.div
      ref={cardRef}
      className={clsx(styles.card, className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      viewport={{ once: true, margin: '-50px' }}
      style={{
        '--light-x': `${lightPosition.x}%`,
        '--light-y': `${lightPosition.y}%`,
        '--glow-color': glowColor,
        '--glow-opacity': isHovered ? 0.65 : 0.25,
        '--proximity': proximity,
        '--card-border-opacity': (0.08 + proximity * 0.15).toFixed(3),
        '--card-border-top-opacity': (0.15 + proximity * 0.3).toFixed(3),
      } as React.CSSProperties}
    >
      {/* Layer 1: Ambient light (mouse-tracked) */}
      <div className={styles.ambientLight} />
      {/* Layer 2: Specular reflection (diagonal highlight) */}
      <div className={styles.reflectiveEdge} />
      {/* Layer 3: Caustic light streak */}
      <div className={styles.caustic} />
      {/* Layer 4: Glow spot (proximity-driven) */}
      <div className={styles.glowSpot} />
      {/* Content */}
      <div className={styles.content}>
        {children}
      </div>
    </motion.div>
  );
};
