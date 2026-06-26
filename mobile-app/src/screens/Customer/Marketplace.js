import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet, SafeAreaView, TextInput, Modal } from 'react-native';
import { Search, ShoppingCart, Heart, SlidersHorizontal, X, Star, ChevronDown } from 'lucide-react-native';
import apiClient from '../../services/api';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useTheme } from '../../context/ThemeContext';

export default function Marketplace({ navigation }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('default');
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(50000);
  const [minRating, setMinRating] = useState(0);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const { cart, addToCart, cartItemCount } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { theme } = useTheme();
  const c = theme.colors;

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/products');
      if (res.data.success) setProducts(res.data.data);
    } catch (err) { console.log('Error fetching products', err); }
    finally { setLoading(false); }
  };

  const categories = ['ALL', 'WIRING_MATERIALS', 'APPLIANCES', 'TOOLS_EQUIPMENT', 'LIGHTING_FIXTURES', 'SMART_HOME'];
  const categoryLabels = {
    'ALL': 'All', 'WIRING_MATERIALS': 'Wiring', 'APPLIANCES': 'Appliances',
    'TOOLS_EQUIPMENT': 'Tools', 'LIGHTING_FIXTURES': 'Lighting', 'SMART_HOME': 'Smart Home'
  };

  const handleSearch = (text) => {
    setSearchTerm(text);
    if (text.length > 1) {
      const matches = products.filter(p => p.name.toLowerCase().includes(text.toLowerCase())).slice(0, 5);
      setSuggestions(matches);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  let filtered = products
    .filter(p => activeCategory === 'ALL' || p.category === activeCategory)
    .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter(p => p.basePrice >= minPrice && p.basePrice <= maxPrice);

  if (sortBy === 'price_low') filtered.sort((a, b) => a.basePrice - b.basePrice);
  if (sortBy === 'price_high') filtered.sort((a, b) => b.basePrice - a.basePrice);
  if (sortBy === 'newest') filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const renderProduct = ({ item }) => {
    const isAdded = cart.some(c => c._id === item._id);
    const wishlisted = isInWishlist(item._id);
    
    return (
      <TouchableOpacity
        style={[styles.card, { backgroundColor: c.surface, borderColor: c.borderLight }]}
        onPress={() => navigation.navigate('ProductDetail', { product: item })}
        activeOpacity={0.8}
      >
        <View style={[styles.imagePlaceholder, { backgroundColor: c.surfaceAlt }]}>
          <Text style={{ fontSize: 40, color: c.textMuted }}>{item.category?.[0] || '📦'}</Text>
          {/* Wishlist toggle */}
          <TouchableOpacity
            style={[styles.wishBtn, { backgroundColor: wishlisted ? '#fee2e2' : 'rgba(255,255,255,0.9)' }]}
            onPress={() => toggleWishlist(item)}
          >
            <Heart size={14} color={wishlisted ? '#ef4444' : '#94a3b8'} fill={wishlisted ? '#ef4444' : 'transparent'} />
          </TouchableOpacity>
          {/* Discount Badge */}
          <View style={styles.discountTag}>
            <Text style={styles.discountTagText}>15% OFF</Text>
          </View>
        </View>
        <View style={styles.cardContent}>
          <Text style={[styles.prodBrand, { color: c.primary }]}>{item.category?.split('_')[0] || 'AMPEDGE'}</Text>
          <Text style={[styles.prodName, { color: c.text }]} numberOfLines={1}>{item.name}</Text>
          <View style={styles.ratingRow}>
            <Star size={12} color="#f59e0b" fill="#f59e0b" />
            <Text style={{ color: c.textMuted, fontSize: 11, fontWeight: '600' }}>4.3 (24)</Text>
          </View>
          <View style={styles.footerRow}>
            <View>
              <Text style={[styles.prodPrice, { color: c.text }]}>₹{item.basePrice?.toLocaleString()}</Text>
              <Text style={styles.prodMrp}>₹{Math.round(item.basePrice * 1.15).toLocaleString()}</Text>
            </View>
            <TouchableOpacity 
              style={[styles.addBtn, isAdded && { backgroundColor: c.surfaceAlt }]} 
              onPress={() => addToCart(item)}
            >
              <Text style={[styles.addBtnText, isAdded && { color: c.textMuted }]}>
                {isAdded ? '✓' : 'ADD'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: c.surface }]}>
        <Text style={[styles.headerTitle, { color: c.text }]}>Hardware Store</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity onPress={() => setShowFilters(true)} style={[styles.iconBtn, { backgroundColor: c.surfaceAlt }]}>
            <SlidersHorizontal size={20} color={c.text} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('CartScreen')} style={[styles.iconBtn, { backgroundColor: c.surfaceAlt }]}>
            <ShoppingCart size={20} color={c.text} />
            {cartItemCount > 0 && <View style={styles.badge}><Text style={styles.badgeText}>{cartItemCount}</Text></View>}
          </TouchableOpacity>
        </View>
      </View>

      {/* Search */}
      <View style={[styles.searchWrapper, { backgroundColor: c.surface }]}>
        <View style={[styles.searchBar, { backgroundColor: c.surfaceAlt, borderColor: c.border }]}>
          <Search size={18} color={c.textMuted} />
          <TextInput
            style={[styles.searchInput, { color: c.text }]}
            placeholder="Search products..."
            placeholderTextColor={c.textMuted}
            value={searchTerm}
            onChangeText={handleSearch}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          />
          {searchTerm.length > 0 && (
            <TouchableOpacity onPress={() => { setSearchTerm(''); setShowSuggestions(false); }}>
              <X size={16} color={c.textMuted} />
            </TouchableOpacity>
          )}
        </View>
        {/* Autocomplete suggestions */}
        {showSuggestions && suggestions.length > 0 && (
          <View style={[styles.suggestionsBox, { backgroundColor: c.surface, borderColor: c.border }]}>
            {suggestions.map(s => (
              <TouchableOpacity
                key={s._id}
                style={[styles.suggestionItem, { borderBottomColor: c.borderLight }]}
                onPress={() => { setSearchTerm(s.name); setShowSuggestions(false); }}
              >
                <Search size={14} color={c.textMuted} />
                <Text style={[styles.suggestionText, { color: c.text }]} numberOfLines={1}>{s.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Category Tabs */}
      <FlatList 
        horizontal
        showsHorizontalScrollIndicator={false}
        data={categories}
        style={[styles.catList, { backgroundColor: c.surface }]}
        keyExtractor={(c) => c}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 12, gap: 8 }}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={[styles.catChip, { borderColor: activeCategory === item ? '#4169E1' : c.border, backgroundColor: activeCategory === item ? '#4169E1' : c.surface }]}
            onPress={() => setActiveCategory(item)}
          >
            <Text style={[styles.catChipText, { color: activeCategory === item ? '#fff' : c.textMuted }]}>
              {categoryLabels[item]}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Sort Indicator */}
      <View style={[styles.toolbar, { backgroundColor: c.background }]}>
        <Text style={[styles.resultCount, { color: c.textMuted }]}><Text style={{ color: c.text, fontWeight: '700' }}>{filtered.length}</Text> products</Text>
        <TouchableOpacity style={[styles.sortBtn, { borderColor: c.border }]} onPress={() => {
          const next = { 'default': 'price_low', 'price_low': 'price_high', 'price_high': 'newest', 'newest': 'default' };
          setSortBy(next[sortBy]);
        }}>
          <Text style={{ color: c.textSecondary, fontSize: 12, fontWeight: '600' }}>
            {sortBy === 'default' ? 'Sort' : sortBy === 'price_low' ? 'Price ↑' : sortBy === 'price_high' ? 'Price ↓' : 'Newest'}
          </Text>
          <ChevronDown size={14} color={c.textMuted} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#4169E1" />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item._id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContainer}
          renderItem={renderProduct}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={{ fontSize: 48, marginBottom: 8 }}>📦</Text>
              <Text style={[styles.emptyText, { color: c.textMuted }]}>No products found.</Text>
            </View>
          }
        />
      )}

      {/* Filters Modal */}
      <Modal visible={showFilters} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.filterPanel, { backgroundColor: c.surface }]}>
            <View style={styles.filterHeader}>
              <Text style={[styles.filterTitle, { color: c.text }]}>Filters</Text>
              <TouchableOpacity onPress={() => setShowFilters(false)}>
                <X size={22} color={c.text} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.filterLabel, { color: c.textMuted }]}>PRICE RANGE</Text>
            <View style={styles.priceInputs}>
              <TextInput
                style={[styles.priceInput, { backgroundColor: c.surfaceAlt, borderColor: c.border, color: c.text }]}
                placeholder="Min"
                placeholderTextColor={c.textMuted}
                keyboardType="number-pad"
                value={minPrice > 0 ? String(minPrice) : ''}
                onChangeText={t => setMinPrice(Number(t) || 0)}
              />
              <Text style={{ color: c.textMuted }}>—</Text>
              <TextInput
                style={[styles.priceInput, { backgroundColor: c.surfaceAlt, borderColor: c.border, color: c.text }]}
                placeholder="Max"
                placeholderTextColor={c.textMuted}
                keyboardType="number-pad"
                value={maxPrice < 50000 ? String(maxPrice) : ''}
                onChangeText={t => setMaxPrice(Number(t) || 50000)}
              />
            </View>

            <Text style={[styles.filterLabel, { color: c.textMuted }]}>SORT BY</Text>
            {[
              { id: 'default', label: 'Default' },
              { id: 'price_low', label: 'Price: Low to High' },
              { id: 'price_high', label: 'Price: High to Low' },
              { id: 'newest', label: 'Newest First' },
            ].map(option => (
              <TouchableOpacity
                key={option.id}
                style={[styles.sortOption, { borderColor: sortBy === option.id ? '#4169E1' : c.border, backgroundColor: sortBy === option.id ? c.primaryLight : 'transparent' }]}
                onPress={() => setSortBy(option.id)}
              >
                <Text style={[styles.sortOptionText, { color: sortBy === option.id ? '#4169E1' : c.text }]}>{option.label}</Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity style={styles.applyFiltersBtn} onPress={() => setShowFilters(false)}>
              <Text style={styles.applyFiltersBtnText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
  headerTitle: { fontSize: 22, fontWeight: '900' },
  iconBtn: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  badge: { position: 'absolute', top: -2, right: -2, backgroundColor: '#ef4444', width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff' },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  searchWrapper: { paddingHorizontal: 16, paddingBottom: 10, position: 'relative', zIndex: 10 },
  searchBar: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, height: 46, gap: 10 },
  searchInput: { flex: 1, fontSize: 14, fontWeight: '500' },
  suggestionsBox: { position: 'absolute', top: 52, left: 16, right: 16, borderWidth: 1, borderRadius: 12, overflow: 'hidden', zIndex: 100, elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8 },
  suggestionItem: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderBottomWidth: 1 },
  suggestionText: { fontSize: 13, fontWeight: '600' },
  catList: { maxHeight: 50 },
  catChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5 },
  catChipText: { fontSize: 13, fontWeight: '700' },
  toolbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 8 },
  resultCount: { fontSize: 13 },
  sortBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1 },
  listContainer: { padding: 16, paddingBottom: 100 },
  row: { justifyContent: 'space-between', marginBottom: 12 },
  card: { width: '48.5%', borderRadius: 16, overflow: 'hidden', borderWidth: 1 },
  imagePlaceholder: { height: 130, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  wishBtn: { position: 'absolute', top: 8, right: 8, width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  discountTag: { position: 'absolute', top: 8, left: 8, backgroundColor: '#ef4444', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  discountTagText: { color: '#fff', fontSize: 9, fontWeight: '800' },
  cardContent: { padding: 10 },
  prodBrand: { fontSize: 9, fontWeight: '800', letterSpacing: 0.5, marginBottom: 2, textTransform: 'uppercase' },
  prodName: { fontSize: 13, fontWeight: '700', marginBottom: 4 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 8 },
  footerRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  prodPrice: { fontSize: 16, fontWeight: '900' },
  prodMrp: { fontSize: 11, color: '#94a3b8', textDecorationLine: 'line-through' },
  addBtn: { backgroundColor: '#4169E1', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 8 },
  addBtnText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  emptyContainer: { alignItems: 'center', marginTop: 60 },
  emptyText: { fontSize: 15, fontWeight: '600' },
  // Filter Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  filterPanel: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '70%' },
  filterHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  filterTitle: { fontSize: 20, fontWeight: '900' },
  filterLabel: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5, marginBottom: 10, marginTop: 16 },
  priceInputs: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  priceInput: { flex: 1, borderWidth: 1, borderRadius: 10, padding: 12, fontSize: 14 },
  sortOption: { paddingVertical: 12, paddingHorizontal: 16, borderRadius: 10, borderWidth: 1, marginBottom: 8 },
  sortOptionText: { fontSize: 14, fontWeight: '600' },
  applyFiltersBtn: { backgroundColor: '#4169E1', paddingVertical: 16, borderRadius: 14, alignItems: 'center', marginTop: 24, shadowColor: '#4169E1', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 4 },
  applyFiltersBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
});
