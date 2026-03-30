import React, { useState } from 'react';
import { Lock, Zap, Shield, Users } from 'lucide-react';
import api, { setAuthToken } from '../lib/api';

export default function Login({ onAuth }) {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/verify-otp', {
        idToken: `mock-token-${phone}`,
        role: 'ADMIN'
      });
      
      if (res.data.success && res.data.user.role === 'ADMIN') {
        setAuthToken(res.data.token);
        onAuth();
      } else {
        alert('Unauthorized access. Only Admins can login.');
      }
    } catch (err) {
      alert('Login failed');
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
          <div style={{
            fontSize: 56,
            marginBottom: 20,
            filter: 'drop-shadow(0 4px 20px rgba(41, 121, 255, 0.4))',
          }}>
            ⚡
          </div>
          <h1 style={{
            fontFamily: '"Plus Jakarta Sans", sans-serif',
            fontSize: 44,
            fontWeight: 800,
            color: 'white',
            letterSpacing: '-1px',
            lineHeight: 1.1,
            marginBottom: 16,
          }}>
            AmpEdge
          </h1>
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
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
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
              Welcome Back
            </h2>
            <p style={{ color: '#64748b', fontSize: 14 }}>
              Sign in to AmpEdge Admin Dashboard
            </p>
          </div>

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 24 }}>
              <label style={{
                display: 'block',
                fontSize: 13,
                fontWeight: 600,
                color: '#334155',
                marginBottom: 8,
              }}>
                Admin Phone Number
              </label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter your phone number"
                style={{
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
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#2979ff';
                  e.target.style.boxShadow = '0 0 0 3px rgba(41, 121, 255, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e2e8f0';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
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
                position: 'relative',
                overflow: 'hidden',
              }}
              onMouseOver={(e) => {
                if (!loading) {
                  e.target.style.boxShadow = '0 6px 28px rgba(41, 121, 255, 0.5)';
                  e.target.style.transform = 'translateY(-1px)';
                }
              }}
              onMouseOut={(e) => {
                e.target.style.boxShadow = '0 4px 20px rgba(41, 121, 255, 0.35)';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              {loading ? 'Authenticating...' : 'Sign In →'}
            </button>
          </form>

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
