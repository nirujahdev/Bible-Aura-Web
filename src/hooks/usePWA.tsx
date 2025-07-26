import { useState, useEffect, useCallback } from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface PWAState {
  isInstallable: boolean;
  isInstalled: boolean;
  isOnline: boolean;
  isServiceWorkerSupported: boolean;
  isServiceWorkerRegistered: boolean;
  updateAvailable: boolean;
  isStandalone: boolean;
}

interface PWAActions {
  installApp: () => Promise<boolean>;
  updateServiceWorker: () => Promise<void>;
  unregisterServiceWorker: () => Promise<boolean>;
  showInstallPrompt: () => void;
  dismissInstallPrompt: () => void;
}

export function usePWA(): PWAState & PWAActions {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isServiceWorkerSupported] = useState('serviceWorker' in navigator);
  const [isServiceWorkerRegistered, setIsServiceWorkerRegistered] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [serviceWorkerRegistration, setServiceWorkerRegistration] = useState<ServiceWorkerRegistration | null>(null);

  // Check if app is running in standalone mode
  const isStandalone = useState(() => {
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      // @ts-expect-error - standalone is a Safari-specific property
      window.navigator.standalone === true ||
      document.referrer.includes('android-app://')
    );
  })[0];

  // Register service worker
  const registerServiceWorker = useCallback(async () => {
    if (!isServiceWorkerSupported) {
      console.log('Service Worker not supported');
      return;
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none'
      });

      setServiceWorkerRegistration(registration);
      setIsServiceWorkerRegistered(true);

      console.log('Service Worker registered successfully:', registration);

      // Check for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (!newWorker) return;

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New content is available
            setUpdateAvailable(true);
            console.log('New content available! Please refresh.');
          }
        });
      });

      // Listen for waiting service worker
      if (registration.waiting) {
        setUpdateAvailable(true);
      }

      // Listen for controlling service worker change
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        // Reload page to show new content
        window.location.reload();
      });

    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }, [isServiceWorkerSupported]);

  // Update service worker
  const updateServiceWorker = useCallback(async () => {
    if (!serviceWorkerRegistration) return;

    const newWorker = serviceWorkerRegistration.waiting;
    if (!newWorker) return;

    // Send message to service worker to skip waiting
    newWorker.postMessage({ type: 'SKIP_WAITING' });
    setUpdateAvailable(false);
  }, [serviceWorkerRegistration]);

  // Unregister service worker
  const unregisterServiceWorker = useCallback(async (): Promise<boolean> => {
    if (!serviceWorkerRegistration) return false;

    try {
      const result = await serviceWorkerRegistration.unregister();
      setIsServiceWorkerRegistered(false);
      setServiceWorkerRegistration(null);
      console.log('Service Worker unregistered successfully');
      return result;
    } catch (error) {
      console.error('Service Worker unregistration failed:', error);
      return false;
    }
  }, [serviceWorkerRegistration]);

  // Install app
  const installApp = useCallback(async (): Promise<boolean> => {
    if (!deferredPrompt) {
      console.log('Install prompt not available');
      return false;
    }

    try {
      // Show the install prompt
      deferredPrompt.prompt();

      // Wait for user choice
      const { outcome } = await deferredPrompt.userChoice;
      
      console.log(`User ${outcome} the install prompt`);

      // Clear the prompt
      setDeferredPrompt(null);
      setIsInstallable(false);

      if (outcome === 'accepted') {
        setIsInstalled(true);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Install prompt failed:', error);
      return false;
    }
  }, [deferredPrompt]);

  // Show install prompt (for manual triggering)
  const showInstallPrompt = useCallback(() => {
    if (isInstallable && !isInstalled) {
      installApp();
    }
  }, [isInstallable, isInstalled, installApp]);

  // Dismiss install prompt
  const dismissInstallPrompt = useCallback(() => {
    setDeferredPrompt(null);
    setIsInstallable(false);
    
    // Store dismissal to avoid showing again soon
    localStorage.setItem('pwa-install-dismissed', new Date().toISOString());
  }, []);

  // Check if should show install prompt
  const shouldShowInstallPrompt = useCallback(() => {
    if (isInstalled || isStandalone) return false;

    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      const dismissedDate = new Date(dismissed);
      const daysSinceDismissed = (Date.now() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24);
      
      // Don't show again for 7 days after dismissal
      if (daysSinceDismissed < 7) return false;
    }

    return isInstallable;
  }, [isInstalled, isStandalone, isInstallable]);

  // Set up event listeners
  useEffect(() => {
    // Register service worker on mount
    registerServiceWorker();

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const event = e as BeforeInstallPromptEvent;
      
      console.log('beforeinstallprompt event fired');
      setDeferredPrompt(event);
      setIsInstallable(true);
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      console.log('PWA was installed');
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
      
      // Track installation
      if (typeof window !== 'undefined' && 'gtag' in window) {
        (window as any).gtag('event', 'pwa_install', {
          event_category: 'engagement',
          event_label: 'PWA Install'
        });
      }
    };

    // Listen for online/offline status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    // Add event listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Cleanup
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [registerServiceWorker]);

  // Check if app is already installed
  useEffect(() => {
    // Check if app is running as PWA
    const checkInstallStatus = () => {
      const isInstalledApp = isStandalone || 
        window.matchMedia('(display-mode: standalone)').matches;
      
      setIsInstalled(isInstalledApp);
      
      // If already installed, don't show install prompt
      if (isInstalledApp) {
        setIsInstallable(false);
        setDeferredPrompt(null);
      }
    };

    checkInstallStatus();

    // Listen for display mode changes
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    mediaQuery.addEventListener('change', checkInstallStatus);

    return () => {
      mediaQuery.removeEventListener('change', checkInstallStatus);
    };
  }, [isStandalone]);

  return {
    // State
    isInstallable: shouldShowInstallPrompt(),
    isInstalled,
    isOnline,
    isServiceWorkerSupported,
    isServiceWorkerRegistered,
    updateAvailable,
    isStandalone,

    // Actions
    installApp,
    updateServiceWorker,
    unregisterServiceWorker,
    showInstallPrompt,
    dismissInstallPrompt,
  };
}

// Utility hook for PWA install banner
export function usePWAInstallBanner() {
  const pwa = usePWA();
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Show banner after user has been on site for 30 seconds
    // and meets install criteria
    const timer = setTimeout(() => {
      if (pwa.isInstallable && !pwa.isInstalled) {
        setShowBanner(true);
      }
    }, 30000);

    return () => clearTimeout(timer);
  }, [pwa.isInstallable, pwa.isInstalled]);

  const hideBanner = () => {
    setShowBanner(false);
    pwa.dismissInstallPrompt();
  };

  const installFromBanner = async () => {
    const installed = await pwa.installApp();
    if (installed) {
      setShowBanner(false);
    }
  };

  return {
    showBanner: showBanner && pwa.isInstallable,
    hideBanner,
    installFromBanner,
    ...pwa,
  };
}

// Utility hook for offline indicator
export function useOfflineIndicator() {
  const { isOnline } = usePWA();
  const [showOfflineMessage, setShowOfflineMessage] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setShowOfflineMessage(true);
    } else {
      // Hide message after coming back online
      const timer = setTimeout(() => {
        setShowOfflineMessage(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isOnline]);

  return {
    isOnline,
    showOfflineMessage,
    hideOfflineMessage: () => setShowOfflineMessage(false),
  };
} 