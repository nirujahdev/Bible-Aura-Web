import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GlobalNavigation } from "@/components/GlobalNavigation";
import { 
  Calendar, Clock, User, ArrowLeft, ArrowRight, Share2, BookOpen, 
  Brain, MessageSquare, Search, Target, CheckCircle, Lightbulb,
  TrendingUp, Star, Quote, ExternalLink, Crown, Zap, Users
} from "lucide-react";
import { Link } from "react-router-dom";
import { useSEO, createBlogPostStructuredData } from "@/hooks/useSEO";
import Footer from "../../components/Footer";
import { SEOBacklinks } from "../../components/SEOBacklinks";

const SmartBibleSearchTechniques = () => {
  useSEO({
    title: "Smart Bible Search Techniques: Master AI-Powered Scripture Discovery | Bible Aura Guide",
    description: "Learn advanced Bible search techniques using AI for faster scripture discovery and deeper insights. Master Bible Aura's powerful search features for enhanced study.",
    keywords: "Bible search techniques, AI Bible search, scripture discovery, Bible study methods, Bible Aura search, biblical research, smart Bible study",
    canonicalUrl: "https://bibleaura.xyz/blog/smart-bible-search-techniques",
    structuredData: createBlogPostStructuredData(
      "Smart Bible Search Techniques: Master AI-Powered Scripture Discovery",
      "Learn advanced Bible search techniques using AI for faster scripture discovery and deeper insights. Master Bible Aura's powerful search features for enhanced study.",
      "2025-01-25",
      "Bible Aura Team",
      "https://bibleaura.xyz/blog/smart-bible-search-techniques"
    )
  });

  const techniques = [
    {
      icon: Brain,
      title: "Contextual Query Search",
      description: "Ask questions about themes, not just keywords",
      example: "Instead of 'love', try 'How does Paul define love in his letters?'",
      gradient: "from-blue-500 to-blue-600"
    },
    {
      icon: Target,
      title: "Cross-Reference Discovery",
      description: "Find related passages automatically",
      example: "Ask 'What other verses relate to Romans 8:28?'",
      gradient: "from-purple-500 to-purple-600"
    },
    {
      icon: Search,
      title: "Historical Context Search",
      description: "Understand the background behind verses",
      example: "Query 'What was happening in Corinth when Paul wrote 1 Corinthians?'",
      gradient: "from-green-500 to-green-600"
    },
    {
      icon: BookOpen,
      title: "Translation Comparison",
      description: "Compare how different versions translate key passages",
      example: "Ask 'How do different translations render John 1:1?'",
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
            <span className="text-blue-100">January 25, 2025</span>
            <Clock className="w-5 h-5 ml-4" />
            <span className="text-blue-100">6 min read</span>
            <User className="w-5 h-5 ml-4" />
            <span className="text-blue-100">Bible Aura Team</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Smart Bible Search Techniques
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 mb-8 leading-relaxed">
            Master AI-powered scripture discovery for faster insights and deeper study
          </p>
          <div className="flex flex-wrap gap-4">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
              <Search className="w-5 h-5 mr-2" />
              Try Smart Search
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
              Traditional Bible study often means flipping through concordances and cross-references. With <strong>Bible Aura's AI-powered search</strong>, you can discover scriptures faster and uncover deeper insights through intelligent questioning techniques.
            </p>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg">
              <p className="text-blue-800 font-medium">
                💡 <strong>Pro Tip:</strong> The secret to smart Bible search is asking better questions, not just searching for words.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-8 mb-12">
          {techniques.map((technique, index) => (
            <Card key={index} className="shadow-xl border-0 overflow-hidden hover:shadow-2xl transition-all duration-300">
              <CardHeader className={`bg-gradient-to-r ${technique.gradient} text-white p-6`}>
                <div className="flex items-center gap-4">
                  <div className="bg-white/20 p-3 rounded-lg">
                    <technique.icon className="w-8 h-8" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-white">{technique.title}</CardTitle>
                    <p className="text-white/90">{technique.description}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="text-sm font-medium text-gray-700 mb-2">Example:</p>
                  <p className="text-gray-800 italic">"{technique.example}"</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mb-12 shadow-xl border-0 bg-gradient-to-r from-green-50 to-blue-50">
          <CardHeader>
            <CardTitle className="text-2xl text-gray-900 flex items-center gap-3">
              <Lightbulb className="w-6 h-6 text-green-500" />
              Advanced Search Strategies
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3">Theme-Based Queries</h3>
                <p className="text-gray-700 mb-3">Instead of searching for single words, ask about concepts:</p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• "What does the Bible say about forgiveness?"</li>
                  <li>• "How is faith described in Hebrews?"</li>
                  <li>• "What are Jesus' teachings on prayer?"</li>
                </ul>
              </div>
              
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3">Character Studies</h3>
                <p className="text-gray-700 mb-3">Explore biblical figures deeply:</p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• "What can we learn from David's psalms?"</li>
                  <li>• "How did Paul's background influence his ministry?"</li>
                  <li>• "What are the key moments in Peter's journey?"</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-12 shadow-xl border-0 bg-gradient-to-r from-orange-50 to-red-50">
          <CardHeader>
            <CardTitle className="text-2xl text-gray-900 flex items-center gap-3">
              <ExternalLink className="w-6 h-6 text-orange-500" />
              Start Searching Smarter Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg text-gray-700 mb-6">
              Put these techniques into practice with Bible Aura's intelligent search:
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <Button asChild className="bg-blue-500 hover:bg-blue-600">
                <Link to="/bible-ai">
                  <Brain className="w-4 h-4 mr-2" />
                  Start AI Search
                </Link>
              </Button>
              <Button asChild variant="outline" className="border-purple-500 text-purple-600 hover:bg-purple-50">
                <Link to="/bible">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Bible Reader
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-between items-center py-8 border-t border-gray-200">
          <Button asChild variant="outline" className="flex items-center gap-2">
            <Link to="/blog">
              <ArrowLeft className="w-4 h-4" />
              Back to Blog
            </Link>
          </Button>
          <Button asChild className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-orange-500 text-white">
            <Link to="/blog/christian-ai-technology-future">
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

export default SmartBibleSearchTechniques; 