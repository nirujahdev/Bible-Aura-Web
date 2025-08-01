import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-black text-white py-16">
      <div className="w-full px-4 sm:px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-center md:text-left">
          {/* Brand Section */}
          <div className="text-center md:text-left">
            <h3 className="text-2xl font-bold text-orange-400 mb-3">
              ✦Bible Aura
            </h3>
            <p className="text-white text-base mb-4">
              AI-Powered Biblical Insight
            </p>
            <p className="text-gray-400 text-sm">
              Transform your spiritual journey with cutting-edge AI technology and deep biblical wisdom.
            </p>
          </div>
          
          {/* Features Section */}
          <div className="text-center md:text-left">
            <h4 className="text-xl font-semibold text-white mb-6">Features</h4>
            <nav className="space-y-3">
              <Link to="/bible-ai" className="block text-white hover:text-orange-400 transition-colors duration-300">
                Bible AI Assistant
              </Link>
              <Link to="/bible" className="block text-white hover:text-orange-400 transition-colors duration-300">
                Digital Bible Reader
              </Link>
              <Link to="/study-hub" className="block text-white hover:text-orange-400 transition-colors duration-300">
                Bible Study Hub
              </Link>
              <Link to="/journal" className="block text-white hover:text-orange-400 transition-colors duration-300">
                Spiritual Journal
              </Link>
              <Link to="/sermons" className="block text-white hover:text-orange-400 transition-colors duration-300">
                Sermon Library
              </Link>
              <Link to="/sermon-writer" className="block text-white hover:text-orange-400 transition-colors duration-300">
                Sermon Writer
              </Link>
              <Link to="/parables-study" className="block text-white hover:text-orange-400 transition-colors duration-300">
                Parables Study
              </Link>
              <Link to="/topical-study" className="block text-white hover:text-orange-400 transition-colors duration-300">
                Topical Studies
              </Link>
            </nav>
          </div>
          
          {/* Menu Section */}
          <div className="text-center md:text-left">
            <h4 className="text-xl font-semibold text-white mb-6">Menu</h4>
            <nav className="space-y-3">
              <Link to="/about" className="block text-white hover:text-orange-400 transition-colors duration-300">
                About
              </Link>
              <Link to="/features" className="block text-white hover:text-orange-400 transition-colors duration-300">
                All Features
              </Link>
              <Link to="/pricing" className="block text-white hover:text-orange-400 transition-colors duration-300">
                Pricing
              </Link>
              <Link to="/contact" className="block text-white hover:text-orange-400 transition-colors duration-300">
                Contact
              </Link>
              <Link to="/auth" className="block text-white hover:text-orange-400 transition-colors duration-300">
                Sign in
              </Link>
            </nav>
          </div>
          
          {/* Blog Section */}
          <div className="text-center md:text-left">
            <h4 className="text-xl font-semibold text-white mb-6">Blog</h4>
            <nav className="space-y-3">
              <Link to="/blog" className="block text-white hover:text-orange-400 transition-colors duration-300">
                All Articles
              </Link>
              <Link to="/blog/how-ai-transforms-bible-study" className="block text-white hover:text-orange-400 transition-colors duration-300">
                AI Bible Study Guide
              </Link>
              <Link to="/blog/bible-ai-vs-traditional-study" className="block text-white hover:text-orange-400 transition-colors duration-300">
                AI vs Traditional Study
              </Link>
              <Link to="/blog/ai-bible-insights-accuracy" className="block text-white hover:text-orange-400 transition-colors duration-300">
                AI Insights Accuracy
              </Link>
            </nav>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left text-white">
            <div>
              <Link to="/terms" className="hover:text-orange-400 transition-colors duration-300 text-sm text-white">
                Terms of Use
              </Link>
              <span className="mx-2">|</span>
              <Link to="/privacy" className="hover:text-orange-400 transition-colors duration-300 text-sm text-white">
                Privacy Policy
              </Link>
            </div>
            
            <div className="text-sm text-white">
              {/* Mobile/Tablet: Two lines */}
              <div className="lg:hidden">
                <div className="mb-2">
                  <span>&copy; 2025 ✦Bible Aura. All rights reserved.</span>
                </div>
                <div>
                  <span>Developed by Benaiah Nicholas Nimal</span>
                </div>
              </div>
              
              {/* Desktop/Laptop: One line */}
              <div className="hidden lg:block">
                <span>&copy; 2025 ✦Bible Aura. All rights reserved. Developed by Benaiah Nicholas Nimal</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 