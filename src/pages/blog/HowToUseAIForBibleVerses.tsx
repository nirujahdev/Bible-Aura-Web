import { GlobalNavigation } from '@/components/GlobalNavigation';
import Footer from '@/components/Footer';
import { useSEO } from '@/hooks/useSEO';
import { 
  BookOpen, 
  ArrowRight,
  Sparkles,
  FileText,
  Search,
  Lightbulb,
  Heart,
  CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function HowToUseAIForBibleVerses() {
  useSEO({
    title: "How to Use AI to Understand Any Bible Verse (With Bible Aura)",
    description: "Learn how to use AI tools like Bible Aura to understand any Bible verse. Step-by-step guide for verse explanation, context, cross-references, and real-life application.",
    keywords: "understand bible verse, ai bible verse explanation, explain bible verses with ai, bible aura verse analysis, how to study the bible with ai"
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
              How to Use AI to Understand Any Bible Verse (With Bible Aura)
            </span>
          </h1>
          
          <p className="text-base md:text-lg text-gray-600 mb-8 leading-relaxed max-w-3xl mx-auto">
            Some Bible verses are simple. Others are confusing, controversial, or easy to misunderstand. With tools like Bible Aura, you can quickly get clear, structured explanations without needing a whole shelf of commentaries.
          </p>
          
          <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
            <span>Bible Aura Team</span>
            <span>•</span>
            <span>2025</span>
            <span>•</span>
            <span>6 min read</span>
          </div>
        </div>
      </section>

      {/* Article Content */}
      <article className="pb-20 px-4 md:px-6 lg:px-10">
        <div className="max-w-3xl mx-auto">
          <section className="mb-16">
            <div className="bg-white rounded-xl p-6 md:p-8 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-orange-50">
                  <Search className="h-6 w-6 text-orange-500" />
                </div>
                <h2 className="text-xl md:text-2xl font-semibold text-gray-900">
                  Step 1 – Read the Verse in Context
                </h2>
              </div>
              <p className="text-base text-gray-700 leading-relaxed mb-4">
                Before asking AI anything, always:
              </p>
              <ul className="space-y-2 mb-4">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                  <span className="text-base text-gray-700">Read at least a few verses before and after</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                  <span className="text-base text-gray-700">Check what chapter you're in</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                  <span className="text-base text-gray-700">Notice who is speaking and to whom</span>
                </li>
              </ul>
              <p className="text-base text-gray-700 leading-relaxed">
                Even when using Bible Aura, context remains the foundation of accurate Bible study.
              </p>
            </div>
          </section>

          <section className="mb-16">
            <div className="bg-white rounded-xl p-6 md:p-8 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-orange-50">
                  <BookOpen className="h-6 w-6 text-orange-500" />
                </div>
                <h2 className="text-xl md:text-2xl font-semibold text-gray-900">
                  Step 2 – Ask Bible Aura for a Verse Analysis
                </h2>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                Ask questions like "Explain Romans 8:28" and get verse text, background, theological meaning, supporting verses, and a clear summary.
              </p>
            </div>
          </section>

          <section className="mb-16">
            <div className="bg-white rounded-xl p-6 md:p-8 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-orange-50">
                  <FileText className="h-6 w-6 text-orange-500" />
                </div>
                <h2 className="text-xl md:text-2xl font-semibold text-gray-900">
                  Step 3 – Check Historical and Cultural Background
                </h2>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                Understand the time period, customs, and context. Bible Aura includes historical background for letters, prophets, and parables.
              </p>
            </div>
          </section>

          <section className="mb-16">
            <div className="bg-white rounded-xl p-6 md:p-8 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-orange-50">
                  <Search className="h-6 w-6 text-orange-500" />
                </div>
                <h2 className="text-xl md:text-2xl font-semibold text-gray-900">
                  Step 4 – Compare Cross-References
                </h2>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                Ask for related verses or cross-references. See patterns across books and verify your understanding is consistent with Scripture.
              </p>
            </div>
          </section>

          <section className="mb-16">
            <div className="bg-white rounded-xl p-6 md:p-8 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-orange-50">
                  <Lightbulb className="h-6 w-6 text-orange-500" />
                </div>
                <h2 className="text-xl md:text-2xl font-semibold text-gray-900">
                  Step 5 – Ask About Application
                </h2>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                Ask how verses apply to daily life. Bible Aura shows connections to topics like trust, forgiveness, hope, or obedience — always pointing back to Scripture.
              </p>
            </div>
          </section>

          <section className="mb-16">
            <div className="bg-white rounded-xl p-6 md:p-8 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-orange-50">
                  <Heart className="h-6 w-6 text-orange-500" />
                </div>
                <h2 className="text-xl md:text-2xl font-semibold text-gray-900">
                  Step 6 – Pray and Reflect
                </h2>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                AI can explain words, but only God transforms hearts. After studying, pray, ask God for guidance, and write down one action step.
              </p>
            </div>
          </section>

          <section className="mb-16">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Why AI Is a Helpful Bible Study Partner</h2>
            <p className="text-base md:text-lg text-gray-700 leading-relaxed mb-6">
              AI is not a replacement for pastors or the Holy Spirit. But as a tool, it:
            </p>
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-6 md:p-8 border border-orange-100">
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                  <span className="text-base text-gray-700">Speeds up research</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                  <span className="text-base text-gray-700">Reduces confusion</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                  <span className="text-base text-gray-700">Helps beginners get started</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                  <span className="text-base text-gray-700">Supports deeper exploration of difficult passages</span>
                </li>
              </ul>
            </div>
            <p className="text-base md:text-lg text-gray-700 leading-relaxed mt-6">
              If used wisely, Bible Aura can become a powerful aid in your daily Bible reading.
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
              Start Understanding Scripture Better Today
            </h2>
            <p className="text-gray-600 mb-6 max-w-xl mx-auto">
              Try Bible Aura's AI-powered verse analysis and see how it can enhance your Bible study.
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

