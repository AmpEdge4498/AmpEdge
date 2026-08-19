import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { ArrowLeft, Crown, Check, Sparkles, Shield, Zap } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';

export default function SubscriptionScreen({ navigation }) {
  const { theme } = useTheme();
  const c = theme.colors;

  const handleSubscribe = (planName, price) => {
    Alert.alert(
      'Subscribe to ' + planName,
      `Proceed to activate your ${planName} membership for ₹${price}/year?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Proceed to Pay', 
          onPress: () => {
            Alert.alert('Success 🎉', `Welcome to AmpEdge ${planName}! Your membership benefits are now active.`);
            navigation.goBack();
          } 
        }
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: c.surface, borderBottomColor: c.border }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft size={22} color={c.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: c.text }]}>Prime Subscriptions 👑</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Intro */}
        <View style={styles.introBox}>
          <Text style={styles.introBadge}>👑 UNLOCK MAXIMUM SAVINGS</Text>
          <Text style={[styles.introTitle, { color: c.text }]}>Choose Your Membership Plan</Text>
          <Text style={[styles.introSub, { color: c.textSecondary }]}>
            Enjoy priority electrician dispatch, heavy discounts on labor & genuine hardware, and periodic home safety checkups.
          </Text>
        </View>

        {/* Plan 1: Base Tier */}
        <View style={[styles.planCard, { backgroundColor: c.surface, borderColor: c.border }]}>
          <Text style={[styles.planName, { color: c.text }]}>🥉 Base Plan</Text>
          <Text style={styles.planPrice}>₹199 <Text style={styles.planYear}>/ year</Text></Text>
          <Text style={[styles.planDesc, { color: c.textSecondary }]}>Ideal for basic home electrical maintenance and occasional repair needs.</Text>
          
          <View style={styles.featureList}>
            <View style={styles.featRow}>
              <Check size={16} color="#16a34a" />
              <Text style={[styles.featText, { color: c.text }]}>5% Flat Discount on all service bookings</Text>
            </View>
            <View style={styles.featRow}>
              <Check size={16} color="#16a34a" />
              <Text style={[styles.featText, { color: c.text }]}>Standard verified technician dispatch</Text>
            </View>
            <View style={styles.featRow}>
              <Check size={16} color="#16a34a" />
              <Text style={[styles.featText, { color: c.text }]}>Free upfront price estimate</Text>
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.subBtn, { backgroundColor: '#f1f5f9' }]}
            onPress={() => handleSubscribe('Base Plan', 199)}
          >
            <Text style={[styles.subBtnText, { color: '#0f172a' }]}>Choose Base Plan</Text>
          </TouchableOpacity>
        </View>

        {/* Plan 2: Modular / Plus Tier (Popular) */}
        <View style={[styles.planCard, { backgroundColor: c.surface, borderColor: '#4169E1', borderWidth: 2 }]}>
          <View style={styles.popBadge}>
            <Text style={styles.popBadgeText}>MOST POPULAR</Text>
          </View>
          <Text style={[styles.planName, { color: '#4169E1' }]}>🥈 Modular Plus Plan</Text>
          <Text style={styles.planPrice}>₹499 <Text style={styles.planYear}>/ year</Text></Text>
          <Text style={[styles.planDesc, { color: c.textSecondary }]}>Great for apartments and families who need prompt support & annual checkups.</Text>
          
          <View style={styles.featureList}>
            <View style={styles.featRow}>
              <Check size={16} color="#16a34a" />
              <Text style={[styles.featText, { color: c.text, fontWeight: '700' }]}>10% Flat Discount on all service bookings</Text>
            </View>
            <View style={styles.featRow}>
              <Check size={16} color="#16a34a" />
              <Text style={[styles.featText, { color: c.text }]}>⚡ Priority Electrician Scheduling (Under 2 hrs)</Text>
            </View>
            <View style={styles.featRow}>
              <Check size={16} color="#16a34a" />
              <Text style={[styles.featText, { color: c.text }]}>1 Free Home Electrical Safety Audit (worth ₹499)</Text>
            </View>
            <View style={styles.featRow}>
              <Check size={16} color="#16a34a" />
              <Text style={[styles.featText, { color: c.text }]}>90-Day Extended Warranty coverage</Text>
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.subBtn, { backgroundColor: '#4169E1' }]}
            onPress={() => handleSubscribe('Modular Plus', 499)}
          >
            <Text style={[styles.subBtnText, { color: '#fff' }]}>Get Modular Plus →</Text>
          </TouchableOpacity>
        </View>

        {/* Plan 3: Premium Gold Tier */}
        <LinearGradient
          colors={['#0f172a', '#1e293b']}
          style={[styles.planCard, { borderColor: '#ffd700' }]}
        >
          <View style={[styles.popBadge, { backgroundColor: '#ffd700' }]}>
            <Text style={[styles.popBadgeText, { color: '#0f172a' }]}>VIP CONCIERGE</Text>
          </View>
          <Text style={[styles.planName, { color: '#ffd700' }]}>👑 Premium Gold VIP</Text>
          <Text style={[styles.planPrice, { color: '#fff' }]}>₹999 <Text style={[styles.planYear, { color: '#94a3b8' }]}>/ year</Text></Text>
          <Text style={[styles.planDesc, { color: '#94a3b8' }]}>Ultimate peace of mind for smart homes, offices & villa owners with round-the-clock emergency care.</Text>
          
          <View style={styles.featureList}>
            <View style={styles.featRow}>
              <Check size={16} color="#ffd700" />
              <Text style={[styles.featText, { color: '#fff', fontWeight: '800' }]}>20% Flat Discount on all labor & store hardware</Text>
            </View>
            <View style={styles.featRow}>
              <Check size={16} color="#ffd700" />
              <Text style={[styles.featText, { color: '#fff' }]}>🚨 24/7 Rapid Emergency Response (Under 30 mins)</Text>
            </View>
            <View style={styles.featRow}>
              <Check size={16} color="#ffd700" />
              <Text style={[styles.featText, { color: '#fff' }]}>Unlimited Safety Inspections & Smart Home Tuning</Text>
            </View>
            <View style={styles.featRow}>
              <Check size={16} color="#ffd700" />
              <Text style={[styles.featText, { color: '#fff' }]}>Dedicated Relationship Manager & VIP Support</Text>
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.subBtn, { backgroundColor: '#ffd700' }]}
            onPress={() => handleSubscribe('Premium Gold VIP', 999)}
          >
            <Text style={[styles.subBtnText, { color: '#0f172a', fontWeight: '900' }]}>Activate VIP Gold 👑</Text>
          </TouchableOpacity>
        </LinearGradient>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '800' },
  introBox: {
    padding: 20,
    alignItems: 'center',
    textAlign: 'center',
  },
  introBadge: {
    backgroundColor: '#fef3c7',
    color: '#d97706',
    fontSize: 10.5,
    fontWeight: '800',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  introTitle: {
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 6,
  },
  introSub: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  planCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  popBadge: {
    position: 'absolute',
    top: 14,
    right: 14,
    backgroundColor: '#4169E1',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  popBadgeText: {
    color: '#fff',
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  planName: {
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 4,
  },
  planPrice: {
    fontSize: 28,
    fontWeight: '900',
    color: '#0f172a',
    marginBottom: 4,
  },
  planYear: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94a3b8',
  },
  planDesc: {
    fontSize: 12.5,
    lineHeight: 17,
    marginBottom: 16,
  },
  featureList: {
    gap: 10,
    marginBottom: 20,
  },
  featRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featText: {
    fontSize: 12.5,
    flex: 1,
  },
  subBtn: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  subBtnText: {
    fontSize: 13.5,
    fontWeight: '800',
  },
});
