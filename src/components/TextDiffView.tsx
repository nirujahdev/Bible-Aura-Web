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
  // Strip HTML for comparison
  const stripHtml = (html: string) => {
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  const originalPlain = stripHtml(originalText);
  const generatedPlain = stripHtml(generatedText);

  return (
    <Card className="w-full max-w-4xl border-2 border-orange-200 shadow-xl">
      <CardContent className="p-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg">AI Generated Content</h3>
              <p className="text-xs text-gray-500 mt-1">Review the changes before accepting</p>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={onAccept}
                className="bg-green-600 hover:bg-green-700 text-white px-4"
              >
                <Check className="h-4 w-4 mr-2" />
                Accept Changes
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={onDecline}
                className="border-red-300 text-red-600 hover:bg-red-50 px-4"
              >
                <X className="h-4 w-4 mr-2" />
                Decline
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Original Text - Red highlight */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-4 h-4 bg-red-200 rounded"></div>
                <div className="text-sm font-medium text-gray-700">Original Text</div>
              </div>
              <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg text-sm whitespace-pre-wrap min-h-[200px] max-h-[400px] overflow-y-auto">
                <div className="text-gray-800">{originalPlain}</div>
              </div>
            </div>

            {/* Generated Text - Green highlight */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-4 h-4 bg-green-200 rounded"></div>
                <div className="text-sm font-medium text-gray-700">AI Generated</div>
              </div>
              <div className="p-4 bg-green-50 border-2 border-green-200 rounded-lg text-sm whitespace-pre-wrap min-h-[200px] max-h-[400px] overflow-y-auto">
                <div className="text-gray-800">{generatedPlain}</div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs text-gray-500 pt-4 border-t">
            <div className="flex items-center gap-2">
              <span className="inline-block w-4 h-4 bg-red-200 rounded border border-red-300"></span>
              <span>Original text (will be removed)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-4 h-4 bg-green-200 rounded border border-green-300"></span>
              <span>AI generated content (will be added)</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

