import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet, SafeAreaView } from 'react-native';
import { ChevronLeft, ChevronRight, Star, Clock, ShoppingCart } from 'lucide-react-native';
import apiClient from '../../services/api';
import { useCart } from '../../context/CartContext';

export default function ServiceList({ route, navigation }) {
  const category = route?.params?.category || 'ALL';
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const { cart, addToCart, cartTotal, cartItemCount } = useCart();

  useEffect(() => {
    fetchServices();
  }, [category]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const endpoint = category === 'ALL'
        ? '/services'
        : `/services?category=${encodeURIComponent(category.toUpperCase())}`;

      const res = await apiClient.get(endpoint);
      setServices(res.data?.data || []);
    } catch (error) {
      console.log('Error fetching services', error);
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => {
    const itemId = item._id || item.id;
    const isAdded = cart.some((c) => (c._id || c.id) === itemId && c._type === 'service');

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.serviceName}>{item.name || 'Unnamed Service'}</Text>
          {item.category ? <Text style={styles.categoryBadge}>{item.category}</Text> : null}
        </View>

        <View style={styles.metaRow}>
          <View style={styles.metaBadge}>
            <Star size={14} color="#f59e0b" fill="#f59e0b" />
            <Text style={styles.metaText}>4.8 (1.2k reqs)</Text>
          </View>
          <View style={styles.metaBadge}>
            <Clock size={14} color="#64748b" />
            <Text style={styles.metaText}>{item.estimatedDuration || 60} mins</Text>
          </View>
        </View>

        <Text style={styles.serviceDesc} numberOfLines={2}>
          {item.description || 'Professional electrical service by certified technicians.'}
        </Text>

        <View style={styles.footerRow}>
          <View>
            <Text style={styles.priceLabel}>Starts at</Text>
            <Text style={styles.servicePrice}>₹{item.basePrice || 0}</Text>
          </View>
          <TouchableOpacity
            style={[styles.addBtn, isAdded && styles.addBtnActive]}
            onPress={() => addToCart(item, 'service')}
            disabled={isAdded}
          >
            <Text style={[styles.addBtnText, isAdded && styles.addBtnTextActive]}>
              {isAdded ? 'ADDED ✓' : 'ADD +'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft size={28} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {category === 'ALL' ? 'Explore Services' : `${category} Services`}
        </Text>
        <View style={{ width: 28 }} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1e56a0" />
        </View>
      ) : (
        <FlatList
          data={services}
          keyExtractor={(item, index) => item._id || item.id || `svc-${index}`}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No services found in this category.</Text>
            </View>
          }
          renderItem={renderItem}
        />
      )}

      {/* Floating Cart Footer */}
      {cartItemCount > 0 && (
        <View style={styles.floatingCartContainer}>
          <View style={styles.cartInfo}>
            <View style={styles.cartIconWrapper}>
              <ShoppingCart size={20} color="#fff" />
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{cartItemCount}</Text>
              </View>
            </View>
            <Text style={styles.cartTotalText}>₹{cartTotal}</Text>
          </View>

          <TouchableOpacity
            style={styles.checkoutBtn}
            onPress={() => navigation.navigate('BookingConfirm')}
          >
            <Text style={styles.checkoutText}>View Cart</Text>
            <ChevronRight size={20} color="#1e56a0" style={{ marginLeft: 4 }} />
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#0f172a' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContainer: { padding: 16, paddingBottom: 100 },
  emptyContainer: { alignItems: 'center', marginTop: 40 },
  emptyText: { color: '#94a3b8', fontSize: 16, fontWeight: '500' },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  serviceName: { fontSize: 18, fontWeight: '800', color: '#0f172a', flex: 1 },
  categoryBadge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    fontSize: 10,
    fontWeight: '700',
    color: '#64748b',
    marginLeft: 12,
    overflow: 'hidden',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: { fontSize: 12, color: '#64748b', fontWeight: '600' },
  serviceDesc: { color: '#64748b', fontSize: 13, lineHeight: 20, marginBottom: 16 },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f8fafc',
    paddingTop: 16,
  },
  priceLabel: { fontSize: 11, color: '#94a3b8', fontWeight: '600', marginBottom: 2 },
  servicePrice: { color: '#0f172a', fontWeight: '800', fontSize: 20 },
  addBtn: {
    backgroundColor: '#e0e7ff',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  addBtnActive: {
    backgroundColor: '#dcfce7',
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  addBtnText: { color: '#1e56a0', fontWeight: '800', fontSize: 14 },
  addBtnTextActive: { color: '#16a34a' },
  floatingCartContainer: {
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
  cartInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  cartIconWrapper: {
    position: 'relative',
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 10,
    borderRadius: 12,
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#ef4444',
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#1e56a0',
  },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  cartTotalText: { color: '#fff', fontSize: 18, fontWeight: '800' },
  checkoutBtn: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  checkoutText: { color: '#1e56a0', fontSize: 14, fontWeight: '800' },
});
