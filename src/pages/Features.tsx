import React from 'react';
import { Link } from 'react-router-dom';
import { GlobalNavigation } from '@/components/GlobalNavigation';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSEO } from '@/hooks/useSEO';
import { 
  BookOpen, 
  Bot, 
  MessageCircle,
  Heart,
  Calendar,
  Search,
  Sparkles,
  Languages,
  Highlighter,
  Bookmark,
  PenTool,
  Star,
  ArrowRight
} from 'lucide-react';

const SEO_CONFIG = {
  title: "Features - Bible Aura | AI-Powered Bible Study Tools",
  description: "Discover all Bible Aura features: AI Bible chat, verse explanations, reading plans, Tamil/English support, and more. Transform your Bible study experience.",
  keywords: "Bible study features, AI Bible tools, Christian app features, Bible study platform",
  canonicalUrl: "https://bibleaura.xyz/features"
};

const Features = () => {
  useSEO(SEO_CONFIG);

  // Only actual features that exist in the app
  const features = [
    {
      title: "AI-Powered Bible Chat",
      description: "Ask questions about Scripture, get verse explanations, and receive biblical insights powered by advanced AI. Available in both English and Tamil.",
      icon: Bot,
      features: [
        "Verse explanations and analysis",
        "Biblical Q&A in English and Tamil",
        "Contextual understanding",
        "Scripture-focused responses"
      ],
      link: "/dashboard",
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200"
    },
    {
      title: "Bible Reading & Study",
      description: "Read the Bible with multiple translations (KJV, Tamil), search verses, highlight passages, and bookmark your favorite verses.",
      icon: BookOpen,
      features: [
        "KJV and Tamil Bible translations",
        "Verse search and navigation",
        "Verse highlighting with colors",
        "Bookmarks and favorites"
      ],
      link: "/bible",
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200"
    },
    {
      title: "Bible Reading Planner",
      description: "Create personalized Bible reading plans based on your schedule, goals, and preferences. Track your progress and stay consistent.",
      icon: Calendar,
      features: [
        "Custom reading plans (30-365 days)",
        "Daily, weekly, and calendar views",
        "Progress tracking",
        "Mark days as completed"
      ],
      link: "/reading-plan",
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200"
    },
    {
      title: "Sermon Writing & Preparation",
      description: "Create and organize sermons with AI assistance. Build sermon outlines, save drafts, and manage your sermon library.",
      icon: PenTool,
      features: [
        "Sermon writing tools",
        "AI-assisted outlines",
        "Sermon library management",
        "Bible references integration"
      ],
      link: "/sermons",
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200"
    },
    {
      title: "Favorites & Bookmarks",
      description: "Save your favorite Bible verses, organize them, and access them anytime. Build your personal collection of meaningful Scripture.",
      icon: Heart,
      features: [
        "Save favorite verses",
        "Organize bookmarks",
        "Quick access to saved verses",
        "Personal verse collection"
      ],
      link: "/favorites",
      color: "from-pink-500 to-pink-600",
      bgColor: "bg-pink-50",
      borderColor: "border-pink-200"
    },
    {
      title: "Tamil & English Support",
      description: "Full bilingual support for Tamil and English Bible study. Ask questions, read verses, and get explanations in both languages.",
      icon: Languages,
      features: [
        "Tamil Bible translations",
        "English Bible (KJV)",
        "Bilingual AI responses",
        "Language switching"
      ],
      link: "/bible",
      color: "from-indigo-500 to-indigo-600",
      bgColor: "bg-indigo-50",
      borderColor: "border-indigo-200"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50">
      <GlobalNavigation variant="landing" />
      
      {/* Hero Section */}
      <section className="pt-24 md:pt-32 pb-12 px-4 md:px-6 lg:px-10">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 text-white mb-6 shadow-lg">
            <Sparkles className="h-8 w-8" />
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
            <span className="text-transparent bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text">
              Bible Aura Features
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Discover powerful AI-powered tools designed to deepen your Bible study and enhance your spiritual journey.
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="pb-20 px-4 md:px-6 lg:px-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Card
                  key={index}
                  className={`${feature.bgColor} border-2 ${feature.borderColor} hover:shadow-lg transition-all duration-200 group`}
                >
                  <CardHeader>
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r ${feature.color} text-white mb-4 group-hover:scale-110 transition-transform`}>
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-xl font-bold text-gray-900 mb-2">
                      {feature.title}
                    </CardTitle>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 mb-6">
                      {feature.features.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                          <Star className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      asChild
                      className={`w-full bg-gradient-to-r ${feature.color} hover:opacity-90 text-white`}
                    >
                      <Link to={feature.link}>
                        Try Now
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 px-4 md:px-6 lg:px-10 bg-white/50">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-8 md:p-12 border border-orange-100">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-orange-500 text-white mb-4">
              <Sparkles className="h-6 w-6" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
              Ready to Transform Your Bible Study?
            </h2>
            <p className="text-gray-600 mb-6 max-w-xl mx-auto">
              Start using Bible Aura today and experience AI-powered biblical insights that deepen your understanding of Scripture.
            </p>
            <Button
              asChild
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
            >
              <Link to="/auth?redirect=%2Fdashboard">
                Get Started Free
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Features;
