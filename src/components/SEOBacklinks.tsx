import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { 
  MessageCircle, BookOpen, Heart, PenTool, FileText, 
  Search, Users, Calendar, GraduationCap, Brain,
  Target, Music, Edit
} from "lucide-react";

// Core SEO backlinks for different page categories
export function SEOBacklinks({ currentPage, category }: { currentPage: string, category: string }) {
  const getCategoryLinks = () => {
    switch (category) {
      case 'ai':
        return [
          { text: "Bible AI Chat", href: "/bible-ai", icon: MessageCircle },
          { text: "Biblical Q&A", href: "/bible-qa", icon: Brain },
          { text: "AI Bible Analysis", href: "/bible-ai", icon: Target },
          { text: "Scripture AI Insights", href: "/bible-ai", icon: Heart },
          { text: "AI Bible Assistant", href: "/bible-ai", icon: Users },
          { text: "Biblical AI Questions", href: "/bible-qa", icon: FileText }
        ];
      case 'bible':
        return [
          { text: "Read Bible Online", href: "/bible", icon: BookOpen },
          { text: "Bible Study Tools", href: "/bible", icon: GraduationCap },
          { text: "Bible Search", href: "/bible", icon: Search },
          { text: "Bible Translations", href: "/bible", icon: FileText },
          { text: "Bible Verses", href: "/bible", icon: Heart },
          { text: "Scripture Reading", href: "/bible", icon: Calendar }
        ];
      case 'study':
        return [
          { text: "Bible Study Hub", href: "/study-hub", icon: GraduationCap },
          { text: "Topical Bible Study", href: "/topical-study", icon: Target },
          { text: "Bible Characters", href: "/study-hub", icon: Users },
          { text: "Parables Study", href: "/parables-study", icon: BookOpen },
          { text: "Bible Commentary", href: "/study-hub", icon: FileText },
          { text: "Scripture Analysis", href: "/bible-ai", icon: Brain }
        ];
      case 'tools':
        return [
          { text: "Bible Journal", href: "/journal", icon: PenTool },
          { text: "Sermon Writer", href: "/sermon-writer", icon: Edit },
          { text: "Bible Favorites", href: "/favorites", icon: Heart },
          { text: "Reading Progress", href: "/dashboard", icon: Target },
          { text: "Spiritual Journal", href: "/journal", icon: FileText },
          { text: "Bible Notes", href: "/journal", icon: MessageCircle }
        ];
      case 'content':
        return [
          { text: "Sermon Library", href: "/sermons", icon: FileText },
          { text: "Christian Songs", href: "/songs", icon: Music },
          { text: "Bible Sermons", href: "/sermon-library", icon: MessageCircle },
          { text: "Worship Songs", href: "/songs", icon: Heart },
          { text: "Daily Devotions", href: "/dashboard", icon: Calendar },
          { text: "Christian Music", href: "/songs", icon: Music }
        ];
      default:
        return [
          { text: "Bible AI Chat", href: "/bible-ai", icon: MessageCircle },
          { text: "Read Bible", href: "/bible", icon: BookOpen },
          { text: "Bible Study", href: "/study-hub", icon: GraduationCap },
          { text: "Spiritual Journal", href: "/journal", icon: PenTool },
          { text: "Bible Q&A", href: "/bible-qa", icon: Brain },
          { text: "Daily Verses", href: "/dashboard", icon: Heart }
        ];
    }
  };

  const links = getCategoryLinks().filter(link => link.href !== currentPage);

  if (links.length === 0) return null;

  return (
    <div className="py-8 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 text-center">
          Explore More Bible Study Tools
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {links.map((link, index) => {
            const IconComponent = link.icon;
            return (
              <Link
                key={index}
                to={link.href}
                className="group"
              >
                <Card className="h-full transition-all duration-300 hover:shadow-lg hover:scale-105 bg-white">
                  <CardContent className="p-4 text-center">
                    <IconComponent className="h-6 w-6 text-orange-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-medium text-gray-900 group-hover:text-orange-600 transition-colors">
                      {link.text}
                    </span>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
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