import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './layouts/AdminLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import UsersList from './pages/UsersList';
import BookingsList from './pages/BookingsList';
import ServicesPage from './pages/ServicesPage';
import MarketplacePage from './pages/MarketplacePage';
import CouponsPage from './pages/CouponsPage';
import SettingsPage from './pages/SettingsPage';
import { setAuthToken } from './lib/api';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      setAuthToken(token);
      setIsAuthenticated(true);
    }
  }, []);

  return (
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={!isAuthenticated ? <Login onAuth={() => setIsAuthenticated(true)} /> : <Navigate to="/" />} 
        />
        <Route 
          path="/" 
          element={isAuthenticated ? <AdminLayout onLogout={() => { setAuthToken(null); setIsAuthenticated(false); }} /> : <Navigate to="/login" />}
        >
          <Route index element={<Dashboard />} />
          <Route path="users" element={<UsersList />} />
          <Route path="bookings" element={<BookingsList />} />
          <Route path="services" element={<ServicesPage />} />
          <Route path="marketplace" element={<MarketplacePage />} />
          <Route path="coupons" element={<CouponsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
