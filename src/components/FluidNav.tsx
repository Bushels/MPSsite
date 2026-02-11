import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MagneticElement } from './MagneticElement';
import { useDeviceCapability } from '../hooks/useDeviceCapability';
import styles from './FluidNav.module.css';

const navItems = [
  { label: 'Services', href: '#services' },
  { label: 'Products', href: '#impact' },
  { label: 'About', href: '#about' },
  { label: 'Careers', href: '#careers' },
  { label: 'Contact', href: '#contact' },
];

export const FluidNav = () => {
  const { prefersReducedMotion } = useDeviceCapability();
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (ticking) return;
      ticking = true;

      requestAnimationFrame(() => {
        const currentScrollY = window.scrollY;

        if (currentScrollY > 200) {
          setIsVisible(true);
        } else if (currentScrollY < 80) {
          setIsVisible(false);
          setMobileOpen(false);
        }

        ticking = false;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = () => {
    setMobileOpen(false);
  };

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
            {/* Brand — actual MPS logo */}
            <MagneticElement strength={0.12} className={styles.logoWrap}>
              <a href="#" className={styles.logoLink} aria-label="MPS Group — Back to top">
                <img
                  src="/MPS Logo.png"
                  alt="MPS Group"
                  className={styles.logo}
                />
              </a>
            </MagneticElement>

            {/* Desktop nav links */}
            <ul className={styles.links}>
              {navItems.map((item, index) => (
                <li key={item.label}>
                  <MagneticElement strength={0.15}>
                    <a
                      href={item.href}
                      className={styles.link}
                      onMouseEnter={() => setHoveredIndex(index)}
                      onMouseLeave={() => setHoveredIndex(null)}
                    >
                      {item.label}
                      {hoveredIndex === index && !prefersReducedMotion && (
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

            {/* Contact — beacon pulse + "Let's Talk" */}
            <MagneticElement strength={0.18}>
              <a href="#contact" className={styles.contactBtn}>
                <span className={styles.beacon}>
                  <span className={styles.beaconDot} />
                  {!prefersReducedMotion && <span className={styles.beaconPing} />}
                </span>
                <span className={styles.contactLabel}>Let's Talk</span>
                <svg
                  className={styles.contactArrow}
                  width="13"
                  height="13"
                  viewBox="0 0 14 14"
                  fill="none"
                >
                  <path
                    d="M1 13L13 1M13 1H3M13 1V11"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </a>
            </MagneticElement>

            {/* Mobile hamburger */}
            <button
              className={`${styles.hamburger} ${mobileOpen ? styles.hamburgerOpen : ''}`}
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
            >
              <span className={styles.hamburgerLine} />
              <span className={styles.hamburgerLine} />
            </button>
          </div>

          {/* Mobile dropdown */}
          <AnimatePresence>
            {mobileOpen && (
              <motion.div
                className={styles.mobileMenu}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              >
                <ul className={styles.mobileLinks}>
                  {navItems.map((item, i) => (
                    <motion.li
                      key={item.label}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        delay: 0.05 + i * 0.06,
                        duration: 0.4,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                    >
                      <a
                        href={item.href}
                        className={styles.mobileLink}
                        onClick={handleNavClick}
                      >
                        {item.label}
                      </a>
                    </motion.li>
                  ))}
                  <motion.li
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      delay: 0.05 + navItems.length * 0.06,
                      duration: 0.4,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                  >
                    <a
                      href="#contact"
                      className={`${styles.mobileLink} ${styles.mobileLinkCta}`}
                      onClick={handleNavClick}
                    >
                      <span className={styles.beacon}>
                        <span className={styles.beaconDot} />
                      </span>
                      Let's Talk
                    </a>
                  </motion.li>
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.nav>
      )}
    </AnimatePresence>
  );
};
