import { GlobalNavigation } from '@/components/GlobalNavigation';
import Footer from '@/components/Footer';
import { useSEO } from '@/hooks/useSEO';
import { 
  Calendar, 
  ArrowRight,
  Sparkles,
  FileText,
  CheckCircle,
  Target
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function BibleReadingPlanGenerator() {
  useSEO({
    title: "The Best Free Bible Reading Plan Generator: Build Your Plan with Bible Aura",
    description: "Looking for a free Bible reading plan generator? Learn how Bible Aura helps you create a custom Bible reading plan based on your schedule and goals.",
    keywords: "bible reading plan generator, free bible reading plan, custom bible reading plan, bible reading schedule, bible aura reading planner"
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
              The Best Free Bible Reading Plan Generator: Build Your Plan with Bible Aura
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed">
            Many Christians say, "I want to read the whole Bible," but don't know where to start. A good Bible reading plan can turn that desire into a simple, daily habit. Bible Aura offers a free Bible Reading Planner that designs a custom plan just for you.
          </p>
        </div>
      </section>

      {/* Article Content */}
      <article className="pb-20 px-4 md:px-6 lg:px-10">
        <div className="max-w-4xl mx-auto prose prose-lg max-w-none">
          <section className="mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Why You Need a Bible Reading Plan</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Without a plan, Bible reading can feel:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6 ml-4">
              <li>Random</li>
              <li>Inconsistent</li>
              <li>Overwhelming</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mb-4">
              A clear plan:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6 ml-4">
              <li>Tells you exactly what to read each day</li>
              <li>Prevents decision fatigue</li>
              <li>Helps you see long-term progress</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="h-8 w-8 text-orange-500" />
              How Bible Aura's Reading Planner Works
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Bible Aura allows you to set:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6 ml-4">
              <li><strong>Duration</strong> – 30 days, 90 days, 1 year, etc.</li>
              <li><strong>Scope</strong> – Whole Bible, New Testament, Gospels, Psalms, etc.</li>
              <li><strong>Frequency</strong> – How many days per week you can realistically read</li>
              <li><strong>Reading size</strong> – Short, medium, or deep sessions</li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              Based on your preferences, it generates a structured, day-by-day reading schedule.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Example of a Custom Bible Reading Plan</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              If you choose:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6 ml-4">
              <li>New Testament</li>
              <li>90 days</li>
              <li>5 days per week</li>
              <li>Medium reading size</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mb-4">
              Your plan might look like:
            </p>
            <div className="bg-gray-100 rounded-lg p-4 mb-4 font-mono text-sm">
              <p>Day 1: Matthew 1–2</p>
              <p>Day 2: Matthew 3–4</p>
              <p>Day 3: Matthew 5</p>
              <p>… and so on</p>
            </div>
            <p className="text-gray-700 leading-relaxed">
              You can then mark each day as completed as you go.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Target className="h-8 w-8 text-orange-500" />
              Tracking Your Bible Reading Progress
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Bible Aura's planner isn't just a static list. It helps you:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6 ml-4">
              <li>Tick off completed days</li>
              <li>See total progress as a percentage</li>
              <li>Get motivated to continue</li>
              <li>Restart or adjust the plan if life gets busy</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Benefits of a Digital Reading Plan</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Compared to paper plans, a digital planner:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6 ml-4">
              <li>Updates instantly</li>
              <li>Adjusts for missed days</li>
              <li>Works on mobile and desktop</li>
              <li>Can integrate with verse explanations</li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              You can read the scheduled passage, then immediately ask Bible Aura to explain what you just read.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Start Your Free Bible Reading Plan Today</h2>
            <p className="text-gray-700 leading-relaxed">
              If you've been wanting to read the Bible more consistently, Bible Aura's free Bible Reading Planner gives you structure, flexibility, and encouragement — all in one place.
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
              Create Your Custom Reading Plan
            </h2>
            <p className="text-gray-600 mb-6 max-w-xl mx-auto">
              Start your Bible reading journey with a personalized plan that fits your schedule.
            </p>
            <Button
              asChild
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
            >
              <Link to="/auth?redirect=%2Freading-plan">
                Create Reading Plan
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

