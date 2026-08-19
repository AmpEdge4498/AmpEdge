import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Linking } from 'react-native';
import { ArrowLeft, Sun, Zap, CheckCircle2, Shield, BatteryCharging, FileText, PhoneCall, ChevronRight } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';

export default function SolarScreen({ navigation }) {
  const { theme } = useTheme();
  const c = theme.colors;

  const handleWhatsApp = () => {
    Linking.openURL('https://wa.me/919123667258?text=Hello%20AmpEdge,%20I%20want%20to%20inquire%20about%20Solar%20Panel%20Installation.');
  };

  const handleBookSurvey = () => {
    navigation.navigate('BookingConfirm', {
      service: {
        id: 'solar-survey-01',
        title: 'Solar Rooftop Survey',
        category: 'Solar Energy',
        price: 299,
        description: 'Shadow Analysis, kW System Sizing & Free ROI Estimate'
      }
    });
  };

  const handleBookSolarInstall = () => {
    navigation.navigate('BookingConfirm', {
      service: {
        id: 'solar-install-01',
        title: 'Solar Panel Installation',
        category: 'Solar Energy',
        price: 12999,
        description: 'Complete Rooftop Setup, On-Grid Net Metering & Inverter Setup'
      }
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: c.surface, borderBottomColor: c.border }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft size={22} color={c.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: c.text }]}>Solar Energy Hub ☀️</Text>
        <TouchableOpacity style={styles.waBtn} onPress={handleWhatsApp}>
          <Text style={{ fontSize: 18 }}>💬</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Hero Banner */}
        <LinearGradient
          colors={['#0f172a', '#1e3a5f']}
          style={styles.heroBanner}
        >
          <View style={styles.badgePill}>
            <Text style={styles.badgePillText}>☀️ Certified Solar Partner</Text>
          </View>
          <Text style={styles.heroTitle}>Go Solar. Save More. Power Your Home.</Text>
          <Text style={styles.heroSub}>
            Generate your own electricity and cut electricity bills by up to 90% with 25-year panel performance warranty.
          </Text>
          <View style={styles.heroBtnRow}>
            <TouchableOpacity style={styles.primaryBtn} onPress={handleBookSurvey}>
              <Text style={styles.primaryBtnText}>Book Free Survey (₹299)</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.outlineBtn} onPress={handleWhatsApp}>
              <Text style={styles.outlineBtnText}>Ask Solar Expert</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: c.surface, borderColor: '#fef08a' }]}>
            <Text style={[styles.statVal, { color: '#d97706' }]}>90%</Text>
            <Text style={[styles.statLbl, { color: c.textSecondary }]}>Bill Reduction</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: c.surface, borderColor: '#fef08a' }]}>
            <Text style={[styles.statVal, { color: '#d97706' }]}>25 yr</Text>
            <Text style={[styles.statLbl, { color: c.textSecondary }]}>Panel Warranty</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: c.surface, borderColor: '#bbf7d0' }]}>
            <Text style={[styles.statVal, { color: '#16a34a' }]}>₹0</Text>
            <Text style={[styles.statLbl, { color: c.textSecondary }]}>Govt Subsidy Help</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: c.surface, borderColor: '#fed7aa' }]}>
            <Text style={[styles.statVal, { color: '#ea580c' }]}>3-5 yr</Text>
            <Text style={[styles.statLbl, { color: c.textSecondary }]}>Avg Payback</Text>
          </View>
        </View>

        {/* Solar Services List */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: c.text }]}>Solar Services & Surveys</Text>
          
          {/* Survey Card */}
          <TouchableOpacity 
            style={[styles.serviceCard, { backgroundColor: c.surface, borderColor: c.border }]}
            onPress={handleBookSurvey}
          >
            <View style={styles.svcIconWrap}>
              <Text style={{ fontSize: 26 }}>🔍</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[styles.svcTitle, { color: c.text }]}>Solar Rooftop Survey</Text>
              <Text style={[styles.svcDesc, { color: c.textSecondary }]}>Shadow Analysis • kW Sizing • Free Quote</Text>
              <Text style={styles.svcPrice}>₹299 <Text style={styles.priceSub}>/ site visit</Text></Text>
            </View>
            <ChevronRight size={20} color={c.textMuted} />
          </TouchableOpacity>

          {/* Installation Card */}
          <TouchableOpacity 
            style={[styles.serviceCard, { backgroundColor: c.surface, borderColor: c.border }]}
            onPress={handleBookSolarInstall}
          >
            <View style={[styles.svcIconWrap, { backgroundColor: '#fef3c7' }]}>
              <Text style={{ fontSize: 26 }}>☀️</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[styles.svcTitle, { color: c.text }]}>Solar Panel Installation</Text>
              <Text style={[styles.svcDesc, { color: c.textSecondary }]}>Complete Rooftop Setup • Net Metering</Text>
              <Text style={styles.svcPrice}>₹12,999 <Text style={styles.priceSub}>starting</Text></Text>
            </View>
            <ChevronRight size={20} color={c.textMuted} />
          </TouchableOpacity>
        </View>

        {/* 3-Step Process */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: c.text }]}>How Solar Installation Works</Text>
          <View style={[styles.stepBox, { backgroundColor: c.surface, borderColor: c.border }]}>
            <View style={styles.stepItem}>
              <View style={[styles.stepNum, { backgroundColor: '#f59e0b' }]}>
                <Text style={styles.stepNumText}>1</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.stepHeading, { color: c.text }]}>Free Rooftop Survey</Text>
                <Text style={[styles.stepText, { color: c.textSecondary }]}>
                  Our solar engineer visits your roof, calculates shadow-free area and kW consumption requirements.
                </Text>
              </View>
            </View>

            <View style={styles.stepItem}>
              <View style={[styles.stepNum, { backgroundColor: '#4169E1' }]}>
                <Text style={styles.stepNumText}>2</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.stepHeading, { color: c.text }]}>Panel & Inverter Installation</Text>
                <Text style={[styles.stepText, { color: c.textSecondary }]}>
                  Monocrystalline Tier-1 solar panels, MPPT solar inverters and safety earthing installed with precision.
                </Text>
              </View>
            </View>

            <View style={[styles.stepItem, { borderBottomWidth: 0 }]}>
              <View style={[styles.stepNum, { backgroundColor: '#16a34a' }]}>
                <Text style={styles.stepNumText}>3</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.stepHeading, { color: c.text }]}>Net Metering & Subsidy</Text>
                <Text style={[styles.stepText, { color: c.textSecondary }]}>
                  We manage DISCOM approvals, bi-directional net meter sync and government subsidy documentation.
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Solar Hardware Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: c.text }]}>Solar Inverters & Batteries</Text>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={[styles.productMiniCard, { backgroundColor: c.surface, borderColor: c.border }]}>
              <Text style={{ fontSize: 32, textAlign: 'center', marginVertical: 8 }}>⚡</Text>
              <Text style={[styles.prodName, { color: c.text }]}>Luminous 2kVA Solar Inverter</Text>
              <Text style={styles.prodPrice}>₹12,499</Text>
              <TouchableOpacity 
                style={styles.buyBtn}
                onPress={() => navigation.navigate('MarketplaceTab')}
              >
                <Text style={styles.buyBtnText}>View Store</Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.productMiniCard, { backgroundColor: c.surface, borderColor: c.border }]}>
              <Text style={{ fontSize: 32, textAlign: 'center', marginVertical: 8 }}>🔋</Text>
              <Text style={[styles.prodName, { color: c.text }]}>Amaron Solar 150Ah Battery</Text>
              <Text style={styles.prodPrice}>₹14,999</Text>
              <TouchableOpacity 
                style={styles.buyBtn}
                onPress={() => navigation.navigate('MarketplaceTab')}
              >
                <Text style={styles.buyBtnText}>View Store</Text>
              </TouchableOpacity>
            </View>
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
  waBtn: { padding: 4 },
  heroBanner: {
    margin: 16,
    borderRadius: 20,
    padding: 22,
  },
  badgePill: {
    backgroundColor: 'rgba(245, 158, 11, 0.25)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  badgePillText: {
    color: '#fbbf24',
    fontSize: 12,
    fontWeight: '800',
  },
  heroTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '900',
    lineHeight: 28,
    marginBottom: 8,
  },
  heroSub: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 18,
  },
  heroBtnRow: {
    flexDirection: 'row',
    gap: 10,
  },
  primaryBtn: {
    backgroundColor: '#f59e0b',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  primaryBtnText: {
    color: '#0f172a',
    fontWeight: '800',
    fontSize: 13,
  },
  outlineBtn: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  outlineBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    gap: 8,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
  },
  statVal: {
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 2,
  },
  statLbl: {
    fontSize: 11,
    fontWeight: '700',
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 14,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 12,
  },
  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 10,
  },
  svcIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  svcTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 2,
  },
  svcDesc: {
    fontSize: 12,
    marginBottom: 4,
  },
  svcPrice: {
    fontSize: 15,
    fontWeight: '900',
    color: '#d97706',
  },
  priceSub: {
    fontSize: 11,
    fontWeight: '500',
    color: '#94a3b8',
  },
  stepBox: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  stepItem: {
    flexDirection: 'row',
    gap: 12,
    paddingBottom: 14,
    marginBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  stepNum: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 13,
  },
  stepHeading: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 2,
  },
  stepText: {
    fontSize: 12,
    lineHeight: 17,
  },
  productMiniCard: {
    flex: 1,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  prodName: {
    fontSize: 12.5,
    fontWeight: '700',
    marginBottom: 6,
    height: 34,
  },
  prodPrice: {
    fontSize: 15,
    fontWeight: '900',
    color: '#4169E1',
    marginBottom: 8,
  },
  buyBtn: {
    backgroundColor: '#eff6ff',
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
  },
  buyBtnText: {
    color: '#4169E1',
    fontSize: 11.5,
    fontWeight: '800',
  },
});
