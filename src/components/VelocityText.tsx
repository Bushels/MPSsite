import { ReactNode, useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import styles from './VelocityText.module.css';

interface VelocityTextProps {
  children: ReactNode;
  className?: string;
  maxSkew?: number;
  maxScale?: number;
}

export const VelocityText = ({
  children,
  className,
  maxSkew = 25,
  maxScale = 1.15,
}: VelocityTextProps) => {
  const [skew, setSkew] = useState(0);
  const [scaleX, setScaleX] = useState(1);
  const lastScrollRef = useRef(0);
  const velocityRef = useRef(0);
  const frameRef = useRef<number>();

  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.scrollY;
      const delta = currentScroll - lastScrollRef.current;
      velocityRef.current = delta;
      lastScrollRef.current = currentScroll;
    };

    const animate = () => {
      // Decay velocity more slowly for visible effect
      velocityRef.current *= 0.85;
      
      // Calculate effects with higher sensitivity
      const vel = velocityRef.current;
      const newSkew = Math.max(-maxSkew, Math.min(maxSkew, vel * 1.5));
      const newScaleX = 1 + Math.abs(vel) * 0.008 * (maxScale - 1);
      
      setSkew(newSkew);
      setScaleX(Math.min(maxScale, newScaleX));
      
      frameRef.current = requestAnimationFrame(animate);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    frameRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [maxSkew, maxScale]);

  return (
    <motion.div
      className={`${styles.velocityText} ${className || ''}`}
      style={{
        transform: `skewY(${skew}deg) scaleX(${scaleX})`,
      }}
    >
      {children}
    </motion.div>
  );
};
