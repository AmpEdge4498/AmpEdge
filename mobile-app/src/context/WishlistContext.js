import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    loadWishlist();
  }, []);

  const loadWishlist = async () => {
    try {
      const saved = await AsyncStorage.getItem('ampedge_wishlist');
      if (saved) setWishlist(JSON.parse(saved));
    } catch (e) {
      console.log('Failed to load wishlist');
    }
  };

  const saveWishlist = async (items) => {
    try {
      await AsyncStorage.setItem('ampedge_wishlist', JSON.stringify(items));
    } catch (e) {
      console.log('Failed to save wishlist');
    }
  };

  const toggleWishlist = (product) => {
    setWishlist(prev => {
      const exists = prev.find(p => p._id === product._id);
      let updated;
      if (exists) {
        updated = prev.filter(p => p._id !== product._id);
      } else {
        updated = [...prev, product];
      }
      saveWishlist(updated);
      return updated;
    });
  };

  const isInWishlist = (productId) => {
    return wishlist.some(p => p._id === productId);
  };

  const clearWishlist = async () => {
    setWishlist([]);
    await AsyncStorage.removeItem('ampedge_wishlist');
  };

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist, isInWishlist, clearWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
export default WishlistContext;
