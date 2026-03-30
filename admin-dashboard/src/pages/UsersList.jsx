import React, { useState, useEffect } from 'react';
import { Search, User, Shield, CheckCircle, XCircle, Edit2, Trash2, Plus } from 'lucide-react';
import api from '../lib/api';

export default function UsersList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data.data);
    } catch (e) {
      console.log('Error fetching users', e);
      // Fallback mock data
      setUsers([
        { _id: '1', name: 'Rajesh Kumar', phone: '+919876543210', role: 'CUSTOMER', status: 'ACTIVE', createdAt: new Date() },
        { _id: '2', name: 'Amit Sharma', phone: '+918888888888', role: 'TECHNICIAN', status: 'ACTIVE', earnings: 45000, ratings: 4.8, createdAt: new Date() },
        { _id: '3', name: 'Priya Singh', phone: '+917777777777', role: 'CUSTOMER', status: 'ACTIVE', createdAt: new Date() },
        { _id: '4', name: 'Suresh Patel', phone: '+916666666666', role: 'TECHNICIAN', status: 'PENDING_KYC', createdAt: new Date() },
        { _id: '5', name: 'Admin User', phone: '+915555555555', role: 'ADMIN', status: 'ACTIVE', createdAt: new Date() },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to deactivate this user?')) return;
    try {
      await api.delete(`/users/${id}`);
      fetchUsers();
    } catch (e) {
      alert('Failed to deactivate user');
    }
  };

  const roles = ['ALL', 'CUSTOMER', 'TECHNICIAN', 'ADMIN'];

  const getRoleBadge = (role) => {
    const map = {
      'CUSTOMER': 'badge-blue',
      'TECHNICIAN': 'badge-purple',
      'ADMIN': 'badge-red',
    };
    return map[role] || 'badge-gray';
  };

  const getRoleIcon = (role) => {
    if (role === 'TECHNICIAN') return <Shield size={12} />;
    if (role === 'ADMIN') return <Shield size={12} />;
    return <User size={12} />;
  };

  const getStatusColor = (status) => {
    if (status === 'ACTIVE') return '#22c55e';
    if (status === 'PENDING_KYC') return '#f59e0b';
    return '#ef4444';
  };

  const filtered = users.filter(u => {
    if (roleFilter !== 'ALL' && u.role !== roleFilter) return false;
    if (searchTerm && !u.name?.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !u.phone?.includes(searchTerm)) return false;
    return true;
  });

  const getInitial = (name) => {
    if (!name) return '?';
    return name.charAt(0).toUpperCase();
  };

  const getAvatarGradient = (role) => {
    if (role === 'TECHNICIAN') return 'linear-gradient(135deg, #7c3aed, #a855f7)';
    if (role === 'ADMIN') return 'linear-gradient(135deg, #dc2626, #ef4444)';
    return 'linear-gradient(135deg, #1e56a0, #2979ff)';
  };

  return (
    <div>
      <div className="page-header animate-fade-in-up">
        <div>
          <h1 className="page-title">Users Management</h1>
          <p className="page-subtitle">{users.length} registered users</p>
        </div>
        <button className="btn btn-primary">
          <Plus size={18} />
          Add User
        </button>
      </div>

      {/* Filters */}
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
          flex: '1 1 300px',
          maxWidth: 400,
        }}>
          <Search size={18} color="#94a3b8" />
          <input
            type="text"
            placeholder="Search by name or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ border: 'none', outline: 'none', fontSize: 14, width: '100%', fontFamily: 'inherit', color: '#1a1a2e' }}
          />
        </div>

        <div className="filter-tabs">
          {roles.map(r => (
            <button
              key={r}
              className={`filter-tab ${roleFilter === r ? 'active' : ''}`}
              onClick={() => setRoleFilter(r)}
            >
              {r === 'ALL' ? 'All' : r}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="data-table-wrap animate-fade-in-up stagger-2" style={{ opacity: 0 }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Phone</th>
              <th>Role</th>
              <th>Status</th>
              <th>Joined</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 6 }).map((_, j) => (
                    <td key={j}><div className="skeleton" style={{ height: 16, width: `${50 + Math.random() * 40}%` }} /></td>
                  ))}
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan="6">
                  <div className="empty-state">
                    <div className="empty-state-icon">👥</div>
                    <h3>No Users Found</h3>
                    <p>Try adjusting your search or filter criteria</p>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map(user => (
                <tr key={user._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{
                        width: 40,
                        height: 40,
                        borderRadius: 12,
                        background: getAvatarGradient(user.role),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 700,
                        fontSize: 15,
                        flexShrink: 0,
                      }}>
                        {getInitial(user.name)}
                      </div>
                      <div>
                        <p style={{ fontWeight: 600, color: '#0a1628', margin: 0 }}>
                          {user.name || 'Unnamed User'}
                        </p>
                        {user.role === 'TECHNICIAN' && user.ratings > 0 && (
                          <p style={{ fontSize: 12, color: '#f59e0b', margin: '2px 0 0' }}>
                            ⭐ {user.ratings} • ₹{(user.earnings || 0).toLocaleString()} earned
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td style={{ fontWeight: 500, color: '#334155', fontFamily: 'monospace', fontSize: 13 }}>
                    {user.phone}
                  </td>
                  <td>
                    <span className={`badge ${getRoleBadge(user.role)}`}>
                      {getRoleIcon(user.role)}
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: getStatusColor(user.status),
                      }} />
                      <span style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: getStatusColor(user.status),
                      }}>
                        {user.status?.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </td>
                  <td style={{ fontSize: 13, color: '#64748b' }}>
                    {new Date(user.createdAt).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: '2-digit'
                    })}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      <button className="btn-icon" title="Edit">
                        <Edit2 size={15} />
                      </button>
                      <button className="btn-icon" title="Delete" onClick={() => handleDeleteUser(user._id)}
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
    </div>
  );
}
