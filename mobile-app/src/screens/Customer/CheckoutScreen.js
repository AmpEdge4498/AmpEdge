import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, TextInput, Alert } from 'react-native';
import { ArrowLeft, MapPin, CreditCard, CheckCircle, Tag, ChevronRight, Home } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { useCart } from '../../context/CartContext';
import { LinearGradient } from 'expo-linear-gradient';

export default function CheckoutScreen({ navigation }) {
  const { theme } = useTheme();
  const c = theme.colors;
  const { cart, cartSubtotal, cartTax, cartDelivery, cartTotal, clearCart } = useCart();

  // Structured address fields
  const [houseNo, setHouseNo] = useState('');
  const [street, setStreet] = useState('');
  const [landmark, setLandmark] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');

  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [orderPlaced, setOrderPlaced] = useState(false);

  const applyCoupon = () => {
    if (couponCode.toUpperCase() === 'WELCOME50') {
      const disc = Math.min(250, cartSubtotal * 0.5);
      setDiscount(disc);
      setCouponApplied(true);
      Alert.alert('Coupon Applied!', `You saved ₹${disc}`);
    } else if (couponCode.toUpperCase() === 'FLAT100') {
      setDiscount(100);
      setCouponApplied(true);
      Alert.alert('Coupon Applied!', 'You saved ₹100');
    } else {
      Alert.alert('Invalid Coupon', 'This coupon code is not valid.');
    }
  };

  const getFullAddress = () => {
    return [houseNo, street, landmark ? `Near ${landmark}` : '', city, pincode].filter(Boolean).join(', ');
  };

  const handlePlaceOrder = () => {
    // Validate required address fields
    if (!houseNo.trim()) {
      Alert.alert('Missing Info', 'Please enter your House/Flat Number.');
      return;
    }
    if (!street.trim()) {
      Alert.alert('Missing Info', 'Please enter your Street/Colony name.');
      return;
    }
    if (!city.trim()) {
      Alert.alert('Missing Info', 'Please enter your City.');
      return;
    }
    if (!pincode.trim() || pincode.length !== 6) {
      Alert.alert('Missing Info', 'Please enter a valid 6-digit PIN code.');
      return;
    }

    // Mock order placement
    setOrderPlaced(true);
    setTimeout(() => {
      clearCart();
    }, 3000);
  };

  const finalTotal = cartTotal - discount;

  if (orderPlaced) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
        <View style={styles.successContainer}>
          <View style={styles.successCircle}>
            <CheckCircle size={64} color="#22c55e" />
          </View>
          <Text style={[styles.successTitle, { color: c.text }]}>Order Placed! 🎉</Text>
          <Text style={[styles.successSub, { color: c.textSecondary }]}>
            Your order has been confirmed. You'll receive updates on your booking status.
          </Text>
          <Text style={[styles.orderId, { color: c.primary }]}>Order #AMP{Date.now().toString().slice(-6)}</Text>
          <Text style={[styles.addressConfirm, { color: c.textSecondary }]}>
            📍 {getFullAddress()}
          </Text>
          <TouchableOpacity style={styles.homeBtn} onPress={() => navigation.navigate('CustomerTabs')}>
            <Text style={styles.homeBtnText}>Back to Home</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
      <View style={[styles.header, { backgroundColor: c.surface, borderBottomColor: c.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={22} color={c.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: c.text }]}>Checkout</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Delivery Address — Structured Fields */}
        <View style={[styles.section, { backgroundColor: c.surface, borderColor: c.borderLight }]}>
          <View style={styles.sectionHeader}>
            <MapPin size={18} color={c.primary} />
            <Text style={[styles.sectionTitle, { color: c.text }]}>Delivery Address</Text>
          </View>
          <TextInput
            style={[styles.input, { backgroundColor: c.surfaceAlt, borderColor: c.border, color: c.text }]}
            placeholder="House / Flat No. *"
            placeholderTextColor={c.textMuted}
            value={houseNo}
            onChangeText={setHouseNo}
          />
          <TextInput
            style={[styles.input, { backgroundColor: c.surfaceAlt, borderColor: c.border, color: c.text }]}
            placeholder="Street / Colony / Area *"
            placeholderTextColor={c.textMuted}
            value={street}
            onChangeText={setStreet}
          />
          <TextInput
            style={[styles.input, { backgroundColor: c.surfaceAlt, borderColor: c.border, color: c.text }]}
            placeholder="Landmark (optional)"
            placeholderTextColor={c.textMuted}
            value={landmark}
            onChangeText={setLandmark}
          />
          <View style={styles.row}>
            <TextInput
              style={[styles.input, styles.halfInput, { backgroundColor: c.surfaceAlt, borderColor: c.border, color: c.text }]}
              placeholder="City *"
              placeholderTextColor={c.textMuted}
              value={city}
              onChangeText={setCity}
            />
            <TextInput
              style={[styles.input, styles.halfInput, { backgroundColor: c.surfaceAlt, borderColor: c.border, color: c.text }]}
              placeholder="PIN Code *"
              placeholderTextColor={c.textMuted}
              keyboardType="number-pad"
              value={pincode}
              onChangeText={(t) => setPincode(t.replace(/[^0-9]/g, ''))}
              maxLength={6}
            />
          </View>
        </View>

        {/* Coupon Code */}
        <View style={[styles.section, { backgroundColor: c.surface, borderColor: c.borderLight }]}>
          <View style={styles.sectionHeader}>
            <Tag size={18} color={c.primary} />
            <Text style={[styles.sectionTitle, { color: c.text }]}>Apply Coupon</Text>
          </View>
          <View style={styles.couponRow}>
            <TextInput
              style={[styles.couponInput, { backgroundColor: c.surfaceAlt, borderColor: c.border, color: c.text }]}
              placeholder="Enter coupon code"
              placeholderTextColor={c.textMuted}
              autoCapitalize="characters"
              value={couponCode}
              onChangeText={setCouponCode}
              editable={!couponApplied}
            />
            <TouchableOpacity
              style={[styles.applyBtn, couponApplied && { backgroundColor: '#dcfce7' }]}
              onPress={applyCoupon}
              disabled={couponApplied}
            >
              <Text style={[styles.applyBtnText, couponApplied && { color: '#16a34a' }]}>
                {couponApplied ? '✓ Applied' : 'Apply'}
              </Text>
            </TouchableOpacity>
          </View>
          <Text style={{ color: c.textMuted, fontSize: 12, marginTop: 6 }}>Try: WELCOME50, FLAT100</Text>
        </View>

        {/* Payment Method */}
        <View style={[styles.section, { backgroundColor: c.surface, borderColor: c.borderLight }]}>
          <View style={styles.sectionHeader}>
            <CreditCard size={18} color={c.primary} />
            <Text style={[styles.sectionTitle, { color: c.text }]}>Payment Method</Text>
          </View>
          {[
            { id: 'razorpay', label: 'Razorpay (UPI / Cards / Wallets)', icon: '💳' },
            { id: 'cod', label: 'Cash on Delivery', icon: '💵' },
          ].map(method => (
            <TouchableOpacity
              key={method.id}
              style={[styles.paymentOption, { borderColor: paymentMethod === method.id ? '#4169E1' : c.border, backgroundColor: paymentMethod === method.id ? c.primaryLight : c.surfaceAlt }]}
              onPress={() => setPaymentMethod(method.id)}
            >
              <Text style={{ fontSize: 20 }}>{method.icon}</Text>
              <Text style={[styles.paymentLabel, { color: c.text }]}>{method.label}</Text>
              {paymentMethod === method.id && <CheckCircle size={18} color="#4169E1" />}
            </TouchableOpacity>
          ))}
        </View>

        {/* Order Summary */}
        <View style={[styles.section, { backgroundColor: c.surface, borderColor: c.borderLight }]}>
          <Text style={[styles.sectionTitle, { color: c.text, marginBottom: 14 }]}>Order Summary</Text>
          {cart.map((item, idx) => (
            <View key={item.itemId || item._id || idx} style={[styles.orderItem, { borderBottomColor: c.borderLight }]}>
              <Text style={[styles.orderItemName, { color: c.text }]} numberOfLines={1}>{item.name} × {item.quantity || 1}</Text>
              <Text style={[styles.orderItemPrice, { color: c.textSecondary }]}>₹{((item.basePrice || 0) * (item.quantity || 1)).toLocaleString()}</Text>
            </View>
          ))}
          <View style={[styles.divider, { backgroundColor: c.border }]} />
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
            <Text style={[styles.summaryValue, { color: cartDelivery === 0 ? '#22c55e' : c.text }]}>{cartDelivery === 0 ? 'FREE' : `₹${cartDelivery}`}</Text>
          </View>
          {discount > 0 && (
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: '#22c55e' }]}>Coupon Discount</Text>
              <Text style={{ color: '#22c55e', fontWeight: '700' }}>-₹{discount}</Text>
            </View>
          )}
          <View style={[styles.divider, { backgroundColor: c.border }]} />
          <View style={styles.summaryRow}>
            <Text style={[styles.totalLabel, { color: c.text }]}>Total Payable</Text>
            <Text style={[styles.totalValue, { color: c.primary }]}>₹{finalTotal.toLocaleString()}</Text>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Place Order Button */}
      <View style={[styles.bottomBar, { backgroundColor: c.surface, borderTopColor: c.border }]}>
        <View>
          <Text style={[styles.bottomTotal, { color: c.text }]}>₹{finalTotal.toLocaleString()}</Text>
          <Text style={[styles.bottomItems, { color: c.textMuted }]}>{cart.length} items</Text>
        </View>
        <TouchableOpacity style={styles.placeOrderBtn} onPress={handlePlaceOrder}>
          <LinearGradient colors={['#4169E1', '#2c4fd4']} style={styles.placeOrderGrad}>
            <Text style={styles.placeOrderText}>Place Order</Text>
            <ChevronRight size={18} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1 },
  headerTitle: { fontSize: 18, fontWeight: '800' },
  scrollContent: { padding: 16 },
  section: { borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  sectionTitle: { fontSize: 16, fontWeight: '800' },
  input: { borderWidth: 1, borderRadius: 12, padding: 14, fontSize: 14, marginBottom: 10 },
  row: { flexDirection: 'row', gap: 10 },
  halfInput: { flex: 1 },
  couponRow: { flexDirection: 'row', gap: 10 },
  couponInput: { flex: 1, borderWidth: 1, borderRadius: 12, padding: 14, fontSize: 14 },
  applyBtn: { backgroundColor: '#4169E1', paddingHorizontal: 20, borderRadius: 12, justifyContent: 'center' },
  applyBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  paymentOption: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 12, borderWidth: 1.5, marginBottom: 10 },
  paymentLabel: { flex: 1, fontSize: 14, fontWeight: '600' },
  orderItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1 },
  orderItemName: { flex: 1, fontSize: 13, fontWeight: '600', marginRight: 12 },
  orderItemPrice: { fontSize: 13, fontWeight: '600' },
  divider: { height: 1, marginVertical: 10 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  summaryLabel: { fontSize: 14 },
  summaryValue: { fontSize: 14, fontWeight: '600' },
  totalLabel: { fontSize: 18, fontWeight: '900' },
  totalValue: { fontSize: 20, fontWeight: '900' },
  bottomBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderTopWidth: 1 },
  bottomTotal: { fontSize: 22, fontWeight: '900' },
  bottomItems: { fontSize: 12 },
  placeOrderBtn: { borderRadius: 14, overflow: 'hidden', shadowColor: '#4169E1', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 4 },
  placeOrderGrad: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 28, paddingVertical: 16, gap: 6 },
  placeOrderText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  successContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  successCircle: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#dcfce7', alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  successTitle: { fontSize: 28, fontWeight: '900', marginBottom: 8 },
  successSub: { fontSize: 15, textAlign: 'center', lineHeight: 22, marginBottom: 16 },
  orderId: { fontSize: 16, fontWeight: '800', marginBottom: 12 },
  addressConfirm: { fontSize: 13, textAlign: 'center', marginBottom: 32, paddingHorizontal: 16 },
  homeBtn: { backgroundColor: '#4169E1', paddingHorizontal: 32, paddingVertical: 16, borderRadius: 14 },
  homeBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
});
