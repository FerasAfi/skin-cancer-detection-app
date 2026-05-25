'use client';
// TEMPORARY FIX - Remove 'use client' and use legacy approach
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { apiFetch, isLoggedIn } from '@/lib/auth';
import { useRouter } from 'next/navigation';

// Mock useState for now
let mockState = {
  keys: [],
  loading: true,
  creating: false
};

export default function DeveloperPage() {
  const router = useRouter();
  
  // Force re-render function
  const [, forceUpdate] = useState(0);
  
  // Wrapper functions
  function setKeys(value) {
    if (typeof value === 'function') {
      mockState.keys = value(mockState.keys);
    } else {
      mockState.keys = value;
    }
    forceUpdate(x => x + 1);
  }
  
  function setLoading(value) {
    mockState.loading = value;
    forceUpdate(x => x + 1);
  }
  
  function setCreating(value) {
    mockState.creating = value;
    forceUpdate(x => x + 1);
  }
  
  const keys = mockState.keys;
  const loading = mockState.loading;
  const creating = mockState.creating;

  useEffect(() => {
    if (!isLoggedIn()) {
      router.replace('/login');
      return;
    }
    fetchKeys();
  }, []);

  async function fetchKeys() {
    try {
      setLoading(true);
      const data = await apiFetch('/developer/keys');
      setKeys(data.keys || []);
    } catch (err) {
      console.error('Failed to load API keys:', err);
    } finally {
      setLoading(false);
    }
  }

  async function createKey() {
    try {
      const data = await apiFetch('/developer/keys', {
        method: 'POST',
        body: JSON.stringify({ name: "default" }) // required by CreateKeyRequest
        });
      setKeys(prev => [data, ...prev]);
      console.log('API key created');
    } catch (err) {
      console.error('Failed to create API key:', err);
    } finally {
      setCreating(false);
    }
  }

  async function deleteKey(id) {
    try {
      await apiFetch(`/developer/keys/${id}`, {
        method: 'DELETE',
      });
      setKeys(prev => prev.filter(k => k.id !== id));
      console.log('API key deleted');
    } catch (err) {
      console.error('Failed to delete API key:', err);
    }
  }

  async function copyKey(key) {
    try {
      await navigator.clipboard.writeText(key);
      console.log('API key copied');
    } catch {
      console.error('Failed to copy key');
    }
  }

  function maskKey(key) {
    if (!key) return '';
    return `${key.slice(0, 10)}••••••••••••${key.slice(-6)}`;
  }

  return (
    <>
      <Navbar />
      <div className="page">
        <div className="container">
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 32,
              gap: 20,
              flexWrap: 'wrap',
            }}>
              <div>
                <h1 className="page-title">Developer Dashboard</h1>
                <p className="page-subtitle">
                  Manage API keys and integrate DermAI into your applications
                </p>
              </div>
              <button
                className="btn btn-primary"
                onClick={createKey}
                disabled={creating}
              >
                {creating ? 'Creating...' : '＋ Generate API Key'}
              </button>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 18,
              marginBottom: 28,
            }}>
              <div className="glass-card">
                <div className="stat-label">Total API Keys</div>
                <div className="stat-value">{keys.length}</div>
              </div>
              <div className="glass-card">
                <div className="stat-label">Environment</div>
                <div className="stat-value">Production</div>
              </div>
              <div className="glass-card">
                <div className="stat-label">API Status</div>
                <div className="stat-value" style={{ color: 'var(--accent)' }}>Online</div>
              </div>
            </div>

            <div className="glass-card">
              <div style={{ marginBottom: 24 }}>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: 6 }}>API Keys</h2>
                <p style={{ color: 'var(--text-soft)', fontSize: '0.9rem' }}>
                  Keep your API keys secure. Never expose them publicly.
                </p>
              </div>

              {loading ? (
                <div style={{ padding: 40, textAlign: 'center' }}>
                  <span className="spinner" />
                </div>
              ) : keys.length === 0 ? (
                <div style={{ padding: 60, textAlign: 'center' }}>
                  <div style={{ fontSize: '3rem', marginBottom: 12 }}>🔑</div>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: 8 }}>No API keys yet</h3>
                  <p style={{ color: 'var(--text-soft)', marginBottom: 20 }}>
                    Create your first API key to start using the API
                  </p>
                  <button className="btn btn-primary" onClick={createKey}>Generate First Key</button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {keys.map((key) => (
                    <div key={key.id} style={{
                      border: '1px solid rgba(255,255,255,0.08)',
                      background: 'rgba(255,255,255,0.03)',
                      borderRadius: 18,
                      padding: 20,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 20,
                      flexWrap: 'wrap',
                    }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                          <span className="badge badge-green">Active</span>
                          <span style={{ color: 'var(--text-soft)', fontSize: '0.8rem' }}>
                            Created {key.created_at || 'Recently'}
                          </span>
                        </div>
                        <div style={{
                          fontFamily: 'monospace',
                          fontSize: '0.95rem',
                          background: 'rgba(0,0,0,0.3)',
                          padding: '14px 16px',
                          borderRadius: 12,
                          overflowX: 'auto',
                        }}>
                          {maskKey(key.api_key)}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 10 }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => copyKey(key.api_key)}>📋 Copy</button>
                        <button className="btn btn-ghost btn-sm" onClick={() => deleteKey(key.id)}>🗑 Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="glass-card" style={{ marginTop: 28 }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 16 }}>Example Request</h2>
              <div style={{
                background: '#0a0a0a',
                borderRadius: 18,
                padding: 20,
                overflowX: 'auto',
                fontFamily: 'monospace',
                fontSize: '0.9rem',
              }}>
{`curl -X POST https://your-api.com/ml/predict \\
-H "Authorization: Bearer YOUR_API_KEY" \\
-F "file=@lesion.jpg"`}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}