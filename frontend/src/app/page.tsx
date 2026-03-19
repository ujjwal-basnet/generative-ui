'use client';

import { useState, useEffect, useRef } from 'react';
import { WeatherCard } from '../components/WeatherCard';
import { ProductList } from '../components/ProductList';
import { CartConfirmation } from '../components/CartConfirmation';

type Message = {
  role: 'user' | 'assistant';
  content?: string;
  component?: 'WeatherCard' | 'ProductList' | 'CartConfirmation';
  data?: any;
};

const SUGGESTIONS = [
  'Show me hiking boots',
  'Best backpacks for travel',
  'Weather in Tokyo',
  'Noise cancelling headphones',
];

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const sendMessage = async (prompt: string) => {
    if (!prompt.trim() || loading) return;

    const userMsg: Message = { role: 'user', content: prompt };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch(
        `http://127.0.0.1:8000/chat/stream?prompt=${encodeURIComponent(prompt)}`,
        { headers: { Accept: 'text/event-stream' }, cache: 'no-store' }
      );

      if (!res.body) throw new Error('No response body');

      const reader = res.body.getReader();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += new TextDecoder().decode(value);
        const lines = buffer.split('\n');
        buffer = '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;

          let jsonStr = trimmed;
          while (jsonStr.startsWith('data:')) {
            jsonStr = jsonStr.slice(5).trim();
          }

          if (!jsonStr || jsonStr === '') continue;

          try {
            const data = JSON.parse(jsonStr);

            if (data.type === 'text') {
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === 'assistant' && !last.component) {
                  return [
                    ...prev.slice(0, -1),
                    { ...last, content: (last.content || '') + data.content },
                  ];
                }
                return [...prev, { role: 'assistant', content: data.content }];
              });
            } else if (data.type === 'tool_result') {
              let parsedData = data.data;
              if (typeof parsedData === 'string') {
                try { parsedData = JSON.parse(parsedData); } catch {}
              }
              setMessages(prev => [
                ...prev,
                { role: 'assistant', component: data.component, data: parsedData },
              ]);
            }
          } catch (e) {
            // not valid JSON, skip
          }
        }
      }
    } catch (err) {
      console.error('Stream error:', err);
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: '⚠️ Could not connect to backend. Make sure it is running on port 8000.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (productId: string, productName: string, price: number) => {
    setCartCount(prev => prev + 1);
    sendMessage(
      `Add to cart: product_id="${productId}", product_name="${productName}", price=${price}. Use the add_to_cart tool.`
    );
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

        {/* HEADER */}
        <header style={{
          position: 'sticky', top: 0, zIndex: 50,
          background: 'var(--white)',
          borderBottom: 'var(--border)',
          fontFamily: 'Domine, serif',
        }}>
          <div style={{
            maxWidth: 900, margin: '0 auto',
            padding: '0 24px', height: 72,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 48, height: 48,
                background: 'var(--primary)',
                border: 'var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: 26, fontVariationSettings: "'FILL' 1" }}>support_agent</span>
              </div>
              <div>
                <h1 className="heading" style={{ fontSize: 22, lineHeight: 1 }}>ShopAssist AI</h1>
                <p style={{ fontSize: 11, color: '#555', fontFamily: 'Domine, serif', marginTop: 2 }}>Powered by LangChain + LangGraph</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button className="btn-secondary" style={{
                width: 48, height: 48,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                position: 'relative',
              }}>
                <span className="material-symbols-outlined">shopping_cart</span>
                {cartCount > 0 && (
                  <span style={{
                    position: 'absolute', top: -6, right: -6,
                    background: 'var(--primary)',
                    border: '2px solid #000',
                    borderRadius: '50%',
                    width: 22, height: 22,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11,
                    fontFamily: 'Archivo Black, sans-serif',
                  }}>
                    {cartCount}
                  </span>
                )}
              </button>
              <button className="btn-secondary" style={{
                width: 48, height: 48,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span className="material-symbols-outlined">account_circle</span>
              </button>
            </div>
          </div>
        </header>

        {/* MAIN CHAT AREA */}
        <main style={{
          flex: 1,
          maxWidth: 900, width: '100%', margin: '0 auto',
          padding: '40px 24px 140px',
          display: 'flex', flexDirection: 'column', gap: 32,
        }}>

          {/* EMPTY STATE */}
          {messages.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 0' }} className="msg-in">
              <div style={{
                width: 80, height: 80,
                background: 'var(--primary)',
                border: 'var(--border)',
                boxShadow: 'var(--shadow)',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 24,
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: 40, fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
              </div>
              <h2 className="heading" style={{ fontSize: 28, marginBottom: 12 }}>Generative UI Demo</h2>
              <p style={{ color: '#555', fontSize: 15, maxWidth: 380, margin: '0 auto 32px', lineHeight: 1.6 }}>
                Ask about products, weather, or add items to your cart. Tool results render as interactive components.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
                {SUGGESTIONS.map(s => (
                  <button key={s} onClick={() => sendMessage(s)}
                    className="btn-secondary"
                    style={{ padding: '10px 18px', fontSize: 13, fontFamily: 'Domine, serif', textTransform: 'none', letterSpacing: 0 }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* MESSAGES */}
          {messages.map((msg, i) => (
            <div key={i} className="msg-in" style={{
              display: 'flex',
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
              gap: 12,
              alignItems: 'flex-start',
            }}>

              {/* AI avatar */}
              {msg.role === 'assistant' && (
                <div style={{
                  width: 36, height: 36, flexShrink: 0,
                  background: '#000', color: 'var(--primary)',
                  border: 'var(--border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginTop: 4,
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 20, fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
                </div>
              )}

              {/* Message content */}
              <div style={{ maxWidth: msg.component ? '100%' : '75%' }}>
                {msg.role === 'user' ? (
                  <div className="brutalist-card" style={{
                    background: 'var(--primary)',
                    padding: '14px 20px',
                    fontSize: 15,
                    fontFamily: 'Archivo Black, sans-serif',
                    textTransform: 'uppercase',
                    letterSpacing: '-0.02em',
                    lineHeight: 1.4,
                  }}>
                    {msg.content}
                  </div>
                ) : msg.component === 'WeatherCard' ? (
                  <WeatherCard {...msg.data} />
                ) : msg.component === 'ProductList' ? (
                  <ProductList
                    products={Array.isArray(msg.data) ? msg.data : [msg.data]}
                    onAddToCart={handleAddToCart}
                  />
                ) : msg.component === 'CartConfirmation' ? (
                  <CartConfirmation {...msg.data} />
                ) : (
                  <div className="brutalist-card" style={{
                    background: 'var(--white)',
                    padding: '14px 20px',
                    fontSize: 15,
                    lineHeight: 1.65,
                    color: '#111',
                  }}>
                    {msg.content}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* LOADING INDICATOR */}
          {loading && (
            <div className="msg-in" style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{
                width: 36, height: 36,
                background: '#000', color: 'var(--primary)',
                border: 'var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: 20, fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
              </div>
              <div className="brutalist-card" style={{
                background: 'var(--white)',
                padding: '18px 24px',
                display: 'flex', gap: 6, alignItems: 'center',
              }}>
                {['dot-blink', 'dot-blink-2', 'dot-blink-3'].map(cls => (
                  <div key={cls} className={cls} style={{
                    width: 10, height: 10,
                    background: '#000',
                    border: '2px solid #000',
                  }} />
                ))}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
      </main>

        {/* FOOTER / INPUT */}
        <footer style={{
          position: 'fixed', bottom: 0, left: 0, width: '100%',
          padding: '20px 24px',
          pointerEvents: 'none',
        }}>
          <div style={{
            maxWidth: 900, margin: '0 auto',
            pointerEvents: 'auto',
          }}>
            <div className="brutalist-card" style={{
              background: 'var(--white)',
              display: 'flex', alignItems: 'center', gap: 0,
              padding: 6,
            }}>
              <button style={{
                width: 48, height: 48,
                background: 'transparent',
                border: 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0,
              }}>
                <span className="material-symbols-outlined">attach_file</span>
              </button>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage(input)}
                placeholder="Ask about products, weather, or add to cart…"
                disabled={loading}
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  fontSize: 15,
                  fontFamily: 'Domine, serif',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '-0.01em',
                  color: '#000',
                  padding: '12px 16px',
                }}
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={loading || !input.trim()}
                className="btn-primary"
                style={{
                  width: 52, height: 52,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                  opacity: loading || !input.trim() ? 0.4 : 1,
                }}
              >
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
              </button>
            </div>
          </div>
        </footer>

      </div>
  );
}