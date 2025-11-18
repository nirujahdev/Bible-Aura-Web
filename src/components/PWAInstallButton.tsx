// PWA Install Button Component
import { useState } from 'react';
import { usePWA } from '@/hooks/usePWA';
import { Button } from '@/components/ui/button';
import { Smartphone, Download } from 'lucide-react';
import { IOSInstallModal } from './IOSInstallModal';

export function PWAInstallButton() {
  const { isInstallable, isInstalled, isStandalone, installApp } = usePWA();
  const [showIOSModal, setShowIOSModal] = useState(false);

  // Don't show if already installed or in standalone mode
  if (isInstalled || isStandalone || !isInstallable) {
    return null;
  }

  // Detect iOS
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;

  const handleInstall = async () => {
    if (isIOS) {
      // Show iOS instructions modal
      setShowIOSModal(true);
    } else {
      // Trigger Android install prompt
      const installed = await installApp();
      if (installed) {
        // App was installed, user will be redirected automatically
        console.log('PWA installed successfully');
      }
    }
  };

  return (
    <>
      <Button
        onClick={handleInstall}
        size="lg"
        className="bg-gradient-to-r from-orange-500 via-orange-600 to-blue-600 hover:from-orange-600 hover:via-orange-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
      >
        <Smartphone className="h-5 w-5 mr-2" />
        📱 Install Bible Aura App
      </Button>

      <IOSInstallModal open={showIOSModal} onClose={() => setShowIOSModal(false)} />
    </>
  );
}

