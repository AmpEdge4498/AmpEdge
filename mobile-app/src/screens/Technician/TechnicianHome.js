import React, { useContext, useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, Alert, Switch, StyleSheet, RefreshControl } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import apiClient from '../../services/api';

const TABS = ['New Requests', 'Active Jobs', 'Completed'];

export default function TechnicianHome({ navigation }) {
  const { user, logout } = useContext(AuthContext);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isAvailable, setIsAvailable] = useState(user?.isAvailable || true);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await apiClient.get('/bookings');
      setJobs(res.data.data || []);
    } catch (error) {
      console.log('Error fetching jobs', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchJobs();
  }, []);

  const pendingJobs = jobs.filter((j) => j.status === 'PENDING');
  const activeJobs = jobs.filter((j) => ['ACCEPTED', 'ON_THE_WAY', 'IN_PROGRESS', 'BOM_PENDING', 'BOM_SUBMITTED', 'BOM_APPROVED'].includes(j.status));
  const completedJobs = jobs.filter((j) => ['COMPLETED', 'CANCELLED'].includes(j.status));

  const getCurrentData = () => {
    if (activeTab === 0) return pendingJobs;
    if (activeTab === 1) return activeJobs;
    return completedJobs;
  };

  const getStatusColor = (status) => {
    const map = {
      PENDING: '#f59e0b',
      ACCEPTED: '#3b82f6',
      ON_THE_WAY: '#6366f1',
      IN_PROGRESS: '#0891b2',
      BOM_PENDING: '#8b5cf6',
      BOM_SUBMITTED: '#a855f7',
      BOM_APPROVED: '#22c55e',
      COMPLETED: '#10b981',
      CANCELLED: '#ef4444',
    };
    return map[status] || '#64748b';
  };

  const handleQuickAction = async (jobId, action) => {
    try {
      const res = await apiClient.put(`/bookings/${jobId}`, { status: action });
      if (res.data.success) {
        Alert.alert('Success', `Job ${action.toLowerCase().replace(/_/g, ' ')}!`);
        fetchJobs();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update job status.');
    }
  };

  const renderJobCard = ({ item }) => {
    const isPending = item.status === 'PENDING';
    const isActive = ['ACCEPTED', 'ON_THE_WAY', 'IN_PROGRESS', 'BOM_PENDING', 'BOM_SUBMITTED', 'BOM_APPROVED'].includes(item.status);

    return (
      <TouchableOpacity
        style={[styles.jobCard, { borderLeftColor: getStatusColor(item.status) }]}
        onPress={() => navigation.navigate('JobDetail', { booking: item })}
        activeOpacity={0.7}
      >
        <View style={styles.jobCardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.jobName}>{item.serviceId?.name || 'Service Request'}</Text>
            <Text style={styles.jobCategory}>{item.serviceId?.category}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '18' }]}>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]} />
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {item.status?.replace(/_/g, ' ')}
            </Text>
          </View>
        </View>

        <Text style={styles.jobAddress}>📍 {item.serviceAddress?.addressText || 'Address pending'}</Text>

        <View style={styles.jobMetaRow}>
          <Text style={styles.jobPrice}>₹{item.pricing?.totalPrice?.toLocaleString('en-IN')}</Text>
          <Text style={styles.jobTime}>
            {item.scheduledTime ? new Date(item.scheduledTime).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : ''}
          </Text>
        </View>

        {isPending && (
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.rejectBtn}
              onPress={() => handleQuickAction(item._id, 'CANCELLED')}
            >
              <Text style={styles.rejectText}>✕ Reject</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.acceptBtn}
              onPress={() => handleQuickAction(item._id, 'ACCEPTED')}
            >
              <Text style={styles.acceptText}>✓ Accept</Text>
            </TouchableOpacity>
          </View>
        )}

        {isActive && (
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.detailBtn}
              onPress={() => navigation.navigate('JobDetail', { booking: item })}
            >
              <Text style={styles.detailBtnText}>View Details →</Text>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header Card */}
      <View style={styles.headerCard}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerGreeting}>Hello, Technician 👷</Text>
            <Text style={styles.headerEarnings}>Today's Earnings: ₹{user?.earnings || 0}</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('TechnicianProfile')} style={styles.profileBtn}>
            <Text style={styles.profileBtnText}>👤</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.toggleRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.toggleLabel}>{isAvailable ? '🟢 Available' : '🔴 Offline'}</Text>
            <Text style={styles.toggleSub}>{isAvailable ? 'Receiving new job requests' : 'Not receiving requests'}</Text>
          </View>
          <Switch
            value={isAvailable}
            onValueChange={(val) => setIsAvailable(val)}
            trackColor={{ false: '#374151', true: '#22c55e' }}
            thumbColor="#fff"
          />
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{pendingJobs.length}</Text>
            <Text style={styles.statLabel}>New</Text>
          </View>
          <View style={[styles.statItem, styles.statDivider]}>
            <Text style={styles.statValue}>{activeJobs.length}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{completedJobs.length}</Text>
            <Text style={styles.statLabel}>Done</Text>
          </View>
        </View>
      </View>

      {/* Quick Navigation */}
      <View style={styles.quickNav}>
        <TouchableOpacity style={styles.quickNavBtn} onPress={() => navigation.navigate('BOMHistory')}>
          <Text style={styles.quickNavIcon}>📋</Text>
          <Text style={styles.quickNavText}>My BOMs</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickNavBtn} onPress={() => navigation.navigate('TechnicianProfile')}>
          <Text style={styles.quickNavIcon}>📊</Text>
          <Text style={styles.quickNavText}>Earnings</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickNavBtn} onPress={logout}>
          <Text style={styles.quickNavIcon}>🚪</Text>
          <Text style={styles.quickNavText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        {TABS.map((tab, idx) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === idx && styles.tabActive]}
            onPress={() => setActiveTab(idx)}
          >
            <Text style={[styles.tabText, activeTab === idx && styles.tabTextActive]}>
              {tab}
            </Text>
            {idx === 0 && pendingJobs.length > 0 && (
              <View style={styles.tabBadge}>
                <Text style={styles.tabBadgeText}>{pendingJobs.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Job List */}
      {loading ? (
        <ActivityIndicator color="#1e56a0" size="large" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={getCurrentData()}
          keyExtractor={(item) => item._id}
          renderItem={renderJobCard}
          contentContainerStyle={{ paddingBottom: 20 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#1e56a0']} />}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>
                {activeTab === 0 ? '📭' : activeTab === 1 ? '🔍' : '✅'}
              </Text>
              <Text style={styles.emptyTitle}>
                {activeTab === 0 ? 'No New Requests' : activeTab === 1 ? 'No Active Jobs' : 'No Completed Jobs'}
              </Text>
              <Text style={styles.emptySubtitle}>
                {activeTab === 0 ? 'New job requests will appear here' : activeTab === 1 ? 'Accept a job to get started' : 'Your completed work shows here'}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4f8' },

  // Header
  headerCard: {
    backgroundColor: '#0a1628',
    paddingTop: 56,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  headerGreeting: { fontSize: 22, fontWeight: '800', color: '#fff' },
  headerEarnings: { fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 4, fontWeight: '600' },
  profileBtn: { width: 44, height: 44, borderRadius: 14, backgroundColor: 'rgba(41,121,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  profileBtnText: { fontSize: 20 },

  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  toggleLabel: { color: '#fff', fontSize: 15, fontWeight: '700' },
  toggleSub: { color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 2 },

  statsRow: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 14, overflow: 'hidden' },
  statItem: { flex: 1, alignItems: 'center', paddingVertical: 14 },
  statDivider: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  statValue: { fontSize: 22, fontWeight: '800', color: '#fff' },
  statLabel: { fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2, fontWeight: '600' },

  // Quick Nav
  quickNav: { flexDirection: 'row', paddingHorizontal: 20, paddingTop: 16, gap: 10 },
  quickNavBtn: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  quickNavIcon: { fontSize: 20, marginBottom: 4 },
  quickNavText: { fontSize: 12, fontWeight: '700', color: '#334155' },

  // Tabs
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 16,
    backgroundColor: '#e2e8f0',
    borderRadius: 14,
    padding: 4,
  },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 6 },
  tabActive: { backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  tabText: { fontSize: 13, fontWeight: '600', color: '#64748b' },
  tabTextActive: { color: '#1e56a0', fontWeight: '700' },
  tabBadge: { backgroundColor: '#ef4444', borderRadius: 10, paddingHorizontal: 6, paddingVertical: 2, minWidth: 20, alignItems: 'center' },
  tabBadgeText: { color: '#fff', fontSize: 10, fontWeight: '800' },

  // Job Card
  jobCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 12,
    padding: 18,
    borderRadius: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  jobCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  jobName: { fontSize: 16, fontWeight: '700', color: '#0a1628' },
  jobCategory: { fontSize: 12, color: '#94a3b8', marginTop: 2, fontWeight: '600' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, gap: 5 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 11, fontWeight: '700' },
  jobAddress: { fontSize: 13, color: '#64748b', marginBottom: 12, lineHeight: 18 },
  jobMetaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  jobPrice: { fontSize: 18, fontWeight: '800', color: '#0a1628' },
  jobTime: { fontSize: 12, color: '#94a3b8', fontWeight: '600' },

  // Actions
  actionRow: { flexDirection: 'row', gap: 8, marginTop: 14 },
  rejectBtn: { flex: 1, backgroundColor: '#f1f5f9', paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  rejectText: { color: '#64748b', fontWeight: '700', fontSize: 14 },
  acceptBtn: { flex: 1, backgroundColor: '#1e56a0', paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  acceptText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  detailBtn: { flex: 1, backgroundColor: 'rgba(30, 86, 160, 0.08)', paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  detailBtnText: { color: '#1e56a0', fontWeight: '700', fontSize: 14 },

  // Empty
  emptyState: { alignItems: 'center', paddingTop: 48 },
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: '#334155', marginBottom: 4 },
  emptySubtitle: { fontSize: 13, color: '#94a3b8' },
});
