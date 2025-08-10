import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GlobalNavigation } from "@/components/GlobalNavigation";
import { 
  Calendar, Clock, ArrowRight, Bot, MessageSquare, TrendingUp, Search, 
  CheckCircle, Lightbulb, Target, Brain, FileText, Crown, Trophy, 
  Award, Sparkles, Heart, Rocket, Users, Building, Star
} from "lucide-react";
import { Link } from "react-router-dom";
import Footer from "@/components/Footer";
import { useSEO } from "@/hooks/useSEO";
import { SEOBacklinks } from "@/components/SEOBacklinks";

const Blog = () => {
  // Enhanced SEO optimization with structured data
  useSEO({
    title: "Bible Aura Blog | #1 AI Bible Study Articles, Guides & Success Stories 2025",
    description: "Discover the #1 Bible AI blog with expert guides on Bible Aura's AI Bible chat, success stories, tutorials, and insights. Master AI-powered Bible study with comprehensive articles.",
    keywords: "Bible Aura blog, Bible AI blog, AI Bible study blog, Bible Aura articles, Bible AI chat blog, Bible study AI blog, Christian AI blog, biblical AI blog, Bible Aura guides, Bible AI tutorials",
    canonicalUrl: "https://bibleaura.xyz/blog",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "Blog",
      "name": "Bible Aura Blog",
      "description": "The #1 comprehensive Bible AI blog featuring expert guides, success stories, tutorials, and insights on AI-powered Bible study and spiritual growth.",
      "url": "https://bibleaura.xyz/blog",
      "publisher": {
        "@type": "Organization",
        "name": "Bible Aura",
        "logo": {
          "@type": "ImageObject",
          "url": "https://bibleaura.xyz/✦Bible%20Aura%20(2).png"
        }
      },
      "mainEntity": [
        {
          "@type": "BlogPosting",
          "headline": "Top 7 Reasons Bible Aura is the Best AI Bible Study Tool Today",
          "url": "https://bibleaura.xyz/blog/top-7-reasons-bible-aura-best-ai-bible-study-tool-today",
          "datePublished": "2025-08-10",
          "author": {"@type": "Organization", "name": "Bible Aura Team"}
        },
        {
          "@type": "BlogPosting",
          "headline": "Bible Aura vs. Other Bible Apps: The Clear Winner in AI-Powered Insights",
          "url": "https://bibleaura.xyz/blog/bible-aura-vs-other-bible-apps-clear-winner-ai-powered-insights",
          "datePublished": "2025-08-10",
          "author": {"@type": "Organization", "name": "Bible Aura Team"}
        },
        {
          "@type": "BlogPosting",
          "headline": "Best Bible AI of 2025: Why Bible Aura Outshines Every Other Tool",
          "url": "https://bibleaura.xyz/blog/best-bible-ai-2025-why-bible-aura-outshines-every-other-tool",
          "datePublished": "2025-08-10",
          "author": {"@type": "Organization", "name": "Bible Aura Team"}
        }
      ]
    }
  });

  const featuredPosts = [
    {
      id: 1,
      title: "Top 7 Reasons Bible Aura is the Best AI Bible Study Tool Today",
      slug: "top-7-reasons-bible-aura-best-ai-bible-study-tool-today",
      excerpt: "Seven concrete advantages you'll feel in your daily study and ministry prep that make Bible Aura the clear choice for AI-powered Bible study.",
      category: "Popular",
      readTime: "5 min read",
      publishDate: "August 10, 2025",
      author: "Bible Aura Team",
      icon: Crown,
      gradient: "from-yellow-500 to-orange-500",
      featured: true
    },
    {
      id: 2,
      title: "Best Bible AI of 2025: Why Bible Aura Outshines Every Other Tool",
      slug: "best-bible-ai-2025-why-bible-aura-outshines-every-other-tool",
      excerpt: "A head-to-head review of Bible AI apps—and why Bible Aura stands on top in 2025 for accuracy, features, and user experience.",
      category: "Comparison",
      readTime: "9 min read",
      publishDate: "August 10, 2025",
      author: "Bible Aura Team",
      icon: Trophy,
      gradient: "from-blue-500 to-purple-500",
      featured: true
    },
    {
      id: 3,
      title: "Bible Aura Success Stories: Real Christians Share Their AI Bible Study Experience",
      slug: "bible-aura-success-stories-real-christians-ai-bible-study-experience",
      excerpt: "Inspiring testimonials from believers who've transformed their Bible study with AI. Real success stories from pastors, students, and Christians worldwide.",
      category: "Testimonials",
      readTime: "20 min read",
      publishDate: "December 1, 2024",
      author: "Bible Aura Team",
      icon: Heart,
      gradient: "from-green-500 to-blue-500",
      featured: true
    }
  ];

  const allBlogPosts = [
    // Getting Started & Guides
    {
      title: "Getting Started with Bible Aura: Complete Guide to AI Bible Chat",
      slug: "getting-started-bible-aura-complete-guide-ai-bible-chat",
      excerpt: "Your comprehensive guide to getting the most out of Bible Aura's AI assistant for enhanced biblical understanding.",
      category: "Tutorial",
      readTime: "10 min read",
      publishDate: "January 15, 2024",
      icon: Rocket
    },
    {
      title: "How AI Transforms Bible Study: Complete Guide",
      slug: "how-ai-transforms-bible-study",
      excerpt: "Discover how Bible AI revolutionizes biblical study with smart analysis, contextual understanding, and personalized learning.",
      category: "Guide",
      readTime: "12 min read",
      publishDate: "December 24, 2024",
      icon: Brain
    },
    {
      title: "How Bible Aura's AI Chat Transforms Your Daily Scripture Study",
      slug: "how-bible-aura-ai-chat-transforms-daily-scripture-study",
      excerpt: "Discover how AI-powered Bible chat revolutionizes personal devotions and scripture understanding.",
      category: "Guide",
      readTime: "12 min read",
      publishDate: "February 1, 2024",
      icon: MessageSquare
    },
    {
      title: "5 Ways Bible Aura's AI Assistant Deepens Your Faith Journey",
      slug: "5-ways-bible-aura-ai-assistant-deepens-faith-journey",
      excerpt: "Explore five powerful ways AI enhances spiritual growth and biblical understanding.",
      category: "Spiritual Growth",
      readTime: "8 min read",
      publishDate: "December 15, 2024",
      icon: Heart
    },
    {
      title: "10 Benefits of Using AI for Bible Study",
      slug: "bible-study-ai-benefits",
      excerpt: "Discover 10 powerful benefits of AI Bible study tools and how biblical AI enhances understanding and spiritual growth.",
      category: "Benefits",
      readTime: "9 min read",
      publishDate: "January 25, 2025",
      icon: CheckCircle
    },

    // AI vs Traditional Study
    {
      title: "Bible AI vs Traditional Study: Which is Better?",
      slug: "bible-ai-vs-traditional-study",
      excerpt: "Compare Bible AI with traditional study methods and discover the best approach for your spiritual growth.",
      category: "Comparison",
      readTime: "10 min read",
      publishDate: "December 24, 2024",
      icon: Target
    },
    {
      title: "Bible Aura vs Traditional Bible Study: Why AI Makes the Difference",
      slug: "bible-aura-vs-traditional-bible-study-ai-difference",
      excerpt: "An in-depth comparison showing how AI complements traditional study methods for enhanced understanding.",
      category: "Comparison",
      readTime: "15 min read",
      publishDate: "January 20, 2024",
      icon: Target
    },
    {
      title: "Bible Aura vs. Other Bible Apps: The Clear Winner in AI-Powered Insights",
      slug: "bible-aura-vs-other-bible-apps-clear-winner-ai-powered-insights",
      excerpt: "A practical comparison of AI features and workflows for real Bible study and ministry preparation.",
      category: "Review",
      readTime: "6 min read",
      publishDate: "August 10, 2025",
      icon: Trophy
    },
    {
      title: "Are AI Bible Insights Accurate? Truth About Biblical AI",
      slug: "ai-bible-insights-accuracy",
      excerpt: "Examine the accuracy of AI Bible insights and learn how to use biblical AI responsibly for study.",
      category: "Analysis",
      readTime: "8 min read",
      publishDate: "January 25, 2025",
      icon: Search
    },

    // Practical Applications
    {
      title: "From Verses to Sermons: How Bible Aura's AI Transforms Your Study Time",
      slug: "from-verses-to-sermons-how-bible-auras-ai-transforms-your-study-time",
      excerpt: "See how single-verse study becomes sermon-ready insight with AI-powered ministry tools.",
      category: "Ministry",
      readTime: "8 min read",
      publishDate: "August 10, 2025",
      icon: FileText
    },
    {
      title: "Smart Bible Search Techniques: Master AI-Powered Scripture Discovery",
      slug: "smart-bible-search-techniques",
      excerpt: "Learn advanced Bible search techniques using AI for faster scripture discovery and deeper insights.",
      category: "Tutorial",
      readTime: "6 min read",
      publishDate: "January 25, 2025",
      icon: Search
    },

    // Future & Technology
    {
      title: "The Future of Christian AI Technology: How Bible AI is Transforming Faith Communities",
      slug: "christian-ai-technology-future",
      excerpt: "Explore the future of Christian AI technology and how Bible AI tools are revolutionizing faith communities.",
      category: "Future Tech",
      readTime: "7 min read",
      publishDate: "January 25, 2025",
      icon: Sparkles
    },

    // Founder & Vision
    {
      title: "How Benaiah Nicholas Nimal Built Bible Aura — The Future of Bible Study with AI",
      slug: "how-benaiah-nicholas-nimal-built-bible-aura-future-of-bible-study-ai",
      excerpt: "The story, vision, and technology behind Bible Aura and how it's shaping the next era of Bible study.",
      category: "Founder Story",
      readTime: "7 min read",
      publishDate: "August 10, 2025",
      icon: Building
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <GlobalNavigation variant="landing" />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-orange-500 text-white py-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Bible Aura Blog
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed">
            The #1 AI Bible Study Blog - Expert Guides, Success Stories & Insights
          </p>
          <div className="flex justify-center gap-4">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
              <Bot className="w-5 h-5 mr-2" />
              Latest Articles
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              <Star className="w-5 h-5 mr-2" />
              Success Stories
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-16">
        {/* Featured Articles */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">🌟 Featured Articles</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {featuredPosts.map((post) => (
              <Card key={post.id} className="shadow-xl border-0 overflow-hidden hover:shadow-2xl transition-all duration-300 group">
                <CardHeader className={`bg-gradient-to-r ${post.gradient} text-white p-6`}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-white/20 p-2 rounded-lg">
                      <post.icon className="w-6 h-6" />
                    </div>
                    <div className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
                      {post.category}
                    </div>
                  </div>
                  <CardTitle className="text-xl leading-tight group-hover:text-yellow-100 transition-colors">
                    {post.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {post.publishDate}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {post.readTime}
                      </span>
                    </div>
                  </div>
                  <Button asChild className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
                    <Link to={`/blog/${post.slug}`}>
                      Read Article
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* All Articles by Category */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">📚 Complete Article Collection</h2>
          
          {/* Getting Started & Guides */}
          <div className="mb-12">
            <h3 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-3">
              <Rocket className="w-6 h-6 text-blue-500" />
              🚀 Getting Started & Guides
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allBlogPosts.filter(post => post.category === 'Tutorial' || post.category === 'Guide' || post.category === 'Spiritual Growth' || post.category === 'Benefits').map((post, index) => (
                <Card key={index} className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <post.icon className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-medium">
                        {post.category}
                      </div>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2 leading-tight">
                      <Link to={`/blog/${post.slug}`} className="hover:text-blue-600 transition-colors">
                        {post.title}
                      </Link>
                    </h4>
                    <p className="text-gray-600 text-sm mb-3 leading-relaxed">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{post.publishDate}</span>
                      <span>{post.readTime}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* AI vs Traditional Study */}
          <div className="mb-12">
            <h3 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-3">
              <Target className="w-6 h-6 text-purple-500" />
              ⚡ AI vs Traditional Study
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allBlogPosts.filter(post => post.category === 'Comparison' || post.category === 'Review' || post.category === 'Analysis').map((post, index) => (
                <Card key={index} className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-purple-500">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="bg-purple-100 p-2 rounded-lg">
                        <post.icon className="w-5 h-5 text-purple-600" />
                      </div>
                      <div className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs font-medium">
                        {post.category}
                      </div>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2 leading-tight">
                      <Link to={`/blog/${post.slug}`} className="hover:text-purple-600 transition-colors">
                        {post.title}
                      </Link>
                    </h4>
                    <p className="text-gray-600 text-sm mb-3 leading-relaxed">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{post.publishDate}</span>
                      <span>{post.readTime}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Practical Applications */}
          <div className="mb-12">
            <h3 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-3">
              <FileText className="w-6 h-6 text-green-500" />
              🛠️ Practical Applications
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              {allBlogPosts.filter(post => post.category === 'Ministry').map((post, index) => (
                <Card key={index} className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-green-500">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="bg-green-100 p-2 rounded-lg">
                        <post.icon className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium">
                        {post.category}
                      </div>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2 leading-tight">
                      <Link to={`/blog/${post.slug}`} className="hover:text-green-600 transition-colors">
                        {post.title}
                      </Link>
                    </h4>
                    <p className="text-gray-600 text-sm mb-3 leading-relaxed">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{post.publishDate}</span>
                      <span>{post.readTime}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Future & Technology + Founder Story */}
          <div className="mb-12">
            <h3 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-orange-500" />
              🔮 Future & Vision
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              {allBlogPosts.filter(post => post.category === 'Future Tech' || post.category === 'Founder Story').map((post, index) => (
                <Card key={index} className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-orange-500">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="bg-orange-100 p-2 rounded-lg">
                        <post.icon className="w-5 h-5 text-orange-600" />
                      </div>
                      <div className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs font-medium">
                        {post.category}
                      </div>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2 leading-tight">
                      <Link to={`/blog/${post.slug}`} className="hover:text-orange-600 transition-colors">
                        {post.title}
                      </Link>
                    </h4>
                    <p className="text-gray-600 text-sm mb-3 leading-relaxed">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{post.publishDate}</span>
                      <span>{post.readTime}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 shadow-2xl">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold mb-4">🚀 Start Your AI Bible Study Journey</h3>
            <p className="text-lg mb-6 opacity-90">
              Ready to experience the future of Bible study? Try Bible Aura's AI Bible Chat for free and discover why thousands of Christians worldwide trust Bible Aura for deeper Scripture insights.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                <Brain className="w-5 h-5 mr-2" />
                Try AI Bible Chat
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                <Users className="w-5 h-5 mr-2" />
                Join Community
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <SEOBacklinks currentPage="blog" />
      <Footer />
    </div>
  );
};

export default Blog; 