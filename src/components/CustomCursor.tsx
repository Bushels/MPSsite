import { useEffect, useState, createContext, useContext, useCallback } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';
import { useDeviceCapability } from '../hooks/useDeviceCapability';
import styles from './CustomCursor.module.css';

type CursorState = 'default' | 'hover' | 'text' | 'action' | 'hidden';

interface CursorContextType {
  setCursorState: (state: CursorState) => void;
}

const CursorContext = createContext<CursorContextType>({
  setCursorState: () => {},
});

export const useCursor = () => useContext(CursorContext);

/**
 * Custom Cursor
 *
 * Replaces the default cursor with a smooth, context-aware element.
 * - Default: Small dot with soft ring
 * - Hover: Ring expands, dot scales up
 * - Text: Vertical line cursor
 * - Action: Ring contracts, dot pulses
 * - Hidden: Both fade out
 *
 * Desktop only. Springs for buttery interpolation.
 */
export const CustomCursor = ({ children }: { children: React.ReactNode }) => {
  const { isTouch, prefersReducedMotion } = useDeviceCapability();
  const [cursorState, setCursorState] = useState<CursorState>('default');
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  // Spring-smoothed positions
  const springX = useSpring(cursorX, { stiffness: 300, damping: 28, mass: 0.5 });
  const springY = useSpring(cursorY, { stiffness: 300, damping: 28, mass: 0.5 });
  // Ring follows slower for parallax feel
  const ringX = useSpring(cursorX, { stiffness: 150, damping: 22, mass: 0.8 });
  const ringY = useSpring(cursorY, { stiffness: 150, damping: 22, mass: 0.8 });

  const setCursorStateCb = useCallback((state: CursorState) => {
    setCursorState(state);
  }, []);

  useEffect(() => {
    if (isTouch || prefersReducedMotion) return;

    const move = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };

    // Auto-detect hover targets
    const handleOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;
      const isInteractive = target.closest('button, a, [role="button"], input, textarea, select, [data-cursor="action"]');
      const isText = target.closest('p, span, h1, h2, h3, h4, h5, h6, li, [data-cursor="text"]');

      if (target.closest('[data-cursor="hidden"]')) {
        setCursorState('hidden');
      } else if (isInteractive) {
        setCursorState('hover');
      } else if (isText && !isInteractive) {
        setCursorState('text');
      } else {
        setCursorState('default');
      }
    };

    window.addEventListener('mousemove', move, { passive: true });
    document.addEventListener('mouseover', handleOver, { passive: true });

    return () => {
      window.removeEventListener('mousemove', move);
      document.removeEventListener('mouseover', handleOver);
    };
  }, [isTouch, prefersReducedMotion, cursorX, cursorY]);

  // Don't render cursor on touch devices
  if (isTouch || prefersReducedMotion) {
    return (
      <CursorContext.Provider value={{ setCursorState: setCursorStateCb }}>
        {children}
      </CursorContext.Provider>
    );
  }

  return (
    <CursorContext.Provider value={{ setCursorState: setCursorStateCb }}>
      <div className={styles.cursorWrapper}>
        {/* Dot (follows tightly) */}
        <motion.div
          className={`${styles.cursorDot} ${styles[cursorState]}`}
          style={{
            x: springX,
            y: springY,
          }}
        />
        {/* Ring (follows loosely for parallax) */}
        <motion.div
          className={`${styles.cursorRing} ${styles[cursorState]}`}
          style={{
            x: ringX,
            y: ringY,
          }}
        />
      </div>
      {children}
    </CursorContext.Provider>
  );
};
