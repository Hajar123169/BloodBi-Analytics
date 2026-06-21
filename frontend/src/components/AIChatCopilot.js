import React, { useState } from 'react';
import api from '../api';

export default function AIChatCopilot() {
  const [message, setMessage] = useState('What should I do if O negative stock is critical?');
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(false);

  const send = async () => {
    if (!message.trim()) return;
    const userMessage = message;
    setMessage('');
    setLoading(true);
    try {
      const res = await api.post('/ai/chat', { message: userMessage });
      setChat((old) => [...old, { user: userMessage, bot: res.data.response }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 28 }}>
      <h1 style={{ margin: 0, fontSize: 30, fontWeight: 900, color: '#111827' }}>AI Medical Decision Assistant</h1>
      <p style={{ marginTop: 8, color: '#6b7280' }}>Ask about blood stock, emergency protocols, donor matching, and shortage risk.</p>

      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: 20, minHeight: 320, marginTop: 20 }}>
        {chat.length === 0 ? (
          <p style={{ color: '#6b7280' }}>No messages yet. Try asking about emergency stock or donor matching.</p>
        ) : chat.map((c, i) => (
          <div key={i} style={{ marginBottom: 16 }}>
            <div style={{ fontWeight: 800, color: '#111827' }}>You</div>
            <div style={{ background: '#f3f4f6', padding: 12, borderRadius: 10, marginBottom: 8 }}>{c.user}</div>
            <div style={{ fontWeight: 800, color: '#e11d48' }}>BloodBI AI</div>
            <div style={{ background: '#fff1f2', padding: 12, borderRadius: 10 }}>{c.bot}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          placeholder="Ask the AI assistant..."
          style={{ flex: 1, padding: 13, borderRadius: 10, border: '1px solid #d1d5db' }}
        />
        <button onClick={send} disabled={loading} style={{ background: '#e11d48', color: '#fff', border: 0, borderRadius: 10, padding: '0 20px', fontWeight: 800 }}>
          {loading ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  );
}
