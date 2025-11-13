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
  Heart
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
      <section className="pt-24 md:pt-32 pb-12 px-4 md:px-6 lg:px-10">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 text-white mb-6 shadow-lg">
            <FileText className="h-8 w-8" />
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            <span className="text-transparent bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text">
              How to Use AI to Understand Any Bible Verse (With Bible Aura)
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed">
            Some Bible verses are simple. Others are confusing, controversial, or easy to misunderstand. With tools like Bible Aura, you can quickly get clear, structured explanations without needing a whole shelf of commentaries.
          </p>
          <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
            Here's how to use AI to understand any Bible verse step by step.
          </p>
        </div>
      </section>

      {/* Article Content */}
      <article className="pb-20 px-4 md:px-6 lg:px-10">
        <div className="max-w-4xl mx-auto prose prose-lg max-w-none">
          <section className="mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Search className="h-8 w-8 text-orange-500" />
              Step 1 – Read the Verse in Context
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Before asking AI anything, always:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6 ml-4">
              <li>Read at least a few verses before and after</li>
              <li>Check what chapter you're in</li>
              <li>Notice who is speaking and to whom</li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              Even when using Bible Aura, context remains the foundation of accurate Bible study.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <BookOpen className="h-8 w-8 text-orange-500" />
              Step 2 – Ask Bible Aura for a Verse Analysis
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              In Bible Aura, you can type something like:
            </p>
            <div className="bg-gray-100 rounded-lg p-4 mb-4 font-mono text-sm">
              <p>"Explain Romans 8:28"</p>
              <p>"What does John 3:16 really mean?"</p>
            </div>
            <p className="text-gray-700 leading-relaxed mb-4">
              The Verse Analysis mode will typically give you:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6 ml-4">
              <li>The verse text</li>
              <li>A brief background (author, audience, situation)</li>
              <li>The key theological point</li>
              <li>Supporting verses</li>
              <li>A summary in simple words</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="h-8 w-8 text-orange-500" />
              Step 3 – Check Historical and Cultural Background
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              For many verses, the meaning becomes clearer when you understand:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6 ml-4">
              <li>The time period</li>
              <li>Customs of Israel or the early church</li>
              <li>Why a letter or book was written</li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              Bible Aura helps by including historical context when possible, which is especially useful for letters, prophets, and parables.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Search className="h-8 w-8 text-orange-500" />
              Step 4 – Compare Cross-References
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Good interpretation is Scripture interpreting Scripture.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              You can ask Bible Aura:
            </p>
            <div className="bg-gray-100 rounded-lg p-4 mb-4 font-mono text-sm">
              <p>"Show related verses to Romans 8:28"</p>
              <p>"Cross-references for faith and suffering"</p>
            </div>
            <p className="text-gray-700 leading-relaxed mb-4">
              Then you can:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6 ml-4">
              <li>See patterns across different books</li>
              <li>Check if your understanding is consistent with the Bible as a whole</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Lightbulb className="h-8 w-8 text-orange-500" />
              Step 5 – Ask About Application
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Many people stop at head knowledge. AI can help with practical application too.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              Try questions like:
            </p>
            <div className="bg-gray-100 rounded-lg p-4 mb-4 font-mono text-sm">
              <p>"How does this verse apply to anxiety?"</p>
              <p>"What does this verse mean for my daily life?"</p>
            </div>
            <p className="text-gray-700 leading-relaxed">
              Bible Aura can show how a verse relates to topics like trust, forgiveness, hope, or obedience — always pointing back to Scripture.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Heart className="h-8 w-8 text-orange-500" />
              Step 6 – Pray and Reflect
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              AI can explain words on a screen. Only God can transform the heart.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              After studying a verse with Bible Aura:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6 ml-4">
              <li>Pray about what you learned</li>
              <li>Ask God to show you how to live it</li>
              <li>Write down one simple action step</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Why AI Is a Helpful Bible Study Partner</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              AI is not a replacement for pastors, spiritual mentors, or the Holy Spirit. But as a tool, it:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6 ml-4">
              <li>Speeds up research</li>
              <li>Reduces confusion</li>
              <li>Helps beginners get started</li>
              <li>Supports deeper exploration of difficult passages</li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
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

