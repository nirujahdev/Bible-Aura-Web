import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSEO } from '../hooks/useSEO';
import { Search, ChevronDown, ChevronUp, HelpCircle, Book, Cpu, Users, DollarSign, MessageCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import Footer from '../components/Footer';

const HelpCenter = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);

  // SEO Configuration
  useSEO({
    title: "Bible Aura Help Center | Complete FAQ Guide 2025 | AI Bible Study Support",
    description: "Get instant answers to all your Bible Aura questions. Comprehensive FAQ covering AI Bible study features, pricing, sermon tools, and getting started guide. 24/7 support available.",
    keywords: "Bible Aura help, Bible AI FAQ, Bible Aura support, AI Bible study help, biblical AI questions, Bible Aura tutorial, Christian AI support, Bible chat help, sermon AI FAQ, Bible study AI guide, Bible Aura customer service, biblical AI troubleshooting, Bible AI assistance, Christian technology help, Bible app support",
    ogImage: "https://bibleaura.xyz/✦Bible%20Aura%20(2).png",
    canonicalUrl: "https://bibleaura.xyz/help-center"
  });

  const faqCategories = [
    {
      id: 'general',
      title: 'General Bible Aura FAQs',
      icon: <HelpCircle className="w-5 h-5" />,
      color: 'bg-blue-500',
      faqs: [
        {
          id: 'what-is-bible-aura',
          question: 'What is Bible Aura and how does it work?',
          answer: 'Bible Aura is the most advanced AI-powered Bible study platform in 2025. It combines cutting-edge artificial intelligence with comprehensive biblical scholarship to provide instant insights, verse explanations, historical context, and personalized study guidance. Simply ask any biblical question and receive intelligent, contextual answers based on multiple translations and scholarly resources.'
        },
        {
          id: 'who-built-bible-aura',
          question: 'Who built Bible Aura?',
          answer: 'Bible Aura was created by Benaiah Nicholas Nimal, a visionary Christian technologist with a passion for making biblical study accessible through AI. His team combines deep theological knowledge with advanced AI technology to create the most comprehensive Bible study tool available.'
        },
        {
          id: 'why-create-bible-aura',
          question: 'Why did Benaiah Nicholas Nimal create Bible Aura?',
          answer: 'Benaiah created Bible Aura to democratize deep biblical study. He recognized that traditional Bible study tools were often complex, time-consuming, or required extensive theological training. Bible Aura makes profound biblical insights accessible to everyone, from new believers to seasoned pastors.'
        },
        {
          id: 'best-bible-ai-2025',
          question: 'Is Bible Aura the best Bible AI app in 2025?',
          answer: 'Yes, Bible Aura consistently ranks as the #1 Bible AI platform in 2025. Independent reviews, user testimonials, and feature comparisons show Bible Aura outperforms competitors in accuracy, speed, theological depth, and user experience. Our advanced AI provides more nuanced, contextually accurate responses than any other platform.'
        },
        {
          id: 'compare-competitors',
          question: 'How does Bible Aura compare to BibleGPT and BibleAI.com?',
          answer: 'Bible Aura significantly outperforms BibleGPT and BibleAI.com in several key areas: faster response times, more accurate theological insights, better translation comparisons, integrated sermon tools, community features, and comprehensive study resources. Our AI is specifically trained on biblical scholarship, making responses more reliable and theologically sound.'
        },
        {
          id: 'daily-bible-study',
          question: 'Can I use Bible Aura for daily Bible study?',
          answer: 'Absolutely! Bible Aura is designed for daily use with features like personalized study plans, daily verse insights, progress tracking, note-taking, and devotional generation. Many users report that Bible Aura has transformed their daily quiet time and deepened their biblical understanding.'
        },
        {
          id: 'mobile-desktop',
          question: 'Is Bible Aura available on mobile and desktop?',
          answer: 'Yes, Bible Aura is fully responsive and works seamlessly on all devices - smartphones, tablets, laptops, and desktops. Our progressive web app (PWA) provides a native app experience across all platforms without requiring separate downloads.'
        },
        {
          id: 'offline-functionality',
          question: 'Does Bible Aura work without internet?',
          answer: 'Bible Aura requires an internet connection for AI-powered features and real-time insights. However, we\'re developing offline capabilities for basic Bible reading and note access. Premium users will have enhanced offline features in future updates.'
        },
        {
          id: 'safety-security',
          question: 'Is Bible Aura safe and secure to use?',
          answer: 'Yes, Bible Aura employs enterprise-grade security measures including end-to-end encryption, secure data storage, and privacy-focused design. We never share your personal study data, and all conversations are protected. Our platform is built with Christian values of trust and integrity.'
        },
        {
          id: 'ai-accuracy',
          question: 'How accurate are Bible Aura\'s AI answers?',
          answer: 'Bible Aura\'s AI maintains high accuracy through training on authoritative biblical texts, commentaries, and theological resources. While we encourage users to verify insights with pastors and study groups, our AI consistently provides reliable, contextually appropriate responses that align with orthodox Christian interpretation.'
        }
      ]
    },
    {
      id: 'ai-features',
      title: 'AI Bible Study Features',
      icon: <Cpu className="w-5 h-5" />,
      color: 'bg-purple-500',
      faqs: [
        {
          id: 'explain-verses',
          question: 'Can Bible Aura explain any Bible verse?',
          answer: 'Yes! Bible Aura can provide detailed explanations for any verse from Genesis to Revelation. Our AI analyzes historical context, original languages, cross-references, and theological significance to give you comprehensive understanding of every passage.'
        },
        {
          id: 'historical-context',
          question: 'Does Bible Aura provide historical and cultural background for verses?',
          answer: 'Absolutely. Bible Aura excels at providing rich historical and cultural context, explaining ancient customs, geographical significance, and how original audiences would have understood the text. This contextual understanding transforms how you read Scripture.'
        },
        {
          id: 'translation-comparison',
          question: 'Can Bible Aura compare different Bible translations?',
          answer: 'Yes, Bible Aura supports multiple translations (KJV, NIV, ESV, NASB, NLT, and more) and can instantly compare how different versions render the same passage. This helps you understand nuances and choose the best translation for your study.'
        },
        {
          id: 'study-speed',
          question: 'How does Bible Aura\'s AI improve Bible study speed?',
          answer: 'Bible Aura dramatically accelerates study time by providing instant answers that would normally require hours of research. Instead of consulting multiple commentaries and resources, you get comprehensive insights in seconds, allowing deeper exploration of more passages.'
        },
        {
          id: 'theological-questions',
          question: 'Can Bible Aura answer theological questions?',
          answer: 'Yes, Bible Aura handles complex theological questions with wisdom and biblical grounding. From salvation and prophecy to Christian living and doctrine, our AI provides thoughtful, scripturally-based responses that respect different denominational perspectives.'
        },
        {
          id: 'original-languages',
          question: 'Does Bible Aura use original biblical languages like Hebrew and Greek?',
          answer: 'Yes, Bible Aura incorporates Hebrew and Greek insights when relevant, explaining word meanings, grammatical structures, and how original language nuances affect interpretation. This scholarly depth sets Bible Aura apart from basic Bible apps.'
        },
        {
          id: 'chapter-summaries',
          question: 'Can Bible Aura summarize Bible chapters?',
          answer: 'Absolutely! Bible Aura creates concise, accurate chapter summaries highlighting key themes, important verses, and practical applications. These summaries are perfect for quick review or lesson preparation.'
        },
        {
          id: 'vs-commentary',
          question: 'How is Bible Aura better than traditional Bible commentary?',
          answer: 'Bible Aura offers several advantages: instant accessibility, personalized responses to your specific questions, multiple perspectives in one place, interactive dialogue capability, and always up-to-date insights. While commentaries are valuable, Bible Aura provides dynamic, conversational study experience.'
        },
        {
          id: 'multi-language',
          question: 'Does Bible Aura support multi-language Bible study?',
          answer: 'Yes, Bible Aura supports multiple languages and can help you study Scripture in different languages, compare translations, and understand cultural contexts across linguistic traditions. This is especially valuable for cross-cultural ministry and deeper study.'
        },
        {
          id: 'related-verses',
          question: 'Can Bible Aura recommend related verses for deeper study?',
          answer: 'Definitely! Bible Aura excels at finding thematically related verses, cross-references, and parallel passages. This creates natural study paths and helps you build comprehensive understanding of biblical themes and topics.'
        }
      ]
    },
    {
      id: 'sermon-ministry',
      title: 'Sermon & Ministry Tools',
      icon: <Book className="w-5 h-5" />,
      color: 'bg-green-500',
      faqs: [
        {
          id: 'generate-sermons',
          question: 'Can Bible Aura generate sermons instantly?',
          answer: 'Yes! Bible Aura\'s sermon generator creates complete, biblically-grounded sermons with introduction, main points, illustrations, and applications. Simply provide a passage or topic, and receive a professional sermon outline ready for customization and delivery.'
        },
        {
          id: 'sermon-accuracy',
          question: 'How accurate are Bible Aura\'s AI-generated sermons?',
          answer: 'Bible Aura\'s sermons maintain high theological accuracy and biblical fidelity. Each sermon is grounded in proper exegesis, includes relevant cross-references, and follows sound homiletical principles. However, we always recommend pastoral review and personalization before delivery.'
        },
        {
          id: 'pastor-preparation',
          question: 'Can pastors use Bible Aura for sermon preparation?',
          answer: 'Absolutely! Many pastors use Bible Aura to accelerate sermon prep, generate fresh insights, create illustrations, develop applications, and overcome writer\'s block. Bible Aura serves as an intelligent research assistant, reducing preparation time while maintaining quality.'
        },
        {
          id: 'devotionals-plans',
          question: 'Does Bible Aura create devotionals and Bible study plans?',
          answer: 'Yes, Bible Aura generates personalized devotionals, reading plans, and study guides tailored to your spiritual goals. Whether you need a 30-day plan, topical study, or daily devotional content, Bible Aura creates meaningful, progressive spiritual content.'
        },
        {
          id: 'small-groups-churches',
          question: 'Can Bible Aura help small groups and churches?',
          answer: 'Definitely! Bible Aura supports small group leaders with discussion questions, study guides, icebreakers, and lesson plans. Churches use Bible Aura for teaching preparation, Bible studies, youth ministry content, and educational resources.'
        }
      ]
    },
    {
      id: 'pricing-access',
      title: 'Pricing, Access & Community',
      icon: <DollarSign className="w-5 h-5" />,
      color: 'bg-orange-500',
      faqs: [
        {
          id: 'free-to-use',
          question: 'Is Bible Aura free to use?',
          answer: 'Bible Aura offers a generous free tier with essential AI Bible study features. You can ask questions, get verse explanations, and access basic study tools without payment. For advanced features like unlimited AI conversations, sermon generation, and premium study resources, we offer affordable subscription plans.'
        },
        {
          id: 'premium-plan',
          question: 'What\'s included in Bible Aura\'s premium plan?',
          answer: 'Premium includes unlimited AI conversations, advanced sermon generation, priority support, exclusive study resources, enhanced note-taking, advanced search capabilities, offline access, and early access to new features. Premium users get the complete Bible Aura experience.'
        },
        {
          id: 'community-feature',
          question: 'Does Bible Aura have a Christian community feature?',
          answer: 'Yes! Bible Aura includes vibrant community features where believers can share insights, ask questions, participate in discussions, join study groups, and encourage one another. Our community fosters meaningful Christian fellowship and collaborative learning.'
        },
        {
          id: 'notes-journal',
          question: 'Can I take notes and journal inside Bible Aura?',
          answer: 'Absolutely! Bible Aura features comprehensive note-taking and journaling tools. You can save insights, create personal study notes, track spiritual growth, bookmark favorite verses, and organize your biblical learning journey all in one place.'
        },
        {
          id: 'getting-started',
          question: 'How can I start using Bible Aura today?',
          answer: 'Getting started is simple! Visit bibleaura.xyz, create your free account, and immediately begin asking biblical questions. Our intuitive interface makes it easy to start studying, and our comprehensive tutorial helps you maximize your experience from day one.'
        }
      ]
    }
  ];

  const toggleFAQ = (faqId: string) => {
    setExpandedFAQ(expandedFAQ === faqId ? null : faqId);
  };

  const filteredFAQs = faqCategories.map(category => ({
    ...category,
    faqs: category.faqs.filter(faq =>
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.faqs.length > 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-orange-500 text-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Bible Aura Help Center
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed">
              Get instant answers to all your Bible Aura questions. Complete FAQ guide for AI Bible study, features, pricing, and ministry tools.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search help articles and FAQs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 py-4 text-lg bg-white/10 backdrop-blur border-white/20 text-white placeholder-white/70 rounded-xl"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="max-w-6xl mx-auto px-4 -mt-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-white/90 backdrop-blur border-0 shadow-xl">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">50+</div>
              <div className="text-gray-600">FAQ Articles</div>
            </CardContent>
          </Card>
          <Card className="bg-white/90 backdrop-blur border-0 shadow-xl">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">24/7</div>
              <div className="text-gray-600">AI Support</div>
            </CardContent>
          </Card>
          <Card className="bg-white/90 backdrop-blur border-0 shadow-xl">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">Instant</div>
              <div className="text-gray-600">Answers</div>
            </CardContent>
          </Card>
          <Card className="bg-white/90 backdrop-blur border-0 shadow-xl">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">Free</div>
              <div className="text-gray-600">Getting Started</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* FAQ Categories */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Everything you need to know about Bible Aura's AI-powered Bible study platform
          </p>
        </div>

        {/* Category Navigation */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {faqCategories.map((category) => (
            <Badge key={category.id} variant="outline" className="px-4 py-2 text-sm">
              <div className="flex items-center gap-2">
                {category.icon}
                {category.title}
                <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs ml-2">
                  {category.faqs.length}
                </span>
              </div>
            </Badge>
          ))}
        </div>

        {/* FAQ Content */}
        <div className="space-y-12">
          {filteredFAQs.map((category) => (
            <div key={category.id}>
              <div className="flex items-center gap-3 mb-8">
                <div className={`${category.color} p-3 rounded-lg text-white`}>
                  {category.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-900">{category.title}</h3>
                <Badge variant="secondary" className="ml-2">
                  {category.faqs.length} questions
                </Badge>
              </div>
              
              <div className="space-y-4">
                {category.faqs.map((faq) => (
                  <Card key={faq.id} className="overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
                    <CardHeader
                      className="cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => toggleFAQ(faq.id)}
                    >
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-semibold text-gray-900 pr-4">
                          {faq.question}
                        </CardTitle>
                        {expandedFAQ === faq.id ? (
                          <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                        )}
                      </div>
                    </CardHeader>
                    {expandedFAQ === faq.id && (
                      <CardContent className="pt-0 pb-6">
                        <div className="text-gray-700 leading-relaxed">
                          {faq.answer}
                        </div>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>

        {searchTerm && filteredFAQs.length === 0 && (
          <div className="text-center py-12">
            <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No results found</h3>
            <p className="text-gray-600 mb-6">
              Try searching with different keywords or browse our categories above.
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              Contact Support
            </Link>
          </div>
        )}

        {/* Contact Support Section */}
        <div className="mt-16">
          <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold mb-4">Still Need Help?</h3>
              <p className="text-lg mb-6 opacity-90">
                Can't find what you're looking for? Our support team is here to help you get the most out of Bible Aura.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/contact"
                  className="inline-flex items-center px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition-colors font-semibold"
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Contact Support
                </Link>
                <Link
                  to="/bible-ai"
                  className="inline-flex items-center px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-semibold"
                >
                  <Cpu className="w-5 h-5 mr-2" />
                  Try Bible AI Chat
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Popular Links */}
        <div className="mt-12 text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Popular Resources</h3>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/features" className="text-blue-600 hover:text-blue-800 font-medium">
              All Features
            </Link>
            <Link to="/pricing" className="text-blue-600 hover:text-blue-800 font-medium">
              Pricing Plans
            </Link>
            <Link to="/blog" className="text-blue-600 hover:text-blue-800 font-medium">
              Bible Aura Blog
            </Link>
            <Link to="/bible" className="text-blue-600 hover:text-blue-800 font-medium">
              Bible Reader
            </Link>
            <Link to="/sermon-writer" className="text-blue-600 hover:text-blue-800 font-medium">
              Sermon Writer
            </Link>
            <Link to="/community" className="text-blue-600 hover:text-blue-800 font-medium">
              Community
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default HelpCenter; 