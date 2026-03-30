import React, { createContext, useState, useContext } from 'react';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  // Add a service to the cart
  const addToCart = (service) => {
    setCart((prevCart) => {
      // Check if already in cart
      const exists = prevCart.find((item) => item._id === service._id || item.id === service.id);
      if (exists) return prevCart; // Prevent duplicates in simple service booking
      return [...prevCart, service];
    });
  };

  // Remove a service
  const removeFromCart = (serviceId) => {
    setCart((prevCart) => prevCart.filter((item) => item._id !== serviceId && item.id !== serviceId));
  };

  // Clear cart
  const clearCart = () => setCart([]);

  // Calculate generic total
  const cartTotal = cart.reduce((total, item) => total + (item.basePrice || 0), 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, cartTotal }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
