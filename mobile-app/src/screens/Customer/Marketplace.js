import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet, SafeAreaView } from 'react-native';
import { Search, ShoppingCart, Info, Plus, Minus, ChevronLeft } from 'lucide-react-native';
import apiClient from '../../services/api';
import { useCart } from '../../context/CartContext';

export default function Marketplace({ navigation }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('ALL');

  const { cart, addToCart, updateQuantity, cartTotal, cartItemCount } = useCart();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/products');
      if (res.data?.success) {
        setProducts(res.data.data || []);
      }
    } catch (err) {
      console.log('Error fetching products', err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['ALL', 'WIRING_MATERIALS', 'APPLIANCES', 'TOOLS_EQUIPMENT', 'LIGHTING_FIXTURES', 'SMART_HOME'];
  const categoryLabels = {
    ALL: 'All Products',
    WIRING_MATERIALS: 'Wiring & Parts',
    APPLIANCES: 'Appliances',
    TOOLS_EQUIPMENT: 'Tools & Drills',
    LIGHTING_FIXTURES: 'Lighting',
    SMART_HOME: 'Smart Home',
  };

  const filtered = products.filter((p) => {
    if (activeCategory !== 'ALL' && p.category !== activeCategory) return false;
    const name = p.name || '';
    return name.toLowerCase().includes((searchTerm || '').toLowerCase());
  });

  const getCartItem = (product) => {
    const id = product._id || product.id;
    return cart.find((c) => (c._id || c.id) === id);
  };

  const renderProduct = ({ item }) => {
    const cartItem = getCartItem(item);
    const qty = cartItem ? cartItem.quantity || 1 : 0;
    const itemId = item._id || item.id;

    return (
      <View style={styles.card}>
        <View style={styles.imagePlaceholder}>
          <Text style={styles.imageText}>
            {item.category ? item.category[0] : 'H'}
          </Text>
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.prodName} numberOfLines={1}>
            {item.name || 'Unnamed Product'}
          </Text>
          <Text style={styles.prodDesc} numberOfLines={2}>
            {item.description || 'Quality electrical hardware.'}
          </Text>
          <Text style={styles.prodPrice}>₹{item.basePrice || 0}</Text>

          {/* Stock indicator */}
          {item.stock != null && item.stock <= 5 && (
            <Text style={styles.lowStock}>Only {item.stock} left</Text>
          )}

          {/* Add / Quantity Controls */}
          <View style={styles.qtyRow}>
            {qty === 0 ? (
              <TouchableOpacity
                style={styles.addBtn}
                onPress={() => addToCart(item, 'product')}
              >
                <Text style={styles.addBtnText}>Add</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.stepper}>
                <TouchableOpacity
                  style={styles.stepperBtn}
                  onPress={() => updateQuantity(itemId, -1)}
                >
                  <Minus size={14} color="#1e56a0" />
                </TouchableOpacity>
                <Text style={styles.stepperQty}>{qty}</Text>
                <TouchableOpacity
                  style={styles.stepperBtn}
                  onPress={() => updateQuantity(itemId, 1)}
                >
                  <Plus size={14} color="#1e56a0" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Hardware Store</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('BookingConfirm')}
          style={styles.cartIconContainer}
        >
          <ShoppingCart size={24} color="#0f172a" />
          {cartItemCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{cartItemCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Info Banner */}
      <View style={styles.banner}>
        <Info size={16} color="#1e56a0" />
        <Text style={styles.bannerText}>
          Add hardware parts to your cart alongside your services!
        </Text>
      </View>

      {/* Category Tabs */}
      <View style={styles.categoryContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={categories}
          keyExtractor={(c) => c}
          contentContainerStyle={{ paddingHorizontal: 20 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.catBadge, activeCategory === item && styles.catBadgeActive]}
              onPress={() => setActiveCategory(item)}
            >
              <Text style={[styles.catBadgeText, activeCategory === item && styles.catBadgeTextActive]}>
                {categoryLabels[item] || item}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#1e56a0" />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item, index) => item._id || item.id || `prod-${index}`}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContainer}
          renderItem={renderProduct}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No products found.</Text>
            </View>
          }
        />
      )}

      {/* Floating Cart Bar */}
      {cartItemCount > 0 && (
        <View style={styles.floatingCart}>
          <View style={styles.floatingCartLeft}>
            <ShoppingCart size={18} color="#fff" />
            <Text style={styles.floatingCartText}>
              {cartItemCount} item{cartItemCount > 1 ? 's' : ''} • ₹{cartTotal}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.floatingCartBtn}
            onPress={() => navigation.navigate('BookingConfirm')}
          >
            <Text style={styles.floatingCartBtnText}>View Cart</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#0f172a' },
  cartIconContainer: {
    position: 'relative',
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 20,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#ef4444',
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    paddingHorizontal: 3,
  },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#e0e7ff',
    padding: 12,
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 12,
  },
  bannerText: { fontSize: 13, color: '#1e56a0', fontWeight: '600', flex: 1 },
  categoryContainer: {
    marginTop: 16,
    marginBottom: 8,
  },
  catBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 20,
    marginRight: 10,
  },
  catBadgeActive: {
    backgroundColor: '#1e56a0',
    borderColor: '#1e56a0',
  },
  catBadgeText: {
    color: '#64748b',
    fontSize: 13,
    fontWeight: '700',
  },
  catBadgeTextActive: {
    color: '#fff',
  },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContainer: { padding: 20, paddingBottom: 120 },
  row: { justifyContent: 'space-between', marginBottom: 16 },
  card: {
    backgroundColor: '#fff',
    width: '48%',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  imagePlaceholder: {
    height: 120,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageText: { fontSize: 40, color: '#cbd5e1', fontWeight: '800' },
  cardContent: { padding: 12 },
  prodName: { fontSize: 14, fontWeight: '700', color: '#0f172a', marginBottom: 4 },
  prodDesc: { fontSize: 11, color: '#64748b', marginBottom: 8, lineHeight: 16 },
  prodPrice: { fontSize: 16, fontWeight: '800', color: '#1e56a0', marginBottom: 4 },
  lowStock: { fontSize: 11, color: '#ef4444', fontWeight: '700', marginBottom: 8 },
  qtyRow: { marginTop: 4 },
  addBtn: {
    backgroundColor: '#1e56a0',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  addBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#e0e7ff',
    borderRadius: 10,
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  stepperBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperQty: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1e56a0',
    minWidth: 24,
    textAlign: 'center',
  },
  emptyContainer: { alignItems: 'center', marginTop: 40 },
  emptyText: { color: '#94a3b8', fontSize: 15, fontWeight: '600' },
  floatingCart: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    right: 20,
    backgroundColor: '#1e56a0',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#1e56a0',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  floatingCartLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  floatingCartText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  floatingCartBtn: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  floatingCartBtnText: { color: '#1e56a0', fontSize: 14, fontWeight: '800' },
});
