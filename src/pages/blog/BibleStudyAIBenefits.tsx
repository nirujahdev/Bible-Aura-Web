import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GlobalNavigation } from "@/components/GlobalNavigation";
import { 
  Calendar, Clock, User, ArrowLeft, Share2, 
  CheckCircle, Brain, MessageSquare, Search, Target, Zap,
  TrendingUp, Star, Quote, ExternalLink, BookOpen, Users,
  Heart, Lightbulb, Globe, Smartphone, ArrowRight
} from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect } from "react";

const BibleStudyAIBenefits = () => {
  // SEO optimization for page title
  useEffect(() => {
    document.title = "10 Benefits of Using AI for Bible Study | Bible Aura";
    
    // Add meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Discover the top 10 benefits of using AI for Bible study. Learn how artificial intelligence enhances biblical learning, provides instant insights, and transforms your spiritual journey.');
    }

    // Update OG image
    const ogImage = document.querySelector('meta[property="og:image"]');
    if (ogImage) {
      ogImage.setAttribute('content', 'https://bible-aura.com/✦Bible%20Aura%20(1).png');
    }

    // Update Twitter image
    const twitterImage = document.querySelector('meta[name="twitter:image"]');
    if (twitterImage) {
      twitterImage.setAttribute('content', 'https://bible-aura.com/✦Bible%20Aura%20(1).png');
    }
  }, []);

  const benefits = [
    {
      number: "01",
      title: "Instant Access to Biblical Insights",
      description: "Get immediate explanations, context, and interpretations for any Bible verse or passage without waiting or searching through multiple resources.",
      icon: Zap,
      gradient: "from-blue-500 to-blue-600"
    },
    {
      number: "02", 
      title: "Personalized Learning Experience",
      description: "AI adapts to your spiritual maturity level, learning style, and study preferences to provide customized biblical insights and recommendations.",
      icon: Target,
      gradient: "from-purple-500 to-purple-600"
    },
    {
      number: "03",
      title: "Cross-Reference Discovery",
      description: "AI automatically identifies and suggests related verses, themes, and biblical connections that you might miss in traditional study methods.",
      icon: Search,
      gradient: "from-green-500 to-green-600"
    },
    {
      number: "04",
      title: "Multiple Translation Comparison",
      description: "Easily compare different Bible translations and understand nuances in original languages without extensive theological training.",
      icon: Globe,
      gradient: "from-orange-500 to-orange-600"
    },
    {
      number: "05",
      title: "Beginner-Friendly Accessibility",
      description: "AI makes complex theological concepts accessible to new believers and those without formal biblical education.",
      icon: Users,
      gradient: "from-teal-500 to-teal-600"
    }
  ];

  return (
    <div className="min-h-screen bg-background w-full">
      {/* Global Navigation */}
      <GlobalNavigation variant="landing" />

      {/* Article Header */}
      <article className="pt-24 md:pt-28 lg:pt-32">
        <header className="py-12 md:py-16 bg-gradient-to-br from-green-50 via-white to-blue-50">
          <div className="w-full px-4 md:px-6 lg:px-10 max-w-4xl mx-auto">
            {/* Breadcrumb */}
            <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-8">
              <Link to="/" className="hover:text-green-600">Home</Link>
              <span>/</span>
              <Link to="/blog" className="hover:text-green-600">Blog</Link>
              <span>/</span>
              <span className="text-gray-900">10 Benefits of AI Bible Study</span>
            </nav>

            {/* Article Meta */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-6">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                December 18, 2024
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                8 min read
              </div>
              <div className="flex items-center">
                <User className="h-4 w-4 mr-2" />
                Bible Aura Team
              </div>
            </div>

            {/* Article Title */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-6">
              10 Benefits of Using AI for Bible Study
            </h1>

            {/* Article Subtitle */}
            <p className="text-lg md:text-xl text-gray-600 leading-relaxed mb-8">
              Discover how artificial intelligence is transforming biblical learning with these powerful advantages that enhance your spiritual journey and deepen your understanding of Scripture.
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-8">
              {["Bible AI Benefits", "AI Bible Study", "Spiritual Growth", "Bible Technology", "Digital Bible"].map((tag, index) => (
                <span key={index} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                  {tag}
                </span>
              ))}
            </div>

            {/* Share Button */}
            <div className="flex items-center justify-between">
              <Button asChild variant="outline" className="hover:bg-gray-50">
                <Link to="/blog">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Blog
                </Link>
              </Button>
              <Button variant="outline" className="hover:bg-gray-50">
                <Share2 className="mr-2 h-4 w-4" />
                Share Article
              </Button>
            </div>
          </div>
        </header>

        {/* Article Content */}
        <main className="py-16 bg-white">
          <div className="w-full px-4 md:px-6 lg:px-10 max-w-4xl mx-auto">
            {/* Introduction */}
            <section className="mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Introduction</h2>
              <p className="text-gray-700 leading-relaxed mb-6">
                As artificial intelligence continues to revolutionize various aspects of education and learning, 
                <strong> AI Bible study</strong> has emerged as a powerful tool that's transforming how believers engage with Scripture. 
                The integration of AI technology into biblical learning offers unprecedented opportunities for spiritual growth, 
                deeper understanding, and more accessible biblical education.
              </p>
              <div className="bg-green-50 border-l-4 border-green-500 p-6 my-8">
                <div className="flex items-start">
                  <Lightbulb className="h-6 w-6 text-green-600 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-green-900 mb-2">Key Insight</h4>
                    <p className="text-green-800">
                      These benefits aren't just theoretical – they're based on real user experiences and demonstrate how AI can serve as a valuable complement to traditional Bible study methods.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Top Benefits */}
            <section className="mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">Top 10 Benefits of Bible AI</h2>
              <p className="text-gray-700 leading-relaxed mb-12">
                Here are the most significant advantages that <strong>AI-powered Bible study</strong> brings to modern believers, 
                each offering unique value for different aspects of your spiritual growth and biblical understanding.
              </p>

              <div className="space-y-8">
                {benefits.map((benefit, index) => (
                  <Card key={index} className="border-0 shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                    <div className={`h-1 bg-gradient-to-r ${benefit.gradient}`}></div>
                    <CardContent className="p-8">
                      <div className="flex items-start space-x-6">
                        {/* Number and Icon */}
                        <div className="flex-shrink-0 space-y-4">
                          <div className={`w-16 h-16 bg-gradient-to-r ${benefit.gradient} rounded-2xl flex items-center justify-center shadow-lg`}>
                            <span className="text-white text-xl font-bold">{benefit.number}</span>
                          </div>
                          <div className={`w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center`}>
                            <benefit.icon className="h-6 w-6 text-gray-600" />
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                          <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">{benefit.title}</h3>
                          <p className="text-gray-700 leading-relaxed">{benefit.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* CTA Section */}
            <section className="mb-12">
              <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-xl p-8 text-white text-center">
                <h3 className="text-2xl font-bold mb-4">Experience These Benefits Today</h3>
                <p className="text-green-100 mb-6">
                  Ready to transform your Bible study experience? Discover how AI-powered insights can enhance your spiritual journey.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild size="lg" variant="secondary" className="bg-white text-green-600 hover:bg-gray-100">
                    <Link to="/bible-ai">
                      <Brain className="mr-2 h-5 w-5" />
                      Try Bible AI Free
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-green-600">
                    <Link to="/auth">
                      <ArrowRight className="mr-2 h-5 w-5" />
                      Start Your Journey
                    </Link>
                  </Button>
                </div>
              </div>
            </section>
          </div>
        </main>

        {/* Related Articles */}
        <section className="py-16 bg-gray-50">
          <div className="w-full px-4 md:px-6 lg:px-10 max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 text-center">Related Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: "How AI Transforms Bible Study: Complete Guide",
                  slug: "how-ai-transforms-bible-study",
                  readTime: "12 min read"
                },
                {
                  title: "Bible AI vs Traditional Study: Which is Better?",
                  slug: "bible-ai-vs-traditional-study",
                  readTime: "10 min read"
                },
                {
                  title: "Are AI Bible Insights Accurate?",
                  slug: "ai-bible-insights-accuracy",
                  readTime: "15 min read"
                }
              ].map((post, index) => (
                <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-white hover:scale-105">
                  <CardHeader className="p-6">
                    <CardTitle className="text-lg font-bold text-gray-900 mb-3 leading-tight group-hover:text-green-600 transition-colors">
                      {post.title}
                    </CardTitle>
                    <div className="flex items-center text-sm text-gray-500 mb-4">
                      <Clock className="h-4 w-4 mr-1" />
                      {post.readTime}
                    </div>
                    <Button asChild size="sm" variant="outline" className="w-full hover:bg-green-50 hover:border-green-200">
                      <Link to={`/blog/${post.slug}`}>
                        Read Article
                        <ExternalLink className="ml-2 h-3 w-3" />
                      </Link>
                    </Button>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </article>

      {/* Footer */}
      <footer className="bg-black text-white py-16">
        <div className="w-full px-4 sm:px-6 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
            <div className="text-center md:text-left">
              <h3 className="text-2xl font-bold text-orange-400 mb-3">✦Bible Aura</h3>
              <p className="text-gray-400 text-base">AI-Powered Biblical Insight</p>
            </div>
            <div className="text-center md:text-left">
              <h4 className="text-xl font-semibold text-white mb-6">Bible AI Features</h4>
              <nav className="space-y-3">
                <Link to="/bible-ai" className="block text-gray-400 hover:text-orange-400 transition-colors duration-300">Bible AI Platform</Link>
                <Link to="/ai-bible-study" className="block text-gray-400 hover:text-orange-400 transition-colors duration-300">AI Bible Study</Link>
                <Link to="/bible-chat" className="block text-gray-400 hover:text-orange-400 transition-colors duration-300">Bible Chat</Link>
                <Link to="/digital-bible" className="block text-gray-400 hover:text-orange-400 transition-colors duration-300">Digital Bible</Link>
              </nav>
            </div>
            <div className="text-center md:text-left">
              <h4 className="text-xl font-semibold text-white mb-6">More Articles</h4>
              <nav className="space-y-3">
                <Link to="/blog" className="block text-gray-400 hover:text-orange-400 transition-colors duration-300">All Blog Posts</Link>
                <Link to="/blog/how-ai-transforms-bible-study" className="block text-gray-400 hover:text-orange-400 transition-colors duration-300">AI Bible Study Guide</Link>
                <Link to="/blog/bible-ai-vs-traditional-study" className="block text-gray-400 hover:text-orange-400 transition-colors duration-300">AI vs Traditional Study</Link>
                <Link to="/blog/ai-bible-insights-accuracy" className="block text-gray-400 hover:text-orange-400 transition-colors duration-300">AI Insights Accuracy</Link>
              </nav>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400 text-sm">
            <span>&copy; 2024 ✦Bible Aura. All rights reserved. </span>
            <a href="https://www.instagram.com/benaiah_4?igsh=cGZuYmI2YWw0d25r" target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:text-orange-300 transition-colors duration-300 underline">
              Benaiah Nicholas Nimal
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default BibleStudyAIBenefits; 