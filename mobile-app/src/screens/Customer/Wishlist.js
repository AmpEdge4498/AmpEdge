import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { ArrowLeft, Heart, ShoppingCart, Trash2 } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';

export default function Wishlist({ navigation }) {
  const { theme } = useTheme();
  const c = theme.colors;
  const { wishlist, toggleWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();

  const handleMoveToCart = (product) => {
    addToCart(product);
    toggleWishlist(product);
    Alert.alert('Moved to Cart', `${product.name} has been moved to your cart.`);
  };

  const renderItem = ({ item }) => (
    <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.borderLight }]}>
      <View style={[styles.imagePlaceholder, { backgroundColor: c.surfaceAlt }]}>
        <Text style={{ fontSize: 40 }}>{item.category?.[0] || '📦'}</Text>
      </View>
      <View style={styles.info}>
        <Text style={[styles.name, { color: c.text }]} numberOfLines={2}>{item.name}</Text>
        <Text style={[styles.price, { color: c.primary }]}>₹{item.basePrice?.toLocaleString()}</Text>
        <View style={styles.actions}>
          <TouchableOpacity style={styles.moveBtn} onPress={() => handleMoveToCart(item)}>
            <ShoppingCart size={14} color="#fff" />
            <Text style={styles.moveBtnText}>Move to Cart</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => toggleWishlist(item)} style={styles.removeBtn}>
            <Trash2 size={16} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
      <View style={[styles.header, { backgroundColor: c.surface, borderBottomColor: c.border }]}>
        <Text style={[styles.headerTitle, { color: c.text }]}>Wishlist ({wishlist.length})</Text>
        {wishlist.length > 0 && (
          <TouchableOpacity onPress={() => Alert.alert('Clear Wishlist?', 'Remove all items?', [{ text: 'Cancel' }, { text: 'Clear', onPress: clearWishlist, style: 'destructive' }])}>
            <Text style={{ color: '#ef4444', fontWeight: '700', fontSize: 13 }}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      {wishlist.length === 0 ? (
        <View style={styles.emptyState}>
          <Heart size={64} color={c.textMuted} />
          <Text style={[styles.emptyTitle, { color: c.text }]}>Your wishlist is empty</Text>
          <Text style={[styles.emptySubtitle, { color: c.textSecondary }]}>Save products you love for later</Text>
        </View>
      ) : (
        <FlatList
          data={wishlist}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1 },
  headerTitle: { fontSize: 18, fontWeight: '800', flex: 1, marginLeft: 12 },
  listContent: { padding: 16 },
  card: { flexDirection: 'row', borderRadius: 16, padding: 12, marginBottom: 12, borderWidth: 1, gap: 12 },
  imagePlaceholder: { width: 90, height: 90, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1 },
  name: { fontSize: 14, fontWeight: '700', marginBottom: 4 },
  price: { fontSize: 16, fontWeight: '800', marginBottom: 10 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  moveBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#4169E1', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  moveBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  removeBtn: { padding: 8 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyTitle: { fontSize: 20, fontWeight: '800', marginTop: 16 },
  emptySubtitle: { fontSize: 14, marginTop: 6 },
});
