import { hasDevicePreference, getDevicePreference, clearDevicePreference } from '@/lib/devicePreferences';

/**
 * Utility function to test and debug the device selection flow
 */
export function testDeviceFlow() {
  console.log('=== Device Selection Flow Test ===');
  
  // Test 1: Check current preference state
  const currentPreference = getDevicePreference();
  console.log('Current preference:', currentPreference);
  console.log('Has preference:', hasDevicePreference());
  
  // Test 2: Clear preference to simulate new user
  console.log('\n--- Simulating new user (clearing preference) ---');
  clearDevicePreference();
  console.log('After clearing - Has preference:', hasDevicePreference());
  
  // Test 3: Show expected flow
  console.log('\n--- Expected Flow ---');
  console.log('1. User visits landing page (/)');
  console.log('2. If not authenticated → /auth');
  console.log('3. After successful authentication:');
  console.log('   - If no device preference → /device-selection');
  console.log('   - If has device preference → /dashboard');
  console.log('4. After device selection → /dashboard');
  
  return {
    currentPreference,
    hasPreference: hasDevicePreference(),
    expectedFlow: [
      'Landing Page (/) → Auth (/auth)',
      'Auth Success → Device Selection (/device-selection)',
      'Device Selection → Dashboard (/dashboard)'
    ]
  };
}

/**
 * Reset the device preference for testing
 */
export function resetDevicePreference() {
  clearDevicePreference();
  console.log('Device preference reset - user will see device selection on next sign-in');
}

// Add to window for easy testing in browser console
if (typeof window !== 'undefined') {
  (window as any).testDeviceFlow = testDeviceFlow;
  (window as any).resetDevicePreference = resetDevicePreference;
} 