import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GlobalNavigation } from "@/components/GlobalNavigation";
import { 
  Calendar, Clock, User, ArrowLeft, ArrowRight, Share2, BookOpen, 
  Brain, MessageSquare, Search, Target, CheckCircle, Lightbulb,
  TrendingUp, Star, Quote, ExternalLink, Crown, Zap, Users, Heart,
  Code, Rocket, Building
} from "lucide-react";
import { Link } from "react-router-dom";
import { useSEO, createBlogPostStructuredData } from "@/hooks/useSEO";
import Footer from "../../components/Footer";
import { SEOBacklinks } from "../../components/SEOBacklinks";

const HowBenaiahBuiltBibleAura = () => {
  useSEO({
    title: "How Benaiah Nicholas Nimal Built Bible Aura — The Future of Bible Study with AI | Founder Story",
    description: "Discover the inspiring story, vision, and technology behind Bible Aura. Learn how Benaiah Nicholas Nimal is shaping the next era of AI-powered Bible study.",
    keywords: "Benaiah Nicholas Nimal, Bible Aura founder, Bible AI creator, Christian technology entrepreneur, Bible study innovation, AI Bible platform founder",
    canonicalUrl: "https://bibleaura.xyz/blog/how-benaiah-nicholas-nimal-built-bible-aura-future-of-bible-study-ai",
    structuredData: createBlogPostStructuredData(
      "How Benaiah Nicholas Nimal Built Bible Aura — The Future of Bible Study with AI",
      "Discover the inspiring story, vision, and technology behind Bible Aura. Learn how Benaiah Nicholas Nimal is shaping the next era of AI-powered Bible study.",
      "2025-08-10",
      "Bible Aura Team",
      "https://bibleaura.xyz/blog/how-benaiah-nicholas-nimal-built-bible-aura-future-of-bible-study-ai"
    )
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <GlobalNavigation variant="landing" />
      
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-orange-500 text-white py-16">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5" />
            <span className="text-blue-100">August 10, 2025</span>
            <Clock className="w-5 h-5 ml-4" />
            <span className="text-blue-100">7 min read</span>
            <User className="w-5 h-5 ml-4" />
            <span className="text-blue-100">Bible Aura Team</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            How Benaiah Nicholas Nimal Built Bible Aura
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 mb-8 leading-relaxed">
            The story, vision, and technology behind the future of Bible study with AI
          </p>
          <div className="flex flex-wrap gap-4">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
              <Building className="w-5 h-5 mr-2" />
              Meet the Founder
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              <Share2 className="w-5 h-5 mr-2" />
              Share Story
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-16">
        <Card className="mb-12 shadow-xl border-0 bg-white/80 backdrop-blur">
          <CardContent className="p-8">
            <div className="flex items-start gap-6 mb-6">
              <img 
                src="/benaiah.jpg" 
                alt="Benaiah Nicholas Nimal" 
                className="w-24 h-24 rounded-full border-4 border-orange-200"
              />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Benaiah Nicholas Nimal</h2>
                <p className="text-lg text-gray-600 mb-4">Founder & CEO, Bible Aura</p>
                <p className="text-gray-700">Christian technologist, AI expert, and passionate believer</p>
              </div>
            </div>
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              <strong>Benaiah Nicholas Nimal</strong> didn't set out to revolutionize Bible study. As a devoted Christian and experienced technologist, he simply wanted to make the profound insights of Scripture accessible to every believer, regardless of their theological background.
            </p>
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 p-6 rounded-lg">
              <Quote className="w-8 h-8 text-blue-600 mb-3" />
              <p className="text-gray-800 font-medium italic">
                "Every believer deserves access to the same deep biblical insights that took me years of study to acquire. AI can democratize that knowledge and transform how we engage with God's Word."
              </p>
              <p className="text-blue-600 font-medium mt-2">— Benaiah Nicholas Nimal</p>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-12 shadow-xl border-0 bg-gradient-to-r from-green-50 to-blue-50">
          <CardHeader>
            <CardTitle className="text-2xl text-gray-900 flex items-center gap-3">
              <Lightbulb className="w-6 h-6 text-green-500" />
              The Vision Behind Bible Aura
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-lg text-gray-700 leading-relaxed">
              Benaiah's vision emerged from his own spiritual journey. Despite his technical background and years of Bible study, he often struggled to quickly access the deep contextual insights that would enhance his understanding of Scripture. If he faced these challenges, how much more difficult must it be for new believers or those without extensive theological training?
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-red-500" />
                  The Problem
                </h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• Complex theological resources overwhelming beginners</li>
                  <li>• Time-intensive research for deep study</li>
                  <li>• Language barriers limiting access</li>
                  <li>• Pastors spending 8+ hours on sermon prep</li>
                </ul>
              </div>
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Brain className="w-5 h-5 text-blue-500" />
                  The AI Solution
                </h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• Instant, conversational biblical insights</li>
                  <li>• Contextual understanding in seconds</li>
                  <li>• Multi-language accessibility</li>
                  <li>• AI-powered sermon generation</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-12 shadow-xl border-0 bg-gradient-to-r from-orange-50 to-red-50">
          <CardHeader>
            <CardTitle className="text-2xl text-gray-900 flex items-center gap-3">
              <ExternalLink className="w-6 h-6 text-orange-500" />
              Experience Benaiah's Vision Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg text-gray-700 mb-6">
              Join thousands who've discovered the future of Bible study through Benaiah's revolutionary platform:
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              <Button asChild className="bg-blue-500 hover:bg-blue-600">
                <Link to="/bible-ai">
                  <Brain className="w-4 h-4 mr-2" />
                  Try Bible AI
                </Link>
              </Button>
              <Button asChild variant="outline" className="border-purple-500 text-purple-600 hover:bg-purple-50">
                <Link to="/about">
                  <Heart className="w-4 h-4 mr-2" />
                  Our Mission
                </Link>
              </Button>
              <Button asChild variant="outline" className="border-green-500 text-green-600 hover:bg-green-50">
                <Link to="/features">
                  <Star className="w-4 h-4 mr-2" />
                  See Features
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-between items-center py-8 border-t border-gray-200">
          <Button asChild variant="outline" className="flex items-center gap-2">
            <Link to="/blog/from-verses-to-sermons-how-bible-auras-ai-transforms-your-study-time">
              <ArrowLeft className="w-4 h-4" />
              Previous Article
            </Link>
          </Button>
          <Button asChild className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-orange-500 text-white">
            <Link to="/blog/bible-aura-success-stories-real-christians-ai-bible-study-experience">
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

export default HowBenaiahBuiltBibleAura; 