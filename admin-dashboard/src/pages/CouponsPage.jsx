import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Tag, Percent } from 'lucide-react';
import api from '../lib/api';

export default function CouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [form, setForm] = useState({
    code: '', discountType: 'PERCENTAGE', discountValue: '', minOrderValue: '0', maxDiscount: '',
    validUntil: '', usageLimit: '100', isActive: true
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const res = await api.get('/coupons');
      setCoupons(res.data.data);
    } catch (e) {
      console.log('Error fetching coupons', e);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditingCoupon(null);
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);
    setForm({
      code: '', discountType: 'PERCENTAGE', discountValue: '', minOrderValue: '0', maxDiscount: '',
      validUntil: futureDate.toISOString().split('T')[0], usageLimit: '100', isActive: true
    });
    setShowModal(true);
  };

  const openEdit = (coupon) => {
    setEditingCoupon(coupon);
    setForm({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue.toString(),
      minOrderValue: coupon.minOrderValue?.toString() || '0',
      maxDiscount: coupon.maxDiscount?.toString() || '',
      validUntil: new Date(coupon.validUntil).toISOString().split('T')[0],
      usageLimit: coupon.usageLimit?.toString() || '100',
      isActive: coupon.isActive,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      discountValue: Number(form.discountValue),
      minOrderValue: Number(form.minOrderValue),
      maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : undefined,
      usageLimit: Number(form.usageLimit),
      validUntil: new Date(form.validUntil),
    };
    try {
      if (editingCoupon) {
        await api.put(`/coupons/${editingCoupon._id}`, payload);
      } else {
        await api.post('/coupons', payload);
      }
      setShowModal(false);
      fetchCoupons();
    } catch (err) {
      alert('Failed: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Deactivate this coupon?')) return;
    try {
      await api.delete(`/coupons/${id}`);
      fetchCoupons();
    } catch (e) {
      alert('Failed');
    }
  };

  const isExpired = (date) => new Date(date) < new Date();

  return (
    <div>
      <div className="page-header animate-fade-in-up">
        <div>
          <h1 className="page-title">Coupons Management</h1>
          <p className="page-subtitle">{coupons.length} coupons configured</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <Plus size={18} />
          Create Coupon
        </button>
      </div>

      {/* Coupons Table */}
      <div className="data-table-wrap animate-fade-in-up stagger-1" style={{ opacity: 0 }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Type</th>
              <th>Discount</th>
              <th>Min Order</th>
              <th>Usage</th>
              <th>Valid Until</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 8 }).map((_, j) => (
                    <td key={j}><div className="skeleton" style={{ height: 16, width: `${50 + Math.random() * 40}%` }} /></td>
                  ))}
                </tr>
              ))
            ) : coupons.length === 0 ? (
              <tr>
                <td colSpan="8">
                  <div className="empty-state">
                    <div className="empty-state-icon">🎟️</div>
                    <h3>No Coupons Yet</h3>
                    <p>Create your first coupon to attract customers</p>
                  </div>
                </td>
              </tr>
            ) : (
              coupons.map(coupon => (
                <tr key={coupon._id}>
                  <td>
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                      background: 'linear-gradient(135deg, #1e56a0, #2979ff)',
                      color: 'white',
                      padding: '6px 14px',
                      borderRadius: 8,
                      fontWeight: 700,
                      fontSize: 13,
                      fontFamily: 'monospace',
                      letterSpacing: 1,
                    }}>
                      <Tag size={14} />
                      {coupon.code}
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${coupon.discountType === 'PERCENTAGE' ? 'badge-purple' : 'badge-blue'}`}>
                      {coupon.discountType === 'PERCENTAGE' ? <Percent size={12} /> : null}
                      {coupon.discountType}
                    </span>
                  </td>
                  <td style={{ fontWeight: 700, color: '#0a1628' }}>
                    {coupon.discountType === 'PERCENTAGE' ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`}
                    {coupon.maxDiscount && (
                      <span style={{ fontSize: 11, color: '#94a3b8', display: 'block' }}>
                        max ₹{coupon.maxDiscount}
                      </span>
                    )}
                  </td>
                  <td style={{ color: '#64748b' }}>₹{coupon.minOrderValue}</td>
                  <td>
                    <span style={{ fontWeight: 600, color: '#0a1628' }}>{coupon.usedCount || 0}</span>
                    <span style={{ color: '#94a3b8' }}> / {coupon.usageLimit}</span>
                  </td>
                  <td style={{ fontSize: 13, color: isExpired(coupon.validUntil) ? '#ef4444' : '#64748b' }}>
                    {new Date(coupon.validUntil).toLocaleDateString('en-IN', {
                      day: '2-digit', month: 'short', year: '2-digit'
                    })}
                  </td>
                  <td>
                    {!coupon.isActive || isExpired(coupon.validUntil) ? (
                      <span className="badge badge-red">Inactive</span>
                    ) : (
                      <span className="badge badge-green">Active</span>
                    )}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      <button className="btn-icon" onClick={() => openEdit(coupon)}>
                        <Edit2 size={15} />
                      </button>
                      <button className="btn-icon" onClick={() => handleDelete(coupon._id)}
                        style={{ color: '#ef4444' }}
                        onMouseOver={(e) => { e.currentTarget.style.background = '#fee2e2'; }}
                        onMouseOut={(e) => { e.currentTarget.style.background = '#f1f5f9'; }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingCoupon ? 'Edit Coupon' : 'Create Coupon'}</h3>
              <button className="btn-icon" onClick={() => setShowModal(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Coupon Code</label>
                  <input className="form-input" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} required placeholder="e.g. WELCOME50" style={{ textTransform: 'uppercase', fontFamily: 'monospace', letterSpacing: 2 }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Discount Type</label>
                    <select className="form-select" value={form.discountType} onChange={(e) => setForm({ ...form, discountType: e.target.value })}>
                      <option value="PERCENTAGE">Percentage (%)</option>
                      <option value="FLAT">Flat (₹)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Discount Value</label>
                    <input className="form-input" type="number" value={form.discountValue} onChange={(e) => setForm({ ...form, discountValue: e.target.value })} required placeholder={form.discountType === 'PERCENTAGE' ? '50' : '200'} />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Min Order (₹)</label>
                    <input className="form-input" type="number" value={form.minOrderValue} onChange={(e) => setForm({ ...form, minOrderValue: e.target.value })} />
                  </div>
                  {form.discountType === 'PERCENTAGE' && (
                    <div className="form-group">
                      <label className="form-label">Max Discount (₹)</label>
                      <input className="form-input" type="number" value={form.maxDiscount} onChange={(e) => setForm({ ...form, maxDiscount: e.target.value })} placeholder="250" />
                    </div>
                  )}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Valid Until</label>
                    <input className="form-input" type="date" value={form.validUntil} onChange={(e) => setForm({ ...form, validUntil: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Usage Limit</label>
                    <input className="form-input" type="number" value={form.usageLimit} onChange={(e) => setForm({ ...form, usageLimit: e.target.value })} />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editingCoupon ? 'Save Changes' : 'Create Coupon'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
