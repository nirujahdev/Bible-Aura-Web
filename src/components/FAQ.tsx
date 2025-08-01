import { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface FAQItem {
  id: number;
  question: string;
  answer: string;
  keywords: string[];
}

const faqData: FAQItem[] = [
  {
    id: 1,
    question: "What is Bible AI and how does it work?",
    answer: "Bible AI is an advanced artificial intelligence system trained on Biblical texts and theological resources. It uses natural language processing to provide accurate, contextually relevant answers about Scripture, analyze verses, and offer theological insights while maintaining doctrinal accuracy.",
    keywords: ['bible ai', 'ai bible assistant', 'biblical artificial intelligence', 'how bible ai works']
  },
  {
    id: 2,
    question: "Is Bible Aura free to use?",
    answer: "Yes! Bible Aura offers a comprehensive free tier with Bible reading, basic AI insights, and study tools. Premium features include unlimited AI conversations, advanced study features, and priority support.",
    keywords: ['bible aura pricing', 'free bible app', 'bible aura cost', 'premium bible features']
  },
  {
    id: 3,
    question: "What Bible translations are supported?",
    answer: "Bible Aura supports over 10 translations including KJV, NIV, ESV, NASB, NLT, and CSB. Our AI can compare translations and explain differences to help you understand various interpretations.",
    keywords: ['bible translations', 'bible versions', 'kjv niv esv', 'multiple bible translations']
  },
  {
    id: 4,
    question: "Can I ask questions about specific Bible verses?",
    answer: "Absolutely! Ask questions like 'What does John 3:16 mean?' or 'Explain Romans 8:28'. The AI provides detailed explanations with historical context, theological interpretations, and cross-references.",
    keywords: ['bible verse analysis', 'verse explanation ai', 'bible verse questions', 'scripture analysis ai']
  },
  {
    id: 5,
    question: "How accurate is Bible AI?",
    answer: "Our Bible AI is trained on centuries of biblical scholarship and maintains high theological accuracy. However, we always recommend verifying insights with trusted biblical commentaries and pastoral guidance for important spiritual decisions.",
    keywords: ['bible ai accuracy', 'theological accuracy', 'ai reliability', 'biblical scholarship']
  },
  {
    id: 6,
    question: "Can I save my favorite verses and notes?",
    answer: "Yes! Bible Aura includes personal tools for saving favorite verses, creating collections, writing notes, and tracking your reading progress. All your personal data is kept private and secure.",
    keywords: ['save bible verses', 'bible favorites', 'personal notes', 'reading progress']
  },
  {
    id: 7,
    question: "Is my personal data safe and private?",
    answer: "Absolutely. We take privacy seriously. Your journals, notes, conversations, and spiritual journey remain completely private. We use enterprise-grade encryption and never share your personal information.",
    keywords: ['privacy', 'data security', 'personal information', 'encrypted data']
  },
  {
    id: 8,
    question: "How can I contact support if I need help?",
    answer: "You can reach our support team through the contact form on our website or by emailing us directly. We're here to help with any questions about Bible AI features or technical support.",
    keywords: ['contact support', 'help', 'customer service', 'technical support']
  }
];

export default function FAQ() {
  const [openItems, setOpenItems] = useState<number[]>([]);

  const toggleItem = (id: number) => {
    setOpenItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  return (
    <section className="py-16 md:py-20 bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full shadow-xl mb-6">
            <HelpCircle className="h-8 w-8 text-white" />
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Find answers to common questions about Bible Aura's AI features, privacy, and how to get the most out of your spiritual journey.
          </p>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4 max-w-3xl mx-auto mb-12">
          {faqData.map((faq) => (
            <Card 
              key={faq.id} 
              className="bg-white hover:shadow-lg transition-all duration-300 border-0 shadow-md overflow-hidden group"
            >
              <CardHeader 
                className="cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleItem(faq.id)}
              >
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold text-gray-900 flex-1 text-center pr-4 group-hover:text-orange-600 transition-colors">
                    {faq.question}
                  </CardTitle>
                  <div className="flex-shrink-0">
                    {openItems.includes(faq.id) ? (
                      <ChevronUp className="h-5 w-5 text-orange-600 transition-transform duration-300" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-orange-600 transition-transform duration-300" />
                    )}
                  </div>
                </div>
              </CardHeader>
              
              {openItems.includes(faq.id) && (
                <CardContent className="pt-0 animate-in slide-in-from-top-2 duration-300">
                  <div className="border-t border-gray-100 pt-6">
                    <p className="text-gray-700 leading-relaxed mb-6 text-center">
                      {faq.answer}
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {faq.keywords.slice(0, 4).map((keyword, idx) => (
                        <span 
                          key={idx}
                          className="px-3 py-1 bg-orange-100 text-xs text-orange-700 rounded-full font-medium"
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

        {/* About the Founder */}
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full shadow-xl mb-6">
            <User className="h-8 w-8 text-white" />
          </div>
          
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            About the Founder
          </h3>
          
          <p className="text-gray-600 leading-relaxed mb-6">
            Bible Aura was created by <strong>Benaiah Nicholas Nimal</strong>, a passionate believer and software developer dedicated to making biblical wisdom accessible through technology. Combining faith with cutting-edge AI, Benaiah's vision is to help believers worldwide deepen their spiritual journey through intelligent Bible study tools.
          </p>
          
          <div className="flex flex-wrap gap-2 justify-center">
            <span className="px-3 py-1 bg-blue-100 text-xs text-blue-700 rounded-full font-medium">
              Founder & Developer
            </span>
            <span className="px-3 py-1 bg-purple-100 text-xs text-purple-700 rounded-full font-medium">
              Faith & Technology
            </span>
            <span className="px-3 py-1 bg-orange-100 text-xs text-orange-700 rounded-full font-medium">
              Bible AI Vision
            </span>
          </div>
        </div>
      </div>
    </section>
  );
} 