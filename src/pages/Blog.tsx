import { Button } from "@/components/ui/button";
import { GlobalNavigation } from "@/components/GlobalNavigation";
import { Link } from "react-router-dom";

export default function Blog() {
  return (
    <div className="min-h-screen bg-white">
      {/* Global Navigation */}
      <GlobalNavigation variant="landing" />

      {/* Simple Hero Section */}
      <div className="py-20 px-4 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">
          Bible Aura Blog
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Insights and guidance for your spiritual journey
        </p>
        
        {/* Simple Blog Posts */}
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-xl font-bold mb-3">How AI Transforms Bible Study</h3>
            <p className="text-gray-600 mb-4">
              Discover how AI-powered insights can deepen your understanding of Scripture and enhance your spiritual growth.
            </p>
            <Button asChild variant="outline">
              <Link to="/blog/how-ai-transforms-bible-study">Read More</Link>
            </Button>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-xl font-bold mb-3">Bible Study AI Benefits</h3>
            <p className="text-gray-600 mb-4">
              Learn about the practical benefits of using AI tools for Bible study and spiritual reflection.
            </p>
            <Button asChild variant="outline">
              <Link to="/blog/bible-study-ai-benefits">Read More</Link>
            </Button>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-xl font-bold mb-3">AI Bible Insights Accuracy</h3>
            <p className="text-gray-600 mb-4">
              Understanding how AI ensures accurate and theologically sound biblical interpretations.
            </p>
            <Button asChild variant="outline">
              <Link to="/blog/ai-bible-insights-accuracy">Read More</Link>
            </Button>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-xl font-bold mb-3">Bible AI vs Traditional Study</h3>
            <p className="text-gray-600 mb-4">
              Comparing AI-enhanced Bible study with traditional methods and finding the best approach.
            </p>
            <Button asChild variant="outline">
              <Link to="/blog/bible-ai-vs-traditional-study">Read More</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 