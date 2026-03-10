'use client';
import React, { useState } from 'react';

type ProductProps = {
  name: string;
  price: number;
  original_price?: number | null;
  description: string;
  image_url: string;
  product_url: string;
  product_id: string;
  rating?: number;
  review_count?: number;
  badge?: string | null;
  onAddToCart: (productId: string, productName: string, price: number) => void;
};

export function ProductCard(props: ProductProps) {
  const {
    name, price, original_price, description, image_url,
    product_url, product_id, onAddToCart,
    rating = 0, review_count = 0, badge
  } = props;

  const [status, setStatus] = useState<'idle' | 'loading' | 'added'>('idle');
  const discount = original_price ? Math.round((1 - price / original_price) * 100) : null;

  const handleAdd = async () => {
    setStatus('loading');
    onAddToCart(product_id, name, price);
    await new Promise(r => setTimeout(r, 800));
    setStatus('added');
  };

  const stars = Array.from({ length: 5 }, (_, i) => (
    <span key={i} className={i < Math.floor(rating) ? 'text-amber-400' : 'text-gray-300'}>★</span>
  ));

  return (
    <div className="relative flex flex-col rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
      style={{ minWidth: '220px', maxWidth: '240px' }}>

      {badge && (
        <div className="absolute top-3 left-3 z-10 px-2 py-1 rounded-full text-xs font-bold"
          style={{
            background: badge === 'Best Seller' ? '#e94560' : badge === 'Sale' ? '#f59e0b' : '#10b981',
            color: 'white'
          }}>
          {badge}
        </div>
      )}

      {discount && (
        <div className="absolute top-3 right-3 z-10 px-2 py-1 rounded-full bg-emerald-500 text-white text-xs font-bold">
          -{discount}%
        </div>
      )}

      <div className="relative overflow-hidden bg-gray-50" style={{ height: '160px' }}>
        <img
          src={image_url}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          onError={e => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/240x160?text=Product'; }}
        />
      </div>

      <div className="flex flex-col flex-1 p-4 gap-2">
        <h3 className="font-bold text-gray-900 text-sm leading-tight">{name}</h3>
        <p className="text-gray-500 text-xs leading-relaxed">{description}</p>

        <div className="flex items-center gap-1">
          <div className="flex text-sm">{stars}</div>
          <span className="text-gray-400 text-xs">({(review_count ?? 0).toLocaleString()})</span>
        </div>

        <div className="flex items-baseline gap-2 mt-auto">
          <span className="text-xl font-black text-gray-900">${(price ?? 0).toFixed(2)}</span>
          {original_price && (
            <span className="text-sm text-gray-400 line-through">${original_price.toFixed(2)}</span>
          )}
        </div>

        <div className="flex gap-2 mt-2">
          <a href={product_url} target="_blank" rel="noopener noreferrer"
            className="flex-1 text-center py-2 text-xs font-semibold rounded-xl border border-gray-200 text-gray-600 hover:border-gray-400 transition-colors">
            View
          </a>
          <button onClick={handleAdd} disabled={status !== 'idle'}
            className="flex-1 py-2 text-xs font-bold rounded-xl text-white transition-all duration-300"
            style={{
              background: status === 'added'
                ? 'linear-gradient(135deg, #10b981, #059669)'
                : status === 'loading' ? '#9ca3af'
                : 'linear-gradient(135deg, #6366f1, #4f46e5)',
            }}>
            {status === 'added' ? '✓ Added' : status === 'loading' ? '...' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
}
