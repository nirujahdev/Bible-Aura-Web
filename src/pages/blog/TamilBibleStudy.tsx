import { GlobalNavigation } from '@/components/GlobalNavigation';
import Footer from '@/components/Footer';
import { useSEO } from '@/hooks/useSEO';
import { 
  Languages, 
  ArrowRight,
  Sparkles,
  FileText,
  BookOpen,
  Users,
  CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function TamilBibleStudy() {
  useSEO({
    title: "Tamil Bible Study in 2025: Why Tamil Christians Need AI Bible Tools",
    description: "Discover why Tamil Christians increasingly rely on AI Bible tools like Bible Aura for Tamil Bible verse explanations and study help.",
    keywords: "tamil bible study, tamil bible ai, tamil christian app, tamil bible verse explanation, tamil bible study tool"
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50">
      <GlobalNavigation variant="landing" />
      
      {/* Hero Section */}
      <section className="pt-20 md:pt-28 pb-16 px-4 md:px-6 lg:px-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 text-white mb-8 shadow-xl">
            <FileText className="h-10 w-10" />
          </div>
          
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
            <span className="text-transparent bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text">
              Tamil Bible Study in 2025: Why Tamil Christians Need AI Bible Tools
            </span>
          </h1>
          
          <p className="text-base md:text-lg text-gray-600 mb-8 leading-relaxed max-w-3xl mx-auto">
            Tamil-speaking Christians are spread across Sri Lanka, India, Malaysia, Singapore, and the global diaspora. Many love Scripture deeply, but lack access to rich study tools in their own language. That's where AI Bible tools for Tamil — like Bible Aura — become incredibly valuable.
          </p>
          
          <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
            <span>Bible Aura Team</span>
            <span>•</span>
            <span>2025</span>
            <span>•</span>
            <span>5 min read</span>
          </div>
        </div>
      </section>

      {/* Article Content */}
      <article className="pb-20 px-4 md:px-6 lg:px-10">
        <div className="max-w-3xl mx-auto">
          <section className="mb-16">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">The Challenges of Tamil Bible Study</h2>
            <p className="text-base md:text-lg text-gray-700 leading-relaxed mb-6">
              Many Tamil believers face at least one of these challenges:
            </p>
            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                <span className="text-base text-gray-700">Limited Tamil commentaries and study Bibles</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                <span className="text-base text-gray-700">Fewer theological resources compared to English</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                <span className="text-base text-gray-700">Difficulty understanding older Tamil phrases or complex passages</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                <span className="text-base text-gray-700">Lack of tools for youth and new believers</span>
              </li>
            </ul>
            <p className="text-base md:text-lg text-gray-700 leading-relaxed">
              This can make serious Bible study feel out of reach.
            </p>
          </section>

          <section className="mb-16">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">How AI Can Help Tamil Christians Study the Bible</h2>
            
            <div className="space-y-10">
              <div className="bg-white rounded-xl p-6 md:p-8 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-orange-50">
                    <Languages className="h-6 w-6 text-orange-500" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-semibold text-gray-900">
                    1. Verse Explanations in Tamil
                  </h3>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Ask questions in Tamil and get explanations with verse meaning, biblical context, and connections to other passages.
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 md:p-8 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-orange-50">
                    <BookOpen className="h-6 w-6 text-orange-500" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-semibold text-gray-900">
                    2. Bilingual Study – Tamil + English
                  </h3>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Switch between Tamil and English. Compare explanations and cross-check verses in both languages.
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 md:p-8 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-orange-50">
                    <Users className="h-6 w-6 text-orange-500" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-semibold text-gray-900">
                    3. Help for Pastors and Lay Leaders
                  </h3>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Research cross-references, prepare outlines, and get explanations for complex doctrines to support your ministry.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-16">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Empowering the Next Generation of Tamil Believers</h2>
            <p className="text-base md:text-lg text-gray-700 leading-relaxed mb-6">
              Younger Christians are digital natives. They learn through apps, web tools, and AI.
            </p>
            <p className="text-base md:text-lg text-gray-700 leading-relaxed mb-6">
              A platform like Bible Aura can:
            </p>
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-6 md:p-8 border border-orange-100">
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                  <span className="text-base text-gray-700">Answer questions immediately</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                  <span className="text-base text-gray-700">Support Bible-related research</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                  <span className="text-base text-gray-700">Help youth leaders with quick study preparation</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                  <span className="text-base text-gray-700">Encourage personal Bible reading beyond Sunday services</span>
                </li>
              </ul>
            </div>
          </section>

          <section className="mb-16">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Final Thoughts</h2>
            <p className="text-base md:text-lg text-gray-700 leading-relaxed">
              The Tamil church is growing and vibrant. With AI tools like Bible Aura, Tamil Christians now have better access to understandable, structured Bible study resources that honor Scripture and support discipleship.
            </p>
          </section>
        </div>
      </article>

      {/* CTA Section */}
      <section className="py-12 px-4 md:px-6 lg:px-10 bg-white/50">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-8 md:p-12 border border-orange-100">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-orange-500 text-white mb-4">
              <Sparkles className="h-6 w-6" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
              Start Your Tamil Bible Study Journey
            </h2>
            <p className="text-gray-600 mb-6 max-w-xl mx-auto">
              Experience Bible Aura's Tamil Bible support and AI-powered explanations.
            </p>
            <Button
              asChild
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
            >
              <Link to="/auth?redirect=%2Fdashboard">
                Get Started Free
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

