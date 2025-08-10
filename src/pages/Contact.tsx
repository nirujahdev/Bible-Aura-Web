import React from 'react';
import { useSEO } from '../hooks/useSEO';
import { ContactForm } from '../components/ContactForm';
import Footer from '../components/Footer';
import { Mail, MessageCircle, HelpCircle } from 'lucide-react';

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-orange-500 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Contact Bible Aura
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed">
            We're here to help! Get support, share feedback, or ask questions about Bible Aura's AI-powered Bible study platform.
          </p>
          
          {/* Quick Contact Options */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur px-4 py-2 rounded-lg">
              <Mail className="w-5 h-5" />
              <span>contact@bibleaura.xyz</span>
            </div>
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur px-4 py-2 rounded-lg">
              <MessageCircle className="w-5 h-5" />
              <span>24/7 AI Support</span>
            </div>
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur px-4 py-2 rounded-lg">
              <HelpCircle className="w-5 h-5" />
              <span>Fast Response</span>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Form Section */}
      <div className="max-w-4xl mx-auto px-4 py-16">
        <ContactForm />
      </div>

      <Footer />
    </div>
  );
};

export default Contact; 