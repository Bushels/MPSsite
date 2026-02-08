import { useEffect, useRef } from 'react';
import { useDeviceCapability } from './useDeviceCapability';

/**
 * Adaptive Glass System
 *
 * Writes CSS custom properties to document root that drive dynamic glassmorphism:
 * --glass-scroll-depth    (0-1): How far down the page
 * --glass-scroll-velocity (0-1): Normalized scroll speed
 * --glass-mouse-x         (0-1): Cursor X position
 * --glass-mouse-y         (0-1): Cursor Y position
 * --glass-focus-intensity (0-1): Proximity to interactive elements
 *
 * These drive adaptive backdrop-filter, border, and glow properties across all glass surfaces.
 *
 * Performance: RAF only runs during active velocity decay. Pauses when idle.
 */
export const useAdaptiveGlass = () => {
  const { isTouch, prefersReducedMotion, tier } = useDeviceCapability();
  const frameRef = useRef<number | undefined>();
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const scrollVelRef = useRef(0);
  const lastScrollRef = useRef(0);
  const lastTimeRef = useRef(Date.now());
  const smoothVelRef = useRef(0);
  const isRunningRef = useRef(false);

  /* ─── Set performance tier CSS vars on mount ─── */
  useEffect(() => {
    const root = document.documentElement.style;
    if (tier === 'low') {
      // Zero blur — solid semi-transparent backgrounds only
      root.setProperty('--perf-blur', '0px');
      root.setProperty('--perf-blur-heavy', '0px');
      root.setProperty('--perf-blur-light', '0px');
      root.setProperty('--perf-saturate', '');
      root.setProperty('--perf-brightness', '');
      root.setProperty('--perf-backdrop', 'none');
      root.setProperty('--perf-backdrop-light', 'none');
      root.setProperty('--perf-glass-bg', 'rgba(5, 20, 45, 0.88)');
    } else if (tier === 'mid') {
      // Reduced blur, no saturate/brightness (mobile-friendly)
      root.setProperty('--perf-blur', '10px');
      root.setProperty('--perf-blur-heavy', '14px');
      root.setProperty('--perf-blur-light', '6px');
      root.setProperty('--perf-saturate', '');
      root.setProperty('--perf-brightness', '');
      root.setProperty('--perf-backdrop', 'blur(10px)');
      root.setProperty('--perf-backdrop-light', 'blur(6px)');
      root.setProperty('--perf-glass-bg', 'rgba(5, 20, 45, 0.65)');
    }
    // 'high' tier keeps the CSS defaults from variables.css
  }, [tier]);

  useEffect(() => {
    if (prefersReducedMotion) {
      // Set neutral values
      const root = document.documentElement.style;
      root.setProperty('--glass-scroll-depth', '0');
      root.setProperty('--glass-scroll-velocity', '0');
      root.setProperty('--glass-mouse-x', '0.5');
      root.setProperty('--glass-mouse-y', '0.5');
      root.setProperty('--glass-focus-intensity', '0');
      return;
    }

    const root = document.documentElement.style;

    // Start the velocity decay RAF loop (only runs when there's active velocity)
    const startLoop = () => {
      if (isRunningRef.current) return;
      isRunningRef.current = true;
      frameRef.current = requestAnimationFrame(tick);
    };

    // Mouse tracking (desktop only)
    const handleMouse = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX / window.innerWidth;
      mouseRef.current.y = e.clientY / window.innerHeight;
      // Write mouse position directly (no RAF needed)
      root.setProperty('--glass-mouse-x', mouseRef.current.x.toFixed(4));
      root.setProperty('--glass-mouse-y', mouseRef.current.y.toFixed(4));
    };

    // Scroll tracking — kick off RAF loop for velocity decay
    const handleScroll = () => {
      const now = Date.now();
      const dt = now - lastTimeRef.current;
      if (dt > 0) {
        const delta = Math.abs(window.scrollY - lastScrollRef.current);
        const rawVel = (delta / dt) * 16; // Normalize to ~60fps
        scrollVelRef.current = rawVel;
      }
      lastScrollRef.current = window.scrollY;
      lastTimeRef.current = now;

      // Update scroll depth immediately (cheap operation)
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const scrollDepth = maxScroll > 0 ? window.scrollY / maxScroll : 0;
      root.setProperty('--glass-scroll-depth', scrollDepth.toFixed(4));

      // Start velocity decay loop
      startLoop();
    };

    // Velocity decay tick — ONLY runs when velocity > threshold, then stops
    const tick = () => {
      smoothVelRef.current = smoothVelRef.current * 0.88 + scrollVelRef.current * 0.12;
      scrollVelRef.current *= 0.92;
      const normalizedVel = Math.min(1, smoothVelRef.current / 15);

      root.setProperty('--glass-scroll-velocity', normalizedVel.toFixed(4));

      // Stop loop when velocity is negligible
      if (Math.abs(smoothVelRef.current) < 0.01 && Math.abs(scrollVelRef.current) < 0.01) {
        root.setProperty('--glass-scroll-velocity', '0');
        isRunningRef.current = false;
        frameRef.current = undefined;
        return;
      }

      frameRef.current = requestAnimationFrame(tick);
    };

    // Set initial scroll depth
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    root.setProperty('--glass-scroll-depth', maxScroll > 0 ? (window.scrollY / maxScroll).toFixed(4) : '0');
    root.setProperty('--glass-scroll-velocity', '0');

    if (!isTouch) {
      root.setProperty('--glass-mouse-x', '0.5');
      root.setProperty('--glass-mouse-y', '0.5');
      window.addEventListener('mousemove', handleMouse, { passive: true });
    }
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      if (!isTouch) {
        window.removeEventListener('mousemove', handleMouse);
      }
      window.removeEventListener('scroll', handleScroll);
      if (frameRef.current != null) cancelAnimationFrame(frameRef.current);
      isRunningRef.current = false;
    };
  }, [isTouch, prefersReducedMotion, tier]);
};
