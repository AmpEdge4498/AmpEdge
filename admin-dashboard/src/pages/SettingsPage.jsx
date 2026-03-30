import React, { useState } from 'react';
import { Settings as SettingsIcon, Building2, Bell, Globe, Shield, Save } from 'lucide-react';

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);
  const [config, setConfig] = useState({
    businessName: 'AmpEdge',
    businessEmail: 'admin@ampedge.in',
    businessPhone: '+91-1800-XXX-XXXX',
    gstRate: '18',
    defaultCity: 'Delhi',
    enableNotifications: true,
    enableSMS: true,
    enableEmail: false,
    maintenanceMode: false,
    autoAssignTechnician: true,
    maxBookingDistance: '25',
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const updateConfig = (key, value) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const ToggleSwitch = ({ checked, onChange }) => (
    <div
      className={`toggle ${checked ? 'active' : ''}`}
      onClick={() => onChange(!checked)}
      style={{ cursor: 'pointer' }}
    />
  );

  return (
    <div>
      <div className="page-header animate-fade-in-up">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Configure your platform settings</p>
        </div>
        <button className="btn btn-primary" onClick={handleSave}>
          <Save size={18} />
          {saved ? 'Saved ✓' : 'Save Changes'}
        </button>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: 20,
      }}>
        {/* Business Info */}
        <div className="card-base animate-fade-in-up stagger-1" style={{ padding: 28, opacity: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <div style={{
              width: 42,
              height: 42,
              borderRadius: 12,
              background: '#dbeafe',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#1d4ed8',
            }}>
              <Building2 size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0a1628', margin: 0 }}>Business Information</h3>
              <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>Basic company details</p>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Business Name</label>
            <input className="form-input" value={config.businessName} onChange={(e) => updateConfig('businessName', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Contact Email</label>
            <input className="form-input" type="email" value={config.businessEmail} onChange={(e) => updateConfig('businessEmail', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Contact Phone</label>
            <input className="form-input" value={config.businessPhone} onChange={(e) => updateConfig('businessPhone', e.target.value)} />
          </div>
        </div>

        {/* Platform Config */}
        <div className="card-base animate-fade-in-up stagger-2" style={{ padding: 28, opacity: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <div style={{
              width: 42,
              height: 42,
              borderRadius: 12,
              background: '#dcfce7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#15803d',
            }}>
              <Globe size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0a1628', margin: 0 }}>Platform Configuration</h3>
              <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>Service & pricing settings</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">GST Rate (%)</label>
              <input className="form-input" type="number" value={config.gstRate} onChange={(e) => updateConfig('gstRate', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Default City</label>
              <input className="form-input" value={config.defaultCity} onChange={(e) => updateConfig('defaultCity', e.target.value)} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Max Booking Distance (km)</label>
            <input className="form-input" type="number" value={config.maxBookingDistance} onChange={(e) => updateConfig('maxBookingDistance', e.target.value)} />
          </div>
        </div>

        {/* Notifications */}
        <div className="card-base animate-fade-in-up stagger-3" style={{ padding: 28, opacity: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <div style={{
              width: 42,
              height: 42,
              borderRadius: 12,
              background: '#fef3c7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#b45309',
            }}>
              <Bell size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0a1628', margin: 0 }}>Notifications</h3>
              <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>Manage alert preferences</p>
            </div>
          </div>

          {[
            { key: 'enableNotifications', label: 'Push Notifications', desc: 'Send push notifications to mobile apps' },
            { key: 'enableSMS', label: 'SMS Alerts', desc: 'Send SMS for booking updates' },
            { key: 'enableEmail', label: 'Email Notifications', desc: 'Send email for invoices and reports' },
          ].map(item => (
            <div key={item.key} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '14px 0',
              borderBottom: '1px solid #f1f5f9',
            }}>
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, color: '#0a1628', margin: 0 }}>{item.label}</p>
                <p style={{ fontSize: 12, color: '#94a3b8', margin: '2px 0 0' }}>{item.desc}</p>
              </div>
              <ToggleSwitch checked={config[item.key]} onChange={(v) => updateConfig(item.key, v)} />
            </div>
          ))}
        </div>

        {/* System */}
        <div className="card-base animate-fade-in-up stagger-4" style={{ padding: 28, opacity: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <div style={{
              width: 42,
              height: 42,
              borderRadius: 12,
              background: '#f3e8ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#7c3aed',
            }}>
              <Shield size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0a1628', margin: 0 }}>System</h3>
              <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>Advanced settings</p>
            </div>
          </div>

          {[
            { key: 'autoAssignTechnician', label: 'Auto-Assign Technicians', desc: 'Automatically assign nearest available technician' },
            { key: 'maintenanceMode', label: 'Maintenance Mode', desc: 'Temporarily disable new bookings' },
          ].map(item => (
            <div key={item.key} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '14px 0',
              borderBottom: '1px solid #f1f5f9',
            }}>
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, color: '#0a1628', margin: 0 }}>{item.label}</p>
                <p style={{ fontSize: 12, color: '#94a3b8', margin: '2px 0 0' }}>{item.desc}</p>
              </div>
              <ToggleSwitch checked={config[item.key]} onChange={(v) => updateConfig(item.key, v)} />
            </div>
          ))}

          <div style={{
            marginTop: 20,
            padding: 16,
            background: '#f8fafc',
            borderRadius: 12,
          }}>
            <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>
              <strong>API Version:</strong> v1 &nbsp;|&nbsp;
              <strong>Server:</strong> Node.js Express &nbsp;|&nbsp;
              <strong>Database:</strong> MongoDB
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
