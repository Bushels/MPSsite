import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import styles from './PhysicsCounter.module.css';

interface PhysicsCounterProps {
  end: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
  className?: string;
  label?: string;
}

export const PhysicsCounter = ({
  end,
  duration = 2000,
  suffix = '',
  prefix = '',
  className,
  label,
}: PhysicsCounterProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [displayValue, setDisplayValue] = useState(0);
  
  useEffect(() => {
    if (!isInView) return;

    const startTime = Date.now();
    let frameRef: number;
    
    // Spring physics parameters
    const stiffness = 120;
    const damping = 15;
    
    let currentValue = 0;
    let velocity = 0;
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      
      if (elapsed < duration) {
        // Ease-out progress
        const progress = 1 - Math.pow(1 - elapsed / duration, 3);
        const target = end * progress;
        
        // Apply spring physics for overshoot effect
        const springForce = (target - currentValue) * (stiffness / 1000);
        const dampingForce = velocity * (damping / 1000);
        
        velocity += springForce - dampingForce;
        currentValue += velocity;
        
        setDisplayValue(Math.round(currentValue));
        frameRef = requestAnimationFrame(animate);
      } else {
        // Final spring settle
        const springForce = (end - currentValue) * (stiffness / 1000);
        const dampingForce = velocity * (damping / 1000);
        
        velocity += springForce - dampingForce;
        currentValue += velocity;
        
        if (Math.abs(end - currentValue) < 0.5 && Math.abs(velocity) < 0.1) {
          setDisplayValue(end);
        } else {
          setDisplayValue(Math.round(currentValue));
          frameRef = requestAnimationFrame(animate);
        }
      }
    };

    frameRef = requestAnimationFrame(animate);
    
    return () => cancelAnimationFrame(frameRef);
  }, [isInView, end, duration]);

  return (
    <motion.div
      ref={ref}
      className={`${styles.counter} ${className || ''}`}
      initial={{ opacity: 0, y: 40, rotateX: -15 }}
      animate={isInView ? { opacity: 1, y: 0, rotateX: 0 } : {}}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className={styles.value}>
        {prefix}
        <span className={styles.number}>{displayValue.toLocaleString()}</span>
        {suffix}
      </div>
      {label && <div className={styles.label}>{label}</div>}
    </motion.div>
  );
};
