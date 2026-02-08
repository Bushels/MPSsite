import { motion } from 'framer-motion';

interface Props { isActive: boolean; reduced?: boolean }

const EASE = [0.16, 1, 0.3, 1] as const;

export const WeldingVisual = ({ isActive, reduced }: Props) => {
  if (reduced) {
    return (
      <svg viewBox="0 0 200 200" fill="none" aria-hidden="true">
        <rect x="20" y="95" width="75" height="12" rx="1" fill="rgba(96,165,250,0.08)" stroke="rgba(96,165,250,0.3)" strokeWidth="0.8" />
        <rect x="105" y="95" width="75" height="12" rx="1" fill="rgba(96,165,250,0.08)" stroke="rgba(96,165,250,0.3)" strokeWidth="0.8" />
        <circle cx="100" cy="100" r="5" fill="rgba(249,115,22,0.6)" />
        <circle cx="100" cy="100" r="20" stroke="rgba(249,115,22,0.2)" strokeWidth="0.5" />
        <ellipse cx="100" cy="103" rx="14" ry="5" fill="rgba(249,115,22,0.2)" />
      </svg>
    );
  }

  // Spark positions — scatter outward from center
  const sparks = Array.from({ length: 12 }, (_, i) => {
    const angle = (i / 12) * Math.PI * 2 + (i % 3) * 0.2;
    const dist = 25 + (i % 4) * 12;
    return {
      endX: Math.cos(angle) * dist,
      endY: Math.sin(angle) * dist - 8, // slight upward bias
      delay: i * 0.04,
    };
  });

  return (
    <motion.svg viewBox="0 0 200 200" fill="none" aria-hidden="true">
      {/* Metal plates */}
      <motion.rect
        x="20" y="95" width="75" height="12" rx="1"
        fill="rgba(96,165,250,0.08)"
        stroke="rgba(96,165,250,0.3)"
        strokeWidth="0.8"
        initial={{ opacity: 0, x: -20 }}
        animate={isActive
          ? { opacity: 1, x: 0 }
          : { opacity: 0.6, x: 0 }}
        transition={{ duration: 0.6, delay: isActive ? 0.1 : 0, ease: EASE }}
      />
      <motion.rect
        x="105" y="95" width="75" height="12" rx="1"
        fill="rgba(96,165,250,0.08)"
        stroke="rgba(96,165,250,0.3)"
        strokeWidth="0.8"
        initial={{ opacity: 0, x: 20 }}
        animate={isActive
          ? { opacity: 1, x: 0 }
          : { opacity: 0.6, x: 0 }}
        transition={{ duration: 0.6, delay: isActive ? 0.15 : 0, ease: EASE }}
      />

      {/* UV glow aura */}
      <motion.circle
        cx="100" cy="100" r="45"
        fill="url(#weldAura)"
        animate={isActive
          ? { scale: [0, 1.2, 1], opacity: [0, 0.8, 0.6] }
          : { scale: [1, 1.1, 1], opacity: [0.2, 0.35, 0.2] }}
        transition={isActive
          ? { duration: 0.8, delay: 0.5, ease: EASE }
          : { duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Weld pool */}
      <motion.ellipse
        cx="100" cy="103" rx="14" ry="5"
        fill="url(#weldPool)"
        animate={isActive
          ? { opacity: [0, 1], scaleX: [0, 1.1, 1] }
          : { opacity: [0.5, 0.8, 0.5] }}
        transition={isActive
          ? { duration: 0.6, delay: 0.6, ease: EASE }
          : { duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Arc rays — radiating energy lines */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
        const rad = (angle * Math.PI) / 180;
        const x1 = 100 + Math.cos(rad) * 8;
        const y1 = 100 + Math.sin(rad) * 8;
        const x2 = 100 + Math.cos(rad) * 28;
        const y2 = 100 + Math.sin(rad) * 28;
        return (
          <motion.line
            key={angle}
            x1={x1} y1={y1} x2={x2} y2={y2}
            stroke="rgba(249,115,22,0.5)"
            strokeWidth="1"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={isActive
              ? { pathLength: [0, 1], opacity: [0, 0.7] }
              : { opacity: [0.15, 0.35, 0.15] }}
            transition={isActive
              ? { duration: 0.4, delay: 0.7 + i * 0.04, ease: EASE }
              : { duration: 2, repeat: Infinity, delay: i * 0.1, ease: 'easeInOut' }}
          />
        );
      })}

      {/* Arc point — intense center */}
      <motion.circle
        cx="100" cy="100" r="5"
        fill="rgba(255,255,255,0.95)"
        filter="url(#arcGlow)"
        animate={isActive
          ? { scale: [0, 1.5, 1], opacity: [0, 1, 0.95] }
          : { scale: [1, 1.25, 0.9, 1.15, 1], opacity: [0.8, 1, 0.75, 0.95, 0.8] }}
        transition={isActive
          ? { duration: 0.4, delay: 0.5, ease: EASE }
          : { duration: 0.9, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Spark particles */}
      {sparks.map((spark, i) => (
        <motion.circle
          key={`spark-${i}`}
          cx="100" cy="100"
          r={1.2 + (i % 3) * 0.4}
          fill="rgba(249,115,22,0.8)"
          animate={isActive
            ? {
                cx: [100, 100 + spark.endX],
                cy: [100, 100 + spark.endY + 15],
                opacity: [1, 0],
                scale: [1, 0.3],
              }
            : {
                cx: [100, 100 + spark.endX * 0.3],
                cy: [100, 100 + spark.endY * 0.3 + 5],
                opacity: [0.6, 0],
              }}
          transition={isActive
            ? { duration: 0.8 + (i % 3) * 0.2, delay: 0.8 + spark.delay, ease: EASE }
            : { duration: 1.5, repeat: Infinity, delay: i * 0.18, ease: 'easeOut' }}
        />
      ))}

      <defs>
        <radialGradient id="weldAura">
          <stop offset="0%" stopColor="rgba(249,115,22,0.15)" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
        <radialGradient id="weldPool">
          <stop offset="0%" stopColor="rgba(249,115,22,0.7)" />
          <stop offset="100%" stopColor="rgba(249,115,22,0.15)" />
        </radialGradient>
        <filter id="arcGlow">
          <feGaussianBlur stdDeviation="3" />
        </filter>
      </defs>
    </motion.svg>
  );
};
