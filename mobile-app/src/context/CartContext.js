import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const saveTimeoutRef = useRef(null);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      const saved = await AsyncStorage.getItem('ampedge_cart');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Normalize all items on load
        setCart(parsed.map(normalizeItem));
      }
    } catch (e) {
      console.log('Failed to load cart:', e);
    }
  };

  // Debounce saves to prevent race conditions
  const debouncedSave = useCallback((items) => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        await AsyncStorage.setItem('ampedge_cart', JSON.stringify(items));
      } catch (e) {
        console.log('Failed to save cart:', e);
      }
    }, 300);
  }, []);

  // Normalize item to ensure consistent ID
  const normalizeItem = (item) => {
    const id = item._id || item.id || item.itemId;
    return {
      ...item,
      itemId: id,
      _id: id,
      quantity: item.quantity || 1,
      cartType: item.cartType || (item.category ? 'product' : 'service'),
    };
  };

  // Get a stable unique ID from an item
  const getItemId = (item) => item._id || item.id || item.itemId;

  const addToCart = useCallback((item) => {
    if (!item || !getItemId(item)) {
      console.warn('Cannot add item without an ID to cart');
      return;
    }

    setCart((prevCart) => {
      const normalized = normalizeItem(item);
      const targetId = String(normalized.itemId);

      // Check if item already exists
      const existingIndex = prevCart.findIndex(
        (c) => String(c.itemId) === targetId
      );

      let updated;
      if (existingIndex >= 0) {
        // Increment quantity of existing item
        updated = prevCart.map((c, idx) => {
          if (idx === existingIndex) {
            return { ...c, quantity: (c.quantity || 1) + 1 };
          }
          return c;
        });
      } else {
        // Add new item
        updated = [...prevCart, { ...normalized, quantity: 1 }];
      }

      debouncedSave(updated);
      return updated;
    });
  }, [debouncedSave]);

  const removeFromCart = useCallback((itemId) => {
    setCart((prevCart) => {
      const targetId = String(itemId);
      const updated = prevCart.filter(
        (item) => String(item.itemId) !== targetId && String(item._id) !== targetId && String(item.id) !== targetId
      );
      debouncedSave(updated);
      return updated;
    });
  }, [debouncedSave]);

  const updateQuantity = useCallback((itemId, newQty) => {
    if (newQty < 1) {
      removeFromCart(itemId);
      return;
    }
    setCart((prevCart) => {
      const targetId = String(itemId);
      const updated = prevCart.map((item) => {
        if (String(item.itemId) === targetId || String(item._id) === targetId || String(item.id) === targetId) {
          return { ...item, quantity: newQty };
        }
        return item;
      });
      debouncedSave(updated);
      return updated;
    });
  }, [debouncedSave, removeFromCart]);

  const clearCart = useCallback(async () => {
    setCart([]);
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    await AsyncStorage.removeItem('ampedge_cart');
  }, []);

  // Calculate totals
  const cartSubtotal = cart.reduce((total, item) => total + ((item.basePrice || 0) * (item.quantity || 1)), 0);
  const cartTax = Math.round(cartSubtotal * 0.18); // 18% GST
  const cartDelivery = cart.some(i => i.cartType === 'product') ? 49 : 0;
  const cartTotal = cartSubtotal + cartTax + cartDelivery;
  const cartItemCount = cart.reduce((count, item) => count + (item.quantity || 1), 0);

  const getProductItems = useCallback(() => cart.filter(i => i.cartType === 'product'), [cart]);
  const getServiceItems = useCallback(() => cart.filter(i => i.cartType === 'service'), [cart]);

  return (
    <CartContext.Provider value={{
      cart, addToCart, removeFromCart, updateQuantity, clearCart,
      cartSubtotal, cartTax, cartDelivery, cartTotal, cartItemCount,
      getProductItems, getServiceItems
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
