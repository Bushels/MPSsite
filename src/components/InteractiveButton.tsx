import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import styles from './InteractiveButton.module.css';

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
  className?: string;
}

export const InteractiveButton = ({ children, onClick, variant = 'primary', className }: ButtonProps) => {
  return (
    <motion.button
      className={clsx(styles.button, styles[variant], className)}
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <span className={styles.content}>{children}</span>
      {variant === 'primary' && <motion.div className={styles.glow} layoutId="glow" />}
    </motion.button>
  );
};
