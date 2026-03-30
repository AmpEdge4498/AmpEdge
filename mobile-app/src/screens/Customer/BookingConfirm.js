import React, { useState, useContext } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert, TextInput, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { ChevronLeft, Trash2 } from 'lucide-react-native';
import apiClient from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

export default function BookingConfirm({ navigation }) {
  const { user, isGuest } = useContext(AuthContext);
  const { cart, cartTotal, removeFromCart, clearCart } = useCart();
  
  const [loading, setLoading] = useState(false);
  const [addressText, setAddressText] = useState('Block C, Sector 45, Delhi');
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);

  // Summary logic
  const taxes = cartTotal * 0.18;
  const grandTotal = cartTotal + taxes - discount;

  const applyCoupon = async () => {
    if (!couponCode) return;
    // Mock simple logic since backend /coupons/validate might expect a specific service ID
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
      // Current backend schema expects one service per booking.
      // We will place multiple bookings in parallel for each cart item.
      const scheduledTime = new Date(Date.now() + 86400000).toISOString(); // Tomorrow

      await Promise.all(cart.map(async (item) => {
        const payload = {
          serviceId: item._id,
          scheduledTime,
          serviceAddress: { addressText, city: 'Delhi', lat: 28.6139, lng: 77.2090 },
          pricing: {
            basePrice: item.basePrice,
            taxes: item.basePrice * 0.18,
            totalPrice: item.basePrice + (item.basePrice * 0.18)
          }
        };
        await apiClient.post('/bookings', payload);
      }));

      Alert.alert('Payment Successful! ✅', 'Your bookings are confirmed.', [
        { 
          text: 'Great', 
          onPress: () => {
            clearCart();
            navigation.navigate('CustomerTabs');
          } 
        },
      ]);
    } catch (error) {
      console.log('Checkout Error', error.response?.data || error);
      Alert.alert('Checkout Failed', 'Something went wrong while initiating payment.');
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ChevronLeft size={28} color="#0f172a" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Review Cart</Text>
          <View style={{width: 28}} />
        </View>
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <Text style={{fontSize: 16, color: '#94a3b8'}}>Your cart is empty.</Text>
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
        <View style={{width: 28}} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Cart Items */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Selected Services</Text>
          {cart.map((item) => (
            <View key={item._id} style={styles.cartItem}>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemPrice}>₹{item.basePrice}</Text>
              </View>
              <TouchableOpacity onPress={() => removeFromCart(item._id)} style={styles.removeBtn}>
                <Trash2 size={20} color="#ef4444" />
              </TouchableOpacity>
            </View>
          ))}
          <View style={styles.divider} />
          
          <Text style={styles.dateLabel}>Scheduled For:</Text>
          <Text style={styles.dateValue}>Tomorrow, 10:00 AM - 11:30 AM</Text>
        </View>

        {/* Address */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Service Address</Text>
          <TextInput
            style={styles.addressInput}
            value={addressText}
            onChangeText={setAddressText}
            placeholder="Enter exact address"
          />
        </View>

        {/* Coupons */}
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

        {/* Summary */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Payment Summary</Text>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Item Total</Text>
            <Text style={styles.priceValue}>₹{cartTotal.toFixed(2)}</Text>
          </View>
          {discount > 0 && (
            <View style={styles.priceRow}>
              <Text style={styles.discountLabel}>Discount applied</Text>
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

        <View style={{height: 40}} />
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
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#0f172a', marginBottom: 16 },
  cartItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  itemName: { fontSize: 15, fontWeight: '600', color: '#334155', marginBottom: 4 },
  itemPrice: { fontSize: 14, fontWeight: '800', color: '#1e56a0' },
  removeBtn: { padding: 8, backgroundColor: '#fef2f2', borderRadius: 8 },
  divider: { height: 1, backgroundColor: '#f1f5f9', marginVertical: 12 },
  dateLabel: { fontSize: 13, color: '#94a3b8', fontWeight: '600', marginBottom: 4 },
  dateValue: { fontSize: 15, fontWeight: '700', color: '#0f172a' },
  addressInput: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    backgroundColor: '#f8fafc',
    color: '#0f172a',
  },
  couponRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 16,
    marginBottom: 16,
  },
  couponInput: { flex: 1, padding: 8, fontSize: 14, color: '#0f172a' },
  applyBtn: { backgroundColor: '#1e56a0', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  applyBtnText: { color: '#fff', fontWeight: '800', fontSize: 13 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  priceLabel: { color: '#64748b', fontSize: 14, fontWeight: '500' },
  priceValue: { color: '#0f172a', fontSize: 14, fontWeight: '600' },
  discountLabel: { color: '#16a34a', fontSize: 14, fontWeight: '500' },
  discountValue: { color: '#16a34a', fontSize: 14, fontWeight: '600' },
  totalLabel: { fontSize: 16, fontWeight: '800', color: '#0f172a' },
  totalValue: { fontSize: 16, fontWeight: '800', color: '#1e56a0' },
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
