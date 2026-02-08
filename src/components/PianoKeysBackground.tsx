import { useEffect, useRef, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import styles from './PianoKeysBackground.module.css';

interface KeyConfig {
  id: number;
  height: string;
  isBlack: boolean;
  revealDelay: number;
  floatDuration: number;
  floatDelay: number;
  floatAmount: number;
}

interface PianoKeysBackgroundProps {
  /** Number of white keys to render */
  keyCount?: number;
  /** Enable mouse interaction effects */
  interactive?: boolean;
}

/**
 * Premium glassmorphic hero background inspired by translucent piano keys.
 * Features staggered load animations and cursor-reactive glow effects.
 */
export const PianoKeysBackground = ({
  keyCount = 14,
  interactive = true,
}: PianoKeysBackgroundProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const keysRef = useRef<(HTMLDivElement | null)[]>([]);
  const animationFrameRef = useRef<number>();

  // Generate key configurations with chaos-to-order reveal pattern
  const keys = useMemo(() => {
    const configs: KeyConfig[] = [];
    let keyIndex = 0;
    
    // Heights that create a wave-like pattern
    const heightPattern = [
      '55%', '62%', '70%', '65%', '75%', '68%', '72%',
      '58%', '66%', '73%', '60%', '78%', '64%', '69%'
    ];
    
    // Black key positions (after which white key index)
    const blackKeyPositions = [0, 1, 3, 4, 5, 7, 8, 10, 11, 12];
    
    // Generate pseudo-random delays that trend toward order
    // First keys have high variance, later keys become more predictable
    const generateRevealDelay = (index: number, total: number) => {
      const progress = index / total; // 0 to 1
      
      // Early keys: high randomness (0.4-2s range)
      // Later keys: low randomness, sequential timing
      const randomFactor = 1 - progress; // 1 at start, 0 at end
      const baseTiming = index * 0.2; // Slower sequential base
      const chaos = (Math.random() - 0.3) * 1.5 * randomFactor; // Wider random offset
      
      return Math.max(0.15, baseTiming + chaos);
    };
    
    for (let i = 0; i < keyCount; i++) {
      // White key
      configs.push({
        id: keyIndex++,
        height: heightPattern[i % heightPattern.length],
        isBlack: false,
        // Chaos-to-order reveal delay
        revealDelay: generateRevealDelay(i, keyCount),
        floatDuration: 20 + Math.random() * 10,
        floatDelay: Math.random() * -25,
        floatAmount: 4 + Math.random() * 5,
      });
      
      // Add black key after certain white keys
      if (blackKeyPositions.includes(i) && i < keyCount - 1) {
        configs.push({
          id: keyIndex++,
          height: '35%',
          isBlack: true,
          // Black keys appear slightly after their adjacent white key
          revealDelay: generateRevealDelay(i, keyCount) + 0.2 + Math.random() * 0.3,
          floatDuration: 18 + Math.random() * 6,
          floatDelay: Math.random() * -18,
          floatAmount: 3 + Math.random() * 3,
        });
      }
    }
    
    return configs;
  }, [keyCount]);

  // Mouse interaction - proximity-based glow
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!interactive) return;
    
    const keys = keysRef.current;
    const mouseX = e.clientX;
    const mouseY = e.clientY;
    
    keys.forEach((key) => {
      if (!key) return;
      
      const rect = key.getBoundingClientRect();
      const keyCenterX = rect.left + rect.width / 2;
      const keyCenterY = rect.top + rect.height / 2;
      
      const dx = mouseX - keyCenterX;
      const dy = mouseY - keyCenterY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      const maxDistance = 250;
      const glowIntensity = Math.max(0, 1 - distance / maxDistance);
      
      if (glowIntensity > 0) {
        key.style.setProperty('--glow', glowIntensity.toFixed(3));
        key.classList.add(styles.glowing);
      } else {
        key.classList.remove(styles.glowing);
        key.style.setProperty('--glow', '0');
      }
    });
  }, [interactive]);

  // Throttled mouse move handler
  useEffect(() => {
    if (!interactive) return;
    
    let lastCall = 0;
    const throttleMs = 16; // ~60fps
    
    const throttledHandler = (e: MouseEvent) => {
      const now = Date.now();
      if (now - lastCall >= throttleMs) {
        lastCall = now;
        handleMouseMove(e);
      }
    };
    
    window.addEventListener('mousemove', throttledHandler, { passive: true });
    
    return () => {
      window.removeEventListener('mousemove', throttledHandler);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [handleMouseMove, interactive]);

  // Clear glow when mouse leaves
  useEffect(() => {
    const handleMouseLeave = () => {
      keysRef.current.forEach((key) => {
        if (key) {
          key.classList.remove(styles.glowing);
          key.style.setProperty('--glow', '0');
        }
      });
    };
    
    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, []);

  return (
    <div ref={containerRef} className={styles.container}>
      {/* Ambient gradient orbs - deepest layer */}
      <div className={styles.orbLayer}>
        <motion.div
          className={`${styles.orb} ${styles.orb1}`}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 2, delay: 0.2, ease: 'easeOut' }}
        />
        <motion.div
          className={`${styles.orb} ${styles.orb2}`}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 2.5, delay: 0.4, ease: 'easeOut' }}
        />
        <motion.div
          className={`${styles.orb} ${styles.orb3}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ duration: 3, delay: 0.6, ease: 'easeOut' }}
        />
      </div>

      {/* Piano keys layer */}
      <div className={styles.keysLayer}>
        {keys.map((key, index) => (
          <div
            key={key.id}
            ref={(el) => { keysRef.current[index] = el; }}
            className={`${styles.key} ${key.isBlack ? styles.keyBlack : ''}`}
            style={{
              '--key-height': key.height,
              '--reveal-delay': `${key.revealDelay}s`,
              '--float-duration': `${key.floatDuration}s`,
              '--float-delay': `${key.floatDelay}s`,
              '--float-amount': `${-key.floatAmount}px`,
            } as React.CSSProperties}
          >
            <div className={styles.keyInner} />
          </div>
        ))}
      </div>

      {/* Noise texture overlay */}
      <div className={styles.noiseOverlay} />

      {/* Bottom fade for content integration */}
      <div className={styles.bottomFade} />
    </div>
  );
};
