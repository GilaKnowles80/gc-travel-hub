import React, { createContext, useContext, useState, useCallback } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);

  const addToCart = useCallback((product) => {
    setItems(prev => {
      const exists = prev.find(i => i.id === product.id);
      if (exists) return prev;
      return [...prev, product];
    });
  }, []);

  const removeFromCart = useCallback((productId) => {
    setItems(prev => prev.filter(i => i.id !== productId));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const isInCart = useCallback((productId) => items.some(i => i.id === productId), [items]);

  const totalUSD = items.reduce((sum, item) => sum + (item.price_usd || item.price / 56), 0);
  const totalPHP = items.reduce((sum, item) => sum + item.price, 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, clearCart, isInCart, totalUSD, totalPHP }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};