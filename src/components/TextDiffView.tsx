import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Check, X } from 'lucide-react';

interface TextDiffViewProps {
  originalText: string;
  generatedText: string;
  onAccept: () => void;
  onDecline: () => void;
}

export function TextDiffView({ originalText, generatedText, onAccept, onDecline }: TextDiffViewProps) {
  // Simple diff: highlight differences
  const highlightDiff = (original: string, generated: string) => {
    // For simplicity, show side-by-side comparison
    // In a real implementation, you'd use a proper diff algorithm
    return {
      original: original,
      generated: generated,
      hasChanges: original !== generated
    };
  };

  const diff = highlightDiff(originalText, generatedText);

  return (
    <Card className="w-full max-w-2xl border-2 border-orange-200 shadow-xl">
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm">AI Generated Content</h3>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={onAccept}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Check className="h-4 w-4 mr-1" />
                Accept
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={onDecline}
                className="border-red-300 text-red-600 hover:bg-red-50"
              >
                <X className="h-4 w-4 mr-1" />
                Decline
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Original Text */}
            <div>
              <div className="text-xs font-medium text-gray-500 mb-2">Original</div>
              <div className="p-3 bg-red-50 border border-red-200 rounded text-sm whitespace-pre-wrap min-h-[100px]">
                {originalText}
              </div>
            </div>

            {/* Generated Text */}
            <div>
              <div className="text-xs font-medium text-gray-500 mb-2">Generated</div>
              <div className="p-3 bg-green-50 border border-green-200 rounded text-sm whitespace-pre-wrap min-h-[100px]">
                {generatedText}
              </div>
            </div>
          </div>

          <div className="text-xs text-gray-500 pt-2 border-t">
            <span className="inline-block w-3 h-3 bg-red-200 rounded mr-1"></span>
            Red = Original text
            <span className="inline-block w-3 h-3 bg-green-200 rounded mr-1 ml-4"></span>
            Green = AI generated content
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

