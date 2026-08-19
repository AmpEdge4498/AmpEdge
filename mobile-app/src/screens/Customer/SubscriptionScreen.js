import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { ArrowLeft, Crown, Check, Sparkles, Shield, Zap, Wrench, AlertTriangle, ChevronRight } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';

export default function SubscriptionScreen({ navigation }) {
  const { theme } = useTheme();
  const c = theme.colors;

  const handleSubscribe = (planName, price) => {
    Alert.alert(
      'Subscribe to ' + planName,
      `Proceed to activate your ${planName} membership for ₹${price}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Proceed to Pay', 
          onPress: () => {
            Alert.alert('Success 🎉', `Welcome to AmpEdge ${planName}! Your benefits are now active.`);
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
        <Text style={[styles.headerTitle, { color: c.text }]}>AMC & Prime Plans 👑</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Intro */}
        <View style={styles.introBox}>
          <Text style={styles.introBadge}>👑 TOTAL HOME & AC ELECTRICAL COVERAGE</Text>
          <Text style={[styles.introTitle, { color: c.text }]}>Annual AMC & Repair Plans</Text>
          <Text style={[styles.introSub, { color: c.textSecondary }]}>
            Get 365-day complete peace of mind with our ₹14,000/year Annual AMC Shield or choose on-demand housing repairs.
          </Text>
        </View>

        {/* ═══ 1. FLAGSHIP ANNUAL AMC 360° SHIELD (₹14,000 / YEAR) ═══ */}
        <LinearGradient
          colors={['#0a0f2c', '#1e1b4b', '#0f172a']}
          style={styles.amcCard}
        >
          <View style={styles.amcBadge}>
            <Text style={styles.amcBadgeText}>👑 OFFICIAL ANNUAL AMC SHIELD</Text>
          </View>
          
          <Text style={styles.amcTitle}>AMPEdge 360° Total Home & AC Annual AMC</Text>
          <Text style={styles.amcSub}>
            Complete 365-day coverage for your entire house, ACs, switchboards, and electrical setup.
          </Text>

          <View style={styles.amcPriceRow}>
            <Text style={styles.amcPrice}>₹14,000</Text>
            <Text style={styles.amcPriceSub}>/ Year (Billed Annually)</Text>
          </View>

          {/* AMC Benefits Grid */}
          <View style={styles.amcFeatGrid}>
            <View style={styles.amcFeatItem}>
              <Text style={styles.amcFeatHeading}>❄️ 4x Free AC Servicing / Year</Text>
              <Text style={styles.amcFeatDesc}>Deep power jet cleaning, filter wash & cooling checkup.</Text>
            </View>
            <View style={styles.amcFeatItem}>
              <Text style={[styles.amcFeatHeading, { color: '#5CE1E6' }]}>⚡ Unlimited Free Breakdown Visits</Text>
              <Text style={styles.amcFeatDesc}>Zero service visit fees & zero labor charges for 365 days.</Text>
            </View>
            <View style={styles.amcFeatItem}>
              <Text style={[styles.amcFeatHeading, { color: '#10b981' }]}>🏠 Full Housing Repair Coverage</Text>
              <Text style={styles.amcFeatDesc}>MCB box, switches, sockets, ceiling fans & light fixes.</Text>
            </View>
            <View style={styles.amcFeatItem}>
              <Text style={[styles.amcFeatHeading, { color: '#f43f5e' }]}>🚨 VIP 30-Min Emergency Response</Text>
              <Text style={styles.amcFeatDesc}>Highest priority dispatch with dedicated senior engineer.</Text>
            </View>
          </View>

          {/* Material Policy Note */}
          <View style={styles.policyBox}>
            <Text style={{ fontSize: 16 }}>⚠️</Text>
            <Text style={styles.policyText}>
              <Text style={{ fontWeight: '800' }}>Transparent Policy: </Text>
              Labor & visits are 100% Free. Replacement materials & spare parts are charged at direct wholesale rates.
            </Text>
          </View>

          <TouchableOpacity 
            style={styles.amcBtn}
            onPress={() => handleSubscribe('Annual AMC 360° Shield', 14000)}
          >
            <Text style={styles.amcBtnText}>Subscribe Annual AMC (₹14,000) →</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* ═══ 2. ON-DEMAND HOUSING REPAIRING SECTOR ═══ */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: c.text }]}>🛠️ On-Demand Housing Repairs</Text>
          <Text style={[styles.sectionDesc, { color: c.textSecondary }]}>
            Prefer pay-per-service? Book individual repair visits with 90-day warranty.
          </Text>

          <View style={styles.repairGrid}>
            <TouchableOpacity 
              style={[styles.repairCard, { backgroundColor: c.surface, borderColor: c.border }]}
              onPress={() => navigation.navigate('ServiceList', { category: 'Repairs' })}
            >
              <Text style={{ fontSize: 24 }}>🎛️</Text>
              <Text style={[styles.repairCardTitle, { color: c.text }]}>MCB & DB Board</Text>
              <Text style={styles.repairCardPrice}>From ₹299</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.repairCard, { backgroundColor: c.surface, borderColor: c.border }]}
              onPress={() => navigation.navigate('ServiceList', { category: 'Repairs' })}
            >
              <Text style={{ fontSize: 24 }}>🔘</Text>
              <Text style={[styles.repairCardTitle, { color: c.text }]}>Switches & Sockets</Text>
              <Text style={styles.repairCardPrice}>From ₹199</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.repairCard, { backgroundColor: c.surface, borderColor: c.border }]}
              onPress={() => navigation.navigate('ServiceList', { category: 'Repairs' })}
            >
              <Text style={{ fontSize: 24 }}>🌀</Text>
              <Text style={[styles.repairCardTitle, { color: c.text }]}>Fans & Appliances</Text>
              <Text style={styles.repairCardPrice}>From ₹249</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.repairCard, { backgroundColor: c.surface, borderColor: c.border }]}
              onPress={() => navigation.navigate('ServiceList', { category: 'Repairs' })}
            >
              <Text style={{ fontSize: 24 }}>💡</Text>
              <Text style={[styles.repairCardTitle, { color: c.text }]}>LED & Lighting</Text>
              <Text style={styles.repairCardPrice}>From ₹199</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ═══ 3. MONTHLY MEMBERSHIP TIERS ═══ */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: c.text }]}>Flexible Monthly Membership Plans</Text>

          {/* Modular Plus */}
          <View style={[styles.planCard, { backgroundColor: c.surface, borderColor: '#4169E1', borderWidth: 2 }]}>
            <View style={styles.popBadge}>
              <Text style={styles.popBadgeText}>POPULAR</Text>
            </View>
            <Text style={[styles.planName, { color: '#4169E1' }]}>🥈 Modular Plus Plan</Text>
            <Text style={styles.planPrice}>₹499 <Text style={styles.planYear}>/ month</Text></Text>
            <Text style={[styles.planDesc, { color: c.textSecondary }]}>For flats and families needing ongoing repair discounts & priority dispatch.</Text>
            
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
                <Text style={[styles.featText, { color: c.text }]}>2 Free Home Safety Audits per year</Text>
              </View>
            </View>

            <TouchableOpacity 
              style={[styles.subBtn, { backgroundColor: '#4169E1' }]}
              onPress={() => handleSubscribe('Modular Plus', 499)}
            >
              <Text style={[styles.subBtnText, { color: '#fff' }]}>Get Modular Plus (₹499/mo) →</Text>
            </TouchableOpacity>
          </View>

          {/* Base Plan */}
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
            </View>

            <TouchableOpacity 
              style={[styles.subBtn, { backgroundColor: '#f1f5f9' }]}
              onPress={() => handleSubscribe('Base Plan', 199)}
            >
              <Text style={[styles.subBtnText, { color: '#0f172a' }]}>Choose Base Plan (₹199/yr)</Text>
            </TouchableOpacity>
          </View>
        </View>

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
    padding: 16,
    alignItems: 'center',
    textAlign: 'center',
  },
  introBadge: {
    backgroundColor: '#fef3c7',
    color: '#d97706',
    fontSize: 10,
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
    fontSize: 12.5,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 8,
  },
  amcCard: {
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 22,
    padding: 22,
    borderWidth: 2,
    borderColor: 'rgba(255, 215, 0, 0.4)',
  },
  amcBadge: {
    backgroundColor: '#ffd700',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  amcBadgeText: {
    color: '#0a0f2c',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  amcTitle: {
    color: '#fff',
    fontSize: 19,
    fontWeight: '900',
    lineHeight: 25,
    marginBottom: 6,
  },
  amcSub: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 14,
  },
  amcPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginBottom: 16,
  },
  amcPrice: {
    fontSize: 32,
    fontWeight: '900',
    color: '#ffd700',
  },
  amcPriceSub: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '600',
  },
  amcFeatGrid: {
    gap: 10,
    marginBottom: 16,
  },
  amcFeatItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    padding: 10,
  },
  amcFeatHeading: {
    fontSize: 13,
    fontWeight: '800',
    color: '#ffd700',
    marginBottom: 2,
  },
  amcFeatDesc: {
    fontSize: 11.5,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  policyBox: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
    borderRadius: 12,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 18,
  },
  policyText: {
    fontSize: 11,
    color: '#fde047',
    flex: 1,
    lineHeight: 15,
  },
  amcBtn: {
    backgroundColor: '#ffd700',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  amcBtnText: {
    color: '#0a0f2c',
    fontSize: 14,
    fontWeight: '900',
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 4,
  },
  sectionDesc: {
    fontSize: 12,
    marginBottom: 12,
  },
  repairGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  repairCard: {
    flex: 1,
    minWidth: '45%',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    gap: 4,
  },
  repairCardTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    textAlign: 'center',
  },
  repairCardPrice: {
    fontSize: 13,
    fontWeight: '900',
    color: '#4169E1',
  },
  planCard: {
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 14,
    position: 'relative',
  },
  popBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#4169E1',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  popBadgeText: {
    color: '#fff',
    fontSize: 9.5,
    fontWeight: '800',
  },
  planName: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  planPrice: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0f172a',
    marginBottom: 4,
  },
  planYear: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '500',
  },
  planDesc: {
    fontSize: 12,
    marginBottom: 12,
  },
  featureList: {
    gap: 8,
    marginBottom: 14,
  },
  featRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  featText: {
    fontSize: 12,
    flex: 1,
  },
  subBtn: {
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  subBtnText: {
    fontSize: 13,
    fontWeight: '800',
  },
});
