import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GlobalNavigation } from "@/components/GlobalNavigation";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import { 
  Sparkles, BookOpen, Brain, MessageCircle, User, Library, 
  GraduationCap, PenTool, Search, Cross, Heart, Bookmark,
  FileText, Edit, Lightbulb, Target, Settings, Crown, 
  ArrowRight, MousePointer, Zap
} from "lucide-react";
import { useSEO, SEO_CONFIG } from "@/hooks/useSEO";

const Features = () => {
  // SEO optimization
  useSEO(SEO_CONFIG.FEATURES);

  // Feature categories for navigation
  const featureCategories = [
    {
      id: "bible-study",
      title: "Bible Study Tools",
      description: "Comprehensive Scripture study with AI insights",
      icon: BookOpen,
      link: "/features/bible-study",
      color: "blue",
      features: ["Bible Reading", "Verse Search", "Cross References", "Multiple Translations"]
    },
    {
      id: "ai-features", 
      title: "AI Features",
      description: "Revolutionary AI-powered biblical assistance",
      icon: Brain,
      link: "/features/ai-features",
      color: "purple",
      features: ["AI Chat Oracle", "Biblical Q&A", "AI Analysis", "Scripture Insights"]
    },
    {
      id: "content-creation",
      title: "Content Creation",
      description: "Professional tools for sermons and studies",
      icon: Edit,
      link: "/features/content-creation", 
      color: "green",
      features: ["Sermon Preparation", "Study Notes", "Personal Reflections"]
    },
    {
      id: "personal-tools",
      title: "Personal Tools",
      description: "Track and organize your spiritual journey",
      icon: User,
      link: "/features/personal-tools",
      color: "indigo",
      features: ["Journal", "Favorites", "Bookmarks", "Reading Progress"]
    },
    {
      id: "learning-resources",
      title: "Learning Resources",
      description: "Sermons, songs, and study materials",
      icon: Library,
      link: "/features/learning-resources",
      color: "pink",
      features: ["Sermon Library", "Songs", "Study Plans", "Daily Verses"]
    },
    {
      id: "advanced-study",
      title: "Advanced Study",
      description: "Professional biblical scholarship tools",
      icon: GraduationCap,
      link: "/features/advanced-study",
      color: "orange",
      features: ["Hebrew/Greek Words", "Historical Context", "Theological Topics"]
    }
  ];

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
          
          <p className="text-lg md:text-xl lg:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed mb-8">
            Discover all the powerful tools and features designed to enhance your spiritual journey with cutting-edge AI technology
          </p>

          {/* Interactive Exploration Hint */}
          <div className="flex items-center justify-center gap-2 mb-8 text-gray-500">
            <MousePointer className="h-4 w-4" />
            <span className="text-sm">Hover over feature cards below to explore each category</span>
          </div>

          <Button asChild size="lg" className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-lg px-8 py-6 rounded-xl shadow-lg hover:scale-105 transition-transform">
            <Link to="/auth">
              <Sparkles className="h-5 w-5 mr-2" />
              EXPLORE ALL FEATURES
            </Link>
          </Button>
        </div>
      </section>

      {/* Interactive Feature Categories Grid */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Explore Features by Category
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Click any category to explore individual features and learn how they can enhance your Bible study experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featureCategories.map((category) => {
              const colorConfig = {
                blue: { 
                  bg: 'bg-blue-50', 
                  hover: 'hover:bg-blue-100', 
                  text: 'text-blue-600', 
                  gradient: 'from-blue-500 to-blue-600',
                  border: 'border-blue-200'
                },
                purple: { 
                  bg: 'bg-purple-50', 
                  hover: 'hover:bg-purple-100', 
                  text: 'text-purple-600', 
                  gradient: 'from-purple-500 to-purple-600',
                  border: 'border-purple-200'
                },
                green: { 
                  bg: 'bg-green-50', 
                  hover: 'hover:bg-green-100', 
                  text: 'text-green-600', 
                  gradient: 'from-green-500 to-green-600',
                  border: 'border-green-200'
                },
                indigo: { 
                  bg: 'bg-indigo-50', 
                  hover: 'hover:bg-indigo-100', 
                  text: 'text-indigo-600', 
                  gradient: 'from-indigo-500 to-indigo-600',
                  border: 'border-indigo-200'
                },
                pink: { 
                  bg: 'bg-pink-50', 
                  hover: 'hover:bg-pink-100', 
                  text: 'text-pink-600', 
                  gradient: 'from-pink-500 to-pink-600',
                  border: 'border-pink-200'
                },
                orange: { 
                  bg: 'bg-orange-50', 
                  hover: 'hover:bg-orange-100', 
                  text: 'text-orange-600', 
                  gradient: 'from-orange-500 to-orange-600',
                  border: 'border-orange-200'
                }
              };

              const colors = colorConfig[category.color as keyof typeof colorConfig];

              return (
                <Card 
                  key={category.id} 
                  className={`group cursor-pointer transition-all duration-300 hover:shadow-2xl hover:scale-105 border-2 ${colors.border} ${colors.bg} ${colors.hover}`}
                >
                  <CardHeader className="text-center pb-4">
                    <div className={`w-20 h-20 bg-gradient-to-r ${colors.gradient} rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                      <category.icon className="h-10 w-10 text-white" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-gray-900 mb-3">
                      {category.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-gray-600 mb-6 leading-relaxed">
                      {category.description}
                    </p>
                    
                    <div className="space-y-2 mb-8">
                      {category.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center text-sm text-gray-500 justify-center">
                          <div className={`w-2 h-2 bg-gradient-to-r ${colors.gradient} rounded-full mr-3`}></div>
                          {feature}
                        </div>
                      ))}
                    </div>
                    
                    <Button asChild className={`w-full bg-gradient-to-r ${colors.gradient} hover:scale-105 text-white shadow-lg transition-all`}>
                      <Link to={category.link}>
                        <Zap className="mr-2 h-4 w-4" />
                        Explore {category.title}
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
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

              <div className="flex gap-4">
                <Button asChild className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white">
                  <Link to="/features/bible-study">
                    <Target className="h-4 w-4 mr-2" />
                    Explore Bible Tools
                  </Link>
                </Button>
                <Button asChild variant="outline" className="border-blue-500 text-blue-600 hover:bg-blue-500 hover:text-white">
                  <Link to="/auth">
                    Start Reading
                    <BookOpen className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </div>
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

              <div className="flex gap-4">
                <Button asChild className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white">
                  <Link to="/features/ai-features">
                    <Brain className="h-4 w-4 mr-2" />
                    Explore AI Features
                  </Link>
                </Button>
                <Button asChild variant="outline" className="border-purple-500 text-purple-600 hover:bg-purple-500 hover:text-white">
                  <Link to="/auth">
                    Ask your question
                    <MessageCircle className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </div>
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

              <div className="flex gap-4">
                <Button asChild className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white">
                  <Link to="/features/personal-tools">
                    <User className="h-4 w-4 mr-2" />
                    Explore Personal Tools
                  </Link>
                </Button>
                <Button asChild variant="outline" className="border-green-500 text-green-600 hover:bg-green-500 hover:text-white">
                  <Link to="/auth">
                    Start your journey
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </div>
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

      {/* Call to Action */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-orange-500 to-orange-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 md:px-6 lg:px-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Transform Your Bible Study?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands who are discovering deeper biblical truths with our comprehensive suite of AI-powered study tools.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary" className="bg-white text-orange-600 hover:bg-gray-100 px-8 py-4">
              <Link to="/auth">
                <Crown className="mr-2 h-5 w-5" />
                Start Free Today
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-orange-600 px-8 py-4">
              <Link to="/pricing">
                <Sparkles className="mr-2 h-5 w-5" />
                View Pricing
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