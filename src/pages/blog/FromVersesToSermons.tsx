import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GlobalNavigation } from "@/components/GlobalNavigation";
import { 
  Calendar, Clock, User, ArrowLeft, ArrowRight, Share2, BookOpen, 
  Brain, MessageSquare, Search, Target, CheckCircle, Lightbulb,
  TrendingUp, Star, Quote, ExternalLink, Crown, Zap, Users, Mic,
  FileText, PenTool, Sparkles
} from "lucide-react";
import { Link } from "react-router-dom";
import { useSEO, createBlogPostStructuredData } from "@/hooks/useSEO";
import Footer from "../../components/Footer";
import { SEOBacklinks } from "../../components/SEOBacklinks";

const FromVersesToSermons = () => {
  useSEO({
    title: "From Verses to Sermons: How Bible Aura's AI Transforms Your Study Time | Ministry Guide",
    description: "Discover how single-verse study becomes sermon-ready insight with AI-powered tools. Transform your ministry preparation with Bible Aura's intelligent sermon assistance.",
    keywords: "AI sermon preparation, Bible study to sermon, sermon writing AI, ministry tools, Bible Aura sermon writer, AI ministry assistant, sermon preparation time",
    canonicalUrl: "https://bibleaura.xyz/blog/from-verses-to-sermons-how-bible-auras-ai-transforms-your-study-time",
    structuredData: createBlogPostStructuredData(
      "From Verses to Sermons: How Bible Aura's AI Transforms Your Study Time",
      "Discover how single-verse study becomes sermon-ready insight with AI-powered tools. Transform your ministry preparation with Bible Aura's intelligent sermon assistance.",
      "2025-08-10",
      "Bible Aura Team",
      "https://bibleaura.xyz/blog/from-verses-to-sermons-how-bible-auras-ai-transforms-your-study-time"
    )
  });

  const transformationSteps = [
    {
      icon: Search,
      title: "Start with Any Verse",
      description: "Begin with a single verse or passage that speaks to you",
      example: "Romans 8:28 - 'And we know that in all things God works for the good of those who love him'",
      gradient: "from-blue-500 to-blue-600"
    },
    {
      icon: Brain,
      title: "AI Contextual Analysis",
      description: "Get deep insights on historical context, original meaning, and theological significance",
      example: "Understanding Paul's context in Rome, the Greek word for 'good', and cross-references",
      gradient: "from-purple-500 to-purple-600"
    },
    {
      icon: PenTool,
      title: "Sermon Structure Generation",
      description: "AI creates complete sermon outlines with introduction, points, and applications",
      example: "3-point sermon: God's Sovereignty, Our Trust, His Purpose - with illustrations",
      gradient: "from-green-500 to-green-600"
    },
    {
      icon: Mic,
      title: "Ministry-Ready Content",
      description: "Polished sermon ready for delivery with personal touches added",
      example: "Complete sermon with opening story, biblical exposition, and practical application",
      gradient: "from-orange-500 to-orange-600"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <GlobalNavigation variant="landing" />
      
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-orange-500 text-white py-16">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5" />
            <span className="text-blue-100">August 10, 2025</span>
            <Clock className="w-5 h-5 ml-4" />
            <span className="text-blue-100">8 min read</span>
            <User className="w-5 h-5 ml-4" />
            <span className="text-blue-100">Bible Aura Team</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            From Verses to Sermons: How Bible Aura's AI Transforms Your Study Time
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 mb-8 leading-relaxed">
            See how single-verse study becomes sermon-ready insight with AI-powered tools
          </p>
          <div className="flex flex-wrap gap-4">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
              <Sparkles className="w-5 h-5 mr-2" />
              Try Sermon AI
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              <Share2 className="w-5 h-5 mr-2" />
              Share Guide
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-16">
        <Card className="mb-12 shadow-xl border-0 bg-white/80 backdrop-blur">
          <CardContent className="p-8">
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              Every pastor knows the challenge: you have a powerful verse that speaks to your heart, but transforming that single insight into a complete, engaging sermon takes hours of research and preparation. <strong>Bible Aura's AI</strong> changes everything by turning minutes of study into sermon-ready content.
            </p>
            <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 p-6 rounded-lg">
              <p className="text-gray-800 font-medium flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-green-600" />
                <strong>Real Impact:</strong> Pastors report reducing sermon prep time from 8-12 hours to 2-3 hours while increasing sermon quality and depth.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-8 mb-12">
          {transformationSteps.map((step, index) => (
            <Card key={index} className="shadow-xl border-0 overflow-hidden hover:shadow-2xl transition-all duration-300">
              <CardHeader className={`bg-gradient-to-r ${step.gradient} text-white p-6`}>
                <div className="flex items-center gap-4">
                  <div className="bg-white/20 p-3 rounded-lg">
                    <step.icon className="w-8 h-8" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white/90 mb-1">Step {index + 1}</div>
                    <CardTitle className="text-xl text-white">{step.title}</CardTitle>
                    <p className="text-white/90">{step.description}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="text-sm font-medium text-gray-700 mb-2">Example:</p>
                  <p className="text-gray-800">{step.example}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mb-12 shadow-xl border-0 bg-gradient-to-r from-blue-50 to-purple-50">
          <CardHeader>
            <CardTitle className="text-2xl text-gray-900 flex items-center gap-3">
              <FileText className="w-6 h-6 text-blue-500" />
              Real Sermon Transformation Example
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4">Traditional Method (8+ hours):</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• Read commentaries and cross-references (2-3 hours)</li>
                <li>• Research historical context (1-2 hours)</li>
                <li>• Develop sermon outline (2 hours)</li>
                <li>• Write illustrations and applications (2-3 hours)</li>
                <li>• Final editing and polishing (1 hour)</li>
              </ul>
            </div>
            
            <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg border border-green-200">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-green-600" />
                Bible Aura Method (2-3 hours):
              </h3>
              <ul className="space-y-2 text-gray-700">
                <li>• Ask AI for verse analysis and context (15 minutes)</li>
                <li>• Generate sermon outline with cross-references (15 minutes)</li>
                <li>• Develop illustrations and applications (30 minutes)</li>
                <li>• Personal review and customization (60-90 minutes)</li>
                <li>• Final touches and practice (30 minutes)</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-12 shadow-xl border-0 bg-gradient-to-r from-orange-50 to-red-50">
          <CardHeader>
            <CardTitle className="text-2xl text-gray-900 flex items-center gap-3">
              <ExternalLink className="w-6 h-6 text-orange-500" />
              Transform Your Sermon Preparation Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg text-gray-700 mb-6">
              Experience the transformation from verses to sermons with Bible Aura's AI-powered ministry tools:
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              <Button asChild className="bg-blue-500 hover:bg-blue-600">
                <Link to="/sermon-writer">
                  <Mic className="w-4 h-4 mr-2" />
                  Sermon Writer
                </Link>
              </Button>
              <Button asChild variant="outline" className="border-purple-500 text-purple-600 hover:bg-purple-50">
                <Link to="/bible-ai">
                  <Brain className="w-4 h-4 mr-2" />
                  AI Bible Chat
                </Link>
              </Button>
              <Button asChild variant="outline" className="border-green-500 text-green-600 hover:bg-green-50">
                <Link to="/bible">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Bible Study
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-between items-center py-8 border-t border-gray-200">
          <Button asChild variant="outline" className="flex items-center gap-2">
            <Link to="/blog/bible-aura-vs-other-bible-apps-clear-winner-ai-powered-insights">
              <ArrowLeft className="w-4 h-4" />
              Previous Article
            </Link>
          </Button>
          <Button asChild className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-orange-500 text-white">
            <Link to="/blog/how-benaiah-nicholas-nimal-built-bible-aura-future-of-bible-study-ai">
              Next Article
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>

      <SEOBacklinks currentPage="blog" />
      <Footer />
    </div>
  );
};

export default FromVersesToSermons; 