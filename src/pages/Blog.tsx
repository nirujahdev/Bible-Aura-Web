import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GlobalNavigation } from "@/components/GlobalNavigation";
import { 
  Calendar, Clock, ArrowRight, Bot, MessageSquare,
  TrendingUp, Search, CheckCircle, Lightbulb, Target, Brain, FileText
} from "lucide-react";
import { Link } from "react-router-dom";
import Footer from "@/components/Footer";
import { useSEO, SEO_CONFIG } from "@/hooks/useSEO";
import { SEOBacklinks } from "@/components/SEOBacklinks";


const Blog = () => {
  // SEO optimization
  useSEO(SEO_CONFIG.BLOG);

  const blogPosts = [
    {
      id: 1,
      title: "How AI Transforms Bible Study: Complete Guide",
      slug: "how-ai-transforms-bible-study",
      excerpt: "Discover how Bible Aura AI-powered biblical insights revolutionize biblical study with smart analysis, contextual understanding, and personalized learning experiences.",
      category: "AI Bible Study",
      readTime: "12 min read",
      publishDate: "December 20, 2024",
      author: "Bible Aura Team",
      tags: ["Bible AI", "AI Bible Study", "Digital Bible", "Bible Technology"],
      icon: Brain,
      gradient: "from-blue-500 to-blue-600",
      featured: true
    },
    {
      id: 2,
      title: "Bible AI vs Traditional Study: Which is Better?",
      slug: "bible-ai-vs-traditional-study",
      excerpt: "Compare Bible Aura AI-powered biblical insights with traditional study methods. Learn the benefits and limitations of each approach for modern believers.",
      category: "Comparison",
      readTime: "10 min read",
      publishDate: "December 19, 2024",
      author: "Bible Aura Team",
      tags: ["Bible AI", "Traditional Study", "Comparison", "Bible Methods"],
      icon: Target,
      gradient: "from-purple-500 to-purple-600",
      featured: true
    },
    {
      id: 3,
      title: "10 Benefits of Using AI for Bible Study",
      slug: "bible-study-ai-benefits",
      excerpt: "Explore the top 10 advantages of incorporating Bible Aura AI-powered biblical insights into your Bible study routine for deeper understanding and spiritual growth.",
      category: "Benefits",
      readTime: "8 min read",
      publishDate: "December 18, 2024",
      author: "Bible Aura Team",
      tags: ["Bible AI Benefits", "AI Bible Study", "Spiritual Growth"],
      icon: CheckCircle,
      gradient: "from-green-500 to-green-600",
      featured: true
    },
    {
      id: 4,
      title: "Are AI Bible Insights Accurate? Truth About Biblical AI",
      slug: "ai-bible-insights-accuracy",
      excerpt: "Examining the accuracy and reliability of Bible Aura AI-powered biblical insights. What you need to know about Biblical AI limitations and strengths.",
      category: "Accuracy",
      readTime: "15 min read",
      publishDate: "December 17, 2024",
      author: "Bible Aura Team",
      tags: ["AI Accuracy", "Biblical AI", "AI Reliability", "Bible Truth"],
      icon: Search,
      gradient: "from-orange-500 to-orange-600",
      featured: true
    },
    {
      id: 5,
      title: "Ultimate Guide to AI Bible Chat Features",
      slug: "ai-bible-chat-features",
      excerpt: "Master the art of Bible Aura AI-powered biblical insights chat with our comprehensive guide to features, best practices, and advanced techniques for spiritual inquiry.",
      category: "Features",
      readTime: "11 min read",
      publishDate: "December 16, 2024",
      author: "Bible Aura Team",
      tags: ["AI Bible Chat", "Bible Chatbot", "AI Features", "Bible AI Assistant"],
      icon: MessageSquare,
      gradient: "from-indigo-500 to-indigo-600",
      featured: true
    },
    {
      id: 6,
      title: "Smart Bible Search Techniques with AI",
      slug: "smart-bible-search-techniques",
      excerpt: "Learn advanced Bible search techniques using Bible Aura AI-powered biblical insights to find relevant scriptures, themes, and connections you never knew existed.",
      category: "Techniques",
      readTime: "9 min read",
      publishDate: "December 15, 2024",
      author: "Bible Aura Team",
      tags: ["Bible Search", "AI Search", "Scripture Discovery", "Bible Techniques"],
      icon: Search,
      gradient: "from-teal-500 to-teal-600",
      featured: false
    },
    {
      id: 7,
      title: "Complete Guide to Biblical AI Assistant",
      slug: "biblical-ai-assistant-guide",
      excerpt: "Everything you need to know about using Bible Aura AI-powered biblical insights assistant for study, prayer, and spiritual guidance in your daily life.",
      category: "Guide",
      readTime: "13 min read",
      publishDate: "December 14, 2024",
      author: "Bible Aura Team",
      tags: ["Biblical AI Assistant", "AI Companion", "Spiritual Guidance", "Bible AI"],
      icon: Bot,
      gradient: "from-rose-500 to-rose-600",
      featured: false
    },
    {
      id: 8,
      title: "The Future of Christian AI Technology",
      slug: "christian-ai-technology-future",
      excerpt: "Explore the exciting future of Christian AI technology and how it will shape biblical study, ministry, and spiritual growth.",
      category: "Future",
      readTime: "10 min read",
      publishDate: "December 13, 2024",
      author: "Bible Aura Team",
      tags: ["Christian AI", "AI Technology", "Future", "Ministry Technology"],
      icon: TrendingUp,
      gradient: "from-violet-500 to-violet-600",
      featured: false
    }
  ];

  const featuredPosts = blogPosts.filter(post => post.featured);
  const allPosts = blogPosts;

  return (
    <div className="min-h-screen bg-background w-full">
      {/* Global Navigation */}
      <GlobalNavigation variant="landing" />

      {/* Hero Section - Compact */}
      <section className="relative py-12 px-4 md:px-6 lg:px-10 bg-gradient-to-br from-indigo-50 via-white to-purple-50 overflow-hidden pt-24 md:pt-28">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-32 md:w-48 h-32 md:h-48 bg-indigo-400/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-48 md:w-64 h-48 md:h-64 bg-purple-400/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative w-full max-w-6xl mx-auto text-center">
          <div className="space-y-4 md:space-y-6">
            {/* Header Icon */}
            <div className="inline-flex items-center justify-center w-12 md:w-16 h-12 md:h-16 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white mx-auto shadow-lg">
              <FileText className="h-6 md:h-8 w-6 md:w-8" />
            </div>

            {/* Main Title */}
            <div className="space-y-3 md:space-y-4">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
                <span className="text-transparent bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text">
                  Bible AI Blog
                </span>
              </h1>
              
              <div className="flex justify-center mb-3">
                <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                  Bible Aura AI-Powered Biblical Insights
                </span>
              </div>
              
              <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Expert insights on AI-powered Bible study, digital biblical analysis, and the future of Christian technology.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Articles Section */}
      <section className="py-16 md:py-20 bg-white">
        <div className="w-full px-4 md:px-6 lg:px-10 max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Featured <span className="text-transparent bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text">Articles</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Deep dives into Bible AI technology, comprehensive guides, and expert analysis
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {featuredPosts.slice(0, 2).map((post, index) => (
              <Card key={post.id} className="group hover:shadow-2xl transition-all duration-300 border-0 shadow-lg bg-white hover:scale-105 overflow-hidden">
                <div className={`h-2 bg-gradient-to-r ${post.gradient}`}></div>
                <CardHeader className="p-8">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 bg-gradient-to-r ${post.gradient} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                      <post.icon className="h-6 w-6 text-white" />
                    </div>
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                      {post.category}
                    </span>
                  </div>
                  <CardTitle className="text-2xl font-bold text-gray-900 mb-4 leading-tight">
                    {post.title}
                  </CardTitle>
                  <p className="text-gray-600 leading-relaxed mb-6">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {post.publishDate}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {post.readTime}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="px-8 pb-8">
                  <div className="flex flex-wrap gap-2 mb-6">
                    {post.tags.slice(0, 3).map((tag, tagIndex) => (
                      <span key={tagIndex} className="px-2 py-1 bg-gray-50 text-gray-600 rounded text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <Button asChild className={`w-full bg-gradient-to-r ${post.gradient} hover:opacity-90 text-white`}>
                    <Link to={`/blog/${post.slug}`}>
                      Read Article
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* All Articles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {allPosts.slice(2).map((post) => (
              <Card key={post.id} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-white hover:scale-105">
                <CardHeader className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-10 h-10 bg-gradient-to-r ${post.gradient} rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                      <post.icon className="h-5 w-5 text-white" />
                    </div>
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                      {post.category}
                    </span>
                  </div>
                  <CardTitle className="text-lg font-bold text-gray-900 mb-3 leading-tight">
                    {post.title}
                  </CardTitle>
                  <p className="text-gray-600 text-sm leading-relaxed mb-4">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center text-xs text-gray-500 mb-4">
                    <Clock className="h-3 w-3 mr-1" />
                    {post.readTime}
                  </div>
                  <Button asChild size="sm" className={`w-full bg-gradient-to-r ${post.gradient} hover:opacity-90 text-white`}>
                    <Link to={`/blog/${post.slug}`}>
                      Read More
                      <ArrowRight className="ml-2 h-3 w-3" />
                    </Link>
                  </Button>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* SEO Internal Links */}
      <SEOBacklinks currentPage="/blog" category="blog" />
      <Footer />
    </div>
  );
};

export default Blog; 