// Wizard Navigation Component - Back/Next buttons

import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface WizardNavigationProps {
  onNext: () => void;
  onBack: () => void;
  isFirst: boolean;
  isLast: boolean;
  canProceed?: boolean;
}

export default function WizardNavigation({ 
  onNext, 
  onBack, 
  isFirst, 
  isLast,
  canProceed = true
}: WizardNavigationProps) {
  return (
    <div className="flex items-center justify-between pt-6 border-t border-white/10">
      <Button
        onClick={onBack}
        disabled={isFirst}
        variant="ghost"
        className="backdrop-blur-xl bg-white/5 hover:bg-white/10 text-gray-300 border border-white/20 disabled:opacity-30"
      >
        <ChevronLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      <Button
        onClick={onNext}
        disabled={!canProceed}
        className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg shadow-orange-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLast ? (
          <>
            Generate Plan
            <span className="ml-2">✦</span>
          </>
        ) : (
          <>
            Next
            <ChevronRight className="h-4 w-4 ml-2" />
          </>
        )}
      </Button>
    </div>
  );
}

