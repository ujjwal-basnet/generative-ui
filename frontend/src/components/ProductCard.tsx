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
    rating = 0, review_count = 0, badge,
  } = props;

  const [qty, setQty] = useState(1);
  const [status, setStatus] = useState<'idle' | 'loading' | 'added'>('idle');
  const discount = original_price ? Math.round((1 - price / original_price) * 100) : null;

  const handleAdd = async () => {
    setStatus('loading');
    onAddToCart(product_id, name, price * qty);
    await new Promise(r => setTimeout(r, 800));
    setStatus('added');
    setTimeout(() => setStatus('idle'), 2500);
  };

  const stars = Array.from({ length: 5 }, (_, i) => (
    <span key={i} style={{ color: i < Math.floor(rating) ? '#FAC638' : '#ccc', fontSize: 14 }}>★</span>
  ));

  return (
    <div style={{
      width: 240,
      flexShrink: 0,
      background: '#fff',
      border: '3px solid #000',
      boxShadow: '6px 6px 0px 0px #000',
      display: 'flex',
      flexDirection: 'column',
      transition: 'box-shadow 0.15s, transform 0.15s',
      fontFamily: 'Domine, serif',
    }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = '10px 10px 0px 0px #000';
        (e.currentTarget as HTMLDivElement).style.transform = 'translate(-2px, -2px)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = '6px 6px 0px 0px #000';
        (e.currentTarget as HTMLDivElement).style.transform = 'translate(0,0)';
      }}
    >
      {/* Image */}
      <div style={{ position: 'relative', height: 180, borderBottom: '3px solid #000', overflow: 'hidden', background: '#f0f0ec' }}>
        <img
          src={image_url}
          alt={name}
          style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(20%) contrast(110%)', transition: 'transform 0.4s' }}
          onError={e => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/240x180?text=Product'; }}
          onMouseEnter={e => { (e.target as HTMLImageElement).style.transform = 'scale(1.06)'; }}
          onMouseLeave={e => { (e.target as HTMLImageElement).style.transform = 'scale(1)'; }}
        />

        {badge && (
          <div style={{
            position: 'absolute', top: 0, left: 0,
            background: badge === 'Best Seller' ? '#FAC638' : badge === 'Sale' ? '#000' : '#FAC638',
            color: badge === 'Sale' ? '#FAC638' : '#000',
            borderRight: '3px solid #000', borderBottom: '3px solid #000',
            padding: '4px 10px',
            fontSize: 10,
            fontFamily: 'Archivo Black, sans-serif',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}>
            {badge}
          </div>
        )}

        {discount && (
          <div style={{
            position: 'absolute', top: 0, right: 0,
            background: '#000',
            color: '#FAC638',
            borderLeft: '3px solid #000', borderBottom: '3px solid #000',
            padding: '4px 10px',
            fontSize: 10,
            fontFamily: 'Archivo Black, sans-serif',
          }}>
            -{discount}%
          </div>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1, gap: 8 }}>
        <h3 style={{
          fontFamily: 'Archivo Black, sans-serif',
          fontSize: 14, textTransform: 'uppercase',
          letterSpacing: '-0.02em', lineHeight: 1.25,
        }}>
          {name}
        </h3>
        <p style={{ fontSize: 12, color: '#555', lineHeight: 1.5 }}>{description}</p>

        {/* Stars */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <div style={{ display: 'flex' }}>{stars}</div>
          <span style={{ fontSize: 11, color: '#777' }}>({(review_count ?? 0).toLocaleString()})</span>
        </div>

        {/* Price */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 'auto' }}>
          <span style={{ fontFamily: 'Archivo Black, sans-serif', fontSize: 22, letterSpacing: '-0.03em' }}>
            ${(price ?? 0).toFixed(2)}
          </span>
          {original_price && (
            <span style={{ fontSize: 13, color: '#999', textDecoration: 'line-through' }}>
              ${original_price.toFixed(2)}
            </span>
          )}
        </div>

        {/* Qty + Add */}
        <div style={{ display: 'flex', marginTop: 8, borderTop: '3px solid #000', paddingTop: 12, gap: 8, alignItems: 'center' }}>
          {/* Qty control */}
          <div style={{ display: 'flex', border: '3px solid #000', alignItems: 'center', background: '#fff' }}>
            <button
              onClick={() => setQty(q => Math.max(1, q - 1))}
              style={{
                width: 32, height: 32,
                background: 'transparent', border: 'none',
                borderRight: '3px solid #000',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'Archivo Black, sans-serif',
                fontSize: 16,
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#FAC638'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
            >
              −
            </button>
            <span style={{
              width: 28, textAlign: 'center',
              fontFamily: 'Archivo Black, sans-serif',
              fontSize: 14,
            }}>
              {qty}
            </span>
            <button
              onClick={() => setQty(q => q + 1)}
              style={{
                width: 32, height: 32,
                background: 'transparent', border: 'none',
                borderLeft: '3px solid #000',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'Archivo Black, sans-serif',
                fontSize: 16,
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#FAC638'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
            >
              +
            </button>
          </div>

          {/* Add to cart button */}
          <button
            onClick={handleAdd}
            disabled={status !== 'idle'}
            style={{
              flex: 1,
              height: 38,
              border: '3px solid #000',
              boxShadow: status === 'idle' ? '3px 3px 0 #000' : 'none',
              background: status === 'added' ? '#000' : '#FAC638',
              color: status === 'added' ? '#FAC638' : '#000',
              fontFamily: 'Archivo Black, sans-serif',
              fontSize: 11,
              textTransform: 'uppercase',
              cursor: status !== 'idle' ? 'default' : 'pointer',
              transition: 'all 0.15s',
              transform: status === 'idle' ? 'translate(0,0)' : 'translate(3px, 3px)',
            }}
          >
            {status === 'added' ? '✓ ADDED' : status === 'loading' ? '...' : 'ADD TO CART'}
          </button>
        </div>

        {/* View link */}
        <a href={product_url} target="_blank" rel="noopener noreferrer"
          style={{
            display: 'block', textAlign: 'center',
            padding: '7px',
            border: '2px solid #000',
            fontSize: 11,
            fontFamily: 'Archivo Black, sans-serif',
            textTransform: 'uppercase',
            textDecoration: 'none',
            color: '#000',
            letterSpacing: '0.05em',
            background: 'transparent',
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#f0f0ec'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'transparent'; }}
        >
          View Details ↗
        </a>
      </div>
    </div>
  );
}