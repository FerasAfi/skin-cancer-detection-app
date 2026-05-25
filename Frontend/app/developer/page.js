'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { apiFetch, isLoggedIn, getUser } from '@/lib/auth';
import { useToast } from '@/components/Toast';

export default function DeveloperPage() {
  const router = useRouter();
  const toast = useToast();
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyData, setNewKeyData] = useState(null);
  const [revoking, setRevoking] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isLoggedIn()) { router.replace('/login'); return; }
    const user = getUser();
    if (user?.role !== 'developer') { router.replace('/home'); return; }
    fetchKeys();
  }, []);

  async function fetchKeys() {
    try {
      const data = await apiFetch('/developer/keys');
      setKeys(data);
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  async function createKey() {
    if (!newKeyName.trim()) return;
    setCreating(true);
    try {
      const data = await apiFetch('/developer/keys', {
        method: 'POST',
        body: JSON.stringify({ name: newKeyName.trim() }),
      });
      setNewKeyData(data);
      setNewKeyName('');
      await fetchKeys();
      toast('API key created successfully');
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setCreating(false);
    }
  }

  async function revokeKey(keyId) {
    setRevoking(keyId);
    try {
      await apiFetch(`/developer/keys/${keyId}`, { method: 'DELETE' });
      setKeys(k => k.filter(x => x.id !== keyId));
      toast('Key revoked');
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setRevoking(null);
    }
  }

  function copyKey(val) {
    navigator.clipboard.writeText(val).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const maskKey = (key) => key?.slice(0, 10) + '••••••••••••••••••••' + key?.slice(-4);

  return (
    <>
      <Navbar />
      <div className="page">
        <div className="container">
          <div style={{ marginBottom: 36 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <h1 className="page-title" style={{ margin: 0 }}>Developer Dashboard</h1>
              <span className="badge badge-green">API Access</span>
            </div>
            <p className="page-subtitle" style={{ margin: 0 }}>Manage your API keys and integrate DermAI into your applications</p>
          </div>

          <div className="dev-grid">
            {/* Left: Keys */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Create new key */}
              <div className="card">
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 16, fontSize: '1rem' }}>
                  Generate New Key
                </h3>
                <div style={{ display: 'flex', gap: 10 }}>
                  <input
                    className="form-input"
                    placeholder="Key name (e.g. My App)"
                    value={newKeyName}
                    onChange={e => setNewKeyName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && createKey()}
                  />
                  <button className="btn btn-primary" onClick={createKey} disabled={creating || !newKeyName.trim()} style={{ whiteSpace: 'nowrap' }}>
                    {creating ? <span className="spinner" /> : '+ Generate'}
                  </button>
                </div>

                {/* One-time reveal */}
                {newKeyData && (
                  <div className="api-key-reveal">
                    <div className="api-key-warning">
                      ⚠️ Copy this key now — it will never be shown again
                    </div>
                    <div className="api-key-code">{newKeyData.api_key}</div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn btn-outline btn-sm" onClick={() => copyKey(newKeyData.api_key)}>
                        {copied ? '✓ Copied!' : '📋 Copy Key'}
                      </button>
                      <button className="btn btn-ghost btn-sm" onClick={() => setNewKeyData(null)}>
                        Dismiss
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Keys list */}
              <div className="card">
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 16, fontSize: '1rem' }}>
                  Your API Keys ({keys.length})
                </h3>
                {loading ? (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: 24 }}>
                    <span className="spinner" />
                  </div>
                ) : keys.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-faint)', fontSize: '0.9rem' }}>
                    No keys yet. Generate one above.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {keys.map(k => (
                      <div key={k.id} className="key-item">
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div className="key-value">{maskKey(k.api_key)}</div>
                          <div className="key-info">
                            Created {new Date(k.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        <span className={`badge ${k.status === 'active' ? 'badge-green' : 'badge-red'}`}>
                          {k.status}
                        </span>
                        {k.status === 'active' && (
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => revokeKey(k.id)}
                            disabled={revoking === k.id}
                          >
                            {revoking === k.id ? <span className="spinner" /> : 'Revoke'}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right: Usage docs */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div className="card">
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 6, fontSize: '1rem' }}>
                  API Reference
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 20 }}>
                  Use your API key to run predictions from any application.
                </p>

                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Endpoint
                    </span>
                  </div>
                  <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', fontFamily: 'monospace', fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--accent)' }}>POST</span>{' '}
                    <span style={{ color: 'var(--text-muted)' }}>/developer/predict</span>
                  </div>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                    cURL Example
                  </div>
                  <div className="code-snippet">
                    <span className="code-comment"># Replace sk_live_xxx with your key</span>{'\n'}
                    curl -X POST \{'\n'}
                    {'  '}<span className="code-str">https://api.dermai.io/developer/predict</span> \{'\n'}
                    {'  '}-H <span className="code-str">"x-api-key: sk_live_xxx"</span> \{'\n'}
                    {'  '}-F <span className="code-str">"file=@lesion.jpg"</span>
                  </div>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                    Response
                  </div>
                  <div className="code-snippet">
                    {'{'}{'\n'}
                    {'  '}<span className="code-key">"label"</span>:{' '}<span className="code-str">"Melanoma"</span>,{'\n'}
                    {'  '}<span className="code-key">"score"</span>:{' '}<span className="code-val">0.91</span>{'\n'}
                    {'}'}
                  </div>
                </div>

                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                  JavaScript Example
                </div>
                <div className="code-snippet">
                  <span className="code-key">const</span> fd = <span className="code-key">new</span> FormData();{'\n'}
                  fd.append(<span className="code-str">'file'</span>, imageFile);{'\n\n'}
                  <span className="code-key">const</span> res = <span className="code-key">await</span> fetch(<span className="code-str">'/developer/predict'</span>, {'{'}{'\n'}
                  {'  '}method: <span className="code-str">'POST'</span>,{'\n'}
                  {'  '}headers: {'{'} <span className="code-str">'x-api-key'</span>: <span className="code-str">'sk_live_xxx'</span> {'}'},  {'\n'}
                  {'  '}body: fd{'\n'}
                  {'}'});{'\n'}
                  <span className="code-key">const</span> data = <span className="code-key">await</span> res.json();
                </div>
              </div>

              <div className="card" style={{ borderColor: 'var(--border-light)' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 12, fontSize: '1rem' }}>
                  📊 Usage & Limits
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[
                    { label: 'Rate limit', val: '1,000 req / min' },
                    { label: 'Max file size', val: '10 MB' },
                    { label: 'Supported formats', val: 'JPEG, PNG, WEBP' },
                    { label: 'Response time', val: '< 200ms' },
                  ].map(item => (
                    <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>{item.label}</span>
                      <span style={{ color: 'var(--text)', fontWeight: 500 }}>{item.val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
