import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext();

const lightTheme = {
  mode: 'light',
  colors: {
    background: '#f8fafc',
    surface: '#ffffff',
    surfaceAlt: '#f1f5f9',
    primary: '#4169E1',
    primaryLight: 'rgba(65, 105, 225, 0.1)',
    primaryDark: '#2c4fd4',
    cyan: '#5CE1E6',
    accent: '#f59e0b',
    text: '#0f172a',
    textSecondary: '#64748b',
    textMuted: '#94a3b8',
    border: '#e2e8f0',
    borderLight: '#f1f5f9',
    card: '#ffffff',
    cardBorder: '#f1f5f9',
    danger: '#ef4444',
    success: '#22c55e',
    warning: '#f59e0b',
    skeleton: '#e2e8f0',
    overlay: 'rgba(0,0,0,0.5)',
    statusBar: 'dark-content',
    tabBar: '#ffffff',
    tabBarBorder: '#f1f5f9',
    gradient: ['rgba(92, 225, 230, 0.1)', 'rgba(65, 105, 225, 0.05)', 'transparent'],
    darkSection: '#0f172a',
    whatsapp: '#25D366',
    heroGradient: ['#eef2ff', '#e0f2fe', '#ecfeff'],
  }
};

const darkTheme = {
  mode: 'dark',
  colors: {
    background: '#0a0f2c',
    surface: '#131a4a',
    surfaceAlt: '#1a2255',
    primary: '#6b8be8',
    primaryLight: 'rgba(107, 139, 232, 0.15)',
    primaryDark: '#4169E1',
    cyan: '#5CE1E6',
    accent: '#fbbf24',
    text: '#f1f5f9',
    textSecondary: '#94a3b8',
    textMuted: '#64748b',
    border: 'rgba(255,255,255,0.1)',
    borderLight: 'rgba(255,255,255,0.05)',
    card: '#1a2255',
    cardBorder: 'rgba(255,255,255,0.08)',
    danger: '#f87171',
    success: '#4ade80',
    warning: '#fbbf24',
    skeleton: '#1e2b6a',
    overlay: 'rgba(0,0,0,0.7)',
    statusBar: 'light-content',
    tabBar: '#131a4a',
    tabBarBorder: 'rgba(255,255,255,0.08)',
    gradient: ['rgba(92, 225, 230, 0.05)', 'rgba(65, 105, 225, 0.08)', 'transparent'],
    darkSection: '#0a0c1f',
    whatsapp: '#25D366',
    heroGradient: ['#0a0f2c', '#131a4a', '#0d1640'],
  }
};

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(false);
  const theme = isDark ? darkTheme : lightTheme;

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const saved = await AsyncStorage.getItem('ampedge_theme');
      if (saved === 'dark') setIsDark(true);
    } catch (e) {
      console.log('Failed to load theme');
    }
  };

  const toggleTheme = async () => {
    const newMode = !isDark;
    setIsDark(newMode);
    await AsyncStorage.setItem('ampedge_theme', newMode ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
export default ThemeContext;
