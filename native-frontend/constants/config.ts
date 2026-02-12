import { Platform } from 'react-native';

// Get the appropriate API base URL based on platform
// For physical devices, replace this with your computer's local IP address
const getApiUrl = () => {
  if (__DEV__) {
    // Development mode
    if (Platform.OS === 'android') {
      // Android emulator uses 10.0.2.2 to access host machine's localhost
      return 'http://10.0.2.2:8080';
    } else if (Platform.OS === 'ios') {
      // iOS simulator can use localhost
      return 'http://localhost:8080';
    } else {
      // Web
      return 'http://localhost:8080';
    }
  }
  // Production - replace with your actual API URL
  return 'https://your-api-domain.com';
};

export const API_URL = getApiUrl();

// For physical devices, uncomment and use your computer's local IP:
// export const API_URL = 'http://192.168.1.XXX:8080';
