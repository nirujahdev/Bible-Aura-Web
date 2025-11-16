import React from 'react';
import { useSEO } from '../hooks/useSEO';
import { ContactForm } from '../components/ContactForm';
import { GlobalNavigation } from '@/components/GlobalNavigation';
import Footer from '../components/Footer';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Mail, MessageCircle, HelpCircle, Shield, FileText } from 'lucide-react';

const Contact = () => {
  // SEO Configuration
  useSEO({
    title: "Contact Bible Aura | Get Support & Share Feedback | AI Bible Study Help",
    description: "Contact Bible Aura support team for help, feedback, or questions about our AI Bible study platform. Get expert assistance with features, billing, and technical support.",
    keywords: "contact Bible Aura, Bible AI support, customer service, technical help, feedback, Bible study support, AI assistance, help desk, Bible Aura team",
    ogImage: "https://bibleaura.xyz/✦Bible%20Aura%20(2).png",
    canonicalUrl: "https://bibleaura.xyz/contact"
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      {/* Global Navigation */}
      <GlobalNavigation variant="landing" />

      {/* Hero Section */}
      <section className="py-16 pt-32 bg-gradient-to-r from-orange-500 via-orange-600 to-red-600 text-white">
        <div className="w-full px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 backdrop-blur mb-6">
              <Mail className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
              Contact Bible Aura
            </h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto mb-8">
              We're here to help! Get support, share feedback, or ask questions about Bible Aura's AI-powered Bible study platform.
            </p>
            
            {/* Quick Contact Options */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur px-4 py-2 rounded-lg hover:bg-white/30 transition-colors">
                <Mail className="w-5 h-5" />
                <span>contact@bibleaura.xyz</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur px-4 py-2 rounded-lg hover:bg-white/30 transition-colors">
                <MessageCircle className="w-5 h-5" />
                <span>24/7 AI Support</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-12 md:py-16">
        <div className="w-full px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
          <ContactForm />
          
          {/* Additional Links Section */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Need More Information?
              </h3>
              <p className="text-gray-600">
                Review our policies and terms for more details
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button asChild variant="outline" size="lg">
                <Link to="/privacy-policy">
                  <Shield className="h-4 w-4 mr-2" />
                  Privacy Policy
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/terms-of-service">
                  <FileText className="h-4 w-4 mr-2" />
                  Terms of Service
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact; 