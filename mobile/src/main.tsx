import React from 'react';
import ReactDOM from 'react-dom/client';
import MobileApp from './MobileApp';
import './index.css';

// Import Capacitor plugins
import { Capacitor } from '@capacitor/core';
import { StatusBar } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';

// Initialize mobile app
const initMobileApp = async () => {
  if (Capacitor.isNativePlatform()) {
    // Configure status bar for mobile
    await StatusBar.setStyle({ style: 'DARK' });
    
    // Hide splash screen after initialization
    await SplashScreen.hide();
  }
};

// Initialize the app
initMobileApp();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <MobileApp />
  </React.StrictMode>,
);
