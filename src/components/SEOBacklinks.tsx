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
    <div></div>
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