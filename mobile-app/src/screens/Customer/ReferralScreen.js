import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Share, Alert } from 'react-native';
import { ArrowLeft, Gift, Copy, Share2, Users, Wallet, ChevronRight } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { AuthContext } from '../../context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';

export default function ReferralScreen({ navigation }) {
  const { theme } = useTheme();
  const c = theme.colors;
  const { user } = useContext(AuthContext);
  const referralCode = user?.referralCode || 'AMPEDGE5K';
  const walletBalance = user?.walletBalance || 0;

  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    setCopied(true);
    Alert.alert('Copied!', `Referral code ${referralCode} copied to clipboard.`);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareCode = async () => {
    try {
      await Share.share({
        message: `Join AmpEdge — India's premier electrical services app! Use my referral code ${referralCode} to get ₹500 off your first booking. Download: https://ampedge.in/download`,
      });
    } catch (e) {
      console.log('Share error:', e);
    }
  };

  const referralHistory = [
    { name: 'Rahul S.', status: 'completed', reward: 5000, date: '2 days ago' },
    { name: 'Priya M.', status: 'pending', reward: 0, date: '5 days ago' },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
      <View style={[styles.header, { backgroundColor: c.surface, borderBottomColor: c.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={22} color={c.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: c.text }]}>Refer & Earn</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Hero Card */}
        <LinearGradient colors={['#4169E1', '#2c4fd4']} style={styles.heroCard}>
          <Gift size={48} color="#fff" />
          <Text style={styles.heroTitle}>Earn ₹5,000</Text>
          <Text style={styles.heroSubtitle}>For every friend who completes their first booking</Text>
          
          <View style={styles.codeBox}>
            <Text style={styles.codeLabel}>YOUR REFERRAL CODE</Text>
            <View style={styles.codeRow}>
              <Text style={styles.codeText}>{referralCode}</Text>
              <TouchableOpacity onPress={copyCode} style={styles.copyBtn}>
                <Copy size={18} color="#4169E1" />
                <Text style={styles.copyText}>{copied ? 'Copied!' : 'Copy'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={styles.shareBtn} onPress={shareCode}>
            <Share2 size={18} color="#4169E1" />
            <Text style={styles.shareBtnText}>Share with Friends</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* Wallet Balance */}
        <View style={[styles.walletCard, { backgroundColor: c.surface, borderColor: c.borderLight }]}>
          <View style={styles.walletLeft}>
            <Wallet size={24} color="#22c55e" />
            <View>
              <Text style={[styles.walletLabel, { color: c.textSecondary }]}>Wallet Balance</Text>
              <Text style={[styles.walletAmount, { color: c.text }]}>₹{walletBalance.toLocaleString()}</Text>
            </View>
          </View>
          <Text style={{ color: '#22c55e', fontWeight: '700', fontSize: 13 }}>Active</Text>
        </View>

        {/* How It Works */}
        <View style={[styles.section, { backgroundColor: c.surface, borderColor: c.borderLight }]}>
          <Text style={[styles.sectionTitle, { color: c.text }]}>How it Works</Text>
          {[
            { step: '1', title: 'Share Your Code', desc: 'Send your referral code to friends via WhatsApp, SMS, or social media' },
            { step: '2', title: 'Friend Signs Up', desc: 'Your friend creates an account and uses your code' },
            { step: '3', title: 'Both Earn Rewards', desc: 'You get ₹5,000 and your friend gets ₹500 off their first booking' },
          ].map((item, idx) => (
            <View key={idx} style={styles.stepItem}>
              <View style={styles.stepCircle}>
                <Text style={styles.stepNum}>{item.step}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.stepTitle, { color: c.text }]}>{item.title}</Text>
                <Text style={[styles.stepDesc, { color: c.textSecondary }]}>{item.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Referral History */}
        <View style={[styles.section, { backgroundColor: c.surface, borderColor: c.borderLight }]}>
          <View style={styles.sectionHeader}>
            <Users size={18} color={c.primary} />
            <Text style={[styles.sectionTitle, { color: c.text }]}>Referral History</Text>
          </View>
          {referralHistory.map((ref, idx) => (
            <View key={idx} style={[styles.historyItem, { borderTopColor: c.borderLight }]}>
              <View style={[styles.historyAvatar, { backgroundColor: ref.status === 'completed' ? '#dcfce7' : '#fef3c7' }]}>
                <Text style={{ fontWeight: '800' }}>{ref.name[0]}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.historyName, { color: c.text }]}>{ref.name}</Text>
                <Text style={[styles.historyDate, { color: c.textMuted }]}>{ref.date}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ color: ref.status === 'completed' ? '#22c55e' : '#f59e0b', fontSize: 12, fontWeight: '700', textTransform: 'uppercase' }}>
                  {ref.status}
                </Text>
                {ref.reward > 0 && (
                  <Text style={{ color: '#22c55e', fontWeight: '800', fontSize: 14 }}>+₹{ref.reward}</Text>
                )}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1 },
  headerTitle: { fontSize: 18, fontWeight: '800' },
  scrollContent: { padding: 16 },
  heroCard: { borderRadius: 20, padding: 28, alignItems: 'center', marginBottom: 16 },
  heroTitle: { color: '#fff', fontSize: 32, fontWeight: '900', marginTop: 12 },
  heroSubtitle: { color: 'rgba(255,255,255,0.8)', fontSize: 14, textAlign: 'center', marginTop: 6, marginBottom: 24 },
  codeBox: { backgroundColor: '#fff', borderRadius: 14, padding: 16, width: '100%', alignItems: 'center', marginBottom: 16 },
  codeLabel: { color: '#64748b', fontSize: 10, fontWeight: '800', letterSpacing: 1, marginBottom: 4 },
  codeRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  codeText: { fontSize: 24, fontWeight: '900', color: '#4169E1', letterSpacing: 2 },
  copyBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#e0e7ff', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  copyText: { color: '#4169E1', fontWeight: '700', fontSize: 12 },
  shareBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#fff', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 12 },
  shareBtnText: { color: '#4169E1', fontWeight: '800', fontSize: 15 },
  walletCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 16 },
  walletLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  walletLabel: { fontSize: 12, fontWeight: '600' },
  walletAmount: { fontSize: 22, fontWeight: '900' },
  section: { borderRadius: 16, padding: 16, borderWidth: 1, marginBottom: 16 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 },
  sectionTitle: { fontSize: 16, fontWeight: '800', marginBottom: 14 },
  stepItem: { flexDirection: 'row', gap: 14, marginBottom: 16 },
  stepCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#4169E1', alignItems: 'center', justifyContent: 'center' },
  stepNum: { color: '#fff', fontWeight: '800' },
  stepTitle: { fontSize: 14, fontWeight: '700' },
  stepDesc: { fontSize: 12, lineHeight: 18, marginTop: 2 },
  historyItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderTopWidth: 1 },
  historyAvatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  historyName: { fontSize: 14, fontWeight: '700' },
  historyDate: { fontSize: 12 },
});
