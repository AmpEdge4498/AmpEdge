import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, UserPlus, X } from 'lucide-react';
import api from '../lib/api';

export default function BookingsList() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await api.get('/bookings');
      setBookings(res.data.data);
    } catch (e) {
      console.log('Error fetching bookings', e);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const map = {
      'COMPLETED': 'badge-green',
      'PENDING': 'badge-amber',
      'CANCELLED': 'badge-red',
      'ACCEPTED': 'badge-blue',
      'ON_THE_WAY': 'badge-cyan',
      'IN_PROGRESS': 'badge-cyan',
      'BOM_PENDING': 'badge-purple',
      'BOM_SUBMITTED': 'badge-purple',
      'BOM_APPROVED': 'badge-green',
    };
    return map[status] || 'badge-gray';
  };

  const statuses = ['ALL', 'PENDING', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

  const filtered = bookings.filter(b => {
    if (statusFilter !== 'ALL' && b.status !== statusFilter) return false;
    if (searchTerm && !b.serviceId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !b.customerId?.phone?.includes(searchTerm)) return false;
    return true;
  });

  return (
    <div>
      <div className="page-header animate-fade-in-up">
        <div>
          <h1 className="page-title">Bookings Management</h1>
          <p className="page-subtitle">{bookings.length} total bookings</p>
        </div>
      </div>

      {/* Filters Bar */}
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
            placeholder="Search by service or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              border: 'none',
              outline: 'none',
              fontSize: 14,
              width: '100%',
              fontFamily: 'inherit',
              color: '#1a1a2e',
            }}
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
              <X size={16} />
            </button>
          )}
        </div>

        <div className="filter-tabs">
          {statuses.map(s => (
            <button
              key={s}
              className={`filter-tab ${statusFilter === s ? 'active' : ''}`}
              onClick={() => setStatusFilter(s)}
            >
              {s === 'ALL' ? 'All' : s.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="data-table-wrap animate-fade-in-up stagger-2" style={{ opacity: 0 }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Booking ID</th>
              <th>Service</th>
              <th>Customer</th>
              <th>Technician</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 7 }).map((_, j) => (
                    <td key={j}><div className="skeleton" style={{ height: 16, width: `${50 + Math.random() * 40}%` }} /></td>
                  ))}
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan="7">
                  <div className="empty-state">
                    <div className="empty-state-icon">📋</div>
                    <h3>No Bookings Found</h3>
                    <p>Try adjusting your search or filter criteria</p>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map(booking => (
                <tr key={booking._id}>
                  <td>
                    <span style={{
                      fontFamily: 'monospace',
                      fontSize: 12,
                      color: '#64748b',
                      background: '#f1f5f9',
                      padding: '4px 10px',
                      borderRadius: 6,
                    }}>
                      #{booking._id.slice(-6).toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <p style={{ fontWeight: 600, color: '#0a1628', margin: 0 }}>
                      {booking.serviceId?.name || 'Unknown'}
                    </p>
                    <p style={{ fontSize: 12, color: '#94a3b8', margin: '2px 0 0' }}>
                      {booking.serviceId?.category}
                    </p>
                  </td>
                  <td style={{ fontWeight: 500, color: '#334155' }}>
                    {booking.customerId?.phone || 'Unknown'}
                  </td>
                  <td style={{ color: '#64748b' }}>
                    {booking.technicianId?.phone || (
                      <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Unassigned</span>
                    )}
                  </td>
                  <td style={{ fontWeight: 700, color: '#0a1628' }}>
                    ₹{booking.pricing?.totalPrice?.toLocaleString('en-IN')}
                  </td>
                  <td>
                    <span className={`badge ${getStatusBadge(booking.status)}`}>
                      {booking.status?.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td style={{ fontSize: 13, color: '#64748b' }}>
                    {new Date(booking.createdAt || booking.scheduledTime).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: '2-digit'
                    })}
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
