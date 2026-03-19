'use client';
import React from 'react';
import { ProductCard } from './ProductCard';

type Product = {
  name: string;
  price: number;
  original_price?: number | null;
  description: string;
  image_url: string;
  product_url: string;
  product_id: string;
  rating: number;
  review_count: number;
  badge?: string | null;
};

type ProductListProps = {
  products: Product[];
  onAddToCart: (productId: string, productName: string, price: number) => void;
};

export function ProductList({ products, onAddToCart }: ProductListProps) {
  if (!products || products.length === 0) {
    return (
      <div style={{
        border: '3px solid #000',
        boxShadow: '4px 4px 0 #000',
        background: '#fff',
        padding: '20px 24px',
        fontFamily: 'Domine, serif',
        color: '#555',
      }}>
        No products found for that search.
      </div>
    );
  }

  return (
    <div>
      {/* Header label */}
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        background: '#000',
        color: '#FAC638',
        padding: '6px 14px',
        marginBottom: 16,
        fontFamily: 'Archivo Black, sans-serif',
        textTransform: 'uppercase',
        fontSize: 11,
        letterSpacing: '0.08em',
        border: '3px solid #000',
      }}>
        <span className="material-symbols-outlined" style={{ fontSize: 16, fontVariationSettings: "'FILL' 1" }}>shopping_bag</span>
        {products.length} RESULT{products.length > 1 ? 'S' : ''} FOUND
      </div>

      {/* Horizontal scroll container */}
      <div style={{
        display: 'flex',
        gap: 16,
        overflowX: 'auto',
        paddingBottom: 12,
        scrollSnapType: 'x mandatory',
        WebkitOverflowScrolling: 'touch',
      }}>
        {products.map((prod) => (
          <div key={prod.product_id} style={{ scrollSnapAlign: 'start', flexShrink: 0 }}>
            <ProductCard {...prod} onAddToCart={onAddToCart} />
          </div>
        ))}
      </div>
    </div>
  );
}