import { GlobalNavigation } from '@/components/GlobalNavigation';
import Footer from '@/components/Footer';
import { useSEO } from '@/hooks/useSEO';
import { 
  Calendar, 
  ArrowRight,
  Sparkles,
  FileText,
  CheckCircle,
  Target,
  BookOpen
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
      <section className="pt-20 md:pt-28 pb-16 px-4 md:px-6 lg:px-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 text-white mb-8 shadow-xl">
            <FileText className="h-10 w-10" />
          </div>
          
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
            <span className="text-transparent bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text">
              The Best Free Bible Reading Plan Generator: Build Your Plan with Bible Aura
            </span>
          </h1>
          
          <p className="text-base md:text-lg text-gray-600 mb-8 leading-relaxed max-w-3xl mx-auto">
            Many Christians say, "I want to read the whole Bible," but don't know where to start. A good Bible reading plan can turn that desire into a simple, daily habit. Bible Aura offers a free Bible Reading Planner that designs a custom plan just for you.
          </p>
          
          <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
            <span>Bible Aura Team</span>
            <span>•</span>
            <span>2025</span>
            <span>•</span>
            <span>4 min read</span>
          </div>
        </div>
      </section>

      {/* Article Content */}
      <article className="pb-20 px-4 md:px-6 lg:px-10">
        <div className="max-w-3xl mx-auto">
          <section className="mb-16">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Why You Need a Bible Reading Plan</h2>
            <p className="text-base md:text-lg text-gray-700 leading-relaxed mb-6">
              Without a plan, Bible reading can feel random, inconsistent, or overwhelming. A clear plan tells you exactly what to read each day, prevents decision fatigue, and helps you see long-term progress.
            </p>
          </section>

          <section className="mb-16">
            <div className="bg-white rounded-xl p-6 md:p-8 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-orange-50">
                  <Calendar className="h-6 w-6 text-orange-500" />
                </div>
                <h2 className="text-xl md:text-2xl font-semibold text-gray-900">
                  How Bible Aura's Reading Planner Works
                </h2>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                Set duration (30, 90, 365 days), scope (Whole Bible, New Testament, etc.), frequency, and reading size. Get a structured, day-by-day reading schedule.
              </p>
            </div>
          </section>

          <section className="mb-16">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Example of a Custom Bible Reading Plan</h2>
            <p className="text-base md:text-lg text-gray-700 leading-relaxed mb-4">
              Choose New Testament, 90 days, 5 days per week, medium reading size. Your plan will include daily readings like "Day 1: Matthew 1–2", "Day 2: Matthew 3–4", and so on. Mark each day as completed as you progress.
            </p>
          </section>

          <section className="mb-16">
            <div className="bg-white rounded-xl p-6 md:p-8 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-orange-50">
                  <Target className="h-6 w-6 text-orange-500" />
                </div>
                <h2 className="text-xl md:text-2xl font-semibold text-gray-900">
                  Tracking Your Bible Reading Progress
                </h2>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                Track completed days, see progress percentage, and adjust your plan as needed. Works on mobile and desktop.
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
                  Benefits of a Digital Reading Plan
                </h2>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                Updates instantly, adjusts for missed days, and integrates with verse explanations. Read the scheduled passage, then ask Bible Aura to explain what you just read.
              </p>
            </div>
          </section>

          <section className="mb-16">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Start Your Free Bible Reading Plan Today</h2>
            <p className="text-base md:text-lg text-gray-700 leading-relaxed">
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

