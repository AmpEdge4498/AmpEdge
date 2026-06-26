import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator, Dimensions, TextInput, Alert } from 'react-native';
import { ArrowLeft, Heart, ShoppingCart, Star, ChevronRight, Minus, Plus, Share2, ShieldCheck, Truck, RotateCcw } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import api from '../../services/api';

const { width } = Dimensions.get('window');

export default function ProductDetail({ navigation, route }) {
  const { product } = route.params;
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);
  
  const { theme } = useTheme();
  const c = theme.colors;
  const { addToCart, cart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const wishlisted = isInWishlist(product._id);

  // Generate mock product images (colors as placeholders)
  const productImages = [
    { color: '#e0e7ff', label: product.category?.[0] || 'P' },
    { color: '#dbeafe', label: '📐' },
    { color: '#f0fdf4', label: '📦' },
  ];

  useEffect(() => {
    fetchReviews();
    fetchSimilar();
  }, []);

  const fetchReviews = async () => {
    try {
      const res = await api.get(`/reviews?targetType=PRODUCT&targetId=${product._id}`);
      if (res.data.success) {
        setReviews(res.data.data);
        setAvgRating(res.data.stats?.avgRating || 4.2);
        setReviewCount(res.data.stats?.count || 0);
      }
    } catch (e) {
      // Use mock data
      setAvgRating(4.3);
      setReviewCount(24);
      setReviews([
        { _id: '1', userName: 'Rahul S.', rating: 5, comment: 'Excellent quality product. Fast delivery!', createdAt: new Date() },
        { _id: '2', userName: 'Priya M.', rating: 4, comment: 'Good value for money. Works as expected.', createdAt: new Date() },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSimilar = async () => {
    try {
      const res = await api.get('/products');
      if (res.data.success) {
        setSimilarProducts(res.data.data.filter(p => p.category === product.category && p._id !== product._id).slice(0, 6));
      }
    } catch (e) { /* silent */ }
  };

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) addToCart(product);
    Alert.alert('Added to Cart', `${quantity}x ${product.name} added!`);
  };

  const renderStars = (rating, size = 14) => {
    return [1, 2, 3, 4, 5].map(i => (
      <Star key={i} size={size} color="#f59e0b" fill={i <= Math.round(rating) ? '#f59e0b' : 'transparent'} />
    ));
  };

  const discount = Math.round(product.basePrice * 0.15);
  const mrp = product.basePrice + discount;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: c.surface, borderBottomColor: c.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
          <ArrowLeft size={22} color={c.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: c.text }]} numberOfLines={1}>{product.name}</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity onPress={() => toggleWishlist(product)} style={styles.headerBtn}>
            <Heart size={22} color={wishlisted ? '#ef4444' : c.textMuted} fill={wishlisted ? '#ef4444' : 'transparent'} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('CartScreen')} style={styles.headerBtn}>
            <ShoppingCart size={22} color={c.text} />
            {cart.length > 0 && <View style={styles.badge}><Text style={styles.badgeText}>{cart.length}</Text></View>}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image Carousel */}
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(e) => setActiveImageIdx(Math.round(e.nativeEvent.contentOffset.x / width))}
        >
          {productImages.map((img, idx) => (
            <View key={idx} style={[styles.imageSlide, { backgroundColor: img.color }]}>
              <Text style={styles.imageEmoji}>{img.label}</Text>
              {discount > 0 && idx === 0 && (
                <View style={styles.discountBadge}>
                  <Text style={styles.discountText}>15% OFF</Text>
                </View>
              )}
            </View>
          ))}
        </ScrollView>
        
        {/* Dots */}
        <View style={styles.dotsRow}>
          {productImages.map((_, idx) => (
            <View key={idx} style={[styles.dot, activeImageIdx === idx && styles.dotActive]} />
          ))}
        </View>

        {/* Product Info */}
        <View style={[styles.infoSection, { backgroundColor: c.surface }]}>
          <View style={[styles.categoryBadge, { backgroundColor: c.primaryLight }]}>
            <Text style={[styles.categoryText, { color: c.primary }]}>{product.category?.replace(/_/g, ' ') || 'PRODUCT'}</Text>
          </View>
          
          <Text style={[styles.productName, { color: c.text }]}>{product.name}</Text>
          
          <View style={styles.ratingRow}>
            <View style={styles.starsRow}>{renderStars(avgRating)}</View>
            <Text style={{ color: c.textSecondary, fontSize: 13, fontWeight: '600' }}>{avgRating.toFixed(1)} ({reviewCount} reviews)</Text>
          </View>

          <View style={styles.priceRow}>
            <Text style={[styles.price, { color: c.text }]}>₹{product.basePrice.toLocaleString()}</Text>
            <Text style={styles.mrp}>₹{mrp.toLocaleString()}</Text>
            <View style={styles.saveBadge}>
              <Text style={styles.saveText}>Save ₹{discount}</Text>
            </View>
          </View>

          <Text style={[styles.stockText, { color: product.stock > 0 ? '#22c55e' : '#ef4444' }]}>
            {product.stock > 0 ? `✓ In Stock (${product.stock} available)` : '✕ Out of Stock'}
          </Text>
        </View>

        {/* Quantity Selector + Add to Cart */}
        <View style={[styles.cartSection, { backgroundColor: c.surface }]}>
          <View style={styles.qtyRow}>
            <Text style={[styles.qtyLabel, { color: c.textSecondary }]}>Quantity:</Text>
            <View style={[styles.qtyControl, { borderColor: c.border }]}>
              <TouchableOpacity onPress={() => setQuantity(Math.max(1, quantity - 1))} style={styles.qtyBtn}>
                <Minus size={18} color={c.text} />
              </TouchableOpacity>
              <Text style={[styles.qtyValue, { color: c.text }]}>{quantity}</Text>
              <TouchableOpacity onPress={() => setQuantity(Math.min(product.stock || 10, quantity + 1))} style={styles.qtyBtn}>
                <Plus size={18} color={c.text} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.cartBtns}>
            <TouchableOpacity style={[styles.addToCartBtn, { borderColor: '#4169E1' }]} onPress={handleAddToCart}>
              <ShoppingCart size={18} color="#4169E1" />
              <Text style={styles.addToCartText}>Add to Cart</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.buyNowBtn} onPress={() => { handleAddToCart(); navigation.navigate('CartScreen'); }}>
              <Text style={styles.buyNowText}>Buy Now</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Features Row */}
        <View style={[styles.featuresRow, { backgroundColor: c.surface }]}>
          <View style={styles.featureItem}>
            <Truck size={20} color="#4169E1" />
            <Text style={[styles.featureText, { color: c.textSecondary }]}>Free Delivery</Text>
          </View>
          <View style={styles.featureItem}>
            <ShieldCheck size={20} color="#22c55e" />
            <Text style={[styles.featureText, { color: c.textSecondary }]}>Genuine Product</Text>
          </View>
          <View style={styles.featureItem}>
            <RotateCcw size={20} color="#f59e0b" />
            <Text style={[styles.featureText, { color: c.textSecondary }]}>Easy Returns</Text>
          </View>
        </View>

        {/* Description / Specs */}
        <View style={[styles.descSection, { backgroundColor: c.surface }]}>
          <Text style={[styles.sectionTitle, { color: c.text }]}>Product Details</Text>
          <Text style={[styles.descText, { color: c.textSecondary }]}>{product.description}</Text>
          
          <View style={styles.specGrid}>
            {[
              { label: 'Brand', value: product.name?.split(' ')[0] || 'AmpEdge' },
              { label: 'Category', value: product.category?.replace(/_/g, ' ') },
              { label: 'Warranty', value: '1 Year' },
              { label: 'Material', value: 'Premium Grade' },
            ].map((spec, idx) => (
              <View key={idx} style={[styles.specItem, { backgroundColor: c.surfaceAlt, borderColor: c.border }]}>
                <Text style={[styles.specLabel, { color: c.textMuted }]}>{spec.label}</Text>
                <Text style={[styles.specValue, { color: c.text }]}>{spec.value}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Reviews Section */}
        <View style={[styles.reviewSection, { backgroundColor: c.surface }]}>
          <View style={styles.reviewHeader}>
            <Text style={[styles.sectionTitle, { color: c.text }]}>Ratings & Reviews</Text>
            <View style={styles.avgRatingBox}>
              <Text style={styles.avgRatingNum}>{avgRating.toFixed(1)}</Text>
              <Star size={14} color="#f59e0b" fill="#f59e0b" />
            </View>
          </View>

          {reviews.map(review => (
            <View key={review._id} style={[styles.reviewCard, { borderColor: c.borderLight }]}>
              <View style={styles.reviewCardHeader}>
                <View style={[styles.reviewAvatar, { backgroundColor: '#4169E1' }]}>
                  <Text style={{ color: '#fff', fontWeight: '800', fontSize: 14 }}>{review.userName?.[0] || 'U'}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.reviewName, { color: c.text }]}>{review.userName}</Text>
                  <View style={{ flexDirection: 'row', marginTop: 2 }}>{renderStars(review.rating, 12)}</View>
                </View>
              </View>
              <Text style={[styles.reviewComment, { color: c.textSecondary }]}>{review.comment}</Text>
            </View>
          ))}
        </View>

        {/* Similar Products */}
        {similarProducts.length > 0 && (
          <View style={[styles.similarSection, { backgroundColor: c.surface }]}>
            <Text style={[styles.sectionTitle, { color: c.text }]}>Similar Products</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingRight: 20 }}>
              {similarProducts.map(sp => (
                <TouchableOpacity
                  key={sp._id}
                  style={[styles.similarCard, { backgroundColor: c.surfaceAlt, borderColor: c.border }]}
                  onPress={() => navigation.push('ProductDetail', { product: sp })}
                >
                  <View style={[styles.similarImage, { backgroundColor: c.borderLight }]}>
                    <Text style={{ fontSize: 28 }}>{sp.category?.[0] || '📦'}</Text>
                  </View>
                  <Text style={[styles.similarName, { color: c.text }]} numberOfLines={1}>{sp.name}</Text>
                  <Text style={[styles.similarPrice, { color: c.primary }]}>₹{sp.basePrice}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  headerBtn: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  headerTitle: { flex: 1, fontSize: 16, fontWeight: '700', marginHorizontal: 12 },
  badge: { position: 'absolute', top: -2, right: -2, backgroundColor: '#ef4444', width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  imageSlide: { width, height: 300, alignItems: 'center', justifyContent: 'center' },
  imageEmoji: { fontSize: 80 },
  discountBadge: { position: 'absolute', top: 16, left: 16, backgroundColor: '#ef4444', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  discountText: { color: '#fff', fontSize: 12, fontWeight: '800' },
  dotsRow: { flexDirection: 'row', justifyContent: 'center', paddingVertical: 12, gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#e2e8f0' },
  dotActive: { backgroundColor: '#4169E1', width: 24 },
  infoSection: { padding: 20, marginBottom: 8 },
  categoryBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, marginBottom: 8 },
  categoryText: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5, textTransform: 'uppercase' },
  productName: { fontSize: 22, fontWeight: '900', marginBottom: 8, letterSpacing: -0.3 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  starsRow: { flexDirection: 'row', gap: 2 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  price: { fontSize: 28, fontWeight: '900' },
  mrp: { fontSize: 16, color: '#94a3b8', textDecorationLine: 'line-through' },
  saveBadge: { backgroundColor: '#dcfce7', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  saveText: { color: '#16a34a', fontSize: 12, fontWeight: '700' },
  stockText: { fontSize: 13, fontWeight: '700' },
  cartSection: { padding: 20, marginBottom: 8 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  qtyLabel: { fontSize: 15, fontWeight: '600' },
  qtyControl: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderRadius: 12, overflow: 'hidden' },
  qtyBtn: { paddingHorizontal: 14, paddingVertical: 10 },
  qtyValue: { fontSize: 16, fontWeight: '800', paddingHorizontal: 16 },
  cartBtns: { flexDirection: 'row', gap: 12 },
  addToCartBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 12, borderWidth: 2 },
  addToCartText: { color: '#4169E1', fontWeight: '800', fontSize: 14 },
  buyNowBtn: { flex: 1, backgroundColor: '#4169E1', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 12, shadowColor: '#4169E1', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 4 },
  buyNowText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  featuresRow: { flexDirection: 'row', justifyContent: 'space-around', padding: 16, marginBottom: 8 },
  featureItem: { alignItems: 'center', gap: 6 },
  featureText: { fontSize: 11, fontWeight: '600' },
  descSection: { padding: 20, marginBottom: 8 },
  sectionTitle: { fontSize: 18, fontWeight: '800', marginBottom: 14 },
  descText: { fontSize: 14, lineHeight: 22, marginBottom: 16 },
  specGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  specItem: { width: '47%', padding: 12, borderRadius: 10, borderWidth: 1 },
  specLabel: { fontSize: 11, fontWeight: '600', marginBottom: 2 },
  specValue: { fontSize: 13, fontWeight: '700' },
  reviewSection: { padding: 20, marginBottom: 8 },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  avgRatingBox: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#fef3c7', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  avgRatingNum: { fontSize: 16, fontWeight: '900', color: '#d97706' },
  reviewCard: { borderTopWidth: 1, paddingVertical: 14 },
  reviewCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  reviewAvatar: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  reviewName: { fontSize: 14, fontWeight: '700' },
  reviewComment: { fontSize: 13, lineHeight: 20 },
  similarSection: { padding: 20, marginBottom: 8 },
  similarCard: { width: 140, borderRadius: 14, overflow: 'hidden', borderWidth: 1 },
  similarImage: { height: 100, alignItems: 'center', justifyContent: 'center' },
  similarName: { fontSize: 12, fontWeight: '700', padding: 8, paddingBottom: 2 },
  similarPrice: { fontSize: 14, fontWeight: '800', paddingHorizontal: 8, paddingBottom: 10 },
});
