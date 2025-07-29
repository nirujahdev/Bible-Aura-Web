import { Link } from "react-router-dom";
import { GlobalNavigation } from "@/components/GlobalNavigation";
import { 
  Palette, 
  Code, 
  Server, 
  Brain, 
  PenTool, 
  BarChart3, 
  BookOpen, 
  Share2,
  Mail,
  MapPin,
  Clock,
  Globe,
  Cross,
  Laptop,
  Users,
  Target
} from "lucide-react";

const Careers = () => {
  // Email template function
  const createEmailLink = (role: string, roleType: string) => {
    const subject = `Application for ${role} - Bible Aura Volunteer`;
    const body = `Hello Bible Aura Team,

I am interested in volunteering as a ${role} for Bible Aura.

About me:
- Name: [Your Name]
- Background: [Brief background in ${roleType}]
- Why I want to help: [Your motivation for joining Bible Aura's mission]
- Experience: [Relevant experience or skills]
- Available time: [How much time you can dedicate]

I'm excited about the opportunity to serve God through technology and help bring His Word to life for believers worldwide.

Looking forward to hearing from you!

Best regards,
[Your Name]
[Your Contact Info]`;

    return `mailto:bibleaura.contact@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const roles = [
    {
      id: 1,
      title: "Visual Designer",
      icon: Palette,
      type: "Design",
      color: "from-pink-400 via-pink-500 to-rose-600",
      bgColor: "bg-pink-50",
      borderColor: "border-pink-200",
      hoverBg: "group-hover:bg-pink-50",
      textColor: "text-pink-700",
      iconBg: "bg-pink-500",
      description: "Create beautiful graphics for newsletters, social media, and the Bible Aura platform.",
      responsibilities: [
        "Design social media posts, devotionals, and product visuals",
        "Work on documents, banners, and UI previews", 
        "Help shape a spiritually themed visual identity"
      ],
      tools: ["Figma", "Canva", "Photoshop (or any design tool)"]
    },
    {
      id: 2,
      title: "Frontend Developer",
      icon: Code,
      type: "Development", 
      color: "from-blue-400 via-blue-500 to-indigo-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      hoverBg: "group-hover:bg-blue-50",
      textColor: "text-blue-700",
      iconBg: "bg-blue-500",
      description: "Build the visual side of Bible Aura using modern web tools.",
      responsibilities: [
        "Create pages and UI with React, Vite, and TypeScript",
        "Style using Tailwind and component libraries",
        "Collaborate with designers and backend team"
      ],
      tools: ["React 18", "TypeScript", "Vite", "Tailwind CSS", "Shadcn/UI"]
    },
    {
      id: 3,
      title: "Backend Developer",
      icon: Server,
      type: "Development",
      color: "from-green-400 via-green-500 to-emerald-600", 
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      hoverBg: "group-hover:bg-green-50",
      textColor: "text-green-700",
      iconBg: "bg-green-500",
      description: "Work on our server logic and Bible data systems.",
      responsibilities: [
        "Create secure APIs for features like bookmarks & journaling",
        "Manage Bible data and user profiles",
        "Handle authentication and permissions"
      ],
      tools: ["Supabase", "PostgreSQL", "Node.js", "RLS Policies"]
    },
    {
      id: 4,
      title: "AI Engineer", 
      icon: Brain,
      type: "AI/Technology",
      color: "from-purple-400 via-purple-500 to-violet-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200", 
      hoverBg: "group-hover:bg-purple-50",
      textColor: "text-purple-700",
      iconBg: "bg-purple-500",
      description: "Train and manage AI for Bible understanding.",
      responsibilities: [
        "Connect and configure AI models via OpenRouter API",
        "Create biblical prompts and user-context chains", 
        "Tune responses for theological accuracy"
      ],
      tools: ["OpenRouter API", "JSON", "Prompt Engineering", "TypeScript"]
    },
    {
      id: 5,
      title: "Content Writer",
      icon: PenTool,
      type: "Content",
      color: "from-orange-400 via-orange-500 to-red-600",
      bgColor: "bg-orange-50", 
      borderColor: "border-orange-200",
      hoverBg: "group-hover:bg-orange-50",
      textColor: "text-orange-700",
      iconBg: "bg-orange-500",
      description: "Write devotionals, study prompts, and AI training text.",
      responsibilities: [
        "Create spiritual content for users and AI learning",
        "Collaborate with theology and tech teams",
        "Assist in social posts, newsletter copy, and user guides"
      ],
      tools: ["Google Docs", "Markdown", "Bible study tools"]
    },
    {
      id: 6,
      title: "Data Analyst",
      icon: BarChart3,
      type: "Analytics",
      color: "from-teal-400 via-teal-500 to-cyan-600",
      bgColor: "bg-teal-50",
      borderColor: "border-teal-200",
      hoverBg: "group-hover:bg-teal-50", 
      textColor: "text-teal-700",
      iconBg: "bg-teal-500",
      description: "Make sense of usage patterns and AI performance.",
      responsibilities: [
        "Track how users interact with features",
        "Help improve prompt results and Bible verse suggestions",
        "Generate internal reports from Supabase data"
      ],
      tools: ["Supabase SQL", "JSON", "Google Sheets", "Data Studio"]
    },
    {
      id: 7,
      title: "Theological Consultant",
      icon: BookOpen,
      type: "Theology",
      color: "from-amber-400 via-amber-500 to-yellow-600",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-200",
      hoverBg: "group-hover:bg-amber-50",
      textColor: "text-amber-700", 
      iconBg: "bg-amber-500",
      description: "Ensure biblical accuracy and doctrinal soundness.",
      responsibilities: [
        "Review and fact-check AI content",
        "Support prompt and content teams with theology insights",
        "Recommend improvements for biblical integrity"
      ],
      tools: ["Your Bible knowledge", "Commentaries", "Concordances"]
    },
    {
      id: 8,
      title: "Social Media & Marketing Specialist",
      icon: Share2,
      type: "Marketing",
      color: "from-rose-400 via-rose-500 to-pink-600",
      bgColor: "bg-rose-50",
      borderColor: "border-rose-200",
      hoverBg: "group-hover:bg-rose-50",
      textColor: "text-rose-700",
      iconBg: "bg-rose-500", 
      description: "Share Bible Aura with the world.",
      responsibilities: [
        "Plan social posts and graphics",
        "Manage communication across platforms",
        "Write outreach messages for believers & churches"
      ],
      tools: ["Instagram", "Threads", "Canva", "Buffer", "Google Docs"]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
      {/* Global Navigation */}
      <GlobalNavigation variant="landing" />
      
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 via-orange-700 to-red-600 text-white">
        <div className="w-full px-6 py-16 pt-32 text-center">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold">
              ✦ Bible Aura – Volunteer Careers
            </h1>
            <div className="flex items-center justify-center space-x-6 text-lg">
              <div className="flex items-center space-x-2">
                <Globe className="h-5 w-5" />
                <span>Remote</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>Flexible Hours</span>
              </div>
              <div className="flex items-center space-x-2">
                <Cross className="h-5 w-5" />
                <span>Faith-Driven Mission</span>
              </div>
            </div>
            <p className="text-xl opacity-90 max-w-3xl mx-auto">
              Join our mission to bring the Word of God alive through technology and design.
            </p>
          </div>
        </div>
      </div>

      {/* Contact Info */}
      <div className="bg-white border-b border-gray-200">
        <div className="w-full px-6 py-8">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-2 text-lg">
              <Mail className="h-5 w-5 text-orange-600" />
              <span className="font-semibold">To apply: Click "Apply" under any role to email us with a pre-filled message.</span>
            </div>
            <p className="text-gray-600">
              Email: <a href="mailto:bibleaura.contact@gmail.com" className="text-orange-600 hover:underline font-medium">bibleaura.contact@gmail.com</a>
            </p>
          </div>
        </div>
      </div>

      {/* Why Join Section */}
              <div className="w-full px-6 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Why Join Bible Aura?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <Globe className="h-8 w-8 text-orange-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">100% Remote & Flexible Hours</h3>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <Cross className="h-8 w-8 text-orange-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Serve God through design, tech, and content</h3>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <Laptop className="h-8 w-8 text-orange-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Learn and grow in a mission-focused, open-source team</h3>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <Users className="h-8 w-8 text-orange-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Collaborate with Christians from around the world</h3>
            </div>
          </div>
        </div>

        {/* Roles Section */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Open Volunteer Roles</h2>
        </div>

        {/* Roles Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {roles.map((role) => {
            const IconComponent = role.icon;
            return (
              <div key={role.id} className="group">
                <div className={`relative ${role.bgColor} rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-500 border ${role.borderColor} h-full flex flex-col`}>
                  
                  {/* Header */}
                  <div className="text-center mb-6">
                    <div className={`relative inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${role.color} rounded-2xl shadow-lg group-hover:scale-110 transition-all duration-500 mb-4`}>
                      <IconComponent className="h-8 w-8 text-white" />
                    </div>
                    
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {role.id}. {role.title}
                    </h3>
                    <p className="text-gray-600 mb-2">{role.description}</p>
                    <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-4 w-4" />
                        <span>Remote</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>Flexible</span>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 space-y-6">
                    {/* Responsibilities */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">You'll Do</h4>
                      <ul className="space-y-2">
                        {role.responsibilities.map((resp, index) => (
                          <li key={index} className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                            <span className="text-gray-700 text-sm">{resp}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Tools */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">
                        {role.id <= 4 ? "Tech Stack" : "Tools"}
                      </h4>
                      <div className="flex flex-wrap gap-3">
                        {role.tools.map((tool, index) => (
                          <span key={index} className={`px-4 py-2 bg-gradient-to-r ${role.color} text-white rounded-2xl text-sm font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105`}>
                            {tool}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Apply Button */}
                  <div className="mt-8">
                    <a 
                      href={createEmailLink(role.title, role.type)}
                      className={`block w-full text-center bg-gradient-to-r ${role.color} text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105`}
                    >
                      Apply Now
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-orange-100 to-amber-100 rounded-2xl p-8 border-2 border-orange-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to Join Our Mission?</h3>
            <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
              Bible Aura is an open-source project that combines Scripture and AI to help believers understand the Bible more deeply. 
              We welcome people of all experience levels, especially Tamil or Sinhala speakers.
            </p>
            <p className="text-lg font-semibold text-orange-700">
              No deadlines, no pressure — just purpose.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-black text-white py-16">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
            {/* Brand Section */}
            <div className="text-center md:text-left">
              <h3 className="text-2xl font-bold text-orange-400 mb-3">
                ✦Bible Aura
              </h3>
              <p className="text-gray-400 text-base">
                AI-Powered Biblical Insight
              </p>
            </div>
            
            {/* Menu Section */}
            <div className="text-center md:text-left">
              <h4 className="text-xl font-semibold text-white mb-6">Menu</h4>
              <nav className="space-y-3">
                <Link to="/about" className="block text-gray-400 hover:text-orange-400 transition-colors duration-300">
                  About
                </Link>
                <Link to="/careers" className="block text-gray-400 hover:text-orange-400 transition-colors duration-300">
                  Careers
                </Link>
                <Link to="/dashboard" className="block text-gray-400 hover:text-orange-400 transition-colors duration-300">
                  Dashboard
                </Link>
                <Link to="/auth" className="block text-gray-400 hover:text-orange-400 transition-colors duration-300">
                  Sign In
                </Link>
              </nav>
            </div>
            
            {/* Contact Section */}
            <div className="text-center md:text-left">
              <h4 className="text-xl font-semibold text-white mb-6">Contact</h4>
              <div className="space-y-3">
                <p className="text-gray-400">@bible_aura.ai</p>
                <a 
                  href="mailto:bibleaura.contact@gmail.com" 
                  className="block text-gray-400 hover:text-orange-400 transition-colors duration-300"
                >
                  bibleaura.contact@gmail.com
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="border-t border-gray-800 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left text-gray-400">
              <div>
                <Link to="/terms" className="hover:text-orange-400 transition-colors duration-300 text-sm">
                  Terms of Use
                </Link>
                <span className="mx-2">|</span>
                <Link to="/privacy" className="hover:text-orange-400 transition-colors duration-300 text-sm">
                  Privacy Policy
                </Link>
              </div>
              
              <div className="text-sm">
                {/* Mobile/Tablet: Two lines */}
                <div className="lg:hidden">
                  <div className="mb-2">
                    <span>&copy; 2024 ✦Bible Aura. All rights reserved.</span>
                  </div>
                  <div>
                    <span>Developed by </span>
                    <a 
                      href="https://www.instagram.com/benaiah_4?igsh=cGZuYmI2YWw0d25r" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-orange-400 hover:text-orange-300 transition-colors duration-300 underline"
                    >
                      Benaiah Nicholas Nimal
                    </a>
                  </div>
                </div>
                
                {/* Desktop/Laptop: One line */}
                <div className="hidden lg:block">
                  <span>&copy; 2024 ✦Bible Aura. All rights reserved. Developed by </span>
                  <a 
                    href="https://www.instagram.com/benaiah_4?igsh=cGZuYmI2YWw0d25r" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-orange-400 hover:text-orange-300 transition-colors duration-300 underline"
                  >
                    Benaiah Nicholas Nimal
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Careers; 