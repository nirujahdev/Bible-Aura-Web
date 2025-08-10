import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSEO } from '@/hooks/useSEO';
import { 
  BookOpen, 
  Bot, 
  FileText, 
  GraduationCap, 
  PenTool, 
  Zap,
  MessageCircle,
  Heart,
  Users,
  Calendar,
  Search,
  Star
} from 'lucide-react';

const SEO_CONFIG = {
  title: "Features - Bible Aura | AI-Powered Bible Study Tools",
  description: "Discover all Bible Aura features: AI Bible chat, study tools, sermon writing, journaling, community, and more. Transform your Bible study experience.",
  keywords: "Bible study features, AI Bible tools, Christian app features, Bible study platform",
  canonicalUrl: "https://bibleaura.xyz/features"
};

const Features = () => {
  useSEO(SEO_CONFIG);

  const featureCategories = [
    {
      title: "Bible Study Tools",
      description: "Comprehensive tools for deep Bible study and analysis",
      icon: BookOpen,
      features: [
        { name: "Multiple Translations", description: "KJV, NIV, ESV, and more" },
        { name: "Cross References", description: "Connect related verses" },
        { name: "Commentary Integration", description: "Expert biblical insights" },
        { name: "Word Studies", description: "Hebrew and Greek analysis" }
      ],
      link: "/features/bible-study",
      color: "bg-blue-50 border-blue-200"
    },
    {
      title: "AI-Powered Features",
      description: "Revolutionary AI assistance for biblical understanding",
      icon: Bot,
      features: [
        { name: "AI Bible Chat", description: "Ask questions, get biblical answers" },
        { name: "Smart Insights", description: "AI-generated study notes" },
        { name: "Context Analysis", description: "Historical and cultural context" },
        { name: "Personalized Learning", description: "Adaptive study suggestions" }
      ],
      link: "/features/ai-features",
      color: "bg-purple-50 border-purple-200"
    },
    {
      title: "Personal Tools",
      description: "Organize and track your spiritual journey",
      icon: FileText,
      features: [
        { name: "Digital Journal", description: "Record spiritual insights" },
        { name: "Favorite Verses", description: "Save and organize verses" },
        { name: "Reading Plans", description: "Structured Bible reading" },
        { name: "Progress Tracking", description: "Monitor your growth" }
      ],
      link: "/features/personal-tools",
      color: "bg-green-50 border-green-200"
    },
    {
      title: "Content Creation",
      description: "Tools for teachers, pastors, and content creators",
      icon: PenTool,
      features: [
        { name: "Sermon Writer", description: "AI-assisted sermon preparation" },
        { name: "Study Guide Generator", description: "Create study materials" },
        { name: "Teaching Resources", description: "Lesson plans and outlines" },
        { name: "Presentation Tools", description: "Visual teaching aids" }
      ],
      link: "/features/content-creation",
      color: "bg-orange-50 border-orange-200"
    },
    {
      title: "Learning Resources",
      description: "Educational content for all levels of Bible study",
      icon: GraduationCap,
      features: [
        { name: "Beginner Guides", description: "Start your Bible journey" },
        { name: "Advanced Studies", description: "Deep theological exploration" },
        { name: "Video Tutorials", description: "Visual learning content" },
        { name: "Interactive Courses", description: "Structured learning paths" }
      ],
      link: "/features/learning-resources",
      color: "bg-indigo-50 border-indigo-200"
    },
    {
      title: "Advanced Study",
      description: "Professional-grade research and analysis tools",
      icon: Search,
      features: [
        { name: "Concordance Search", description: "Comprehensive word studies" },
        { name: "Manuscript Analysis", description: "Original text research" },
        { name: "Archaeological Insights", description: "Historical discoveries" },
        { name: "Scholarly Resources", description: "Academic references" }
      ],
      link: "/features/advanced-study",
      color: "bg-red-50 border-red-200"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-800 mb-6">
            ✦ Bible Aura Features
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Discover comprehensive Bible study tools powered by AI technology. 
            Transform your spiritual journey with intelligent features designed for modern believers.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {featureCategories.map((category, index) => {
            const IconComponent = category.icon;
            return (
              <Card key={index} className={`${category.color} hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1`}>
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-md mb-4">
                    <IconComponent className="w-8 h-8 text-blue-600" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-800">
                    {category.title}
                  </CardTitle>
                  <p className="text-gray-600 text-sm">
                    {category.description}
                  </p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-6">
                    {category.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-2">
                        <Star className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="font-medium text-gray-800">{feature.name}</span>
                          <p className="text-xs text-gray-600">{feature.description}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <Link to={category.link}>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                      Explore {category.title}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Call to Action */}
        <div className="text-center bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Ready to Transform Your Bible Study?
          </h2>
          <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
            Join thousands of believers who are deepening their faith through AI-powered Bible study tools.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8">
                <Zap className="w-5 h-5 mr-2" />
                Get Started Free
              </Button>
            </Link>
            <Link to="/pricing">
              <Button size="lg" variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50 px-8">
                View Pricing Plans
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Features; 