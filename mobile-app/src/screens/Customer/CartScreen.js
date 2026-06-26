import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { ArrowLeft, Trash2, Minus, Plus, ShoppingBag, Tag, ChevronRight } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { useCart } from '../../context/CartContext';

export default function CartScreen({ navigation }) {
  const { theme } = useTheme();
  const c = theme.colors;
  const { cart, removeFromCart, updateQuantity, clearCart, cartSubtotal, cartTax, cartDelivery, cartTotal, cartItemCount } = useCart();

  const renderCartItem = ({ item }) => (
    <View style={[styles.cartItem, { backgroundColor: c.surface, borderColor: c.borderLight }]}>
      <View style={[styles.itemImage, { backgroundColor: c.surfaceAlt }]}>
        <Text style={{ fontSize: 36 }}>{item.cartType === 'service' ? '⚡' : (item.category?.[0] || '📦')}</Text>
      </View>
      <View style={styles.itemInfo}>
        <View style={styles.itemTypeTag}>
          <Text style={[styles.itemType, { color: item.cartType === 'service' ? '#f59e0b' : '#4169E1' }]}>
            {item.cartType === 'service' ? 'SERVICE' : 'PRODUCT'}
          </Text>
        </View>
        <Text style={[styles.itemName, { color: c.text }]} numberOfLines={2}>{item.name}</Text>
        <View style={styles.itemBottom}>
          <Text style={[styles.itemPrice, { color: c.primary }]}>₹{(item.basePrice * (item.quantity || 1)).toLocaleString()}</Text>
          <View style={[styles.qtyControl, { borderColor: c.border }]}>
            <TouchableOpacity onPress={() => updateQuantity(item._id || item.id, (item.quantity || 1) - 1)} style={styles.qtyBtn}>
              <Minus size={14} color={c.text} />
            </TouchableOpacity>
            <Text style={[styles.qtyText, { color: c.text }]}>{item.quantity || 1}</Text>
            <TouchableOpacity onPress={() => updateQuantity(item._id || item.id, (item.quantity || 1) + 1)} style={styles.qtyBtn}>
              <Plus size={14} color={c.text} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <TouchableOpacity onPress={() => removeFromCart(item._id || item.id)} style={styles.deleteBtn}>
        <Trash2 size={18} color="#ef4444" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: c.surface, borderBottomColor: c.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={22} color={c.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: c.text }]}>My Cart ({cartItemCount})</Text>
        {cart.length > 0 && (
          <TouchableOpacity onPress={() => Alert.alert('Clear Cart', 'Remove all items?', [{ text: 'Cancel' }, { text: 'Clear', onPress: clearCart, style: 'destructive' }])}>
            <Text style={{ color: '#ef4444', fontWeight: '700', fontSize: 13 }}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>

      {cart.length === 0 ? (
        <View style={styles.emptyState}>
          <ShoppingBag size={64} color={c.textMuted} />
          <Text style={[styles.emptyTitle, { color: c.text }]}>Your cart is empty</Text>
          <Text style={[styles.emptySubtitle, { color: c.textSecondary }]}>Browse services or products to add items</Text>
          <TouchableOpacity style={styles.shopBtn} onPress={() => navigation.navigate('CustomerTabs')}>
            <Text style={styles.shopBtnText}>Start Shopping</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={cart}
            keyExtractor={(item, idx) => (item._id || item.id || idx).toString()}
            renderItem={renderCartItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />

          {/* Price Summary */}
          <View style={[styles.summaryBox, { backgroundColor: c.surface, borderTopColor: c.border }]}>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: c.textSecondary }]}>Subtotal</Text>
              <Text style={[styles.summaryValue, { color: c.text }]}>₹{cartSubtotal.toLocaleString()}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: c.textSecondary }]}>GST (18%)</Text>
              <Text style={[styles.summaryValue, { color: c.text }]}>₹{cartTax.toLocaleString()}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: c.textSecondary }]}>Delivery</Text>
              <Text style={[styles.summaryValue, { color: cartDelivery === 0 ? '#22c55e' : c.text }]}>
                {cartDelivery === 0 ? 'FREE' : `₹${cartDelivery}`}
              </Text>
            </View>
            <View style={[styles.divider, { backgroundColor: c.border }]} />
            <View style={styles.summaryRow}>
              <Text style={[styles.totalLabel, { color: c.text }]}>Total</Text>
              <Text style={[styles.totalValue, { color: c.primary }]}>₹{cartTotal.toLocaleString()}</Text>
            </View>
            <TouchableOpacity style={styles.checkoutBtn} onPress={() => navigation.navigate('CheckoutScreen')}>
              <Text style={styles.checkoutBtnText}>Proceed to Checkout</Text>
              <ChevronRight size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, gap: 12 },
  backBtn: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: '800' },
  listContent: { padding: 16, paddingBottom: 8 },
  cartItem: { flexDirection: 'row', borderRadius: 16, padding: 12, marginBottom: 12, borderWidth: 1, gap: 12 },
  itemImage: { width: 80, height: 80, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  itemInfo: { flex: 1 },
  itemTypeTag: { marginBottom: 4 },
  itemType: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  itemName: { fontSize: 14, fontWeight: '700', marginBottom: 8 },
  itemBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  itemPrice: { fontSize: 16, fontWeight: '800' },
  qtyControl: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 8, overflow: 'hidden' },
  qtyBtn: { paddingHorizontal: 10, paddingVertical: 6 },
  qtyText: { fontSize: 14, fontWeight: '700', paddingHorizontal: 8 },
  deleteBtn: { paddingTop: 4 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyTitle: { fontSize: 20, fontWeight: '800', marginTop: 16 },
  emptySubtitle: { fontSize: 14, marginTop: 6, textAlign: 'center' },
  shopBtn: { backgroundColor: '#4169E1', paddingHorizontal: 28, paddingVertical: 14, borderRadius: 12, marginTop: 24, shadowColor: '#4169E1', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 4 },
  shopBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  summaryBox: { padding: 20, borderTopWidth: 1 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  summaryLabel: { fontSize: 14 },
  summaryValue: { fontSize: 14, fontWeight: '600' },
  divider: { height: 1, marginVertical: 10 },
  totalLabel: { fontSize: 18, fontWeight: '900' },
  totalValue: { fontSize: 20, fontWeight: '900' },
  checkoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#4169E1', paddingVertical: 16, borderRadius: 14, marginTop: 16, gap: 6, shadowColor: '#4169E1', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 4 },
  checkoutBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
});
