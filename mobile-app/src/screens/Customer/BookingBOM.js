import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator, TextInput, StyleSheet } from 'react-native';
import apiClient from '../../services/api';

const TIER_COLORS = {
  BUDGET: { bg: '#dcfce7', text: '#15803d', label: '💰 Budget' },
  MID_RANGE: { bg: '#dbeafe', text: '#1e40af', label: '⭐ Best Value' },
  PREMIUM: { bg: '#fef3c7', text: '#92400e', label: '👑 Premium' },
};

function SuggestionCard({ suggestion, isSelected, onSelect }) {
  const tierStyle = TIER_COLORS[suggestion.tier] || TIER_COLORS.MID_RANGE;
  const isAIRecommended = suggestion.tags?.includes('AI Recommended');
  const isOutOfStock = !suggestion.isAvailable;

  return (
    <TouchableOpacity
      style={[
        styles.suggestionCard,
        isSelected && styles.suggestionCardSelected,
        isAIRecommended && !isSelected && styles.suggestionCardRecommended,
        isOutOfStock && styles.suggestionCardDisabled,
      ]}
      onPress={isOutOfStock ? undefined : onSelect}
      activeOpacity={isOutOfStock ? 1 : 0.7}
      disabled={isOutOfStock}
    >
      {/* AI Recommended Badge */}
      {isAIRecommended && (
        <View style={styles.aiRecommendedBadge}>
          <Text style={styles.aiRecommendedText}>🧠 AI Recommended</Text>
        </View>
      )}

      <View style={styles.suggestionHeader}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.suggestionName, isOutOfStock && { color: '#94a3b8' }]}>{suggestion.productName}</Text>
          <Text style={styles.suggestionBrand}>{suggestion.brand}</Text>
        </View>

        {/* Selection Indicator — hidden for OOS */}
        {!isOutOfStock && (
          <View style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}>
            {isSelected && <View style={styles.radioInner} />}
          </View>
        )}
      </View>

      {/* Tier & Tags */}
      <View style={styles.tagRow}>
        <View style={[styles.tierBadge, { backgroundColor: tierStyle.bg }]}>
          <Text style={[styles.tierText, { color: tierStyle.text }]}>{tierStyle.label}</Text>
        </View>
        {suggestion.tags?.filter(t => t !== 'AI Recommended').map((tag, i) => (
          <View key={i} style={styles.tagChip}>
            <Text style={styles.tagChipText}>{tag}</Text>
          </View>
        ))}
      </View>

      {/* Price & Confidence */}
      <View style={styles.suggestionFooter}>
        <Text style={[styles.suggestionPrice, isOutOfStock && { color: '#94a3b8' }]}>₹{suggestion.price?.toLocaleString('en-IN')}</Text>
        <View style={styles.confidenceBar}>
          <View style={[styles.confidenceFill, { width: `${Math.round(suggestion.confidenceScore * 100)}%` }]} />
        </View>
        <Text style={styles.confidenceText}>{Math.round(suggestion.confidenceScore * 100)}% match</Text>
      </View>

      {/* Match Reason */}
      {suggestion.matchReason && (
        <Text style={styles.matchReason}>💡 {suggestion.matchReason}</Text>
      )}

      {isOutOfStock && (
        <View style={styles.outOfStockBadge}>
          <Text style={styles.outOfStockText}>⚠️ Out of Stock — Not Selectable</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

export default function BookingBOM({ route, navigation }) {
  const { booking } = route.params;
  const [bom, setBom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);
  const [rejectNotes, setRejectNotes] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [selections, setSelections] = useState({}); // { itemIndex: productId }

  useEffect(() => {
    fetchBOM();
  }, []);

  const fetchBOM = async () => {
    try {
      const res = await apiClient.get(`/bom/booking/${booking._id}`);
      if (res.data.success) {
        const bomData = res.data.data;
        setBom(bomData);

        // Pre-fill existing selections
        const existing = {};
        bomData.items?.forEach((item, idx) => {
          if (item.selectedProductId) {
            existing[idx] = typeof item.selectedProductId === 'object'
              ? item.selectedProductId._id
              : item.selectedProductId;
          }
        });
        setSelections(existing);

        // Auto-trigger AI suggestions if none exist
        if (bomData.status === 'SUBMITTED' && !bomData.aiSuggestionsGeneratedAt) {
          generateAISuggestions(bomData._id);
        }
      }
    } catch (e) {
      console.log('No BOM', e);
    } finally {
      setLoading(false);
    }
  };

  const generateAISuggestions = async (bomId) => {
    setAiLoading(true);
    try {
      const res = await apiClient.post(`/bom/${bomId}/ai-suggestions`);
      if (res.data.success) {
        // Re-fetch BOM to get updated suggestions
        const bomRes = await apiClient.get(`/bom/booking/${booking._id}`);
        if (bomRes.data.success) setBom(bomRes.data.data);
      }
    } catch (e) {
      console.log('AI suggestion error', e);
    } finally {
      setAiLoading(false);
    }
  };

  const handleSelectProduct = (itemIndex, productId) => {
    setSelections(prev => ({ ...prev, [itemIndex]: productId }));
  };

  const saveSelections = async () => {
    const selArr = Object.entries(selections).map(([idx, pid]) => ({
      itemIndex: parseInt(idx),
      productId: pid,
    }));

    if (selArr.length === 0) {
      Alert.alert('No Selections', 'Please select at least one product');
      return;
    }

    setActionLoading(true);
    try {
      await apiClient.put(`/bom/${bom._id}/select-products`, { selections: selArr });
      Alert.alert('Selections Saved! ✅', 'Your brand preferences have been recorded.');
      fetchBOM(); // Refresh
    } catch (e) {
      Alert.alert('Error', e.response?.data?.error || 'Failed to save selections');
    } finally {
      setActionLoading(false);
    }
  };

  const handleBuyAll = async () => {
    setCartLoading(true);
    try {
      // First save any pending selections
      const selArr = Object.entries(selections).map(([idx, pid]) => ({
        itemIndex: parseInt(idx),
        productId: pid,
      }));
      if (selArr.length > 0) {
        await apiClient.put(`/bom/${bom._id}/select-products`, { selections: selArr });
      }

      // Then convert to cart
      const res = await apiClient.post('/bom/cart/from-bom', { bomId: bom._id });
      if (res.data.success) {
        Alert.alert(
          '🛒 Added to Cart!',
          `${res.data.data.cartItems.length} items added.\nTotal: ₹${res.data.data.grandTotal?.toLocaleString('en-IN')}`,
          [
            { text: 'Continue Shopping', style: 'cancel' },
            { text: 'Go to Cart', onPress: () => navigation.navigate('CartScreen') },
          ]
        );
      }
    } catch (e) {
      Alert.alert('Error', e.response?.data?.error || 'Failed to add to cart');
    } finally {
      setCartLoading(false);
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
  const hasAnySuggestions = bom.items?.some(item => item.aiSuggestions?.length > 0);
  const selectedCount = Object.keys(selections).length;

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
            Your technician has submitted the materials and labor estimate. Review the AI-suggested brands below, select your preferred products, and approve.
          </Text>
        </View>
      )}

      {/* AI Loading */}
      {aiLoading && (
        <View style={styles.aiLoadingCard}>
          <ActivityIndicator color="#3b82f6" size="small" />
          <Text style={styles.aiLoadingText}>🧠 AI is analyzing your materials and finding the best brands...</Text>
        </View>
      )}

      {/* Materials with AI Suggestions */}
      {bom.items?.map((item, idx) => (
        <View key={idx} style={styles.card}>
          <View style={styles.itemHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemMeta}>
                {item.quantity} {item.unit} × ₹{item.unitPrice} = ₹{item.totalPrice?.toLocaleString('en-IN')}
              </Text>
              {item.specification ? (
                <Text style={styles.itemSpecText}>📐 {item.specification}</Text>
              ) : null}
              {item.category && item.category !== 'OTHER' ? (
                <View style={styles.categoryChip}>
                  <Text style={styles.categoryChipText}>{item.category.replace(/_/g, ' ')}</Text>
                </View>
              ) : null}
            </View>
          </View>

          {/* AI Suggestions for this item */}
          {item.aiSuggestions?.length > 0 && (
            <View style={styles.suggestionsSection}>
              <Text style={styles.suggestionsTitle}>🧠 AI Brand Suggestions</Text>
              {item.aiSuggestions.map((suggestion, sIdx) => (
                <SuggestionCard
                  key={sIdx}
                  suggestion={suggestion}
                  isSelected={selections[idx] === (suggestion.productId?._id || suggestion.productId)?.toString()}
                  onSelect={() => handleSelectProduct(
                    idx,
                    (suggestion.productId?._id || suggestion.productId)?.toString()
                  )}
                />
              ))}
            </View>
          )}

          {item.aiSuggestions?.length === 0 && isSubmitted && !aiLoading && (
            <View style={styles.noSuggestionsCard}>
              <Text style={styles.noSuggestionsText}>No matching products found. Original BOM pricing applies.</Text>
            </View>
          )}
        </View>
      ))}

      {/* Regenerate AI Button */}
      {isSubmitted && (
        <TouchableOpacity
          style={styles.regenerateBtn}
          onPress={() => generateAISuggestions(bom._id)}
          disabled={aiLoading}
        >
          <Text style={styles.regenerateBtnText}>
            {aiLoading ? '🔄 Analyzing...' : '🧠 Regenerate AI Suggestions'}
          </Text>
        </TouchableOpacity>
      )}

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
        {selectedCount > 0 && (
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: '#3b82f6' }]}>Products Selected</Text>
            <Text style={[styles.summaryValue, { color: '#3b82f6' }]}>{selectedCount} of {bom.items?.length}</Text>
          </View>
        )}
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
          {/* Buy All from BOM */}
          {hasAnySuggestions && selectedCount > 0 && (
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: '#7c3aed' }]}
              onPress={handleBuyAll}
              disabled={cartLoading}
            >
              {cartLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.actionBtnText}>🛒 Buy All Selected ({selectedCount} items)</Text>
              )}
            </TouchableOpacity>
          )}

          {/* Save Selections */}
          {hasAnySuggestions && selectedCount > 0 && (
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: '#0ea5e9' }]}
              onPress={saveSelections}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.actionBtnText}>💾 Save Brand Selections</Text>
              )}
            </TouchableOpacity>
          )}

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

  // AI Loading
  aiLoadingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    gap: 12,
  },
  aiLoadingText: { flex: 1, fontSize: 13, color: '#1e40af', fontWeight: '500' },

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

  // Item Header
  itemHeader: { flexDirection: 'row', marginBottom: 4 },
  itemName: { fontSize: 16, fontWeight: '700', color: '#0a1628', marginBottom: 2 },
  itemMeta: { fontSize: 13, color: '#64748b', marginTop: 2 },
  itemSpecText: { fontSize: 12, color: '#6366f1', marginTop: 4, fontStyle: 'italic' },
  categoryChip: {
    alignSelf: 'flex-start',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 6,
  },
  categoryChipText: { fontSize: 11, color: '#64748b', fontWeight: '600' },

  // AI Suggestions Section
  suggestionsSection: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 14,
  },
  suggestionsTitle: { fontSize: 14, fontWeight: '700', color: '#1e40af', marginBottom: 12 },

  // Suggestion Card
  suggestionCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  suggestionCardSelected: {
    borderColor: '#1e56a0',
    backgroundColor: '#eff6ff',
  },
  suggestionCardRecommended: {
    borderColor: '#3b82f6',
    backgroundColor: '#f0f7ff',
  },
  suggestionCardDisabled: {
    opacity: 0.5,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
    backgroundColor: '#f8fafc',
  },
  aiRecommendedBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#dbeafe',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 8,
  },
  aiRecommendedText: { fontSize: 11, color: '#1e40af', fontWeight: '700' },
  suggestionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  suggestionName: { fontSize: 14, fontWeight: '600', color: '#0a1628' },
  suggestionBrand: { fontSize: 12, color: '#64748b', marginTop: 1 },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterSelected: { borderColor: '#1e56a0' },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#1e56a0',
  },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 },
  tierBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  tierText: { fontSize: 11, fontWeight: '700' },
  tagChip: { backgroundColor: '#f1f5f9', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  tagChipText: { fontSize: 10, color: '#64748b', fontWeight: '600' },
  suggestionFooter: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  suggestionPrice: { fontSize: 16, fontWeight: '800', color: '#0a1628' },
  confidenceBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#e2e8f0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  confidenceFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 3,
  },
  confidenceText: { fontSize: 11, color: '#64748b', fontWeight: '600' },
  matchReason: { fontSize: 11, color: '#94a3b8', marginTop: 6, lineHeight: 15 },
  outOfStockBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#fee2e2',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 6,
  },
  outOfStockText: { fontSize: 11, color: '#dc2626', fontWeight: '700' },

  noSuggestionsCard: {
    marginTop: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 12,
  },
  noSuggestionsText: { fontSize: 12, color: '#94a3b8', textAlign: 'center' },

  // Regenerate Button
  regenerateBtn: {
    backgroundColor: '#eff6ff',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  regenerateBtnText: { color: '#1e40af', fontWeight: '700', fontSize: 14 },

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
