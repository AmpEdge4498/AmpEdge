import React, { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, CalendarCheck, Wrench, Tag, Settings, LogOut, Search, Bell, Menu, X, ShoppingCart } from 'lucide-react';
import '../App.css';

export default function AdminLayout({ onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Bookings', path: '/bookings', icon: CalendarCheck },
    { name: 'Services', path: '/services', icon: Wrench },
    { name: 'Store', path: '/marketplace', icon: ShoppingCart },
    { name: 'Users', path: '/users', icon: Users },
    { name: 'Coupons', path: '/coupons', icon: Tag },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div style={{ display: 'flex', background: '#f0f4f8', minHeight: '100vh' }}>
      {/* Overlay for mobile */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? 'visible' : ''}`}
        onClick={closeSidebar}
      />

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h1>⚡ AmpEdge</h1>
            <button
              onClick={closeSidebar}
              style={{
                display: sidebarOpen ? 'block' : 'none',
                background: 'none',
                border: 'none',
                color: 'rgba(255,255,255,0.5)',
                cursor: 'pointer',
                padding: 4,
              }}
            >
              <X size={20} />
            </button>
          </div>
          <p>Admin Portal</p>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item, idx) => (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={closeSidebar}
              style={{ animationDelay: `${idx * 0.05}s` }}
            >
              <item.icon className="sidebar-icon" />
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div style={{
            background: 'rgba(41, 121, 255, 0.08)',
            borderRadius: 14,
            padding: '14px 16px',
            marginBottom: 12,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #1e56a0, #2979ff)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 700,
              fontSize: 14,
            }}>
              A
            </div>
            <div>
              <p style={{ color: 'white', fontSize: 13, fontWeight: 600, margin: 0 }}>Admin</p>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, margin: 0 }}>Super Admin</p>
            </div>
          </div>
          <button className="sidebar-logout" onClick={onLogout}>
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="main-content">
        {/* Top Header */}
        <header className="top-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button className="hamburger" onClick={() => setSidebarOpen(true)}>
              <Menu size={24} />
            </button>
            <div className="header-search">
              <Search size={18} style={{ color: '#94a3b8', flexShrink: 0 }} />
              <input type="text" placeholder="Search bookings, users, services..." />
            </div>
          </div>

          <div className="header-right">
            <button className="header-notification">
              <Bell size={20} />
              <span className="notification-dot" />
            </button>
            <div className="header-avatar">A</div>
          </div>
        </header>

        {/* Page Content */}
        <div className="content-area">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
