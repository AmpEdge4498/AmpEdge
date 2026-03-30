import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, StyleSheet } from 'react-native';
import apiClient from '../../services/api';

export default function BOMSubmission({ route, navigation }) {
  const { booking, existingBOM } = route.params;
  const [items, setItems] = useState(existingBOM?.items || []);
  const [laborCharge, setLaborCharge] = useState(existingBOM?.laborCharge?.toString() || '');
  const [notes, setNotes] = useState(existingBOM?.technicianNotes || '');
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // New item form
  const [newItem, setNewItem] = useState({ name: '', quantity: '1', unitPrice: '' });

  const addItem = () => {
    if (!newItem.name || !newItem.unitPrice) {
      Alert.alert('Required', 'Please enter item name and unit price');
      return;
    }
    const qty = parseInt(newItem.quantity) || 1;
    const price = parseFloat(newItem.unitPrice) || 0;
    setItems([...items, {
      name: newItem.name,
      quantity: qty,
      unitPrice: price,
      totalPrice: qty * price,
      unit: 'pcs',
    }]);
    setNewItem({ name: '', quantity: '1', unitPrice: '' });
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const materialTotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const labor = parseFloat(laborCharge) || 0;
  const grandTotal = materialTotal + labor;

  const saveBOM = async (shouldSubmit = false) => {
    if (items.length === 0) {
      Alert.alert('No Items', 'Add at least one material item');
      return;
    }
    shouldSubmit ? setSubmitting(true) : setSaving(true);
    try {
      let bomId;
      if (existingBOM) {
        const res = await apiClient.put(`/bom/${existingBOM._id}`, {
          items: items.map(i => ({ name: i.name, quantity: i.quantity, unitPrice: i.unitPrice, totalPrice: i.quantity * i.unitPrice, unit: i.unit || 'pcs' })),
          laborCharge: labor,
          technicianNotes: notes,
        });
        bomId = res.data.data._id;
      } else {
        const res = await apiClient.post('/bom', {
          bookingId: booking._id,
          items: items.map(i => ({ name: i.name, quantity: i.quantity, unitPrice: i.unitPrice, unit: i.unit || 'pcs' })),
          laborCharge: labor,
          technicianNotes: notes,
        });
        bomId = res.data.data._id;
      }

      if (shouldSubmit) {
        await apiClient.put(`/bom/${bomId}/submit`);
        Alert.alert('BOM Submitted! ✅', 'The customer will review and approve the materials and pricing.', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        Alert.alert('Saved', 'BOM saved as draft');
      }
    } catch (err) {
      Alert.alert('Error', err.response?.data?.error || 'Failed to save BOM');
    } finally {
      setSaving(false);
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>Bill of Materials</Text>
      <Text style={styles.subtitle}>For: {booking.serviceId?.name || 'Service'}</Text>

      {/* Item List */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>📦 Materials ({items.length})</Text>
        {items.map((item, idx) => (
          <View key={idx} style={styles.itemRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemMeta}>{item.quantity} × ₹{item.unitPrice}</Text>
            </View>
            <Text style={styles.itemTotal}>₹{(item.quantity * item.unitPrice).toLocaleString('en-IN')}</Text>
            <TouchableOpacity style={styles.removeBtn} onPress={() => removeItem(idx)}>
              <Text style={styles.removeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>
        ))}

        {items.length === 0 && (
          <Text style={styles.emptyText}>No materials added yet</Text>
        )}

        {/* Add New Item */}
        <View style={styles.addSection}>
          <Text style={styles.addTitle}>➕ Add Material</Text>
          <TextInput
            placeholder="Material name (e.g., MCB 32A)"
            style={styles.input}
            value={newItem.name}
            onChangeText={(v) => setNewItem({ ...newItem, name: v })}
            placeholderTextColor="#94a3b8"
          />
          <View style={styles.inputRow}>
            <TextInput
              placeholder="Qty"
              style={[styles.input, { flex: 1 }]}
              keyboardType="numeric"
              value={newItem.quantity}
              onChangeText={(v) => setNewItem({ ...newItem, quantity: v })}
              placeholderTextColor="#94a3b8"
            />
            <TextInput
              placeholder="Unit Price ₹"
              style={[styles.input, { flex: 2, marginLeft: 10 }]}
              keyboardType="numeric"
              value={newItem.unitPrice}
              onChangeText={(v) => setNewItem({ ...newItem, unitPrice: v })}
              placeholderTextColor="#94a3b8"
            />
          </View>
          <TouchableOpacity style={styles.addBtn} onPress={addItem}>
            <Text style={styles.addBtnText}>+ Add to List</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Labor Charge */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🔧 Labor Charge</Text>
        <TextInput
          placeholder="Enter labor charge (₹)"
          style={[styles.input, { fontSize: 18, fontWeight: '700' }]}
          keyboardType="numeric"
          value={laborCharge}
          onChangeText={setLaborCharge}
          placeholderTextColor="#94a3b8"
        />
      </View>

      {/* Notes */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>📝 Notes for Customer</Text>
        <TextInput
          placeholder="Any special notes about the work..."
          style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
          multiline
          value={notes}
          onChangeText={setNotes}
          placeholderTextColor="#94a3b8"
        />
      </View>

      {/* Totals Summary */}
      <View style={[styles.card, { backgroundColor: '#0a1628' }]}>
        <Text style={[styles.cardTitle, { color: 'rgba(255,255,255,0.5)' }]}>💰 Price Summary</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Materials ({items.length} items)</Text>
          <Text style={styles.summaryValue}>₹{materialTotal.toLocaleString('en-IN')}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Labor Charge</Text>
          <Text style={styles.summaryValue}>₹{labor.toLocaleString('en-IN')}</Text>
        </View>
        <View style={[styles.summaryRow, { borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)', paddingTop: 12, marginTop: 4 }]}>
          <Text style={[styles.summaryLabel, { color: '#fff', fontWeight: '800', fontSize: 16 }]}>Grand Total</Text>
          <Text style={[styles.summaryValue, { color: '#22c55e', fontSize: 24, fontWeight: '800' }]}>
            ₹{grandTotal.toLocaleString('en-IN')}
          </Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={{ gap: 10, marginBottom: 40 }}>
        <TouchableOpacity
          style={[styles.submitBtn, submitting && { opacity: 0.7 }]}
          onPress={() => saveBOM(true)}
          disabled={submitting || saving}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitBtnText}>📤 Submit BOM to Customer</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.draftBtn, saving && { opacity: 0.7 }]}
          onPress={() => saveBOM(false)}
          disabled={submitting || saving}
        >
          {saving ? (
            <ActivityIndicator color="#1e56a0" />
          ) : (
            <Text style={styles.draftBtnText}>💾 Save as Draft</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4f8', padding: 20, paddingTop: 50 },
  header: { marginBottom: 16 },
  backText: { color: '#1e56a0', fontWeight: '700', fontSize: 15 },
  title: { fontSize: 26, fontWeight: '800', color: '#0a1628', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#94a3b8', fontWeight: '600', marginBottom: 24 },
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
  removeBtn: { width: 28, height: 28, borderRadius: 8, backgroundColor: '#fee2e2', alignItems: 'center', justifyContent: 'center' },
  removeBtnText: { color: '#ef4444', fontWeight: '700', fontSize: 12 },
  emptyText: { color: '#94a3b8', fontSize: 14, textAlign: 'center', paddingVertical: 16 },
  addSection: { marginTop: 16, borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 16 },
  addTitle: { fontSize: 14, fontWeight: '700', color: '#1e56a0', marginBottom: 12 },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: '#0a1628',
    marginBottom: 10,
  },
  inputRow: { flexDirection: 'row' },
  addBtn: { backgroundColor: 'rgba(30, 86, 160, 0.08)', padding: 14, borderRadius: 12, alignItems: 'center' },
  addBtnText: { color: '#1e56a0', fontWeight: '700', fontSize: 14 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  summaryLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 14 },
  summaryValue: { color: '#fff', fontSize: 15, fontWeight: '600' },
  submitBtn: { backgroundColor: '#1e56a0', paddingVertical: 18, borderRadius: 16, alignItems: 'center' },
  submitBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  draftBtn: { backgroundColor: '#fff', paddingVertical: 16, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0' },
  draftBtnText: { color: '#1e56a0', fontWeight: '700', fontSize: 15 },
});
