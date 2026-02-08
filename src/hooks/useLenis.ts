import { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import { useDeviceCapability } from './useDeviceCapability';

/**
 * Lenis Smooth Scroll
 *
 * Desktop-only buttery smooth scrolling with inertial momentum.
 * Disabled on touch devices (native momentum is better) and
 * when user prefers reduced motion.
 */
export const useLenis = () => {
  const { isTouch, prefersReducedMotion } = useDeviceCapability();
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // Only enable on desktop with no motion preference
    if (isTouch || prefersReducedMotion) return;

    const lenis = new Lenis({
      lerp: 0.09,          // Subtle smoothing (lower = smoother but laggier)
      duration: 1.2,        // Scroll duration
      smoothWheel: true,    // Smooth mouse wheel
      touchMultiplier: 1,   // Don't modify touch (shouldn't be active anyway)
    });

    lenisRef.current = lenis;
    let rafId: number | undefined;

    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };

    rafId = requestAnimationFrame(raf);

    return () => {
      if (rafId != null) cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [isTouch, prefersReducedMotion]);

  return lenisRef;
};
