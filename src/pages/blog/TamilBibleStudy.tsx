import { GlobalNavigation } from '@/components/GlobalNavigation';
import Footer from '@/components/Footer';
import { useSEO } from '@/hooks/useSEO';
import { 
  Languages, 
  ArrowRight,
  Sparkles,
  FileText,
  BookOpen,
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function TamilBibleStudy() {
  useSEO({
    title: "Tamil Bible Study in 2025: Why Tamil Christians Need AI Bible Tools",
    description: "Discover why Tamil Christians increasingly rely on AI Bible tools like Bible Aura for Tamil Bible verse explanations, study help, and spiritual growth.",
    keywords: "tamil bible study, tamil bible ai, tamil christian app, tamil bible verse explanation, tamil bible study tool"
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50">
      <GlobalNavigation variant="landing" />
      
      {/* Hero Section */}
      <section className="pt-24 md:pt-32 pb-12 px-4 md:px-6 lg:px-10">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 text-white mb-6 shadow-lg">
            <FileText className="h-8 w-8" />
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            <span className="text-transparent bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text">
              Tamil Bible Study in 2025: Why Tamil Christians Need AI Bible Tools
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed">
            Tamil-speaking Christians are spread across Sri Lanka, India, Malaysia, Singapore, and the global diaspora. Many love Scripture deeply, but lack access to rich study tools in their own language. That's where AI Bible tools for Tamil — like Bible Aura — become incredibly valuable.
          </p>
        </div>
      </section>

      {/* Article Content */}
      <article className="pb-20 px-4 md:px-6 lg:px-10">
        <div className="max-w-4xl mx-auto prose prose-lg max-w-none">
          <section className="mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">The Challenges of Tamil Bible Study</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Many Tamil believers face at least one of these challenges:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6 ml-4">
              <li>Limited Tamil commentaries and study Bibles</li>
              <li>Fewer theological resources compared to English</li>
              <li>Difficulty understanding older Tamil phrases or complex passages</li>
              <li>Lack of tools for youth and new believers</li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              This can make serious Bible study feel out of reach.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">How AI Can Help Tamil Christians Study the Bible</h2>
            
            <div className="space-y-8">
              <div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Languages className="h-6 w-6 text-orange-500" />
                  1. Verse Explanations in Tamil
                </h3>
                <p className="text-gray-700 leading-relaxed mb-3">
                  With Bible Aura, Tamil users can ask:
                </p>
                <div className="bg-gray-100 rounded-lg p-4 mb-4 font-mono text-sm">
                  <p>"யோவான் 3:16 அர்த்தம் என்ன?"</p>
                  <p>"ரோமர் 8:28 என்ன சொல்கிறது?"</p>
                </div>
                <p className="text-gray-700 leading-relaxed mb-3">
                  The system can respond in Tamil, explaining:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4 ml-4">
                  <li>Meaning of the verse</li>
                  <li>What God is promising or teaching</li>
                  <li>How it connects to other parts of the Bible</li>
                </ul>
              </div>

              <div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <BookOpen className="h-6 w-6 text-orange-500" />
                  2. Bilingual Study – Tamil + English
                </h3>
                <p className="text-gray-700 leading-relaxed mb-3">
                  Many Tamil Christians are comfortable with both Tamil and English.
                </p>
                <p className="text-gray-700 leading-relaxed mb-3">
                  Bible Aura makes it easy to:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4 ml-4">
                  <li>Ask a question in Tamil</li>
                  <li>Compare explanations with English</li>
                  <li>Cross-check verses in both languages</li>
                </ul>
                <p className="text-gray-700 leading-relaxed">
                  This approach is great for families, youth groups, and mixed-language churches.
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Users className="h-6 w-6 text-orange-500" />
                  3. Help for Pastors and Lay Leaders
                </h3>
                <p className="text-gray-700 leading-relaxed mb-3">
                  Pastors, cell group leaders, and youth workers can use AI to:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4 ml-4">
                  <li>Prepare message outlines</li>
                  <li>Look up cross-references</li>
                  <li>Generate simple explanations for complex doctrines</li>
                </ul>
                <p className="text-gray-700 leading-relaxed">
                  AI doesn't replace prayer, calling, or preaching — it simply reduces the research workload.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Empowering the Next Generation of Tamil Believers</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Younger Christians are digital natives. They learn through apps, web tools, and AI.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              A platform like Bible Aura can:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6 ml-4">
              <li>Answer questions immediately</li>
              <li>Support Bible-related doubts</li>
              <li>Help youth leaders with quick study preparation</li>
              <li>Encourage personal Bible reading beyond Sunday services</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Final Thoughts</h2>
            <p className="text-gray-700 leading-relaxed">
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

