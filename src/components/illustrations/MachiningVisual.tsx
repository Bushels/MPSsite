import { motion } from 'framer-motion';

interface Props { isActive: boolean; reduced?: boolean }

const EASE = [0.16, 1, 0.3, 1] as const;

export const MachiningVisual = ({ isActive, reduced }: Props) => {
  const ticks = Array.from({ length: 12 }, (_, i) => {
    const angle = (i / 12) * Math.PI * 2 - Math.PI / 2;
    const isMajor = i % 3 === 0;
    const innerR = isMajor ? 58 : 62;
    const outerR = 70;
    return {
      x1: 100 + Math.cos(angle) * innerR,
      y1: 100 + Math.sin(angle) * innerR,
      x2: 100 + Math.cos(angle) * outerR,
      y2: 100 + Math.sin(angle) * outerR,
      isMajor,
    };
  });

  if (reduced) {
    return (
      <svg viewBox="0 0 200 200" fill="none" aria-hidden="true">
        <circle cx="100" cy="100" r="15" stroke="rgba(96,165,250,0.4)" strokeWidth="1" />
        <circle cx="100" cy="100" r="30" stroke="rgba(96,165,250,0.3)" strokeWidth="0.8" />
        <circle cx="100" cy="100" r="50" stroke="rgba(96,165,250,0.15)" strokeWidth="0.6" />
        <circle cx="100" cy="100" r="2" fill="rgba(96,165,250,0.6)" />
        <line x1="100" y1="50" x2="100" y2="150" stroke="rgba(37,99,235,0.4)" strokeWidth="0.8" strokeDasharray="3 3" />
        <line x1="50" y1="100" x2="150" y2="100" stroke="rgba(37,99,235,0.4)" strokeWidth="0.8" strokeDasharray="3 3" />
        {ticks.map((t, i) => <line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} stroke={`rgba(96,165,250,${t.isMajor ? 0.4 : 0.2})`} strokeWidth={t.isMajor ? 1 : 0.6} />)}
        <rect x="72" y="28" width="56" height="18" rx="3" fill="rgba(5,20,45,0.8)" stroke="rgba(96,165,250,0.4)" strokeWidth="0.8" />
        <text x="100" y="40" fill="rgba(96,165,250,0.8)" fontSize="9" fontFamily="monospace" textAnchor="middle">±0.001&quot;</text>
      </svg>
    );
  }

  return (
    <motion.svg viewBox="0 0 200 200" fill="none" aria-hidden="true">
      {/* Concentric measurement rings */}
      {[15, 30, 50].map((r, i) => (
        <motion.circle
          key={r}
          cx="100" cy="100" r={r}
          stroke={`rgba(96,165,250,${0.4 - i * 0.1})`}
          strokeWidth={1 - i * 0.2}
          fill="none"
          initial={{ scale: 0, opacity: 0 }}
          animate={isActive
            ? { scale: [0, 1.08, 1], opacity: 1 }
            : { scale: [1, 1.03, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={isActive
            ? { duration: 0.5, delay: 0.4 + i * 0.12, ease: EASE }
            : { duration: 3, repeat: Infinity, delay: i * 0.2, ease: 'easeInOut' }}
        />
      ))}

      {/* Center point */}
      <motion.circle
        cx="100" cy="100" r="2"
        fill="rgba(96,165,250,0.6)"
        animate={isActive
          ? { opacity: [0, 1], scale: [0, 1] }
          : { opacity: [0.4, 0.7, 0.4] }}
        transition={isActive
          ? { duration: 0.3, delay: 0.3 }
          : { duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Crosshair — rotating scanner */}
      <motion.g
        animate={{ rotate: isActive ? [0, 360] : [0, 360] }}
        transition={{ duration: isActive ? 6 : 10, repeat: Infinity, ease: 'linear' }}
        style={{ originX: '100px', originY: '100px' }}
      >
        <line x1="100" y1="48" x2="100" y2="152" stroke="rgba(37,99,235,0.4)" strokeWidth="0.8" strokeDasharray="3 3" />
        <line x1="48" y1="100" x2="152" y2="100" stroke="rgba(37,99,235,0.4)" strokeWidth="0.8" strokeDasharray="3 3" />
      </motion.g>

      {/* Tick marks around edge */}
      {ticks.map((t, i) => (
        <motion.line
          key={i}
          x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2}
          stroke={`rgba(96,165,250,${t.isMajor ? 0.4 : 0.2})`}
          strokeWidth={t.isMajor ? 1 : 0.6}
          initial={{ opacity: 0 }}
          animate={isActive
            ? { opacity: 1 }
            : { opacity: t.isMajor ? 0.35 : 0.15 }}
          transition={{ duration: 0.3, delay: isActive ? 1.8 + i * 0.03 : 0 }}
        />
      ))}

      {/* Scan beam — sweeping measurement laser */}
      <motion.line
        x1="50" y1="100" x2="150" y2="100"
        stroke="rgba(37,99,235,0.7)"
        strokeWidth="1.5"
        strokeLinecap="round"
        filter="url(#scanGlow)"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={isActive
          ? { pathLength: [0, 1, 0], opacity: [0, 1, 0] }
          : { pathLength: [0, 1, 0], opacity: [0, 0.4, 0] }}
        transition={{ duration: isActive ? 2 : 3, repeat: Infinity, ease: 'linear', delay: isActive ? 1.4 : 0 }}
      />

      {/* Target reticles on measurement ring */}
      {[0, 90, 180, 270].map((deg, i) => {
        const rad = (deg * Math.PI) / 180;
        const cx = 100 + Math.cos(rad) * 30;
        const cy = 100 + Math.sin(rad) * 30;
        return (
          <motion.g key={deg}>
            <motion.circle
              cx={cx} cy={cy} r="4"
              stroke="rgba(96,165,250,0.5)"
              strokeWidth="0.8"
              fill="rgba(5,20,45,0.8)"
              initial={{ scale: 0 }}
              animate={isActive
                ? { scale: [0, 1.2, 1] }
                : { scale: [1, 1.1, 1], opacity: [0.4, 0.6, 0.4] }}
              transition={isActive
                ? { duration: 0.35, delay: 1.2 + i * 0.08, ease: EASE }
                : { duration: 2.5, repeat: Infinity, delay: i * 0.2, ease: 'easeInOut' }}
            />
            <motion.line
              x1={cx - 2} y1={cy} x2={cx + 2} y2={cy}
              stroke="rgba(96,165,250,0.6)" strokeWidth="0.5"
              initial={{ opacity: 0 }}
              animate={{ opacity: isActive ? 1 : 0.3 }}
              transition={{ delay: isActive ? 1.3 + i * 0.08 : 0 }}
            />
            <motion.line
              x1={cx} y1={cy - 2} x2={cx} y2={cy + 2}
              stroke="rgba(96,165,250,0.6)" strokeWidth="0.5"
              initial={{ opacity: 0 }}
              animate={{ opacity: isActive ? 1 : 0.3 }}
              transition={{ delay: isActive ? 1.3 + i * 0.08 : 0 }}
            />
          </motion.g>
        );
      })}

      {/* Digital readout panel */}
      <motion.g
        initial={{ opacity: 0, y: -10 }}
        animate={isActive
          ? { opacity: 1, y: 0 }
          : { opacity: 0.4, y: 0 }}
        transition={{ duration: 0.5, delay: isActive ? 2.2 : 0, ease: EASE }}
      >
        <rect x="72" y="28" width="56" height="18" rx="3" fill="rgba(5,20,45,0.8)" stroke="rgba(96,165,250,0.4)" strokeWidth="0.8" />
        <text x="100" y="40" fill="rgba(96,165,250,0.8)" fontSize="9" fontFamily="monospace" textAnchor="middle">
          ±0.001&quot;
        </text>
      </motion.g>

      <defs>
        <filter id="scanGlow">
          <feGaussianBlur stdDeviation="2" />
        </filter>
      </defs>
    </motion.svg>
  );
};
