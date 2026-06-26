import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, X, ShoppingCart, Check, IndianRupee, Package, Cpu } from 'lucide-react';
import api from '../lib/api';

const CATEGORY_ICONS = {
  WIRING_MATERIALS: ShoppingCart,
  APPLIANCES: Cpu,
  TOOLS_EQUIPMENT: Package,
  LIGHTING_FIXTURES: Package,
  SMART_HOME: Cpu,
};

const CATEGORY_COLORS = {
  WIRING_MATERIALS: { bg: '#ffedd5', color: '#ea580c' },
  APPLIANCES: { bg: '#fce7f3', color: '#db2777' },
  TOOLS_EQUIPMENT: { bg: '#e0e7ff', color: '#4f46e5' },
  LIGHTING_FIXTURES: { bg: '#fef08a', color: '#ca8a04' },
  SMART_HOME: { bg: '#dcfce7', color: '#16a34a' },
};

export default function MarketplacePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingPriceId, setEditingPriceId] = useState(null);
  const [editPriceValue, setEditPriceValue] = useState('');
  const [savingPriceId, setSavingPriceId] = useState(null);
  
  const [form, setForm] = useState({
    name: '', description: '', category: 'WIRING_MATERIALS', basePrice: '', stock: '10', isActive: true, imageUrl: ''
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products/admin/all');
      setProducts(res.data.data);
    } catch (e) {
      console.log('Error', e);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditingProduct(null);
    setForm({ name: '', description: '', category: 'WIRING_MATERIALS', basePrice: '', stock: '10', isActive: true, imageUrl: '' });
    setShowModal(true);
  };

  const openEdit = (prod) => {
    setEditingProduct(prod);
    setForm({
      name: prod.name,
      description: prod.description,
      category: prod.category,
      basePrice: prod.basePrice.toString(),
      stock: prod.stock ? prod.stock.toString() : '10',
      isActive: prod.isActive,
      imageUrl: prod.imageUrl || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...form, basePrice: Number(form.basePrice), stock: Number(form.stock) };
    try {
      if (editingProduct) {
        await api.put(`/products/${editingProduct._id}`, payload);
      } else {
        await api.post('/products', payload);
      }
      setShowModal(false);
      fetchProducts();
    } catch (err) {
      alert('Failed to save product: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Deactivate this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      fetchProducts();
    } catch (e) {
      alert('Failed to deactivate');
    }
  };

  const toggleActive = async (prod) => {
    try {
      await api.put(`/products/${prod._id}`, { isActive: !prod.isActive });
      fetchProducts();
    } catch (e) {
      alert('Failed to toggle');
    }
  };

  // ===== INLINE PRICE EDIT =====
  const startPriceEdit = (prod) => {
    setEditingPriceId(prod._id);
    setEditPriceValue(prod.basePrice.toString());
  };

  const cancelPriceEdit = () => {
    setEditingPriceId(null);
    setEditPriceValue('');
  };

  const savePriceEdit = async (id) => {
    const newPrice = Number(editPriceValue);
    if (isNaN(newPrice) || newPrice <= 0) {
      alert('Please enter a valid price');
      return;
    }
    setSavingPriceId(id);
    try {
      await api.put(`/products/${id}`, { basePrice: newPrice });
      setEditingPriceId(null);
      setEditPriceValue('');
      fetchProducts();
    } catch (err) {
      alert('Failed to update price');
    } finally {
      setSavingPriceId(null);
    }
  };

  const handlePriceKeyDown = (e, id) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      savePriceEdit(id);
    } else if (e.key === 'Escape') {
      cancelPriceEdit();
    }
  };

  const categories = ['ALL', 'WIRING_MATERIALS', 'APPLIANCES', 'TOOLS_EQUIPMENT', 'LIGHTING_FIXTURES', 'SMART_HOME'];

  const filtered = products.filter(p => {
    if (categoryFilter !== 'ALL' && p.category !== categoryFilter) return false;
    if (searchTerm && !p.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !p.description?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  return (
    <div>
      <div className="page-header animate-fade-in-up">
        <div>
          <h1 className="page-title">Hardware Store</h1>
          <p className="page-subtitle">Manage physical marketplace inventory and prices</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <Plus size={18} />
          Add Product
        </button>
      </div>

      <div className="animate-fade-in-up stagger-1" style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'white', borderRadius: 12, padding: '10px 18px', border: '1px solid #e2e8f0', flex: '1 1 260px', maxWidth: 360 }}>
          <Search size={18} color="#94a3b8" />
          <input type="text" placeholder="Search products..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ border: 'none', outline: 'none', fontSize: 14, width: '100%', fontFamily: 'inherit' }} />
          {searchTerm && <button onClick={() => setSearchTerm('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={16} /></button>}
        </div>
        <div className="filter-tabs">
          {categories.map(c => (
            <button key={c} className={`filter-tab ${categoryFilter === c ? 'active' : ''}`} onClick={() => setCategoryFilter(c)}>
              {c === 'ALL' ? 'All' : c}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 18 }}>
        {loading ? (
           <p>Loading...</p>
        ) : filtered.length === 0 ? (
          <div style={{ gridColumn: '1 / -1' }} className="empty-state">
            <ShoppingCart size={40} color="#94a3b8" />
            <h3 style={{marginTop: 12}}>No Products Found</h3>
            <p>Add hardware products to your e-commerce store</p>
          </div>
        ) : (
          filtered.map((prod, idx) => {
            const catColor = CATEGORY_COLORS[prod.category] || CATEGORY_COLORS.WIRING_MATERIALS;
            const CatIcon = CATEGORY_ICONS[prod.category] || Package;
            const isEditingPrice = editingPriceId === prod._id;
            const isSavingPrice = savingPriceId === prod._id;

            return (
              <div key={prod._id} className={`card-base hover-lift animate-fade-in-up stagger-${(idx % 5) + 1}`} style={{ padding: 0, opacity: 0, position: 'relative', overflow: 'hidden', borderLeft: `4px solid ${catColor.color}` }}>
                <div style={{ padding: '20px 20px 0 20px' }}>
                  <div style={{ position: 'absolute', top: 16, right: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 11, color: prod.isActive ? '#22c55e' : '#94a3b8', fontWeight: 600 }}>{prod.isActive ? 'In Stock' : 'Out of Stock'}</span>
                    <div className={`toggle ${prod.isActive ? 'active' : ''}`} onClick={() => toggleActive(prod)} style={{ width: 40, height: 22, cursor: 'pointer' }} />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                    {prod.imageUrl && prod.imageUrl !== 'no-photo.jpg' ? (
                      <img src={prod.imageUrl} alt={prod.name} style={{ width: 42, height: 42, borderRadius: 12, objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: 42, height: 42, borderRadius: 12, background: catColor.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: catColor.color, flexShrink: 0 }}>
                        <CatIcon size={20} />
                      </div>
                    )}
                    <div style={{ flex: 1, paddingRight: 80 }}>
                      <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0a1628', margin: 0, opacity: prod.isActive ? 1 : 0.5 }}>{prod.name}</h3>
                      <span style={{ background: catColor.bg, color: catColor.color, fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 6, display: 'inline-block', marginTop: 4 }}>{prod.category}</span>
                    </div>
                  </div>
                  <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5, marginBottom: 14, opacity: prod.isActive ? 1 : 0.5 }}>{prod.description}</p>
                </div>

                <div style={{ background: isEditingPrice ? '#f0f7ff' : '#f8fafc', borderTop: '1px solid #f1f5f9', padding: '16px 20px', transition: 'background 0.2s ease' }}>
                  {isEditingPrice ? (
                    <div>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'white', borderRadius: 12, border: '2px solid #2979ff', padding: '0 4px 0 14px', flex: 1 }}>
                          <span style={{ color: '#1e56a0', fontWeight: 800, fontSize: 18 }}>₹</span>
                          <input type="number" value={editPriceValue} onChange={(e) => setEditPriceValue(e.target.value)} onKeyDown={(e) => handlePriceKeyDown(e, prod._id)} autoFocus style={{ border: 'none', outline: 'none', fontSize: 22, fontWeight: 800, color: '#0a1628', width: '100%', padding: '10px 8px', background: 'transparent' }} />
                        </div>
                        <button onClick={() => savePriceEdit(prod._id)} disabled={isSavingPrice} className="btn btn-primary" style={{width: 44, height: 44, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Check size={20}/></button>
                        <button onClick={cancelPriceEdit} className="btn btn-outline" style={{width: 44, height: 44, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><X size={18}/></button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <p style={{ fontSize: 11, color: '#94a3b8', margin: '0 0 2px', fontWeight: 600, textTransform: 'uppercase' }}>Retail Price</p>
                        <p style={{ fontSize: 26, fontWeight: 800, color: '#0a1628', margin: 0 }}>₹{prod.basePrice.toLocaleString('en-IN')}</p>
                      </div>
                      <button onClick={() => startPriceEdit(prod)} className="btn btn-outline" style={{padding: '8px 16px', fontSize: 13}}>
                        <IndianRupee size={14} /> Modify Price
                      </button>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6, padding: '12px 20px', borderTop: '1px solid #f1f5f9' }}>
                  <button className="btn-icon" onClick={() => openEdit(prod)} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, color: '#64748b' }}><Edit2 size={14} /><span>Edit</span></button>
                  <button className="btn-icon" onClick={() => handleDelete(prod._id)} style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600 }}><Trash2 size={14} /><span>Remove</span></button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
              <button className="btn-icon" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Product Name</label>
                  <input className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="e.g. Havells 3-Core Wire" />
                </div>
                <div className="form-group">
                  <label className="form-label">Image URL</label>
                  <input className="form-input" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} placeholder="https://example.com/image.jpg" />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea className="form-input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required rows={3} placeholder="Describe the physical product..." />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select className="form-select" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                      <option value="WIRING_MATERIALS">Wiring Materials (MCB, Wire)</option>
                      <option value="APPLIANCES">Electrical Appliances (AC, Fridge)</option>
                      <option value="TOOLS_EQUIPMENT">Tools & Equipment (Drills)</option>
                      <option value="LIGHTING_FIXTURES">Lighting Fixtures (LEDs, Tubes)</option>
                      <option value="SMART_HOME">Smart Home (WiFi Plugs)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Retail Price (₹)</label>
                    <input className="form-input" type="number" value={form.basePrice} onChange={(e) => setForm({ ...form, basePrice: e.target.value })} required placeholder="899" />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Stock Quantity</label>
                  <input className="form-input" type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} required placeholder="50" />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editingProduct ? 'Save Changes' : 'Create Product'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
