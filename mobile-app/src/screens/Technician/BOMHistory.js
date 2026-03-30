import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, RefreshControl, StyleSheet } from 'react-native';
import apiClient from '../../services/api';

export default function BOMHistory({ navigation }) {
  const [boms, setBoms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchBOMs();
  }, []);

  const fetchBOMs = async () => {
    try {
      const res = await apiClient.get('/bom/my');
      setBoms(res.data.data || []);
    } catch (e) {
      console.log('Error fetching BOMs', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchBOMs();
  }, []);

  const getStatusColor = (status) => {
    const map = {
      DRAFT: '#f59e0b',
      SUBMITTED: '#3b82f6',
      APPROVED: '#22c55e',
      REJECTED: '#ef4444',
    };
    return map[status] || '#64748b';
  };

  const getStatusIcon = (status) => {
    const map = { DRAFT: '📝', SUBMITTED: '📤', APPROVED: '✅', REJECTED: '❌' };
    return map[status] || '📋';
  };

  const renderBOM = ({ item }) => {
    const statusColor = getStatusColor(item.status);
    return (
      <View style={[styles.card, { borderLeftColor: statusColor }]}>
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.bomId}>BOM #{item._id?.slice(-6).toUpperCase()}</Text>
            <Text style={styles.bomDate}>
              {item.submittedAt ? new Date(item.submittedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Not submitted'}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColor + '18' }]}>
            <Text style={{ fontSize: 12 }}>{getStatusIcon(item.status)}</Text>
            <Text style={[styles.statusText, { color: statusColor }]}>{item.status}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Materials</Text>
          <Text style={styles.detailValue}>{item.items?.length} items</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Material Cost</Text>
          <Text style={styles.detailValue}>₹{item.totalMaterialCost?.toLocaleString('en-IN')}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Labor</Text>
          <Text style={styles.detailValue}>₹{item.laborCharge?.toLocaleString('en-IN')}</Text>
        </View>
        <View style={[styles.detailRow, { borderBottomWidth: 0, paddingBottom: 0 }]}>
          <Text style={[styles.detailLabel, { fontWeight: '800', color: '#0a1628' }]}>Grand Total</Text>
          <Text style={[styles.detailValue, { fontWeight: '800', color: '#1e56a0', fontSize: 18 }]}>
            ₹{item.grandTotal?.toLocaleString('en-IN')}
          </Text>
        </View>

        {item.customerNotes && (
          <View style={styles.noteBadge}>
            <Text style={styles.noteText}>💬 Customer: {item.customerNotes}</Text>
          </View>
        )}

        {item.status === 'REJECTED' && (
          <View style={[styles.noteBadge, { backgroundColor: '#fee2e2' }]}>
            <Text style={[styles.noteText, { color: '#dc2626' }]}>Customer rejected. Please revise and resubmit.</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.title}>My BOMs</Text>
      <Text style={styles.subtitle}>{boms.length} submissions</Text>

      {loading ? (
        <ActivityIndicator color="#1e56a0" size="large" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={boms}
          keyExtractor={(item) => item._id}
          renderItem={renderBOM}
          contentContainerStyle={{ paddingBottom: 20 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#1e56a0']} />}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📋</Text>
              <Text style={styles.emptyTitle}>No BOMs Yet</Text>
              <Text style={styles.emptySub}>Submit your first BOM from a job detail screen</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4f8', padding: 20, paddingTop: 50 },
  header: { marginBottom: 16 },
  backText: { color: '#1e56a0', fontWeight: '700', fontSize: 15 },
  title: { fontSize: 26, fontWeight: '800', color: '#0a1628', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#94a3b8', fontWeight: '600', marginBottom: 20 },
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
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  bomId: { fontSize: 15, fontWeight: '700', color: '#0a1628', fontFamily: 'monospace' },
  bomDate: { fontSize: 12, color: '#94a3b8', marginTop: 2 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, gap: 4 },
  statusText: { fontSize: 12, fontWeight: '700' },
  divider: { height: 1, backgroundColor: '#f1f5f9', marginVertical: 12 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#f8fafc' },
  detailLabel: { fontSize: 13, color: '#64748b', fontWeight: '500' },
  detailValue: { fontSize: 14, color: '#334155', fontWeight: '600' },
  noteBadge: { backgroundColor: '#f0f4f8', borderRadius: 10, padding: 12, marginTop: 12 },
  noteText: { fontSize: 13, color: '#334155', lineHeight: 18 },
  emptyState: { alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#334155', marginBottom: 4 },
  emptySub: { fontSize: 13, color: '#94a3b8' },
});
