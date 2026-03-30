import React, { createContext, useState, useContext, useMemo } from 'react';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  // Add item to cart
  // type: 'service' | 'product'
  const addToCart = (item, type = 'service') => {
    setCart((prev) => {
      const id = item._id || item.id;
      const existing = prev.find((c) => (c._id || c.id) === id);

      if (type === 'service') {
        // Services can only be added once
        if (existing) return prev;
        return [...prev, { ...item, _type: 'service', quantity: 1 }];
      }

      // Products — if already in cart, increment quantity
      if (existing) {
        return prev.map((c) =>
          (c._id || c.id) === id ? { ...c, quantity: (c.quantity || 1) + 1 } : c
        );
      }
      return [...prev, { ...item, _type: 'product', quantity: 1 }];
    });
  };

  // Update quantity for a product (delta: +1 / -1)
  const updateQuantity = (itemId, delta) => {
    setCart((prev) => {
      return prev
        .map((c) => {
          const id = c._id || c.id;
          if (id === itemId) {
            const newQty = (c.quantity || 1) + delta;
            if (newQty <= 0) return null; // will be filtered out
            return { ...c, quantity: newQty };
          }
          return c;
        })
        .filter(Boolean);
    });
  };

  // Remove item entirely
  const removeFromCart = (itemId) => {
    setCart((prev) => prev.filter((c) => (c._id || c.id) !== itemId));
  };

  // Clear cart
  const clearCart = () => setCart([]);

  // Derived: separate lists
  const services = useMemo(() => cart.filter((c) => c._type === 'service'), [cart]);
  const products = useMemo(() => cart.filter((c) => c._type === 'product'), [cart]);

  // Totals
  const servicesTotalAmount = useMemo(
    () => services.reduce((sum, s) => sum + (s.basePrice || 0), 0),
    [services]
  );
  const productsTotalAmount = useMemo(
    () => products.reduce((sum, p) => sum + (p.basePrice || 0) * (p.quantity || 1), 0),
    [products]
  );
  const cartTotal = servicesTotalAmount + productsTotalAmount;
  const cartItemCount = services.length + products.reduce((n, p) => n + (p.quantity || 1), 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        services,
        products,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        cartTotal,
        cartItemCount,
        servicesTotalAmount,
        productsTotalAmount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
