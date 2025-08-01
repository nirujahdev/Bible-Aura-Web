import { Link } from 'react-router-dom';
import { Mail, Instagram } from 'lucide-react';

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
            <p className="text-white text-base mb-6">
              AI-Powered Biblical Insight
            </p>
            
            {/* Contact Buttons */}
            <div className="flex justify-center md:justify-start gap-4 mb-4">
              <a 
                href="mailto:contact@bibleaura.xyz"
                className="flex items-center justify-center w-10 h-10 bg-orange-500 hover:bg-orange-600 rounded-full transition-colors duration-300"
                aria-label="Email us"
              >
                <Mail className="h-5 w-5 text-white" />
              </a>
              <a 
                href="https://www.instagram.com/benaiah_4?igsh=cGZuYmI2YWw0d25r"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-full transition-all duration-300"
                aria-label="Follow us on Instagram"
              >
                <Instagram className="h-5 w-5 text-white" />
              </a>
            </div>
          </div>
          
          {/* Features Section */}
          <div className="text-center md:text-left">
            <h4 className="text-xl font-semibold text-white mb-6">Features</h4>
            <nav className="space-y-3">
              <Link to="/features/bible-study" className="block text-white hover:text-orange-400 transition-colors duration-300">
                Bible Study Tools
              </Link>
              <Link to="/features/ai-features" className="block text-white hover:text-orange-400 transition-colors duration-300">
                AI Features
              </Link>
              <Link to="/features/content-creation" className="block text-white hover:text-orange-400 transition-colors duration-300">
                Content Creation
              </Link>
              <Link to="/features/personal-tools" className="block text-white hover:text-orange-400 transition-colors duration-300">
                Personal Tools
              </Link>
              <Link to="/features/learning-resources" className="block text-white hover:text-orange-400 transition-colors duration-300">
                Learning Resources
              </Link>
              <Link to="/features/advanced-study" className="block text-white hover:text-orange-400 transition-colors duration-300">
                Advanced Study
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