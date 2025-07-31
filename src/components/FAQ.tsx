import { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle, MessageCircle, BookOpen, Brain, Shield, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface FAQItem {
  id: number;
  question: string;
  answer: string;
  category: 'ai' | 'bible' | 'platform' | 'privacy' | 'features' | 'technical';
  keywords: string[];
}

const faqData: FAQItem[] = [
  {
    id: 1,
    question: "What is Bible AI and how does it work?",
    answer: "Bible AI is an advanced artificial intelligence system trained on Biblical texts and theological resources. It uses natural language processing to provide accurate, contextually relevant answers about Scripture, analyze verses, and offer theological insights while maintaining doctrinal accuracy.",
    category: 'ai',
    keywords: ['bible ai', 'ai bible assistant', 'biblical artificial intelligence', 'how bible ai works']
  },
  {
    id: 2,
    question: "Is Bible Aura free to use?",
    answer: "Yes! Bible Aura offers a comprehensive free tier with Bible reading, basic AI insights, and study tools. Premium features include unlimited AI conversations, advanced study features, and priority support.",
    category: 'platform',
    keywords: ['bible aura pricing', 'free bible app', 'bible aura cost', 'premium bible features']
  },
  {
    id: 3,
    question: "What Bible translations are supported?",
    answer: "Bible Aura supports over 50 translations including KJV, NIV, ESV, NASB, NLT, and CSB. Our AI can compare translations and explain differences to help you understand various interpretations.",
    category: 'bible',
    keywords: ['bible translations', 'bible versions', 'kjv niv esv', 'multiple bible translations']
  },
  {
    id: 4,
    question: "Can I ask questions about specific Bible verses?",
    answer: "Absolutely! Ask questions like 'What does John 3:16 mean?' or 'Explain Romans 8:28'. The AI provides detailed explanations with historical context, theological interpretations, and cross-references.",
    category: 'ai',
    keywords: ['bible verse analysis', 'verse explanation ai', 'bible verse questions', 'scripture analysis ai']
  },
  {
    id: 5,
    question: "How accurate is Bible AI?",
    answer: "Our Bible AI achieves 94%+ accuracy compared to established Biblical commentaries. It's designed with theological accuracy as a priority, but we recommend using it alongside traditional study methods and pastoral guidance.",
    category: 'ai',
    keywords: ['bible ai accuracy', 'theological accuracy', 'reliable bible ai', '94 percent accuracy']
  },
  {
    id: 6,
    question: "Does Bible Aura work offline?",
    answer: "Bible Aura is web-based and requires internet for AI features. However, our Progressive Web App (PWA) can cache basic Bible text for offline reading. Full functionality needs an internet connection.",
    category: 'technical',
    keywords: ['bible aura offline', 'offline bible reading', 'bible app offline', 'internet required']
  },
  {
    id: 7,
    question: "Can I save my Bible study notes?",
    answer: "Yes! Bible Aura includes a comprehensive journal feature for saving notes, insights, and reflections. Organize by books, chapters, or topics. Your journal is private, searchable, and exportable.",
    category: 'features',
    keywords: ['bible journal', 'bible study notes', 'save bible notes', 'organize bible study']
  },
  {
    id: 8,
    question: "How do I start using Bible AI?",
    answer: "Simply navigate to the Bible AI section and type your question in natural language. Ask anything like 'What does faith mean?' or 'Explain the parable of the sower'. No special formatting required.",
    category: 'features',
    keywords: ['bible ai chat', 'how to use bible ai', 'bible ai conversation', 'ask bible questions']
  },
  {
    id: 9,
    question: "Is my data safe and private?",
    answer: "Yes, we use enterprise-grade encryption and never sell your personal information. Your Bible study notes and conversations are private and secure. You can delete your account and data anytime.",
    category: 'privacy',
    keywords: ['bible aura privacy', 'data security', 'private bible study', 'secure bible app']
  },
  {
    id: 10,
    question: "Do you offer technical support?",
    answer: "Yes, we provide comprehensive technical support through email and chat. This includes help with account setup, troubleshooting, and feature guidance. Premium users get priority support.",
    category: 'technical',
    keywords: ['technical support', 'bible aura help', 'troubleshooting', 'customer support']
  }
];

const categories = [
  { id: 'all', name: 'All Questions', icon: HelpCircle },
  { id: 'ai', name: 'Bible AI', icon: Brain },
  { id: 'bible', name: 'Bible Study', icon: BookOpen },
  { id: 'features', name: 'Features', icon: Zap },
  { id: 'platform', name: 'Platform', icon: MessageCircle },
  { id: 'privacy', name: 'Privacy & Security', icon: Shield },
  { id: 'technical', name: 'Technical', icon: HelpCircle }
];

export default function FAQ() {
  const [openItems, setOpenItems] = useState<number[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const toggleItem = (id: number) => {
    setOpenItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const filteredFAQs = faqData.filter(faq => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    const matchesSearch = searchTerm === '' || 
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="bg-gradient-to-br from-slate-50 via-orange-50 to-amber-50 py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Get answers to common questions about Bible AI, Bible study features, and the Bible Aura platform
          </p>

          {/* Search */}
          <div className="max-w-md mx-auto mb-8">
            <input
              type="text"
              placeholder="Search FAQ questions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
            />
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200 ${
                  selectedCategory === category.id
                    ? 'bg-orange-500 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-orange-50 border border-gray-200'
                }`}
              >
                <category.icon className="h-4 w-4" />
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {filteredFAQs.map((faq) => (
            <Card 
              key={faq.id} 
              className="bg-white hover:shadow-md transition-all duration-200 border-l-4 border-l-orange-400"
            >
              <CardHeader 
                className="cursor-pointer"
                onClick={() => toggleItem(faq.id)}
              >
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold text-gray-900 flex-1 text-left pr-4">
                    {faq.question}
                  </CardTitle>
                  <div className="flex-shrink-0">
                    {openItems.includes(faq.id) ? (
                      <ChevronUp className="h-5 w-5 text-orange-600" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-orange-600" />
                    )}
                  </div>
                </div>
              </CardHeader>
              {openItems.includes(faq.id) && (
                <CardContent className="pt-0">
                  <div className="border-t border-gray-100 pt-4">
                    <p className="text-gray-700 leading-relaxed mb-4">
                      {faq.answer}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {faq.keywords.slice(0, 4).map((keyword, idx) => (
                        <span 
                          key={idx}
                          className="px-2 py-1 bg-orange-100 text-xs text-orange-700 rounded"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>

        {filteredFAQs.length === 0 && (
          <div className="text-center py-12">
            <HelpCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No questions found</h3>
            <p className="text-gray-500">Try adjusting your search or category filter</p>
          </div>
        )}

        {/* Contact CTA */}
        <div className="mt-16 bg-white rounded-2xl shadow-lg p-8 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Still have questions?
          </h3>
          <p className="text-gray-600 mb-6">
            Can't find what you're looking for? Our support team is here to help with any questions about Bible AI or Bible study features.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/contact"
              className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-8 py-3 rounded-full hover:from-orange-600 hover:to-amber-600 transition-all duration-200 font-medium"
            >
              Contact Support
            </a>
            <a 
              href="/bible-ai"
              className="border border-orange-400 text-orange-600 px-8 py-3 rounded-full hover:bg-orange-50 transition-all duration-200 font-medium"
            >
              Try Bible AI Now
            </a>
          </div>
        </div>
      </div>
    </div>
  );
} 