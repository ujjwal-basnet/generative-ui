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
      <div className="py-4 text-gray-400 text-sm">No products found for that search.</div>
    );
  }

  return (
    <div>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
        {products.length} result{products.length > 1 ? 's' : ''} found
      </p>
      <div className="flex gap-3 overflow-x-auto pb-3" style={{ scrollSnapType: 'x mandatory' }}>
        {products.map((prod) => (
          <div key={prod.product_id} style={{ scrollSnapAlign: 'start' }}>
            <ProductCard {...prod} onAddToCart={onAddToCart} />
          </div>
        ))}
      </div>
    </div>
  );
}