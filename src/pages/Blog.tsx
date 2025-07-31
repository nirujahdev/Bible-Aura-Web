import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GlobalNavigation } from "@/components/GlobalNavigation";
import { 
  Calendar, Clock, User, ArrowRight, BookOpen, Bot, MessageSquare,
  TrendingUp, Search, CheckCircle, Lightbulb, Target, Brain, FileText
} from "lucide-react";
import { Link } from "react-router-dom";
import { useSEO, SEO_CONFIG } from "@/hooks/useSEO";
import { SEOBacklinks } from "@/components/SEOBacklinks";
import { ManualContextualLinks } from "@/components/ContextualLinks";

const Blog = () => {
  // SEO optimization
  useSEO(SEO_CONFIG.BLOG);

  const blogPosts = [
    {
      id: 1,
      title: "How AI Transforms Bible Study: Complete Guide",
      slug: "how-ai-transforms-bible-study",
      excerpt: "Discover how artificial intelligence is revolutionizing biblical study with smart insights, contextual analysis, and personalized learning experiences.",
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
      excerpt: "Compare AI-powered Bible study with traditional methods. Learn the benefits and limitations of each approach for modern believers.",
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
      excerpt: "Explore the top 10 advantages of incorporating AI into your Bible study routine for deeper understanding and spiritual growth.",
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
      excerpt: "Examining the accuracy and reliability of AI-generated biblical insights. What you need to know about Biblical AI limitations and strengths.",
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
      excerpt: "Master the art of AI Bible chat with our comprehensive guide to features, best practices, and advanced techniques for spiritual inquiry.",
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
      excerpt: "Learn advanced Bible search techniques using AI to find relevant scriptures, themes, and connections you never knew existed.",
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
      excerpt: "Everything you need to know about using a Biblical AI assistant for study, prayer, and spiritual guidance in your daily life.",
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
  const recentPosts = blogPosts.filter(post => !post.featured);

  return (
    <div className="min-h-screen bg-background w-full">
      {/* Global Navigation */}
      <GlobalNavigation variant="landing" />

      {/* Hero Section - Blog Focus */}
      <section className="relative py-12 md:py-16 lg:py-20 px-4 md:px-6 lg:px-10 bg-gradient-to-br from-indigo-50 via-white to-purple-50 overflow-hidden pt-24 md:pt-28 lg:pt-32">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-32 md:w-48 lg:w-64 h-32 md:h-48 lg:h-64 bg-indigo-400/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-48 md:w-64 lg:w-80 h-48 md:h-64 lg:h-80 bg-purple-400/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative w-full max-w-6xl mx-auto text-center">
          <div className="space-y-6 md:space-y-8">
            {/* Header Icon */}
            <div className="inline-flex items-center justify-center w-16 md:w-20 h-16 md:h-20 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white mx-auto shadow-lg">
              <FileText className="h-8 md:h-10 w-8 md:w-10" />
            </div>

            {/* Main Title */}
            <div className="space-y-4 md:space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight">
                <span className="text-transparent bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text">
                  Bible AI
                </span>
                <br />
                <span className="text-gray-900">
                  Blog
                </span>
              </h1>
              
              <p className="text-lg md:text-xl lg:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
                Expert insights on AI-powered Bible study, digital biblical analysis, and the future of Christian technology.
              </p>
            </div>

            {/* Blog Stats */}
            <div className="flex flex-wrap justify-center gap-6 lg:gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-2xl lg:text-3xl font-bold text-indigo-600 mb-1">{blogPosts.length}+</div>
                <div className="text-gray-600 text-sm lg:text-base">Expert Articles</div>
              </div>
              <div className="text-center">
                <div className="text-2xl lg:text-3xl font-bold text-purple-600 mb-1">50K+</div>
                <div className="text-gray-600 text-sm lg:text-base">Monthly Readers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl lg:text-3xl font-bold text-green-600 mb-1">Weekly</div>
                <div className="text-gray-600 text-sm lg:text-base">New Content</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Articles Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="w-full px-4 md:px-6 lg:px-10 max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Featured <span className="text-transparent bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text">Articles</span>
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              Deep dives into Bible AI technology, comprehensive guides, and expert analysis
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
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

          {/* All Featured Posts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredPosts.slice(2).map((post) => (
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

      {/* Recent Articles Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-gray-50 to-indigo-50">
        <div className="w-full px-4 md:px-6 lg:px-10 max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Recent <span className="text-transparent bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text">Articles</span>
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              Stay updated with the latest insights on Bible AI and Christian technology
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {recentPosts.map((post) => (
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
                  <div className="flex flex-wrap gap-1 mb-4">
                    {post.tags.slice(0, 2).map((tag, tagIndex) => (
                      <span key={tagIndex} className="px-2 py-1 bg-gray-50 text-gray-600 rounded text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-xs text-gray-500">
                      <Clock className="h-3 w-3 mr-1" />
                      {post.readTime}
                    </div>
                    <Button asChild size="sm" variant="outline" className="hover:bg-gray-50">
                      <Link to={`/blog/${post.slug}`}>
                        Read
                        <ArrowRight className="ml-1 h-3 w-3" />
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
        <div className="w-full px-4 md:px-6 lg:px-10 max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            Experience Bible AI Yourself
          </h2>
          <p className="text-lg md:text-xl mb-8 opacity-90 max-w-3xl mx-auto">
            Ready to transform your Bible study with AI? Join thousands who are already discovering deeper biblical insights.
          </p>
          <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
            <Button asChild size="lg" variant="secondary" className="bg-white text-indigo-600 hover:bg-gray-100 text-lg px-8 py-6 rounded-xl shadow-lg w-full sm:w-auto">
              <Link to="/bible-ai">
                <Bot className="mr-2 h-5 w-5" />
                Try Bible AI Free
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-indigo-600 text-lg px-8 py-6 rounded-xl w-full sm:w-auto">
              <Link to="/auth">
                <ArrowRight className="mr-2 h-5 w-5" />
                Get Started
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Related Content Section for SEO */}
      <section className="py-12 bg-gray-50">
        <div className="w-full px-4 md:px-6 lg:px-10 max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Explore More Bible Resources
            </h2>
            <p className="text-gray-600">
              Discover related tools and insights to enhance your Bible study experience
            </p>
          </div>
          <ManualContextualLinks context="ai-features" limit={6} />
        </div>
      </section>

      {/* SEO Internal Links */}
      <SEOBacklinks currentPage="/blog" category="blog" />

      {/* Footer */}
      <footer className="bg-black text-white py-16">
        <div className="w-full px-4 sm:px-6 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
            {/* Brand Section */}
            <div className="text-center md:text-left">
              <h3 className="text-2xl font-bold text-orange-400 mb-3">
                ✦Bible Aura
              </h3>
              <p className="text-gray-400 text-base">
                AI-Powered Biblical Insight
              </p>
            </div>
            
            {/* Menu Section */}
            <div className="text-center md:text-left">
              <h4 className="text-xl font-semibold text-white mb-6">Bible AI</h4>
              <nav className="space-y-3">
                <Link to="/bible-ai" className="block text-gray-400 hover:text-orange-400 transition-colors duration-300">
                  Bible AI Platform
                </Link>
                <Link to="/ai-bible-study" className="block text-gray-400 hover:text-orange-400 transition-colors duration-300">
                  AI Bible Study
                </Link>
                <Link to="/bible-chat" className="block text-gray-400 hover:text-orange-400 transition-colors duration-300">
                  Bible Chat
                </Link>
                <Link to="/digital-bible" className="block text-gray-400 hover:text-orange-400 transition-colors duration-300">
                  Digital Bible
                </Link>
              </nav>
            </div>
            
            {/* Blog Section */}
            <div className="text-center md:text-left">
              <h4 className="text-xl font-semibold text-white mb-6">Popular Articles</h4>
              <nav className="space-y-3">
                <Link to="/blog/how-ai-transforms-bible-study" className="block text-gray-400 hover:text-orange-400 transition-colors duration-300">
                  AI Bible Study Guide
                </Link>
                <Link to="/blog/bible-ai-vs-traditional-study" className="block text-gray-400 hover:text-orange-400 transition-colors duration-300">
                  AI vs Traditional Study
                </Link>
                <Link to="/blog/ai-bible-insights-accuracy" className="block text-gray-400 hover:text-orange-400 transition-colors duration-300">
                  AI Insights Accuracy
                </Link>
                <Link to="/blog/ai-bible-chat-features" className="block text-gray-400 hover:text-orange-400 transition-colors duration-300">
                  AI Chat Features
                </Link>
              </nav>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="border-t border-gray-800 mt-12 pt-8">
            <div className="text-center text-gray-400 text-sm">
              <span>&copy; 2024 ✦Bible Aura. All rights reserved. Bible AI Blog by </span>
              <a 
                href="https://www.instagram.com/benaiah_4?igsh=cGZuYmI2YWw0d25r" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-orange-400 hover:text-orange-300 transition-colors duration-300 underline"
              >
                Benaiah Nicholas Nimal
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Blog; 