import {
  useRef,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactElement,
} from 'react';
import {
  motion,
  useScroll,
  useTransform,
  useInView,
  useMotionValue,
  useSpring,
  AnimatePresence,
} from 'framer-motion';
import { useDeviceCapability } from '../hooks/useDeviceCapability';
import styles from './ElectromagneticStats.module.css';

/* ═══════════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════════ */

interface StatData {
  id: string;
  value: number;
  decimals?: number;
  suffix: string;
  label: string;
  sublabel: string;
  /** Position as % within the field container (desktop) */
  pos: { x: number; y: number };
}

const STATS: StatData[] = [
  {
    id: 'years',
    value: 20,
    suffix: '+',
    label: 'Years',
    sublabel: 'Industry Experience',
    pos: { x: 16, y: 28 },
  },
  {
    id: 'projects',
    value: 250,
    suffix: '+',
    label: 'Projects',
    sublabel: 'Completed Successfully',
    pos: { x: 72, y: 22 },
  },
  {
    id: 'steel',
    value: 3.5,
    decimals: 1,
    suffix: 'M',
    label: 'Pounds',
    sublabel: 'Steel Fabricated in 2025',
    pos: { x: 44, y: 68 },
  },
];

/* ═══════════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════════ */

const EASE = [0.16, 1, 0.3, 1] as const;
const WAVE_DURATION = 1400; // ms (snappier wave)
const ACTIVATE_TO_LIVE_DELAY = 2200; // ms after phase → activating

/* Distance from center (50,50) to each stat — used for wave timing */
const statDistances = STATS.map((s) => {
  const dx = s.pos.x - 50;
  const dy = s.pos.y - 50;
  return { id: s.id, dist: Math.sqrt(dx * dx + dy * dy) };
});
const maxDist = Math.max(...statDistances.map((d) => d.dist));

const SPRING_CFG = { stiffness: 80, damping: 22, mass: 0.5 };

/* ═══════════════════════════════════════════════
   SPRING COUNTER (inline — self-contained)
   ═══════════════════════════════════════════════ */

interface CounterProps {
  end: number;
  decimals?: number;
  suffix: string;
  triggered: boolean;
  reduced: boolean;
}

const SpringCounter = ({ end, decimals = 0, suffix, triggered, reduced }: CounterProps) => {
  const [display, setDisplay] = useState(0);
  const hasTriggered = useRef(false);

  useEffect(() => {
    if (!triggered || hasTriggered.current) return;
    hasTriggered.current = true;

    if (reduced) { setDisplay(end); return; }

    const duration = 2400;   // Longer for drama
    const start = performance.now();
    let rafId: number | null = null;

    const tick = () => {
      const elapsed = performance.now() - start;
      const t = Math.min(1, elapsed / duration);

      // Ease-out with overshoot: starts fast, decelerates, tiny bounce at end
      const eased = t < 0.85
        ? 1 - Math.pow(1 - (t / 0.85), 3)               // Cubic ease-out to 85%
        : 1 + Math.sin((t - 0.85) / 0.15 * Math.PI) * 0.02; // Subtle overshoot wobble

      const current = end * Math.min(eased, 1.02); // Clamp overshoot
      setDisplay(Number(current.toFixed(decimals)));

      if (t >= 1) {
        setDisplay(end);
        rafId = null;
        return;
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => { if (rafId !== null) cancelAnimationFrame(rafId); };
  }, [triggered, end, decimals, reduced]);

  const formatted = decimals > 0
    ? display.toFixed(decimals)
    : display.toLocaleString();

  return (
    <span className={styles.statNumber} aria-live="polite" aria-atomic="true">
      {formatted}
      <span className={styles.statSuffix} aria-hidden="true">{suffix}</span>
    </span>
  );
};

/* ═══════════════════════════════════════════════
   SPARK BURST (particles on activation)
   ═══════════════════════════════════════════════ */

const SparkBurst = ({ active, count = 10 }: { active: boolean; count?: number }) => {
  const sparks = useMemo(() => {
    if (!active) return [];
    return Array.from({ length: count }, (_, i) => {
      const angle = (i / count) * 360 + (Math.random() - 0.5) * 20;
      const dist = 50 + Math.random() * 35;
      return {
        id: i,
        x: Math.cos((angle * Math.PI) / 180) * dist,
        y: Math.sin((angle * Math.PI) / 180) * dist,
      };
    });
  }, [active, count]);

  return (
    <AnimatePresence>
      {sparks.map((s) => (
        <motion.div
          key={s.id}
          className={styles.spark}
          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
          animate={{ x: s.x, y: s.y, opacity: 0, scale: 0.2 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.65, ease: EASE, delay: Math.random() * 0.08 }}
        />
      ))}
    </AnimatePresence>
  );
};

/* ═══════════════════════════════════════════════
   MAGNETIC FIELD LINES (SVG — continuous)
   ═══════════════════════════════════════════════ */

interface FieldProps {
  active: boolean;
  mouseX: number; // 0-1 normalised
  mouseY: number;
  enableDistortion: boolean;
}

/** Generate a quadratic Bézier between two stat positions, with control offset + mouse warp */
const buildFieldPath = (
  from: { x: number; y: number },
  to: { x: number; y: number },
  curveOffset: number,
  mx: number,
  my: number,
  distort: boolean,
) => {
  const midX = (from.x + to.x) / 2;
  const midY = (from.y + to.y) / 2;
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  // Perpendicular offset
  let cpX = midX + (-dy * curveOffset);
  let cpY = midY + (dx * curveOffset);

  if (distort) {
    const mDist = Math.sqrt((mx * 100 - cpX) ** 2 + (my * 100 - cpY) ** 2);
    if (mDist < 35) {
      const warp = (1 - mDist / 35) * 12;
      cpX += (cpX - mx * 100) / mDist * warp;
      cpY += (cpY - my * 100) / mDist * warp;
    }
  }
  return `M${from.x} ${from.y} Q${cpX} ${cpY} ${to.x} ${to.y}`;
};

const fieldLineDefs = [
  { from: 0, to: 1, curve: 0.25 },
  { from: 1, to: 2, curve: 0.22 },
  { from: 2, to: 0, curve: 0.28 },
  // Double lines with opposing curvature
  { from: 0, to: 1, curve: -0.18 },
  { from: 1, to: 2, curve: -0.15 },
  { from: 2, to: 0, curve: -0.2 },
];

const MagneticFieldLines = ({ active, mouseX, mouseY, enableDistortion }: FieldProps) => {
  if (!active) return null;

  return (
    <svg
      className={styles.fieldSvg}
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      {fieldLineDefs.map((def, i) => {
        const from = STATS[def.from].pos;
        const to = STATS[def.to].pos;
        const d = buildFieldPath(from, to, def.curve, mouseX, mouseY, enableDistortion);
        return (
          <path
            key={i}
            d={d}
            className={styles.fieldLine}
            style={{ animationDelay: `${i * -0.6}s` }}
          />
        );
      })}
    </svg>
  );
};

/* ═══════════════════════════════════════════════
   CIRCUIT TRACES (SVG — drawn on activation)
   ═══════════════════════════════════════════════ */

interface TraceProps {
  activatedIds: Set<string>;
}

const CircuitTraces = ({ activatedIds }: TraceProps) => {
  const traces = useMemo(() => {
    const result: { key: string; d: string; delay: number }[] = [];
    const ordered = STATS.filter((s) => activatedIds.has(s.id));
    for (let i = 0; i < ordered.length - 1; i++) {
      const from = ordered[i].pos;
      const to = ordered[i + 1].pos;
      // Right-angle routing (PCB style)
      const midX = (from.x + to.x) / 2;
      result.push({
        key: `${ordered[i].id}-${ordered[i + 1].id}`,
        d: `M${from.x} ${from.y} L${midX} ${from.y} L${midX} ${to.y} L${to.x} ${to.y}`,
        delay: i * 0.3,
      });
    }
    // Close the triangle
    if (ordered.length === 3) {
      const from = ordered[2].pos;
      const to = ordered[0].pos;
      const midX = (from.x + to.x) / 2;
      result.push({
        key: `${ordered[2].id}-${ordered[0].id}`,
        d: `M${from.x} ${from.y} L${midX} ${from.y} L${midX} ${to.y} L${to.x} ${to.y}`,
        delay: 0.6,
      });
    }
    return result;
  }, [activatedIds]);

  // Junction nodes at stat positions
  const junctions = STATS.filter((s) => activatedIds.has(s.id));

  return (
    <svg
      className={styles.traceSvg}
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      {traces.map((t) => (
        <motion.path
          key={t.key}
          d={t.d}
          className={styles.circuitTrace}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: t.delay, ease: EASE }}
        />
      ))}
      {junctions.map((s) => (
        <motion.circle
          key={`j-${s.id}`}
          cx={s.pos.x}
          cy={s.pos.y}
          r={0}
          className={styles.junction}
          animate={{ r: 1.2 }}
          transition={{ duration: 0.4, delay: 0.2, ease: EASE }}
        />
      ))}
    </svg>
  );
};

/* ═══════════════════════════════════════════════
   EMP WAVE (radial pulse on scroll)
   ═══════════════════════════════════════════════ */

interface WaveProps {
  fired: boolean;
  onStatHit: (id: string) => void;
}

const EMPWave = ({ fired, onStatHit }: WaveProps) => {
  const firedRef = useRef(false);

  useEffect(() => {
    if (!fired || firedRef.current) return;
    firedRef.current = true;

    const timers: number[] = [];

    // Schedule stat activations based on distance from center
    statDistances.forEach(({ id, dist }) => {
      const normalised = dist / maxDist;
      const delay = normalised * WAVE_DURATION * 0.75 + 200; // 200ms base delay
      timers.push(window.setTimeout(() => onStatHit(id), delay));
    });

    return () => { timers.forEach((t) => clearTimeout(t)); };
  }, [fired, onStatHit]);

  if (!fired) return null;

  return (
    <>
      {/* Primary wave */}
      <motion.div
        className={styles.empWave}
        initial={{ scale: 0, opacity: 0.7 }}
        animate={{ scale: 4, opacity: 0 }}
        transition={{ duration: WAVE_DURATION / 1000, ease: EASE }}
      />
      {/* Secondary trailing wave */}
      <motion.div
        className={`${styles.empWave} ${styles.empWaveSecondary}`}
        initial={{ scale: 0, opacity: 0.4 }}
        animate={{ scale: 3.5, opacity: 0 }}
        transition={{ duration: WAVE_DURATION / 1000 + 0.3, ease: EASE, delay: 0.15 }}
      />
    </>
  );
};

/* ═══════════════════════════════════════════════
   MAIN SECTION
   ═══════════════════════════════════════════════ */

type Phase = 'dormant' | 'activating' | 'live';

export const ElectromagneticStats = (): ReactElement => {
  const { tier, prefersReducedMotion, isTouch } = useDeviceCapability();
  const sectionRef = useRef<HTMLElement>(null);
  const fieldRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<Phase>('dormant');
  const [activatedIds, setActivatedIds] = useState<Set<string>>(new Set());

  const isInView = useInView(sectionRef, { once: true, margin: '-40px' });

  /* Parallax header */
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });
  const headerY = useTransform(scrollYProgress, [0, 1], [40, -40]);

  /* Mouse tracking for magnetic field */
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });

  /* Magnetic card micro-movement springs — declared individually (hooks rules compliant) */
  const card0X = useSpring(0, SPRING_CFG);
  const card0Y = useSpring(0, SPRING_CFG);
  const card1X = useSpring(0, SPRING_CFG);
  const card1Y = useSpring(0, SPRING_CFG);
  const card2X = useSpring(0, SPRING_CFG);
  const card2Y = useSpring(0, SPRING_CFG);
  const cardSprings = useMemo(
    () => [
      { x: card0X, y: card0Y },
      { x: card1X, y: card1Y },
      { x: card2X, y: card2Y },
    ],
    [card0X, card0Y, card1X, card1Y, card2X, card2Y],
  );

  /* Phase machine */
  useEffect(() => {
    if (!isInView || phase !== 'dormant') return;

    if (prefersReducedMotion) {
      setPhase('live');
      setActivatedIds(new Set(STATS.map((s) => s.id)));
      return;
    }

    setPhase('activating');
    const timer = setTimeout(() => setPhase('live'), ACTIVATE_TO_LIVE_DELAY);
    return () => clearTimeout(timer);
  }, [isInView, phase, prefersReducedMotion]);

  /* Failsafe: if stats haven't activated 3s after becoming visible, force-activate.
     Prevents blank section if EMP wave timing misses (e.g. fast scroll). */
  useEffect(() => {
    if (!isInView) return;
    const failsafe = setTimeout(() => {
      setActivatedIds((prev) => {
        if (prev.size < STATS.length) {
          return new Set(STATS.map((s) => s.id));
        }
        return prev;
      });
    }, 3000);
    return () => clearTimeout(failsafe);
  }, [isInView]);

  /* Stat activation callback from EMP */
  const handleStatHit = useCallback((id: string) => {
    setActivatedIds((prev) => new Set([...prev, id]));
  }, []);

  /* Mouse tracking (throttled, desktop only) */
  useEffect(() => {
    if (isTouch || tier === 'low' || prefersReducedMotion) return;
    const container = fieldRef.current;
    if (!container) return;

    let last = 0;
    const onMove = (e: MouseEvent) => {
      const now = performance.now();
      if (now - last < 16) return;
      last = now;
      const rect = container.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / rect.width;
      const ny = (e.clientY - rect.top) / rect.height;
      mouseX.set(nx);
      mouseY.set(ny);
      setMousePos({ x: nx, y: ny });
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMove);
  }, [isTouch, tier, prefersReducedMotion, mouseX, mouseY]);

  /* Magnetic card movement — springs handle animation, no RAF needed */
  useEffect(() => {
    if (phase !== 'live' || isTouch || tier === 'low' || prefersReducedMotion) return;

    STATS.forEach((stat, i) => {
      const dx = mousePos.x * 100 - stat.pos.x;
      const dy = mousePos.y * 100 - stat.pos.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 35 && dist > 0) {
        const force = (1 - dist / 35) * 12;
        cardSprings[i].x.set((dx / dist) * force);
        cardSprings[i].y.set((dy / dist) * force);
      } else {
        cardSprings[i].x.set(0);
        cardSprings[i].y.set(0);
      }
    });
  }, [phase, isTouch, tier, prefersReducedMotion, mousePos, cardSprings]);

  const enableDistortion = !isTouch && tier === 'high';
  const showFieldLines = phase === 'live' && tier !== 'low' && !prefersReducedMotion;

  return (
    <section id="impact" ref={sectionRef} className={styles.section}>
      {/* Background atmosphere */}
      <div className={styles.bgGlow} />
      <div className={styles.bgGrid} />

      {/* Section header */}
      <motion.div
        className={styles.header}
        style={{ y: headerY }}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.8, ease: EASE }}
      >
        <motion.span
          className={styles.label}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: EASE }}
        >
          Field Strength
        </motion.span>
        <motion.h2
          className={styles.title}
          initial={{ opacity: 0, y: 30, filter: 'blur(8px)' }}
          whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: EASE, delay: 0.1 }}
        >
          Measured in <br />
          <span className={styles.titleAccent}>Magnitude.</span>
        </motion.h2>
      </motion.div>

      {/* Field container — absolute positioning for stats + SVG overlays */}
      <div ref={fieldRef} className={styles.fieldContainer}>
        {/* EMP wave */}
        <EMPWave
          fired={phase === 'activating' || phase === 'live'}
          onStatHit={handleStatHit}
        />

        {/* Circuit traces */}
        {activatedIds.size >= 2 && !prefersReducedMotion && (
          <CircuitTraces activatedIds={activatedIds} />
        )}

        {/* Magnetic field lines */}
        {showFieldLines && (
          <MagneticFieldLines
            active
            mouseX={mousePos.x}
            mouseY={mousePos.y}
            enableDistortion={enableDistortion}
          />
        )}

        {/* Stat cards */}
        {STATS.map((stat, i) => {
          const isActivated = activatedIds.has(stat.id);
          const isLive = phase === 'live';
          const sparkCount = tier === 'high' ? 10 : tier === 'mid' ? 6 : 0;

          return (
            <motion.div
              key={stat.id}
              className={`${styles.statCard} ${isActivated ? styles.statCardActive : ''}`}
              style={{
                left: `${stat.pos.x}%`,
                top: `${stat.pos.y}%`,
                x: isLive && !isTouch && tier !== 'low' ? cardSprings[i].x : 0,
                y: isLive && !isTouch && tier !== 'low' ? cardSprings[i].y : 0,
              }}
              initial={{ opacity: 0, scale: 0.85, filter: 'blur(12px)' }}
              animate={
                isActivated
                  ? { opacity: 1, scale: 1, filter: 'blur(0px)' }
                  : prefersReducedMotion
                    ? { opacity: 1, scale: 1, filter: 'blur(0px)' }
                    : {}
              }
              transition={{ duration: 0.8, ease: EASE }}
              tabIndex={0}
              role="article"
              aria-label={`${stat.value}${stat.suffix} ${stat.label} — ${stat.sublabel}`}
            >
              {/* Glass layers */}
              <div className={styles.cardGlass} />
              <div className={styles.cardShine} />

              {/* Spark burst on activation */}
              {!prefersReducedMotion && sparkCount > 0 && (
                <SparkBurst active={isActivated} count={sparkCount} />
              )}

              {/* Counter + label */}
              <div className={styles.statContent}>
                <SpringCounter
                  end={stat.value}
                  decimals={stat.decimals}
                  suffix={stat.suffix}
                  triggered={isActivated}
                  reduced={prefersReducedMotion}
                />
                <span className={styles.statLabel}>{stat.label}</span>
                <span className={styles.statSublabel}>{stat.sublabel}</span>
              </div>

              {/* Activation glow ring */}
              <motion.div
                className={styles.glowRing}
                initial={{ opacity: 0, scale: 0.6 }}
                animate={isActivated ? { opacity: [0, 0.5, 0], scale: [0.6, 1.3, 1.5] } : {}}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};
