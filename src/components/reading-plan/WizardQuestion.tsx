// Wizard Question Component - Individual step in the wizard

import { ReactNode } from 'react';

interface WizardQuestionProps {
  title: string;
  description: string;
  children: ReactNode;
  step: number;
  totalSteps: number;
}

export default function WizardQuestion({ 
  title, 
  description, 
  children, 
  step, 
  totalSteps 
}: WizardQuestionProps) {
  return (
    <div className="space-y-6">
      {/* Step indicator */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-700 font-medium">
          Step {step} of {totalSteps}
        </div>
        <div className="flex items-center gap-2">
          {Array.from({ length: totalSteps }, (_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all duration-300 ${
                i + 1 === step 
                  ? 'w-8 bg-orange-500' 
                  : i + 1 < step
                  ? 'w-2 bg-orange-300'
                  : 'w-2 bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Question content */}
      <div className="space-y-3">
        <h2 className="text-2xl font-semibold text-orange-600 flex items-center gap-2">
          <span className="text-orange-500">✦</span>
          {title}
        </h2>
        <p className="text-sm text-gray-600">
          {description}
        </p>
      </div>

      {/* Question options */}
      <div className="pt-4">
        {children}
      </div>
    </div>
  );
}

