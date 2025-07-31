import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-black text-white py-16">
      <div className="w-full px-4 sm:px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          {/* Brand Section */}
          <div className="text-center md:text-left">
            <h3 className="text-2xl font-bold text-orange-400 mb-3">
              ✦Bible Aura
            </h3>
            <p className="text-white text-base">
              AI-Powered Biblical Insight
            </p>
          </div>
          
          {/* Menu Section */}
          <div className="text-center md:text-left">
            <h4 className="text-xl font-semibold text-white mb-6">Menu</h4>
            <nav className="space-y-3">
              <Link to="/about" className="block text-white hover:text-orange-400 transition-colors duration-300">
                About
              </Link>
              <Link to="/careers" className="block text-white hover:text-orange-400 transition-colors duration-300">
                Careers
              </Link>
              <Link to="/pricing" className="block text-white hover:text-orange-400 transition-colors duration-300">
                Pricing
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