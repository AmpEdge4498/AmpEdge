import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Linking, StyleSheet } from 'react-native';
import apiClient from '../../services/api';

export default function JobDetail({ route, navigation }) {
  const { booking } = route.params;
  const [job, setJob] = useState(booking);
  const [loading, setLoading] = useState(false);
  const [bom, setBom] = useState(null);
  const [bomLoading, setBomLoading] = useState(true);

  useEffect(() => {
    fetchJobDetail();
    fetchBOM();
  }, []);

  const fetchJobDetail = async () => {
    try {
      const res = await apiClient.get(`/bookings/${booking._id}`);
      if (res.data.success) setJob(res.data.data);
    } catch (e) {
      console.log('Error fetching detail', e);
    }
  };

  const fetchBOM = async () => {
    try {
      const res = await apiClient.get(`/bom/booking/${booking._id}`);
      if (res.data.success) setBom(res.data.data);
    } catch (e) {
      // No BOM yet — that's fine
    } finally {
      setBomLoading(false);
    }
  };

  const handleStatusUpdate = async (status) => {
    setLoading(true);
    try {
      const res = await apiClient.put(`/bookings/${job._id}`, { status });
      if (res.data.success) {
        Alert.alert('Updated', `Status changed to ${status.replace(/_/g, ' ')}`);
        setJob({ ...job, status });
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  const openMaps = () => {
    const { lat, lng } = job.serviceAddress || {};
    if (lat && lng) {
      Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`);
    } else {
      Alert.alert('No location', 'GPS coordinates not available');
    }
  };

  const getStatusColor = (status) => {
    const map = {
      PENDING: '#f59e0b', ACCEPTED: '#3b82f6', ON_THE_WAY: '#6366f1',
      IN_PROGRESS: '#0891b2', BOM_PENDING: '#8b5cf6', BOM_SUBMITTED: '#a855f7',
      BOM_APPROVED: '#22c55e', COMPLETED: '#10b981', CANCELLED: '#ef4444',
    };
    return map[status] || '#64748b';
  };

  const getStatusLabel = (s) => s?.replace(/_/g, ' ');
  const statusColor = getStatusColor(job.status);
  const isActive = ['ACCEPTED', 'ON_THE_WAY', 'IN_PROGRESS', 'BOM_PENDING', 'BOM_SUBMITTED', 'BOM_APPROVED'].includes(job.status);

  return (
    <ScrollView style={styles.container}>
      {/* Back + Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <View style={[styles.statusPill, { backgroundColor: statusColor + '18' }]}>
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          <Text style={[styles.statusLabel, { color: statusColor }]}>{getStatusLabel(job.status)}</Text>
        </View>
      </View>

      <Text style={styles.title}>{job.serviceId?.name || 'Service'}</Text>
      <Text style={styles.category}>{job.serviceId?.category}</Text>

      {/* Customer Info */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>👤 Customer Details</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Phone</Text>
          <Text style={styles.infoValue}>{job.customerId?.phone || 'N/A'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Name</Text>
          <Text style={styles.infoValue}>{job.customerId?.name || 'Customer'}</Text>
        </View>
      </View>

      {/* Address */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>📍 Service Address</Text>
        <Text style={styles.addressText}>{job.serviceAddress?.addressText || 'Not provided'}</Text>
        <TouchableOpacity style={styles.mapBtn} onPress={openMaps}>
          <Text style={styles.mapBtnText}>🗺️ Open in Maps</Text>
        </TouchableOpacity>
      </View>

      {/* Schedule & Pricing */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>💰 Pricing & Schedule</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Scheduled</Text>
          <Text style={styles.infoValue}>
            {job.scheduledTime ? new Date(job.scheduledTime).toLocaleString('en-IN') : 'TBD'}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Base Price</Text>
          <Text style={styles.infoValue}>₹{job.pricing?.basePrice}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Total</Text>
          <Text style={[styles.infoValue, { fontWeight: '800', color: '#0a1628', fontSize: 18 }]}>
            ₹{job.pricing?.totalPrice?.toLocaleString('en-IN')}
          </Text>
        </View>
      </View>

      {/* BOM Status */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>📋 Bill of Materials</Text>
        {bomLoading ? (
          <ActivityIndicator color="#1e56a0" />
        ) : bom ? (
          <View>
            <View style={[styles.bomStatusBadge, { backgroundColor: getStatusColor(bom.status === 'APPROVED' ? 'COMPLETED' : bom.status === 'REJECTED' ? 'CANCELLED' : 'BOM_SUBMITTED') + '18' }]}>
              <Text style={[styles.bomStatusText, { color: getStatusColor(bom.status === 'APPROVED' ? 'COMPLETED' : bom.status === 'REJECTED' ? 'CANCELLED' : 'BOM_SUBMITTED') }]}>
                BOM {bom.status}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Items</Text>
              <Text style={styles.infoValue}>{bom.items?.length} materials</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Material Cost</Text>
              <Text style={styles.infoValue}>₹{bom.totalMaterialCost}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Labor Charge</Text>
              <Text style={styles.infoValue}>₹{bom.laborCharge}</Text>
            </View>
            <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
              <Text style={[styles.infoLabel, { fontWeight: '800' }]}>Grand Total</Text>
              <Text style={[styles.infoValue, { fontWeight: '800', color: '#1e56a0', fontSize: 18 }]}>
                ₹{bom.grandTotal}
              </Text>
            </View>
            {(bom.status === 'DRAFT' || bom.status === 'REJECTED') && (
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: '#1e56a0' }]}
                onPress={() => navigation.navigate('BOMSubmission', { booking: job, existingBOM: bom })}
              >
                <Text style={styles.actionBtnText}>✏️ Edit & Resubmit BOM</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View>
            <Text style={styles.noBomText}>No BOM submitted yet</Text>
            {isActive && (
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: '#1e56a0' }]}
                onPress={() => navigation.navigate('BOMSubmission', { booking: job })}
              >
                <Text style={styles.actionBtnText}>📋 Submit BOM</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {/* Action Buttons */}
      {isActive && (
        <View style={styles.bottomActions}>
          {job.status === 'ACCEPTED' && (
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: '#6366f1' }]}
              onPress={() => handleStatusUpdate('ON_THE_WAY')}
              disabled={loading}
            >
              <Text style={styles.actionBtnText}>{loading ? 'Updating...' : '🚗 On The Way'}</Text>
            </TouchableOpacity>
          )}
          {job.status === 'ON_THE_WAY' && (
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: '#0891b2' }]}
              onPress={() => handleStatusUpdate('IN_PROGRESS')}
              disabled={loading}
            >
              <Text style={styles.actionBtnText}>{loading ? 'Updating...' : '🔧 Start Work'}</Text>
            </TouchableOpacity>
          )}
          {(job.status === 'IN_PROGRESS' || job.status === 'BOM_APPROVED') && (
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: '#10b981' }]}
              onPress={() => handleStatusUpdate('COMPLETED')}
              disabled={loading}
            >
              <Text style={styles.actionBtnText}>{loading ? 'Updating...' : '✅ Mark Complete'}</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: '#1976d2' }]}
            onPress={() => navigation.navigate('LiveTracking', { booking: job })}
          >
            <Text style={styles.actionBtnText}>📍 Navigate</Text>
          </TouchableOpacity>
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
  statusPill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, gap: 6 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusLabel: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },
  title: { fontSize: 26, fontWeight: '800', color: '#0a1628', marginBottom: 4 },
  category: { fontSize: 14, color: '#94a3b8', fontWeight: '600', marginBottom: 20 },
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
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  infoLabel: { fontSize: 13, color: '#64748b', fontWeight: '500' },
  infoValue: { fontSize: 14, color: '#334155', fontWeight: '600' },
  addressText: { fontSize: 14, color: '#334155', lineHeight: 20, marginBottom: 12 },
  mapBtn: { backgroundColor: 'rgba(30, 86, 160, 0.08)', padding: 12, borderRadius: 12, alignItems: 'center' },
  mapBtnText: { color: '#1e56a0', fontWeight: '700', fontSize: 14 },
  bomStatusBadge: { alignSelf: 'flex-start', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 10, marginBottom: 12 },
  bomStatusText: { fontSize: 13, fontWeight: '700' },
  noBomText: { color: '#94a3b8', fontSize: 14, marginBottom: 12 },
  bottomActions: { gap: 10 },
  actionBtn: { paddingVertical: 16, borderRadius: 14, alignItems: 'center' },
  actionBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
