import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ActivityIndicator, View } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { Home, Calendar, User, ShoppingBag } from 'lucide-react-native';

// Auth
import LoginScreen from '../screens/Auth/LoginScreen';

// Customer Screens
import CustomerHome from '../screens/Customer/CustomerHome';
import Marketplace from '../screens/Customer/Marketplace';
import ServiceList from '../screens/Customer/ServiceList';
import BookingDetails from '../screens/Customer/BookingDetails';
import BookingConfirm from '../screens/Customer/BookingConfirm';
import MyBookings from '../screens/Customer/MyBookings';
import BookingBOM from '../screens/Customer/BookingBOM';
import Profile from '../screens/Customer/Profile';

// Technician Screens
import TechnicianHome from '../screens/Technician/TechnicianHome';
import JobDetail from '../screens/Technician/JobDetail';
import BOMSubmission from '../screens/Technician/BOMSubmission';
import BOMHistory from '../screens/Technician/BOMHistory';
import TechnicianProfile from '../screens/Technician/TechnicianProfile';

// Shared
import LiveTracking from '../screens/Shared/LiveTracking';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function CustomerTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#1e56a0',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: '#f1f5f9',
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

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f4f8' }}>
        <ActivityIndicator size="large" color="#1e56a0" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user == null && !isGuest ? (
          // Not signed in and not skipping
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : user?.role === 'TECHNICIAN' ? (
          // Technician flow
          <>
            <Stack.Screen name="TechnicianHome" component={TechnicianHome} />
            <Stack.Screen name="JobDetail" component={JobDetail} />
            <Stack.Screen name="BOMSubmission" component={BOMSubmission} />
            <Stack.Screen name="BOMHistory" component={BOMHistory} />
            <Stack.Screen name="TechnicianProfile" component={TechnicianProfile} />
            <Stack.Screen name="LiveTracking" component={LiveTracking} />
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
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
