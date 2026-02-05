import { useRef, useEffect, useState } from 'react';

interface SpringConfig {
  stiffness?: number;
  damping?: number;
  mass?: number;
}

export const useSpringValue = (
  target: number,
  config: SpringConfig = {}
) => {
  const { stiffness = 100, damping = 10, mass = 1 } = config;
  
  const [value, setValue] = useState(target);
  const velocityRef = useRef(0);
  const currentRef = useRef(target);
  const frameRef = useRef<number>();

  useEffect(() => {
    const animate = () => {
      const current = currentRef.current;
      const velocity = velocityRef.current;
      
      // Spring physics: F = -kx - cv
      const springForce = -stiffness * (current - target);
      const dampingForce = -damping * velocity;
      const acceleration = (springForce + dampingForce) / mass;
      
      // Semi-implicit Euler integration
      const newVelocity = velocity + acceleration * 0.016; // ~60fps timestep
      const newValue = current + newVelocity * 0.016;
      
      velocityRef.current = newVelocity;
      currentRef.current = newValue;
      
      // Check if animation is essentially complete
      const isSettled = 
        Math.abs(newValue - target) < 0.01 && 
        Math.abs(newVelocity) < 0.01;
      
      if (!isSettled) {
        setValue(newValue);
        frameRef.current = requestAnimationFrame(animate);
      } else {
        setValue(target);
        currentRef.current = target;
        velocityRef.current = 0;
      }
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [target, stiffness, damping, mass]);

  return value;
};
