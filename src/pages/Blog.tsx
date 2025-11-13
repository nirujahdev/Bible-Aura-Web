import { GlobalNavigation } from '@/components/GlobalNavigation';
import Footer from '@/components/Footer';
import { useSEO, SEO_CONFIG } from '@/hooks/useSEO';
import { 
  BookOpen, 
  Calendar, 
  User, 
  ArrowRight,
  Sparkles,
  FileText
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const blogPosts = [
  {
    id: 1,
    title: "What Is Bible Aura? The Ultimate AI-Powered Bible Study Tool for 2025",
    excerpt: "Many Christians want to go deeper into the Bible but struggle with time, complexity, or lack of guidance. Bible Aura was created to solve exactly that problem — a clean, modern, AI-powered Bible study companion that helps you understand Scripture quickly and clearly.",
    date: "2025",
    author: "Bible Aura Team",
    category: "Guide",
    slug: "what-is-bible-aura-ai-bible-study-tool",
    readTime: "5 min read"
  },
  {
    id: 2,
    title: "How to Use AI to Understand Any Bible Verse (With Bible Aura)",
    excerpt: "Some Bible verses are simple. Others are confusing, controversial, or easy to misunderstand. With tools like Bible Aura, you can quickly get clear, structured explanations without needing a whole shelf of commentaries.",
    date: "2025",
    author: "Bible Aura Team",
    category: "Tutorial",
    slug: "how-to-use-ai-to-understand-any-bible-verse",
    readTime: "6 min read"
  },
  {
    id: 3,
    title: "Tamil Bible Study in 2025: Why Tamil Christians Need AI Bible Tools",
    excerpt: "Tamil-speaking Christians are spread across Sri Lanka, India, Malaysia, Singapore, and the global diaspora. Many love Scripture deeply, but lack access to rich study tools in their own language. That's where AI Bible tools for Tamil — like Bible Aura — become incredibly valuable.",
    date: "2025",
    author: "Bible Aura Team",
    category: "Resources",
    slug: "tamil-bible-study-ai-tools",
    readTime: "5 min read"
  },
  {
    id: 4,
    title: "The Best Free Bible Reading Plan Generator: Build Your Plan with Bible Aura",
    excerpt: "Many Christians say, \"I want to read the whole Bible,\" but don't know where to start. A good Bible reading plan can turn that desire into a simple, daily habit. Bible Aura offers a free Bible Reading Planner that designs a custom plan just for you.",
    date: "2025",
    author: "Bible Aura Team",
    category: "Tutorial",
    slug: "free-bible-reading-plan-generator",
    readTime: "4 min read"
  },
  {
    id: 5,
    title: "AI for Pastors and Bible Teachers: How Bible Aura Helps with Sermon Prep",
    excerpt: "Sermon preparation takes time, prayer, and careful study. While AI will never replace the calling of a pastor, tools like Bible Aura can make the research and preparation process faster and more efficient.",
    date: "2025",
    author: "Bible Aura Team",
    category: "Guide",
    slug: "ai-for-pastors-sermon-prep-bible-aura",
    readTime: "6 min read"
  }
];

export default function Blog() {
  useSEO({
    title: "Blog - Bible Aura | Biblical Insights & Resources",
    description: "Read articles, devotionals, and biblical insights from Bible Aura. Learn about Bible study, faith, and spiritual growth.",
    keywords: "Bible blog, biblical insights, devotionals, Bible study articles, Christian resources"
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50">
      <GlobalNavigation variant="landing" />
      
      {/* Hero Section */}
      <section className="pt-24 md:pt-32 pb-12 px-4 md:px-6 lg:px-10">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 text-white mb-6 shadow-lg">
            <FileText className="h-8 w-8" />
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
            <span className="text-transparent bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text">
              Bible Aura Blog
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Discover biblical insights, study guides, and resources to deepen your faith journey.
          </p>
        </div>
      </section>

      {/* Blog Posts Section */}
      <section className="pb-20 px-4 md:px-6 lg:px-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogPosts.map((post) => (
              <Card
                key={post.id}
                className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 group"
              >
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
                      {post.category}
                    </span>
                    <span className="text-xs text-gray-500">{post.readTime}</span>
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors line-clamp-2">
                    {post.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4 line-clamp-3 text-sm leading-relaxed">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      <span>{post.author}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{post.date}</span>
                    </div>
                  </div>
                  <Button
                    asChild
                    variant="outline"
                    className="w-full group-hover:bg-orange-50 group-hover:border-orange-300 group-hover:text-orange-600 transition-colors"
                  >
                    <Link to={`/blog/${post.slug}`}>
                      Read More
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 px-4 md:px-6 lg:px-10 bg-white/50">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-8 md:p-12 border border-orange-100">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-orange-500 text-white mb-4">
              <Sparkles className="h-6 w-6" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
              Start Your Bible Study Journey
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
