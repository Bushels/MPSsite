import { ReactNode, useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import styles from './AmbientCard.module.css';

interface AmbientCardProps {
  children: ReactNode;
  className?: string;
  glowColor?: string;
}

export const AmbientCard = ({
  children,
  className,
  glowColor = 'rgba(37, 99, 235, 0.4)',
}: AmbientCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [lightPosition, setLightPosition] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!cardRef.current) return;
      
      const rect = cardRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      
      setLightPosition({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <motion.div
      ref={cardRef}
      className={clsx(styles.card, className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      viewport={{ once: true, margin: '-50px' }}
      style={{
        '--light-x': `${lightPosition.x}%`,
        '--light-y': `${lightPosition.y}%`,
        '--glow-color': glowColor,
        '--glow-opacity': isHovered ? 0.6 : 0.3,
      } as React.CSSProperties}
    >
      <div className={styles.ambientLight} />
      <div className={styles.reflectiveEdge} />
      <div className={styles.content}>
        {children}
      </div>
    </motion.div>
  );
};
