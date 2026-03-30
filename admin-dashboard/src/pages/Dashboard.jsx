import React, { useEffect, useState } from 'react';
import { Users, DollarSign, Activity, CalendarCheck, TrendingUp, TrendingDown, Wrench, Clock } from 'lucide-react';
import api from '../lib/api';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/users/stats');
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (e) {
      console.log('Stats error', e);
      // Fallback mock data if API unavailable
      setStats({
        users: { total: 2847, customers: 2500, technicians: 320, activeTechnicians: 185 },
        bookings: { total: 15420, pending: 42, completed: 14200, cancelled: 310 },
        revenue: { total: 2847500, monthly: [] },
        services: { total: 10 },
        recentBookings: []
      });
    } finally {
      setLoading(false);
    }
  };

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const formatDate = () => {
    return new Date().toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const cards = [
    {
      title: 'Total Revenue',
      value: stats ? `₹${stats.revenue.total.toLocaleString('en-IN')}` : '...',
      icon: DollarSign,
      gradient: 'linear-gradient(135deg, #059669, #10b981)',
      trend: '+12.5%',
      trendUp: true,
      subtitle: 'vs last month'
    },
    {
      title: 'Active Technicians',
      value: stats ? stats.users.activeTechnicians : '...',
      icon: Users,
      gradient: 'linear-gradient(135deg, #1e56a0, #2979ff)',
      trend: '+8',
      trendUp: true,
      subtitle: `of ${stats?.users.technicians || 0} total`
    },
    {
      title: 'Total Bookings',
      value: stats ? stats.bookings.total.toLocaleString() : '...',
      icon: CalendarCheck,
      gradient: 'linear-gradient(135deg, #7c3aed, #a855f7)',
      trend: '+24.3%',
      trendUp: true,
      subtitle: `${stats?.bookings.pending || 0} pending`
    },
    {
      title: 'Services Active',
      value: stats ? stats.services.total : '...',
      icon: Wrench,
      gradient: 'linear-gradient(135deg, #ea580c, #f97316)',
      trend: '4 categories',
      trendUp: true,
      subtitle: 'across India'
    },
  ];

  const getStatusBadge = (status) => {
    const map = {
      'COMPLETED': 'badge-green',
      'PENDING': 'badge-amber',
      'CANCELLED': 'badge-red',
      'ACCEPTED': 'badge-blue',
      'IN_PROGRESS': 'badge-cyan',
      'BOM_SUBMITTED': 'badge-purple',
    };
    return map[status] || 'badge-gray';
  };

  return (
    <div>
      {/* Greeting Section */}
      <div className="animate-fade-in-up" style={{ marginBottom: 32 }}>
        <h1 className="page-title" style={{ fontSize: 32 }}>
          {greeting()}, Admin 👋
        </h1>
        <p className="page-subtitle" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Clock size={14} />
          {formatDate()}
        </p>
      </div>

      {/* Stat Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: 20,
        marginBottom: 32,
      }}>
        {cards.map((card, idx) => (
          <div
            key={idx}
            className={`stat-card animate-fade-in-up stagger-${idx + 1}`}
            style={{ opacity: 0 }}
          >
            <div className="stat-icon-wrap" style={{ background: card.gradient }}>
              <card.icon />
            </div>
            <div style={{ flex: 1 }}>
              <p className="stat-label">{card.title}</p>
              <h3 className="stat-value">{card.value}</h3>
              <div className="stat-trend up" style={{ marginTop: 6 }}>
                {card.trendUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                <span>{card.trend}</span>
                <span style={{ color: '#94a3b8', marginLeft: 4 }}>{card.subtitle}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Section */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gap: 20,
      }}>
        {/* Recent Bookings */}
        <div className="data-table-wrap animate-fade-in-up stagger-5" style={{ opacity: 0 }}>
          <div className="data-table-header">
            <h2>Recent Bookings</h2>
            <span style={{ fontSize: 13, color: '#2979ff', fontWeight: 600, cursor: 'pointer' }}>
              View All →
            </span>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Service</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>
                    <td><div className="skeleton" style={{ height: 16, width: '80%' }} /></td>
                    <td><div className="skeleton" style={{ height: 16, width: '60%' }} /></td>
                    <td><div className="skeleton" style={{ height: 16, width: '40%' }} /></td>
                    <td><div className="skeleton" style={{ height: 24, width: 80 }} /></td>
                  </tr>
                ))
              ) : stats?.recentBookings?.length > 0 ? (
                stats.recentBookings.map((booking, idx) => (
                  <tr key={booking._id || idx}>
                    <td>
                      <p style={{ fontWeight: 600, color: '#0a1628', margin: 0 }}>
                        {booking.serviceId?.name || 'Service'}
                      </p>
                      <p style={{ fontSize: 12, color: '#94a3b8', margin: '2px 0 0' }}>
                        {booking.serviceId?.category}
                      </p>
                    </td>
                    <td style={{ fontWeight: 500 }}>{booking.customerId?.phone || '—'}</td>
                    <td style={{ fontWeight: 700, color: '#0a1628' }}>₹{booking.pricing?.totalPrice}</td>
                    <td>
                      <span className={`badge ${getStatusBadge(booking.status)}`}>
                        {booking.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>
                    No bookings yet. Data will appear once bookings are created.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Quick Actions */}
        <div className="animate-fade-in-up stagger-5" style={{ opacity: 0 }}>
          <div style={{
            background: 'white',
            borderRadius: 20,
            padding: 24,
            border: '1px solid rgba(30, 86, 160, 0.06)',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
          }}>
            <h3 style={{
              fontFamily: '"Plus Jakarta Sans", sans-serif',
              fontSize: 18,
              fontWeight: 700,
              color: '#0a1628',
              marginBottom: 20,
            }}>
              Quick Actions
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { emoji: '➕', label: 'Add New Service', color: '#dbeafe' },
                { emoji: '👤', label: 'Add Technician', color: '#dcfce7' },
                { emoji: '🎟️', label: 'Create Coupon', color: '#fef3c7' },
                { emoji: '📊', label: 'Export Reports', color: '#f3e8ff' },
              ].map((action) => (
                <button
                  key={action.label}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    padding: '14px 18px',
                    borderRadius: 14,
                    border: '1px solid #f1f5f9',
                    background: 'white',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    fontFamily: 'inherit',
                    width: '100%',
                    textAlign: 'left',
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = action.color;
                    e.currentTarget.style.borderColor = action.color;
                    e.currentTarget.style.transform = 'translateX(4px)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = 'white';
                    e.currentTarget.style.borderColor = '#f1f5f9';
                    e.currentTarget.style.transform = 'translateX(0)';
                  }}
                >
                  <span style={{ fontSize: 20 }}>{action.emoji}</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#334155' }}>{action.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* System Status */}
          <div style={{
            background: 'linear-gradient(135deg, #0a1628, #1e56a0)',
            borderRadius: 20,
            padding: 24,
            marginTop: 20,
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
              <Activity size={18} />
              System Status
            </h3>
            {[
              { label: 'API Server', status: 'Operational' },
              { label: 'Database', status: 'Connected' },
              { label: 'Payments', status: 'Active' },
            ].map((item) => (
              <div key={item.label} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px 0',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
              }}>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>{item.label}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: '#22c55e',
                    boxShadow: '0 0 8px rgba(34, 197, 94, 0.5)',
                  }} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#22c55e' }}>{item.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
