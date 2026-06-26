import React, { useState, useContext, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, SafeAreaView, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import { Mail, Lock, Phone, Eye, EyeOff, ArrowRight } from 'lucide-react-native';
import { Image } from 'react-native';
import NotificationService from '../../services/NotificationService';

export default function LoginScreen({ navigation }) {
  const [mode, setMode] = useState('email'); // 'email' | 'otp'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmResult, setConfirmResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState('CUSTOMER');
  const [error, setError] = useState('');
  
  // OTP Retry Timer
  const [otpCooldown, setOtpCooldown] = useState(0);
  const timerRef = useRef(null);

  const { loginWithOtp, loginWithEmail, skipLogin } = useContext(AuthContext);
  const { theme } = useTheme();
  const c = theme.colors;

  useEffect(() => {
    // Initialize notification service
    NotificationService.initialize();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startOtpTimer = () => {
    setOtpCooldown(60);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setOtpCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleEmailLogin = async () => {
    if (!email || !password) { setError('Please enter email and password'); return; }
    setError('');
    setLoading(true);
    const res = await loginWithEmail(email, password);
    setLoading(false);
    if (!res.success) {
      setError(res.error || 'Login failed');
    } else {
      // Register notification token
      await NotificationService.registerTokenWithBackend();
    }
  };

  const requestOtp = async () => {
    if (!phone || phone.length !== 10) {
      setError('Phone number must be exactly 10 digits');
      return;
    }
    if (!/^[6-9]/.test(phone)) {
      setError('Phone number must start with 6, 7, 8, or 9');
      return;
    }
    setError('');
    setLoading(true);
    // Simulate OTP request (in production: use Firebase Phone Auth)
    setTimeout(() => {
      setConfirmResult(true);
      setLoading(false);
      startOtpTimer();
    }, 1000);
  };

  const verifyOtp = async () => {
    if (!otp || otp.length < 4) {
      setError('Please enter a valid OTP');
      return;
    }
    setError('');
    setLoading(true);
    const mockToken = `mock-token-${phone}`;
    const res = await loginWithOtp(mockToken, role);
    setLoading(false);
    if (!res.success) {
      setError(res.error || 'Verification failed');
    } else {
      await NotificationService.registerTokenWithBackend();
    }
  };

  const resendOtp = () => {
    if (otpCooldown > 0) return;
    setOtp('');
    startOtpTimer();
    // In production: trigger another Firebase OTP send
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* Skip Button */}
          <TouchableOpacity style={styles.skipButton} onPress={skipLogin}>
            <Text style={[styles.skipText, { color: c.textMuted }]}>Skip</Text>
          </TouchableOpacity>

          {/* Logo Section */}
          <View style={styles.logoSection}>
            <Image source={require('../../../assets/icon.png')} style={styles.logoImage} resizeMode="contain" />
            <Text style={[styles.tagline, { color: c.textSecondary }]}>Powering the Edge of Tomorrow.</Text>
          </View>

          {/* Role Toggle */}
          <View style={[styles.roleToggle, { backgroundColor: c.surfaceAlt }]}>
            {['CUSTOMER', 'TECHNICIAN'].map(r => (
              <TouchableOpacity
                key={r}
                style={[styles.roleBtn, role === r && styles.roleBtnActive]}
                onPress={() => setRole(r)}
              >
                <Text style={[styles.roleBtnText, role === r && styles.roleBtnTextActive]}>
                  {r === 'CUSTOMER' ? '🏠 Customer' : '🔧 Technician'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Mode Tabs */}
          <View style={[styles.modeTabs, { backgroundColor: c.surfaceAlt }]}>
            <TouchableOpacity style={[styles.modeTab, mode === 'email' && styles.modeTabActive]} onPress={() => { setMode('email'); setError(''); }}>
              <Mail size={16} color={mode === 'email' ? '#fff' : c.textMuted} />
              <Text style={[styles.modeTabText, mode === 'email' && styles.modeTabTextActive]}>Email</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.modeTab, mode === 'otp' && styles.modeTabActive]} onPress={() => { setMode('otp'); setError(''); }}>
              <Phone size={16} color={mode === 'otp' ? '#fff' : c.textMuted} />
              <Text style={[styles.modeTabText, mode === 'otp' && styles.modeTabTextActive]}>Phone OTP</Text>
            </TouchableOpacity>
          </View>

          {/* Error Display */}
          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Login Form */}
          <View style={styles.form}>
            {mode === 'email' ? (
              <>
                <View style={[styles.inputWrapper, { borderColor: c.border, backgroundColor: c.surface }]}>
                  <Mail size={20} color={c.textMuted} />
                  <TextInput
                    style={[styles.input, { color: c.text }]}
                    placeholder="Enter your email"
                    placeholderTextColor={c.textMuted}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={(t) => { setEmail(t); setError(''); }}
                  />
                </View>
                <View style={[styles.inputWrapper, { borderColor: c.border, backgroundColor: c.surface }]}>
                  <Lock size={20} color={c.textMuted} />
                  <TextInput
                    style={[styles.input, { color: c.text }]}
                    placeholder="Enter your password"
                    placeholderTextColor={c.textMuted}
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={(t) => { setPassword(t); setError(''); }}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff size={20} color={c.textMuted} /> : <Eye size={20} color={c.textMuted} />}
                  </TouchableOpacity>
                </View>
                <TouchableOpacity style={styles.primaryBtn} onPress={handleEmailLogin} disabled={loading}>
                  <LinearGradient colors={['#4169E1', '#2c4fd4']} style={styles.primaryBtnGrad}>
                    {loading ? <ActivityIndicator color="#fff" /> : (
                      <>
                        <Text style={styles.primaryBtnText}>Login</Text>
                        <ArrowRight size={18} color="#fff" />
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </>
            ) : (
              <>
                {!confirmResult ? (
                  <>
                    <View style={[styles.inputWrapper, { borderColor: c.border, backgroundColor: c.surface }]}>
                      <Phone size={20} color={c.textMuted} />
                      <Text style={{ color: c.textMuted, fontSize: 16, marginRight: 4 }}>+91</Text>
                      <TextInput
                        style={[styles.input, { color: c.text }]}
                        placeholder="10-digit Phone Number"
                        placeholderTextColor={c.textMuted}
                        keyboardType="phone-pad"
                        value={phone}
                        onChangeText={(t) => { setPhone(t.replace(/[^0-9]/g, '')); setError(''); }}
                        maxLength={10}
                      />
                    </View>
                    <TouchableOpacity style={styles.primaryBtn} onPress={requestOtp} disabled={loading}>
                      <LinearGradient colors={['#4169E1', '#2c4fd4']} style={styles.primaryBtnGrad}>
                        {loading ? <ActivityIndicator color="#fff" /> : (
                          <>
                            <Text style={styles.primaryBtnText}>Send OTP</Text>
                            <ArrowRight size={18} color="#fff" />
                          </>
                        )}
                      </LinearGradient>
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <Text style={[styles.otpSent, { color: c.textSecondary }]}>
                      OTP sent to +91{phone}
                    </Text>
                    <View style={[styles.inputWrapper, { borderColor: c.border, backgroundColor: c.surface }]}>
                      <Lock size={20} color={c.textMuted} />
                      <TextInput
                        style={[styles.input, { color: c.text }]}
                        placeholder="Enter 6-digit OTP"
                        placeholderTextColor={c.textMuted}
                        keyboardType="number-pad"
                        value={otp}
                        onChangeText={(t) => { setOtp(t); setError(''); }}
                        maxLength={6}
                      />
                    </View>
                    <TouchableOpacity style={styles.primaryBtn} onPress={verifyOtp} disabled={loading}>
                      <LinearGradient colors={['#4169E1', '#2c4fd4']} style={styles.primaryBtnGrad}>
                        {loading ? <ActivityIndicator color="#fff" /> : (
                          <>
                            <Text style={styles.primaryBtnText}>Verify & Login</Text>
                            <ArrowRight size={18} color="#fff" />
                          </>
                        )}
                      </LinearGradient>
                    </TouchableOpacity>

                    {/* Resend OTP with Timer */}
                    <View style={styles.resendRow}>
                      <Text style={[styles.resendLabel, { color: c.textMuted }]}>Didn't receive OTP?</Text>
                      {otpCooldown > 0 ? (
                        <Text style={[styles.resendTimer, { color: c.textMuted }]}>Resend in {otpCooldown}s</Text>
                      ) : (
                        <TouchableOpacity onPress={resendOtp}>
                          <Text style={styles.resendLink}>Resend OTP</Text>
                        </TouchableOpacity>
                      )}
                    </View>

                    {/* Change phone number */}
                    <TouchableOpacity onPress={() => { setConfirmResult(null); setOtp(''); setError(''); }} style={styles.changePhoneBtn}>
                      <Text style={{ color: '#4169E1', fontWeight: '600', fontSize: 13 }}>← Change Phone Number</Text>
                    </TouchableOpacity>
                  </>
                )}
              </>
            )}
          </View>

          {/* Signup Link */}
          <View style={styles.switchRow}>
            <Text style={{ color: c.textMuted, fontSize: 14 }}>Don't have an account?</Text>
            <TouchableOpacity onPress={() => navigation?.navigate?.('Signup') || null}>
              <Text style={styles.switchLink}> Sign Up</Text>
            </TouchableOpacity>
          </View>

          {/* Trust Badges */}
          <View style={styles.trustRow}>
            <Text style={styles.trustBadge}>🔒 Secure</Text>
            <Text style={styles.trustBadge}>⚡ Fast</Text>
            <Text style={styles.trustBadge}>✅ Verified</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { flexGrow: 1, padding: 24, justifyContent: 'center' },
  skipButton: { position: 'absolute', top: 10, right: 0, padding: 8, zIndex: 10 },
  skipText: { fontSize: 15, fontWeight: '600' },
  logoSection: { alignItems: 'center', marginBottom: 36 },
  logoImage: { width: 160, height: 160, marginBottom: 8 },
  tagline: { fontSize: 14, marginTop: 4, textAlign: 'center' },
  roleToggle: { flexDirection: 'row', borderRadius: 12, padding: 4, marginBottom: 20, gap: 4 },
  roleBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  roleBtnActive: { backgroundColor: '#4169E1' },
  roleBtnText: { fontSize: 13, fontWeight: '700', color: '#64748b' },
  roleBtnTextActive: { color: '#fff' },
  modeTabs: { flexDirection: 'row', borderRadius: 12, padding: 4, marginBottom: 16, gap: 4 },
  modeTab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 10, gap: 6 },
  modeTabActive: { backgroundColor: '#4169E1' },
  modeTabText: { fontSize: 13, fontWeight: '700', color: '#64748b' },
  modeTabTextActive: { color: '#fff' },
  errorBox: { backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fecaca', borderRadius: 12, padding: 12, marginBottom: 16 },
  errorText: { color: '#dc2626', fontSize: 13, fontWeight: '600', textAlign: 'center' },
  form: { gap: 16 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderRadius: 14, paddingHorizontal: 16, height: 56, gap: 12 },
  input: { flex: 1, fontSize: 15, fontWeight: '500' },
  primaryBtn: { borderRadius: 14, overflow: 'hidden', shadowColor: '#4169E1', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 4 },
  primaryBtnGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, gap: 8 },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  otpSent: { textAlign: 'center', marginBottom: 8, fontSize: 13, fontWeight: '600' },
  resendRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 4, marginTop: 12 },
  resendLabel: { fontSize: 13 },
  resendTimer: { fontSize: 13, fontWeight: '700' },
  resendLink: { color: '#4169E1', fontWeight: '700', fontSize: 13 },
  changePhoneBtn: { alignItems: 'center', marginTop: 8 },
  switchRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  switchLink: { color: '#4169E1', fontWeight: '700', fontSize: 14 },
  trustRow: { flexDirection: 'row', justifyContent: 'center', gap: 16, marginTop: 32 },
  trustBadge: { fontSize: 12, color: '#94a3b8', fontWeight: '600' },
});
