import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, StyleSheet } from 'react-native';

export default function BookingDetails({ route, navigation }) {
  const { service } = route.params;
  const [address, setAddress] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  const proceedToConfirm = () => {
    if (!address || !date || !time) {
      Alert.alert('Details Required', 'Please fill in all details.');
      return;
    }

    const scheduledTime = new Date().toISOString();

    navigation.navigate('BookingConfirm', {
      service,
      bookingData: {
        addressText: address,
        date,
        time,
        scheduledTime,
      },
    });
  };

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Booking Details</Text>
      <Text style={styles.subtitle}>For: {service.name}</Text>

      <Text style={styles.label}>Service Address</Text>
      <TextInput
        placeholder="Enter your full address"
        style={styles.input}
        multiline
        numberOfLines={3}
        value={address}
        onChangeText={setAddress}
        placeholderTextColor="#adb5bd"
      />

      <Text style={styles.label}>Preferred Date</Text>
      <TextInput
        placeholder="e.g., Tomorrow, 14th Oct"
        style={styles.input}
        value={date}
        onChangeText={setDate}
        placeholderTextColor="#adb5bd"
      />

      <Text style={styles.label}>Preferred Time</Text>
      <TextInput
        placeholder="e.g., 10:00 AM"
        style={[styles.input, { marginBottom: 40 }]}
        value={time}
        onChangeText={setTime}
        placeholderTextColor="#adb5bd"
      />

      <TouchableOpacity style={styles.nextBtn} onPress={proceedToConfirm}>
        <Text style={styles.nextBtnText}>Next →</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', padding: 20, paddingTop: 50 },
  backBtn: { marginBottom: 16 },
  backText: { color: '#4169E1', fontWeight: '700', fontSize: 15 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1a1a2e', marginBottom: 4 },
  subtitle: { color: '#6c757d', marginBottom: 30, fontSize: 15 },
  label: { fontSize: 13, fontWeight: '700', color: '#495057', marginBottom: 8 },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    fontSize: 15,
    color: '#1a1a2e',
  },
  nextBtn: {
    backgroundColor: '#4169E1',
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 40,
  },
  nextBtnText: { color: '#fff', fontWeight: '700', fontSize: 17 },
});
