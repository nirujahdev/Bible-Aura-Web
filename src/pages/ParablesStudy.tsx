import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useSEO } from '@/hooks/useSEO';
import ProtectedRoute from '@/components/ProtectedRoute';
import ParablesStudyComponent from '@/components/ParablesStudyComponent';

const SEO_CONFIG = {
  title: "Parables Study - Interactive Bible Stories | Bible Aura",
  description: "Dive deep into Jesus' parables with interactive study guides, historical context, and practical applications for modern life.",
  keywords: "parables study, Jesus parables, Bible stories, interactive Bible study, Christian education",
  ogImage: "/✦Bible Aura.svg"
};

const ParablesStudy = () => {
  useSEO(SEO_CONFIG);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              📖 Parables Study
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Explore the timeless wisdom of Jesus' parables through interactive study guides, 
              historical context, and practical applications for modern life.
            </p>
          </div>

          {/* Main Study Component */}
          <Card className="min-h-[600px]">
            <CardContent className="p-0">
              <ParablesStudyComponent />
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default ParablesStudy; 