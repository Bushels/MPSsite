import { companyProfile } from '../data/company';

export const PrivacyPolicyContent = () => (
  <>
    <h3>Overview</h3>
    <p>
      MPS Group (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) is committed to
      protecting the privacy of visitors to our website. This Privacy Policy outlines the
      types of information we may collect and how we use, disclose, and safeguard that
      information.
    </p>
    <p>
      <em>
        This is placeholder text. MPS Group should replace this section with their official
        privacy policy prepared by legal counsel.
      </em>
    </p>

    <h3>Information We Collect</h3>
    <p>
      We may collect personal information that you voluntarily provide when contacting us,
      including your name, email address, phone number, and the content of your inquiry. We
      also automatically collect certain technical data such as browser type, operating
      system, and pages visited.
    </p>

    <h3>How We Use Your Information</h3>
    <ul>
      <li>To respond to inquiries and provide requested services</li>
      <li>To improve our website and user experience</li>
      <li>To comply with legal obligations</li>
      <li>To communicate about our services and opportunities</li>
    </ul>

    <h3>Data Security</h3>
    <p>
      We implement reasonable administrative, technical, and physical safeguards to protect
      your personal information. However, no method of electronic transmission or storage is
      100% secure.
    </p>

    <h3>Contact</h3>
    <p>
      For questions about this Privacy Policy, contact us at{' '}
      <a
        href={companyProfile.primaryEmailHref}
        style={{ color: 'rgba(96, 165, 250, 0.82)' }}
      >
        {companyProfile.primaryEmail}
      </a>
      .
    </p>
  </>
);

export const TermsOfServiceContent = () => (
  <>
    <h3>Acceptance of Terms</h3>
    <p>
      By accessing and using the MPS Group website, you agree to be bound by these Terms of
      Service. If you do not agree with any part of these terms, you should not use this
      website.
    </p>
    <p>
      <em>
        This is placeholder text. MPS Group should replace this section with their official
        terms of service prepared by legal counsel.
      </em>
    </p>

    <h3>Use of Website</h3>
    <p>
      This website is provided for informational purposes about MPS Group&apos;s services,
      capabilities, and career opportunities. You agree to use the website only for lawful
      purposes and in a manner that does not infringe on the rights of others.
    </p>

    <h3>Intellectual Property</h3>
    <p>
      All content on this website, including text, images, logos, and design elements, is
      the property of MPS Group or its licensors and is protected by applicable intellectual
      property laws. Unauthorized reproduction or distribution is prohibited.
    </p>

    <h3>Limitation of Liability</h3>
    <p>
      MPS Group provides this website &ldquo;as is&rdquo; and makes no warranties, express or
      implied, regarding the accuracy or completeness of the content. MPS Group shall not be
      liable for any damages arising from the use of this website.
    </p>

    <h3>Governing Law</h3>
    <p>
      These terms are governed by the laws of the Province of Saskatchewan, Canada. Any
      disputes shall be subject to the exclusive jurisdiction of the courts of Saskatchewan.
    </p>

    <h3>Contact</h3>
    <p>
      For questions about these Terms of Service, contact us at{' '}
      <a
        href={companyProfile.primaryEmailHref}
        style={{ color: 'rgba(96, 165, 250, 0.82)' }}
      >
        {companyProfile.primaryEmail}
      </a>
      .
    </p>
  </>
);
