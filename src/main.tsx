import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import LoadingScreen from './components/LoadingScreen.tsx'
// Import test utilities for development
import './utils/testDeviceFlow.ts'

// Service Worker Registration for PWA
const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator && import.meta.env.PROD) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });
      
      console.log('Service Worker registered successfully:', registration.scope);
      
      // Handle updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New content is available, notify user
              console.log('New content available! Please refresh.');
              // You could show a toast or banner here
            }
          });
        }
      });
      
      // Register for background sync if supported
      if ('sync' in window.ServiceWorkerRegistration.prototype) {
        try {
          const swRegistration = await navigator.serviceWorker.ready;
          // Background sync registration with proper typing
          if ('sync' in swRegistration) {
            await (swRegistration as any).sync.register('background-sync');
            console.log('Background sync registered');
          }
        } catch (syncError) {
          console.warn('Background sync registration failed:', syncError);
        }
      }
      
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }
};

// Register for push notifications (optional)
const requestNotificationPermission = async () => {
  if ('Notification' in window && 'serviceWorker' in navigator) {
    const permission = await Notification.requestPermission();
    console.log('Notification permission:', permission);
  }
};

// PWA Install prompt handling
const handlePWAInstall = () => {
  let deferredPrompt: any;
  
  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent Chrome 67 and earlier from automatically showing the prompt
    e.preventDefault();
    // Stash the event so it can be triggered later
    deferredPrompt = e;
    console.log('PWA install prompt available');
    
    // You could show a custom install button here
    // and call deferredPrompt.prompt() when clicked
  });
  
  window.addEventListener('appinstalled', () => {
    console.log('PWA was installed');
    deferredPrompt = null;
  });
};

// Get root element with error handling
const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found. This is likely a build issue.");
}

// Create root with error handling
try {
  const root = createRoot(rootElement);
  
  // Render with loading fallback
  root.render(<App />);
  
  // Hide any initial loading screen immediately
  const initialLoader = document.getElementById('initial-loader');
  if (initialLoader) {
    initialLoader.style.display = 'none';
  }
  
  // Initialize PWA features after render (safely)
  try {
    registerServiceWorker();
    handlePWAInstall();
  } catch (pwaError) {
    console.warn('PWA initialization failed:', pwaError);
  }
  
  // Request notification permission after user interaction (safely)
  try {
    document.addEventListener('click', () => {
      requestNotificationPermission();
    }, { once: true });
  } catch (eventError) {
    console.warn('Event listener setup failed:', eventError);
  }
  
} catch (error) {
  console.error('Failed to render React app:', error);
  
  // Fallback content in case React fails to load
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="
        min-height: 100vh; 
        display: flex; 
        align-items: center; 
        justify-content: center;
        font-family: system-ui, -apple-system, sans-serif;
        background: white;
        color: #333;
      ">
        <div style="text-align: center; padding: 2rem;">
          <h1 style="color: #f85700; margin-bottom: 1rem;">✦Bible Aura</h1>
          <p>Unable to load the application. Please refresh the page.</p>
          <button 
            onclick="window.location.reload()" 
            style="
              background: #f85700; 
              color: white; 
              border: none; 
              padding: 0.5rem 1rem; 
              border-radius: 0.5rem; 
              margin-top: 1rem;
              cursor: pointer;
            "
          >
            Refresh Page
          </button>
        </div>
      </div>
    `;
  }
}
