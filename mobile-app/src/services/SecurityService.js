import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
import { Platform } from 'react-native';

const SIGNING_SECRET = 'AmpEdgeReqSecret2026'; // Should ideally be injected via ENV

class SecurityService {
  constructor() {
    this.deviceId = null;
  }

  async getDeviceId() {
    if (this.deviceId) return this.deviceId;
    
    let id = await SecureStore.getItemAsync('ampedge_device_id');
    if (!id) {
      id = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        `${Platform.OS}-${Date.now()}-${Math.random()}`
      );
      await SecureStore.setItemAsync('ampedge_device_id', id);
    }
    this.deviceId = id;
    return id;
  }

  async signRequest(method, url, body) {
    const timestamp = Date.now().toString();
    const nonce = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      `${timestamp}-${Math.random()}`
    );
    
    // Convert full URL to path if necessary. Here we assume url passed is the path
    const path = url.startsWith('http') ? new URL(url).pathname : url;
    
    const payload = `${path}:${method.toUpperCase()}:${JSON.stringify(body || {})}:${timestamp}:${nonce}`;
    
    // expo-crypto doesn't support HMAC directly yet. 
    // For a real prod app, use react-native-quick-crypto or subtle crypto.
    // For now we'll simulate a basic hash just to show the structure.
    const signature = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      payload + SIGNING_SECRET
    );

    return {
      'x-request-signature': signature,
      'x-request-timestamp': timestamp,
      'x-request-nonce': nonce,
      'x-device-id': await this.getDeviceId()
    };
  }

  async setAppPin(pin) {
    await SecureStore.setItemAsync('app_pin', pin);
  }

  async verifyAppPin(pin) {
    const storedPin = await SecureStore.getItemAsync('app_pin');
    return storedPin === pin;
  }

  async hasAppPin() {
    const storedPin = await SecureStore.getItemAsync('app_pin');
    return !!storedPin;
  }
}

export default new SecurityService();
