import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  MessageCircle, BookOpen, Headphones, PenTool, 
  Heart, Brain, Calendar, Search, Settings, LogOut,
  Sparkles, TrendingUp, Target
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useSEO, SEO_CONFIG } from '@/hooks/useSEO';
import { Navigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  // Redirect mobile users to landing page
  if (isMobile) {
    return <Navigate to="/" replace />;
  }
  
  // SEO optimization
  useSEO(SEO_CONFIG.DASHBOARD);

  // Redirect to auth if not logged in
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Stats data
  const [stats, setStats] = useState({
    conversations: 5,
    progress: 111
  });

  // Bible Aura Features - matching your screenshot exactly
  const features = [
    {
      title: "AI Bible Chat",
      description: "Ask any biblical question",
      icon: MessageCircle,
      color: "bg-orange-500",
      href: "/bible-ai"
    },
    {
      title: "Bible",
      description: "Read & study Scripture",
      icon: BookOpen,
      color: "bg-blue-500",
      href: "/bible"
    },
    {
      title: "Sermons",
      description: "AI-enhanced sermons",
      icon: Headphones,
      color: "bg-purple-500",
      href: "/sermons"
    },
    {
      title: "Journal",
      description: "Personal faith insights",
      icon: PenTool,
      color: "bg-green-500",
      href: "/journal"
    }
  ];

  // Quick Start actions - matching your screenshot exactly
  const quickStartActions = [
    {
      title: "Daily Devotion",
      description: "Start your spiritual journey today",
      icon: Heart,
      color: "bg-rose-500"
    },
    {
      title: "Bible Questions", 
      description: "Ask AI about Scripture",
      icon: Brain,
      color: "bg-blue-500"
    },
    {
      title: "Prayer Guide",
      description: "Guided prayer suggestions", 
      icon: Calendar,
      color: "bg-purple-500"
    },
    {
      title: "Study Helper",
      description: "Dive deeper into Scripture",
      icon: Search,
      color: "bg-green-500"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Bible Aura</h1>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">Desktop Experience</Badge>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-600">Hello benaiah!</span>
            <Button variant="ghost" size="sm" onClick={() => signOut()}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 max-w-6xl mx-auto space-y-8">
        
        {/* Welcome Message */}
        <div className="text-center">
          <div className="text-4xl mb-4">✦</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Hello benaiah!</h2>
          <p className="text-gray-600">How can I assist you with your biblical studies today?</p>
        </div>

        {/* Bible Aura Features Section */}
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Bible Aura Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Link key={index} to={feature.href}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <div className={`w-12 h-12 ${feature.color} rounded-xl flex items-center justify-center mx-auto mb-4`}>
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">{feature.title}</h4>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Quick Start Section */}
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Quick Start</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {quickStartActions.map((action, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                      <action.icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">{action.title}</h4>
                      <p className="text-sm text-gray-600">{action.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-red-500 mb-2">{stats.conversations}</div>
              <p className="text-sm text-gray-600">Conversations</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-green-500 mb-2">{stats.progress}%</div>
              <p className="text-sm text-gray-600">Progress</p>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
} 