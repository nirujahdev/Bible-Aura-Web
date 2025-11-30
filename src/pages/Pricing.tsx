import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GlobalNavigation } from "@/components/GlobalNavigation";
import Footer from "@/components/Footer";
import { useSEO, SEO_CONFIG } from "@/hooks/useSEO";
import { 
  Check, 
  Sparkles, 
  Zap, 
  Crown, 
  ArrowRight,
  HelpCircle,
  Mail,
  ChevronDown,
  ChevronUp,
  Building2
} from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const pricingTiers = [
  {
    name: "Free Forever",
    price: "$0",
    priceAnnual: "$0",
    period: "Forever",
    periodAnnual: "Forever",
    description: "Perfect for getting started with Bible study",
    features: [
      "20 AI queries per day",
      "1 research notebook",
      "Basic Bible search (multiple versions)",
      "Simple verse commentary lookup",
      "Limited chat history",
      "Standard AI responses",
      "Tamil & English support",
      "Reading plans",
      "Favorites & bookmarks",
      "Community support"
    ],
    cta: "Start Free",
    ctaLink: "/auth",
    popular: false,
    color: "from-gray-500 to-gray-600",
    bgColor: "bg-gray-50",
    borderColor: "border-gray-200",
    annualSavings: null
  },
  {
    name: "Starter Study Plan",
    price: "$12.99",
    priceAnnual: "$140",
    period: "per month",
    periodAnnual: "per year",
    description: "For serious Bible students and small-group leaders",
    features: [
      "100 AI messages per day",
      "Up to 3 research notebooks",
      "AI-powered research summaries",
      "Export to PDF/CSV",
      "Priority query processing",
      "Full chat history",
      "Standard AI quality",
      "Advanced verse analysis",
      "Topical & character studies",
      "Advanced search & filters"
    ],
    cta: "Start Starter Plan",
    ctaLink: "/auth",
    popular: true,
    color: "from-orange-500 to-orange-600",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
    annualSavings: "$16"
  },
  {
    name: "Pro Research Plan",
    price: "$50.00",
    priceAnnual: "$480",
    period: "per month",
    periodAnnual: "per year",
    description: "For pastors, theologians, and power users",
    features: [
      "Unlimited AI queries",
      "Unlimited research notebooks",
      "Premium AI quality responses",
      "Advanced original-language tools (Hebrew/Greek parsing)",
      "Full export formats (PDF, CSV, DOCX)",
      "Fastest processing priority",
      "Cross-reference chain analysis",
      "Research Lab access",
      "Priority support",
      "Early access to new features"
    ],
    cta: "Start Pro Plan",
    ctaLink: "/auth",
    popular: false,
    color: "from-purple-500 to-indigo-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    annualSavings: "$120"
  },
  {
    name: "Enterprise/Ministry",
    price: "Custom",
    priceAnnual: "Custom",
    period: "Contact Sales",
    periodAnnual: "Contact Sales",
    description: "For churches, seminaries, and large organizations",
    features: [
      "All Pro Plan features",
      "Private AI models trained on your data",
      "Bulk query allowances (organization-wide)",
      "Dedicated support team",
      "API integration",
      "Custom datasets & branding",
      "Campus-wide or denomination-wide use",
      "Custom AI training on organization content",
      "SLA guarantees",
      "White-label options"
    ],
    cta: "Contact Sales",
    ctaLink: "mailto:contact@bibleaura.xyz",
    popular: false,
    color: "from-blue-500 to-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    annualSavings: null
  }
];

const pricingFAQs = [
  {
    question: "What happens when I exceed my daily query limit?",
    answer: "Free users (20/day) and Starter users (100/day) will see a friendly message when they reach their limit, with an option to upgrade. Your limit resets daily at midnight UTC. Pro users have unlimited queries."
  },
  {
    question: "What's the difference between standard and premium AI quality?",
    answer: "Standard AI quality provides accurate, reliable responses for most Bible study needs. Premium AI quality offers deeper analysis, more nuanced theological insights, and better handling of complex questions. Both are biblically accurate and use verified sources."
  },
  {
    question: "Do you offer annual billing discounts?",
    answer: "Yes! Save 15-20% when you pay annually. Starter Plan: $140/year (save $16 vs monthly). Pro Plan: $480/year (save $120 vs monthly). Annual billing locks in your rate and provides the best value."
  },
  {
    question: "Can I cancel anytime?",
    answer: "Absolutely. Cancel your subscription anytime with no cancellation fees or penalties. You'll keep access to paid features until the end of your billing period."
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards, debit cards, and PayPal. For Enterprise plans, we can arrange invoicing and other payment methods."
  },
  {
    question: "Do you offer discounts for students, pastors, or ministries?",
    answer: "Yes! Contact us at contact@bibleaura.xyz for special pricing for students, pastors, churches, seminaries, and registered non-profit organizations. We offer discounts to make Bible study tools accessible to everyone."
  },
  {
    question: "What happens if I upgrade or downgrade my plan?",
    answer: "Upgrades take effect immediately. When downgrading, you'll keep access to higher-tier features until the end of your current billing period, then transition to your new plan's features. Prorated refunds are available for annual plans."
  },
  {
    question: "Is there a free trial for paid plans?",
    answer: "Yes! You can try Starter or Pro features free for 7 days. No credit card required. Start with the Free plan and upgrade when you're ready to unlock more features."
  },
  {
    question: "Do you offer local pricing for developing countries?",
    answer: "We're committed to making Bible study accessible globally. Contact us at contact@bibleaura.xyz to discuss local pricing options, payment in local currencies, or scholarship programs for your region."
  },
  {
    question: "What's included in Enterprise/Ministry plans?",
    answer: "Enterprise plans include all Pro features plus private AI models trained on your organization's content, bulk user licenses, dedicated support, API access, custom branding, and SLA guarantees. Perfect for churches, seminaries, and large ministries."
  },
  {
    question: "Is my payment information secure?",
    answer: "Yes. We use industry-standard encryption (SSL/TLS) and never store your full payment details on our servers. All payments are processed through secure, PCI-compliant payment processors."
  },
  {
    question: "Can I switch between monthly and annual billing?",
    answer: "Yes! You can switch your billing period at any time. When switching to annual, you'll get a prorated credit. When switching to monthly, you'll be charged the monthly rate going forward."
  }
];

export default function Pricing() {
  useSEO({
    title: "Pricing - Bible Aura | Choose Your Plan",
    description: "Choose the perfect plan for your Bible study needs. Free forever plan available, or upgrade to Starter ($12.99/mo) or Pro ($50/mo) for advanced features. Annual billing saves 15-20%.",
    keywords: "Bible Aura pricing, Bible study app cost, AI Bible tool pricing, premium Bible study features, Bible study subscription"
  });

  const [openFaqItems, setOpenFaqItems] = useState<Set<number>>(new Set());
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50">
      <GlobalNavigation variant="landing" />
      
      {/* Hero Section */}
      <section className="pt-24 md:pt-32 pb-12 px-4 md:px-6 lg:px-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 text-white mb-6 shadow-lg">
            <Sparkles className="h-8 w-8" />
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
            <span className="text-transparent bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text">
              Simple, Transparent Pricing
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Choose the plan that's right for you. Start free, upgrade anytime.
          </p>
        </div>
      </section>

      {/* Billing Period Toggle */}
      <section className="py-8 px-4 md:px-6 lg:px-10">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center gap-4 mb-8">
            <span className={cn(
              "text-sm font-medium transition-colors",
              billingPeriod === 'monthly' ? "text-gray-900" : "text-gray-500"
            )}>Monthly</span>
            <button
              onClick={() => setBillingPeriod(billingPeriod === 'monthly' ? 'annual' : 'monthly')}
              className={cn(
                "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                billingPeriod === 'annual' ? "bg-orange-500" : "bg-gray-300"
              )}
            >
              <span
                className={cn(
                  "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                  billingPeriod === 'annual' ? "translate-x-6" : "translate-x-1"
                )}
              />
            </button>
            <span className={cn(
              "text-sm font-medium transition-colors",
              billingPeriod === 'annual' ? "text-gray-900" : "text-gray-500"
            )}>
              Annual
              <span className="ml-2 text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
                Save 15-20%
              </span>
            </span>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-12 px-4 md:px-6 lg:px-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {pricingTiers.map((tier) => (
              <Card
                key={tier.name}
                className={cn(
                  "relative border-2 transition-all duration-300 hover:shadow-2xl",
                  tier.popular
                    ? "border-orange-300 shadow-xl scale-105"
                    : "border-gray-200 shadow-lg"
                )}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                      <Crown className="h-4 w-4" />
                      Most Popular
                    </span>
                  </div>
                )}
                
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                    {tier.name}
                  </CardTitle>
                  <div className="flex flex-col items-center gap-1 mb-2">
                    <div className="flex items-baseline justify-center gap-2">
                      <span className="text-4xl md:text-5xl font-bold text-gray-900">
                        {billingPeriod === 'annual' && tier.priceAnnual !== 'Custom' ? tier.priceAnnual : tier.price}
                      </span>
                      {tier.price !== 'Custom' && (
                        <span className="text-gray-600">
                          {billingPeriod === 'annual' ? tier.periodAnnual : tier.period}
                        </span>
                      )}
                    </div>
                    {billingPeriod === 'annual' && tier.annualSavings && (
                      <span className="text-sm text-green-600 font-medium">
                        Save {tier.annualSavings}/year
                      </span>
                    )}
                    {billingPeriod === 'monthly' && tier.price !== 'Custom' && tier.price !== '$0' && (
                      <span className="text-xs text-gray-500">
                        or {tier.priceAnnual}/year
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 text-sm">{tier.description}</p>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  <ul className="space-y-3">
                    {tier.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <Check className={cn(
                          "h-5 w-5 flex-shrink-0 mt-0.5",
                          tier.popular ? "text-orange-500" : "text-gray-400"
                        )} />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  {tier.name === "Enterprise/Ministry" ? (
                    <Button
                      asChild
                      size="lg"
                      variant="outline"
                      className="w-full border-2 border-blue-500 text-blue-600 hover:bg-blue-50"
                    >
                      <a href={tier.ctaLink}>
                        <Building2 className="h-4 w-4 mr-2" />
                        {tier.cta}
                      </a>
                    </Button>
                  ) : (
                    <Button
                      asChild
                      size="lg"
                      className={cn(
                        "w-full",
                        tier.popular
                          ? "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
                          : tier.name === "Pro Research Plan"
                          ? "bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white"
                          : "bg-gray-900 hover:bg-gray-800 text-white"
                      )}
                    >
                      <Link to={tier.ctaLink}>
                        {tier.cta}
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Comparison */}
      <section className="py-16 px-4 md:px-6 lg:px-10 bg-white/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
            Compare Plans
          </h2>
          
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Feature</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Free</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-orange-600">Starter</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-purple-600">Pro</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-blue-600">Enterprise</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-700 font-medium">AI Queries per Day</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600">20</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-900 font-medium">100</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-900 font-medium">Unlimited</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-900 font-medium">Unlimited</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-700 font-medium">Research Notebooks</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600">1</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-900 font-medium">3</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-900 font-medium">Unlimited</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-900 font-medium">Unlimited</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-700 font-medium">AI Quality</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600">Standard</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-900 font-medium">Standard</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-900 font-medium">Premium</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-900 font-medium">Premium + Custom</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-700 font-medium">Verse Explanations</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600">✓ Basic</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-900 font-medium">✓ Advanced</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-900 font-medium">✓ Advanced</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-900 font-medium">✓ Advanced</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-700 font-medium">Export Formats</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600">—</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-900 font-medium">PDF, CSV</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-900 font-medium">All Formats</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-900 font-medium">All Formats</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-700 font-medium">Research Lab</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600">—</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600">—</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-900 font-medium">✓</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-900 font-medium">✓</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-700 font-medium">Original Language Tools</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600">—</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600">—</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-900 font-medium">✓ Hebrew/Greek</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-900 font-medium">✓ Hebrew/Greek</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-700 font-medium">Processing Priority</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600">Standard</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-900 font-medium">Priority</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-900 font-medium">Fastest</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-900 font-medium">Fastest</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-700 font-medium">Chat History</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600">Limited</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-900 font-medium">Full</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-900 font-medium">Full</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-900 font-medium">Full</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-700 font-medium">Support</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600">Community</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600">Email</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-900 font-medium">Priority</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-900 font-medium">Dedicated</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-700 font-medium">Custom AI Training</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600">—</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600">—</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600">—</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-900 font-medium">✓</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-700 font-medium">API Access</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600">—</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600">—</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600">—</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-900 font-medium">✓</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 md:px-6 lg:px-10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-orange-100 text-orange-600 mb-4">
              <HelpCircle className="h-6 w-6" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Pricing Questions?
            </h2>
            <p className="text-gray-600">
              Find answers to common pricing questions
            </p>
          </div>

          <div className="space-y-4">
            {pricingFAQs.map((faq, index) => {
              const isOpen = openFaqItems.has(index);
              return (
                <div
                  key={index}
                  className={cn(
                    "bg-white rounded-xl border border-gray-200 shadow-sm transition-all duration-200",
                    isOpen && "shadow-md border-orange-200"
                  )}
                >
                  <button
                    onClick={() => {
                      const newOpenItems = new Set(openFaqItems);
                      if (newOpenItems.has(index)) {
                        newOpenItems.delete(index);
                      } else {
                        newOpenItems.add(index);
                      }
                      setOpenFaqItems(newOpenItems);
                    }}
                    className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-gray-50 rounded-xl transition-colors"
                  >
                    <span className="text-lg font-semibold text-gray-900 pr-4">
                      {faq.question}
                    </span>
                    <div className={cn(
                      "flex-shrink-0 transition-transform duration-200",
                      isOpen && "rotate-180"
                    )}>
                      {isOpen ? (
                        <ChevronUp className="h-5 w-5 text-orange-500" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                  </button>
                  
                  {isOpen && (
                    <div className="px-6 pb-5 pt-0">
                      <div className="pt-4 border-t border-gray-100">
                        <p className="text-gray-600 leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 md:px-6 lg:px-10 bg-gradient-to-r from-orange-500 to-orange-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Deepen Your Bible Study?
          </h2>
          <p className="text-lg md:text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of believers using AI-powered tools to grow in their faith
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              variant="secondary"
              className="bg-white text-orange-600 hover:bg-gray-100"
            >
              <Link to="/auth">
                Get Started Free
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white/10"
            >
              <a href="mailto:contact@bibleaura.xyz">
                <Mail className="h-4 w-4 mr-2" />
                Contact Sales
              </a>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

