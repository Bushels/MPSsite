import { motion } from 'framer-motion';

interface Props { isActive: boolean; reduced?: boolean }

const EASE = [0.16, 1, 0.3, 1] as const;

export const PipefittingVisual = ({ isActive, reduced }: Props) => {
  if (reduced) {
    return (
      <svg viewBox="0 0 200 200" fill="none" aria-hidden="true">
        <circle cx="40" cy="100" r="10" stroke="rgba(96,165,250,0.5)" strokeWidth="1.2" />
        <circle cx="100" cy="55" r="8" stroke="rgba(96,165,250,0.5)" strokeWidth="1.2" />
        <circle cx="100" cy="145" r="8" stroke="rgba(96,165,250,0.5)" strokeWidth="1.2" />
        <circle cx="160" cy="100" r="10" stroke="rgba(96,165,250,0.5)" strokeWidth="1.2" />
        <path d="M40 100 Q70 75, 100 55" stroke="rgba(96,165,250,0.35)" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M40 100 Q70 125, 100 145" stroke="rgba(96,165,250,0.35)" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M100 55 Q130 75, 160 100" stroke="rgba(96,165,250,0.35)" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M100 145 Q130 125, 160 100" stroke="rgba(96,165,250,0.35)" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    );
  }

  const pipes = [
    { d: 'M40 100 Q70 75, 100 55', delay: 0 },
    { d: 'M40 100 Q70 125, 100 145', delay: 0.15 },
    { d: 'M100 55 Q130 75, 160 100', delay: 0.3 },
    { d: 'M100 145 Q130 125, 160 100', delay: 0.45 },
  ];

  const nodes = [
    { cx: 40, cy: 100, r: 10, delay: 0 },
    { cx: 100, cy: 55, r: 8, delay: 0.12 },
    { cx: 100, cy: 145, r: 8, delay: 0.24 },
    { cx: 160, cy: 100, r: 10, delay: 0.36 },
  ];

  return (
    <motion.svg viewBox="0 0 200 200" fill="none" aria-hidden="true">
      {/* Pipe segments — draw in with flow */}
      {pipes.map((pipe, i) => (
        <motion.path
          key={i}
          d={pipe.d}
          stroke="rgba(96,165,250,0.35)"
          strokeWidth="2.5"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={isActive
            ? { pathLength: 1, opacity: 1 }
            : { pathLength: 1, opacity: [0.25, 0.45, 0.25] }}
          transition={isActive
            ? { duration: 0.7, delay: 0.4 + pipe.delay, ease: EASE }
            : { duration: 3, repeat: Infinity, delay: i * 0.2, ease: 'easeInOut' }}
        />
      ))}

      {/* Pipe outlines for depth */}
      {pipes.map((pipe, i) => (
        <motion.path
          key={`outline-${i}`}
          d={pipe.d}
          stroke="rgba(96,165,250,0.12)"
          strokeWidth="6"
          strokeLinecap="round"
          initial={{ opacity: 0 }}
          animate={{ opacity: isActive ? 0.5 : 0.2 }}
          transition={{ duration: 0.5, delay: isActive ? 0.3 + pipe.delay : 0 }}
        />
      ))}

      {/* Connection nodes */}
      {nodes.map((node, i) => (
        <motion.g key={i}>
          <motion.circle
            cx={node.cx} cy={node.cy} r={node.r}
            stroke="rgba(96,165,250,0.5)"
            strokeWidth="1.2"
            fill="rgba(5,20,45,0.7)"
            initial={{ scale: 0, opacity: 0 }}
            animate={isActive
              ? { scale: [0, 1.15, 1], opacity: 1 }
              : { scale: [1, 1.08, 1], opacity: [0.5, 0.75, 0.5] }}
            transition={isActive
              ? { duration: 0.5, delay: node.delay, ease: EASE }
              : { duration: 2.5, repeat: Infinity, delay: i * 0.2, ease: 'easeInOut' }}
          />
          {/* Inner dot */}
          <motion.circle
            cx={node.cx} cy={node.cy} r="2"
            fill="rgba(96,165,250,0.6)"
            animate={isActive
              ? { opacity: 1, scale: [0, 1] }
              : { opacity: [0.4, 0.7, 0.4] }}
            transition={isActive
              ? { duration: 0.3, delay: node.delay + 0.2 }
              : { duration: 2, repeat: Infinity, delay: i * 0.15, ease: 'easeInOut' }}
          />
        </motion.g>
      ))}

      {/* Flow particles — traveling pulses along pipes */}
      {[0, 1, 2].map(i => (
        <motion.circle
          key={`flow-a-${i}`}
          r="2"
          fill="rgba(96,165,250,0.8)"
          filter="url(#pipeGlow)"
          animate={{
            cx: [40, 70, 100],
            cy: [100, 75, 55],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: i * 1,
            ease: 'linear',
          }}
        />
      ))}
      {[0, 1, 2].map(i => (
        <motion.circle
          key={`flow-b-${i}`}
          r="2"
          fill="rgba(96,165,250,0.8)"
          filter="url(#pipeGlow)"
          animate={{
            cx: [100, 130, 160],
            cy: [55, 75, 100],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: i * 1 + 0.5,
            ease: 'linear',
          }}
        />
      ))}

      {/* Pressure gauge at junction */}
      <motion.g transform="translate(100, 55)">
        <motion.circle
          r="14"
          stroke="rgba(96,165,250,0.2)"
          strokeWidth="0.8"
          fill="none"
          initial={{ opacity: 0 }}
          animate={{ opacity: isActive ? 0.8 : 0.3 }}
          transition={{ duration: 0.5, delay: isActive ? 1.2 : 0 }}
        />
        <motion.path
          d="M0 -12 A12 12 0 0 1 10.4 6"
          stroke="rgba(37,99,235,0.6)"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: isActive ? 0.65 : [0.5, 0.65, 0.5] }}
          transition={isActive
            ? { duration: 0.8, delay: 1.4, ease: EASE }
            : { duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.g>

      <defs>
        <filter id="pipeGlow">
          <feGaussianBlur stdDeviation="2" />
        </filter>
      </defs>
    </motion.svg>
  );
};
