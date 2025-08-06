import { Link } from "react-router-dom";
import { ExternalLink } from "lucide-react";

interface ContextualLink {
  text: string;
  href: string;
  type: 'internal' | 'external';
  description?: string;
}

const contextualMappings: Record<string, ContextualLink[]> = {
  'bible study': [
    { text: 'Bible AI chat', href: '/', type: 'internal', description: 'AI-powered Bible study assistant' },
    { text: 'Study Hub', href: '/study-hub', type: 'internal', description: 'Advanced Bible study tools' },
    { text: 'Bible reading', href: '/bible', type: 'internal', description: 'Read and study the Bible' },
    { text: 'Bible journal', href: '/journal', type: 'internal', description: 'Personal Bible study journal' },
    { text: 'Bible characters', href: '/bible-characters', type: 'internal', description: 'Learn about biblical figures' },
    { text: 'Parables study', href: '/parables', type: 'internal', description: 'Deep dive into biblical parables' },
    { text: 'Topical study', href: '/topical-study', type: 'internal', description: 'Study Bible by topics' },
    { text: 'Sermon library', href: '/sermons', type: 'internal', description: 'Access sermon resources' }
  ],
  'daily devotion': [
    { text: 'Daily verse', href: '/', type: 'internal', description: 'Get daily scripture inspiration' }
  ],
  'sermon': [
    { text: 'Sermon library', href: '/sermons', type: 'internal', description: 'Access sermon resources' },
    { text: 'Study Hub sermons', href: '/study-hub', type: 'internal', description: 'Sermon study materials' }
  ],
  'journal': [
    { text: 'Bible journal', href: '/journal', type: 'internal', description: 'Personal Bible study journal' },
    { text: 'Bible notes', href: '/journal', type: 'internal', description: 'Write and organize Bible notes' }
  ]
};

// Component to automatically insert contextual links in text
interface ContextualTextProps {
  children: string;
  className?: string;
}

export function ContextualText({ children, className = "" }: ContextualTextProps) {
  const processText = (text: string): React.ReactNode[] => {
    const elements: React.ReactNode[] = [];
    let remainingText = text.toLowerCase();
    let originalText = text;
    let lastIndex = 0;

    // Find all potential contextual links
    const foundLinks: Array<{ start: number; end: number; link: ContextualLink; matchText: string }> = [];

    Object.entries(contextualMappings).forEach(([keyword, links]) => {
      const regex = new RegExp(keyword, 'gi');
      let match;
      while ((match = regex.exec(originalText)) !== null) {
        // Only add first link for each keyword to avoid over-linking
        if (!foundLinks.some(fl => fl.start <= match.index && fl.end >= match.index + keyword.length)) {
          foundLinks.push({
            start: match.index,
            end: match.index + keyword.length,
            link: links[0], // Use first link for the keyword
            matchText: match[0]
          });
        }
      }
    });

    // Sort links by position
    foundLinks.sort((a, b) => a.start - b.start);

    // Build the elements array
    foundLinks.forEach((linkData, index) => {
      // Add text before the link
      if (linkData.start > lastIndex) {
        elements.push(originalText.substring(lastIndex, linkData.start));
      }

      // Add the link
      elements.push(
        <Link
          key={index}
          to={linkData.link.href}
          className="text-orange-600 hover:text-orange-700 underline decoration-orange-200 hover:decoration-orange-300 transition-colors"
          title={linkData.link.description}
        >
          {linkData.matchText}
        </Link>
      );

      lastIndex = linkData.end;
    });

    // Add remaining text
    if (lastIndex < originalText.length) {
      elements.push(originalText.substring(lastIndex));
    }

    return elements.length > 0 ? elements : [originalText];
  };

  return (
    <span className={className}>
      {processText(children)}
    </span>
  );
}

// Manual contextual links component for specific contexts
interface ManualContextualLinksProps {
  context: 'bible-study' | 'ai-features' | 'worship' | 'journal' | 'general';
  limit?: number;
}

export function ManualContextualLinks({ context, limit = 4 }: ManualContextualLinksProps) {
  const getLinksForContext = (): ContextualLink[] => {
    switch (context) {
      case 'bible-study':
        return [
          { text: 'AI Bible Chat Assistant', href: '/', type: 'internal', description: 'Ask AI about Biblical topics' },
          { text: 'Bible Characters Study', href: '/bible-characters', type: 'internal', description: 'Explore Biblical figures' },
          { text: 'Topical Bible Study', href: '/study-hub', type: 'internal', description: 'Study by topics' },
          { text: 'Bible Reading Tools', href: '/bible', type: 'internal', description: 'Multiple translations and tools' }
        ];
      
      case 'ai-features':
        return [
          { text: 'AI Bible Chat', href: '/', type: 'internal', description: 'Interactive Biblical Q&A' },
          { text: 'How AI Transforms Bible Study', href: '/blog/how-ai-transforms-bible-study', type: 'internal', description: 'Complete AI Bible guide' },
          { text: 'AI vs Traditional Study', href: '/blog/bible-ai-vs-traditional-study', type: 'internal', description: 'Compare study methods' },
          { text: 'AI Bible Benefits', href: '/blog/bible-study-ai-benefits', type: 'internal', description: 'Benefits of AI Bible study' }
        ];
      
      case 'worship':
        return [
          { text: 'Christian Worship Songs', href: '/songs', type: 'internal', description: 'Collection of worship music' },
          { text: 'Bible-Based Worship', href: '/songs', type: 'internal', description: 'Scripture-based songs' },
          { text: 'Sermon Resources', href: '/sermons', type: 'internal', description: 'Worship and sermon materials' },
          { text: 'Study Hub', href: '/study-hub', type: 'internal', description: 'Comprehensive study tools' }
        ];
      
      case 'journal':
        return [
          { text: 'Personal Bible Journal', href: '/journal', type: 'internal', description: 'Write Bible reflections' },
          { text: 'AI Bible Insights', href: '/', type: 'internal', description: 'Get AI help with journaling' },
          { text: 'Bible Study Tools', href: '/bible', type: 'internal', description: 'Tools for deeper study' },
          { text: 'Daily Bible Reading', href: '/', type: 'internal', description: 'Daily scripture and inspiration' }
        ];
      
      default:
        return [
          { text: 'AI Bible Chat', href: '/', type: 'internal', description: 'Ask AI about scripture' },
          { text: 'Bible Study', href: '/bible', type: 'internal', description: 'Read and study scripture' },
          { text: 'Study Hub', href: '/study-hub', type: 'internal', description: 'Comprehensive Bible resources' },
          { text: 'Bible Journal', href: '/journal', type: 'internal', description: 'Personal Bible notes' }
        ];
    }
  };

  const links = getLinksForContext().slice(0, limit);

  return (
    <div className="flex flex-wrap gap-2 py-4">
      {links.map((link, index) => (
        <Link
          key={index}
          to={link.href}
          className="inline-flex items-center gap-1 px-3 py-1 bg-orange-50 text-orange-700 rounded-full text-sm hover:bg-orange-100 transition-colors border border-orange-200"
          title={link.description}
        >
          {link.text}
          {link.type === 'external' && <ExternalLink className="h-3 w-3" />}
        </Link>
      ))}
    </div>
  );
} 