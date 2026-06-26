import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, SafeAreaView, ScrollView, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import { Mail, Lock, Phone, User, Eye, EyeOff, ArrowRight, CheckCircle } from 'lucide-react-native';

export default function SignupScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('CUSTOMER');
  const [referralCode, setReferralCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const { signup } = useContext(AuthContext);
  const { theme } = useTheme();
  const c = theme.colors;

  const handleSignup = async () => {
    if (!name || !password) { alert('Please fill Name and Password'); return; }
    if (phone && phone.length !== 10) { alert('Phone number must be exactly 10 digits'); return; }
    if (!phone && !email) { alert('Please provide either Email or Phone number'); return; }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { alert('Please enter a valid email address'); return; }
    if (password.length < 6) { alert('Password must be at least 6 characters'); return; }
    if (!agreed) { alert('Please agree to Terms & Conditions'); return; }
    
    setLoading(true);
    const res = await signup(name, email, phone, password, role);
    setLoading(false);
    if (!res.success) alert(res.error);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          <View style={styles.logoSection}>
            <Image source={require('../../../assets/icon.png')} style={styles.logoImage} resizeMode="contain" />
            <Text style={[styles.title, { color: c.text }]}>Create Account</Text>
            <Text style={[styles.subtitle, { color: c.textSecondary }]}>Join AmpEdge for premium electrical services</Text>
          </View>

          {/* Role Selection */}
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

          {/* Form */}
          <View style={styles.form}>
            <View style={[styles.inputWrapper, { borderColor: c.border, backgroundColor: c.surface }]}>
              <User size={20} color={c.textMuted} />
              <TextInput style={[styles.input, { color: c.text }]} placeholder="Full Name *" placeholderTextColor={c.textMuted} value={name} onChangeText={setName} />
            </View>

            <View style={[styles.inputWrapper, { borderColor: c.border, backgroundColor: c.surface }]}>
              <Mail size={20} color={c.textMuted} />
              <TextInput style={[styles.input, { color: c.text }]} placeholder="Email Address (Optional)" placeholderTextColor={c.textMuted} keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
            </View>

            <View style={[styles.inputWrapper, { borderColor: c.border, backgroundColor: c.surface }]}>
              <Phone size={20} color={c.textMuted} />
              <Text style={{ color: c.textMuted, fontSize: 16, marginRight: 4 }}>+91</Text>
              <TextInput style={[styles.input, { color: c.text }]} placeholder="Phone Number (10 digits)" placeholderTextColor={c.textMuted} keyboardType="phone-pad" value={phone} onChangeText={(t) => setPhone(t.replace(/[^0-9]/g, ''))} maxLength={10} />
            </View>

            <View style={[styles.inputWrapper, { borderColor: c.border, backgroundColor: c.surface }]}>
              <Lock size={20} color={c.textMuted} />
              <TextInput style={[styles.input, { color: c.text }]} placeholder="Password (min 6 chars) *" placeholderTextColor={c.textMuted} secureTextEntry={!showPassword} value={password} onChangeText={setPassword} />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff size={20} color={c.textMuted} /> : <Eye size={20} color={c.textMuted} />}
              </TouchableOpacity>
            </View>

            <View style={[styles.inputWrapper, { borderColor: c.border, backgroundColor: c.surface }]}>
              <Text style={{ fontSize: 20 }}>🎁</Text>
              <TextInput style={[styles.input, { color: c.text }]} placeholder="Referral Code (Optional)" placeholderTextColor={c.textMuted} autoCapitalize="characters" value={referralCode} onChangeText={setReferralCode} />
            </View>

            {/* Terms */}
            <TouchableOpacity style={styles.termsRow} onPress={() => setAgreed(!agreed)}>
              <View style={[styles.checkbox, agreed && styles.checkboxActive]}>
                {agreed && <CheckCircle size={16} color="#fff" />}
              </View>
              <Text style={{ color: c.textMuted, fontSize: 13, flex: 1 }}>
                I agree to the <Text style={{ color: '#4169E1', fontWeight: '700' }}>Terms & Conditions</Text> and <Text style={{ color: '#4169E1', fontWeight: '700' }}>Privacy Policy</Text>
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.primaryBtn} onPress={handleSignup} disabled={loading}>
              <LinearGradient colors={['#4169E1', '#2c4fd4']} style={styles.primaryBtnGrad}>
                {loading ? <ActivityIndicator color="#fff" /> : (
                  <>
                    <Text style={styles.primaryBtnText}>Create Account</Text>
                    <ArrowRight size={18} color="#fff" />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View style={styles.switchRow}>
            <Text style={{ color: c.textMuted, fontSize: 14 }}>Already have an account?</Text>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.switchLink}> Login</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { flexGrow: 1, padding: 24, paddingTop: 48 },
  logoSection: { alignItems: 'center', marginBottom: 28 },
  logoImage: { width: 140, height: 140, marginBottom: 8 },
  title: { fontSize: 28, fontWeight: '900', letterSpacing: -0.5 },
  subtitle: { fontSize: 14, marginTop: 4, textAlign: 'center' },
  roleToggle: { flexDirection: 'row', borderRadius: 12, padding: 4, marginBottom: 20, gap: 4 },
  roleBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  roleBtnActive: { backgroundColor: '#4169E1' },
  roleBtnText: { fontSize: 13, fontWeight: '700', color: '#64748b' },
  roleBtnTextActive: { color: '#fff' },
  form: { gap: 14 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderRadius: 14, paddingHorizontal: 16, height: 54, gap: 12 },
  input: { flex: 1, fontSize: 15, fontWeight: '500' },
  termsRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginVertical: 4 },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: '#e2e8f0', alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  checkboxActive: { backgroundColor: '#4169E1', borderColor: '#4169E1' },
  primaryBtn: { borderRadius: 14, overflow: 'hidden', shadowColor: '#4169E1', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 4 },
  primaryBtnGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, gap: 8 },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  switchRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 24, marginBottom: 20 },
  switchLink: { color: '#4169E1', fontWeight: '700', fontSize: 14 },
});
