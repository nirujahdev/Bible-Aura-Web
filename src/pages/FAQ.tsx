import { useState } from 'react';
import { GlobalNavigation } from '@/components/GlobalNavigation';
import Footer from '@/components/Footer';
import { useSEO, SEO_CONFIG } from '@/hooks/useSEO';
import { 
  ChevronDown, 
  ChevronUp, 
  HelpCircle, 
  Search,
  Mail,
  Sparkles
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const faqs = [
  {
    id: 1,
    question: "What is Bible Aura?",
    answer: "Bible Aura is an AI-powered Bible study platform that provides verse explanations, topical studies, character insights, and Tamil/English Bible support for deeper spiritual understanding."
  },
  {
    id: 2,
    question: "How does Bible Aura's AI Bible assistant work?",
    answer: "Our AI uses advanced retrieval-based reasoning and Bible-specific datasets to give accurate, scripture-focused answers in both Tamil and English."
  },
  {
    id: 3,
    question: "Is Bible Aura biblically accurate?",
    answer: "Bible Aura retrieves Bible passages from verified sources and follows orthodox Christian interpretation. AI responses may vary, but we focus on accuracy and scriptural alignment."
  },
  {
    id: 4,
    question: "Can Bible Aura explain Bible verses?",
    answer: "Yes. You can ask any verse (e.g., \"Romans 8:28 meaning\") and the AI will give a structured verse analysis with context, doctrine, and cross-references."
  },
  {
    id: 5,
    question: "Does Bible Aura support Tamil Bible questions?",
    answer: "Yes. Bible Aura fully supports Tamil Bible explanations, verse meaning, and devotional insights in Tamil."
  },
  {
    id: 6,
    question: "Is Bible Aura free to use?",
    answer: "Yes, Bible Aura is completely free. No subscription fees or hidden payments."
  },
  {
    id: 7,
    question: "Can I use Bible Aura for sermon preparation?",
    answer: "Yes. Bible Aura includes sermon outlines, Bible references, theological notes, and structured sermon-builder tools."
  },
  {
    id: 8,
    question: "Does Bible Aura store my chat history?",
    answer: "Yes, but users can delete their history anytime. We respect your privacy and store only what's needed for your account."
  },
  {
    id: 9,
    question: "Can Bible Aura help with daily Bible reading?",
    answer: "Yes. You can generate custom Bible reading plans, track progress, and get AI-guided daily insights."
  },
  {
    id: 10,
    question: "Does Bible Aura provide topical Bible studies?",
    answer: "Yes. You can explore topics like faith, hope, forgiveness, salvation, love, and more — with scriptures and commentary."
  },
  {
    id: 11,
    question: "Does Bible Aura offer Bible character studies?",
    answer: "Yes. Bible Aura provides structured profiles of characters like David, Paul, Ruth, Esther, Moses, etc."
  },
  {
    id: 12,
    question: "Can I ask Bible Aura personal spiritual questions?",
    answer: "Yes, you can ask about prayer, anxiety, purpose, relationships, and more. AI provides scriptural encouragement."
  },
  {
    id: 13,
    question: "Which Bible translations does Bible Aura use?",
    answer: "Bible Aura uses public domain and licensed Bible translations for English and Tamil support depending on availability."
  },
  {
    id: 14,
    question: "Does Bible Aura work on mobile?",
    answer: "Yes. Bible Aura works on all mobile browsers and is optimized for smartphones."
  },
  {
    id: 15,
    question: "Is Bible Aura safe for children and teens?",
    answer: "Yes. It's designed for clean, biblical use, recommended for users aged 13+."
  },
  {
    id: 16,
    question: "Does Bible Aura need my personal information?",
    answer: "We only require basic details like email for login. No unnecessary data is collected."
  },
  {
    id: 17,
    question: "Is my data secure with Bible Aura?",
    answer: "Yes. We use industry-standard security measures and do not sell your personal information."
  },
  {
    id: 18,
    question: "Can pastors and Bible teachers use Bible Aura?",
    answer: "Absolutely. Many church leaders use our verse tools, sermon aids, and contextual analysis features."
  },
  {
    id: 19,
    question: "Does Bible Aura support Bible study groups?",
    answer: "Yes. Bible Aura can be used to prepare group lessons, devotionals, and discussion guides."
  },
  {
    id: 20,
    question: "What languages does Bible Aura support?",
    answer: "Currently English and Tamil, with more languages planned in future."
  },
  {
    id: 21,
    question: "Can Bible Aura compare Bible verses?",
    answer: "Yes. You can ask for related verses, cross-references, and thematic connections."
  },
  {
    id: 22,
    question: "Can the AI give wrong answers?",
    answer: "Yes, AI may sometimes make mistakes. Always verify responses with Scripture."
  },
  {
    id: 23,
    question: "Does Bible Aura interpret dreams or prophecy?",
    answer: "No. Bible Aura focuses strictly on Bible teaching, not supernatural interpretations."
  },
  {
    id: 24,
    question: "Can I share Bible Aura insights with others?",
    answer: "Yes. You can copy and share AI-generated insights freely for ministry or personal use."
  },
  {
    id: 25,
    question: "Does Bible Aura offer devotionals?",
    answer: "Yes. You can request daily devotionals, Bible reflections, and short encouragements."
  },
  {
    id: 26,
    question: "Can I use Bible Aura without creating an account?",
    answer: "Some features may require a login (like reading plans), but basic AI chat is accessible."
  },
  {
    id: 27,
    question: "How is Bible Aura different from other Bible apps?",
    answer: "Bible Aura combines AI reasoning, real-time Bible retrieval, Tamil support, and structured study formats in one clean interface."
  },
  {
    id: 28,
    question: "Does Bible Aura help new Christians?",
    answer: "Yes. The AI simplifies complex verses, provides beginner-friendly explanations, and guides users through foundational topics."
  },
  {
    id: 29,
    question: "Can I request custom Bible reading plans?",
    answer: "Yes. Bible Aura can generate personalized plans based on your goals, schedule, and reading speed."
  },
  {
    id: 30,
    question: "How do I contact Bible Aura for support?",
    answer: "You can email us anytime at contact@bibleaura.xyz for help or suggestions."
  }
];

export default function FAQ() {
  useSEO({
    title: "FAQ - Bible Aura | Frequently Asked Questions",
    description: "Find answers to common questions about Bible Aura's AI-powered Bible study platform, features, and how to use it.",
    keywords: "Bible Aura FAQ, Bible study questions, AI Bible assistant, Tamil Bible support"
  });

  const [openItems, setOpenItems] = useState<Set<number>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  const toggleItem = (id: number) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(id)) {
      newOpenItems.delete(id);
    } else {
      newOpenItems.add(id);
    }
    setOpenItems(newOpenItems);
  };

  const filteredFAQs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50">
      <GlobalNavigation variant="landing" />
      
      {/* Hero Section */}
      <section className="pt-24 md:pt-32 pb-12 px-4 md:px-6 lg:px-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 text-white mb-6 shadow-lg">
            <HelpCircle className="h-8 w-8" />
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
            <span className="text-transparent bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text">
              Frequently Asked Questions
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Find answers to common questions about Bible Aura's features, AI capabilities, and how to get the most out of your Bible study.
          </p>

          {/* Search Bar */}
          <div className="max-w-xl mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 h-12 rounded-full border-gray-300 focus:border-orange-500 focus:ring-orange-500"
              />
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="pb-20 px-4 md:px-6 lg:px-10">
        <div className="max-w-4xl mx-auto">
          {filteredFAQs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No questions found matching your search.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredFAQs.map((faq) => {
                const isOpen = openItems.has(faq.id);
                return (
                  <div
                    key={faq.id}
                    className={cn(
                      "bg-white rounded-xl border border-gray-200 shadow-sm transition-all duration-200",
                      isOpen && "shadow-md border-orange-200"
                    )}
                  >
                    <button
                      onClick={() => toggleItem(faq.id)}
                      className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-gray-50 rounded-xl transition-colors"
                    >
                      <span className="text-lg font-semibold text-gray-900 pr-4">
                        {faq.question}
                      </span>
                      <div className={cn(
                        "flex-shrink-0 transition-transform duration-200",
                        isOpen && "rotate-180"
                      )}>
                        {isOpen ? (
                          <ChevronUp className="h-5 w-5 text-orange-500" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                    </button>
                    
                    {isOpen && (
                      <div className="px-6 pb-5 pt-0">
                        <div className="pt-4 border-t border-gray-100">
                          <p className="text-gray-600 leading-relaxed">
                            {faq.answer}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-12 px-4 md:px-6 lg:px-10 bg-white/50">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-8 md:p-12 border border-orange-100">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-orange-500 text-white mb-4">
              <Mail className="h-6 w-6" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
              Still have questions?
            </h2>
            <p className="text-gray-600 mb-6 max-w-xl mx-auto">
              Can't find the answer you're looking for? We're here to help!
            </p>
            <Button
              asChild
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
            >
              <a href="mailto:contact@bibleaura.xyz">
                <Mail className="h-4 w-4 mr-2" />
                Contact Support
              </a>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

