import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const I18nContext = createContext();

const translations = {
  en: {
    // General
    appName: 'AmpEdge',
    tagline: "India's Premier Electrical Platform",
    heroTitle: 'Powering Reliable\nElectrical Solutions',
    heroSub: 'Book certified electricians or buy quality products in minutes.',
    bookService: 'Book a Service',
    shopNow: 'Shop Now',
    // Navigation
    home: 'Home',
    store: 'Store',
    bookings: 'Bookings',
    profile: 'Profile',
    wishlist: 'Wishlist',
    cart: 'Cart',
    settings: 'Settings',
    // Auth
    login: 'Login',
    signup: 'Sign Up',
    email: 'Email',
    password: 'Password',
    phone: 'Phone Number',
    name: 'Full Name',
    skip: 'Skip',
    sendOtp: 'Send OTP',
    verifyLogin: 'Verify & Login',
    createAccount: 'Create Account',
    alreadyHaveAccount: 'Already have an account?',
    dontHaveAccount: "Don't have an account?",
    // Services
    ourServices: 'Our Services',
    repairs: 'Repairs',
    installation: 'Installation',
    emergency: 'Emergency',
    audit: 'Audit',
    mostBooked: 'Most Booked Services',
    exploreAll: 'Explore All',
    // Marketplace
    marketplace: 'Marketplace',
    hardwareStore: 'Hardware Store',
    allProducts: 'All Products',
    addToCart: 'Add to Cart',
    buyNow: 'Buy Now',
    filters: 'Filters',
    sortBy: 'Sort By',
    priceRange: 'Price Range',
    rating: 'Rating',
    search: 'Search',
    noProducts: 'No products found.',
    // Cart & Checkout
    myCart: 'My Cart',
    checkout: 'Checkout',
    subtotal: 'Subtotal',
    tax: 'GST (18%)',
    delivery: 'Delivery',
    total: 'Total',
    placeOrder: 'Place Order',
    orderPlaced: 'Order Placed!',
    applyCoupon: 'Apply Coupon',
    // Reviews
    reviews: 'Reviews',
    writeReview: 'Write a Review',
    noReviews: 'No reviews yet.',
    // Chat
    chat: 'Chat',
    typeMessage: 'Type a message...',
    // Referral
    referral: 'Refer & Earn',
    referralReward: 'Get ₹5,000 on each referral!',
    shareCode: 'Share Your Code',
    // Why AmpEdge
    whyAmpedge: 'Why AMPEDGE',
    verifiedPros: 'Verified Pros',
    warranty: '90-Day Warranty',
    fastResponse: 'Fast Response',
    // Settings
    darkMode: 'Dark Mode',
    language: 'Language',
    notifications: 'Notifications',
    logout: 'Logout',
    // Misc
    loading: 'Loading...',
    retry: 'Retry',
    cancel: 'Cancel',
    confirm: 'Confirm',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    free: 'FREE',
    off: 'OFF',
    inStock: 'In Stock',
    outOfStock: 'Out of Stock',
  },
  hi: {
    appName: 'AmpEdge',
    tagline: 'भारत का प्रमुख इलेक्ट्रिकल प्लेटफॉर्म',
    heroTitle: 'विश्वसनीय विद्युत\nसमाधान की शक्ति',
    heroSub: 'मिनटों में प्रमाणित इलेक्ट्रीशियन बुक करें या गुणवत्ता वाले उत्पाद खरीदें।',
    bookService: 'सेवा बुक करें',
    shopNow: 'अभी खरीदें',
    home: 'होम',
    store: 'स्टोर',
    bookings: 'बुकिंग',
    profile: 'प्रोफ़ाइल',
    wishlist: 'विशलिस्ट',
    cart: 'कार्ट',
    settings: 'सेटिंग्स',
    login: 'लॉगिन',
    signup: 'साइन अप',
    email: 'ईमेल',
    password: 'पासवर्ड',
    phone: 'फ़ोन नंबर',
    name: 'पूरा नाम',
    skip: 'छोड़ें',
    sendOtp: 'OTP भेजें',
    verifyLogin: 'सत्यापित करें और लॉगिन करें',
    createAccount: 'खाता बनाएं',
    alreadyHaveAccount: 'पहले से खाता है?',
    dontHaveAccount: 'खाता नहीं है?',
    ourServices: 'हमारी सेवाएं',
    repairs: 'मरम्मत',
    installation: 'स्थापना',
    emergency: 'आपातकालीन',
    audit: 'ऑडिट',
    mostBooked: 'सबसे ज्यादा बुक की गई सेवाएं',
    exploreAll: 'सब देखें',
    marketplace: 'बाज़ार',
    hardwareStore: 'हार्डवेयर स्टोर',
    allProducts: 'सभी उत्पाद',
    addToCart: 'कार्ट में जोड़ें',
    buyNow: 'अभी खरीदें',
    filters: 'फ़िल्टर',
    sortBy: 'क्रमबद्ध करें',
    priceRange: 'मूल्य सीमा',
    rating: 'रेटिंग',
    search: 'खोजें',
    noProducts: 'कोई उत्पाद नहीं मिला।',
    myCart: 'मेरा कार्ट',
    checkout: 'चेकआउट',
    subtotal: 'उप-योग',
    tax: 'GST (18%)',
    delivery: 'डिलीवरी',
    total: 'कुल',
    placeOrder: 'ऑर्डर दें',
    orderPlaced: 'ऑर्डर हो गया!',
    applyCoupon: 'कूपन लगाएं',
    reviews: 'समीक्षाएं',
    writeReview: 'समीक्षा लिखें',
    noReviews: 'अभी तक कोई समीक्षा नहीं।',
    chat: 'चैट',
    typeMessage: 'संदेश टाइप करें...',
    referral: 'रेफ़र करें और कमाएं',
    referralReward: 'हर रेफ़रल पर ₹5,000 पाएं!',
    shareCode: 'अपना कोड शेयर करें',
    whyAmpedge: 'AMPEDGE क्यों',
    verifiedPros: 'सत्यापित पेशेवर',
    warranty: '90-दिन की वारंटी',
    fastResponse: 'तेज़ प्रतिक्रिया',
    darkMode: 'डार्क मोड',
    language: 'भाषा',
    notifications: 'सूचनाएं',
    logout: 'लॉगआउट',
    loading: 'लोड हो रहा...',
    retry: 'पुनः प्रयास',
    cancel: 'रद्द करें',
    confirm: 'पुष्टि करें',
    save: 'सहेजें',
    delete: 'हटाएं',
    edit: 'संपादित करें',
    free: 'मुफ़्त',
    off: 'छूट',
    inStock: 'उपलब्ध',
    outOfStock: 'उपलब्ध नहीं',
  }
};

export const I18nProvider = ({ children }) => {
  const [locale, setLocale] = useState('en');

  useEffect(() => {
    loadLocale();
  }, []);

  const loadLocale = async () => {
    try {
      const saved = await AsyncStorage.getItem('ampedge_locale');
      if (saved && translations[saved]) setLocale(saved);
    } catch (e) {
      console.log('Failed to load locale');
    }
  };

  const changeLocale = async (newLocale) => {
    if (translations[newLocale]) {
      setLocale(newLocale);
      await AsyncStorage.setItem('ampedge_locale', newLocale);
    }
  };

  const t = (key) => {
    return translations[locale]?.[key] || translations['en']?.[key] || key;
  };

  return (
    <I18nContext.Provider value={{ locale, changeLocale, t, availableLocales: Object.keys(translations) }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => useContext(I18nContext);
export default I18nContext;
