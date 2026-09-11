import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import appJson from '../../app.json';

/**
 * Base URL resolution priority:
 * 1. app.json extra.serverUrl (bundled statically, 100% reliable on real devices)
 * 2. Constants.expoConfig / manifest extra.serverUrl
 * 3. Android emulator (10.0.2.2)
 * 4. Web / iOS simulator (localhost)
 */
const getBaseUrl = () => {
  // Priority 1: Direct static app.json extra.serverUrl (from setup_lan.sh)
  const appJsonUrl = appJson?.expo?.extra?.serverUrl;
  if (appJsonUrl && appJsonUrl.trim()) {
    const clean = appJsonUrl.trim().replace(/\/+$/, '');
    return clean.endsWith('/api/v1') ? clean : `${clean}/api/v1`;
  }

  // Priority 2: Expo runtime config
  const runtimeUrl = Constants?.expoConfig?.extra?.serverUrl || Constants?.manifest?.extra?.serverUrl;
  if (runtimeUrl && runtimeUrl.trim()) {
    const clean = runtimeUrl.trim().replace(/\/+$/, '');
    return clean.endsWith('/api/v1') ? clean : `${clean}/api/v1`;
  }

  // Priority 3: Android emulator
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:5000/api/v1';
  }

  // Priority 4: Web / iOS simulator
  return 'http://localhost:5000/api/v1';
};


const api = axios.create({
  baseURL: getBaseUrl(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to all outgoing requests
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('@anand_auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error in request interceptor:', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Standardized response interceptor
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const errData = error.response?.data;
    let msg = errData?.message || error.message || 'Network error. Please ensure backend server is running.';
    if (errData?.errors && Array.isArray(errData.errors) && errData.errors.length > 0) {
      const fieldMsgs = errData.errors.map((e) => e.message).join('. ');
      msg = `${msg}: ${fieldMsgs}`;
    }
    const customError = {
      message: msg,
      status: error.response?.status || 500,
      errors: errData?.errors || null,
    };
    return Promise.reject(customError);
  }
);

export default api;
