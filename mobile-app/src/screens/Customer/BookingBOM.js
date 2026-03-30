import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator, TextInput, StyleSheet } from 'react-native';
import apiClient from '../../services/api';

export default function BookingBOM({ route, navigation }) {
  const { booking } = route.params;
  const [bom, setBom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectNotes, setRejectNotes] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);

  useEffect(() => {
    fetchBOM();
  }, []);

  const fetchBOM = async () => {
    try {
      const res = await apiClient.get(`/bom/booking/${booking._id}`);
      if (res.data.success) setBom(res.data.data);
    } catch (e) {
      console.log('No BOM', e);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    Alert.alert(
      'Approve BOM?',
      `This will add ₹${bom.grandTotal.toLocaleString('en-IN')} to your booking. Continue?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          onPress: async () => {
            setActionLoading(true);
            try {
              await apiClient.put(`/bom/${bom._id}/approve`);
              Alert.alert('Approved! ✅', 'The technician will now proceed with the work.', [
                { text: 'OK', onPress: () => navigation.goBack() }
              ]);
            } catch (e) {
              Alert.alert('Error', e.response?.data?.error || 'Failed to approve');
            } finally {
              setActionLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleReject = async () => {
    setActionLoading(true);
    try {
      await apiClient.put(`/bom/${bom._id}/reject`, { customerNotes: rejectNotes });
      Alert.alert('Rejected', 'The technician will revise the BOM.', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (e) {
      Alert.alert('Error', e.response?.data?.error || 'Failed to reject');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const map = { DRAFT: '#f59e0b', SUBMITTED: '#3b82f6', APPROVED: '#22c55e', REJECTED: '#ef4444' };
    return map[status] || '#64748b';
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator color="#1e56a0" size="large" />
      </View>
    );
  }

  if (!bom) {
    return (
      <View style={styles.container}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={styles.emptyTitle}>No BOM Yet</Text>
          <Text style={styles.emptySub}>The technician hasn't submitted a Bill of Materials yet</Text>
        </View>
      </View>
    );
  }

  const isSubmitted = bom.status === 'SUBMITTED';
  const statusColor = getStatusColor(bom.status);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <View style={[styles.statusPill, { backgroundColor: statusColor + '18' }]}>
          <Text style={[styles.statusLabel, { color: statusColor }]}>{bom.status}</Text>
        </View>
      </View>

      <Text style={styles.title}>Bill of Materials</Text>
      <Text style={styles.subtitle}>{booking.serviceId?.name || 'Service'}</Text>

      {/* BOM Alert */}
      {isSubmitted && (
        <View style={styles.alertCard}>
          <Text style={styles.alertTitle}>⚡ Action Required</Text>
          <Text style={styles.alertText}>
            Your technician has submitted the materials and labor estimate. Please review and approve to proceed.
          </Text>
        </View>
      )}

      {/* Materials */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>📦 Materials ({bom.items?.length})</Text>
        {bom.items?.map((item, idx) => (
          <View key={idx} style={styles.itemRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemMeta}>{item.quantity} {item.unit} × ₹{item.unitPrice}</Text>
            </View>
            <Text style={styles.itemTotal}>₹{item.totalPrice?.toLocaleString('en-IN')}</Text>
          </View>
        ))}
      </View>

      {/* Cost Summary */}
      <View style={[styles.card, { backgroundColor: '#0a1628' }]}>
        <Text style={[styles.cardTitle, { color: 'rgba(255,255,255,0.5)' }]}>💰 Cost Breakdown</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Material Cost</Text>
          <Text style={styles.summaryValue}>₹{bom.totalMaterialCost?.toLocaleString('en-IN')}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Labor Charge</Text>
          <Text style={styles.summaryValue}>₹{bom.laborCharge?.toLocaleString('en-IN')}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Original Service Price</Text>
          <Text style={styles.summaryValue}>₹{booking.pricing?.basePrice?.toLocaleString('en-IN')}</Text>
        </View>
        <View style={[styles.summaryRow, { borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)', paddingTop: 14, marginTop: 6 }]}>
          <Text style={[styles.summaryLabel, { color: '#fff', fontWeight: '800', fontSize: 17 }]}>Total to Pay</Text>
          <Text style={[styles.summaryValue, { color: '#22c55e', fontSize: 26, fontWeight: '800' }]}>
            ₹{((booking.pricing?.basePrice || 0) + bom.grandTotal).toLocaleString('en-IN')}
          </Text>
        </View>
      </View>

      {/* Technician Notes */}
      {bom.technicianNotes && (
        <View style={styles.noteCard}>
          <Text style={styles.noteTitle}>📝 Technician Notes</Text>
          <Text style={styles.noteText}>{bom.technicianNotes}</Text>
        </View>
      )}

      {/* Reject Form */}
      {showRejectForm && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>✏️ Rejection Reason</Text>
          <TextInput
            placeholder="Tell the technician why you're rejecting..."
            style={styles.rejectInput}
            multiline
            value={rejectNotes}
            onChangeText={setRejectNotes}
            placeholderTextColor="#94a3b8"
          />
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TouchableOpacity
              style={[styles.actionBtn, { flex: 1, backgroundColor: '#f1f5f9' }]}
              onPress={() => setShowRejectForm(false)}
            >
              <Text style={[styles.actionBtnText, { color: '#64748b' }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, { flex: 1, backgroundColor: '#ef4444' }]}
              onPress={handleReject}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.actionBtnText}>Send Rejection</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Action Buttons */}
      {isSubmitted && !showRejectForm && (
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: '#22c55e' }]}
            onPress={handleApprove}
            disabled={actionLoading}
          >
            {actionLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.actionBtnText}>✅ Approve BOM</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ef4444' }]}
            onPress={() => setShowRejectForm(true)}
          >
            <Text style={[styles.actionBtnText, { color: '#ef4444' }]}>❌ Reject & Revise</Text>
          </TouchableOpacity>
        </View>
      )}

      {bom.status === 'APPROVED' && (
        <View style={styles.approvedBadge}>
          <Text style={styles.approvedText}>✅ You approved this BOM. Work is in progress.</Text>
        </View>
      )}

      {bom.status === 'REJECTED' && (
        <View style={styles.rejectedBadge}>
          <Text style={styles.rejectedText}>❌ You rejected this BOM. Waiting for technician to revise.</Text>
        </View>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4f8', padding: 20, paddingTop: 50 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  backText: { color: '#1e56a0', fontWeight: '700', fontSize: 15 },
  statusPill: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 10 },
  statusLabel: { fontSize: 12, fontWeight: '700' },
  title: { fontSize: 26, fontWeight: '800', color: '#0a1628', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#94a3b8', fontWeight: '600', marginBottom: 20 },
  alertCard: {
    backgroundColor: '#fef3c7',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  alertTitle: { fontSize: 15, fontWeight: '700', color: '#92400e', marginBottom: 4 },
  alertText: { fontSize: 13, color: '#78350f', lineHeight: 19 },
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
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    gap: 12,
  },
  itemName: { fontSize: 14, fontWeight: '600', color: '#0a1628' },
  itemMeta: { fontSize: 12, color: '#94a3b8', marginTop: 2 },
  itemTotal: { fontSize: 15, fontWeight: '700', color: '#0a1628' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  summaryLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 14 },
  summaryValue: { color: '#fff', fontSize: 15, fontWeight: '600' },
  noteCard: { backgroundColor: '#f0f4f8', borderRadius: 14, padding: 16, marginBottom: 16 },
  noteTitle: { fontSize: 14, fontWeight: '700', color: '#334155', marginBottom: 6 },
  noteText: { fontSize: 13, color: '#64748b', lineHeight: 19 },
  rejectInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    color: '#0a1628',
    height: 80,
    textAlignVertical: 'top',
    marginBottom: 14,
  },
  actions: { gap: 10, marginBottom: 20 },
  actionBtn: { paddingVertical: 18, borderRadius: 16, alignItems: 'center' },
  actionBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  approvedBadge: { backgroundColor: '#dcfce7', borderRadius: 14, padding: 16, marginBottom: 20 },
  approvedText: { color: '#15803d', fontWeight: '600', fontSize: 14, textAlign: 'center' },
  rejectedBadge: { backgroundColor: '#fee2e2', borderRadius: 14, padding: 16, marginBottom: 20 },
  rejectedText: { color: '#dc2626', fontWeight: '600', fontSize: 14, textAlign: 'center' },
  emptyState: { alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#334155', marginBottom: 4 },
  emptySub: { fontSize: 13, color: '#94a3b8', textAlign: 'center', paddingHorizontal: 40 },
});
