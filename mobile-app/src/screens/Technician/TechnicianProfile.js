import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { AuthContext } from '../../context/AuthContext';

export default function TechnicianProfile({ navigation }) {
  const { user, logout } = useContext(AuthContext);

  const stats = [
    { label: 'Total Earnings', value: `₹${(user?.earnings || 0).toLocaleString('en-IN')}`, icon: '💰', color: '#22c55e' },
    { label: 'Jobs Completed', value: user?.completedJobs || '0', icon: '✅', color: '#3b82f6' },
    { label: 'Rating', value: user?.ratings ? `${user.ratings} ⭐` : 'N/A', icon: '⭐', color: '#f59e0b' },
    { label: 'Member Since', value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : 'N/A', icon: '📅', color: '#8b5cf6' },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
      </View>

      {/* Profile Card */}
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.name?.charAt(0) || '👷'}</Text>
        </View>
        <Text style={styles.name}>{user?.name || 'Technician'}</Text>
        <Text style={styles.phone}>{user?.phone}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>⚡ Verified Electrician</Text>
        </View>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        {stats.map((stat, idx) => (
          <View key={idx} style={styles.statCard}>
            <Text style={styles.statIcon}>{stat.icon}</Text>
            <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* KYC Status */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>📋 KYC Status</Text>
        <View style={styles.kycRow}>
          <Text style={styles.kycLabel}>Aadhaar Verification</Text>
          <View style={[styles.kycBadge, { backgroundColor: '#dcfce7' }]}>
            <Text style={[styles.kycText, { color: '#15803d' }]}>✓ Verified</Text>
          </View>
        </View>
        <View style={styles.kycRow}>
          <Text style={styles.kycLabel}>PAN Card</Text>
          <View style={[styles.kycBadge, { backgroundColor: '#dcfce7' }]}>
            <Text style={[styles.kycText, { color: '#15803d' }]}>✓ Verified</Text>
          </View>
        </View>
        <View style={styles.kycRow}>
          <Text style={styles.kycLabel}>Background Check</Text>
          <View style={[styles.kycBadge, { backgroundColor: '#fef3c7' }]}>
            <Text style={[styles.kycText, { color: '#b45309' }]}>Pending</Text>
          </View>
        </View>
      </View>

      {/* Quick Links */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>⚙️ Settings</Text>
        {[
          { label: 'My BOM History', icon: '📋', onPress: () => navigation.navigate('BOMHistory') },
          { label: 'Support & Help', icon: '💬', onPress: () => {} },
          { label: 'Terms of Service', icon: '📄', onPress: () => {} },
        ].map((item, idx) => (
          <TouchableOpacity key={idx} style={styles.linkRow} onPress={item.onPress}>
            <Text style={styles.linkIcon}>{item.icon}</Text>
            <Text style={styles.linkText}>{item.label}</Text>
            <Text style={styles.linkArrow}>→</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
        <Text style={styles.logoutText}>🚪 Logout</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4f8', padding: 20, paddingTop: 50 },
  header: { marginBottom: 16 },
  backText: { color: '#1e56a0', fontWeight: '700', fontSize: 15 },
  profileCard: {
    backgroundColor: '#0a1628',
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: 'rgba(41,121,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  avatarText: { fontSize: 28, color: '#fff' },
  name: { fontSize: 22, fontWeight: '800', color: '#fff', marginBottom: 4 },
  phone: { fontSize: 14, color: 'rgba(255,255,255,0.5)', fontWeight: '600', marginBottom: 12 },
  roleBadge: { backgroundColor: 'rgba(34,197,94,0.15)', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 10 },
  roleText: { color: '#22c55e', fontSize: 13, fontWeight: '700' },

  // Stats
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  statCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    flexGrow: 1,
  },
  statIcon: { fontSize: 24, marginBottom: 8 },
  statValue: { fontSize: 20, fontWeight: '800', marginBottom: 4 },
  statLabel: { fontSize: 12, color: '#94a3b8', fontWeight: '600' },

  // Card
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#0a1628', marginBottom: 14 },
  kycRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  kycLabel: { fontSize: 14, color: '#334155', fontWeight: '500' },
  kycBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  kycText: { fontSize: 12, fontWeight: '700' },
  linkRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f1f5f9', gap: 12 },
  linkIcon: { fontSize: 18 },
  linkText: { flex: 1, fontSize: 14, fontWeight: '600', color: '#334155' },
  linkArrow: { color: '#94a3b8', fontSize: 16, fontWeight: '700' },
  logoutBtn: { backgroundColor: '#fee2e2', padding: 16, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: '#fecaca' },
  logoutText: { color: '#dc2626', fontWeight: '700', fontSize: 15 },
});
