export type DeviceType = 'mobile' | 'desktop';

export interface DevicePreference {
  type: DeviceType;
  timestamp: number;
}

/**
 * Get the user's stored device preference
 */
export function getDevicePreference(): DevicePreference | null {
  try {
    const preference = localStorage.getItem('user-device-preference') as DeviceType | null;
    const timestamp = localStorage.getItem('device-preference-timestamp');
    
    if (preference && timestamp) {
      return {
        type: preference,
        timestamp: parseInt(timestamp, 10)
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error reading device preference:', error);
    return null;
  }
}

/**
 * Set the user's device preference
 */
export function setDevicePreference(deviceType: DeviceType): void {
  try {
    localStorage.setItem('user-device-preference', deviceType);
    localStorage.setItem('device-preference-timestamp', Date.now().toString());
  } catch (error) {
    console.error('Error setting device preference:', error);
  }
}

/**
 * Clear the user's device preference
 */
export function clearDevicePreference(): void {
  try {
    localStorage.removeItem('user-device-preference');
    localStorage.removeItem('device-preference-timestamp');
  } catch (error) {
    console.error('Error clearing device preference:', error);
  }
}

/**
 * Check if the user has set a device preference
 */
export function hasDevicePreference(): boolean {
  return getDevicePreference() !== null;
}

/**
 * Get the recommended dashboard route based on device preference
 */
export function getRecommendedDashboardRoute(): string {
  const preference = getDevicePreference();
  
  if (!preference) {
    return '/dashboard'; // Default
  }
  
  // You can customize these routes based on your app structure
  switch (preference.type) {
    case 'mobile':
      return '/dashboard'; // Mobile-optimized dashboard
    case 'desktop':
      return '/dashboard'; // Desktop-optimized dashboard
    default:
      return '/dashboard';
  }
}

/**
 * Check if device preference is stale (older than 30 days)
 */
export function isDevicePreferenceStale(): boolean {
  const preference = getDevicePreference();
  
  if (!preference) {
    return false;
  }
  
  const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;
  const now = Date.now();
  
  return (now - preference.timestamp) > thirtyDaysInMs;
} 