import { Navigate } from 'react-router-dom';
import { hasDevicePreference } from '@/lib/devicePreferences';

export default function MobileSmartRedirect() {
  // Check if user has set a device preference
  const userHasDevicePreference = hasDevicePreference();
  
  // Redirect to device selection if they haven't chosen yet, otherwise to dashboard
  const redirectTo = userHasDevicePreference ? '/dashboard' : '/device-selection';
  
  return <Navigate to={redirectTo} replace />;
} 