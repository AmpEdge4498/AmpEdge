import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, SafeAreaView } from 'react-native';
import { AuthContext } from '../../context/AuthContext';

export default function LoginScreen() {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmResult, setConfirmResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const { loginWithOtp, skipLogin } = useContext(AuthContext);

  const requestOtp = async () => {
    setLoading(true);
    setTimeout(() => {
      setConfirmResult(true);
      setLoading(false);
    }, 1000);
  };

  const verifyOtp = async () => {
    setLoading(true);
    const mockToken = `mock-token-${phone}`;
    const res = await loginWithOtp(mockToken, 'CUSTOMER');
    setLoading(false);
    
    if (!res.success) {
      alert(res.error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.skipButton} onPress={skipLogin}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>
      
      <View style={styles.content}>
        <Text style={styles.title}>AmpEdge</Text>
        <Text style={styles.subtitle}>Premium Electrical Services</Text>

        {!confirmResult ? (
          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Enter Phone Number"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />
            <TouchableOpacity style={styles.button} onPress={requestOtp} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Send OTP</Text>}
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Enter OTP (Any 6 digits)"
              keyboardType="number-pad"
              value={otp}
              onChangeText={setOtp}
            />
            <TouchableOpacity style={styles.button} onPress={verifyOtp} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Verify & Login</Text>}
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  skipButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 8,
  },
  skipText: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '600'
  },
  content: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 36, fontWeight: 'bold', color: '#1e56a0', textAlign: 'center', marginBottom: 5 },
  subtitle: { fontSize: 16, color: '#64748b', textAlign: 'center', marginBottom: 40 },
  form: { width: '100%' },
  input: { borderWidth: 1, borderColor: '#e2e8f0', padding: 15, borderRadius: 12, marginBottom: 20, fontSize: 16, backgroundColor: '#f8fafc' },
  button: { backgroundColor: '#1e56a0', padding: 15, borderRadius: 12, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});
