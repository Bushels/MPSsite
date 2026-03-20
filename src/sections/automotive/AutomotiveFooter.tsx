import { useState } from 'react';
import { LegalModal } from '../../components/LegalModal';
import { PrivacyPolicyContent, TermsOfServiceContent } from '../../components/legalContent';
import { companyProfile, getCurrentYear } from '../../data/company';
import { trackEvent, trackLeadEvent } from '../../services/analytics';
import styles from './AutomotiveFooter.module.css';

export const AutomotiveFooter = () => {
  const [legalModal, setLegalModal] = useState<'privacy' | 'terms' | null>(null);

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brandBlock}>
          <span className={styles.eyebrow}>MPS Group Automotive</span>
          <p>
            A dedicated SGI-focused booking experience for Pierceland, SK and the wider Cold Lake corridor.
          </p>
        </div>

        <div className={styles.linkRow}>
          <a
            href={companyProfile.primaryPhoneHref}
            onClick={() => trackLeadEvent('auto_call_click', { location: 'footer' })}
          >
            Call the shop
          </a>
          <button type="button" onClick={() => setLegalModal('privacy')}>
            Privacy
          </button>
          <button type="button" onClick={() => setLegalModal('terms')}>
            Terms
          </button>
          <a href="/" onClick={() => trackEvent('auto_back_to_main', {})}>
            Back to MPS Group
          </a>
        </div>
      </div>

      <p className={styles.copyright}>
        &copy; {getCurrentYear()} MPS Group. Automotive pricing and hours should be finalized with
        staff before launch.
      </p>

      <LegalModal
        isOpen={legalModal === 'privacy'}
        onClose={() => setLegalModal(null)}
        title="Privacy Policy"
      >
        <PrivacyPolicyContent />
      </LegalModal>

      <LegalModal
        isOpen={legalModal === 'terms'}
        onClose={() => setLegalModal(null)}
        title="Terms of Service"
      >
        <TermsOfServiceContent />
      </LegalModal>
    </footer>
  );
};
