import { companyProfile } from '../data/company';
import { trackEvent, trackLeadEvent } from '../services/analytics';
import styles from './AutomotiveNav.module.css';
import mpsLogo from '../../MPS Logo.png';

export interface AutomotiveNavProps {
  bookingHref: string;
}

export const AutomotiveNav = ({ bookingHref }: Readonly<AutomotiveNavProps>) => (
  <header className={styles.shell}>
    <div className={styles.bar}>
      <a href="/" className={styles.brand} aria-label="Back to MPS Group">
        <img src={mpsLogo} alt="MPS Group" className={styles.logo} />
        <div className={styles.brandCopy}>
          <span className={styles.brandLabel}>MPS Group</span>
          <span className={styles.brandSub}>Automotive</span>
        </div>
      </a>

      <nav className={styles.links} aria-label="Automotive navigation">
        <a href="#services">Services</a>
        <a href="#booking">Booking</a>
        <a href="#products">Products</a>
        <a href="#trust">Info</a>
        <a
          href="/"
          onClick={() => trackEvent('auto_back_to_main', {})}
        >
          Main site
        </a>
      </nav>

      <div className={styles.actions}>
        <a
          href={companyProfile.primaryPhoneHref}
          className={styles.callButton}
          onClick={() => trackLeadEvent('auto_call_click', { location: 'nav' })}
        >
          Call Us
        </a>
        <a href={bookingHref} className={styles.bookButton}>
          Book an Appointment
        </a>
      </div>
    </div>
  </header>
);
