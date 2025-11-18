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
  Users,
  CheckCircle
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
      <section className="pt-20 md:pt-28 pb-16 px-4 md:px-6 lg:px-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 text-white mb-8 shadow-xl">
            <FileText className="h-10 w-10" />
          </div>
          
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
            <span className="text-transparent bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text">
              AI for Pastors and Bible Teachers: How Bible Aura Helps with Sermon Prep
            </span>
          </h1>
          
          <p className="text-base md:text-lg text-gray-600 mb-8 leading-relaxed max-w-3xl mx-auto">
            Sermon preparation takes time, prayer, and careful study. While AI will never replace the calling of a pastor, tools like Bible Aura can make the research and preparation process faster and more efficient.
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
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">The Reality of Sermon Preparation Today</h2>
            <p className="text-base md:text-lg text-gray-700 leading-relaxed mb-6">
              Many pastors and teachers prepare multiple sermons each week while balancing ministry, family, and other responsibilities. They need quick access to cross-references and background information. That's where AI Bible tools can play a supportive role.
            </p>
          </section>

          <section className="mb-16">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">How Bible Aura Supports Sermon Prep</h2>
            
            <div className="space-y-10">
              <div className="bg-white rounded-xl p-6 md:p-8 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-orange-50">
                    <BookOpen className="h-6 w-6 text-orange-500" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-semibold text-gray-900">
                    1. Fast Verse and Passage Analysis
                  </h3>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Get main ideas, doctrinal emphasis, and related verses quickly. See the theological framework of your message.
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 md:p-8 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-orange-50">
                    <Users className="h-6 w-6 text-orange-500" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-semibold text-gray-900">
                    2. Character and Theme Studies
                  </h3>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Generate structured character profiles or topical outlines for characters like David, Peter, or themes like faith and forgiveness.
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 md:p-8 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-orange-50">
                    <Search className="h-6 w-6 text-orange-500" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-semibold text-gray-900">
                    3. Cross-References and Supporting Texts
                  </h3>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Ask for cross-references or supporting verses. Gather supporting texts in seconds instead of flipping through multiple tools.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-16">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Using AI Responsibly in Ministry</h2>
            <p className="text-base md:text-lg text-gray-700 leading-relaxed mb-6">
              AI is a tool, not a substitute for personal Bible reading, serious exegesis, prayer, or listening to the Holy Spirit. Pastors can use Bible Aura as a starting point, then add their own study, insight, and pastoral application.
            </p>
          </section>

          <section className="mb-16">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Benefits for Small Churches and Bi-Vocational Pastors</h2>
            <p className="text-base md:text-lg text-gray-700 leading-relaxed mb-6">
              For leaders with limited time or resources, Bible Aura:
            </p>
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-6 md:p-8 border border-orange-100">
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                  <span className="text-base text-gray-700">Reduces the research load</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                  <span className="text-base text-gray-700">Offers structure for sermon or study outlines</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                  <span className="text-base text-gray-700">Helps create teaching plans faster</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                  <span className="text-base text-gray-700">Supports both English and Tamil congregations</span>
                </li>
              </ul>
            </div>
          </section>

          <section className="mb-16">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Final Thoughts</h2>
            <p className="text-base md:text-lg text-gray-700 leading-relaxed">
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

