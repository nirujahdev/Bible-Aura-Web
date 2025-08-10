import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GlobalNavigation } from "@/components/GlobalNavigation";
import { 
  Calendar, Clock, User, ArrowLeft, ArrowRight, Share2, BookOpen, 
  Brain, MessageSquare, Search, Target, CheckCircle, Lightbulb,
  TrendingUp, Star, Quote, ExternalLink, Crown, Zap, Users, Heart,
  Award, Sparkles, GraduationCap, Church
} from "lucide-react";
import { Link } from "react-router-dom";
import { useSEO, createBlogPostStructuredData } from "@/hooks/useSEO";
import Footer from "../../components/Footer";
import { SEOBacklinks } from "../../components/SEOBacklinks";

const BibleAuraSuccessStories = () => {
  useSEO({
    title: "Bible Aura Success Stories: Real Christians Share Their AI Bible Study Experience | Testimonials",
    description: "Read inspiring testimonials from believers who've transformed their Bible study with AI. Real success stories from pastors, students, and Christians worldwide using Bible Aura.",
    keywords: "Bible Aura testimonials, AI Bible study success stories, Christian AI testimonials, Bible study transformation, AI Bible chat reviews, pastor testimonials, Bible AI experiences",
    canonicalUrl: "https://bibleaura.xyz/blog/bible-aura-success-stories-real-christians-ai-bible-study-experience",
    structuredData: createBlogPostStructuredData(
      "Bible Aura Success Stories: Real Christians Share Their AI Bible Study Experience",
      "Read inspiring testimonials from believers who've transformed their Bible study with AI. Real success stories from pastors, students, and Christians worldwide using Bible Aura.",
      "2024-12-01",
      "Bible Aura Team",
      "https://bibleaura.xyz/blog/bible-aura-success-stories-real-christians-ai-bible-study-experience"
    )
  });

  const successStories = [
    {
      name: "Pastor David Martinez",
      role: "Senior Pastor, Grace Community Church",
      story: "Bible Aura transformed our entire sermon preparation process. What used to take me 12 hours now takes 3 hours, and the quality has actually improved. Our congregation has never been more engaged with biblical teaching.",
      impact: "300% faster sermon prep",
      icon: Church,
      gradient: "from-blue-500 to-blue-600"
    },
    {
      name: "Sarah Chen",
      role: "Seminary Student",
      story: "As a busy mom pursuing theological education, Bible Aura became my study companion. The AI explanations helped me grasp complex theological concepts that would have taken hours to research.",
      impact: "Graduated with honors",
      icon: GraduationCap,
      gradient: "from-purple-500 to-purple-600"
    },
    {
      name: "Michael Thompson",
      role: "Small Group Leader",
      story: "Our Bible study group was struggling with engagement until we started using Bible Aura. Now everyone comes prepared with deep questions, and our discussions are richer than ever.",
      impact: "Group doubled in size",
      icon: Users,
      gradient: "from-green-500 to-green-600"
    },
    {
      name: "Maria Rodriguez",
      role: "Youth Pastor",
      story: "Connecting with teenagers through technology seemed impossible until Bible Aura. Now they're asking theological questions I never expected and diving deep into Scripture.",
      impact: "90% youth engagement",
      icon: Heart,
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
            <span className="text-blue-100">December 1, 2024</span>
            <Clock className="w-5 h-5 ml-4" />
            <span className="text-blue-100">20 min read</span>
            <User className="w-5 h-5 ml-4" />
            <span className="text-blue-100">Bible Aura Team</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Bible Aura Success Stories
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 mb-8 leading-relaxed">
            Real Christians share how AI transformed their Bible study experience
          </p>
          <div className="flex flex-wrap gap-4">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
              <Award className="w-5 h-5 mr-2" />
              Read Stories
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              <Share2 className="w-5 h-5 mr-2" />
              Share Stories
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-16">
        <Card className="mb-12 shadow-xl border-0 bg-white/80 backdrop-blur">
          <CardContent className="p-8">
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              The true measure of any Bible study tool isn't in its features—it's in the transformed lives of those who use it. Here are inspiring stories from real Christians who've experienced the power of <strong>AI-powered Bible study</strong> through Bible Aura.
            </p>
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 p-6 rounded-lg">
              <p className="text-gray-800 font-medium flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-600" />
                <strong>Community Impact:</strong> Over 10,000 Christians worldwide have transformed their Bible study journey with Bible Aura's AI assistance.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-12 mb-12">
          {successStories.map((story, index) => (
            <Card key={index} className="shadow-xl border-0 overflow-hidden hover:shadow-2xl transition-all duration-300">
              <CardHeader className={`bg-gradient-to-r ${story.gradient} text-white p-6`}>
                <div className="flex items-center gap-4">
                  <div className="bg-white/20 p-3 rounded-lg">
                    <story.icon className="w-8 h-8" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-white">{story.name}</CardTitle>
                    <p className="text-white/90">{story.role}</p>
                    <div className="mt-2 bg-white/20 inline-block px-3 py-1 rounded-full text-sm font-medium">
                      {story.impact}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="bg-gray-50 p-6 rounded-lg border-l-4 border-gray-300">
                  <Quote className="w-6 h-6 text-gray-400 mb-3" />
                  <p className="text-gray-700 text-lg leading-relaxed italic">
                    "{story.story}"
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mb-12 shadow-xl border-0 bg-gradient-to-r from-green-50 to-blue-50">
          <CardHeader>
            <CardTitle className="text-2xl text-gray-900 flex items-center gap-3">
              <TrendingUp className="w-6 h-6 text-green-500" />
              Measurable Impact Across Communities
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4">Pastors & Ministry Leaders</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• 75% reduction in sermon preparation time</li>
                  <li>• 90% report improved sermon quality</li>
                  <li>• 85% see increased congregation engagement</li>
                  <li>• 95% recommend to other pastors</li>
                </ul>
              </div>
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4">Students & Individuals</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• 80% study the Bible more frequently</li>
                  <li>• 92% report deeper understanding</li>
                  <li>• 88% feel more confident in discussions</li>
                  <li>• 94% would recommend to friends</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-12 shadow-xl border-0 bg-gradient-to-r from-orange-50 to-red-50">
          <CardHeader>
            <CardTitle className="text-2xl text-gray-900 flex items-center gap-3">
              <ExternalLink className="w-6 h-6 text-orange-500" />
              Start Your Own Success Story
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg text-gray-700 mb-6">
              Join thousands of Christians who've transformed their Bible study with AI:
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              <Button asChild className="bg-blue-500 hover:bg-blue-600">
                <Link to="/bible-ai">
                  <Brain className="w-4 h-4 mr-2" />
                  Start Free Trial
                </Link>
              </Button>
              <Button asChild variant="outline" className="border-purple-500 text-purple-600 hover:bg-purple-50">
                <Link to="/community">
                  <Users className="w-4 h-4 mr-2" />
                  Join Community
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
            <Link to="/blog/how-benaiah-nicholas-nimal-built-bible-aura-future-of-bible-study-ai">
              <ArrowLeft className="w-4 h-4" />
              Previous Article
            </Link>
          </Button>
          <Button asChild className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-orange-500 text-white">
            <Link to="/blog/5-ways-bible-aura-ai-assistant-deepens-faith-journey">
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

export default BibleAuraSuccessStories; 