import { Link } from 'react-router-dom';
import { Mail, Instagram, Twitter, Youtube } from 'lucide-react';

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
            
            {/* Contact & Social Media Buttons */}
            <div className="flex justify-center md:justify-start gap-3 mb-4 flex-wrap">
              <a 
                href="mailto:contact@bibleaura.xyz"
                className="flex items-center justify-center w-10 h-10 bg-orange-500 hover:bg-orange-600 rounded-full transition-colors duration-300"
                aria-label="Email us"
              >
                <Mail className="h-5 w-5 text-white" />
              </a>
              <a 
                href="https://www.instagram.com/bible_aura.xyz/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-full transition-all duration-300"
                aria-label="Follow us on Instagram"
              >
                <Instagram className="h-5 w-5 text-white" />
              </a>
              <a 
                href="https://x.com/bibleaura_xyz"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-10 h-10 bg-black hover:bg-gray-800 border border-gray-600 hover:border-gray-500 rounded-full transition-all duration-300"
                aria-label="Follow us on X (Twitter)"
              >
                <Twitter className="h-5 w-5 text-white" />
              </a>
              <a 
                href="https://www.pinterest.com/bible_aura/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-10 h-10 bg-red-600 hover:bg-red-700 rounded-full transition-colors duration-300"
                aria-label="Follow us on Pinterest"
              >
                <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.373 0 0 5.372 0 12 0 17.084 3.163 21.426 7.627 23.174c-.105-.949-.2-2.405.042-3.441.219-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.888-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.357-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12.001 24c6.624 0 11.999-5.373 11.999-12C24 5.372 18.626.001 12.001.001z"/>
                </svg>
              </a>
              <a 
                href="https://www.youtube.com/channel/UCYTZY9J6zeUgstLabnmQKzQ"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-10 h-10 bg-red-600 hover:bg-red-700 rounded-full transition-colors duration-300"
                aria-label="Subscribe to our YouTube channel"
              >
                <Youtube className="h-5 w-5 text-white" />
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
              <a href="/terms-of-service.html" className="hover:text-orange-400 transition-colors duration-300 text-sm text-white">
                Terms of Use
              </a>
              <span className="mx-2">|</span>
              <a href="/privacy-policy.html" className="hover:text-orange-400 transition-colors duration-300 text-sm text-white">
                Privacy Policy
              </a>
            </div>
            
            <div className="text-sm text-white">
              {/* Mobile/Tablet: Two lines */}
              <div className="lg:hidden">
                <div className="mb-2">
                  <span>&copy; 2025 ✦Bible Aura. All rights reserved.</span>
                </div>
                <div>
                  <span>Developed by <a 
                    href="https://benaiahnicholasnimal.vercel.app" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary/80 transition-colors duration-200"
                  >
                    Benaiah Nicholas Nimal
                  </a></span>
                </div>
              </div>
              
              {/* Desktop/Laptop: One line */}
              <div className="hidden lg:block">
                <span>&copy; 2025 ✦Bible Aura. All rights reserved. Developed by <a 
                  href="https://benaiahnicholasnimal.vercel.app" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary/80 transition-colors duration-200"
                >
                  Benaiah Nicholas Nimal
                </a></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 