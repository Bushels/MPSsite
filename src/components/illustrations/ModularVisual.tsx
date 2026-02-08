import { motion, type MotionProps } from 'framer-motion';

interface Props { isActive: boolean; reduced?: boolean }

const EASE = [0.16, 1, 0.3, 1] as const;

interface IsoBlockProps {
  x: number; y: number; w: number; h: number; d: number;
  opacity?: number;
}

/* Isometric module helper — 3 visible faces */
const IsoBlock = ({
  x, y, w, h, d,
  opacity = 1,
  ...motionProps
}: IsoBlockProps & Partial<MotionProps>) => {
  // Isometric projection: top face, front face, right face
  const top = `M${x},${y} L${x + w},${y - d / 2} L${x + w * 2},${y} L${x + w},${y + d / 2} Z`;
  const front = `M${x},${y} L${x},${y + h} L${x + w},${y + h + d / 2} L${x + w},${y + d / 2} Z`;
  const right = `M${x + w},${y + d / 2} L${x + w},${y + h + d / 2} L${x + w * 2},${y + h} L${x + w * 2},${y} Z`;

  return (
    <motion.g opacity={opacity} {...motionProps}>
      <path d={front} fill="rgba(96,165,250,0.12)" stroke="rgba(96,165,250,0.4)" strokeWidth="0.8" />
      <path d={right} fill="rgba(96,165,250,0.07)" stroke="rgba(96,165,250,0.4)" strokeWidth="0.8" />
      <path d={top} fill="rgba(96,165,250,0.2)" stroke="rgba(96,165,250,0.5)" strokeWidth="0.8" />
    </motion.g>
  );
};

export const ModularVisual = ({ isActive, reduced }: Props) => {
  if (reduced) {
    return (
      <svg viewBox="0 0 200 200" fill="none" aria-hidden="true">
        <IsoBlock x={45} y={95} w={25} h={40} d={20} />
        <IsoBlock x={80} y={75} w={20} h={55} d={16} />
        <IsoBlock x={110} y={85} w={28} h={45} d={22} />
        {/* Platform */}
        <path d="M35 145 L100 170 L165 145 L100 120 Z" fill="rgba(96,165,250,0.04)" stroke="rgba(96,165,250,0.2)" strokeWidth="0.8" />
      </svg>
    );
  }

  const modules = [
    { x: 45, y: 95, w: 25, h: 40, d: 20, fromX: -60, fromY: 0, delay: 0.5 },
    { x: 80, y: 75, w: 20, h: 55, d: 16, fromX: 0, fromY: -70, delay: 0.7 },
    { x: 110, y: 85, w: 28, h: 45, d: 22, fromX: 60, fromY: 0, delay: 0.9 },
  ];

  const lockPoints = [
    { cx: 92, cy: 100, delay: 1.3 },
    { cx: 92, cy: 120, delay: 1.35 },
    { cx: 115, cy: 95, delay: 1.4 },
    { cx: 115, cy: 115, delay: 1.45 },
  ];

  return (
    <motion.svg viewBox="0 0 200 200" fill="none" aria-hidden="true">
      {/* Assembly platform */}
      <motion.path
        d="M35 145 L100 170 L165 145 L100 120 Z"
        fill="rgba(96,165,250,0.04)"
        stroke="rgba(96,165,250,0.2)"
        strokeWidth="0.8"
        animate={isActive
          ? { opacity: [0, 1] }
          : { opacity: [0.3, 0.5, 0.3] }}
        transition={isActive
          ? { duration: 0.4 }
          : { duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Assembly guide lines (dashed) */}
      {modules.map((m, i) => (
        <motion.line
          key={`guide-${i}`}
          x1={m.x + m.w + m.fromX * 0.7}
          y1={m.y + m.h / 2 + m.fromY * 0.7}
          x2={m.x + m.w}
          y2={m.y + m.h / 2}
          stroke="rgba(96,165,250,0.2)"
          strokeWidth="0.8"
          strokeDasharray="3 3"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={isActive
            ? { pathLength: 1, opacity: 0.6 }
            : { opacity: 0 }}
          transition={{ duration: 0.4, delay: i * 0.1, ease: EASE }}
        />
      ))}

      {/* Modules — slide in from edges */}
      {modules.map((m, i) => (
        <motion.g
          key={i}
          initial={{ x: m.fromX, y: m.fromY, opacity: 0 }}
          animate={isActive
            ? { x: 0, y: 0, opacity: 1 }
            : { x: 0, y: [0, -2, 0], opacity: [0.6, 0.8, 0.6] }}
          transition={isActive
            ? { type: 'spring', stiffness: 55, damping: 14, delay: m.delay }
            : { duration: 3, repeat: Infinity, delay: i * 0.3, ease: 'easeInOut' }}
        >
          <IsoBlock x={m.x} y={m.y} w={m.w} h={m.h} d={m.d} />
        </motion.g>
      ))}

      {/* Lock engagement points */}
      {lockPoints.map((pt, i) => (
        <motion.circle
          key={`lock-${i}`}
          cx={pt.cx} cy={pt.cy} r="2.5"
          fill="rgba(37,99,235,0.7)"
          initial={{ scale: 0, opacity: 0 }}
          animate={isActive
            ? { scale: [0, 1.4, 1], opacity: 1 }
            : { scale: [1, 1.2, 1], opacity: [0.3, 0.55, 0.3] }}
          transition={isActive
            ? { duration: 0.35, delay: pt.delay, ease: EASE }
            : { duration: 2, repeat: Infinity, delay: i * 0.15, ease: 'easeInOut' }}
        />
      ))}

      {/* Module labels */}
      {['M-01', 'M-02', 'M-03'].map((label, i) => {
        const positions = [{ x: 58, y: 82 }, { x: 90, y: 62 }, { x: 128, y: 72 }];
        return (
          <motion.text
            key={label}
            x={positions[i].x} y={positions[i].y}
            fill="rgba(96,165,250,0.5)"
            fontSize="7"
            fontFamily="monospace"
            textAnchor="middle"
            initial={{ opacity: 0 }}
            animate={{ opacity: isActive ? 0.7 : 0 }}
            transition={{ duration: 0.4, delay: isActive ? 1.6 + i * 0.1 : 0 }}
          >
            {label}
          </motion.text>
        );
      })}
    </motion.svg>
  );
};
