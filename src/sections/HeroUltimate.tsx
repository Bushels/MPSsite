import { useEffect, useRef, useCallback, useMemo, useState } from 'react';
import { motion, useScroll, useTransform, useSpring, useMotionValue, AnimatePresence } from 'framer-motion';
import { useDeviceCapability } from '../hooks/useDeviceCapability';
import styles from './HeroUltimate.module.css';

/* ─────────────────────────────────────────────
   HERO ULTIMATE — "FLOW"

   Piano key architecture: tall white keys with
   shorter black keys nestled between them.
   Variable heights create organic rhythm.
   5-layer glass material per key.
   Positional glow tracks cursor Y.

   SUBMERSION ENTRANCE: SVG displacement filter
   creates liquid surface effect. Camera "breaches"
   the surface, keys revealed through distortion
   clearing. Clarity pulse on arrival.
   ───────────────────────────────────────────── */

interface KeyConfig {
  id: number;
  isBlack: boolean;
  heightPct: number;
  revealDelay: number;
  floatDuration: number;
  floatAmount: number;
}

const CAPABILITIES = ['PIPEFITTING', 'WELDING', 'FABRICATION', 'MODULAR ASSEMBLY', 'MACHINING'];
const FLOW_CHARS = ['F', 'L', 'O', 'W'];

const OCTAVE_PATTERN = [
  false, true, false, true, false,
  false, true, false, true, false, true, false,
];

const getWhiteKeyCount = () => {
  if (typeof window === 'undefined') return 14;
  if (window.innerWidth <= 480) return 7;
  if (window.innerWidth <= 768) return 9;
  if (window.innerWidth <= 1024) return 11;
  return 14;
};

export const HeroUltimate = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const keysRef = useRef<(HTMLDivElement | null)[]>([]);
  const displacementRef = useRef<SVGFEDisplacementMapElement>(null);
  const turbulenceRef = useRef<SVGFETurbulenceElement>(null);
  const [phase, setPhase] = useState(0);
  const [whiteKeyCount] = useState(getWhiteKeyCount);
  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);
  const { tier, prefersReducedMotion } = useDeviceCapability();

  // ── Scroll parallax ──
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"]
  });

  const contentY = useTransform(scrollYProgress, [0, 0.6], [0, -120]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.35], [1, 0]);
  const contentScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.97]);

  const keysY = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const keysScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.96]);
  const keysBlur = useTransform(scrollYProgress, [0, 0.4], [0, 4]);

  const smoothX = useSpring(cursorX, { stiffness: 30, damping: 25 });
  const smoothY = useSpring(cursorY, { stiffness: 30, damping: 25 });

  // ── Key generation ──
  const keys = useMemo(() => {
    const configs: KeyConfig[] = [];
    let keyIndex = 0;

    const fullPattern: boolean[] = [];
    let whitesSoFar = 0;
    let patIdx = 0;
    while (whitesSoFar < whiteKeyCount) {
      const isBlack = OCTAVE_PATTERN[patIdx % OCTAVE_PATTERN.length];
      fullPattern.push(isBlack);
      if (!isBlack) whitesSoFar++;
      patIdx++;
    }

    const totalKeys = fullPattern.length;

    for (let i = 0; i < totalKeys; i++) {
      const isBlack = fullPattern[i];
      const normalized = i / (totalKeys - 1);
      const wave = Math.sin(normalized * Math.PI * 2.5 + 0.5);

      let heightPct: number;
      if (isBlack) {
        heightPct = 30 + wave * 3 + (Math.random() - 0.5) * 2;
      } else {
        heightPct = 54 + wave * 5 + (Math.random() - 0.5) * 3;
      }

      const baseDelay = 0.3;
      const waveDuration = 0.9;
      const jitter = (Math.random() - 0.5) * 0.06;
      const revealDelay = baseDelay + normalized * waveDuration + jitter;

      configs.push({
        id: keyIndex++,
        isBlack,
        heightPct,
        revealDelay,
        floatDuration: 18 + Math.random() * 12,
        floatAmount: isBlack ? (1.5 + Math.random() * 2) : (2 + Math.random() * 3),
      });
    }

    return configs;
  }, [whiteKeyCount]);

  // ── Mouse glow with position tracking ──
  const handleMouseMove = useCallback((e: MouseEvent) => {
    cursorX.set(e.clientX);
    cursorY.set(e.clientY);

    keysRef.current.forEach((key) => {
      if (!key) return;
      const rect = key.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const maxDist = 300;
      const glow = Math.max(0, 1 - dist / maxDist);

      const yNorm = Math.max(0, Math.min(1,
        (e.clientY - rect.top) / rect.height
      ));

      key.style.setProperty('--glow', glow.toFixed(3));
      key.style.setProperty('--glow-y', yNorm.toFixed(3));

      if (glow > 0.01) {
        key.classList.add(styles.glowing);
      } else {
        key.classList.remove(styles.glowing);
      }
    });
  }, [cursorX, cursorY]);

  useEffect(() => {
    let lastCall = 0;
    const handler = (e: MouseEvent) => {
      const now = Date.now();
      if (now - lastCall >= 16) {
        lastCall = now;
        handleMouseMove(e);
      }
    };
    window.addEventListener('mousemove', handler, { passive: true });
    return () => window.removeEventListener('mousemove', handler);
  }, [handleMouseMove]);

  useEffect(() => {
    const handleLeave = () => {
      keysRef.current.forEach((key) => {
        if (key) {
          key.classList.remove(styles.glowing);
          key.style.setProperty('--glow', '0');
          key.style.setProperty('--glow-y', '0.5');
        }
      });
    };
    document.addEventListener('mouseleave', handleLeave);
    return () => document.removeEventListener('mouseleave', handleLeave);
  }, []);

  // ── SUBMERSION ENTRANCE SEQUENCE ──
  // SVG displacement filter creates liquid distortion that clears as user "breaches the surface"
  useEffect(() => {
    if (prefersReducedMotion) {
      setPhase(2);
      return;
    }

    setPhase(1);

    // Skip submersion on low-end devices
    if (tier === 'low') {
      const timer = setTimeout(() => setPhase(2), 800);
      return () => clearTimeout(timer);
    }

    const displacement = displacementRef.current;
    const turbulence = turbulenceRef.current;
    if (!displacement || !turbulence) {
      const timer = setTimeout(() => setPhase(2), 1800);
      return () => clearTimeout(timer);
    }

    // Submersion parameters
    const startScale = tier === 'mid' ? 25 : 40; // displacement intensity
    const startFreq = 0.015;
    const endFreq = 0.003;
    const duration = tier === 'mid' ? 2000 : 2800; // ms
    const startTime = performance.now();
    let rafId: number;

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);

      // Custom ease: fast start, slow finish (expo out)
      const eased = 1 - Math.pow(1 - progress, 3);

      // Displacement scale: high → 0 (distortion clears)
      const scale = startScale * (1 - eased);
      displacement.setAttribute('scale', scale.toFixed(1));

      // Turbulence frequency: decreases (ripples calm down)
      const freq = startFreq + (endFreq - startFreq) * eased;
      turbulence.setAttribute('baseFrequency', freq.toFixed(4));

      if (progress < 1) {
        rafId = requestAnimationFrame(animate);
      } else {
        // Remove the filter entirely for zero performance cost
        displacement.setAttribute('scale', '0');
        setPhase(2);
      }
    };

    // Small delay before starting submersion
    const startDelay = setTimeout(() => {
      rafId = requestAnimationFrame(animate);
    }, 400);

    return () => {
      clearTimeout(startDelay);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [tier, prefersReducedMotion]);

  // ── Animation variants ──
  const contentContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.14, delayChildren: 0 },
    },
  };

  const logoReveal = {
    hidden: { opacity: 0, scale: 0.92, filter: 'blur(10px)' },
    visible: {
      opacity: 1,
      scale: 1,
      filter: 'blur(0px)',
      transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] },
    },
  };

  // Per-character title animation with spring physics
  const charReveal = {
    hidden: { y: 80, opacity: 0, filter: 'blur(20px)', rotateX: -25 },
    visible: (i: number) => ({
      y: 0,
      opacity: 1,
      filter: 'blur(0px)',
      rotateX: 0,
      transition: {
        delay: i * 0.08,
        type: "spring",
        stiffness: 25,
        damping: 16,
        mass: 1.4,
      },
    }),
  };

  const fadeUp = {
    hidden: { y: 25, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 50, damping: 20 },
    },
  };

  const lineGrow = {
    hidden: { scaleX: 0, opacity: 0 },
    visible: {
      scaleX: 1,
      opacity: 1,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
    },
  };

  const capabilityVariant = {
    hidden: { opacity: 0, y: 10 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.6 + i * 0.1,
        type: "spring",
        stiffness: 60,
        damping: 20,
      },
    }),
  };

  return (
    <motion.section ref={sectionRef} className={styles.hero}>
      {/* SVG Filters — Hidden, referenced by CSS */}
      <svg className={styles.svgFilters} aria-hidden="true">
        <defs>
          <filter id="submersion" x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence
              ref={turbulenceRef}
              type="turbulence"
              baseFrequency="0.015"
              numOctaves={tier === 'mid' ? 2 : 3}
              seed="42"
              stitchTiles="stitch"
              result="turbulence"
            />
            <feDisplacementMap
              ref={displacementRef}
              in="SourceGraphic"
              in2="turbulence"
              scale="40"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>

      {/* Ambient cursor light */}
      <motion.div
        className={styles.cursorGlow}
        style={{ x: smoothX, y: smoothY }}
      />

      {/* ── Keys Background ── */}
      <motion.div
        className={`${styles.keysContainer} ${phase === 1 ? styles.submersing : ''} ${phase >= 2 ? styles.surfaced : ''}`}
        style={{
          y: keysY,
          scale: keysScale,
          filter: useTransform(keysBlur, (v) => `blur(${v}px)`),
        }}
      >
        <div className={styles.orbLayer}>
          <motion.div
            className={`${styles.orb} ${styles.orb1}`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 3, delay: 0.8, ease: 'easeOut' }}
          />
          <motion.div
            className={`${styles.orb} ${styles.orb2}`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 3.5, delay: 1.2, ease: 'easeOut' }}
          />
        </div>

        <div className={styles.keysLayer}>
          {keys.map((key, index) => (
            <div
              key={key.id}
              ref={(el) => { keysRef.current[index] = el; }}
              className={`${styles.key} ${key.isBlack ? styles.keyBlack : styles.keyWhite}`}
              style={{
                '--key-height': `${key.heightPct}%`,
                '--reveal-delay': `${key.revealDelay}s`,
                '--float-duration': `${key.floatDuration}s`,
                '--float-amount': `${-key.floatAmount}px`,
                '--glow': '0',
                '--glow-y': '0.5',
              } as React.CSSProperties}
            >
              <div className={styles.keyShell}>
                <div className={styles.keyGlass} />
                <div className={styles.keyHighlight} />
                <div className={styles.keyCaustic} />
                <div className={styles.keyGlowSpot} />
              </div>
            </div>
          ))}
        </div>

        <div className={styles.noiseOverlay} />
        <div className={styles.bottomFade} />
      </motion.div>

      {/* ── Submersion surface line ── */}
      <motion.div
        className={styles.surfaceLine}
        initial={{ opacity: 0 }}
        animate={{
          opacity: phase === 1 ? [0, 0.6, 0.8, 0] : 0,
        }}
        transition={{
          duration: tier === 'mid' ? 2 : 2.8,
          delay: 0.3,
          times: [0, 0.2, 0.6, 1],
          ease: 'easeInOut',
        }}
      />

      {/* ── Clarity pulse (flash when surfacing completes) ── */}
      <motion.div
        className={styles.clarityPulse}
        initial={{ opacity: 0 }}
        animate={{
          opacity: phase === 2 ? [0, 0.08, 0] : 0,
        }}
        transition={{
          duration: 0.6,
          ease: 'easeOut',
        }}
      />

      {/* ── Content Layer ── */}
      <motion.div
        className={styles.content}
        style={{ y: contentY, opacity: contentOpacity, scale: contentScale }}
      >
        <AnimatePresence>
          {phase >= 2 && (
            <motion.div
              className={styles.titleBlock}
              variants={contentContainer}
              initial="hidden"
              animate="visible"
            >
              <motion.div variants={logoReveal} className={styles.logoComposed}>
                <img src="/MPS Logo.png" alt="MPS Group" className={styles.logo} />
              </motion.div>

              <motion.div variants={lineGrow} className={styles.logoSeparator} />

              {/* Per-character FLOW title with spring physics */}
              <motion.h1 className={styles.flowTitle} style={{ perspective: 600 }}>
                {FLOW_CHARS.map((char, i) => (
                  <motion.span
                    key={char}
                    className={styles.flowChar}
                    variants={charReveal}
                    custom={i}
                    initial="hidden"
                    animate="visible"
                  >
                    {char}
                  </motion.span>
                ))}
              </motion.h1>

              <motion.div variants={fadeUp} className={styles.descriptorRow}>
                <span className={styles.descriptorLine} />
                <span className={styles.descriptor}>
                  Surface fabrication. Downhole innovation.
                </span>
                <span className={styles.descriptorLine} />
              </motion.div>

              <motion.div variants={fadeUp} className={styles.capabilities}>
                {CAPABILITIES.map((cap, i) => (
                  <motion.span
                    key={cap}
                    className={styles.capItem}
                    variants={capabilityVariant}
                    custom={i}
                    initial="hidden"
                    animate="visible"
                  >
                    {i > 0 && <span className={styles.capDot} />}
                    {cap}
                  </motion.span>
                ))}
              </motion.div>

              <motion.div variants={fadeUp} className={styles.ctaWrapper}>
                <motion.a
                  href="#services"
                  className={styles.cta}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <span className={styles.ctaText}>See What We Build</span>
                  <span className={styles.ctaArrow}>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M10 4v12M6 12l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                </motion.a>
              </motion.div>

              <motion.div variants={fadeUp} className={styles.badge}>
                <span className={styles.badgeLine} />
                <span className={styles.badgeText}>EST. 2004 · PIERCELAND, SK</span>
                <span className={styles.badgeLine} />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          className={styles.scrollIndicator}
          initial={{ opacity: 0 }}
          animate={{ opacity: phase >= 2 ? 1 : 0 }}
          transition={{ duration: 1, delay: 2.5 }}
        >
          <div className={styles.scrollTrack}>
            <motion.div
              className={styles.scrollDot}
              animate={{
                y: [0, 28, 0],
                opacity: [0.9, 0.15, 0.9],
              }}
              transition={{
                duration: 2.6,
                repeat: Infinity,
                ease: [0.16, 1, 0.3, 1],
              }}
            />
          </div>
        </motion.div>
      </motion.div>
    </motion.section>
  );
};
