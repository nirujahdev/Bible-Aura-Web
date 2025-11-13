import { GlobalNavigation } from '@/components/GlobalNavigation';
import Footer from '@/components/Footer';
import { useSEO } from '@/hooks/useSEO';
import { 
  BookOpen, 
  Calendar, 
  User, 
  ArrowRight,
  Sparkles,
  FileText,
  Bot,
  Languages
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
      <section className="pt-24 md:pt-32 pb-12 px-4 md:px-6 lg:px-10">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 text-white mb-6 shadow-lg">
            <FileText className="h-8 w-8" />
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            <span className="text-transparent bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text">
              What Is Bible Aura? The Ultimate AI-Powered Bible Study Tool for 2025
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed">
            Many Christians want to go deeper into the Bible but struggle with time, complexity, or lack of guidance. Bible Aura was created to solve exactly that problem — a clean, modern, AI-powered Bible study companion that helps you understand Scripture quickly and clearly.
          </p>
        </div>
      </section>

      {/* Article Content */}
      <article className="pb-20 px-4 md:px-6 lg:px-10">
        <div className="max-w-4xl mx-auto prose prose-lg max-w-none">
          <section className="mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">What Is Bible Aura?</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Bible Aura is a web-based Bible study platform that uses advanced AI and a structured Bible knowledge system to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6 ml-4">
              <li>Explain Bible verses in simple language</li>
              <li>Generate personalized Bible reading plans</li>
              <li>Provide topical studies and character profiles</li>
              <li>Support both English and Tamil Bible readers</li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              It's designed for everyday Christians, students, pastors, and anyone who wants a smarter way to understand God's Word.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Key Features of Bible Aura</h2>
            
            <div className="space-y-8">
              <div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Bot className="h-6 w-6 text-orange-500" />
                  1. AI-Powered Verse Explanations
                </h3>
                <p className="text-gray-700 leading-relaxed mb-3">
                  Type a question like "What does Romans 8:28 mean?" and Bible Aura gives you:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4 ml-4">
                  <li>Verse text</li>
                  <li>Historical and cultural context</li>
                  <li>Theological meaning</li>
                  <li>Related Bible verses</li>
                  <li>A clear, short summary</li>
                </ul>
                <p className="text-gray-700 leading-relaxed">
                  This makes Bible study faster, especially when you're confused by difficult passages.
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <BookOpen className="h-6 w-6 text-orange-500" />
                  2. Structured Bible Study Modes
                </h3>
                <p className="text-gray-700 leading-relaxed mb-3">
                  Bible Aura doesn't just give random answers. It has study modes such as:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4 ml-4">
                  <li>Verse analysis</li>
                  <li>Parable study</li>
                  <li>Character study</li>
                  <li>Topical study</li>
                  <li>Quick Q&A</li>
                </ul>
                <p className="text-gray-700 leading-relaxed">
                  Each mode follows a fixed format, helping you build a consistent Bible study habit.
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Languages className="h-6 w-6 text-orange-500" />
                  3. Tamil and English Bible Support
                </h3>
                <p className="text-gray-700 leading-relaxed mb-3">
                  One of the strongest features of Bible Aura is Tamil language support.
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4 ml-4">
                  <li>Ask questions in Tamil</li>
                  <li>Get explanations based on the Tamil Bible</li>
                  <li>Switch between Tamil and English as needed</li>
                </ul>
                <p className="text-gray-700 leading-relaxed">
                  This makes Bible Aura especially valuable for Tamil-speaking Christians in Sri Lanka, India, Malaysia, Singapore, and around the world.
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Calendar className="h-6 w-6 text-orange-500" />
                  4. Reading Plans and Daily Progress
                </h3>
                <p className="text-gray-700 leading-relaxed mb-3">
                  Bible Aura can generate a custom Bible reading plan based on:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4 ml-4">
                  <li>How long you want to read (30, 90, 365 days)</li>
                  <li>How many days per week</li>
                  <li>Which parts of the Bible you want to cover</li>
                </ul>
                <p className="text-gray-700 leading-relaxed">
                  You can then mark days as "read" and track your progress over time.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Why Use an AI Bible Study Tool?</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              AI will never replace the Holy Spirit, church, or personal prayer. But it can:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6 ml-4">
              <li>Save you time when researching</li>
              <li>Help you find verses you didn't know</li>
              <li>Give you a starting point for deeper study</li>
              <li>Support beginners who feel overwhelmed</li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              For many Christians, Bible Aura acts like a 24/7 Bible study partner.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Who Is Bible Aura For?</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Bible Aura is ideal for:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6 ml-4">
              <li>New believers who want simple explanations</li>
              <li>Busy professionals who need fast, clear answers</li>
              <li>Students preparing Bible exams or lessons</li>
              <li>Pastors and teachers doing initial study or research</li>
              <li>Tamil Christians wanting bilingual Bible support</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Final Thoughts</h2>
            <p className="text-gray-700 leading-relaxed">
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

