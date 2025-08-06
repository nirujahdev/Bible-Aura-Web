import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { GlobalNavigation } from '@/components/GlobalNavigation';
import Footer from '@/components/Footer';
import { useSEO, SEO_CONFIG } from '@/hooks/useSEO';

const Home = () => {
  console.log('✦ Home page rendering...');
  
  // SEO optimization
  useSEO(SEO_CONFIG.HOME);

  return (
    <div className="min-h-screen bg-background">
      {/* Global Navigation */}
      <GlobalNavigation variant="landing" />

      {/* Hero Section */}
      <section className="py-20 pt-32 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            AI-Powered <span className="text-orange-500">Biblical Insights</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Experience the Bible like never before with our intelligent AI assistant, 
            comprehensive study tools, and personalized spiritual guidance.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-orange-500 hover:bg-orange-600">
              <Link to="/auth">Get Started Free</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/about">Learn More</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Powerful Features for Your Spiritual Journey
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-orange-500 text-xl">🤖</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">AI Bible Chat</h3>
              <p className="text-gray-600">
                Ask questions about Scripture and receive intelligent, biblically-grounded answers.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-orange-500 text-xl">📖</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Digital Bible</h3>
              <p className="text-gray-600">
                Access multiple translations, search Scripture, and create personal notes.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-orange-500 text-xl">✍️</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Study Journal</h3>
              <p className="text-gray-600">
                Document your spiritual insights and track your growth in faith.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-orange-500">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Start Your Spiritual Journey Today
          </h2>
          <p className="text-xl text-orange-100 mb-8">
            Join thousands of believers who are deepening their faith with Bible Aura.
          </p>
          <Button asChild size="lg" variant="secondary">
            <Link to="/auth">Sign Up Free</Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home; 