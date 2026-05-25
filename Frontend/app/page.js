'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { getUser, isLoggedIn } from '@/lib/auth';

export default function LandingPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    setMounted(true);
    setUser(getUser());
  }, []);

  function handleCTA() {
    if (!mounted) return;
    if (!isLoggedIn()) { router.push('/login'); return; }
    const role = getUser()?.role;
    if (role === 'developer') router.push('/developer');
    else router.push('/home');
  }

  return (
    <>
      <Navbar />
      {/* HERO */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-grid-lines" />
        <div className="container hero-content">
          <div className="hero-eyebrow">
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' }} />
            Powered by Deep Learning
          </div>
          <h1 className="hero-title">
            Early Detection<br />
            Saves <span>Lives</span>
          </h1>
          <p className="hero-desc">
            Upload a photo or use your camera for instant AI-powered skin cancer detection. Fast, accurate, and accessible to everyone.
          </p>
          <div className="hero-actions">
            <button className="btn btn-primary btn-lg" onClick={handleCTA}>
              🔍 Start Detecting
            </button>
            <button className="btn btn-outline btn-lg" onClick={() => router.push('/pricing')}>
              View Pricing
            </button>
          </div>

          <div className="hero-stats">
            <div className="stat-item">
              <div className="stat-num">94.7%</div>
              <div className="stat-label">Detection Accuracy</div>
            </div>
            <div className="stat-item">
              <div className="stat-num">&lt;200ms</div>
              <div className="stat-label">Prediction Speed</div>
            </div>
            <div className="stat-item">
              <div className="stat-num">7</div>
              <div className="stat-label">Cancer Types</div>
            </div>
            <div className="stat-item">
              <div className="stat-num">50K+</div>
              <div className="stat-label">Scans Processed</div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="features">
        <div className="container">
          <div className="section-label">Capabilities</div>
          <h2 className="section-title">Everything you need for<br />skin health monitoring</h2>
          <p className="section-desc">
            DermAI combines cutting-edge computer vision with clinical datasets to deliver real-time skin lesion analysis.
          </p>

          <div className="features-grid">
            {[
              { icon: '🤖', title: 'AI Prediction Engine', desc: 'State-of-the-art CNN model trained on 50,000+ labeled dermatology images across 7 cancer types.' },
              { icon: '📷', title: 'Camera & Upload', desc: 'Take a photo directly with your device camera or upload an existing image for instant analysis.' },
              { icon: '💬', title: 'AI Health Assistant', desc: 'Ask questions about skin health, lesion characteristics, and get clear, concise explanations.' },
              { icon: '⚡', title: 'Real-time Results', desc: 'Get predictions in under 200ms with confidence scores and risk classification.' },
              { icon: '🔑', title: 'Developer API', desc: 'Integrate skin cancer detection into your own applications using our REST API and API keys.' },
              { icon: '🔒', title: 'Secure & Private', desc: 'Images are processed and discarded immediately. No permanent storage of personal medical data.' },
            ].map(f => (
              <div className="feature-card" key={f.title}>
                <div className="feature-icon">{f.icon}</div>
                <div className="feature-title">{f.title}</div>
                <div className="feature-desc">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section style={{ padding: '60px 0 100px' }}>
        <div className="container">
          <div className="card" style={{
            textAlign: 'center',
            background: 'linear-gradient(135deg, rgba(0,229,160,0.08) 0%, rgba(0,229,160,0.02) 100%)',
            borderColor: 'rgba(0,229,160,0.3)',
            padding: '56px 40px'
          }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 14 }}>
              Ready to get started?
            </h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: 32, fontSize: '0.95rem' }}>
              Create a free account and run up to 100 predictions per month at no cost.
            </p>
            <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="btn btn-primary btn-lg" onClick={() => router.push('/register')}>
                Create Free Account
              </button>
              <button className="btn btn-outline btn-lg" onClick={() => router.push('/pricing')}>
                Compare Plans
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '28px 0' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div className="navbar-logo" style={{ fontSize: '0.95rem' }}>
            <div className="logo-dot" style={{ width: 22, height: 22, fontSize: 11 }}>🔬</div>
            DermAI
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-faint)' }}>
            © 2025 DermAI. For informational purposes only. Not a substitute for medical advice.
          </div>
        </div>
      </footer>
    </>
  );
}
