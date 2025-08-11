import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  User, 
  Heart, 
  Users, 
  PenTool, 
  Settings, 
  LogOut,
  Crown,
  BookOpen,
  Calendar,
  Star,
  X,
  Plus,
  MessageCircle,
  Search,
  Home,
  MoreVertical,
  History,
  BookMarked,
  Languages,
  Filter,
  List,
  Edit3,
  Share2,
  Download,
  Bookmark,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

interface MobileMoreMenuProps {
  isOpen: boolean;
  onClose: () => void;
  currentPage: string;
}

// Get contextual actions based on current page
const getContextualActions = (page: string) => {
  switch (page) {
    case '/':
    case '/dashboard':
      return [
        { name: 'Chat History', icon: History, action: 'chat-history', description: 'View past conversations' },
        { name: 'New Chat', icon: Plus, action: 'new-chat', description: 'Start fresh conversation' },
        { name: 'Clear Chat', icon: RefreshCw, action: 'clear-chat', description: 'Clear current chat' },
        { name: 'Export Chat', icon: Download, action: 'export-chat', description: 'Download conversation' }
      ];
    
    case '/bible':
      return [
        { name: 'Book Selection', icon: BookOpen, action: 'book-selection', description: 'Choose Bible book' },
        { name: 'Translation', icon: Languages, action: 'translation', description: 'Change translation' },
        { name: 'Search Verses', icon: Search, action: 'search-verses', description: 'Find specific verses' },
        { name: 'Bookmarks', icon: Bookmark, action: 'bookmarks', description: 'Saved verses' },
        { name: 'Reading Plan', icon: Calendar, action: 'reading-plan', description: 'Daily reading' }
      ];
    
    case '/journal':
      return [
        { name: 'Journal List', icon: List, action: 'journal-list', description: 'View all entries' },
        { name: 'New Entry', icon: Edit3, action: 'new-entry', description: 'Write new entry' },
        { name: 'Categories', icon: Filter, action: 'categories', description: 'Filter by category' },
        { name: 'Export Journal', icon: Download, action: 'export-journal', description: 'Download entries' }
      ];
    
    case '/study-hub':
      return [
        { name: 'Study Tools', icon: Search, action: 'study-tools', description: 'Bible study aids' },
        { name: 'Saved Studies', icon: BookMarked, action: 'saved-studies', description: 'Your studies' },
        { name: 'Study Plans', icon: Calendar, action: 'study-plans', description: 'Learning plans' },
        { name: 'Share Study', icon: Share2, action: 'share-study', description: 'Share with others' }
      ];
    
    case '/sermons':
      return [
        { name: 'Sermon List', icon: List, action: 'sermon-list', description: 'View all sermons' },
        { name: 'Write Sermon', icon: Edit3, action: 'write-sermon', description: 'Create new sermon' },
        { name: 'Templates', icon: BookMarked, action: 'templates', description: 'Sermon templates' },
        { name: 'Export Sermon', icon: Download, action: 'export-sermon', description: 'Download sermon' }
      ];
    
    case '/community':
      return [
        { name: 'New Discussion', icon: Plus, action: 'new-discussion', description: 'Start discussion' },
        { name: 'My Posts', icon: User, action: 'my-posts', description: 'Your posts' },
        { name: 'Saved Posts', icon: Bookmark, action: 'saved-posts', description: 'Bookmarked posts' },
        { name: 'Groups', icon: Users, action: 'groups', description: 'Join groups' }
      ];
    
    case '/favorites':
      return [
        { name: 'Verses', icon: BookOpen, action: 'fav-verses', description: 'Favorite verses' },
        { name: 'Studies', icon: Search, action: 'fav-studies', description: 'Favorite studies' },
        { name: 'Sermons', icon: PenTool, action: 'fav-sermons', description: 'Favorite sermons' },
        { name: 'Export All', icon: Download, action: 'export-favorites', description: 'Download favorites' }
      ];
    
    default:
      return [
        { name: 'Quick Search', icon: Search, action: 'quick-search', description: 'Search anything' },
        { name: 'Bookmarks', icon: Bookmark, action: 'bookmarks', description: 'Your bookmarks' },
        { name: 'History', icon: History, action: 'history', description: 'Recent activity' }
      ];
  }
};

// Get page title from path
const getPageTitle = (page: string) => {
  switch (page) {
    case '/':
    case '/dashboard':
      return 'AI Chat';
    case '/bible':
      return 'Bible';
    case '/journal':
      return 'Journal';
    case '/study-hub':
      return 'Study Hub';
    case '/sermons':
      return 'Sermons';
    case '/community':
      return 'Community';
    case '/favorites':
      return 'Favorites';
    case '/topical-study':
      return 'Topical Study';
    case '/parables-study':
      return 'Parables Study';
    case '/profile':
      return 'Profile';
    default:
      return 'Quick Actions';
  }
};

export function MobileMoreMenu({ isOpen, onClose, currentPage }: MobileMoreMenuProps) {
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const contextualActions = getContextualActions(currentPage);
  const pageTitle = getPageTitle(currentPage);

  const handleAction = (action: string) => {
    switch (action) {
      case 'chat-history':
        // Show chat history (could open a modal or navigate)
        console.log('Show chat history');
        break;
      case 'new-chat':
        navigate('/dashboard');
        window.location.reload();
        break;
      case 'clear-chat':
        // Clear current chat
        window.location.reload();
        break;
      case 'book-selection':
        // Open book selection modal/dropdown
        console.log('Open book selection');
        break;
      case 'translation':
        // Open translation selector
        console.log('Open translation selector');
        break;
      case 'search-verses':
        navigate('/bible?search=true');
        break;
      case 'bookmarks':
        navigate('/favorites');
        break;
      case 'reading-plan':
        // Open reading plan
        console.log('Open reading plan');
        break;
      case 'journal-list':
        navigate('/journal?view=list');
        break;
      case 'new-entry':
        navigate('/journal?new=true');
        break;
      case 'categories':
        navigate('/journal?categories=true');
        break;
      case 'study-tools':
        navigate('/study-hub?tools=true');
        break;
      case 'saved-studies':
        navigate('/study-hub?saved=true');
        break;
      case 'sermon-list':
        navigate('/sermons?view=list');
        break;
      case 'write-sermon':
        navigate('/sermons?new=true');
        break;
      case 'new-discussion':
        navigate('/community?new=true');
        break;
      case 'my-posts':
        navigate('/community?my-posts=true');
        break;
      default:
        console.log('Action not implemented:', action);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-50 lg:hidden"
        onClick={onClose}
      />
      
      {/* Contextual Menu Panel */}
      <div className="fixed right-0 top-0 bottom-0 z-50 bg-white shadow-2xl w-72 max-w-[85vw] lg:hidden transform transition-transform duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-amber-50">
          <div className="flex items-center gap-2">
            <MoreVertical className="h-4 w-4 text-orange-500" />
            <div>
              <h2 className="text-sm font-semibold text-gray-900">{pageTitle}</h2>
              <p className="text-xs text-gray-600">Quick Actions</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/50 rounded-lg transition-colors"
          >
            <X className="h-4 w-4 text-gray-500" />
          </button>
        </div>

        {/* Contextual Actions */}
        <div className="flex-1 overflow-y-auto p-3">
          <div className="space-y-1">
            {contextualActions.map((action, index) => {
              const IconComponent = action.icon;
              
              return (
                <button
                  key={index}
                  onClick={() => handleAction(action.action)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 text-gray-700 transition-all duration-200"
                >
                  <div className="p-1.5 rounded-md bg-gray-100">
                    <IconComponent className="h-4 w-4" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-medium text-sm">{action.name}</div>
                    <div className="text-xs text-gray-500">{action.description}</div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Quick Links Section */}
          <div className="mt-6 pt-3 border-t border-gray-200">
            <h3 className="text-xs font-semibold text-gray-700 mb-2">Quick Links</h3>
            <div className="space-y-1">
              <Link
                to="/profile"
                onClick={onClose}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 text-gray-700"
              >
                <User className="h-4 w-4" />
                <span className="text-sm">Profile & Settings</span>
              </Link>
              <Link
                to="/pricing"
                onClick={onClose}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 text-gray-700"
              >
                <Crown className="h-4 w-4" />
                <span className="text-sm">Subscription</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 