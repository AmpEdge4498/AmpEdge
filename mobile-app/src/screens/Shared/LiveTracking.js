import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import * as Location from 'expo-location';
import { AuthContext } from '../../context/AuthContext';
import apiClient from '../../services/api';

export default function LiveTracking({ route, navigation }) {
  const booking = route.params?.booking || {};
  const { user } = useContext(AuthContext);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);

  const isTechnician = user?.role === 'TECHNICIAN';

  const destination = {
    latitude: booking?.serviceAddress?.lat || 28.6139,
    longitude: booking?.serviceAddress?.lng || 77.2090,
  };

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required for tracking.');
        setLoading(false);
        return;
      }

      let loc = await Location.getCurrentPositionAsync({});
      setLocation({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });

      if (isTechnician) {
        updateMyBackendLocation(loc.coords.latitude, loc.coords.longitude);
      }

      setLoading(false);
    })();
  }, []);

  const updateMyBackendLocation = async (lat, lng) => {
    try {
      await apiClient.put('/users/location', { lat, lng });
    } catch (e) {
      console.log('Failed to update tracking', e);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4169E1" />
        <Text style={styles.loadingText}>Getting your location...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      {/* Map Placeholder */}
      <View style={styles.mapPlaceholder}>
        <Text style={styles.mapIcon}>🗺️</Text>
        <Text style={styles.mapTitle}>Live Tracking</Text>
        {location && (
          <Text style={styles.coordText}>
            📍 Your Location: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
          </Text>
        )}
        <Text style={styles.coordText}>
          📌 Destination: {destination.latitude.toFixed(4)}, {destination.longitude.toFixed(4)}
        </Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {isTechnician ? '🛵 Navigating to Customer' : '⏳ Technician is arriving'}
          </Text>
        </View>
      </View>

      {/* Status Card */}
      <View style={styles.statusCard}>
        <Text style={styles.statusTitle}>
          {isTechnician ? 'Navigation Active' : 'Technician En Route'}
        </Text>
        <Text style={styles.statusSub}>
          {isTechnician
            ? 'Your location is being shared with the customer.'
            : 'Your technician is on the way. You will be notified on arrival.'}
        </Text>
        <View style={styles.etaRow}>
          <Text style={styles.etaLabel}>ETA</Text>
          <Text style={styles.etaValue}>~15 min</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', padding: 20, paddingTop: 50 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8f9fa' },
  loadingText: { marginTop: 12, color: '#6c757d', fontSize: 15 },
  backBtn: { marginBottom: 16 },
  backText: { color: '#4169E1', fontWeight: '700', fontSize: 15 },
  mapPlaceholder: {
    flex: 1,
    backgroundColor: '#e3f2fd',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#bbdefb',
    borderStyle: 'dashed',
  },
  mapIcon: { fontSize: 60, marginBottom: 12 },
  mapTitle: { fontSize: 22, fontWeight: '700', color: '#1565c0', marginBottom: 16 },
  coordText: { color: '#37474f', fontSize: 13, marginBottom: 6 },
  badge: {
    marginTop: 16,
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  badgeText: { color: '#1565c0', fontWeight: '700', fontSize: 14 },
  statusCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
    marginBottom: 20,
  },
  statusTitle: { fontSize: 18, fontWeight: '700', color: '#1a1a2e', marginBottom: 6 },
  statusSub: { fontSize: 14, color: '#6c757d', lineHeight: 20 },
  etaRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#e9ecef' },
  etaLabel: { color: '#6c757d', fontWeight: '600', fontSize: 14 },
  etaValue: { color: '#4169E1', fontWeight: '700', fontSize: 16 },
});
