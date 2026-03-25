import { useEffect } from 'react';
import { companyProfile } from '../data/company';
import { ChatWidget } from '../components/ChatWidget';
import { trackEvent } from '../services/analytics';
import styles from './AutomotiveSite.module.css';

/**
 * Automotive page — Coming Soon placeholder.
 * Full booking wizard, service catalog, and availability
 * are built and ready in git history. Swap this back when
 * the booking backend (Supabase + Resend) is fully configured.
 */
export const AutomotiveSite = () => {
  useEffect(() => {
    trackEvent('auto_page_view', {
      source: document.referrer || 'direct',
    });
  }, []);

  return (
    <div className={styles.page}>
      <main
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '48px 24px',
          textAlign: 'center',
        }}
      >
        <h1
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(2.5rem, 6vw, 5rem)',
            color: 'var(--color-text-primary)',
            marginBottom: '16px',
            letterSpacing: '-0.02em',
          }}
        >
          Automotive Services
        </h1>

        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'clamp(1rem, 2vw, 1.25rem)',
            color: 'var(--color-text-secondary)',
            maxWidth: '520px',
            lineHeight: 1.6,
            marginBottom: '32px',
          }}
        >
          Online booking is coming soon. In the meantime, give us a call to
          schedule your SGI inspection, oil change, tire service, or general
          maintenance.
        </p>

        <a
          href={companyProfile.primaryPhoneHref}
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '1.1rem',
            fontWeight: 600,
            color: 'var(--color-text-primary)',
            background: 'var(--color-cobalt)',
            padding: '14px 36px',
            borderRadius: 'var(--radius-button)',
            border: '1px solid var(--color-border-glow)',
            boxShadow: 'var(--shadow-glow)',
            textDecoration: 'none',
            transition: 'transform 0.2s ease',
          }}
        >
          Call {companyProfile.primaryPhoneDisplay}
        </a>

        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.85rem',
            color: 'var(--color-text-secondary)',
            marginTop: '24px',
          }}
        >
          {companyProfile.automotiveLocationLabel}
        </p>
      </main>

      <ChatWidget />
    </div>
  );
};
