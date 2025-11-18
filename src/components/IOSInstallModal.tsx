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

        <div className="space-y-3 py-4">
          <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
            <Share2 className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-gray-900">Tap Share button at bottom of Safari</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
            <Plus className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-gray-900">Select "Add to Home Screen"</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
            <HomeIcon className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-gray-900">Tap "Add" to confirm</p>
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

