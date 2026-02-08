import { motion } from 'framer-motion';

interface Props { isActive: boolean; reduced?: boolean }

const EASE = [0.16, 1, 0.3, 1] as const;

export const DownholeVisual = ({ isActive, reduced }: Props) => {
  if (reduced) {
    return (
      <svg viewBox="0 0 200 200" fill="none" aria-hidden="true">
        {/* Strata layers */}
        <rect x="35" y="30" width="130" height="25" fill="rgba(96,165,250,0.1)" stroke="rgba(96,165,250,0.3)" strokeWidth="0.8" />
        <rect x="35" y="55" width="130" height="40" fill="rgba(96,165,250,0.06)" />
        <rect x="35" y="95" width="130" height="40" fill="rgba(96,165,250,0.04)" />
        <rect x="35" y="135" width="130" height="30" fill="rgba(37,99,235,0.1)" stroke="rgba(37,99,235,0.4)" strokeWidth="1" />
        {/* Wellbore */}
        <line x1="95" y1="30" x2="95" y2="165" stroke="rgba(96,165,250,0.4)" strokeWidth="1" />
        <line x1="105" y1="30" x2="105" y2="165" stroke="rgba(96,165,250,0.4)" strokeWidth="1" />
        {/* Tool */}
        <rect x="93" y="95" width="14" height="45" rx="2" fill="rgba(96,165,250,0.15)" stroke="rgba(96,165,250,0.5)" strokeWidth="1" />
        {/* Cable */}
        <line x1="100" y1="20" x2="100" y2="95" stroke="rgba(96,165,250,0.3)" strokeWidth="0.8" strokeDasharray="2 2" />
      </svg>
    );
  }

  // Geological strata
  const layers = [
    { y: 30, h: 25, fill: 'rgba(96,165,250,0.1)', stroke: 'rgba(96,165,250,0.3)' },
    { y: 55, h: 40, fill: 'rgba(96,165,250,0.06)', stroke: 'rgba(96,165,250,0.15)' },
    { y: 95, h: 40, fill: 'rgba(96,165,250,0.04)', stroke: 'rgba(96,165,250,0.1)' },
    { y: 135, h: 30, fill: 'rgba(37,99,235,0.1)', stroke: 'rgba(37,99,235,0.4)' },
  ];

  return (
    <motion.svg viewBox="0 0 200 200" fill="none" aria-hidden="true">
      {/* Geological layers — reveal top-to-bottom */}
      {layers.map((layer, i) => (
        <motion.rect
          key={i}
          x="35" y={layer.y} width="130" height={layer.h}
          fill={layer.fill}
          stroke={layer.stroke}
          strokeWidth={i === 3 ? 1 : 0.8}
          initial={{ opacity: 0, clipPath: 'inset(0 0 100% 0)' }}
          animate={isActive
            ? { opacity: 1, clipPath: 'inset(0 0 0 0)' }
            : { opacity: [0.4, 0.6, 0.4] }}
          transition={isActive
            ? { duration: 0.4, delay: i * 0.2, ease: EASE }
            : { duration: 3, repeat: Infinity, delay: i * 0.15, ease: 'easeInOut' }}
        />
      ))}

      {/* Stratification lines in rock layer */}
      {[62, 70, 78, 86].map((y, i) => (
        <motion.line
          key={`strat-${i}`}
          x1="40" y1={y} x2="160" y2={y}
          stroke="rgba(96,165,250,0.08)"
          strokeWidth="0.5"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: isActive ? 1 : 0.6 }}
          transition={{ duration: 0.5, delay: isActive ? 0.6 + i * 0.05 : 0, ease: EASE }}
        />
      ))}

      {/* Wellbore casing */}
      <motion.line
        x1="95" y1="30" x2="95" y2="165"
        stroke="rgba(96,165,250,0.4)"
        strokeWidth="1"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: isActive ? 1 : 0.8 }}
        transition={{ duration: 0.8, delay: isActive ? 1.0 : 0, ease: EASE }}
      />
      <motion.line
        x1="105" y1="30" x2="105" y2="165"
        stroke="rgba(96,165,250,0.4)"
        strokeWidth="1"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: isActive ? 1 : 0.8 }}
        transition={{ duration: 0.8, delay: isActive ? 1.05 : 0, ease: EASE }}
      />

      {/* Wellhead at surface */}
      <motion.g
        initial={{ opacity: 0, scale: 0.5 }}
        animate={isActive
          ? { opacity: 1, scale: 1 }
          : { opacity: 0.5, scale: 1 }}
        transition={{ duration: 0.4, delay: isActive ? 1.5 : 0, ease: EASE }}
      >
        <rect x="88" y="22" width="24" height="10" rx="2" fill="rgba(96,165,250,0.12)" stroke="rgba(96,165,250,0.45)" strokeWidth="1" />
        <line x1="100" y1="22" x2="100" y2="15" stroke="rgba(96,165,250,0.4)" strokeWidth="1.2" />
        <line x1="94" y1="15" x2="106" y2="15" stroke="rgba(96,165,250,0.4)" strokeWidth="1.2" strokeLinecap="round" />
      </motion.g>

      {/* Wireline cable */}
      <motion.line
        x1="100" y1="32" x2="100" y2="95"
        stroke="rgba(96,165,250,0.3)"
        strokeWidth="0.8"
        strokeDasharray="2 2"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: isActive ? 1 : 0.7 }}
        transition={{ duration: 1, delay: isActive ? 1.8 : 0, ease: EASE }}
      />

      {/* Downhole tool — descends from surface */}
      <motion.g
        initial={{ y: -65 }}
        animate={isActive
          ? { y: 0 }
          : { y: 0, x: [0, 1, -1, 0] }}
        transition={isActive
          ? { duration: 1.2, delay: 1.8, ease: EASE }
          : { duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      >
        {/* Tool body segments */}
        <rect x="93" y="95" width="14" height="12" rx="2" fill="rgba(96,165,250,0.15)" stroke="rgba(96,165,250,0.5)" strokeWidth="1" />
        <rect x="93" y="107" width="14" height="20" rx="1" fill="rgba(96,165,250,0.12)" stroke="rgba(96,165,250,0.5)" strokeWidth="1" />
        <rect x="93" y="127" width="14" height="13" rx="2" fill="rgba(96,165,250,0.1)" stroke="rgba(96,165,250,0.5)" strokeWidth="1" />

        {/* Screen perforations */}
        {[112, 118, 124].map(y => (
          <motion.circle
            key={y}
            cx="100" cy={y} r="1.5"
            fill="rgba(37,99,235,0.4)"
            animate={isActive
              ? { opacity: [0, 1] }
              : { opacity: [0.3, 0.5, 0.3] }}
            transition={isActive
              ? { delay: 3.2, duration: 0.3 }
              : { duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}

        {/* Centralizers */}
        <motion.g
          initial={{ scaleX: 0 }}
          animate={{ scaleX: isActive ? 1 : 0.7 }}
          transition={{ duration: 0.4, delay: isActive ? 3 : 0, ease: EASE }}
          style={{ originX: '100px' }}
        >
          <line x1="88" y1="100" x2="93" y2="100" stroke="rgba(96,165,250,0.35)" strokeWidth="0.8" />
          <line x1="107" y1="100" x2="112" y2="100" stroke="rgba(96,165,250,0.35)" strokeWidth="0.8" />
          <line x1="88" y1="132" x2="93" y2="132" stroke="rgba(96,165,250,0.35)" strokeWidth="0.8" />
          <line x1="107" y1="132" x2="112" y2="132" stroke="rgba(96,165,250,0.35)" strokeWidth="0.8" />
        </motion.g>
      </motion.g>

      {/* Flow indicators — arrows pointing at screen */}
      {[110, 118, 126].map((y, i) => (
        <motion.g key={`flow-${i}`}>
          <motion.polygon
            points={`82,${y} 88,${y - 2.5} 88,${y + 2.5}`}
            fill="rgba(96,165,250,0.35)"
            animate={isActive
              ? { x: [0, 5], opacity: [0.6, 0] }
              : { opacity: [0.2, 0.4, 0.2] }}
            transition={isActive
              ? { duration: 1.5, repeat: Infinity, delay: 3.5 + i * 0.2, ease: 'linear' }
              : { duration: 2.5, repeat: Infinity, delay: i * 0.3, ease: 'easeInOut' }}
          />
          <motion.polygon
            points={`118,${y} 112,${y - 2.5} 112,${y + 2.5}`}
            fill="rgba(96,165,250,0.35)"
            animate={isActive
              ? { x: [0, -5], opacity: [0.6, 0] }
              : { opacity: [0.2, 0.4, 0.2] }}
            transition={isActive
              ? { duration: 1.5, repeat: Infinity, delay: 3.6 + i * 0.2, ease: 'linear' }
              : { duration: 2.5, repeat: Infinity, delay: i * 0.3 + 0.1, ease: 'easeInOut' }}
          />
        </motion.g>
      ))}

      {/* Depth scale */}
      <motion.g
        initial={{ opacity: 0 }}
        animate={{ opacity: isActive ? 0.6 : 0.2 }}
        transition={{ duration: 0.5, delay: isActive ? 3.5 : 0 }}
      >
        <line x1="172" y1="30" x2="172" y2="165" stroke="rgba(96,165,250,0.3)" strokeWidth="0.5" />
        {[30, 64, 97, 130, 165].map((y, i) => (
          <g key={y}>
            <line x1="170" y1={y} x2="174" y2={y} stroke="rgba(96,165,250,0.4)" strokeWidth="0.6" />
            <text x="178" y={y + 3} fill="rgba(96,165,250,0.4)" fontSize="6" fontFamily="monospace">
              {i * 400}m
            </text>
          </g>
        ))}
      </motion.g>

      {/* Target zone highlight pulse */}
      <motion.rect
        x="35" y="135" width="130" height="30"
        fill="none"
        stroke="rgba(37,99,235,0.3)"
        strokeWidth="1"
        animate={isActive
          ? { opacity: [0.5, 0.9, 0.5] }
          : { opacity: [0.15, 0.3, 0.15] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
      />
    </motion.svg>
  );
};
