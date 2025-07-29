import React from 'react';
import { VerseExplanationWidget } from '@/lib/ai-bible-system';
import { PageLayout } from '@/components/PageLayout';
import { UnifiedHeader } from '@/components/UnifiedHeader';
import { BookOpen } from 'lucide-react';

const BibleAIDemo: React.FC = () => {
  return (
    <PageLayout>
      <UnifiedHeader 
        icon={BookOpen}
        title="Bible AI Demo"
        subtitle="Comprehensive verse explanations powered by AI"
      />
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              ✦ Bible Aura AI - Verse Explanations
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Get comprehensive explanations of Bible verses with historical context, 
              theological insights, and practical applications in multiple languages.
            </p>
          </div>
          
          <VerseExplanationWidget />
          
          <div className="mt-12 text-center">
            <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                How It Works
              </h2>
              <div className="grid md:grid-cols-2 gap-6 text-left">
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">📝 Type a Verse</h3>
                  <p className="text-gray-600">
                    Simply type a Bible reference like "John 3:16" or "Psalm 23:1"
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">🌍 Choose Language</h3>
                  <p className="text-gray-600">
                    Get explanations in English, Tamil, or Sinhala
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">🤖 AI Analysis</h3>
                  <p className="text-gray-600">
                    Our AI provides structured explanations with historical context
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">📖 Learn & Grow</h3>
                  <p className="text-gray-600">
                    Understand theology and practical applications for daily life
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default BibleAIDemo; 