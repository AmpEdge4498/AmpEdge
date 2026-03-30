import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, TextInput, Alert, ActivityIndicator } from 'react-native';
import { Search, MapPin, Zap, Wrench, Sparkles, ShieldCheck, HardHat, ChevronRight, ShoppingCart } from 'lucide-react-native';
import * as Location from 'expo-location';
import { useCart } from '../../context/CartContext';
import api from '../../services/api';

export default function CustomerHome({ navigation }) {
  const [services, setServices] = useState([]);
  const [locationName, setLocationName] = useState('Locating...');
  const [loading, setLoading] = useState(true);
  
  const { cart, addToCart } = useCart();

  useEffect(() => {
    fetchServices();
    requestLocation();
  }, []);

  const requestLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationName('Location Permission Denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      let reverseGeo = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      });
      
      if (reverseGeo && reverseGeo.length > 0) {
        const place = reverseGeo[0];
        // E.g., "Sector 45, Delhi"
        const name = [place.street, place.subregion || place.city].filter(Boolean).join(', ');
        setLocationName(name || 'Unknown Location');
      } else {
        setLocationName('Unknown Location');
      }
    } catch (error) {
      console.log('Location error:', error);
      setLocationName('Unable to fetch location');
    }
  };

  const fetchServices = async () => {
    try {
      setLoading(true);
      const res = await api.get('/services');
      if (res.data.success) {
        setServices(res.data.data.slice(0, 5)); // Fetch real interconnected services from backend
      }
    } catch (err) {
      console.log('Error fetching home services', err);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { id: 1, name: 'Repairs', icon: Wrench, color: '#fef3c7', iconColor: '#d97706' },
    { id: 2, name: 'Installation', icon: HardHat, color: '#e0e7ff', iconColor: '#4f46e5' },
    { id: 3, name: 'Emergency', icon: Zap, color: '#fee2e2', iconColor: '#dc2626' },
    { id: 4, name: 'Audit', icon: ShieldCheck, color: '#dcfce7', iconColor: '#16a34a' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} stickyHeaderIndices={[1]}>
        
        {/* Header / Location Info */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good Morning, User 👋</Text>
            <View style={styles.locationContainer}>
              <MapPin size={16} color="#1e56a0" />
              <Text style={styles.locationText} numberOfLines={1}>{locationName}</Text>
              <ChevronRight size={16} color="#94a3b8" />
            </View>
          </View>
          <TouchableOpacity 
            style={styles.cartBtn} 
            onPress={() => navigation.navigate('BookingConfirm')}
          >
            <ShoppingCart size={24} color="#0f172a" />
            {cart.length > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cart.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Search Bar - Sticky */}
        <View style={styles.searchWrapper}>
          <View style={styles.searchBar}>
            <Search size={20} color="#94a3b8" style={{marginLeft: 12}} />
            <TextInput 
              placeholder="Search for 'AC Repair', 'Wiring'..." 
              style={styles.searchInput}
              placeholderTextColor="#94a3b8"
            />
          </View>
        </View>

        {/* Promo Banner */}
        <View style={styles.promoBanner}>
          <View style={styles.promoContent}>
            <Sparkles size={24} color="#fcd34d" />
            <Text style={styles.promoTitle}>AmpEdge Pro is here!</Text>
            <Text style={styles.promoSub}>Get flat 20% off on all repairs.</Text>
            <TouchableOpacity style={styles.promoBtn}>
              <Text style={styles.promoBtnText}>View Plans</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Categories Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What are you looking for?</Text>
          <View style={styles.grid}>
            {categories.map((cat) => (
              <TouchableOpacity 
                key={cat.id} 
                style={styles.gridItem}
                onPress={() => navigation.navigate('ServiceList', { category: cat.name })}
              >
                <View style={[styles.iconWrapper, { backgroundColor: cat.color }]}>
                  <cat.icon size={28} color={cat.iconColor} />
                </View>
                <Text style={styles.gridText}>{cat.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recommended Services */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Most Booked Services</Text>
            <TouchableOpacity onPress={() => navigation.navigate('ServiceList', { category: 'ALL' })}>
              <Text style={styles.seeAll}>Explore All</Text>
            </TouchableOpacity>
          </View>
          
          {loading ? (
             <ActivityIndicator size="large" color="#1e56a0" style={{marginTop: 20}} />
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}>
              {services.map((svc) => (
                <TouchableOpacity 
                  key={svc._id} 
                  style={styles.serviceCard}
                  onPress={() => navigation.navigate('BookingDetails', { service: svc })}
                >
                  <View style={styles.serviceCardImage} />
                  <View style={styles.serviceCardContent}>
                    <Text style={styles.serviceCardTitle} numberOfLines={1}>{svc.name}</Text>
                    <Text style={styles.serviceCardPrice}>₹{svc.basePrice}</Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.addBtn}
                    onPress={() => {
                       addToCart(svc);
                       Alert.alert("Added to Cart", `${svc.name} added successfully!`);
                    }}
                  >
                    <Text style={styles.addBtnText}>ADD TO CART</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
        
        {/* Buffer at bottom for tab bar */}
        <View style={{height: 40}} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '600',
    marginBottom: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
    maxWidth: 200,
  },
  cartBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#ef4444',
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
  },
  searchWrapper: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    zIndex: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 16,
    height: 54,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  searchInput: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#0f172a',
    fontWeight: '500',
  },
  promoBanner: {
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 24,
    backgroundColor: '#0f172a',
    borderRadius: 20,
    overflow: 'hidden',
  },
  promoContent: {
    padding: 24,
  },
  promoTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
    marginTop: 12,
    marginBottom: 4,
  },
  promoSub: {
    color: '#94a3b8',
    fontSize: 14,
    marginBottom: 16,
  },
  promoBtn: {
    backgroundColor: '#fff',
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  promoBtnText: {
    color: '#0f172a',
    fontWeight: '700',
    fontSize: 13,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  seeAll: {
    color: '#1e56a0',
    fontWeight: '600',
    fontSize: 14,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 10,
  },
  gridItem: {
    width: '25%',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  gridText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  serviceCard: {
    width: 160,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    marginRight: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  serviceCardImage: {
    width: '100%',
    height: 100,
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    marginBottom: 12,
  },
  serviceCardContent: {
    marginBottom: 12,
  },
  serviceCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
  },
  serviceCardPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e56a0',
  },
  addBtn: {
    backgroundColor: '#e0e7ff',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  addBtnText: {
    color: '#1e56a0',
    fontWeight: '700',
    fontSize: 12,
  },
});
