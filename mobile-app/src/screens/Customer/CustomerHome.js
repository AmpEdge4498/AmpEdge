import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, TextInput, Alert, ActivityIndicator, Linking, Modal } from 'react-native';
import { Search, MapPin, Zap, Wrench, Sparkles, ShieldCheck, HardHat, ChevronRight, ShoppingCart, MessageCircle, CheckCircle, Star, Settings, Send, Bot, X } from 'lucide-react-native';
import * as Location from 'expo-location';
import { useCart } from '../../context/CartContext';
import { useTheme } from '../../context/ThemeContext';
import api from '../../services/api';
import { LinearGradient } from 'expo-linear-gradient';

export default function CustomerHome({ navigation }) {
  const [services, setServices] = useState([]);
  const [locationName, setLocationName] = useState('Locating...');
  const [loading, setLoading] = useState(true);
  const [aiVisible, setAiVisible] = useState(false);
  const [aiMsg, setAiMsg] = useState('');
  const [aiChat, setAiChat] = useState([
    { role: 'bot', text: "Hello! I'm AmpEdge AI Assistant. How can I help you with your electrical needs today?" }
  ]);
  
  const { cart, addToCart, cartItemCount } = useCart();
  const { theme } = useTheme();
  const c = theme.colors;

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
        // Build location string from available fields with multiple fallbacks
        const parts = [
          place.name,
          place.street,
          place.district,
          place.subregion,
          place.city,
          place.region
        ].filter(Boolean);
        // Take the first 2 meaningful parts
        const uniqueParts = [...new Set(parts)].slice(0, 2);
        const locName = uniqueParts.join(', ');
        setLocationName(locName || place.formattedAddress || `${location.coords.latitude.toFixed(2)}, ${location.coords.longitude.toFixed(2)}`);
      } else {
        // Fallback to coordinates if reverse geocode fails
        setLocationName(`${location.coords.latitude.toFixed(4)}, ${location.coords.longitude.toFixed(4)}`);
      }
    } catch (error) {
      console.log('Location error:', error);
      setLocationName('Tap to set location');
    }
  };

  const fetchServices = async () => {
    try {
      setLoading(true);
      const res = await api.get('/services');
      if (res.data.success) {
        setServices(res.data.data.slice(0, 5));
      }
    } catch (err) {
      console.log('Error fetching home services', err);
    } finally {
      setLoading(false);
    }
  };

  const sendAiMessage = () => {
    if (!aiMsg.trim()) return;
    const userText = aiMsg.trim();
    setAiChat(prev => [...prev, { role: 'user', text: userText }]);
    setAiMsg('');
    
    // Simple AI responses
    setTimeout(() => {
      let reply = "I'd be happy to help with that! You can book a service through the 'Book a Service' button on the home page, or browse our marketplace for electrical products.";
      const lower = userText.toLowerCase();
      if (lower.includes('price') || lower.includes('cost')) {
        reply = "Our service prices start from ₹199. You can check exact pricing in the Services section. We offer transparent pricing with no hidden charges!";
      } else if (lower.includes('emergency') || lower.includes('urgent')) {
        reply = "For emergencies, we offer same-day service! Book through the Emergency category or call our 24/7 helpline. Average response time is 30 minutes.";
      } else if (lower.includes('cancel') || lower.includes('refund')) {
        reply = "You can cancel a booking from My Bookings section before the technician arrives. Full refund is processed within 3-5 business days.";
      } else if (lower.includes('technician') || lower.includes('engineer')) {
        reply = "All our technicians are verified, licensed professionals with 3+ years of experience. They undergo background checks and regular training.";
      } else if (lower.includes('warranty')) {
        reply = "We provide a 90-day warranty on all services. If any issue arises, we'll fix it free of charge!";
      } else if (lower.includes('hi') || lower.includes('hello')) {
        reply = "Hi there! 👋 I can help you with booking services, finding products, checking prices, or answering questions about AmpEdge.";
      }
      setAiChat(prev => [...prev, { role: 'bot', text: reply }]);
    }, 800);
  };

  const categories = [
    { id: 1, name: 'Repairs', icon: Wrench, color: '#fef3c7', iconColor: '#d97706' },
    { id: 2, name: 'Installation', icon: HardHat, color: '#e0e7ff', iconColor: '#4f46e5' },
    { id: 3, name: 'Emergency', icon: Zap, color: '#fee2e2', iconColor: '#dc2626' },
    { id: 4, name: 'Audit', icon: ShieldCheck, color: '#dcfce7', iconColor: '#16a34a' },
  ];

  const marketplaceCategories = [
    { id: 1, name: 'Switches', icon: '🔦', count: '240+' },
    { id: 2, name: 'Cables', icon: '🪢', count: '180+' },
    { id: 3, name: 'MCB & DB', icon: '⚡', count: '95+' },
    { id: 4, name: 'Lighting', icon: '💡', count: '320+' },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} stickyHeaderIndices={[1]} contentContainerStyle={{ paddingBottom: 100 }}>
        
        {/* Header / Location Info */}
        <View style={[styles.header, { backgroundColor: c.background }]}>
          <View>
            <Text style={[styles.greeting, { color: c.textSecondary }]}>Good Morning, User 👋</Text>
            <View style={styles.locationContainer}>
              <MapPin size={16} color={c.primary} />
              <Text style={[styles.locationText, { color: c.text }]} numberOfLines={1}>{locationName}</Text>
              <ChevronRight size={16} color={c.textMuted} />
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity style={[styles.cartBtn, { backgroundColor: c.surfaceAlt }]} onPress={() => navigation.navigate('SettingsScreen')}>
              <Settings size={22} color={c.text} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.cartBtn, { backgroundColor: c.surfaceAlt }]} 
              onPress={() => navigation.navigate('CartScreen')}
            >
              <ShoppingCart size={22} color={c.text} />
              {cartItemCount > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>{cartItemCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar - Sticky */}
        <View style={[styles.searchWrapper, { backgroundColor: c.background }]}>
          <View style={[styles.searchBar, { backgroundColor: c.surfaceAlt, borderColor: c.border }]}>
            <Search size={20} color={c.textMuted} style={{marginLeft: 12}} />
            <TextInput 
              placeholder="Search for 'AC Repair', 'Wiring'..." 
              style={[styles.searchInput, { color: c.text }]}
              placeholderTextColor={c.textMuted}
            />
          </View>
        </View>

        {/* Web-Style Hero Redesign */}
        <View style={[styles.heroWrapper, { backgroundColor: c.background }]}>
          <LinearGradient
            colors={c.gradient || ['rgba(92, 225, 230, 0.1)', 'rgba(65, 105, 225, 0.05)', 'transparent']}
            style={styles.heroBackground}
          />
          <View style={styles.heroContent}>
            <View style={[styles.heroTag, { backgroundColor: c.primaryLight, borderColor: c.primaryLight }]}>
              <View style={[styles.pulseDot, { backgroundColor: c.primary }]} />
              <Text style={[styles.heroTagText, { color: c.primary }]}>India's Premier Electrical Platform</Text>
            </View>
            <Text style={[styles.heroTitle, { color: c.text }]}>Powering <Text style={{ color: c.primary }}>Reliable</Text>{"\n"}Electrical Solutions</Text>
            <Text style={[styles.heroSub, { color: c.textSecondary }]}>Book certified electricians or buy quality products in minutes.</Text>
            
            <View style={styles.heroCtaBtns}>
              <TouchableOpacity style={styles.heroPrimaryBtn} onPress={() => navigation.navigate('ServiceList', { category: 'ALL' })}>
                <Zap size={18} color="#fff" />
                <Text style={styles.heroPrimaryBtnText}>Book a Service</Text>
              </TouchableOpacity>
            </View>
            
            {/* Floating Dashboard Card */}
            <View style={[styles.floatingDashboard, { backgroundColor: c.surface, borderColor: c.borderLight }]}>
              <View style={styles.fdHeader}>
                <View style={styles.fdIconWrap}><Zap size={16} color="#f59e0b" /></View>
                <View>
                  <Text style={[styles.fdTitle, { color: c.text }]}>Live Service Dashboard</Text>
                  <Text style={[styles.fdSub, { color: c.textSecondary }]}>Booking status · Real-time</Text>
                </View>
              </View>
              <View style={[styles.fdRow, { borderColor: c.borderLight }]}>
                <View style={styles.fdRowLeft}>
                  <View style={[styles.fdRowDot, {backgroundColor: '#22c55e'}]} />
                  <Text style={[styles.fdRowText, { color: c.textSecondary }]}>Wiring Installation</Text>
                </View>
                <Text style={[styles.fdRowPrice, { color: c.text }]}>₹1,499</Text>
              </View>
              <View style={[styles.fdRow, { borderColor: c.borderLight }]}>
                <View style={styles.fdRowLeft}>
                  <View style={[styles.fdRowDot, {backgroundColor: c.primary}]} />
                  <Text style={[styles.fdRowText, { color: c.textSecondary }]}>Smart Home Setup</Text>
                </View>
                <Text style={[styles.fdRowPrice, { color: c.text }]}>₹4,999</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Categories Grid */}
        <View style={styles.section}>
          <View style={[styles.chip, { backgroundColor: c.primaryLight, borderColor: c.primaryLight }]}><View style={[styles.chipDot, { backgroundColor: c.text }]}/><Text style={[styles.chipText, { color: c.text }]}>Our Services</Text></View>
          <Text style={[styles.sectionTitle, { color: c.text }]}>Expert Services,{"\n"}On Your Schedule</Text>
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
                <Text style={[styles.gridText, { color: c.textSecondary }]}>{cat.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recommended Services */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderLine}>
            <Text style={[styles.sectionSubTitle, { color: c.text }]}>Most Booked Services</Text>
            <TouchableOpacity onPress={() => navigation.navigate('ServiceList', { category: 'ALL' })}>
              <Text style={[styles.seeAll, { color: c.primary }]}>Explore All →</Text>
            </TouchableOpacity>
          </View>
          
          {loading ? (
             <ActivityIndicator size="large" color={c.primary} style={{marginTop: 20}} />
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}>
              {services.map((svc) => (
                <TouchableOpacity 
                  key={svc._id} 
                  style={[styles.serviceCard, { backgroundColor: c.surface, borderColor: c.borderLight }]}
                  onPress={() => navigation.navigate('BookingDetails', { service: svc })}
                >
                  <View style={[styles.serviceCardImage, { backgroundColor: c.surfaceAlt }]} />
                  <View style={styles.serviceCardContent}>
                    <Text style={[styles.serviceCardTitle, { color: c.text }]} numberOfLines={1}>{svc.name}</Text>
                    <Text style={[styles.serviceCardPrice, { color: c.primary }]}>₹{svc.basePrice}</Text>
                  </View>
                  <TouchableOpacity 
                    style={[styles.addBtn, { backgroundColor: c.primaryLight }]}
                    onPress={() => {
                       addToCart(svc);
                       Alert.alert("Added to Cart", `${svc.name} added successfully!`);
                    }}
                  >
                    <Text style={[styles.addBtnText, { color: c.primary }]}>ADD TO CART</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Marketplace Section preview */}
        <View style={styles.section}>
          <View style={[styles.chip, { backgroundColor: c.primaryLight, borderColor: c.primaryLight }]}><View style={[styles.chipDot, { backgroundColor: c.text }]} /><Text style={[styles.chipText, { color: c.text }]}>Marketplace</Text></View>
          <Text style={[styles.sectionTitle, { color: c.text }]}>Quality Products,{"\n"}Delivered Fast</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}>
            {marketplaceCategories.map((item) => (
               <View key={item.id} style={[styles.mpcCard, { backgroundColor: c.surfaceAlt, borderColor: c.border }]}>
                 <Text style={styles.mpcIcon}>{item.icon}</Text>
                 <Text style={[styles.mpcTitle, { color: c.text }]}>{item.name}</Text>
                 <Text style={[styles.mpcCount, { color: c.textMuted }]}>{item.count} Products</Text>
               </View>
            ))}
          </ScrollView>
        </View>

        {/* Why AmpEdge (Web feature) */}
        <View style={[styles.section, { backgroundColor: c.darkSection, paddingVertical: 32, marginTop: 20 }]}>
          <View style={[styles.chip, { backgroundColor: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.2)', marginLeft: 20 }]}>
             <View style={[styles.chipDot, { backgroundColor: '#fff' }]} />
             <Text style={[styles.chipText, { color: '#fff' }]}>Why AMPEDGE</Text>
          </View>
          <Text style={[styles.sectionTitle, { color: '#fff', fontSize: 24 }]}>Built on Trust.{"\n"}Engineered for Excellence.</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 16 }}>
            <View style={styles.whyCard}>
              <CheckCircle size={28} color="#22c55e" style={{marginBottom: 12}} />
              <Text style={styles.whyTitle}>Verified Pros</Text>
              <Text style={styles.whySub}>Background-checked & licensed trained engineers.</Text>
            </View>
            <View style={styles.whyCard}>
              <ShieldCheck size={28} color="#3b82f6" style={{marginBottom: 12}} />
              <Text style={styles.whyTitle}>90-Day Warranty</Text>
              <Text style={styles.whySub}>All work is backed by our satisfaction guarantee.</Text>
            </View>
            <View style={styles.whyCard}>
              <Zap size={28} color="#f59e0b" style={{marginBottom: 12}} />
              <Text style={styles.whyTitle}>Fast Response</Text>
              <Text style={styles.whySub}>Same-day service and 24/7 emergency support.</Text>
            </View>
          </ScrollView>
        </View>

        {/* Testimonials */}
        <View style={[styles.section, { marginTop: 32 }]}>
          <View style={[styles.chip, { backgroundColor: c.primaryLight, borderColor: c.primaryLight }]}><View style={[styles.chipDot, { backgroundColor: c.text }]} /><Text style={[styles.chipText, { color: c.text }]}>Testimonials</Text></View>
          <Text style={[styles.sectionTitle, { color: c.text }]}>Trusted by Thousands</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 16 }}>
            <View style={[styles.testiCard, { backgroundColor: c.surface, borderColor: c.borderLight }]}>
              <View style={{flexDirection: 'row', marginBottom: 8}}><Star size={16} color="#f59e0b" fill="#f59e0b"/><Star size={16} color="#f59e0b" fill="#f59e0b"/><Star size={16} color="#f59e0b" fill="#f59e0b"/><Star size={16} color="#f59e0b" fill="#f59e0b"/><Star size={16} color="#f59e0b" fill="#f59e0b"/></View>
              <Text style={[styles.tquote, { color: c.textSecondary }]}>"Completely transformed our office setup. 100% transparent pricing!"</Text>
              <View style={styles.tauthor}>
                <View style={[styles.tavatar, {backgroundColor: '#4169E1'}]}><Text style={{color:'#fff', fontWeight:'bold'}}>R</Text></View>
                <View>
                  <Text style={[styles.tname, { color: c.text }]}>Rahul Sharma</Text>
                  <Text style={[styles.trole, { color: c.textMuted }]}>Delhi</Text>
                </View>
              </View>
            </View>
            <View style={[styles.testiCard, { backgroundColor: c.surface, borderColor: c.borderLight }]}>
              <View style={{flexDirection: 'row', marginBottom: 8}}><Star size={16} color="#f59e0b" fill="#f59e0b"/><Star size={16} color="#f59e0b" fill="#f59e0b"/><Star size={16} color="#f59e0b" fill="#f59e0b"/><Star size={16} color="#f59e0b" fill="#f59e0b"/><Star size={16} color="#f59e0b" fill="#f59e0b"/></View>
              <Text style={[styles.tquote, { color: c.textSecondary }]}>"Needed urgent repair at midnight — they responded in 30 minutes. Incredible!"</Text>
              <View style={styles.tauthor}>
                <View style={[styles.tavatar, {backgroundColor: '#059669'}]}><Text style={{color:'#fff', fontWeight:'bold'}}>P</Text></View>
                <View>
                  <Text style={[styles.tname, { color: c.text }]}>Priya Menon</Text>
                  <Text style={[styles.trole, { color: c.textMuted }]}>Bangalore</Text>
                </View>
              </View>
            </View>
          </ScrollView>
        </View>

      </ScrollView>

      {/* Floating AI Assistant Action Button */}
      <TouchableOpacity 
        style={styles.aiFab} 
        onPress={() => setAiVisible(true)}
        activeOpacity={0.8}
      >
        <Bot size={28} color="#fff" />
      </TouchableOpacity>

      {/* AI Assistant Modal */}
      <Modal visible={aiVisible} animationType="slide" transparent onRequestClose={() => setAiVisible(false)}>
        <View style={styles.aiModalOverlay}>
          <View style={[styles.aiWindow, { backgroundColor: c.surface }]}>
            {/* AI Header */}
            <LinearGradient colors={['#4169E1', '#2c4fd4']} style={styles.aiHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={styles.aiHeaderIcon}><Bot size={20} color="#4169E1" /></View>
                <View>
                  <Text style={styles.aiHeaderTitle}>🤖 AmpEdge AI</Text>
                  <Text style={styles.aiHeaderSub}>Online • Always ready to help</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => setAiVisible(false)}>
                <X size={22} color="#fff" />
              </TouchableOpacity>
            </LinearGradient>

            {/* AI Chat */}
            <ScrollView style={[styles.aiBody, { backgroundColor: c.background }]} contentContainerStyle={{ padding: 16 }}>
              {aiChat.map((msg, idx) => (
                <View key={idx} style={[styles.aiMsgRow, msg.role === 'user' && { justifyContent: 'flex-end' }]}>
                  <View style={[
                    styles.aiBubble,
                    msg.role === 'user' 
                      ? { backgroundColor: '#4169E1', borderBottomRightRadius: 4 } 
                      : { backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, borderBottomLeftRadius: 4 }
                  ]}>
                    <Text style={[styles.aiBubbleText, { color: msg.role === 'user' ? '#fff' : c.text }]}>{msg.text}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>

            {/* AI Input */}
            <View style={[styles.aiInputBar, { backgroundColor: c.surface, borderTopColor: c.border }]}>
              <TextInput
                style={[styles.aiInput, { backgroundColor: c.surfaceAlt, borderColor: c.border, color: c.text }]}
                placeholder="Ask me anything..."
                placeholderTextColor={c.textMuted}
                value={aiMsg}
                onChangeText={setAiMsg}
                onSubmitEditing={sendAiMessage}
              />
              <TouchableOpacity style={styles.aiSendBtn} onPress={sendAiMessage}>
                <Send size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  greeting: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
  locationContainer: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  locationText: { fontSize: 16, fontWeight: '800', maxWidth: 200 },
  cartBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  cartBadge: { position: 'absolute', top: -2, right: -2, backgroundColor: '#ef4444', width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff' },
  cartBadgeText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  searchWrapper: { paddingHorizontal: 20, paddingVertical: 12, zIndex: 10 },
  searchBar: { flexDirection: 'row', alignItems: 'center', borderRadius: 16, height: 54, borderWidth: 1 },
  searchInput: { flex: 1, height: '100%', paddingHorizontal: 16, fontSize: 15, fontWeight: '500' },
  heroWrapper: { paddingVertical: 32, position: 'relative', overflow: 'hidden' },
  heroBackground: { ...StyleSheet.absoluteFillObject },
  heroContent: { paddingHorizontal: 20, position: 'relative', zIndex: 2 },
  heroTag: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, alignSelf: 'flex-start', marginBottom: 16, borderWidth: 1 },
  pulseDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  heroTagText: { fontWeight: '700', fontSize: 12 },
  heroTitle: { fontSize: 36, fontWeight: '900', lineHeight: 44, marginBottom: 12 },
  heroSub: { fontSize: 15, lineHeight: 22, marginBottom: 24, paddingRight: 10 },
  heroCtaBtns: { flexDirection: 'row', alignItems: 'center', marginBottom: 32 },
  heroPrimaryBtn: { backgroundColor: '#4169E1', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, borderRadius: 12, shadowColor: '#4169E1', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 4 },
  heroPrimaryBtnText: { color: '#fff', fontWeight: '700', fontSize: 15, marginLeft: 8 },
  floatingDashboard: { borderRadius: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 8, borderWidth: 1 },
  fdHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  fdIconWrap: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#fffbeb', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  fdTitle: { fontWeight: '800', fontSize: 14 },
  fdSub: { fontSize: 12 },
  fdRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderTopWidth: 1 },
  fdRowLeft: { flexDirection: 'row', alignItems: 'center' },
  fdRowDot: { width: 8, height: 8, borderRadius: 4, marginRight: 10 },
  fdRowText: { fontSize: 13, fontWeight: '600' },
  fdRowPrice: { fontSize: 13, fontWeight: '700' },
  chip: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginBottom: 12, marginLeft: 20, borderWidth: 1 },
  chipDot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  chipText: { fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },
  section: { marginBottom: 24 },
  sectionHeaderLine: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 16 },
  sectionSubTitle: { fontSize: 18, fontWeight: '800' },
  sectionTitle: { fontSize: 18, fontWeight: '800', paddingHorizontal: 20, marginBottom: 16 },
  seeAll: { fontWeight: '600', fontSize: 14 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 10 },
  gridItem: { width: '25%', alignItems: 'center', marginBottom: 20 },
  iconWrapper: { width: 64, height: 64, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  gridText: { fontSize: 12, fontWeight: '600' },
  serviceCard: { width: 160, borderRadius: 16, borderWidth: 1, marginRight: 16, padding: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  serviceCardImage: { width: '100%', height: 100, borderRadius: 12, marginBottom: 12 },
  serviceCardContent: { marginBottom: 12 },
  serviceCardTitle: { fontSize: 14, fontWeight: '700', marginBottom: 4 },
  serviceCardPrice: { fontSize: 14, fontWeight: '600' },
  addBtn: { paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  addBtnText: { fontWeight: '700', fontSize: 12 },
  mpcCard: { borderWidth: 1, borderRadius: 16, padding: 16, width: 130, alignItems: 'center' },
  mpcIcon: { fontSize: 28, marginBottom: 8 },
  mpcTitle: { fontSize: 13, fontWeight: '700', textAlign: 'center', marginBottom: 4 },
  mpcCount: { fontSize: 11, fontWeight: '500' },
  whyCard: { width: 200, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 16, padding: 16 },
  whyTitle: { color: '#fff', fontSize: 16, fontWeight: '700', marginBottom: 6 },
  whySub: { color: 'rgba(255,255,255,0.7)', fontSize: 13, lineHeight: 20 },
  testiCard: { width: 250, borderWidth: 1, borderRadius: 16, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
  tquote: { fontSize: 13, fontStyle: 'italic', lineHeight: 20, marginBottom: 16 },
  tauthor: { flexDirection: 'row', alignItems: 'center' },
  tavatar: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  tname: { fontSize: 13, fontWeight: '700' },
  trole: { fontSize: 11 },
  // AI FAB
  aiFab: { position: 'absolute', bottom: 30, right: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: '#4169E1', alignItems: 'center', justifyContent: 'center', shadowColor: '#4169E1', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 10, elevation: 8 },
  // AI Modal
  aiModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  aiWindow: { borderTopLeftRadius: 24, borderTopRightRadius: 24, height: '75%', overflow: 'hidden' },
  aiHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  aiHeaderIcon: { width: 36, height: 36, borderRadius: 12, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  aiHeaderTitle: { color: '#fff', fontSize: 16, fontWeight: '700' },
  aiHeaderSub: { color: 'rgba(255,255,255,0.7)', fontSize: 12 },
  aiBody: { flex: 1 },
  aiMsgRow: { flexDirection: 'row', marginBottom: 12 },
  aiBubble: { maxWidth: '80%', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 16 },
  aiBubbleText: { fontSize: 14, lineHeight: 20 },
  aiInputBar: { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 10, borderTopWidth: 1 },
  aiInput: { flex: 1, borderWidth: 1, borderRadius: 24, paddingHorizontal: 16, paddingVertical: 10, fontSize: 14 },
  aiSendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#4169E1', alignItems: 'center', justifyContent: 'center' },
});
