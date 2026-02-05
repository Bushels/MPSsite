import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MagneticElement } from './MagneticElement';
import styles from './FluidNav.module.css';

const navItems = [
  { label: 'Services', href: '#services' },
  { label: 'Impact', href: '#impact' },
  { label: 'About', href: '#about' },
  { label: 'Contact', href: '#contact' },
];

export const FluidNav = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    let lastScrollY = 0;
    
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollingDown = currentScrollY > lastScrollY;
      
      // Show nav after scrolling down 100px
      if (currentScrollY > 100 && scrollingDown) {
        setIsVisible(true);
      } else if (currentScrollY < 50) {
        setIsVisible(false);
      }
      
      lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.nav
          className={styles.nav}
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className={styles.container}>
            <MagneticElement strength={0.15} className={styles.logo}>
              <span className={styles.logoText}>MPS</span>
            </MagneticElement>

            <ul className={styles.links}>
              {navItems.map((item, index) => (
                <li key={item.label}>
                  <MagneticElement strength={0.2}>
                    <a 
                      href={item.href}
                      className={styles.link}
                      onMouseEnter={() => setHoveredIndex(index)}
                      onMouseLeave={() => setHoveredIndex(null)}
                    >
                      {item.label}
                      {hoveredIndex === index && (
                        <motion.div
                          className={styles.linkGlow}
                          layoutId="nav-glow"
                          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        />
                      )}
                    </a>
                  </MagneticElement>
                </li>
              ))}
            </ul>

            <MagneticElement strength={0.2}>
              <button className={styles.cta}>Get Started</button>
            </MagneticElement>
          </div>
        </motion.nav>
      )}
    </AnimatePresence>
  );
};
