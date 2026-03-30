import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, X, Zap, Wrench, AlertTriangle, Building2, IndianRupee, Check, DollarSign } from 'lucide-react';
import api from '../lib/api';

const CATEGORY_ICONS = {
  REPAIR: Wrench,
  INSTALLATION: Zap,
  EMERGENCY: AlertTriangle,
  COMMERCIAL: Building2,
};

const CATEGORY_COLORS = {
  REPAIR: { bg: '#dbeafe', color: '#1d4ed8' },
  INSTALLATION: { bg: '#dcfce7', color: '#15803d' },
  EMERGENCY: { bg: '#fee2e2', color: '#dc2626' },
  COMMERCIAL: { bg: '#f3e8ff', color: '#7c3aed' },
};

export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [editingPriceId, setEditingPriceId] = useState(null);
  const [editPriceValue, setEditPriceValue] = useState('');
  const [savingPriceId, setSavingPriceId] = useState(null);
  const [form, setForm] = useState({
    name: '', description: '', category: 'REPAIR', basePrice: '', estimatedDuration: '60', city: 'Delhi', isActive: true
  });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const res = await api.get('/services/admin/all');
      setServices(res.data.data);
    } catch (e) {
      console.log('Error', e);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditingService(null);
    setForm({ name: '', description: '', category: 'REPAIR', basePrice: '', estimatedDuration: '60', city: 'Delhi', isActive: true });
    setShowModal(true);
  };

  const openEdit = (service) => {
    setEditingService(service);
    setForm({
      name: service.name,
      description: service.description,
      category: service.category,
      basePrice: service.basePrice.toString(),
      estimatedDuration: service.estimatedDuration.toString(),
      city: service.city || 'Delhi',
      isActive: service.isActive,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...form, basePrice: Number(form.basePrice), estimatedDuration: Number(form.estimatedDuration) };
    try {
      if (editingService) {
        await api.put(`/services/${editingService._id}`, payload);
      } else {
        await api.post('/services', payload);
      }
      setShowModal(false);
      fetchServices();
    } catch (err) {
      alert('Failed to save service: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Deactivate this service?')) return;
    try {
      await api.delete(`/services/${id}`);
      fetchServices();
    } catch (e) {
      alert('Failed to deactivate');
    }
  };

  const toggleActive = async (service) => {
    try {
      await api.put(`/services/${service._id}`, { isActive: !service.isActive });
      fetchServices();
    } catch (e) {
      alert('Failed to toggle');
    }
  };

  // ===== INLINE PRICE EDIT =====
  const startPriceEdit = (service) => {
    setEditingPriceId(service._id);
    setEditPriceValue(service.basePrice.toString());
  };

  const cancelPriceEdit = () => {
    setEditingPriceId(null);
    setEditPriceValue('');
  };

  const savePriceEdit = async (serviceId) => {
    const newPrice = Number(editPriceValue);
    if (isNaN(newPrice) || newPrice <= 0) {
      alert('Please enter a valid price');
      return;
    }
    setSavingPriceId(serviceId);
    try {
      await api.put(`/services/${serviceId}`, { basePrice: newPrice });
      setEditingPriceId(null);
      setEditPriceValue('');
      fetchServices();
    } catch (err) {
      alert('Failed to update price: ' + (err.response?.data?.error || err.message));
    } finally {
      setSavingPriceId(null);
    }
  };

  const handlePriceKeyDown = (e, serviceId) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      savePriceEdit(serviceId);
    } else if (e.key === 'Escape') {
      cancelPriceEdit();
    }
  };

  const categories = ['ALL', 'REPAIR', 'INSTALLATION', 'EMERGENCY', 'COMMERCIAL'];

  const filtered = services.filter(s => {
    if (categoryFilter !== 'ALL' && s.category !== categoryFilter) return false;
    if (searchTerm && !s.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !s.description?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  return (
    <div>
      <div className="page-header animate-fade-in-up">
        <div>
          <h1 className="page-title">Services & Pricing</h1>
          <p className="page-subtitle">Manage marketplace listings and modify prices</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <Plus size={18} />
          Add Service
        </button>
      </div>

      {/* Search + Filter Row */}
      <div className="animate-fade-in-up stagger-1" style={{
        opacity: 0,
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        marginBottom: 24,
        flexWrap: 'wrap',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          background: 'white',
          borderRadius: 12,
          padding: '10px 18px',
          border: '1px solid #e2e8f0',
          flex: '1 1 260px',
          maxWidth: 360,
        }}>
          <Search size={18} color="#94a3b8" />
          <input
            type="text"
            placeholder="Search services..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ border: 'none', outline: 'none', fontSize: 14, width: '100%', fontFamily: 'inherit', color: '#1a1a2e' }}
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
              <X size={16} />
            </button>
          )}
        </div>

        <div className="filter-tabs">
          {categories.map(c => (
            <button
              key={c}
              className={`filter-tab ${categoryFilter === c ? 'active' : ''}`}
              onClick={() => setCategoryFilter(c)}
            >
              {c === 'ALL' ? 'All' : c}
            </button>
          ))}
        </div>
      </div>

      {/* Price Edit Tip */}
      <div className="animate-fade-in-up stagger-2" style={{
        opacity: 0,
        background: 'linear-gradient(135deg, rgba(30, 86, 160, 0.06), rgba(41, 121, 255, 0.04))',
        border: '1px solid rgba(41, 121, 255, 0.12)',
        borderRadius: 14,
        padding: '12px 20px',
        marginBottom: 20,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
      }}>
        <DollarSign size={18} color="#1e56a0" />
        <span style={{ fontSize: 13, color: '#334155', fontWeight: 500 }}>
          <strong style={{ color: '#1e56a0' }}>Tip:</strong> Click the <strong>"Modify Price"</strong> button on any service card to quickly update its marketplace price. Changes reflect instantly in the customer app.
        </span>
      </div>

      {/* Service Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
        gap: 18,
      }}>
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card-base" style={{ padding: 24 }}>
              <div className="skeleton" style={{ height: 20, width: '60%', marginBottom: 12 }} />
              <div className="skeleton" style={{ height: 14, width: '90%', marginBottom: 8 }} />
              <div className="skeleton" style={{ height: 14, width: '40%' }} />
            </div>
          ))
        ) : filtered.length === 0 ? (
          <div style={{ gridColumn: '1 / -1' }}>
            <div className="empty-state">
              <div className="empty-state-icon">🔧</div>
              <h3>No Services Found</h3>
              <p>Create your first service to get started</p>
            </div>
          </div>
        ) : (
          filtered.map((service, idx) => {
            const catColor = CATEGORY_COLORS[service.category] || { bg: '#f1f5f9', color: '#64748b' };
            const CatIcon = CATEGORY_ICONS[service.category] || Wrench;
            const isEditingPrice = editingPriceId === service._id;
            const isSavingPrice = savingPriceId === service._id;

            return (
              <div
                key={service._id}
                className={`card-base hover-lift animate-fade-in-up stagger-${(idx % 5) + 1}`}
                style={{
                  padding: 0,
                  opacity: 0,
                  position: 'relative',
                  overflow: 'hidden',
                  borderLeft: `4px solid ${catColor.color}`,
                }}
              >
                {/* Card Header */}
                <div style={{ padding: '20px 20px 0 20px' }}>
                  {/* Active/Inactive toggle */}
                  <div style={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}>
                    <span style={{ fontSize: 11, color: service.isActive ? '#22c55e' : '#94a3b8', fontWeight: 600 }}>
                      {service.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <div
                      className={`toggle ${service.isActive ? 'active' : ''}`}
                      onClick={() => toggleActive(service)}
                      style={{ width: 40, height: 22, cursor: 'pointer' }}
                    />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                    <div style={{
                      width: 42,
                      height: 42,
                      borderRadius: 12,
                      background: catColor.bg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: catColor.color,
                      flexShrink: 0,
                    }}>
                      <CatIcon size={20} />
                    </div>
                    <div style={{ flex: 1, paddingRight: 80 }}>
                      <h3 style={{
                        fontSize: 16,
                        fontWeight: 700,
                        color: '#0a1628',
                        margin: 0,
                        opacity: service.isActive ? 1 : 0.5,
                      }}>
                        {service.name}
                      </h3>
                      <span style={{
                        background: catColor.bg,
                        color: catColor.color,
                        fontSize: 10,
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: 6,
                        display: 'inline-block',
                        marginTop: 4,
                      }}>
                        {service.category}
                      </span>
                    </div>
                  </div>

                  <p style={{
                    fontSize: 13,
                    color: '#64748b',
                    lineHeight: 1.5,
                    marginBottom: 14,
                    opacity: service.isActive ? 1 : 0.5,
                  }}>
                    {service.description}
                  </p>

                  <p style={{ fontSize: 12, color: '#94a3b8', margin: '0 0 12px' }}>
                    ⏱ {service.estimatedDuration} min &nbsp;•&nbsp; 📍 {service.city}
                  </p>
                </div>

                {/* ===== PRICE SECTION (the star feature) ===== */}
                <div style={{
                  background: isEditingPrice ? '#f0f7ff' : '#f8fafc',
                  borderTop: '1px solid #f1f5f9',
                  padding: '16px 20px',
                  transition: 'background 0.2s ease',
                }}>
                  {isEditingPrice ? (
                    /* ===== INLINE PRICE EDITOR ===== */
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, color: '#1e56a0', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8, display: 'block' }}>
                        ✏️ Modify Marketplace Price
                      </label>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          background: 'white',
                          borderRadius: 12,
                          border: '2px solid #2979ff',
                          padding: '0 4px 0 14px',
                          flex: 1,
                          boxShadow: '0 0 0 3px rgba(41, 121, 255, 0.1)',
                        }}>
                          <span style={{ color: '#1e56a0', fontWeight: 800, fontSize: 18, fontFamily: '"Plus Jakarta Sans", sans-serif' }}>₹</span>
                          <input
                            type="number"
                            value={editPriceValue}
                            onChange={(e) => setEditPriceValue(e.target.value)}
                            onKeyDown={(e) => handlePriceKeyDown(e, service._id)}
                            autoFocus
                            style={{
                              border: 'none',
                              outline: 'none',
                              fontFamily: '"Plus Jakarta Sans", sans-serif',
                              fontSize: 22,
                              fontWeight: 800,
                              color: '#0a1628',
                              width: '100%',
                              padding: '10px 8px',
                              background: 'transparent',
                            }}
                          />
                        </div>
                        <button
                          onClick={() => savePriceEdit(service._id)}
                          disabled={isSavingPrice}
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: 12,
                            border: 'none',
                            background: 'linear-gradient(135deg, #059669, #10b981)',
                            color: 'white',
                            cursor: isSavingPrice ? 'wait' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)',
                            transition: 'all 0.2s ease',
                          }}
                          title="Save price"
                        >
                          <Check size={20} strokeWidth={3} />
                        </button>
                        <button
                          onClick={cancelPriceEdit}
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: 12,
                            border: '1px solid #e2e8f0',
                            background: 'white',
                            color: '#64748b',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            transition: 'all 0.2s ease',
                          }}
                          title="Cancel"
                        >
                          <X size={18} />
                        </button>
                      </div>
                      <p style={{ fontSize: 11, color: '#64748b', marginTop: 6 }}>
                        Press <strong>Enter</strong> to save · <strong>Esc</strong> to cancel
                      </p>
                    </div>
                  ) : (
                    /* ===== PRICE DISPLAY + MODIFY BUTTON ===== */
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <p style={{ fontSize: 11, color: '#94a3b8', margin: '0 0 2px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                          Marketplace Price
                        </p>
                        <p style={{
                          fontFamily: '"Plus Jakarta Sans", sans-serif',
                          fontSize: 26,
                          fontWeight: 800,
                          color: '#0a1628',
                          margin: 0,
                          letterSpacing: -0.5,
                        }}>
                          ₹{service.basePrice.toLocaleString('en-IN')}
                        </p>
                      </div>
                      <button
                        onClick={() => startPriceEdit(service)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          padding: '8px 16px',
                          borderRadius: 10,
                          border: '1px solid rgba(41, 121, 255, 0.2)',
                          background: 'rgba(41, 121, 255, 0.06)',
                          color: '#1e56a0',
                          fontSize: 13,
                          fontWeight: 700,
                          cursor: 'pointer',
                          fontFamily: 'inherit',
                          transition: 'all 0.2s ease',
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.background = 'linear-gradient(135deg, #1e56a0, #2979ff)';
                          e.currentTarget.style.color = 'white';
                          e.currentTarget.style.borderColor = 'transparent';
                          e.currentTarget.style.boxShadow = '0 4px 14px rgba(41, 121, 255, 0.3)';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.background = 'rgba(41, 121, 255, 0.06)';
                          e.currentTarget.style.color = '#1e56a0';
                          e.currentTarget.style.borderColor = 'rgba(41, 121, 255, 0.2)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                        <IndianRupee size={14} />
                        Modify Price
                      </button>
                    </div>
                  )}
                </div>

                {/* Card Footer — Actions */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: 6,
                  padding: '12px 20px',
                  borderTop: '1px solid #f1f5f9',
                }}>
                  <button
                    className="btn-icon"
                    onClick={() => openEdit(service)}
                    title="Edit all details"
                    style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, color: '#64748b' }}
                  >
                    <Edit2 size={14} />
                    <span>Edit</span>
                  </button>
                  <button className="btn-icon" onClick={() => handleDelete(service._id)}
                    title="Deactivate service"
                    style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600 }}
                    onMouseOver={(e) => { e.currentTarget.style.background = '#fee2e2'; }}
                    onMouseOut={(e) => { e.currentTarget.style.background = '#f1f5f9'; }}
                  >
                    <Trash2 size={14} />
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingService ? 'Edit Service' : 'Add New Service'}</h3>
              <button className="btn-icon" onClick={() => setShowModal(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Service Name</label>
                  <input className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="e.g. Wiring Repair" />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea className="form-input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required rows={3} placeholder="Describe the service..." style={{ resize: 'vertical' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select className="form-select" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                      <option value="REPAIR">Repair</option>
                      <option value="INSTALLATION">Installation</option>
                      <option value="EMERGENCY">Emergency</option>
                      <option value="COMMERCIAL">Commercial</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Base Price (₹)</label>
                    <input className="form-input" type="number" value={form.basePrice} onChange={(e) => setForm({ ...form, basePrice: e.target.value })} required placeholder="499" />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Duration (minutes)</label>
                    <input className="form-input" type="number" value={form.estimatedDuration} onChange={(e) => setForm({ ...form, estimatedDuration: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">City</label>
                    <input className="form-input" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="Delhi" />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editingService ? 'Save Changes' : 'Create Service'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
