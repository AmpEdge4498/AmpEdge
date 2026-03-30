import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, RefreshControl, StyleSheet } from 'react-native';
import apiClient from '../../services/api';

export default function MyBookings({ navigation }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await apiClient.get('/bookings');
      setBookings(res.data.data || []);
    } catch (e) {
      console.log('Error', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchBookings();
  }, []);

  const activeBookings = bookings.filter(b => !['COMPLETED', 'CANCELLED'].includes(b.status));
  const pastBookings = bookings.filter(b => ['COMPLETED', 'CANCELLED'].includes(b.status));

  const getStatusColor = (status) => {
    const map = {
      PENDING: '#f59e0b', ACCEPTED: '#3b82f6', ON_THE_WAY: '#6366f1',
      IN_PROGRESS: '#0891b2', BOM_PENDING: '#8b5cf6', BOM_SUBMITTED: '#a855f7',
      BOM_APPROVED: '#22c55e', COMPLETED: '#10b981', CANCELLED: '#ef4444',
    };
    return map[status] || '#64748b';
  };

  const hasBOM = (booking) => ['BOM_SUBMITTED', 'BOM_APPROVED'].includes(booking.status) || booking.bomId;

  const renderBooking = ({ item }) => {
    const statusColor = getStatusColor(item.status);
    const showBOMAlert = item.status === 'BOM_SUBMITTED';

    return (
      <TouchableOpacity
        style={[styles.card, { borderLeftColor: statusColor }]}
        onPress={() => {
          if (showBOMAlert || hasBOM(item)) {
            navigation.navigate('BookingBOM', { booking: item });
          }
        }}
        activeOpacity={0.7}
      >
        {showBOMAlert && (
          <View style={styles.bomAlert}>
            <Text style={styles.bomAlertText}>📋 BOM submitted — Review & Approve required</Text>
          </View>
        )}

        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.serviceName}>{item.serviceId?.name || 'Service'}</Text>
            <Text style={styles.serviceCategory}>{item.serviceId?.category}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColor + '18' }]}>
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            <Text style={[styles.statusText, { color: statusColor }]}>{item.status?.replace(/_/g, ' ')}</Text>
          </View>
        </View>

        <Text style={styles.address}>📍 {item.serviceAddress?.addressText || 'Address pending'}</Text>

        <View style={styles.cardFooter}>
          <Text style={styles.price}>₹{item.pricing?.totalPrice?.toLocaleString('en-IN')}</Text>
          <Text style={styles.date}>
            {item.scheduledTime ? new Date(item.scheduledTime).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : ''}
          </Text>
        </View>

        {showBOMAlert && (
          <TouchableOpacity
            style={styles.reviewBtn}
            onPress={() => navigation.navigate('BookingBOM', { booking: item })}
          >
            <Text style={styles.reviewBtnText}>Review BOM →</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  const TABS = ['Active', 'History'];

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>My Bookings</Text>
      <Text style={styles.subtitle}>{bookings.length} total bookings</Text>

      {/* Tabs */}
      <View style={styles.tabBar}>
        {TABS.map((tab, idx) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === idx && styles.tabActive]}
            onPress={() => setActiveTab(idx)}
          >
            <Text style={[styles.tabText, activeTab === idx && styles.tabTextActive]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator color="#1e56a0" size="large" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={activeTab === 0 ? activeBookings : pastBookings}
          keyExtractor={(item) => item._id}
          renderItem={renderBooking}
          contentContainerStyle={{ paddingBottom: 20 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#1e56a0']} />}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>{activeTab === 0 ? '🔍' : '📭'}</Text>
              <Text style={styles.emptyTitle}>{activeTab === 0 ? 'No Active Bookings' : 'No Past Bookings'}</Text>
              <Text style={styles.emptySub}>Your bookings will appear here</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4f8', padding: 20, paddingTop: 50 },
  backBtn: { marginBottom: 16 },
  backText: { color: '#1e56a0', fontWeight: '700', fontSize: 15 },
  title: { fontSize: 26, fontWeight: '800', color: '#0a1628', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#94a3b8', fontWeight: '600', marginBottom: 16 },
  tabBar: { flexDirection: 'row', backgroundColor: '#e2e8f0', borderRadius: 14, padding: 4, marginBottom: 16 },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  tabActive: { backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  tabText: { fontSize: 14, fontWeight: '600', color: '#64748b' },
  tabTextActive: { color: '#1e56a0', fontWeight: '700' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  bomAlert: { backgroundColor: '#fef3c7', borderRadius: 10, padding: 10, marginBottom: 12 },
  bomAlertText: { fontSize: 13, color: '#92400e', fontWeight: '600' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  serviceName: { fontSize: 16, fontWeight: '700', color: '#0a1628' },
  serviceCategory: { fontSize: 12, color: '#94a3b8', marginTop: 2, fontWeight: '600' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, gap: 5 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 11, fontWeight: '700' },
  address: { fontSize: 13, color: '#64748b', marginBottom: 12 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  price: { fontSize: 18, fontWeight: '800', color: '#0a1628' },
  date: { fontSize: 12, color: '#94a3b8', fontWeight: '600' },
  reviewBtn: { backgroundColor: 'rgba(30, 86, 160, 0.08)', padding: 14, borderRadius: 12, alignItems: 'center', marginTop: 12 },
  reviewBtnText: { color: '#1e56a0', fontWeight: '700', fontSize: 14 },
  emptyState: { alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#334155', marginBottom: 4 },
  emptySub: { fontSize: 13, color: '#94a3b8' },
});
