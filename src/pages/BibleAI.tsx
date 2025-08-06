import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bot, BookOpen, MessageSquare, Target, 
  Brain, Search, FileText, ArrowLeft, MoreVertical,
  CheckCircle, Sparkles, Zap, Users, Clock, 
  Shield, Lightbulb, Heart, Star
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useSEO, SEO_CONFIG } from '@/hooks/useSEO';
import { ModernLayout } from '@/components/ModernLayout';
import EnhancedAIChat from '@/components/EnhancedAIChat';
import AIFeaturesShowcase from '@/components/AIFeaturesShowcase';

const BibleAI = () => {
  const { toast } = useToast();
  
  // SEO optimization
  useSEO(SEO_CONFIG.BIBLE_AI);

  return (
    <ModernLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">AI Bible Assistant</h1>
                  <p className="text-purple-100">Intelligent Biblical Study & Chat</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto p-6">
          <Tabs defaultValue="chat" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="chat" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                AI Chat
              </TabsTrigger>
              <TabsTrigger value="features" className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                AI Features
              </TabsTrigger>
            </TabsList>

            {/* AI Chat Tab */}
            <TabsContent value="chat" className="mt-0">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="h-[calc(100vh-280px)]">
                  <EnhancedAIChat />
                </div>
              </div>
            </TabsContent>

            {/* Features Tab */}
            <TabsContent value="features" className="mt-0">
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    AI-Powered Biblical Intelligence
                  </h2>
                  <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                    Experience the future of Bible study with our advanced AI assistant that provides 
                    deep theological insights, contextual analysis, and personalized spiritual guidance.
                  </p>
                </div>

                {/* AI Features Showcase Component */}
                <AIFeaturesShowcase />

                {/* Call to Action */}
                <div className="text-center py-12">
                  <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 text-white">
                    <h3 className="text-2xl font-bold mb-4">Ready to Experience AI Bible Study?</h3>
                    <p className="text-purple-100 mb-6 max-w-2xl mx-auto">
                      Start your conversation with our AI assistant and discover new depths in Scripture study.
                    </p>
                    <Button 
                      size="lg"
                      className="bg-white text-purple-600 hover:bg-gray-100 font-semibold px-8 py-3"
                      onClick={() => {
                        // Switch to chat tab
                        const chatTab = document.querySelector('[value="chat"]') as HTMLElement;
                        chatTab?.click();
                      }}
                    >
                      <MessageSquare className="h-5 w-5 mr-2" />
                      Start AI Chat
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ModernLayout>
  );
};

export default BibleAI; 