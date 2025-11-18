// Research Lab PIN Protection Component
// Temporary protection layer - easy to remove later
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FlaskConical, Lock, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const RESEARCH_LAB_PIN = '20001';
const PIN_STORAGE_KEY = 'research_lab_pin_verified';

interface ResearchLabPinProtectionProps {
  children: React.ReactNode;
}

export function ResearchLabPinProtection({ children }: ResearchLabPinProtectionProps) {
  const [pin, setPin] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    // Check if PIN was already verified in this session
    const verified = sessionStorage.getItem(PIN_STORAGE_KEY) === 'true';
    if (verified) {
      setIsVerified(true);
    } else {
      setIsOpen(true);
    }
  }, []);

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (pin === RESEARCH_LAB_PIN) {
      setIsVerified(true);
      setIsOpen(false);
      sessionStorage.setItem(PIN_STORAGE_KEY, 'true');
      toast({
        title: 'Access granted',
        description: 'Welcome to Research Lab',
      });
      setPin('');
      setError('');
    } else {
      setError('Incorrect PIN. Please try again.');
      setPin('');
      toast({
        title: 'Access denied',
        description: 'Incorrect PIN entered',
        variant: 'destructive',
      });
    }
  };

  const handlePinChange = (value: string) => {
    // Only allow numbers
    if (value === '' || /^\d+$/.test(value)) {
      setPin(value);
      setError('');
    }
  };

  // If verified, show children
  if (isVerified) {
    return <>{children}</>;
  }

  // Show PIN entry modal
  return (
    <>
      <Dialog open={isOpen} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 mx-auto mb-4">
              <Lock className="h-8 w-8 text-orange-600" />
            </div>
            <DialogTitle className="text-center text-xl">Research Lab Access</DialogTitle>
            <DialogDescription className="text-center">
              Enter PIN to access Research Lab
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handlePinSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="password"
                inputMode="numeric"
                value={pin}
                onChange={(e) => handlePinChange(e.target.value)}
                placeholder="Enter PIN"
                className="text-center text-2xl tracking-widest font-mono h-14"
                autoFocus
                maxLength={10}
              />
              {error && (
                <p className="text-sm text-red-600 text-center">{error}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-orange-500 hover:bg-orange-600 text-white h-12"
              disabled={pin.length === 0}
            >
              <FlaskConical className="h-4 w-4 mr-2" />
              Access Research Lab
            </Button>
          </form>

          <div className="text-center text-xs text-gray-500 mt-4">
            <p>Research Lab is temporarily protected</p>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Show loading/blocked state while PIN not verified */}
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-4">
            <Lock className="h-8 w-8 text-orange-600" />
          </div>
          <p className="text-gray-600">Please enter PIN to access Research Lab</p>
        </div>
      </div>
    </>
  );
}
