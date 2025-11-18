// iOS Install Instructions Modal
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Share2, Plus, Home } from 'lucide-react';

interface IOSInstallModalProps {
  open: boolean;
  onClose: () => void;
}

export function IOSInstallModal({ open, onClose }: IOSInstallModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Home className="h-5 w-5 text-orange-600" />
            Add Bible Aura to Home Screen
          </DialogTitle>
          <DialogDescription>
            Follow these steps to install Bible Aura on your iPhone or iPad
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
              <span className="text-orange-600 font-bold">1</span>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">Tap the Share Button</h3>
              <p className="text-sm text-gray-600">
                Look for the Share icon <Share2 className="inline h-4 w-4" /> at the bottom of your Safari browser
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
              <span className="text-orange-600 font-bold">2</span>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">Select "Add to Home Screen"</h3>
              <p className="text-sm text-gray-600">
                Scroll down in the share menu and tap <Plus className="inline h-4 w-4" /> "Add to Home Screen"
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
              <span className="text-orange-600 font-bold">3</span>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">Tap "Add"</h3>
              <p className="text-sm text-gray-600">
                Confirm by tapping "Add" in the top right corner. Bible Aura will appear on your home screen!
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={onClose} variant="outline">
            Got it!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

