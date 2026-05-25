'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { apiFetch, isLoggedIn } from '@/lib/auth';

const WELCOME = {
  role: 'ai',
  text: "Hi! I'm DermAI's health assistant. Ask me anything about skin health, lesion types, or how to interpret your results. I'll keep answers clear and concise."
};

export default function ChatPage() {
  const router = useRouter();
  const [messages, setMessages] = useState([WELCOME]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!isLoggedIn()) { router.replace('/login'); }
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    setMessages(m => [...m, { role: 'user', text }]);
    setLoading(true);
    try {
      const data = await apiFetch('/chat', {
        method: 'POST',
        body: JSON.stringify({ message: text }),
      });
      setMessages(m => [...m, { role: 'ai', text: data.response }]);
    } catch (err) {
      setMessages(m => [...m, { role: 'ai', text: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <>
      <Navbar />
      <div className="chat-layout">
        {/* Header bar */}
        <div style={{
          padding: '14px 24px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          background: 'var(--bg-card)'
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'var(--accent-glow)',
            border: '1px solid rgba(0,229,160,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16
          }}>🤖</div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.95rem' }}>DermAI Assistant</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' }} />
              Online
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="chat-messages">
          {messages.map((msg, i) => (
            <div key={i} className={`chat-bubble-row ${msg.role === 'user' ? 'user' : ''}`}>
              <div className={`chat-avatar ${msg.role === 'ai' ? 'avatar-ai' : 'avatar-user'}`}>
                {msg.role === 'ai' ? '🤖' : '👤'}
              </div>
              <div className={`chat-bubble ${msg.role === 'ai' ? 'bubble-ai' : 'bubble-user'}`}>
                {msg.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="chat-bubble-row">
              <div className="chat-avatar avatar-ai">🤖</div>
              <div className="chat-bubble bubble-ai" style={{ display: 'flex', gap: 5, alignItems: 'center', padding: '14px 18px' }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--accent)', animation: 'pulse 1s infinite' }} />
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--accent)', animation: 'pulse 1s 0.2s infinite' }} />
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--accent)', animation: 'pulse 1s 0.4s infinite' }} />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Suggested questions */}
        {messages.length === 1 && (
          <div style={{ padding: '0 24px 16px', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {[
              'What is melanoma?',
              'How to check a mole at home?',
              'What does confidence score mean?',
              'When should I see a doctor?'
            ].map(q => (
              <button
                key={q}
                onClick={() => { setInput(q); }}
                style={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border)',
                  borderRadius: 20,
                  padding: '6px 14px',
                  color: 'var(--text-muted)',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseOver={e => e.target.style.borderColor = 'var(--accent)'}
                onMouseOut={e => e.target.style.borderColor = 'var(--border)'}
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Input area */}
        <div className="chat-input-area">
          <textarea
            className="chat-input"
            rows={1}
            placeholder="Ask about skin health…"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{ lineHeight: 1.5, maxHeight: 120 }}
          />
          <button
            className="chat-send-btn"
            onClick={sendMessage}
            disabled={loading || !input.trim()}
          >
            ➤
          </button>
        </div>
      </div>

      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </>
  );
}
