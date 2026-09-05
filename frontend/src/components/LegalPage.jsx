import { useEffect } from 'react'

const sections = {
  terms: {
    eyebrow: 'LEGAL · 01', title: 'Terms of Service', intro: 'These terms explain how Countor can be used and what you can expect from the service.',
    blocks: [
      ['Using Countor', 'Countor provides wellness check-ins, reflections, resources, and supportive tools. You agree to use the service lawfully, provide information that you are comfortable sharing, and keep your account credentials secure.'],
      ['Not medical advice', 'Countor is a wellness and screening product, not a medical device, emergency service, or diagnostic service. A score, recommendation, voice estimate, or insight must not be treated as a diagnosis or as a substitute for a qualified healthcare professional.'],
      ['Voice check-ins', 'If you choose a voice check-in, your recording is processed to create a transcript and estimate your position on Countor’s Wellness × Distress framework. Voice estimation is based on unstructured language and is not the same as completing a validated questionnaire.'],
      ['Recommendations', 'Resources are matched to your latest position using Countor’s recommendation system. They are intended as supportive starting points; availability, quality, suitability, and outcomes of third-party services are not guaranteed by Countor.'],
      ['Organization accounts', 'If you join through an organization, organization analytics are designed around aggregate information. Countor does not present an employee name alongside an individual wellness or distress score in the organization dashboard. Support requests may use a Countor Member ID for pseudonymous communication.'],
      ['Safety', 'If you are in immediate danger or believe you may harm yourself or someone else, do not rely on Countor. Contact local emergency services or an appropriate crisis service immediately.'],
      ['Account and availability', 'You are responsible for activity under your account. We may update, suspend, or discontinue parts of the service when necessary for security, maintenance, legal requirements, or product changes.'],
      ['Changes to these terms', 'We may update these terms as Countor evolves. Material changes will be reflected on this page with an updated effective date. Continued use after an update means you accept the revised terms.'],
      ['Contact', 'For questions about these terms, use the support/contact channel made available in Countor.']
    ]
  },
  privacy: {
    eyebrow: 'LEGAL · 02', title: 'Privacy Policy', intro: 'Your wellness information is personal. This policy explains what Countor collects, why it is used, and how organization privacy is designed.',
    blocks: [
      ['Information you provide', 'Depending on how you use Countor, this may include your name, email address, organization association, department preference, check-in answers, voice recordings submitted for processing, and support messages.'],
      ['Wellness and check-in data', 'Structured check-ins contain responses used to calculate Wellness and Distress dimensions. Voice check-ins are transcribed and estimated against the same dimensions. We do not describe these estimates as diagnoses.'],
      ['How we use information', 'We use information to provide check-ins, calculate your position, show your history, personalize resources, maintain your account, respond to support requests, improve reliability, and operate the platform.'],
      ['Voice processing', 'Voice audio is sent to the configured AI processing service to produce a transcript and structured estimate. The resulting estimate is stored with your check-in so Countor can show your history and recommendations.'],
      ['Organization privacy', 'Organization administrators receive aggregate wellness, distress, engagement, and safety signals. Individual wellness or distress scores are not displayed alongside employee names in organization analytics. Support workflows are separated from wellness analytics and use a Countor Member ID where appropriate.'],
      ['Member ID and directory privacy', 'Your displayed Countor Member ID uses the format CNT-XXXXXXXXXX. Your underlying database identifier remains separate. If you join an organization, department directory visibility is a separate preference that can be changed from your profile.'],
      ['Data sharing', 'Countor does not use your individual wellness score as an advertising profile. Information may be processed by infrastructure or service providers needed to operate Countor, subject to their applicable terms and security practices.'],
      ['Security', 'We use account authentication, access controls, scoped organization permissions, and separation between individual and aggregate analytics. No internet service can promise absolute security.'],
      ['Your choices', 'You can choose whether to use voice or questionnaire check-ins, manage available profile privacy preferences, and request support. For account or data questions, use the support/contact channel available in Countor.'],
      ['Policy updates', 'This page may be updated when our product, processing, or legal obligations change. The effective date at the top of this page indicates the latest revision.']
    ]
  }
}

export function LegalPage({ type = 'privacy' }) {
  const data = sections[type] || sections.privacy
  useEffect(() => { window.scrollTo(0, 0) }, [type])
  return <div className="legal-page">
    <div className="legal-topbar"><a href="/" className="legal-brand" aria-label="Countor home"><span className="legal-mark">C</span><strong>countor</strong></a><a href="/" className="legal-home">Back to Countor <span>→</span></a></div>
    <main className="legal-wrap">
      <header className="legal-hero"><span className="legal-eyebrow">{data.eyebrow}</span><h1>{data.title}</h1><p>{data.intro}</p><div className="legal-meta"><span>Effective September 5, 2026</span><span>•</span><span>Last updated today</span></div></header>
      <div className="legal-layout"><aside className="legal-index"><div>ON THIS PAGE</div>{data.blocks.map(([title],i)=><a href={`#section-${i+1}`} key={title}>{String(i+1).padStart(2,'0')} {title}</a>)}</aside><article className="legal-card">{data.blocks.map(([title,body],i)=><section id={`section-${i+1}`} className="legal-section" key={title}><span className="legal-number">{String(i+1).padStart(2,'0')}</span><div><h2>{title}</h2><p>{body}</p></div></section>)}</article></div>
      <div className="legal-bottom"><span>Countor · Wellness, with context.</span><div><a href="/terms">Terms</a><a href="/privacy">Privacy</a></div></div>
    </main>
  </div>
}
