import { useState, useEffect } from 'react';
import { 
  getDevicePreference, 
  setDevicePreference, 
  clearDevicePreference, 
  hasDevicePreference, 
  isDevicePreferenceStale,
  type DeviceType, 
  type DevicePreference 
} from '@/lib/devicePreferences';

export function useDevicePreference() {
  const [preference, setPreferenceState] = useState<DevicePreference | null>(() => 
    getDevicePreference()
  );

  // Check for updates to localStorage (e.g., from other tabs)
  useEffect(() => {
    const handleStorageChange = () => {
      setPreferenceState(getDevicePreference());
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const updatePreference = (deviceType: DeviceType) => {
    setDevicePreference(deviceType);
    setPreferenceState(getDevicePreference());
  };

  const clearPreference = () => {
    clearDevicePreference();
    setPreferenceState(null);
  };

  return {
    preference,
    hasPreference: hasDevicePreference(),
    isStale: isDevicePreferenceStale(),
    updatePreference,
    clearPreference,
    deviceType: preference?.type || null,
  };
} 