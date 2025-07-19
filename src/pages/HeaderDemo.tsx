import { useState } from 'react';
import { ModernHeader } from '@/components/ModernHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Palette, Monitor, Smartphone, Eye, Zap, Heart, Crown, Sparkles } from 'lucide-react';

export default function HeaderDemo() {
  const [selectedVariant, setSelectedVariant] = useState<'default' | 'premium' | 'minimal'>('default');

  const variants = [
    {
      id: 'default' as const,
      name: 'Default Enhanced',
      description: 'Rich, engaging header with comprehensive information and multiple CTAs',
      features: ['Large visual impact', 'Feature highlights', 'Dual action buttons', 'Animated background'],
      color: 'bg-orange-100 text-orange-800'
    },
    {
      id: 'premium' as const,
      name: 'Premium Experience',
      description: 'Premium-focused header with feature badges and enhanced visual appeal',
      features: ['Feature badges', 'Premium messaging', 'Enhanced gradients', 'Crown iconography'],
      color: 'bg-purple-100 text-purple-800'
    },
    {
      id: 'minimal' as const,
      name: 'Minimal Clean',
      description: 'Clean, compact header for users who prefer subtle engagement',
      features: ['Compact design', 'Subtle animations', 'Essential messaging', 'Quick action'],
      color: 'bg-blue-100 text-blue-800'
    }
  ];

  const improvements = [
    {
      icon: Palette,
      title: 'Enhanced Visual Design',
      description: 'Modern gradients, better typography, and sophisticated color schemes'
    },
    {
      icon: Monitor,
      title: 'Better Responsive Layout',
      description: 'Optimized for all screen sizes with improved mobile experience'
    },
    {
      icon: Zap,
      title: 'Engaging Animations',
      description: 'Subtle, performance-optimized animations that enhance user experience'
    },
    {
      icon: Eye,
      title: 'Improved Visual Hierarchy',
      description: 'Clear content structure with better readability and scan-ability'
    },
    {
      icon: Heart,
      title: 'Enhanced User Experience',
      description: 'Multiple interaction points and clearer value proposition'
    },
    {
      icon: Sparkles,
      title: 'Modern UI Patterns',
      description: 'Contemporary design patterns that users expect from modern applications'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Demo Header - Show Selected Variant */}
      <div className="mb-8">
        <ModernHeader variant={selectedVariant} showDismiss={false} />
      </div>

      <div className="w-full px-4 py-8">
        {/* Header Controls */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-6 w-6 text-orange-500" />
              Header Design Showcase
            </CardTitle>
            <p className="text-muted-foreground">
              Compare the improved header designs with different variants for different use cases
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {variants.map((variant) => (
                <Card 
                  key={variant.id} 
                  className={`cursor-pointer transition-all duration-300 hover:shadow-md ${
                    selectedVariant === variant.id ? 'ring-2 ring-orange-500 shadow-lg' : ''
                  }`}
                  onClick={() => setSelectedVariant(variant.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold">{variant.name}</h3>
                      <Badge className={variant.color}>
                        {selectedVariant === variant.id ? 'Active' : 'Preview'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {variant.description}
                    </p>
                    <div className="space-y-1">
                      {variant.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2 text-xs">
                          <Star className="h-3 w-3 text-orange-500" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-4">
                Click on any variant above to see it in action at the top of the page
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {variants.map((variant) => (
                  <Button
                    key={variant.id}
                    onClick={() => setSelectedVariant(variant.id)}
                    className={`text-sm ${
                      selectedVariant === variant.id 
                        ? 'bg-orange-500 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {variant.name}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Before vs After Comparison */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-6 w-6 text-orange-500" />
              Before vs After Comparison
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Before */}
              <div>
                <h3 className="font-semibold mb-4 text-red-600">❌ Before (Original)</h3>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
                  <div className="bg-orange-500 text-white p-2 rounded">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <Star className="h-3 w-3" />
                        <span>Create a free account to bookmark verses, take notes, and access AI insights</span>
                      </div>
                      <button className="bg-white/20 px-2 py-1 rounded text-xs">Join Free</button>
                    </div>
                  </div>
                </div>
                <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <span className="text-red-500">•</span>
                    <span>Basic styling with minimal visual appeal</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-red-500">•</span>
                    <span>Small text that's hard to read</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-red-500">•</span>
                    <span>Limited engagement and single CTA</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-red-500">•</span>
                    <span>Poor mobile responsiveness</span>
                  </div>
                </div>
              </div>

              {/* After */}
              <div>
                <h3 className="font-semibold mb-4 text-green-600">✅ After (Improved)</h3>
                <div className="border-2 border-dashed border-green-300 rounded-lg p-2 bg-green-50">
                  <ModernHeader variant="default" showDismiss={false} />
                </div>
                <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <span className="text-green-500">•</span>
                    <span>Rich visual design with engaging gradients</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-500">•</span>
                    <span>Clear hierarchy with readable typography</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-500">•</span>
                    <span>Multiple engagement points and CTAs</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-500">•</span>
                    <span>Fully responsive with animations</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Improvements */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-orange-500" />
              Key Improvements
            </CardTitle>
            <p className="text-muted-foreground">
              Major enhancements that make the header more effective and engaging
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {improvements.map((improvement, index) => (
                <div key={index} className="flex items-start gap-3 p-4 border rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex-shrink-0 p-2 bg-orange-100 rounded-lg">
                    <improvement.icon className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">{improvement.title}</h4>
                    <p className="text-sm text-muted-foreground">{improvement.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Usage Guidelines */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="h-6 w-6 text-orange-500" />
              Usage Guidelines
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 border-l-4 border-orange-500 bg-orange-50">
                <h4 className="font-semibold mb-2">Default Variant</h4>
                <p className="text-sm text-muted-foreground">
                  Use for main landing pages, Bible reading pages, and primary conversion opportunities where you want maximum engagement.
                </p>
              </div>
              <div className="p-4 border-l-4 border-purple-500 bg-purple-50">
                <h4 className="font-semibold mb-2">Premium Variant</h4>
                <p className="text-sm text-muted-foreground">
                  Use for premium feature promotions, subscription upsells, and special campaign launches where you want to highlight value.
                </p>
              </div>
              <div className="p-4 border-l-4 border-blue-500 bg-blue-50">
                <h4 className="font-semibold mb-2">Minimal Variant</h4>
                <p className="text-sm text-muted-foreground">
                  Use for secondary pages, returning users, or contexts where you want subtle reminders without being intrusive.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 