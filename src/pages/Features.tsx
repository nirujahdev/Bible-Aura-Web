import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GlobalNavigation } from "@/components/GlobalNavigation";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import { 
  Sparkles, BookOpen, Brain, MessageCircle, User, Library, 
  GraduationCap, PenTool, Search, Cross, Heart, Bookmark,
  FileText, Edit, Lightbulb, Target, Settings, Crown
} from "lucide-react";
import { useSEO, SEO_CONFIG } from "@/hooks/useSEO";

const Features = () => {
  // SEO optimization
  useSEO(SEO_CONFIG.FEATURES);

  return (
    <div className="min-h-screen bg-background w-full">
      {/* Global Navigation */}
      <GlobalNavigation variant="landing" />

      {/* Hero Section */}
      <section className="relative py-16 md:py-24 lg:py-32 px-4 md:px-6 lg:px-10 bg-gradient-to-br from-orange-50 via-white to-amber-50 overflow-hidden pt-24 md:pt-28 lg:pt-32">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-32 md:w-48 lg:w-64 h-32 md:h-48 lg:h-64 bg-orange-400/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-48 md:w-64 lg:w-80 h-48 md:h-64 lg:h-80 bg-yellow-400/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative w-full max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 md:w-20 h-16 md:h-20 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 text-white mx-auto mb-8 shadow-lg">
            <span className="text-2xl md:text-3xl font-bold">✦</span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight mb-6">
            <span className="text-transparent bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text">
              Bible Aura Features
            </span>
          </h1>
          
          <div className="w-24 md:w-32 h-1 bg-gradient-to-r from-orange-500 to-purple-500 mx-auto mb-8"></div>
          
          <p className="text-lg md:text-xl lg:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed mb-12">
            Discover all the powerful tools and features designed to enhance your spiritual journey with cutting-edge AI technology
          </p>

          <Button asChild size="lg" className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-lg px-8 py-6 rounded-xl shadow-lg hover:scale-105 transition-transform">
            <Link to="/auth">
              <Sparkles className="h-5 w-5 mr-2" />
              EXPLORE ALL FEATURES
            </Link>
          </Button>
        </div>
      </section>

      {/* Feature Section 1: Bible Study */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="w-full px-4 md:px-6 lg:px-10 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Content */}
            <div className="order-2 lg:order-1">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white mb-6">
                <span className="text-lg font-bold">01</span>
              </div>
              
              <div className="text-blue-600 text-sm font-semibold mb-2">Bible Study</div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
                Explore Scripture with <span className="text-transparent bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text">Interactive Reading</span>
              </h2>
              
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Immerse yourself in an innovative Bible reading mode that combines traditional scripture study with dynamic, AI-driven insights. Navigate through passages effortlessly while uncovering historical context and modern interpretations that breathe new life into your study.
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full mr-4"></div>
                  <span className="font-medium">Bible Reading with AI insights</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full mr-4"></div>
                  <span className="font-medium">Verse Search across multiple translations</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full mr-4"></div>
                  <span className="font-medium">Cross References and contextual connections</span>
                </div>
              </div>

              <Button asChild className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white">
                <Link to="/auth">
                  Start Reading
                  <BookOpen className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>

            {/* Right Side - Visual */}
            <div className="order-1 lg:order-2 flex justify-center">
              <div className="relative">
                <div className="w-80 h-80 bg-gradient-to-br from-blue-100 to-blue-200 rounded-3xl flex items-center justify-center shadow-2xl">
                  <BookOpen className="h-24 w-24 text-blue-600" />
                </div>
                <div className="absolute -top-4 -right-4 w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                  <Heart className="h-8 w-8 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section 2: AI Features */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-purple-50 via-white to-violet-50">
        <div className="w-full px-4 md:px-6 lg:px-10 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Visual */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-80 h-80 bg-gradient-to-br from-purple-100 to-purple-200 rounded-3xl flex items-center justify-center shadow-2xl">
                  <Brain className="h-24 w-24 text-purple-600" />
                </div>
                <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center shadow-lg">
                  <MessageCircle className="h-8 w-8 text-white" />
                </div>
              </div>
            </div>

            {/* Right Side - Content */}
            <div>
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 text-white mb-6">
                <span className="text-lg font-bold">02</span>
              </div>
              
              <div className="text-purple-600 text-sm font-semibold mb-2">AI Features</div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
                Discover Top Bible <span className="text-transparent bg-gradient-to-r from-purple-500 to-purple-600 bg-clip-text">Questions Today</span>
              </h2>
              
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Explore a carefully curated collection of the most frequently asked Bible questions designed to spark insightful discussions and inspire personal growth. Delve into diverse topics and uncover wisdom that addresses common spiritual challenges.
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full mr-4"></div>
                  <span className="font-medium">AI Chat Oracle for instant guidance</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full mr-4"></div>
                  <span className="font-medium">Biblical Q&A with contextual insights</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full mr-4"></div>
                  <span className="font-medium">Smart Recommendations based on your study</span>
                </div>
              </div>

              <Button asChild className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white">
                <Link to="/auth">
                  Ask your question
                  <MessageCircle className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section 3: Personal Tools */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-green-50 via-white to-emerald-50">
        <div className="w-full px-4 md:px-6 lg:px-10 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Content */}
            <div className="order-2 lg:order-1">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-green-500 to-green-600 text-white mb-6">
                <span className="text-lg font-bold">03</span>
              </div>
              
              <div className="text-green-600 text-sm font-semibold mb-2">Personal Tools</div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
                Experience the Future of <span className="text-transparent bg-gradient-to-r from-green-500 to-green-600 bg-clip-text">Spiritual Growth</span>
              </h2>
              
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Personalize your spiritual journey with powerful tools designed to track your progress, save meaningful insights, and create a comprehensive record of your faith development through interactive features.
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-gradient-to-r from-green-500 to-green-600 rounded-full mr-4"></div>
                  <span className="font-medium">Digital Journal for spiritual reflections</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-gradient-to-r from-green-500 to-green-600 rounded-full mr-4"></div>
                  <span className="font-medium">Favorites and Bookmarks system</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-gradient-to-r from-green-500 to-green-600 rounded-full mr-4"></div>
                  <span className="font-medium">Reading Progress tracking</span>
                </div>
              </div>

              <Button asChild className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white">
                <Link to="/auth">
                  Start Your Journey
                  <User className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>

            {/* Right Side - Visual */}
            <div className="order-1 lg:order-2 flex justify-center">
              <div className="relative">
                <div className="w-80 h-80 bg-gradient-to-br from-green-100 to-green-200 rounded-3xl flex items-center justify-center shadow-2xl">
                  <User className="h-24 w-24 text-green-600" />
                </div>
                <div className="absolute -top-4 -right-4 w-16 h-16 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                  <Bookmark className="h-8 w-8 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section 4: Learning Resources */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-orange-50 via-white to-amber-50">
        <div className="w-full px-4 md:px-6 lg:px-10 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Visual */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-80 h-80 bg-gradient-to-br from-orange-100 to-orange-200 rounded-3xl flex items-center justify-center shadow-2xl">
                  <Library className="h-24 w-24 text-orange-600" />
                </div>
                <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center shadow-lg">
                  <Crown className="h-8 w-8 text-white" />
                </div>
              </div>
            </div>

            {/* Right Side - Content */}
            <div>
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 text-white mb-6">
                <span className="text-lg font-bold">04</span>
              </div>
              
              <div className="text-orange-600 text-sm font-semibold mb-2">Learning Resources</div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
                Rich Spiritual <span className="text-transparent bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text">Content Library</span>
              </h2>
              
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Access an extensive collection of spiritual resources including sermons, songs, study plans, and character studies. Build your biblical knowledge with curated content designed to enhance your understanding and application of Scripture.
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full mr-4"></div>
                  <span className="font-medium">Comprehensive Sermon Library</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full mr-4"></div>
                  <span className="font-medium">Daily Verses and inspirational content</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full mr-4"></div>
                  <span className="font-medium">Bible Characters and study plans</span>
                </div>
              </div>

              <Button asChild className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white">
                <Link to="/auth">
                  Explore Resources
                  <Library className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section 5: Advanced Study */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-indigo-50 via-white to-blue-50">
        <div className="w-full px-4 md:px-6 lg:px-10 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Content */}
            <div className="order-2 lg:order-1">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-600 text-white mb-6">
                <span className="text-lg font-bold">05</span>
              </div>
              
              <div className="text-indigo-600 text-sm font-semibold mb-2">Advanced Study</div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
                Deep Theological <span className="text-transparent bg-gradient-to-r from-indigo-500 to-indigo-600 bg-clip-text">Exploration</span>
              </h2>
              
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Dive deeper into Scripture with advanced study tools including original Hebrew and Greek word studies, historical context analysis, and comprehensive theological commentary access for serious Bible scholars.
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full mr-4"></div>
                  <span className="font-medium">Hebrew/Greek word analysis</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full mr-4"></div>
                  <span className="font-medium">Historical Context and commentary</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full mr-4"></div>
                  <span className="font-medium">Parable Studies and cross-references</span>
                </div>
              </div>

              <Button asChild className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white">
                <Link to="/auth">
                  Deep Dive Study
                  <GraduationCap className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>

            {/* Right Side - Visual */}
            <div className="order-1 lg:order-2 flex justify-center">
              <div className="relative">
                <div className="w-80 h-80 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-3xl flex items-center justify-center shadow-2xl">
                  <GraduationCap className="h-24 w-24 text-indigo-600" />
                </div>
                <div className="absolute -top-4 -right-4 w-16 h-16 bg-indigo-500 rounded-full flex items-center justify-center shadow-lg">
                  <Target className="h-8 w-8 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section 6: Content Creation */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-pink-50 via-white to-rose-50">
        <div className="w-full px-4 md:px-6 lg:px-10 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Visual */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-80 h-80 bg-gradient-to-br from-pink-100 to-pink-200 rounded-3xl flex items-center justify-center shadow-2xl">
                  <PenTool className="h-24 w-24 text-pink-600" />
                </div>
                <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-pink-500 rounded-full flex items-center justify-center shadow-lg">
                  <Edit className="h-8 w-8 text-white" />
                </div>
              </div>
            </div>

            {/* Right Side - Content */}
            <div>
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-pink-500 to-pink-600 text-white mb-6">
                <span className="text-lg font-bold">06</span>
              </div>
              
              <div className="text-pink-600 text-sm font-semibold mb-2">Content Creation</div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
                Create and Share <span className="text-transparent bg-gradient-to-r from-pink-500 to-pink-600 bg-clip-text">Spiritual Content</span>
              </h2>
              
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Empower your ministry and personal growth with comprehensive content creation tools. Prepare sermons, write reflections, and create teaching materials with AI-assisted guidance and biblical accuracy.
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-gradient-to-r from-pink-500 to-pink-600 rounded-full mr-4"></div>
                  <span className="font-medium">Sermon Preparation tools</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-gradient-to-r from-pink-500 to-pink-600 rounded-full mr-4"></div>
                  <span className="font-medium">Personal Reflections and prayer writing</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-gradient-to-r from-pink-500 to-pink-600 rounded-full mr-4"></div>
                  <span className="font-medium">Teaching Materials and ministry resources</span>
                </div>
              </div>

              <Button asChild className="bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white">
                <Link to="/auth">
                  Start Creating
                  <PenTool className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-orange-500 to-orange-600 text-white">
        <div className="w-full px-4 md:px-6 lg:px-10 max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
            Ready to Transform Your Bible Study?
          </h2>
          <p className="text-lg md:text-xl mb-8 opacity-90 max-w-3xl mx-auto">
            Start your spiritual journey today with all these powerful features at your fingertips.
          </p>
          <Button asChild size="lg" variant="secondary" className="bg-white text-orange-600 hover:bg-gray-100 text-lg px-8 py-6 rounded-xl shadow-lg">
            <Link to="/auth">
              <span className="text-orange-600 mr-2">✦</span>
              START YOUR JOURNEY
            </Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Features; 