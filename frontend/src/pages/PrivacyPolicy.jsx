import React from 'react';
import { PageShell } from './UI';

export function PrivacyPolicy() {
  return (
    <PageShell>
      <div className="container page-pad">
        <div className="card" style={{ padding: '40px' }}>
          <h1 style={{ marginBottom: 10 }}>Privacy Policy</h1>
          <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 30 }}>Last Updated: May 24, 2026</p>

          <h2 style={{ fontSize: 18, marginTop: 24, marginBottom: 8 }}>1. Information We Collect</h2>
          <p style={{ marginBottom: 16, lineHeight: 1.6 }}>
            We collect Account Data (login credentials if you create a dashboard account), Wellness Data (your responses to the 10-question screener, wellness score, and feedback), and standard Usage Data (anonymized website analytics).
          </p>

          <h2 style={{ fontSize: 18, marginTop: 24, marginBottom: 8 }}>2. How We Use Your Information</h2>
          <p style={{ marginBottom: 16, lineHeight: 1.6 }}>
            We use this data to generate your personal dashboard, suggest personalized routines, and compile completely anonymized, aggregated insights for institutional partners. We never share individually identifiable emotional data with your employer or university.
          </p>

          <h2 style={{ fontSize: 18, marginTop: 24, marginBottom: 8 }}>3. Data Storage and Protection</h2>
          <p style={{ marginBottom: 16, lineHeight: 1.6 }}>
            Your data is stored securely using industry-standard databases. We implement robust technical measures to prevent unauthorized access to your wellness history.
          </p>

          <h2 style={{ fontSize: 18, marginTop: 24, marginBottom: 8 }}>4. Third-Party Links</h2>
          <p style={{ marginBottom: 16, lineHeight: 1.6 }}>
            Countor may recommend external links to companies or therapist directories. We do not control these third-party sites and are not responsible for their privacy practices.
          </p>

          <h2 style={{ fontSize: 18, marginTop: 24, marginBottom: 8 }}>5. Your Rights</h2>
          <p style={{ marginBottom: 16, lineHeight: 1.6 }}>
            You have the right to access, modify, or completely delete your account and associated wellness data at any time. To request data deletion, please contact platform administration.
          </p>
        </div>
      </div>
    </PageShell>
  );
}
