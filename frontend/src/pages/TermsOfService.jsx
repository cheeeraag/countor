import React from 'react';
import { PageShell } from '../components/UI'; // Adjust import path based on your folder structure

export function TermsOfService() {
  return (
    <PageShell>
      <div className="container page-pad">
        <div className="card" style={{ padding: '40px' }}>
          <h1 style={{ marginBottom: 10 }}>Terms of Service</h1>
          <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 30 }}>Last Updated: May 24, 2026</p>

          <h2 style={{ fontSize: 18, marginTop: 24, marginBottom: 8 }}>1. Acceptance of Terms</h2>
          <p style={{ marginBottom: 16, lineHeight: 1.6 }}>
            By accessing and using Countor ("we," "our," or "the Platform"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Platform.
          </p>

          <h2 style={{ fontSize: 18, marginTop: 24, marginBottom: 8 }}>2. Nature of Service and Medical Disclaimer</h2>
          <p style={{ marginBottom: 16, lineHeight: 1.6 }}>
            Countor provides a digital mental wellness screener consisting of 10 questions adapted from standard wellness frameworks. The "Mental Wellness Score," task recommendations, and resource links provided by Countor are strictly for educational and self-reflection purposes.
          </p>
          <p style={{ marginBottom: 16, lineHeight: 1.6, fontWeight: 'bold', color: 'var(--red)' }}>
            Using Countor does not establish a therapist-patient relationship. We do not provide clinical diagnoses, psychiatric advice, or medical treatment. If you are experiencing severe distress or thoughts of self-harm, immediately contact emergency services or a crisis helpline (e.g., iCall at 9152987821).
          </p>

          <h2 style={{ fontSize: 18, marginTop: 24, marginBottom: 8 }}>3. User Accounts and Security</h2>
          <p style={{ marginBottom: 16, lineHeight: 1.6 }}>
            To access the tracking dashboard, users may create an account. You are responsible for maintaining the confidentiality of your login credentials. You agree to notify us immediately of any unauthorized access to your account.
          </p>

          <h2 style={{ fontSize: 18, marginTop: 24, marginBottom: 8 }}>4. Intellectual Property</h2>
          <p style={{ marginBottom: 16, lineHeight: 1.6 }}>
            All content, original code, UI/UX design, and the specific adapted phrasing of our questionnaires on Countor are the intellectual property of Countor and are protected by applicable copyright and trademark laws.
          </p>

          <h2 style={{ fontSize: 18, marginTop: 24, marginBottom: 8 }}>5. Limitation of Liability</h2>
          <p style={{ marginBottom: 16, lineHeight: 1.6 }}>
            To the maximum extent permitted by Indian law, Countor and its founders shall not be liable for any direct, indirect, incidental, or consequential damages arising from your use of the platform or the interpretation of your wellness score.
          </p>
        </div>
      </div>
    </PageShell>
  );
}
