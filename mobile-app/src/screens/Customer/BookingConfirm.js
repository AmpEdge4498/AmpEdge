import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { ChevronLeft, Trash2, Plus, Minus, Wrench, ShoppingBag } from 'lucide-react-native';
import apiClient from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

export default function BookingConfirm({ navigation }) {
  const { user, isGuest } = useContext(AuthContext);
  const {
    cart,
    services,
    products,
    cartTotal,
    cartItemCount,
    servicesTotalAmount,
    productsTotalAmount,
    removeFromCart,
    updateQuantity,
    clearCart,
  } = useCart();

  const [loading, setLoading] = useState(false);
  const [addressText, setAddressText] = useState('Block C, Sector 45, Delhi');
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);

  // Summary calculations
  const taxes = cartTotal * 0.18;
  const grandTotal = cartTotal + taxes - discount;

  const applyCoupon = async () => {
    if (!couponCode) return;
    if (couponCode === 'WELCOME50') {
      setDiscount(50);
      Alert.alert('Success', '₹50 discount applied!');
    } else {
      Alert.alert('Invalid Coupon', 'This coupon is not valid.');
      setDiscount(0);
    }
  };

  const handlePayment = async () => {
    if (isGuest) {
      Alert.alert('Login Required', 'Please login to place a booking.');
      return;
    }
    if (cart.length === 0) return;

    setLoading(true);
    try {
      const scheduledTime = new Date(Date.now() + 86400000).toISOString();

      // Book each service individually
      if (services.length > 0) {
        await Promise.all(
          services.map(async (item) => {
            const payload = {
              serviceId: item._id,
              scheduledTime,
              serviceAddress: {
                addressText,
                city: 'Delhi',
                lat: 28.6139,
                lng: 77.209,
              },
              pricing: {
                basePrice: item.basePrice,
                taxes: item.basePrice * 0.18,
                totalPrice: item.basePrice + item.basePrice * 0.18,
              },
            };
            await apiClient.post('/bookings', payload);
          })
        );
      }

      // TODO: Handle product orders separately via an /orders endpoint
      // For now we just clear the cart for products too

      Alert.alert('Payment Successful! ✅', 'Your bookings are confirmed.', [
        {
          text: 'Great',
          onPress: () => {
            clearCart();
            navigation.navigate('CustomerTabs');
          },
        },
      ]);
    } catch (error) {
      console.log('Checkout Error', error.response?.data || error);
      Alert.alert('Checkout Failed', 'Something went wrong while initiating payment.');
    } finally {
      setLoading(false);
    }
  };

  // Empty cart state
  if (cart.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ChevronLeft size={28} color="#0f172a" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Review Cart</Text>
          <View style={{ width: 28 }} />
        </View>
        <View style={styles.emptyState}>
          <ShoppingBag size={64} color="#cbd5e1" />
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptySubtitle}>
            Browse services or our hardware store to add items.
          </Text>
          <TouchableOpacity
            style={styles.emptyBtn}
            onPress={() => navigation.navigate('CustomerTabs')}
          >
            <Text style={styles.emptyBtnText}>Browse Services</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft size={28} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Review & Confirm</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* ─── SERVICES SECTION ─── */}
        {services.length > 0 && (
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <Wrench size={18} color="#1e56a0" />
              <Text style={styles.sectionTitle}>Services ({services.length})</Text>
            </View>
            {services.map((item) => {
              const id = item._id || item.id;
              return (
                <View key={id} style={styles.cartItem}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemName}>{item.name || 'Service'}</Text>
                    <Text style={styles.itemMeta}>
                      {item.estimatedDuration || 60} mins • {item.category || 'General'}
                    </Text>
                    <Text style={styles.itemPrice}>₹{item.basePrice || 0}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => removeFromCart(id)}
                    style={styles.removeBtn}
                  >
                    <Trash2 size={18} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              );
            })}
            <View style={styles.sectionTotal}>
              <Text style={styles.sectionTotalLabel}>Services Subtotal</Text>
              <Text style={styles.sectionTotalValue}>₹{servicesTotalAmount}</Text>
            </View>
          </View>
        )}

        {/* ─── PRODUCTS SECTION ─── */}
        {products.length > 0 && (
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <ShoppingBag size={18} color="#f59e0b" />
              <Text style={styles.sectionTitle}>Hardware ({products.length})</Text>
            </View>
            {products.map((item) => {
              const id = item._id || item.id;
              const qty = item.quantity || 1;
              return (
                <View key={id} style={styles.cartItem}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemName}>{item.name || 'Product'}</Text>
                    <Text style={styles.itemMeta}>{item.category || 'Hardware'}</Text>
                    <Text style={styles.itemPrice}>
                      ₹{item.basePrice || 0} × {qty} = ₹{(item.basePrice || 0) * qty}
                    </Text>
                  </View>

                  {/* Quantity Stepper */}
                  <View style={styles.stepperContainer}>
                    <View style={styles.stepper}>
                      <TouchableOpacity
                        style={styles.stepperBtn}
                        onPress={() => updateQuantity(id, -1)}
                      >
                        <Minus size={14} color="#1e56a0" />
                      </TouchableOpacity>
                      <Text style={styles.stepperQty}>{qty}</Text>
                      <TouchableOpacity
                        style={styles.stepperBtn}
                        onPress={() => updateQuantity(id, 1)}
                      >
                        <Plus size={14} color="#1e56a0" />
                      </TouchableOpacity>
                    </View>
                    <TouchableOpacity
                      onPress={() => removeFromCart(id)}
                      style={styles.removeBtnSmall}
                    >
                      <Trash2 size={14} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
            <View style={styles.sectionTotal}>
              <Text style={styles.sectionTotalLabel}>Hardware Subtotal</Text>
              <Text style={styles.sectionTotalValue}>₹{productsTotalAmount}</Text>
            </View>
          </View>
        )}

        {/* ─── SCHEDULE ─── */}
        {services.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Scheduled For</Text>
            <Text style={styles.dateValue}>Tomorrow, 10:00 AM - 11:30 AM</Text>
          </View>
        )}

        {/* ─── ADDRESS ─── */}
        {services.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Service Address</Text>
            <TextInput
              style={styles.addressInput}
              value={addressText}
              onChangeText={setAddressText}
              placeholder="Enter exact address"
            />
          </View>
        )}

        {/* ─── COUPON ─── */}
        <View style={styles.couponRow}>
          <TextInput
            style={styles.couponInput}
            value={couponCode}
            onChangeText={setCouponCode}
            placeholder="Promo Code (Try WELCOME50)"
            autoCapitalize="characters"
          />
          <TouchableOpacity style={styles.applyBtn} onPress={applyCoupon}>
            <Text style={styles.applyBtnText}>Apply</Text>
          </TouchableOpacity>
        </View>

        {/* ─── PAYMENT SUMMARY ─── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Payment Summary</Text>

          {services.length > 0 && (
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Services</Text>
              <Text style={styles.priceValue}>₹{servicesTotalAmount.toFixed(2)}</Text>
            </View>
          )}
          {products.length > 0 && (
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Hardware</Text>
              <Text style={styles.priceValue}>₹{productsTotalAmount.toFixed(2)}</Text>
            </View>
          )}
          {discount > 0 && (
            <View style={styles.priceRow}>
              <Text style={styles.discountLabel}>Discount</Text>
              <Text style={styles.discountValue}>-₹{discount.toFixed(2)}</Text>
            </View>
          )}
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Taxes & Fees (18%)</Text>
            <Text style={styles.priceValue}>₹{taxes.toFixed(2)}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.priceRow}>
            <Text style={styles.totalLabel}>Grand Total</Text>
            <Text style={styles.totalValue}>₹{grandTotal.toFixed(2)}</Text>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <View>
          <Text style={styles.footerPrice}>₹{grandTotal.toFixed(2)}</Text>
          <Text style={styles.footerSub}>Amount Payable</Text>
        </View>
        <TouchableOpacity style={styles.payBtn} onPress={handlePayment} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.payBtnText}>Pay Securely</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f1f5f9' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#0f172a' },
  backBtn: { padding: 4 },
  scrollContent: { padding: 16 },

  // Empty state
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: '#334155', marginTop: 16 },
  emptySubtitle: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  emptyBtn: {
    backgroundColor: '#1e56a0',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 24,
  },
  emptyBtnText: { color: '#fff', fontSize: 15, fontWeight: '800' },

  // Cards
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  cardTitle: { fontSize: 16, fontWeight: '800', color: '#0f172a', marginBottom: 16 },

  // Section headers with icons
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#0f172a' },

  // Cart items
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
  },
  itemName: { fontSize: 15, fontWeight: '700', color: '#334155', marginBottom: 2 },
  itemMeta: { fontSize: 12, color: '#94a3b8', fontWeight: '500', marginBottom: 4 },
  itemPrice: { fontSize: 14, fontWeight: '800', color: '#1e56a0' },
  removeBtn: { padding: 10, backgroundColor: '#fef2f2', borderRadius: 10 },

  // Stepper
  stepperContainer: { alignItems: 'center', gap: 8 },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0e7ff',
    borderRadius: 10,
    paddingVertical: 2,
    paddingHorizontal: 2,
  },
  stepperBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperQty: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1e56a0',
    minWidth: 28,
    textAlign: 'center',
  },
  removeBtnSmall: { padding: 6 },

  // Section subtotals
  sectionTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 4,
  },
  sectionTotalLabel: { fontSize: 13, color: '#64748b', fontWeight: '600' },
  sectionTotalValue: { fontSize: 14, color: '#0f172a', fontWeight: '700' },

  // Date
  dateValue: { fontSize: 15, fontWeight: '700', color: '#0f172a' },

  // Address
  addressInput: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    backgroundColor: '#f8fafc',
    color: '#0f172a',
  },

  // Coupon
  couponRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 16,
    marginBottom: 16,
  },
  couponInput: { flex: 1, padding: 8, fontSize: 14, color: '#0f172a' },
  applyBtn: {
    backgroundColor: '#1e56a0',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  applyBtnText: { color: '#fff', fontWeight: '800', fontSize: 13 },

  // Price rows
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  priceLabel: { color: '#64748b', fontSize: 14, fontWeight: '500' },
  priceValue: { color: '#0f172a', fontSize: 14, fontWeight: '600' },
  discountLabel: { color: '#16a34a', fontSize: 14, fontWeight: '500' },
  discountValue: { color: '#16a34a', fontSize: 14, fontWeight: '600' },
  divider: { height: 1, backgroundColor: '#f1f5f9', marginVertical: 12 },
  totalLabel: { fontSize: 16, fontWeight: '800', color: '#0f172a' },
  totalValue: { fontSize: 16, fontWeight: '800', color: '#1e56a0' },

  // Footer
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  footerPrice: { fontSize: 20, fontWeight: '800', color: '#0f172a' },
  footerSub: { fontSize: 12, color: '#94a3b8', fontWeight: '600' },
  payBtn: {
    backgroundColor: '#1e56a0',
    paddingHorizontal: 28,
    paddingVertical: 16,
    borderRadius: 14,
  },
  payBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});
