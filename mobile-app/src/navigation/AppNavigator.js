import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ActivityIndicator, View } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import DeepLinkService from '../services/DeepLinkService';
import { useTheme } from '../context/ThemeContext';
import { Home, Calendar, User, ShoppingBag, Heart } from 'lucide-react-native';

// Auth
import LoginScreen from '../screens/Auth/LoginScreen';
import SignupScreen from '../screens/Auth/SignupScreen';

// Customer Screens
import CustomerHome from '../screens/Customer/CustomerHome';
import Marketplace from '../screens/Customer/Marketplace';
import ServiceList from '../screens/Customer/ServiceList';
import BookingDetails from '../screens/Customer/BookingDetails';
import BookingConfirm from '../screens/Customer/BookingConfirm';
import MyBookings from '../screens/Customer/MyBookings';
import BookingBOM from '../screens/Customer/BookingBOM';
import Profile from '../screens/Customer/Profile';
import ProductDetail from '../screens/Customer/ProductDetail';
import CartScreen from '../screens/Customer/CartScreen';
import CheckoutScreen from '../screens/Customer/CheckoutScreen';
import Wishlist from '../screens/Customer/Wishlist';
import ReferralScreen from '../screens/Customer/ReferralScreen';
import SettingsScreen from '../screens/Customer/SettingsScreen';

// Technician Screens
import TechnicianHome from '../screens/Technician/TechnicianHome';
import JobDetail from '../screens/Technician/JobDetail';
import BOMSubmission from '../screens/Technician/BOMSubmission';
import BOMHistory from '../screens/Technician/BOMHistory';
import TechnicianProfile from '../screens/Technician/TechnicianProfile';

// Shared
import LiveTracking from '../screens/Shared/LiveTracking';
import ChatScreen from '../screens/Shared/ChatScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function CustomerTabNavigator() {
  const { theme } = useTheme();
  const c = theme.colors;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: c.primary,
        tabBarInactiveTintColor: c.textMuted,
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: c.tabBarBorder,
          backgroundColor: c.tabBar,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
      }}
    >
      <Tab.Screen 
        name="HomeTab" 
        component={CustomerHome} 
        options={{ 
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} /> 
        }} 
      />
      <Tab.Screen 
        name="MarketplaceTab" 
        component={Marketplace} 
        options={{ 
          tabBarLabel: 'Store',
          tabBarIcon: ({ color, size }) => <ShoppingBag color={color} size={size} /> 
        }} 
      />
      <Tab.Screen 
        name="WishlistTab" 
        component={Wishlist} 
        options={{ 
          tabBarLabel: 'Wishlist',
          tabBarIcon: ({ color, size }) => <Heart color={color} size={size} /> 
        }} 
      />
      <Tab.Screen 
        name="BookingsTab" 
        component={MyBookings} 
        options={{ 
          tabBarLabel: 'Bookings',
          tabBarIcon: ({ color, size }) => <Calendar color={color} size={size} /> 
        }} 
      />
      <Tab.Screen 
        name="ProfileTab" 
        component={Profile} 
        options={{ 
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => <User color={color} size={size} /> 
        }} 
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { user, loading, isGuest } = useContext(AuthContext);
  const { theme } = useTheme();
  const c = theme.colors;

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: c.background }}>
        <ActivityIndicator size="large" color={c.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer linking={DeepLinkService.setupLinking()}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: { backgroundColor: c.background },
        }}
      >
        {user == null && !isGuest ? (
          // Auth flow
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
          </>
        ) : user?.role === 'TECHNICIAN' ? (
          // Technician flow
          <>
            <Stack.Screen name="TechnicianHome" component={TechnicianHome} />
            <Stack.Screen name="JobDetail" component={JobDetail} />
            <Stack.Screen name="BOMSubmission" component={BOMSubmission} />
            <Stack.Screen name="BOMHistory" component={BOMHistory} />
            <Stack.Screen name="TechnicianProfile" component={TechnicianProfile} />
            <Stack.Screen name="LiveTracking" component={LiveTracking} />
            <Stack.Screen name="ChatScreen" component={ChatScreen} />
            <Stack.Screen name="SettingsScreen" component={SettingsScreen} />
          </>
        ) : (
          // Customer flow (Guest or Customer)
          <>
            <Stack.Screen name="CustomerTabs" component={CustomerTabNavigator} />
            <Stack.Screen name="ServiceList" component={ServiceList} />
            <Stack.Screen name="BookingDetails" component={BookingDetails} />
            <Stack.Screen name="BookingConfirm" component={BookingConfirm} />
            <Stack.Screen name="BookingBOM" component={BookingBOM} />
            <Stack.Screen name="LiveTracking" component={LiveTracking} />
            <Stack.Screen name="ProductDetail" component={ProductDetail} />
            <Stack.Screen name="CartScreen" component={CartScreen} />
            <Stack.Screen name="CheckoutScreen" component={CheckoutScreen} />
            <Stack.Screen name="ReferralScreen" component={ReferralScreen} />
            <Stack.Screen name="ChatScreen" component={ChatScreen} />
            <Stack.Screen name="SettingsScreen" component={SettingsScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
