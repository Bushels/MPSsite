import { motion } from 'framer-motion';

interface Props { isActive: boolean; reduced?: boolean }

const EASE = [0.16, 1, 0.3, 1] as const;

export const FabricationVisual = ({ isActive, reduced }: Props) => {
  if (reduced) {
    return (
      <svg viewBox="0 0 200 200" fill="none" aria-hidden="true">
        <g stroke="rgba(96,165,250,0.4)" strokeWidth="0.5" opacity="0.3">
          {[40, 80, 120, 160].map(x => <line key={`v${x}`} x1={x} y1="20" x2={x} y2="180" />)}
          {[40, 80, 120, 160].map(y => <line key={`h${y}`} x1="20" y1={y} x2="180" y2={y} />)}
        </g>
        <path d="M65 50 Q65 40, 75 40 L125 40 Q135 40, 135 50 L135 155 Q135 165, 125 165 L75 165 Q65 165, 65 155 Z" stroke="rgba(96,165,250,0.6)" strokeWidth="1.2" />
        <line x1="100" y1="40" x2="100" y2="165" stroke="rgba(96,165,250,0.25)" strokeWidth="0.8" />
        {[65, 85, 105, 125, 145].map(y => <line key={y} x1="70" y1={y} x2="130" y2={y} stroke="rgba(96,165,250,0.2)" strokeWidth="0.6" />)}
        {[[75, 42], [125, 42], [70, 85], [130, 85], [70, 145], [130, 145], [75, 163], [125, 163]].map(([cx, cy], i) =>
          <circle key={i} cx={cx} cy={cy} r="2.5" fill="rgba(96,165,250,0.5)" />
        )}
      </svg>
    );
  }

  return (
    <motion.svg viewBox="0 0 200 200" fill="none" aria-hidden="true">
      {/* Grid — blueprint background */}
      <motion.g
        stroke="rgba(96,165,250,0.4)"
        strokeWidth="0.5"
        animate={isActive
          ? { opacity: [0, 0.35] }
          : { opacity: [0.2, 0.35, 0.2] }}
        transition={isActive
          ? { duration: 0.5 }
          : { duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      >
        {[40, 80, 120, 160].map(x => <line key={`v${x}`} x1={x} y1="20" x2={x} y2="180" />)}
        {[40, 80, 120, 160].map(y => <line key={`h${y}`} x1="20" y1={y} x2="180" y2={y} />)}
      </motion.g>

      {/* Vessel outline — draws in */}
      <motion.path
        d="M65 50 Q65 40, 75 40 L125 40 Q135 40, 135 50 L135 155 Q135 165, 125 165 L75 165 Q65 165, 65 155 Z"
        stroke="rgba(96,165,250,0.6)"
        strokeWidth="1.2"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={isActive
          ? { pathLength: 1, opacity: 1 }
          : { pathLength: 1, opacity: [0.5, 0.7, 0.5] }}
        transition={isActive
          ? { duration: 1.2, delay: 0.3, ease: EASE }
          : { duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Center axis */}
      <motion.line
        x1="100" y1="40" x2="100" y2="165"
        stroke="rgba(96,165,250,0.25)"
        strokeWidth="0.8"
        strokeDasharray="3 3"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: isActive ? 1 : 0.7 }}
        transition={{ duration: 0.8, delay: isActive ? 0.8 : 0, ease: EASE }}
      />

      {/* Support ribs */}
      {[65, 85, 105, 125, 145].map((y, i) => (
        <motion.line
          key={y}
          x1="70" y1={y} x2="130" y2={y}
          stroke="rgba(96,165,250,0.2)"
          strokeWidth="0.6"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={isActive
            ? { pathLength: 1, opacity: 1 }
            : { pathLength: 1, opacity: [0.15, 0.3, 0.15] }}
          transition={isActive
            ? { duration: 0.5, delay: 1.0 + i * 0.1, ease: EASE }
            : { duration: 2.5, repeat: Infinity, delay: i * 0.15, ease: 'easeInOut' }}
        />
      ))}

      {/* Assembly nodes — rivet points */}
      {[[75, 42], [125, 42], [70, 85], [130, 85], [70, 145], [130, 145], [75, 163], [125, 163]].map(([cx, cy], i) => (
        <motion.circle
          key={i}
          cx={cx} cy={cy} r="2.5"
          fill="rgba(96,165,250,0.5)"
          initial={{ scale: 0, opacity: 0 }}
          animate={isActive
            ? { scale: [0, 1.3, 1], opacity: 1 }
            : { scale: [1, 1.15, 1], opacity: [0.4, 0.65, 0.4] }}
          transition={isActive
            ? { duration: 0.4, delay: 1.6 + i * 0.06, ease: EASE }
            : { duration: 2, repeat: Infinity, delay: i * 0.12, ease: 'easeInOut' }}
        />
      ))}

      {/* Dimension callouts */}
      <motion.g
        stroke="rgba(37,99,235,0.5)"
        strokeWidth="0.8"
        initial={{ opacity: 0 }}
        animate={{ opacity: isActive ? 1 : 0.3 }}
        transition={{ duration: 0.6, delay: isActive ? 2 : 0, ease: EASE }}
      >
        <line x1="50" y1="42" x2="50" y2="163" />
        <line x1="46" y1="42" x2="54" y2="42" />
        <line x1="46" y1="163" x2="54" y2="163" />
        <line x1="75" y1="28" x2="125" y2="28" />
        <line x1="75" y1="24" x2="75" y2="32" />
        <line x1="125" y1="24" x2="125" y2="32" />
      </motion.g>
    </motion.svg>
  );
};
