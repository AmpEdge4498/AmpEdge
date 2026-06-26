import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Switch, Alert } from 'react-native';
import { ArrowLeft, Moon, Globe, Bell, Shield, LogOut, ChevronRight, Heart, Gift, MessageCircle, HelpCircle, Star, Info } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { useI18n } from '../../context/I18nContext';
import { AuthContext } from '../../context/AuthContext';

export default function SettingsScreen({ navigation }) {
  const { theme, isDark, toggleTheme } = useTheme();
  const { locale, changeLocale, t } = useI18n();
  const { user, logout } = useContext(AuthContext);
  const c = theme.colors;

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel' },
      { text: 'Logout', onPress: logout, style: 'destructive' }
    ]);
  };

  const settingsGroups = [
    {
      title: 'Preferences',
      items: [
        {
          icon: Moon, label: t('darkMode'), type: 'switch',
          value: isDark, onPress: toggleTheme,
        },
        {
          icon: Globe, label: t('language'),
          subtitle: locale === 'en' ? 'English' : 'हिन्दी',
          onPress: () => changeLocale(locale === 'en' ? 'hi' : 'en'),
        },
        {
          icon: Bell, label: t('notifications'),
          subtitle: 'Enabled',
          onPress: () => Alert.alert('Notifications', 'Push notification settings'),
        },
      ]
    },
    {
      title: 'Account',
      items: [
        { icon: Heart, label: t('wishlist'), onPress: () => navigation.navigate('CustomerTabs', { screen: 'WishlistTab' }) },
        { icon: Gift, label: t('referral'), onPress: () => navigation.navigate('ReferralScreen') },
        { icon: MessageCircle, label: t('chat'), onPress: () => navigation.navigate('ChatScreen', { otherUser: { name: 'Support' } }) },
      ]
    },
    {
      title: 'Support',
      items: [
        { icon: HelpCircle, label: 'Help & FAQ', onPress: () => Alert.alert('Help', 'Contact support@ampedge.in') },
        { icon: Shield, label: 'Privacy Policy', onPress: () => {} },
        { icon: Star, label: 'Rate the App', onPress: () => Alert.alert('Rate Us', 'Thank you for using AmpEdge!') },
        { icon: Info, label: 'About AmpEdge', subtitle: 'Version 1.0.0', onPress: () => {} },
      ]
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
      <View style={[styles.header, { backgroundColor: c.surface, borderBottomColor: c.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={22} color={c.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: c.text }]}>{t('settings')}</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* User Info Card */}
        {user && (
          <View style={[styles.userCard, { backgroundColor: c.surface, borderColor: c.borderLight }]}>
            <View style={[styles.userAvatar, { backgroundColor: '#4169E1' }]}>
              <Text style={styles.userAvatarText}>{user.name?.[0] || user.phone?.[3] || 'U'}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.userName, { color: c.text }]}>{user.name || 'AmpEdge User'}</Text>
              <Text style={[styles.userEmail, { color: c.textSecondary }]}>{user.email || user.phone || 'Guest'}</Text>
            </View>
            <View style={[styles.roleBadge, { backgroundColor: c.primaryLight }]}>
              <Text style={{ color: c.primary, fontSize: 11, fontWeight: '700' }}>{user.role}</Text>
            </View>
          </View>
        )}

        {settingsGroups.map((group, gIdx) => (
          <View key={gIdx} style={styles.group}>
            <Text style={[styles.groupTitle, { color: c.textMuted }]}>{group.title}</Text>
            <View style={[styles.groupCard, { backgroundColor: c.surface, borderColor: c.borderLight }]}>
              {group.items.map((item, iIdx) => (
                <TouchableOpacity
                  key={iIdx}
                  style={[styles.settingItem, iIdx < group.items.length - 1 && { borderBottomWidth: 1, borderBottomColor: c.borderLight }]}
                  onPress={item.type === 'switch' ? item.onPress : item.onPress}
                  activeOpacity={0.7}
                >
                  <View style={[styles.settingIcon, { backgroundColor: c.primaryLight }]}>
                    <item.icon size={18} color={c.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.settingLabel, { color: c.text }]}>{item.label}</Text>
                    {item.subtitle && <Text style={[styles.settingSubtitle, { color: c.textMuted }]}>{item.subtitle}</Text>}
                  </View>
                  {item.type === 'switch' ? (
                    <Switch value={item.value} onValueChange={item.onPress} trackColor={{ true: '#4169E1', false: '#e2e8f0' }} thumbColor="#fff" />
                  ) : (
                    <ChevronRight size={18} color={c.textMuted} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Logout Button */}
        <TouchableOpacity style={[styles.logoutBtn, { borderColor: '#fee2e2' }]} onPress={handleLogout}>
          <LogOut size={18} color="#ef4444" />
          <Text style={styles.logoutText}>{t('logout')}</Text>
        </TouchableOpacity>

        <Text style={[styles.footer, { color: c.textMuted }]}>AmpEdge v1.0.0 • Made with ⚡ in India</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1 },
  headerTitle: { fontSize: 18, fontWeight: '800' },
  scrollContent: { padding: 16, paddingBottom: 40 },
  userCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 24, gap: 14 },
  userAvatar: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  userAvatarText: { color: '#fff', fontSize: 20, fontWeight: '900' },
  userName: { fontSize: 16, fontWeight: '800' },
  userEmail: { fontSize: 13, marginTop: 2 },
  roleBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  group: { marginBottom: 20 },
  groupTitle: { fontSize: 12, fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 8, marginLeft: 4 },
  groupCard: { borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
  settingItem: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 14 },
  settingIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  settingLabel: { fontSize: 14, fontWeight: '600' },
  settingSubtitle: { fontSize: 12, marginTop: 1 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 14, borderWidth: 1.5, marginTop: 8 },
  logoutText: { color: '#ef4444', fontWeight: '700', fontSize: 15 },
  footer: { textAlign: 'center', fontSize: 12, marginTop: 24 },
});
