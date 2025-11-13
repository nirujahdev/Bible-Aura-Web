import { GlobalNavigation } from '@/components/GlobalNavigation';
import Footer from '@/components/Footer';
import { useSEO } from '@/hooks/useSEO';
import { 
  PenTool, 
  ArrowRight,
  Sparkles,
  FileText,
  BookOpen,
  Search,
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function AIForPastors() {
  useSEO({
    title: "AI for Pastors and Bible Teachers: How Bible Aura Helps with Sermon Prep",
    description: "Discover how pastors and Bible teachers can use Bible Aura's AI tools for sermon preparation, Bible research, and teaching outlines without replacing prayer or study.",
    keywords: "ai for pastors, sermon preparation ai, bible study tool for pastors, ai sermon assistant, bible aura for preachers"
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
              AI for Pastors and Bible Teachers: How Bible Aura Helps with Sermon Prep
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed">
            Sermon preparation takes time, prayer, and careful study. While AI will never replace the calling of a pastor, tools like Bible Aura can make the research and preparation process faster and more efficient.
          </p>
        </div>
      </section>

      {/* Article Content */}
      <article className="pb-20 px-4 md:px-6 lg:px-10">
        <div className="max-w-4xl mx-auto prose prose-lg max-w-none">
          <section className="mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">The Reality of Sermon Preparation Today</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Many pastors and teachers:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6 ml-4">
              <li>Prepare multiple sermons or studies each week</li>
              <li>Balance ministry, family, and other responsibilities</li>
              <li>Need quick access to cross-references and background information</li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              That's where AI Bible tools can play a supportive role.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">How Bible Aura Supports Sermon Prep</h2>
            
            <div className="space-y-8">
              <div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <BookOpen className="h-6 w-6 text-orange-500" />
                  1. Fast Verse and Passage Analysis
                </h3>
                <p className="text-gray-700 leading-relaxed mb-3">
                  Type a key text (e.g., "Romans 12:1–2 sermon help") and Bible Aura can:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4 ml-4">
                  <li>Summarize the main idea</li>
                  <li>Provide doctrinal emphasis</li>
                  <li>Suggest related verses</li>
                </ul>
                <p className="text-gray-700 leading-relaxed">
                  This helps you quickly see the theological "frame" of your message.
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Users className="h-6 w-6 text-orange-500" />
                  2. Character and Theme Studies
                </h3>
                <p className="text-gray-700 leading-relaxed mb-3">
                  If you are preaching on:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4 ml-4">
                  <li>David</li>
                  <li>Peter</li>
                  <li>Faith</li>
                  <li>Forgiveness</li>
                </ul>
                <p className="text-gray-700 leading-relaxed">
                  Bible Aura can generate structured character profiles or topical outlines that you can refine and deepen through further study.
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Search className="h-6 w-6 text-orange-500" />
                  3. Cross-References and Supporting Texts
                </h3>
                <p className="text-gray-700 leading-relaxed mb-3">
                  Instead of flipping through multiple tools, you can ask:
                </p>
                <div className="bg-gray-100 rounded-lg p-4 mb-4 font-mono text-sm">
                  <p>"Cross-references for 'love your enemies'"</p>
                  <p>"Verses that support justification by faith"</p>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  Bible Aura helps gather supporting texts in seconds.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Using AI Responsibly in Ministry</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              AI is a tool, not a substitute for:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6 ml-4">
              <li>Personal Bible reading</li>
              <li>Serious exegesis and hermeneutics</li>
              <li>Prayer and dependence on God</li>
              <li>Listening to the Holy Spirit</li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              Pastors can use Bible Aura as a starting point, then add their own study, insight, and pastoral application.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Benefits for Small Churches and Bi-Vocational Pastors</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              For leaders with limited time or resources, Bible Aura:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6 ml-4">
              <li>Reduces the research load</li>
              <li>Offers structure for sermon or study outlines</li>
              <li>Helps create teaching plans faster</li>
              <li>Supports both English and Tamil congregations</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Final Thoughts</h2>
            <p className="text-gray-700 leading-relaxed">
              AI should never write your sermon for you. But a tool like Bible Aura can help you prepare more efficiently, freeing more time for prayer, pastoral care, and personal growth — the things no technology can replace.
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
              Enhance Your Sermon Preparation
            </h2>
            <p className="text-gray-600 mb-6 max-w-xl mx-auto">
              Try Bible Aura's AI tools for faster research and better sermon preparation.
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

