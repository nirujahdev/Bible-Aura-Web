import { GlobalNavigation } from '@/components/GlobalNavigation';
import Footer from '@/components/Footer';
import { useSEO } from '@/hooks/useSEO';
import { 
  BookOpen, 
  Calendar, 
  ArrowRight,
  Sparkles,
  FileText,
  Bot,
  Languages,
  CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function WhatIsBibleAura() {
  useSEO({
    title: "What Is Bible Aura? The Ultimate AI-Powered Bible Study Tool for 2025",
    description: "Bible Aura is an AI-powered Bible study tool that explains verses, creates reading plans, and supports Tamil and English Bible study. Discover how Bible Aura can transform your daily time in Scripture.",
    keywords: "bible aura, ai bible study tool, christian ai app, bible study with ai, bible verse explanation app, tamil bible ai"
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
              What Is Bible Aura? The Ultimate AI-Powered Bible Study Tool for 2025
            </span>
          </h1>
          
          <p className="text-base md:text-lg text-gray-600 mb-8 leading-relaxed max-w-3xl mx-auto">
            Many Christians want to go deeper into the Bible but struggle with time, complexity, or lack of guidance. Bible Aura was created to solve exactly that problem — a clean, modern, AI-powered Bible study companion that helps you understand Scripture quickly and clearly.
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
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">What Is Bible Aura?</h2>
            <p className="text-base md:text-lg text-gray-700 leading-relaxed mb-6">
              Bible Aura is a web-based Bible study platform that uses advanced AI and a structured Bible knowledge system to:
            </p>
            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                <span className="text-base text-gray-700">Explain Bible verses in simple language</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                <span className="text-base text-gray-700">Generate personalized Bible reading plans</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                <span className="text-base text-gray-700">Provide topical studies and character profiles</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                <span className="text-base text-gray-700">Support both English and Tamil Bible readers</span>
              </li>
            </ul>
            <p className="text-base md:text-lg text-gray-700 leading-relaxed">
              It's designed for everyday Christians, students, pastors, and anyone who wants a smarter way to understand God's Word.
            </p>
          </section>

          <section className="mb-16">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">Key Features of Bible Aura</h2>
            
            <div className="space-y-10">
              <div className="bg-white rounded-xl p-6 md:p-8 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-orange-50">
                    <Bot className="h-6 w-6 text-orange-500" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-semibold text-gray-900">
                    1. AI-Powered Verse Explanations
                  </h3>
                </div>
                <p className="text-base text-gray-700 leading-relaxed mb-4">
                  Type a question like "What does Romans 8:28 mean?" and Bible Aura gives you:
                </p>
                <ul className="space-y-2 mb-4">
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 mt-1">•</span>
                    <span className="text-base text-gray-700">Verse text</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 mt-1">•</span>
                    <span className="text-base text-gray-700">Historical and cultural context</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 mt-1">•</span>
                    <span className="text-base text-gray-700">Theological meaning</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 mt-1">•</span>
                    <span className="text-base text-gray-700">Related Bible verses</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 mt-1">•</span>
                    <span className="text-base text-gray-700">A clear, short summary</span>
                  </li>
                </ul>
                <p className="text-base text-gray-700 leading-relaxed">
                  This makes Bible study faster, especially when you're confused by difficult passages.
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 md:p-8 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-orange-50">
                    <BookOpen className="h-6 w-6 text-orange-500" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-semibold text-gray-900">
                    2. Structured Bible Study Modes
                  </h3>
                </div>
                <p className="text-base text-gray-700 leading-relaxed mb-4">
                  Bible Aura doesn't just give random answers. It has study modes such as:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                  <div className="flex items-center gap-2 text-base text-gray-700">
                    <CheckCircle className="h-4 w-4 text-orange-500" />
                    <span>Verse analysis</span>
                  </div>
                  <div className="flex items-center gap-2 text-base text-gray-700">
                    <CheckCircle className="h-4 w-4 text-orange-500" />
                    <span>Parable study</span>
                  </div>
                  <div className="flex items-center gap-2 text-base text-gray-700">
                    <CheckCircle className="h-4 w-4 text-orange-500" />
                    <span>Character study</span>
                  </div>
                  <div className="flex items-center gap-2 text-base text-gray-700">
                    <CheckCircle className="h-4 w-4 text-orange-500" />
                    <span>Topical study</span>
                  </div>
                  <div className="flex items-center gap-2 text-base text-gray-700">
                    <CheckCircle className="h-4 w-4 text-orange-500" />
                    <span>Quick Q&A</span>
                  </div>
                </div>
                <p className="text-base text-gray-700 leading-relaxed">
                  Each mode follows a fixed format, helping you build a consistent Bible study habit.
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 md:p-8 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-orange-50">
                    <Languages className="h-6 w-6 text-orange-500" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-semibold text-gray-900">
                    3. Tamil and English Bible Support
                  </h3>
                </div>
                <p className="text-base text-gray-700 leading-relaxed mb-4">
                  One of the strongest features of Bible Aura is Tamil language support.
                </p>
                <ul className="space-y-2 mb-4">
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 mt-1">•</span>
                    <span className="text-base text-gray-700">Ask questions in Tamil</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 mt-1">•</span>
                    <span className="text-base text-gray-700">Get explanations based on the Tamil Bible</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 mt-1">•</span>
                    <span className="text-base text-gray-700">Switch between Tamil and English as needed</span>
                  </li>
                </ul>
                <p className="text-base text-gray-700 leading-relaxed">
                  This makes Bible Aura especially valuable for Tamil-speaking Christians in Sri Lanka, India, Malaysia, Singapore, and around the world.
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 md:p-8 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-orange-50">
                    <Calendar className="h-6 w-6 text-orange-500" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-semibold text-gray-900">
                    4. Reading Plans and Daily Progress
                  </h3>
                </div>
                <p className="text-base text-gray-700 leading-relaxed mb-4">
                  Bible Aura can generate a custom Bible reading plan based on:
                </p>
                <ul className="space-y-2 mb-4">
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 mt-1">•</span>
                    <span className="text-base text-gray-700">How long you want to read (30, 90, 365 days)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 mt-1">•</span>
                    <span className="text-base text-gray-700">How many days per week</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 mt-1">•</span>
                    <span className="text-base text-gray-700">Which parts of the Bible you want to cover</span>
                  </li>
                </ul>
                <p className="text-base text-gray-700 leading-relaxed">
                  You can then mark days as "read" and track your progress over time.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-16">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Why Use an AI Bible Study Tool?</h2>
            <p className="text-base md:text-lg text-gray-700 leading-relaxed mb-6">
              AI will never replace the Holy Spirit, church, or personal prayer. But it can:
            </p>
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-6 md:p-8 border border-orange-100">
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                  <span className="text-base text-gray-700">Save you time when researching</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                  <span className="text-base text-gray-700">Help you find verses you didn't know</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                  <span className="text-base text-gray-700">Give you a starting point for deeper study</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                  <span className="text-base text-gray-700">Support beginners who feel overwhelmed</span>
                </li>
              </ul>
            </div>
            <p className="text-base md:text-lg text-gray-700 leading-relaxed mt-6">
              For many Christians, Bible Aura acts like a 24/7 Bible study partner.
            </p>
          </section>

          <section className="mb-16">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Who Is Bible Aura For?</h2>
            <p className="text-base md:text-lg text-gray-700 leading-relaxed mb-6">
              Bible Aura is ideal for:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-4 border border-gray-100">
                <p className="text-base text-gray-700">New believers who want simple explanations</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-gray-100">
                <p className="text-base text-gray-700">Busy professionals who need fast, clear answers</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-gray-100">
                <p className="text-base text-gray-700">Students preparing Bible exams or lessons</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-gray-100">
                <p className="text-base text-gray-700">Pastors and teachers doing initial study or research</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-gray-100 md:col-span-2">
                <p className="text-base text-gray-700">Tamil Christians wanting bilingual Bible support</p>
              </div>
            </div>
          </section>

          <section className="mb-16">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Final Thoughts</h2>
            <p className="text-base md:text-lg text-gray-700 leading-relaxed">
              Bible Aura is more than a Bible app — it's a smart Bible assistant that helps you understand Scripture with clarity and structure. If you're looking for a modern, AI-powered Bible study tool in 2025, Bible Aura is an excellent place to start.
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
              Ready to Start Your Bible Study Journey?
            </h2>
            <p className="text-gray-600 mb-6 max-w-xl mx-auto">
              Experience AI-powered Bible insights and deepen your understanding of Scripture.
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
