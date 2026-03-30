import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { User, CreditCard, Star, Settings, LogOut, ChevronRight, MapPin } from 'lucide-react-native';

export default function Profile({ navigation }) {
  const { user, logout } = useContext(AuthContext);

  const menuItems = [
    { id: 1, title: 'My Bookings', icon: Star, action: () => navigation.navigate('MyBookings') },
    { id: 2, title: 'Manage Addresses', icon: MapPin, action: () => {} },
    { id: 3, title: 'Wallet & Referrals', icon: CreditCard, action: () => {} },
    { id: 4, title: 'Settings', icon: Settings, action: () => {} },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <User size={32} color="#1e56a0" />
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.name || 'Customer'}</Text>
            <Text style={styles.userPhone}>{user?.phone || '+91 -'}</Text>
          </View>
        </View>

        {/* Subscription Card */}
        <View style={styles.subscriptionCard}>
          <Text style={styles.subscriptionTitle}>AmpEdge Pro</Text>
          <Text style={styles.subscriptionDesc}>Get priority bookings and 10% off always!</Text>
          <TouchableOpacity style={styles.subscriptionBtn}>
            <Text style={styles.subscriptionBtnText}>View Plans</Text>
          </TouchableOpacity>
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          <Text style={styles.sectionTitle}>Account Setup</Text>
          {menuItems.map((item) => (
            <TouchableOpacity key={item.id} style={styles.menuItem} onPress={item.action}>
              <View style={styles.menuItemLeft}>
                <View style={styles.iconBox}>
                  <item.icon size={20} color="#334155" />
                </View>
                <Text style={styles.menuItemTitle}>{item.title}</Text>
              </View>
              <ChevronRight size={20} color="#cbd5e1" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <LogOut size={20} color="#ef4444" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#e0e7ff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
  },
  userPhone: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  subscriptionCard: {
    margin: 20,
    padding: 24,
    borderRadius: 16,
    backgroundColor: '#0f172a',
  },
  subscriptionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  subscriptionDesc: {
    color: '#94a3b8',
    fontSize: 14,
    marginBottom: 16,
  },
  subscriptionBtn: {
    backgroundColor: '#3b82f6',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  subscriptionBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  menuContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#f1f5f9',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 16,
    marginTop: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#fef2f2',
    margin: 20,
    padding: 16,
    borderRadius: 16,
  },
  logoutText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '700',
  },
});
