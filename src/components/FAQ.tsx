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
    answer: "Bible AI is an advanced artificial intelligence system specifically trained on Biblical texts, theological commentaries, and religious literature. Our Bible AI uses natural language processing to understand your questions and provide accurate, contextually relevant answers based on Scripture. It can analyze verses, explain Biblical concepts, provide cross-references, and offer insights while maintaining theological accuracy. The AI has been trained on multiple Bible translations, concordances, and scholarly resources to ensure comprehensive and reliable responses.",
    category: 'ai',
    keywords: ['bible ai', 'ai bible assistant', 'biblical artificial intelligence', 'how bible ai works']
  },
  {
    id: 2,
    question: "Is Bible Aura's AI theologically accurate and reliable?",
    answer: "Yes, our Bible AI is designed with theological accuracy as a top priority. The system has been trained on trusted Biblical commentaries, theological works, and cross-referenced with multiple Bible translations. We have a team of theological scholars who review and validate the AI's responses. However, we always recommend using AI insights as a supplement to, not a replacement for, personal Bible study, prayer, and consultation with pastoral guidance for important spiritual decisions.",
    category: 'ai',
    keywords: ['bible ai accuracy', 'theological accuracy', 'reliable bible ai', 'bible ai trustworthy']
  },
  {
    id: 3,
    question: "Can I ask Bible AI questions about specific Bible verses?",
    answer: "Absolutely! Bible AI excels at verse-specific analysis. You can ask questions like 'What does John 3:16 mean?', 'Explain the context of Romans 8:28', or 'What are the cross-references for Psalm 23:1?'. The AI will provide detailed explanations including historical context, original language insights, theological interpretations, and related verses. You can also ask comparative questions about different translations or request connections between verses.",
    category: 'ai',
    keywords: ['bible verse analysis', 'verse explanation ai', 'bible verse questions', 'scripture analysis ai']
  },
  {
    id: 4,
    question: "What Bible translations does Bible Aura support?",
    answer: "Bible Aura supports over 50 Bible translations including KJV (King James Version), NIV (New International Version), ESV (English Standard Version), NASB (New American Standard Bible), NLT (New Living Translation), CSB (Christian Standard Bible), and many others. Our AI can compare translations, explain differences, and help you understand why certain translations use different wording. We also support original language resources for Hebrew and Greek text analysis.",
    category: 'bible',
    keywords: ['bible translations', 'bible versions', 'kjv niv esv', 'multiple bible translations']
  },
  {
    id: 5,
    question: "How is Bible Aura different from other Bible study apps?",
    answer: "Bible Aura is unique because it combines traditional Bible study tools with advanced AI technology. Unlike other apps that simply provide text and basic commentaries, our platform offers intelligent, conversational Bible study through AI chat, personalized insights, advanced search capabilities, and dynamic cross-referencing. Our AI understands context and can provide explanations tailored to your spiritual maturity level and specific questions.",
    category: 'platform',
    keywords: ['bible aura features', 'ai bible app', 'unique bible study app', 'bible aura vs others']
  },
  {
    id: 6,
    question: "Is Bible Aura free to use?",
    answer: "Bible Aura offers both free and premium features. The free tier includes access to basic Bible reading, limited AI chat interactions, and essential study tools. Our premium subscription unlocks unlimited AI conversations, advanced study features, sermon tools, detailed verse analysis, cross-references, and priority support. We believe everyone should have access to God's Word, so core Bible reading functionality remains free forever.",
    category: 'platform',
    keywords: ['bible aura pricing', 'free bible app', 'bible aura cost', 'premium bible features']
  },
  {
    id: 7,
    question: "Can Bible AI help me understand difficult Bible passages?",
    answer: "Yes! Bible AI specializes in explaining difficult or complex Biblical passages. Whether you're struggling with Old Testament prophecies, Paul's theological arguments, symbolic language in Revelation, or any challenging scripture, the AI can break down complex concepts into understandable explanations. It provides historical context, cultural background, theological interpretations, and practical applications to help make difficult passages more accessible.",
    category: 'ai',
    keywords: ['difficult bible passages', 'bible ai explanation', 'complex scripture', 'bible interpretation ai']
  },
  {
    id: 8,
    question: "Does Bible Aura work offline?",
    answer: "Bible Aura is primarily a web-based platform that requires an internet connection for AI features and real-time updates. However, we offer a Progressive Web App (PWA) that can cache basic Bible text for offline reading. For full functionality including AI chat, verse analysis, and advanced features, an internet connection is required. We're working on expanding offline capabilities in future updates.",
    category: 'technical',
    keywords: ['bible aura offline', 'offline bible reading', 'bible app offline', 'internet required']
  },
  {
    id: 9,
    question: "How do I start a conversation with Bible AI?",
    answer: "Starting a conversation with Bible AI is simple! Navigate to the Bible AI section and type your question in natural language. You can ask things like 'What does it mean to have faith?', 'Explain the parable of the sower', or 'Find verses about forgiveness'. The AI understands context, so you can have flowing conversations and ask follow-up questions. There's no need for special commands or formatting - just ask as you would ask a knowledgeable friend.",
    category: 'features',
    keywords: ['bible ai chat', 'how to use bible ai', 'bible ai conversation', 'ask bible questions']
  },
  {
    id: 10,
    question: "Can Bible AI help with sermon preparation?",
    answer: "Absolutely! Bible AI is an excellent tool for sermon preparation. You can ask for verse explanations, historical context, theological insights, illustration ideas, and outline suggestions. The AI can help you find related scriptures, understand original language meanings, and explore different interpretational perspectives. However, we encourage pastors to use AI as a research and brainstorming tool while ensuring their sermons reflect their personal study, prayer, and divine inspiration.",
    category: 'features',
    keywords: ['ai sermon preparation', 'bible ai preaching', 'sermon writing ai', 'pastoral tools ai']
  },
  {
    id: 11,
    question: "Is my data safe and private on Bible Aura?",
    answer: "Yes, we take your privacy and data security very seriously. Bible Aura uses enterprise-grade encryption to protect your data. We don't sell your personal information to third parties. Your Bible study notes, questions, and conversations are private and secure. We only use aggregated, anonymized data to improve our AI system. You can delete your account and data at any time. For detailed information, please review our Privacy Policy.",
    category: 'privacy',
    keywords: ['bible aura privacy', 'data security', 'private bible study', 'secure bible app']
  },
  {
    id: 12,
    question: "Can I save and organize my Bible study notes?",
    answer: "Yes! Bible Aura includes a comprehensive Bible journal feature where you can save notes, insights, prayer requests, and reflections. You can organize notes by books, chapters, verses, or custom topics. The AI can also suggest relevant verses and insights based on your notes. Your journal is private, searchable, and can be exported for backup. Premium users get unlimited storage and advanced organization features.",
    category: 'features',
    keywords: ['bible journal', 'bible study notes', 'save bible notes', 'organize bible study']
  },
  {
    id: 13,
    question: "Does Bible AI provide different denominational perspectives?",
    answer: "Bible AI aims to provide balanced, biblically-grounded responses that respect different Christian traditions. While the AI doesn't advocate for specific denominational positions, it can explain different interpretational approaches when relevant. For denominationally-specific questions, we recommend consulting your pastor or denominational resources. Our goal is to provide insights that help all Christians grow in their understanding of God's Word while respecting theological diversity within orthodox Christianity.",
    category: 'ai',
    keywords: ['denominational perspectives', 'bible ai theology', 'christian traditions', 'theological balance']
  },
  {
    id: 14,
    question: "Can Bible AI help me with Bible reading plans?",
    answer: "Yes! Bible AI can suggest personalized Bible reading plans based on your interests, spiritual goals, and available time. Whether you want to read through the entire Bible in a year, focus on specific themes like prayer or faith, or study particular books, the AI can create customized plans. It can also track your progress, provide daily insights, and adjust plans based on your pace and preferences.",
    category: 'features',
    keywords: ['bible reading plans', 'ai reading plans', 'personalized bible study', 'bible study schedule']
  },
  {
    id: 15,
    question: "How accurate is Bible AI compared to human Bible scholars?",
    answer: "Bible AI achieves approximately 94%+ accuracy when compared to established Biblical commentaries and scholarly sources. However, AI should complement, not replace, human scholarship and pastoral guidance. While AI excels at quickly accessing vast amounts of information and making connections, human scholars bring wisdom, spiritual discernment, and pastoral care that AI cannot provide. We recommend using AI insights alongside traditional study methods and pastoral counsel.",
    category: 'ai',
    keywords: ['bible ai accuracy rate', 'ai vs scholars', 'bible ai reliability', '94 percent accuracy']
  },
  {
    id: 16,
    question: "Can I use Bible Aura for group Bible studies?",
    answer: "Absolutely! Bible Aura is excellent for group Bible studies. You can use the AI to prepare study questions, get background information on passages, explore different interpretations, and find relevant cross-references. The platform can help group leaders prepare engaging discussions and provide instant answers to participant questions. We're also developing specific group study features for sharing notes and collaborative learning.",
    category: 'features',
    keywords: ['group bible study', 'bible study groups', 'collaborative bible study', 'bible study leader tools']
  },
  {
    id: 17,
    question: "What devices can I use Bible Aura on?",
    answer: "Bible Aura works on all modern devices including desktop computers, laptops, tablets, and smartphones. Our web-based platform is responsive and optimizes for your screen size. We also offer a Progressive Web App (PWA) that provides an app-like experience on mobile devices. The platform works on Windows, Mac, iOS, Android, and Linux systems through any modern web browser.",
    category: 'technical',
    keywords: ['bible aura devices', 'mobile bible app', 'bible aura compatibility', 'cross-platform bible']
  },
  {
    id: 18,
    question: "How often is Bible AI updated and improved?",
    answer: "We continuously update and improve Bible AI based on user feedback, new theological resources, and advancing AI technology. Major updates are released quarterly, with smaller improvements and bug fixes deployed regularly. We add new features, expand language support, improve accuracy, and enhance user experience based on community input. Premium users get early access to new features and priority support for feature requests.",
    category: 'platform',
    keywords: ['bible ai updates', 'platform improvements', 'new features', 'bible aura development']
  },
  {
    id: 19,
    question: "Can Bible AI help with original language study (Hebrew/Greek)?",
    answer: "Yes! Bible AI has been trained on Hebrew and Greek texts and can provide insights into original language meanings, word studies, and translation nuances. You can ask about specific Hebrew or Greek words, their meanings in context, and how they're translated across different Bible versions. While not a replacement for formal language study, it's an excellent tool for understanding the richness of the original Biblical languages.",
    category: 'features',
    keywords: ['hebrew greek study', 'original language bible', 'word study ai', 'biblical languages ai']
  },
  {
    id: 20,
    question: "How do I report issues or suggest improvements for Bible Aura?",
    answer: "We welcome your feedback! You can contact us through the Contact page on our website, send an email to bibleaura.contact@gmail.com, or use the feedback feature within the platform. For technical issues, please include details about your device, browser, and the specific problem. For feature suggestions, describe how the feature would improve your Bible study experience. We review all feedback and prioritize improvements based on user needs and Biblical faithfulness.",
    category: 'platform',
    keywords: ['bible aura support', 'report issues', 'feedback bible aura', 'suggest improvements']
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