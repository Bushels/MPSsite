import { useRef, ReactNode, CSSProperties } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { useDeviceCapability } from '../hooks/useDeviceCapability';

interface MagneticElementProps {
  children: ReactNode;
  strength?: number;
  className?: string;
  style?: CSSProperties;
  as?: 'div' | 'button' | 'a' | 'span';
}

/**
 * MagneticElement — Spring-physics cursor attraction
 *
 * Gracefully degrades:
 * - Touch devices: renders static wrapper (no mouse tracking)
 * - Reduced motion: renders static wrapper (no spring physics)
 * - Desktop: full magnetic spring physics
 */
export const MagneticElement = ({
  children,
  strength = 0.3,
  className,
  style,
  as = 'div',
}: MagneticElementProps) => {
  const { isTouch, prefersReducedMotion } = useDeviceCapability();
  const ref = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { stiffness: 150, damping: 15, mass: 0.1 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  // On touch or reduced motion, render a static wrapper
  if (isTouch || prefersReducedMotion) {
    const Tag = as as keyof JSX.IntrinsicElements;
    return (
      <Tag className={className} style={style}>
        {children}
      </Tag>
    );
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const deltaX = (e.clientX - centerX) * strength;
    const deltaY = (e.clientY - centerY) * strength;

    x.set(deltaX);
    y.set(deltaY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const MotionComponent = motion[as] as typeof motion.div;

  return (
    <MotionComponent
      ref={ref}
      className={className}
      style={{
        ...style,
        x: springX,
        y: springY,
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </MotionComponent>
  );
};
