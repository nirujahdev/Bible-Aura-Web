import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Wand2, Globe, Users, Church, ArrowRight, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface EnhancedSermonIntegrationProps {
  showFullFeatures?: boolean;
  className?: string;
}

const EnhancedSermonIntegration: React.FC<EnhancedSermonIntegrationProps> = ({ 
  showFullFeatures = true, 
  className = '' 
}) => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Globe,
      title: 'Multi-Language Support',
      description: 'Generate sermons in English, Tamil, and Sinhala with cultural sensitivity'
    },
    {
      icon: Church,
      title: 'Denominational Lens',
      description: 'Tailor theology and approach to your specific denominational perspective'
    },
    {
      icon: Users,
      title: 'Audience Targeting',
      description: 'Customize content for youth, adults, families, or seekers'
    },
    {
      icon: Wand2,
      title: 'Advanced AI',
      description: 'Comprehensive sermon manuscripts with illustrations and applications'
    }
  ];

  return (
    <Card className={`border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-red-50 ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500 rounded-lg">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl text-gray-800">Enhanced Sermon Generator</CardTitle>
              <p className="text-sm text-gray-600">AI-powered comprehensive sermon creation</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-orange-500 text-white">AI Powered</Badge>
            <Badge variant="outline" className="text-orange-600 border-orange-300">New</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Feature Overview */}
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            🧠 Next-Generation Sermon Creation
          </h3>
          <p className="text-gray-600 mb-4">
            Experience the most advanced AI sermon generator with comprehensive features for modern ministry
          </p>
        </div>

        {/* Key Features Grid */}
        {showFullFeatures && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="flex items-start gap-3 p-3 bg-white/60 rounded-lg">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Icon className="h-4 w-4 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800 text-sm">{feature.title}</h4>
                    <p className="text-xs text-gray-600">{feature.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Key Benefits */}
        <div className="bg-white/60 rounded-lg p-4">
          <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Star className="h-4 w-4 text-orange-500" />
            Enhanced Features Include:
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
              Topic & Scripture Input
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
              Audience Type Selection
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
              Denominational Perspectives
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
              Multiple Sermon Types
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
              Length Customization
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
              Multi-Language Support
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
              Full Manuscript Generation
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
              Worship Song Suggestions
            </div>
          </div>
        </div>

        {/* Comparison Highlight */}
        <div className="bg-gradient-to-r from-orange-100 to-red-100 rounded-lg p-4 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-gray-800 mb-1">Upgrade Your Sermon Preparation</h4>
              <p className="text-sm text-gray-600">
                From basic templates to comprehensive AI-generated manuscripts
              </p>
            </div>
            <div className="text-2xl">🚀</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            onClick={() => navigate('/enhanced-sermon-hub')}
            className="bg-orange-500 hover:bg-orange-600 text-white flex-1"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Try Enhanced Generator
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
          <Button 
            variant="outline" 
            onClick={() => navigate('/enhanced-sermon-hub?tab=templates')}
            className="border-orange-300 text-orange-600 hover:bg-orange-50"
          >
            View Templates
          </Button>
        </div>

        {/* Footer Note */}
        <div className="text-center text-xs text-gray-500 bg-white/40 rounded-lg p-3">
          <p>✦ Generate sermons 10x faster with theological accuracy and cultural sensitivity</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedSermonIntegration; 