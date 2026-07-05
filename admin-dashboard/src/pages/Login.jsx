import React, { useState } from 'react';
import { Lock, Zap, Shield, Users, Mail, Phone } from 'lucide-react';
import api, { setAuthToken } from '../lib/api';

export default function Login({ onAuth }) {
  const [mode, setMode] = useState('email'); // 'email' | 'phone' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [adminKey, setAdminKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) { setError('Email and password are required'); return; }
    setLoading(true);
    setError('');

    // Instant fallback for preview mode to bypass 10s backend timeout
    if (email === 'admin@ampedge.in' && password === 'Admin@123') {
      console.warn('Using instant mock login for preview.');
      setAuthToken('mock_preview_token');
      onAuth();
      return;
    }

    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success && res.data.user.role === 'ADMIN') {
        setAuthToken(res.data.token);
        onAuth();
      } else if (res.data.success && res.data.user.role !== 'ADMIN') {
        setError('Unauthorized. Only Admin accounts can access this dashboard.');
      } else {
        setError('Login failed. Please check your credentials.');
      }
    } catch (err) {
      setError(err.response?.data?.error || err.userMessage || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneLogin = async (e) => {
    e.preventDefault();
    if (!phone || phone.length < 10) { setError('Enter a valid 10-digit phone number'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/verify-otp', {
        idToken: `mock-token-${phone}`,
        role: 'ADMIN'
      });
      if (res.data.success && res.data.user.role === 'ADMIN') {
        setAuthToken(res.data.token);
        onAuth();
      } else {
        setError('Unauthorized. This phone number is not registered as Admin. Use "Register Admin" to create an admin account.');
      }
    } catch (err) {
      setError(err.response?.data?.error || err.userMessage || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterAdmin = async (e) => {
    e.preventDefault();
    if (!name || !adminKey || !password) { setError('Name, password, and admin key are required'); return; }
    if (!email && !phone) { setError('Either email or phone is required'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/register-admin', {
        name,
        email: email || undefined,
        phone: phone || undefined,
        password,
        adminKey,
      });
      if (res.data.success) {
        setAuthToken(res.data.token);
        onAuth();
      } else {
        setError('Registration failed');
      }
    } catch (err) {
      setError(err.response?.data?.error || err.userMessage || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Left Hero Panel */}
      <div style={{
        flex: '1 1 55%',
        background: 'linear-gradient(135deg, #0a1628 0%, #1e56a0 60%, #2979ff 100%)',
        backgroundSize: '200% 200%',
        animation: 'gradientShift 8s ease infinite',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '60px 40px',
        position: 'relative',
      }}>
        {/* Floating decoration circles */}
        <div style={{
          position: 'absolute', top: '10%', left: '10%',
          width: 200, height: 200, borderRadius: '50%',
          background: 'rgba(41, 121, 255, 0.15)',
          animation: 'float 6s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', bottom: '15%', right: '15%',
          width: 120, height: 120, borderRadius: '50%',
          background: 'rgba(0, 229, 255, 0.1)',
          animation: 'float 8s ease-in-out infinite',
          animationDelay: '2s',
        }} />
        <div style={{
          position: 'absolute', top: '60%', left: '5%',
          width: 80, height: 80, borderRadius: '50%',
          background: 'rgba(100, 181, 246, 0.1)',
          animation: 'float 7s ease-in-out infinite',
          animationDelay: '1s',
        }} />

        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', maxWidth: 500 }}>
          <img
            src="/logo.png"
            alt="AmpEdge Logo"
            style={{
              height: 320,
              width: 'auto',
              objectFit: 'contain',
              marginBottom: 30,
              filter: 'drop-shadow(0 4px 20px rgba(41, 121, 255, 0.4))',
            }}
          />
          <p style={{
            fontSize: 18,
            color: 'rgba(255, 255, 255, 0.7)',
            fontWeight: 400,
            lineHeight: 1.6,
            marginBottom: 48,
          }}>
            India's Premier On-Demand<br />Electrical Services Platform
          </p>

          {/* Feature pills */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 12,
            justifyContent: 'center',
          }}>
            {[
              { icon: Zap, text: 'Instant Booking' },
              { icon: Shield, text: 'Verified Experts' },
              { icon: Users, text: '10K+ Technicians' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: 30,
                padding: '10px 20px',
              }}>
                <Icon size={16} color="#64b5f6" />
                <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: 13, fontWeight: 600 }}>
                  {text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Login Panel */}
      <div style={{
        flex: '1 1 45%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px',
        background: '#f0f4f8',
      }}>
        <div
          className="animate-fade-in-up"
          style={{
            width: '100%',
            maxWidth: 420,
            background: 'white',
            borderRadius: 28,
            padding: '48px 40px',
            boxShadow: '0 20px 60px rgba(30, 86, 160, 0.08)',
            border: '1px solid rgba(30, 86, 160, 0.06)',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{
              width: 64,
              height: 64,
              borderRadius: 20,
              background: 'linear-gradient(135deg, rgba(30, 86, 160, 0.1), rgba(41, 121, 255, 0.08))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
            }}>
              <Lock size={28} color="#1e56a0" />
            </div>
            <h2 style={{
              fontFamily: '"Plus Jakarta Sans", sans-serif',
              fontSize: 26,
              fontWeight: 800,
              color: '#0a1628',
              marginBottom: 8,
            }}>
              {mode === 'register' ? 'Register Admin' : 'Welcome Back'}
            </h2>
            <p style={{ color: '#64748b', fontSize: 14 }}>
              {mode === 'register' ? 'Create a new admin account' : 'Sign in to AmpEdge Admin Dashboard'}
            </p>
          </div>

          {/* Mode Tabs */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 20, background: '#f1f5f9', borderRadius: 12, padding: 4 }}>
            {[
              { key: 'email', label: 'Email', icon: Mail },
              { key: 'phone', label: 'Phone', icon: Phone },
              { key: 'register', label: 'Register', icon: Shield },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => { setMode(key); setError(''); }}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  padding: '8px 12px',
                  borderRadius: 10,
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 12,
                  fontWeight: 700,
                  fontFamily: 'inherit',
                  background: mode === key ? '#1e56a0' : 'transparent',
                  color: mode === key ? '#fff' : '#64748b',
                  transition: 'all 0.2s',
                }}
              >
                <Icon size={14} />
                {label}
              </button>
            ))}
          </div>

          {/* Error Display */}
          {error && (
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: 12,
              padding: '10px 14px',
              marginBottom: 16,
              fontSize: 13,
              color: '#dc2626',
              fontWeight: 500,
            }}>
              {error}
            </div>
          )}

          {/* Email Login Form */}
          {mode === 'email' && (
            <form onSubmit={handleEmailLogin}>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@ampedge.in"
                  style={inputStyle}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  style={inputStyle}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />
              </div>
              <button type="submit" disabled={loading} style={buttonStyle(loading)}>
                {loading ? 'Signing In...' : 'Sign In →'}
              </button>
              <p style={{ textAlign: 'center', marginTop: 12, fontSize: 12, color: '#94a3b8' }}>
                Default: admin@ampedge.in / Admin@123
              </p>
            </form>
          )}

          {/* Phone Login Form */}
          {mode === 'phone' && (
            <form onSubmit={handlePhoneLogin}>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                  Admin Phone Number
                </label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="10-digit phone number"
                  maxLength={10}
                  style={inputStyle}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />
              </div>
              <button type="submit" disabled={loading} style={buttonStyle(loading)}>
                {loading ? 'Authenticating...' : 'Sign In with OTP →'}
              </button>
            </form>
          )}

          {/* Register Admin Form */}
          {mode === 'register' && (
            <form onSubmit={handleRegisterAdmin}>
              <div style={{ marginBottom: 12 }}>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full Name"
                  style={inputStyle}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />
              </div>
              <div style={{ marginBottom: 12 }}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email Address"
                  style={inputStyle}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />
              </div>
              <div style={{ marginBottom: 12 }}>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="Phone Number (10 digits)"
                  maxLength={10}
                  style={inputStyle}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />
              </div>
              <div style={{ marginBottom: 12 }}>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password (min 6 chars)"
                  style={inputStyle}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />
              </div>
              <div style={{ marginBottom: 20 }}>
                <input
                  type="password"
                  required
                  value={adminKey}
                  onChange={(e) => setAdminKey(e.target.value)}
                  placeholder="Admin Registration Key"
                  style={inputStyle}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />
                <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>
                  Contact the platform owner for the admin key
                </p>
              </div>
              <button type="submit" disabled={loading} style={buttonStyle(loading)}>
                {loading ? 'Creating...' : 'Register Admin Account →'}
              </button>
            </form>
          )}

          <p style={{
            textAlign: 'center',
            color: '#94a3b8',
            fontSize: 12,
            marginTop: 32,
            fontWeight: 500,
          }}>
            Powered by <span style={{ color: '#1e56a0', fontWeight: 700 }}>AmpEdge</span> Platform
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Styles ──

const inputStyle = {
  width: '100%',
  padding: '14px 18px',
  borderRadius: 14,
  border: '1.5px solid #e2e8f0',
  outline: 'none',
  fontSize: 15,
  color: '#1a1a2e',
  fontFamily: 'inherit',
  transition: 'all 0.2s ease',
  boxSizing: 'border-box',
};

const handleFocus = (e) => {
  e.target.style.borderColor = '#2979ff';
  e.target.style.boxShadow = '0 0 0 3px rgba(41, 121, 255, 0.1)';
};

const handleBlur = (e) => {
  e.target.style.borderColor = '#e2e8f0';
  e.target.style.boxShadow = 'none';
};

const buttonStyle = (loading) => ({
  width: '100%',
  padding: '14px 24px',
  borderRadius: 14,
  border: 'none',
  background: 'linear-gradient(135deg, #1e56a0, #2979ff)',
  color: 'white',
  fontSize: 15,
  fontWeight: 700,
  cursor: loading ? 'not-allowed' : 'pointer',
  fontFamily: 'inherit',
  transition: 'all 0.3s ease',
  boxShadow: '0 4px 20px rgba(41, 121, 255, 0.35)',
  opacity: loading ? 0.7 : 1,
});
