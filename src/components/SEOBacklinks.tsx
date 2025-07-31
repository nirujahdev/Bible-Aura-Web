import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, Bot, MessageSquare, Library, FileText, Users, Music, Search, Brain, Zap, Star, Shield, Globe } from "lucide-react";

interface RelatedLink {
  title: string;
  href: string;
  description: string;
  icon: any;
  category: string;
  keywords: string[];
}

interface SEOBacklinksProps {
  currentPage: string;
  category?: string;
}

const allLinks: RelatedLink[] = [
  {
    title: "Bible AI - Intelligent Biblical Assistant",
    href: "/bible-ai",
    description: "Experience the power of Bible AI technology with instant Biblical Q&A, verse analysis, and AI-powered spiritual insights",
    icon: Bot,
    category: "ai",
    keywords: ["bible ai", "ai bible study", "bible assistant", "biblical ai", "bible chat ai"]
  },
  {
    title: "Bible Aura - Digital Bible Study Platform",
    href: "/bible",
    description: "Access Bible Aura's comprehensive digital Bible with multiple translations, cross-references, and advanced study tools",
    icon: BookOpen,
    category: "study",
    keywords: ["bible aura", "digital bible", "online bible", "bible study", "bible reading"]
  },
  {
    title: "AI Bible Chat - Ask Questions to Bible AI",
    href: "/bible-ai",
    description: "Chat with our advanced Bible AI system for instant answers to Biblical questions and personalized spiritual guidance",
    icon: MessageSquare,
    category: "ai",
    keywords: ["bible ai chat", "ask bible questions", "ai biblical answers", "bible chatbot", "spiritual ai"]
  },
  {
    title: "Bible Study Hub - Comprehensive Biblical Resources",
    href: "/study-hub",
    description: "Explore Bible Aura's study hub with topical studies, character profiles, parables, and AI-enhanced learning materials",
    icon: Library,
    category: "study",
    keywords: ["bible study", "biblical studies", "bible learning", "scripture study", "bible education"]
  },
  {
    title: "Bible Journal with AI Insights",
    href: "/journal",
    description: "Keep a digital Bible journal enhanced with AI insights, verse recommendations, and personalized spiritual reflections",
    icon: FileText,
    category: "study",
    keywords: ["bible journal", "spiritual journal", "bible notes", "scripture journal", "ai bible insights"]
  },
  {
    title: "Biblical Character Profiles - AI Analysis",
    href: "/bible-characters",
    description: "Discover detailed Biblical character profiles with AI-powered analysis, historical context, and spiritual lessons",
    icon: Users,
    category: "study",
    keywords: ["bible characters", "biblical figures", "bible personalities", "scripture characters", "biblical heroes"]
  },
  {
    title: "Bible Songs & Hymns Collection",
    href: "/songs",
    description: "Access a vast collection of Christian hymns, worship songs, and Biblical music for spiritual enrichment",
    icon: Music,
    category: "worship",
    keywords: ["bible songs", "christian hymns", "worship music", "biblical music", "spiritual songs"]
  },
  {
    title: "AI Sermon Generator & Library",
    href: "/sermons",
    description: "Browse our extensive sermon library or use AI-powered sermon writing tools for Biblical teaching and preaching",
    icon: Bot,
    category: "ai",
    keywords: ["ai sermon", "sermon generator", "bible sermons", "preaching tools", "biblical messages"]
  },
  {
    title: "Bible Search with AI Intelligence",
    href: "/bible",
    description: "Use advanced AI-powered search to find Bible verses, themes, and concepts with intelligent cross-referencing",
    icon: Search,
    category: "search",
    keywords: ["bible search", "verse finder", "scripture search", "bible verse lookup", "biblical concepts"]
  },
  {
    title: "Parable Studies with AI Explanations",
    href: "/parables",
    description: "Study Jesus' parables with AI-enhanced explanations, modern applications, and deep spiritual insights",
    icon: Brain,
    category: "study",
    keywords: ["bible parables", "jesus parables", "parable meaning", "biblical stories", "scripture interpretation"]
  },
  {
    title: "Topical Bible Study - AI Organized",
    href: "/topical-study",
    description: "Explore Bible topics organized by AI with comprehensive verse collections and thematic insights",
    icon: Zap,
    category: "study",
    keywords: ["topical bible study", "bible topics", "scripture themes", "biblical subjects", "verse collections"]
  },
  {
    title: "Bible AI Blog - Latest Insights",
    href: "/blog",
    description: "Read the latest articles about Bible AI technology, Biblical studies, and spiritual insights powered by artificial intelligence",
    icon: FileText,
    category: "blog",
    keywords: ["bible ai blog", "biblical insights", "ai bible articles", "spiritual technology", "bible study tips"]
  }
];

const seoKeywords = {
  general: ["bible ai", "bible aura", "digital bible", "ai bible study", "biblical ai assistant", "online bible study", "bible chat ai", "spiritual ai"],
  ai: ["bible ai", "ai bible assistant", "biblical artificial intelligence", "bible chatbot", "ai scripture analysis", "intelligent bible study"],
  study: ["bible study", "digital bible", "bible aura platform", "online bible reading", "scripture study tools", "biblical education"],
  blog: ["bible ai blog", "biblical insights", "ai bible articles", "spiritual technology blog", "bible study guides"]
};

function getFilteredLinks(currentPage: string, category?: string): RelatedLink[] {
  return allLinks
    .filter(link => link.href !== currentPage)
    .filter(link => category ? link.category === category || link.category === 'ai' : true)
    .slice(0, 6);
}

export function SEOBacklinks({ currentPage, category = "general" }: SEOBacklinksProps) {
  const filteredLinks = getFilteredLinks(currentPage, category);
  const keywords = seoKeywords[category as keyof typeof seoKeywords] || seoKeywords.general;

  return (
    <div className="bg-gradient-to-br from-slate-50 via-orange-50 to-amber-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* SEO Keywords Section */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Explore Bible Aura - The Ultimate Bible AI Platform
          </h2>
          <p className="text-xl text-gray-600 mb-6">
            Discover the power of Bible AI technology with our comprehensive digital Bible study platform featuring intelligent search, AI chat, and advanced Biblical analysis tools.
          </p>
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {keywords.map((keyword, index) => (
              <span 
                key={index}
                className="px-3 py-1 bg-white rounded-full text-sm text-gray-700 border border-orange-200 hover:bg-orange-50 transition-colors"
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>

        {/* Related Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredLinks.map((link, index) => (
            <Link
              key={index}
              to={link.href}
              className="group block"
            >
              <Card className="h-full bg-white hover:shadow-xl transition-all duration-300 hover:scale-105 border-l-4 border-l-orange-400">
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors">
                      <link.icon className="h-5 w-5 text-orange-600" />
                    </div>
                    <CardTitle className="text-lg font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">
                      {link.title}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{link.description}</p>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {link.keywords.slice(0, 3).map((keyword, idx) => (
                      <span 
                        key={idx}
                        className="px-2 py-1 bg-gray-100 text-xs text-gray-600 rounded"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center text-orange-600 group-hover:text-orange-700 transition-colors">
                    <span className="text-sm font-medium">Explore Feature</span>
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Bible AI Features Highlight */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Why Choose Bible Aura for Your Biblical Studies?
            </h3>
            <p className="text-gray-600">
              Bible Aura combines traditional Biblical scholarship with cutting-edge AI technology to provide the most comprehensive digital Bible study experience available today.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Brain className="h-8 w-8 text-blue-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Advanced Bible AI</h4>
              <p className="text-gray-600">Our Bible AI understands context, provides cross-references, and offers intelligent Biblical insights</p>
            </div>
            
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Shield className="h-8 w-8 text-green-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Theologically Sound</h4>
              <p className="text-gray-600">All AI responses are grounded in sound Biblical theology and cross-referenced with scholarly sources</p>
            </div>
            
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <Globe className="h-8 w-8 text-purple-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Accessible Everywhere</h4>
              <p className="text-gray-600">Access Bible Aura from any device with our responsive web platform and progressive web app</p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Ready to Transform Your Bible Study Experience?
          </h3>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/bible-ai">
              <Button className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-8 py-3 rounded-full hover:from-orange-600 hover:to-amber-600 transition-all duration-200">
                Start Bible AI Chat
              </Button>
            </Link>
            <Link to="/auth">
              <Button variant="outline" className="border-orange-400 text-orange-600 px-8 py-3 rounded-full hover:bg-orange-50 transition-all duration-200">
                Create Free Account
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// Enhanced breadcrumb component for better SEO
interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface SEOBreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function SEOBreadcrumbs({ items }: SEOBreadcrumbsProps) {
  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-600 py-4 px-4 bg-gray-50 border-b">
      <Link to="/" className="hover:text-orange-600 transition-colors flex items-center">
        <span>Bible Aura</span>
      </Link>
      {items.map((item, index) => (
        <div key={index} className="flex items-center space-x-2">
          <span className="text-gray-400">/</span>
          {item.href ? (
            <Link 
              to={item.href} 
              className="hover:text-orange-600 transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-gray-900 font-medium">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
}

// Enhanced quick action links with SEO focus
export function QuickActionSEOLinks() {
  const quickActions = [
    {
      title: "Bible AI Chat",
      href: "/bible-ai",
      description: "Ask Bible AI questions and get instant Biblical insights with our intelligent assistant",
      icon: MessageSquare,
      color: "blue",
      keywords: ["bible ai", "ai chat", "bible questions"]
    },
    {
      title: "Digital Bible Reader",
      href: "/bible",
      description: "Read the Bible online with multiple translations and AI-powered study tools",
      icon: BookOpen,
      color: "green",
      keywords: ["digital bible", "bible reading", "online bible"]
    },
    {
      title: "Bible Study Hub",
      href: "/study-hub",
      description: "Access comprehensive Bible study resources, topical studies, and AI insights",
      icon: Library,
      color: "purple",
      keywords: ["bible study", "biblical resources", "scripture study"]
    },
    {
      title: "Bible Journal",
      href: "/journal",
      description: "Keep a personal Bible journal with AI-enhanced insights and reflections",
      icon: FileText,
      color: "orange",
      keywords: ["bible journal", "spiritual journal", "bible notes"]
    }
  ];

  return (
    <div className="py-8">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          Start Your Bible AI Journey Today
        </h3>
        <p className="text-gray-600">
          Choose from our powerful Bible study tools enhanced with artificial intelligence
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map((action, index) => (
          <Link
            key={index}
            to={action.href}
            className="group"
          >
            <Card className="h-full transition-all duration-300 hover:shadow-lg hover:scale-105 bg-white border-l-4 border-l-orange-400">
              <CardContent className="p-6 text-center">
                <div className={`mx-auto w-12 h-12 rounded-full bg-${action.color}-100 flex items-center justify-center mb-4 group-hover:bg-${action.color}-200 transition-colors`}>
                  <action.icon className={`h-6 w-6 text-${action.color}-600`} />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">
                  {action.title}
                </h4>
                <p className="text-sm text-gray-600 mb-3">{action.description}</p>
                <div className="flex flex-wrap gap-1 justify-center">
                  {action.keywords.map((keyword, idx) => (
                    <span 
                      key={idx}
                      className="px-2 py-1 bg-gray-100 text-xs text-gray-600 rounded"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
} 