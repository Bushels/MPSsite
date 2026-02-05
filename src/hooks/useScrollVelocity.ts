import { useState, useEffect, useRef } from 'react';

export const useScrollVelocity = () => {
  const [velocity, setVelocity] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const lastScrollY = useRef(0);
  const lastTime = useRef(Date.now());
  const velocityRef = useRef(0);
  const frameRef = useRef<number>();

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const currentTime = Date.now();
      const deltaY = currentScrollY - lastScrollY.current;
      const deltaTime = currentTime - lastTime.current;
      
      if (deltaTime > 0) {
        // Calculate velocity (pixels per millisecond, scaled for usability)
        const rawVelocity = (deltaY / deltaTime) * 16; // Normalized to ~60fps
        // Smooth the velocity
        velocityRef.current = velocityRef.current * 0.8 + rawVelocity * 0.2;
      }
      
      lastScrollY.current = currentScrollY;
      lastTime.current = currentTime;
      setScrollY(currentScrollY);
    };

    // Decay velocity when not scrolling
    const decayVelocity = () => {
      velocityRef.current *= 0.95;
      setVelocity(velocityRef.current);
      frameRef.current = requestAnimationFrame(decayVelocity);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    frameRef.current = requestAnimationFrame(decayVelocity);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, []);

  return { velocity, scrollY };
};
