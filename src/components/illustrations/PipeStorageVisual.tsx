import { motion } from 'framer-motion';

interface Props { isActive: boolean; reduced?: boolean }

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * PipeStorageVisual — Aerial view of 136-acre secured pipe yard
 *
 * Scene: Top-down view of organized pipe racks in rows with a perimeter fence.
 * Pipes shown as grouped horizontal lines. Security markers at corners.
 * On hover: pipes stagger-reveal, security pulse, acreage callout.
 */
export const PipeStorageVisual = ({ isActive, reduced }: Props) => {
  if (reduced) {
    return (
      <svg viewBox="0 0 320 160" fill="none" aria-hidden="true">
        {/* Perimeter fence */}
        <rect x="20" y="15" width="280" height="130" rx="4" stroke="rgba(96,165,250,0.3)" strokeWidth="1" strokeDasharray="4 3" fill="rgba(96,165,250,0.02)" />
        {/* Pipe racks (rows of pipes) */}
        {[30, 50, 70, 90, 110].map((y, ri) => (
          <g key={ri}>
            {Array.from({ length: 6 }, (_, ci) => (
              <rect key={ci} x={40 + ci * 42} y={y} width={32} height={12} rx="2" fill="rgba(96,165,250,0.08)" stroke="rgba(96,165,250,0.25)" strokeWidth="0.6" />
            ))}
          </g>
        ))}
        {/* Corner markers */}
        {[[24, 19], [296, 19], [24, 141], [296, 141]].map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r="3" fill="rgba(37,99,235,0.5)" stroke="rgba(96,165,250,0.6)" strokeWidth="0.5" />
        ))}
      </svg>
    );
  }

  const pipeRows = [30, 50, 70, 90, 110];
  const pipeCols = 6;

  return (
    <motion.svg viewBox="0 0 320 160" fill="none" aria-hidden="true">
      {/* Perimeter fence — dashed border */}
      <motion.rect
        x="20" y="15" width="280" height="130" rx="4"
        stroke="rgba(96,165,250,0.3)"
        strokeWidth="1"
        strokeDasharray="4 3"
        fill="rgba(96,165,250,0.02)"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={isActive
          ? { pathLength: 1, opacity: 1 }
          : { opacity: [0.3, 0.5, 0.3] }}
        transition={isActive
          ? { duration: 1, ease: EASE }
          : { duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Security perimeter pulse */}
      <motion.rect
        x="16" y="11" width="288" height="138" rx="6"
        stroke="rgba(96,165,250,0.15)"
        strokeWidth="0.8"
        fill="none"
        initial={{ opacity: 0 }}
        animate={isActive
          ? { opacity: [0, 0.4, 0], scale: [1, 1.01, 1.02] }
          : { opacity: [0.05, 0.15, 0.05] }}
        transition={isActive
          ? { duration: 1.5, ease: 'easeOut' }
          : { duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Pipe racks — stagger reveal */}
      {pipeRows.map((y, ri) => (
        <g key={ri}>
          {Array.from({ length: pipeCols }, (_, ci) => {
            const delay = ri * 0.08 + ci * 0.04;
            return (
              <motion.rect
                key={ci}
                x={40 + ci * 42}
                y={y}
                width={32}
                height={12}
                rx="2"
                fill="rgba(96,165,250,0.06)"
                stroke="rgba(96,165,250,0.25)"
                strokeWidth="0.6"
                initial={{ opacity: 0, scaleX: 0 }}
                animate={isActive
                  ? { opacity: 1, scaleX: 1 }
                  : { opacity: [0.4, 0.6, 0.4] }}
                transition={isActive
                  ? { duration: 0.5, delay: 0.3 + delay, ease: EASE }
                  : { duration: 3, repeat: Infinity, delay: delay * 2, ease: 'easeInOut' }}
              />
            );
          })}
          {/* Pipe cross-sections (end dots) */}
          {Array.from({ length: pipeCols }, (_, ci) => (
            <g key={`dots-${ci}`}>
              {[0, 4, 8].map((dy) => (
                <motion.circle
                  key={dy}
                  cx={40 + ci * 42 + 4 + dy * 1.3}
                  cy={y + 6}
                  r="1.2"
                  fill="rgba(96,165,250,0.15)"
                  stroke="rgba(96,165,250,0.35)"
                  strokeWidth="0.3"
                  initial={{ opacity: 0 }}
                  animate={isActive
                    ? { opacity: 0.8 }
                    : { opacity: [0.2, 0.35, 0.2] }}
                  transition={isActive
                    ? { duration: 0.3, delay: 0.6 + ri * 0.08 + ci * 0.04 }
                    : { duration: 2.5, repeat: Infinity, delay: dy * 0.2, ease: 'easeInOut' }}
                />
              ))}
            </g>
          ))}
        </g>
      ))}

      {/* Corner security markers */}
      {[[24, 19], [296, 19], [24, 141], [296, 141]].map(([cx, cy], i) => (
        <motion.circle
          key={i}
          cx={cx} cy={cy} r="3"
          fill="rgba(37,99,235,0.5)"
          stroke="rgba(96,165,250,0.6)"
          strokeWidth="0.5"
          initial={{ scale: 0, opacity: 0 }}
          animate={isActive
            ? { scale: [0, 1.5, 1], opacity: 1 }
            : { scale: [1, 1.15, 1], opacity: [0.4, 0.65, 0.4] }}
          transition={isActive
            ? { duration: 0.4, delay: 0.1 + i * 0.1, ease: EASE }
            : { duration: 2.5, repeat: Infinity, delay: i * 0.3, ease: 'easeInOut' }}
        />
      ))}

      {/* Scan line (security sweep) */}
      <motion.line
        x1="20" y1="80" x2="300" y2="80"
        stroke="rgba(96,165,250,0.12)"
        strokeWidth="0.5"
        initial={{ y1: 15, y2: 15, opacity: 0 }}
        animate={isActive
          ? { y1: [15, 145], y2: [15, 145], opacity: [0, 0.3, 0] }
          : { opacity: 0 }}
        transition={isActive
          ? { duration: 2, delay: 1.2, ease: 'linear' }
          : {}}
      />

      {/* Access road (dashed line at bottom) */}
      <motion.line
        x1="140" y1="145" x2="180" y2="155"
        stroke="rgba(96,165,250,0.2)"
        strokeWidth="0.8"
        strokeDasharray="3 2"
        initial={{ pathLength: 0 }}
        animate={isActive
          ? { pathLength: 1 }
          : { opacity: [0.15, 0.25, 0.15] }}
        transition={isActive
          ? { duration: 0.6, delay: 0.8, ease: EASE }
          : { duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />
    </motion.svg>
  );
};
