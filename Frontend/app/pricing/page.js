'use client';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { isLoggedIn, getUser } from '@/lib/auth';
import { useEffect, useState } from 'react';

const PLANS = [
  {
    name: 'Free',
    price: 0,
    period: 'forever',
    limit: '100 predictions / month',
    features: [
      '100 skin predictions / month',
      'Standard processing speed',
      'AI chat assistant',
      'Upload & camera support',
      'Basic result visualization',
    ],
    cta: 'Get Started Free',
    featured: false,
    color: 'var(--text)',
  },
  {
    name: 'Pro',
    price: 29,
    period: 'per month',
    limit: '5,000 predictions / month',
    features: [
      '5,000 predictions / month',
      'Priority processing',
      'AI chat assistant (unlimited)',
      'Advanced result history',
      'Export reports (PDF)',
      'Email support',
    ],
    cta: 'Start Pro',
    featured: true,
    color: 'var(--accent)',
  },
  {
    name: 'Enterprise',
    price: null,
    period: 'custom pricing',
    limit: 'Unlimited predictions',
    features: [
      'Unlimited predictions',
      'API access included',
      'Custom rate limits',
      'Dedicated infrastructure',
      'SLA guarantee',
      'Priority support + onboarding',
    ],
    cta: 'Contact Sales',
    featured: false,
    color: '#79aaff',
  },
];

export default function PricingPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    setUser(getUser());
  }, []);

  function handleCTA(plan) {
    if (plan.name === 'Enterprise') {
      window.location.href = 'mailto:sales@dermai.io?subject=Enterprise Plan Inquiry';
      return;
    }
    if (!isLoggedIn()) { router.push('/register'); return; }
    // Stripe checkout would go here
    alert('Stripe checkout coming soon!');
  }

  return (
    <>
      <Navbar />
      <div className="page">
        <div className="container">
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <div className="section-label" style={{ textAlign: 'center', marginBottom: 12 }}>Pricing</div>
            <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontFamily: 'var(--font-display)', fontWeight: 800, letterSpacing: '-0.04em', marginBottom: 16 }}>
              Simple, transparent pricing
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: 480, margin: '0 auto' }}>
              Start free, scale as you grow. No hidden fees. Cancel anytime.
            </p>
          </div>

          {/* Plans grid */}
          <div className="pricing-grid">
            {PLANS.map(plan => (
              <div key={plan.name} className={`pricing-card ${plan.featured ? 'featured' : ''}`}>
                {plan.featured && <div className="featured-badge">Most Popular</div>}

                <div className="plan-name" style={{ color: plan.color }}>{plan.name}</div>

                {plan.price !== null ? (
                  <>
                    <div className="plan-price">
                      ${plan.price}<span>/mo</span>
                    </div>
                    <div className="plan-period">{plan.period}</div>
                  </>
                ) : (
                  <>
                    <div className="plan-price" style={{ fontSize: '1.8rem', letterSpacing: '-0.02em' }}>Custom</div>
                    <div className="plan-period">{plan.period}</div>
                  </>
                )}

                <div style={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  padding: '10px 14px',
                  fontSize: '0.82rem',
                  color: plan.color,
                  fontWeight: 600,
                  marginBottom: 20,
                  textAlign: 'center'
                }}>
                  {plan.limit}
                </div>

                <div className="plan-features">
                  {plan.features.map(f => (
                    <div key={f} className="plan-feature">
                      <span className="plan-feature-check">✓</span>
                      {f}
                    </div>
                  ))}
                </div>

                <button
                  className={`btn btn-full ${plan.featured ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => handleCTA(plan)}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>

          {/* FAQ */}
          <div style={{ marginTop: 80 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.5rem', letterSpacing: '-0.03em', textAlign: 'center', marginBottom: 36 }}>
              Common questions
            </h2>
            <div style={{ maxWidth: 640, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
              {[
                { q: 'Is the free plan really free?', a: 'Yes. No credit card required. You get 100 predictions per month at no cost, forever.' },
                { q: 'Can I use my own API key for integrations?', a: 'API key access is available on the Enterprise plan. Developer accounts can generate API keys via the developer dashboard.' },
                { q: 'What happens if I exceed my limit?', a: 'Predictions will be paused until the next billing cycle. You can upgrade at any time to continue.' },
                { q: 'Is this a substitute for medical diagnosis?', a: 'No. DermAI is a screening tool for informational purposes. Always consult a licensed dermatologist for medical advice.' },
              ].map(item => (
                <div key={item.q} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '20px 24px' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 8, fontSize: '0.95rem' }}>{item.q}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.65 }}>{item.a}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
