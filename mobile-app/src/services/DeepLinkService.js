import * as Linking from 'expo-linking';
import apiClient from './api';

const prefix = Linking.createURL('/');

class DeepLinkService {
  constructor() {
    this.navigation = null;
  }

  setNavigation(nav) {
    this.navigation = nav;
  }

  async handleDeepLink(url) {
    if (!url || !this.navigation) return;

    try {
      // Pass the URL to our backend to resolve the correct screen
      const res = await apiClient.post('/deeplink/resolve', { url });
      
      if (res.data.success && res.data.navigation) {
        const { screen, params } = res.data.navigation;
        
        // Navigate
        this.navigation.navigate(screen, params);
      }
    } catch (error) {
      console.log('Failed to resolve deep link', error);
      // Fallback parsing if backend fails or is offline
      const parsed = Linking.parse(url);
      if (parsed.path?.includes('booking')) {
        this.navigation.navigate('BookingDetails');
      }
    }
  }

  setupLinking() {
    return {
      prefixes: [prefix, 'ampedge://', 'https://ampedge.in', 'https://rittickd23-alt.github.io/AmpEdge-web'],
      config: {
        screens: {
          CustomerTabs: {
            screens: {
              HomeTab: 'home',
              MarketplaceTab: 'marketplace',
              BookingsTab: 'bookings',
            }
          },
          BookingDetails: 'booking/:serviceId',
          ProductDetail: 'product/:productId',
          Login: 'login',
        }
      },
      async getInitialURL() {
        const url = await Linking.getInitialURL();
        return url;
      },
      subscribe(listener) {
        const onReceiveURL = ({ url }) => listener(url);
        const subscription = Linking.addEventListener('url', onReceiveURL);
        return () => subscription.remove();
      }
    };
  }
}

export default new DeepLinkService();
