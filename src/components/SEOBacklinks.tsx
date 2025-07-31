import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, Bot, MessageSquare, Library, FileText, Users, Music } from "lucide-react";

interface RelatedLink {
  title: string;
  href: string;
  description: string;
  icon: any;
  category: string;
}

interface SEOBacklinksProps {
  currentPage: string;
  category?: string;
}

const allLinks: RelatedLink[] = [
  {
    title: "AI Bible Chat Assistant",
    href: "/bible-ai",
    description: "Experience intelligent Biblical Q&A with our AI-powered chat system",
    icon: Bot,
    category: "ai"
  },
  {
    title: "Digital Bible Study Tools",
    href: "/bible",
    description: "Advanced Bible reading with cross-references, verse analysis, and multiple translations",
    icon: BookOpen,
    category: "study"
  },
  {
    title: "Biblical Character Profiles",
    href: "/bible-characters",
    description: "Explore comprehensive profiles of Bible characters with AI insights",
    icon: Users,
    category: "study"
  },
  {
    title: "Study Hub - Q&A & Sermons",
    href: "/study-hub",
    description: "Access topical studies, parables, and comprehensive sermon library",
    icon: Library,
    category: "study"
  },
  {
    title: "Bible Journal & Notes",
    href: "/journal",
    description: "Personal Bible journal with AI-enhanced reflection tools",
    icon: FileText,
    category: "personal"
  },
  {
    title: "Christian Worship Songs",
    href: "/songs",
    description: "Collection of worship songs with lyrics and biblical themes",
    icon: Music,
    category: "worship"
  },
  {
    title: "How AI Transforms Bible Study",
    href: "/blog/how-ai-transforms-bible-study",
    description: "Complete guide to AI-powered Biblical learning and spiritual growth",
    icon: MessageSquare,
    category: "blog"
  },
  {
    title: "Bible AI vs Traditional Study",
    href: "/blog/bible-ai-vs-traditional-study",
    description: "Compare modern AI Bible study methods with traditional approaches",
    icon: Bot,
    category: "blog"
  },
  {
    title: "AI Bible Study Benefits",
    href: "/blog/bible-study-ai-benefits",
    description: "Discover 10 key benefits of using AI for Biblical understanding",
    icon: BookOpen,
    category: "blog"
  }
];

export function SEOBacklinks({ currentPage, category }: SEOBacklinksProps) {
  // Filter out current page and get relevant links
  const getRelatedLinks = () => {
    let filtered = allLinks.filter(link => link.href !== currentPage);
    
    // If category is specified, prioritize same category links
    if (category) {
      const sameCategory = filtered.filter(link => link.category === category);
      const otherCategory = filtered.filter(link => link.category !== category);
      filtered = [...sameCategory.slice(0, 3), ...otherCategory.slice(0, 3)];
    }
    
    return filtered.slice(0, 6);
  };

  const relatedLinks = getRelatedLinks();

  if (relatedLinks.length === 0) return null;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-12">
      <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-2">
            <Library className="h-6 w-6 text-orange-600" />
            Explore More Bible Resources
          </CardTitle>
          <p className="text-gray-600 mt-2">
            Discover related tools and insights to deepen your Biblical understanding
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedLinks.map((link, index) => (
              <Link
                key={index}
                to={link.href}
                className="group block"
              >
                <Card className="h-full transition-all duration-300 hover:shadow-lg hover:scale-105 border-gray-200 hover:border-orange-300">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors">
                        <link.icon className="h-5 w-5 text-orange-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors line-clamp-2">
                          {link.title}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-3">
                          {link.description}
                        </p>
                        <div className="flex items-center gap-1 mt-3 text-orange-600 text-sm font-medium">
                          Explore Now
                          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Breadcrumb component for better navigation and SEO
interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface SEOBreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function SEOBreadcrumbs({ items }: SEOBreadcrumbsProps) {
  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-600 py-4 px-4">
      <Link to="/" className="hover:text-orange-600 transition-colors">
        Home
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

// Quick action links component
export function QuickActionSEOLinks() {
  const quickActions = [
    {
      title: "Start AI Bible Chat",
      href: "/bible-ai",
      description: "Ask questions and get instant Biblical insights",
      icon: MessageSquare,
      color: "blue"
    },
    {
      title: "Read Bible Online",
      href: "/bible",
      description: "Access multiple Bible translations with study tools",
      icon: BookOpen,
      color: "green"
    },
    {
      title: "Bible Study Hub",
      href: "/study-hub",
      description: "Comprehensive Biblical study resources and tools",
      icon: Library,
      color: "purple"
    },
    {
      title: "Write Bible Journal",
      href: "/journal",
      description: "Personal Bible study journal with AI insights",
      icon: FileText,
      color: "orange"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 py-8">
      {quickActions.map((action, index) => (
        <Link
          key={index}
          to={action.href}
          className="group"
        >
          <Card className="h-full transition-all duration-300 hover:shadow-lg hover:scale-105">
            <CardContent className="p-4 text-center">
              <div className={`mx-auto w-12 h-12 rounded-full bg-${action.color}-100 flex items-center justify-center mb-3 group-hover:bg-${action.color}-200 transition-colors`}>
                <action.icon className={`h-6 w-6 text-${action.color}-600`} />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{action.title}</h3>
              <p className="text-sm text-gray-600">{action.description}</p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
} 