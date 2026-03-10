'use client';
import React, { useEffect, useState } from 'react';

type CartItem = {
  product_id: string;
  product_name: string;
  price: number;
  quantity: number;
};

type CartConfirmationProps = {
  success: boolean;
  message: string;
  added_item?: CartItem | null;
  cart_total_items?: number;
  cart_total_price?: number;
  savings?: number | null;
};

export function CartConfirmation(props: CartConfirmationProps) {
  const { success, message, added_item, cart_total_items, cart_total_price, savings } = props;
  const safeItem: CartItem = added_item ?? {
    product_id: '',
    product_name: message || 'Item',
    price: 0,
    quantity: 1,
  };
  const totalItems = cart_total_items ?? 0;
  const totalPrice = cart_total_price ?? 0;
  const hasItem = Boolean(added_item);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Animate in
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className="rounded-2xl overflow-hidden transition-all duration-500"
      style={{
        minWidth: '260px',
        maxWidth: '340px',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0) scale(1)' : 'translateY(12px) scale(0.97)',
        background: 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.35)',
      }}
    >
      {/* Top success banner */}
      <div
        className="flex items-center gap-3 px-4 py-3"
        style={{
          background: success
            ? 'linear-gradient(90deg, #10b981, #059669)'
            : 'linear-gradient(90deg, #ef4444, #dc2626)',
        }}
      >
        <span className="text-2xl">{success ? '🛒' : '⚠️'}</span>
        <div>
          <p className="text-white font-bold text-sm">
            {success ? 'Added to Cart!' : 'Something went wrong'}
          </p>
          <p className="text-emerald-100 text-xs">{safeItem.product_name}</p>
        </div>
      </div>

      {/* Item detail */}
      <div className="px-4 py-3 border-b border-white/10">
        {hasItem ? (
          <>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-300 text-xs mb-1">Item added</p>
                <p className="text-white font-semibold text-sm line-clamp-1">{safeItem.product_name}</p>
              </div>
              <div className="text-right">
                <p className="text-gray-300 text-xs mb-1">Price</p>
                <p className="text-white font-bold">${safeItem.price.toFixed(2)}</p>
              </div>
            </div>
            {safeItem.quantity > 1 && (
              <div className="mt-2 px-2 py-1 rounded-lg bg-white/10 text-center">
                <span className="text-gray-300 text-xs">Qty: <span className="text-white font-bold">{safeItem.quantity}</span></span>
              </div>
            )}
          </>
        ) : (
          <p className="text-gray-200 text-sm">{message}</p>
        )}
      </div>

      {/* Cart summary */}
      <div className="px-4 py-3">
        <p className="text-gray-400 text-xs uppercase tracking-widest mb-2">Cart Summary</p>
        <div className="flex justify-between items-center mb-1">
          <span className="text-gray-300 text-sm">{totalItems} item{totalItems > 1 ? 's' : ''}</span>
          <span className="text-white font-black text-lg">${totalPrice.toFixed(2)}</span>
        </div>
        {savings && savings > 0 && (
          <div className="flex justify-between items-center mt-1">
            <span className="text-emerald-400 text-xs">You're saving</span>
            <span className="text-emerald-400 text-xs font-bold">-${savings.toFixed(2)}</span>
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="px-4 pb-4 flex gap-2">
        <button
          className="flex-1 py-2 rounded-xl text-sm font-semibold text-gray-300 border border-white/20 hover:bg-white/10 transition-colors"
          onClick={() => {}}
        >
          Continue Shopping
        </button>
        <button
          className="flex-1 py-2 rounded-xl text-sm font-bold text-white transition-colors"
          style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}
          onClick={() => {}}
        >
          Checkout →
        </button>
      </div>
    </div>
  );
}
