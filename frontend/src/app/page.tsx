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
  'Weather in Kathmandu',
  'Show me hiking boots',
  'Best backpacks for travel',
  'Weather in Tokyo',
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

          // Strip ALL leading "data: " prefixes (handles double data: data: bug)
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
              // tool_result data might be a raw string (pydantic not serialized)
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
    <div className="min-h-screen flex flex-col" style={{ background: '#0a0a0f', fontFamily: 'system-ui, sans-serif' }}>
      <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 border-b border-white/10"
        style={{ background: 'rgba(10,10,15,0.95)', backdropFilter: 'blur(12px)' }}>
        <div>
          <h1 className="text-white font-black text-xl tracking-tight">
            <span style={{ color: '#6366f1' }}>Gen</span>UI Chat
          </h1>
          <p className="text-gray-500 text-xs mt-0.5">Powered by LangChain + LangGraph</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/10"
          style={{ background: 'rgba(255,255,255,0.05)' }}>
          <span className="text-lg">🛒</span>
          <span className="text-white font-bold text-sm">{cartCount}</span>
          {cartCount > 0 && <span className="text-gray-400 text-xs">items</span>}
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-6 space-y-4 max-w-3xl w-full mx-auto">
        {messages.length === 0 && (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🤖</div>
            <h2 className="text-white text-2xl font-bold mb-2">Generative UI Demo</h2>
            <p className="text-gray-400 text-sm mb-8 max-w-sm mx-auto">
              Ask about weather or products. Tool results render as interactive components.
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {SUGGESTIONS.map(s => (
                <button key={s} onClick={() => sendMessage(s)}
                  className="px-4 py-2 rounded-full text-sm font-medium border border-white/10 text-gray-300 hover:border-indigo-400 hover:text-indigo-300 transition-all"
                  style={{ background: 'rgba(255,255,255,0.04)' }}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'user' ? (
              <div className="px-4 py-3 rounded-2xl text-white text-sm font-medium max-w-xs"
                style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}>
                {msg.content}
              </div>
            ) : msg.component === 'WeatherCard' ? (
              <WeatherCard {...msg.data} />
            ) : msg.component === 'ProductList' ? (
              <div className="max-w-full">
                <ProductList products={Array.isArray(msg.data) ? msg.data : [msg.data]} onAddToCart={handleAddToCart} />
              </div>
            ) : msg.component === 'CartConfirmation' ? (
              <CartConfirmation {...msg.data} />
            ) : (
              <div className="px-4 py-3 rounded-2xl text-sm max-w-md leading-relaxed"
                style={{ background: 'rgba(255,255,255,0.07)', color: '#e2e8f0' }}>
                {msg.content}
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="px-4 py-3 rounded-2xl flex gap-1.5" style={{ background: 'rgba(255,255,255,0.07)' }}>
              {[0, 150, 300].map(delay => (
                <div key={delay} className="w-2 h-2 rounded-full bg-indigo-400"
                  style={{ animation: `bounce 1s ease-in-out ${delay}ms infinite` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </main>

      <footer className="sticky bottom-0 px-4 py-4 border-t border-white/10"
        style={{ background: 'rgba(10,10,15,0.95)', backdropFilter: 'blur(12px)' }}>
        <div className="max-w-3xl mx-auto flex gap-3">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage(input)}
            placeholder="Ask about weather, search products, or add to cart…"
            disabled={loading}
            className="flex-1 px-4 py-3 rounded-2xl text-sm outline-none transition-all"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
          />
          <button onClick={() => sendMessage(input)} disabled={loading || !input.trim()}
            className="px-5 py-3 rounded-2xl font-bold text-sm text-white transition-all disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}>
            Send
          </button>
        </div>
      </footer>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
}
