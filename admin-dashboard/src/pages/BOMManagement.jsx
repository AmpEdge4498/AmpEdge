import React, { useEffect, useState } from 'react';
import { ClipboardList, Brain, TrendingUp, BarChart3, Package, Users, ChevronDown, ChevronUp, Sparkles, ShoppingCart, RefreshCw, Check, X, Filter, Calendar } from 'lucide-react';
import api from '../lib/api';

export default function BOMManagement() {
  const [boms, setBoms] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [expandedBOM, setExpandedBOM] = useState(null);
  const [filter, setFilter] = useState('ALL');
  const [actionLoading, setActionLoading] = useState(null);

  // FIX: BUG-021 — Advanced filters
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [techFilter, setTechFilter] = useState('');

  // FIX: BUG-013 — Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchBOMs();
    fetchAnalytics();
  }, [page, filter, dateFrom, dateTo]);

  const fetchBOMs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', 20);
      if (filter !== 'ALL') params.append('status', filter);
      if (dateFrom) params.append('dateFrom', dateFrom);
      if (dateTo) params.append('dateTo', dateTo);

      const res = await api.get(`/bom/admin/all?${params.toString()}`);
      if (res.data.success) {
        setBoms(res.data.data);
        setTotalPages(res.data.totalPages || 1);
        setTotal(res.data.total || 0);
      }
    } catch (e) {
      console.log('BOM fetch error', e);
      setBoms([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await api.get('/bom/admin/analytics');
      if (res.data.success) setAnalytics(res.data.data);
    } catch (e) {
      console.log('Analytics error', e);
      // FIX: BUG-019 — show null instead of fake data
      setAnalytics(null);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  // FIX: BUG-020 — Admin approve/reject actions
  const handleAdminAction = async (bomId, action) => {
    if (!window.confirm(`Are you sure you want to ${action} this BOM?`)) return;

    setActionLoading(bomId);
    try {
      const notes = window.prompt(`Add ${action} notes (optional):`);
      await api.put(`/bom/admin/${bomId}/${action}`, {
        adminNotes: notes || ''
      });
      fetchBOMs();
      fetchAnalytics();
    } catch (e) {
      alert(`Failed to ${action} BOM: ${e.response?.data?.error || e.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status) => {
    const map = {
      'APPROVED': 'badge-green',
      'SUBMITTED': 'badge-blue',
      'DRAFT': 'badge-amber',
      'REJECTED': 'badge-red',
    };
    return map[status] || 'badge-gray';
  };

  const getTierStyle = (tier) => {
    const map = {
      BUDGET: { bg: '#dcfce7', color: '#15803d', label: '💰 Budget' },
      MID_RANGE: { bg: '#dbeafe', color: '#1e40af', label: '⭐ Mid-Range' },
      PREMIUM: { bg: '#fef3c7', color: '#92400e', label: '👑 Premium' },
    };
    return map[tier] || map.MID_RANGE;
  };

  return (
    <div>
      {/* Page Header */}
      <div className="animate-fade-in-up" style={{ marginBottom: 28 }}>
        <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 42,
            height: 42,
            borderRadius: 12,
            background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Brain size={22} color="white" />
          </div>
          BOM & AI Suggestions
        </h1>
        <p className="page-subtitle">
          Track technician BOMs, AI brand suggestions, and customer product selections
        </p>
      </div>

      {/* Analytics Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 16,
        marginBottom: 28,
      }}>
        {[
          {
            title: 'Total BOMs',
            value: total || 0,
            icon: ClipboardList,
            gradient: 'linear-gradient(135deg, #1e56a0, #2979ff)',
            sub: `${analytics?.statusBreakdown?.SUBMITTED || 0} pending review`
          },
          {
            title: 'AI Suggestions',
            value: analytics?.totalSuggestions || 0,
            icon: Sparkles,
            gradient: 'linear-gradient(135deg, #7c3aed, #a855f7)',
            sub: `${analytics?.avgConfidenceOfSelected || 0}% avg confidence`
          },
          {
            title: 'Conversion Rate',
            value: `${analytics?.conversionRate || 0}%`,
            icon: TrendingUp,
            gradient: 'linear-gradient(135deg, #059669, #10b981)',
            sub: `${analytics?.totalSelections || 0} products selected`
          },
          {
            title: 'Approved BOMs',
            value: analytics?.statusBreakdown?.APPROVED || 0,
            icon: Package,
            gradient: 'linear-gradient(135deg, #ea580c, #f97316)',
            sub: `${analytics?.statusBreakdown?.REJECTED || 0} rejected`
          },
        ].map((card, idx) => (
          <div
            key={idx}
            className={`stat-card animate-fade-in-up stagger-${idx + 1}`}
            style={{ opacity: 0 }}
          >
            <div className="stat-icon-wrap" style={{ background: card.gradient }}>
              <card.icon size={20} />
            </div>
            <div style={{ flex: 1 }}>
              <p className="stat-label">{card.title}</p>
              <h3 className="stat-value">{card.value}</h3>
              <p style={{ fontSize: 12, color: '#94a3b8', margin: '4px 0 0' }}>{card.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Grid: BOM Table + Analytics Sidebar */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gap: 20,
      }}>
        {/* BOM Table */}
        <div className="data-table-wrap animate-fade-in-up stagger-5" style={{ opacity: 0 }}>
          <div className="data-table-header">
            <h2 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <ClipboardList size={18} />
              All BOMs
              <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 400, marginLeft: 4 }}>
                ({total})
              </span>
            </h2>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
              {['ALL', 'DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED'].map(f => (
                <button
                  key={f}
                  onClick={() => { setFilter(f); setPage(1); }}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 8,
                    border: 'none',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                    background: filter === f ? '#1e56a0' : '#f1f5f9',
                    color: filter === f ? '#fff' : '#64748b',
                    transition: 'all 0.2s',
                  }}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* FIX: BUG-021 — Advanced Filters */}
          <div style={{
            display: 'flex',
            gap: 10,
            padding: '12px 20px',
            borderBottom: '1px solid #f1f5f9',
            alignItems: 'center',
            flexWrap: 'wrap',
          }}>
            <Filter size={14} color="#94a3b8" />
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
              placeholder="From date"
              style={{
                padding: '6px 10px',
                borderRadius: 8,
                border: '1px solid #e2e8f0',
                fontSize: 12,
                color: '#334155',
                background: '#f8fafc',
              }}
            />
            <span style={{ fontSize: 12, color: '#94a3b8' }}>to</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
              placeholder="To date"
              style={{
                padding: '6px 10px',
                borderRadius: 8,
                border: '1px solid #e2e8f0',
                fontSize: 12,
                color: '#334155',
                background: '#f8fafc',
              }}
            />
            {(dateFrom || dateTo) && (
              <button
                onClick={() => { setDateFrom(''); setDateTo(''); setPage(1); }}
                style={{
                  padding: '6px 10px',
                  borderRadius: 8,
                  border: 'none',
                  fontSize: 11,
                  cursor: 'pointer',
                  background: '#fee2e2',
                  color: '#dc2626',
                  fontWeight: 600,
                }}
              >
                Clear Dates
              </button>
            )}
          </div>

          {loading ? (
            <div style={{ padding: 40, textAlign: 'center' }}>
              <div className="skeleton" style={{ height: 20, width: '60%', margin: '10px auto' }} />
              <div className="skeleton" style={{ height: 20, width: '80%', margin: '10px auto' }} />
              <div className="skeleton" style={{ height: 20, width: '70%', margin: '10px auto' }} />
            </div>
          ) : boms.length === 0 ? (
            <div style={{ padding: 60, textAlign: 'center', color: '#94a3b8' }}>
              <ClipboardList size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
              <p style={{ fontWeight: 600 }}>No BOMs found</p>
              <p style={{ fontSize: 13 }}>BOMs will appear here when technicians submit them</p>
            </div>
          ) : (
            <>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>BOM ID</th>
                    <th>Technician</th>
                    <th>Items</th>
                    <th>AI Suggestions</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {boms.map((bom, idx) => (
                    <React.Fragment key={bom._id}>
                      <tr
                        style={{ cursor: 'pointer' }}
                        onClick={() => setExpandedBOM(expandedBOM === bom._id ? null : bom._id)}
                      >
                        <td>
                          <code style={{
                            fontSize: 12,
                            fontWeight: 700,
                            color: '#1e56a0',
                            background: '#eff6ff',
                            padding: '2px 8px',
                            borderRadius: 6,
                          }}>
                            #{bom._id?.slice(-6).toUpperCase()}
                          </code>
                        </td>
                        <td>
                          <p style={{ fontWeight: 600, color: '#0a1628', margin: 0, fontSize: 13 }}>
                            {bom.technicianId?.name || 'Unknown'}
                          </p>
                          <p style={{ fontSize: 11, color: '#94a3b8', margin: '2px 0 0' }}>
                            {bom.technicianId?.phone || '—'}
                          </p>
                        </td>
                        <td style={{ fontWeight: 600 }}>{bom.stats?.totalItems || bom.items?.length}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Sparkles size={14} color="#7c3aed" />
                            <span style={{ fontWeight: 600, color: '#7c3aed' }}>
                              {bom.stats?.itemsWithSuggestions || 0}
                            </span>
                            {bom.stats?.conversionRate > 0 && (
                              <span style={{
                                fontSize: 11,
                                color: '#059669',
                                fontWeight: 700,
                                background: '#dcfce7',
                                padding: '1px 6px',
                                borderRadius: 4,
                              }}>
                                {bom.stats.conversionRate}%
                              </span>
                            )}
                          </div>
                        </td>
                        <td style={{ fontWeight: 700, color: '#0a1628' }}>
                          ₹{bom.grandTotal?.toLocaleString('en-IN')}
                        </td>
                        <td>
                          <span className={`badge ${getStatusBadge(bom.status)}`}>{bom.status}</span>
                        </td>
                        {/* FIX: BUG-020 — Admin Approve/Reject actions */}
                        <td onClick={(e) => e.stopPropagation()}>
                          {bom.status === 'SUBMITTED' ? (
                            <div style={{ display: 'flex', gap: 4 }}>
                              <button
                                onClick={() => handleAdminAction(bom._id, 'approve')}
                                disabled={actionLoading === bom._id}
                                style={{
                                  padding: '5px 8px',
                                  borderRadius: 6,
                                  border: 'none',
                                  background: '#dcfce7',
                                  color: '#15803d',
                                  cursor: 'pointer',
                                  fontSize: 11,
                                  fontWeight: 700,
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 3,
                                  opacity: actionLoading === bom._id ? 0.5 : 1,
                                }}
                              >
                                <Check size={12} /> Approve
                              </button>
                              <button
                                onClick={() => handleAdminAction(bom._id, 'reject')}
                                disabled={actionLoading === bom._id}
                                style={{
                                  padding: '5px 8px',
                                  borderRadius: 6,
                                  border: 'none',
                                  background: '#fee2e2',
                                  color: '#dc2626',
                                  cursor: 'pointer',
                                  fontSize: 11,
                                  fontWeight: 700,
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 3,
                                  opacity: actionLoading === bom._id ? 0.5 : 1,
                                }}
                              >
                                <X size={12} /> Reject
                              </button>
                            </div>
                          ) : (
                            <span style={{ fontSize: 11, color: '#94a3b8' }}>—</span>
                          )}
                        </td>
                      </tr>

                      {/* Expanded Row — Item Details with AI Suggestions */}
                      {expandedBOM === bom._id && (
                        <tr>
                          <td colSpan="7" style={{ padding: 0 }}>
                            <div style={{
                              background: '#f8fafc',
                              padding: 20,
                              borderTop: '2px solid #e2e8f0',
                            }}>
                              {/* Customer Info */}
                              {bom.customerId && (
                                <div style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 10,
                                  marginBottom: 16,
                                  padding: '10px 14px',
                                  background: '#eff6ff',
                                  borderRadius: 10,
                                }}>
                                  <Users size={16} color="#1e56a0" />
                                  <span style={{ fontSize: 13, fontWeight: 600, color: '#1e56a0' }}>
                                    Customer: {bom.customerId?.name || 'N/A'} ({bom.customerId?.phone || '—'})
                                  </span>
                                </div>
                              )}

                              {/* Admin Notes */}
                              {bom.adminNotes && (
                                <div style={{
                                  padding: '10px 14px',
                                  background: '#fef3c7',
                                  borderRadius: 10,
                                  marginBottom: 12,
                                  fontSize: 12,
                                  color: '#92400e',
                                }}>
                                  👑 <strong>Admin Notes:</strong> {bom.adminNotes}
                                </div>
                              )}

                              {/* Items Grid */}
                              <div style={{ display: 'grid', gap: 12 }}>
                                {bom.items?.map((item, iIdx) => (
                                  <div key={iIdx} style={{
                                    background: 'white',
                                    borderRadius: 14,
                                    padding: 16,
                                    border: '1px solid #e2e8f0',
                                  }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                                      <div>
                                        <p style={{ fontWeight: 700, color: '#0a1628', margin: 0, fontSize: 14 }}>
                                          {item.name}
                                        </p>
                                        <p style={{ fontSize: 12, color: '#64748b', margin: '2px 0' }}>
                                          {item.quantity} {item.unit} × ₹{item.unitPrice} = ₹{item.totalPrice?.toLocaleString('en-IN')}
                                        </p>
                                        {item.specification && (
                                          <p style={{ fontSize: 11, color: '#6366f1', margin: '2px 0', fontStyle: 'italic' }}>
                                            📐 {item.specification}
                                          </p>
                                        )}
                                      </div>
                                      {item.category && item.category !== 'OTHER' && (
                                        <span style={{
                                          fontSize: 11,
                                          fontWeight: 600,
                                          color: '#64748b',
                                          background: '#f1f5f9',
                                          padding: '3px 8px',
                                          borderRadius: 6,
                                        }}>
                                          {item.category.replace(/_/g, ' ')}
                                        </span>
                                      )}
                                    </div>

                                    {/* AI Suggestions */}
                                    {item.aiSuggestions?.length > 0 && (
                                      <div style={{
                                        borderTop: '1px solid #f1f5f9',
                                        paddingTop: 10,
                                        marginTop: 4,
                                      }}>
                                        <p style={{ fontSize: 12, fontWeight: 700, color: '#7c3aed', marginBottom: 8 }}>
                                          🧠 AI Suggestions ({item.aiSuggestions.length})
                                        </p>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                          {item.aiSuggestions.map((s, sIdx) => {
                                            const tierStyle = getTierStyle(s.tier);
                                            const isSelected = item.selectedProductId &&
                                              (item.selectedProductId._id || item.selectedProductId)?.toString() ===
                                              (s.productId?._id || s.productId)?.toString();
                                            return (
                                              <div key={sIdx} style={{
                                                padding: '8px 12px',
                                                background: isSelected ? '#eff6ff' : '#fff',
                                                border: `2px solid ${isSelected ? '#1e56a0' : '#e2e8f0'}`,
                                                borderRadius: 10,
                                                minWidth: 180,
                                                flex: '1 1 180px',
                                              }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                                                  {isSelected && (
                                                    <span style={{ fontSize: 14 }}>✅</span>
                                                  )}
                                                  <span style={{ fontSize: 13, fontWeight: 600, color: '#0a1628' }}>
                                                    {s.productName}
                                                  </span>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                                                  <span style={{
                                                    fontSize: 10,
                                                    fontWeight: 700,
                                                    color: tierStyle.color,
                                                    background: tierStyle.bg,
                                                    padding: '2px 6px',
                                                    borderRadius: 4,
                                                  }}>
                                                    {tierStyle.label}
                                                  </span>
                                                  <span style={{ fontSize: 12, fontWeight: 700, color: '#0a1628' }}>
                                                    ₹{s.price?.toLocaleString('en-IN')}
                                                  </span>
                                                  <span style={{ fontSize: 10, color: '#94a3b8' }}>
                                                    {Math.round(s.confidenceScore * 100)}% match
                                                  </span>
                                                </div>
                                              </div>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>

                              {/* BOM Notes */}
                              {(bom.technicianNotes || bom.customerNotes) && (
                                <div style={{
                                  marginTop: 12,
                                  padding: 12,
                                  background: '#f0f4f8',
                                  borderRadius: 10,
                                }}>
                                  {bom.technicianNotes && (
                                    <p style={{ fontSize: 12, color: '#334155', margin: '0 0 4px' }}>
                                      🔧 <strong>Tech:</strong> {bom.technicianNotes}
                                    </p>
                                  )}
                                  {bom.customerNotes && (
                                    <p style={{ fontSize: 12, color: '#334155', margin: 0 }}>
                                      👤 <strong>Customer:</strong> {bom.customerNotes}
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: 8,
                  padding: '16px 0',
                }}>
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page <= 1}
                    style={{
                      padding: '6px 14px',
                      borderRadius: 8,
                      border: '1px solid #e2e8f0',
                      background: page <= 1 ? '#f8fafc' : '#fff',
                      color: page <= 1 ? '#94a3b8' : '#334155',
                      cursor: page <= 1 ? 'default' : 'pointer',
                      fontSize: 13,
                      fontWeight: 600,
                    }}
                  >
                    ← Prev
                  </button>
                  <span style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>
                    Page {page} of {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page >= totalPages}
                    style={{
                      padding: '6px 14px',
                      borderRadius: 8,
                      border: '1px solid #e2e8f0',
                      background: page >= totalPages ? '#f8fafc' : '#fff',
                      color: page >= totalPages ? '#94a3b8' : '#334155',
                      cursor: page >= totalPages ? 'default' : 'pointer',
                      fontSize: 13,
                      fontWeight: 600,
                    }}
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Analytics Sidebar */}
        <div className="animate-fade-in-up stagger-5" style={{ opacity: 0 }}>
          {/* Popular Brands */}
          <div style={{
            background: 'white',
            borderRadius: 20,
            padding: 24,
            border: '1px solid rgba(30, 86, 160, 0.06)',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
            marginBottom: 20,
          }}>
            <h3 style={{
              fontFamily: '"Plus Jakarta Sans", sans-serif',
              fontSize: 16,
              fontWeight: 700,
              color: '#0a1628',
              marginBottom: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}>
              <BarChart3 size={18} color="#7c3aed" />
              Most Selected Brands
            </h3>
            {analytics?.popularBrands?.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {analytics.popularBrands.slice(0, 5).map((b, idx) => {
                  const maxCount = analytics.popularBrands[0]?.count || 1;
                  return (
                    <div key={idx}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: 4,
                      }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>
                          {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '  '} {b.brand}
                        </span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#7c3aed' }}>
                          {b.count}
                        </span>
                      </div>
                      <div style={{
                        height: 6,
                        background: '#f1f5f9',
                        borderRadius: 3,
                        overflow: 'hidden',
                      }}>
                        <div style={{
                          width: `${(b.count / maxCount) * 100}%`,
                          height: '100%',
                          background: 'linear-gradient(90deg, #7c3aed, #a855f7)',
                          borderRadius: 3,
                          transition: 'width 1s ease',
                        }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p style={{ fontSize: 13, color: '#94a3b8', textAlign: 'center', padding: 20 }}>
                No selection data yet
              </p>
            )}
          </div>

          {/* Top Categories */}
          <div style={{
            background: 'white',
            borderRadius: 20,
            padding: 24,
            border: '1px solid rgba(30, 86, 160, 0.06)',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
            marginBottom: 20,
          }}>
            <h3 style={{
              fontFamily: '"Plus Jakarta Sans", sans-serif',
              fontSize: 16,
              fontWeight: 700,
              color: '#0a1628',
              marginBottom: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}>
              <Package size={18} color="#ea580c" />
              Top BOM Categories
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {analytics?.topCategories?.length > 0 ? (
                analytics.topCategories.map((c, idx) => (
                  <div key={idx} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px 14px',
                    background: '#f8fafc',
                    borderRadius: 10,
                  }}>
                    <span style={{ fontSize: 13, fontWeight: 500, color: '#334155' }}>
                      {c.category?.replace(/_/g, ' ') || 'Other'}
                    </span>
                    <span style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: '#ea580c',
                      background: '#fff7ed',
                      padding: '2px 8px',
                      borderRadius: 6,
                    }}>
                      {c.count}
                    </span>
                  </div>
                ))
              ) : (
                <p style={{ fontSize: 13, color: '#94a3b8', textAlign: 'center', padding: 12 }}>
                  No category data yet
                </p>
              )}
            </div>
          </div>

          {/* AI Performance Card */}
          <div style={{
            background: 'linear-gradient(135deg, #0a1628, #1e56a0)',
            borderRadius: 20,
            padding: 24,
            color: 'white',
          }}>
            <h3 style={{
              fontSize: 16,
              fontWeight: 700,
              marginBottom: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}>
              <Brain size={18} />
              AI Engine Performance
            </h3>
            {analytics ? (
              [
                { label: 'Conversion Rate', value: `${analytics.conversionRate || 0}%`, color: '#22c55e' },
                { label: 'Avg Confidence', value: `${analytics.avgConfidenceOfSelected || 0}%`, color: '#3b82f6' },
                { label: 'Total Suggestions', value: analytics.totalSuggestions || 0, color: '#a855f7' },
                { label: 'Products Selected', value: analytics.totalSelections || 0, color: '#f59e0b' },
              ].map((item, idx) => (
                <div key={idx} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 0',
                  borderBottom: idx < 3 ? '1px solid rgba(255,255,255,0.08)' : 'none',
                }}>
                  <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>{item.label}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: item.color }}>{item.value}</span>
                </div>
              ))
            ) : (
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', textAlign: 'center', padding: 12 }}>
                No analytics data yet
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
