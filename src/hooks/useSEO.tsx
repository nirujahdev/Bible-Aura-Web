import { useEffect } from 'react';

interface SEOConfig {
  title: string;
  description: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  canonicalUrl?: string;
  structuredData?: any;
}

export const useSEO = ({
  title,
  description,
  keywords,
  ogTitle,
  ogDescription,
  twitterTitle,
  twitterDescription,
  canonicalUrl,
  structuredData
}: SEOConfig) => {
  useEffect(() => {
    // Update document title
    document.title = title;

    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', description);
    }

    // Update keywords if provided
    if (keywords) {
      const metaKeywords = document.querySelector('meta[name="keywords"]');
      if (metaKeywords) {
        metaKeywords.setAttribute('content', keywords);
      }
    }

    // Update OpenGraph title
    const ogTitleMeta = document.querySelector('meta[property="og:title"]');
    if (ogTitleMeta) {
      ogTitleMeta.setAttribute('content', ogTitle || title);
    }

    // Update OpenGraph description
    const ogDescMeta = document.querySelector('meta[property="og:description"]');
    if (ogDescMeta) {
      ogDescMeta.setAttribute('content', ogDescription || description);
    }

    // Update OpenGraph image
    const ogImage = document.querySelector('meta[property="og:image"]');
    if (ogImage) {
      ogImage.setAttribute('content', 'https://bibleaura.xyz/✦Bible%20Aura%20(2).png');
    }

    // Update OpenGraph URL
    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl && canonicalUrl) {
      ogUrl.setAttribute('content', canonicalUrl);
    }

    // Update Twitter Card title
    const twitterTitleMeta = document.querySelector('meta[name="twitter:title"]');
    if (twitterTitleMeta) {
      twitterTitleMeta.setAttribute('content', twitterTitle || ogTitle || title);
    }

    // Update Twitter Card description
    const twitterDescMeta = document.querySelector('meta[name="twitter:description"]');
    if (twitterDescMeta) {
      twitterDescMeta.setAttribute('content', twitterDescription || ogDescription || description);
    }

    // Update Twitter Card image
    const twitterImage = document.querySelector('meta[name="twitter:image"]');
    if (twitterImage) {
      twitterImage.setAttribute('content', 'https://bibleaura.xyz/✦Bible%20Aura%20(2).png');
    }

    // Update canonical URL
    if (canonicalUrl) {
      let canonicalLink = document.querySelector('link[rel="canonical"]');
      if (canonicalLink) {
        canonicalLink.setAttribute('href', canonicalUrl);
      } else {
        canonicalLink = document.createElement('link');
        canonicalLink.setAttribute('rel', 'canonical');
        canonicalLink.setAttribute('href', canonicalUrl);
        document.head.appendChild(canonicalLink);
      }
    }

    // Add structured data if provided
    if (structuredData) {
      // Remove existing structured data for this page
      const existingScript = document.querySelector('script[data-page-structured-data]');
      if (existingScript) {
        existingScript.remove();
      }

      // Add new structured data
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-page-structured-data', 'true');
      script.textContent = JSON.stringify(structuredData);
      document.head.appendChild(script);
    }

    // Cleanup function
    return () => {
      const pageScript = document.querySelector('script[data-page-structured-data]');
      if (pageScript) {
        pageScript.remove();
      }
    };
  }, [title, description, keywords, ogTitle, ogDescription, twitterTitle, twitterDescription, canonicalUrl, structuredData]);
};

// SEO configurations for all pages
export const SEO_CONFIG = {
  HOME: {
    title: "✦ Bible Aura • AI-Powered Biblical Insight & Digital Bible Study Platform",
    description: "Experience divine biblical wisdom through AI-powered insights, spiritual guidance, and sacred study tools. The ultimate Bible AI companion for Bible study, journal, and spiritual growth. Free AI Bible chat with personalized insights.",
    keywords: "Bible AI, AI Bible study, Bible chat, digital Bible, Bible journal, Bible verse analysis, AI biblical insights, Bible AI assistant, Christian AI, Bible study tools, biblical AI companion, scripture AI, Bible chatbot",
    canonicalUrl: "https://bibleaura.xyz/"
  },
  BIBLE_AI: {
    title: "Bible AI - AI-Powered Biblical Study & Scripture Analysis | Bible Aura",
    description: "Discover the power of Bible AI with Bible Aura. Get instant biblical insights, AI-powered scripture analysis, and intelligent Bible study assistance. Transform your spiritual journey with cutting-edge AI technology.",
    keywords: "Bible AI, AI Bible study, Bible AI assistant, AI scripture analysis, Christian AI, biblical AI, AI Bible commentary, smart Bible study, AI Bible insights",
    canonicalUrl: "https://bibleaura.xyz/bible-ai"
  },
  BIBLE: {
    title: "Digital Bible - Read, Study & Analyze Scripture with AI | Bible Aura",
    description: "Read the Bible online with AI-powered insights, cross-references, and study tools. Multiple translations, verse highlighting, bookmarks, and intelligent biblical analysis in one platform.",
    keywords: "digital Bible, online Bible, Bible study, Bible reading, KJV Bible, Bible translations, Bible AI, scripture study, Bible verse search",
    canonicalUrl: "https://bibleaura.xyz/bible"
  },
  JOURNAL: {
    title: "Digital Bible Journal - AI-Enhanced Spiritual Journaling | Bible Aura",
    description: "Keep a digital Bible journal with AI-powered insights and reflection prompts. Track your spiritual journey, receive personalized guidance, and deepen your faith through intelligent journaling.",
    keywords: "Bible journal, digital journal, spiritual journaling, Christian journal, Bible study journal, AI journal, faith journal, spiritual diary",
    canonicalUrl: "https://bibleaura.xyz/journal"
  },
  STUDY_HUB: {
    title: "Bible Study Hub - AI-Powered Biblical Learning Center | Bible Aura",
    description: "Comprehensive Bible study resources powered by AI. Access topical studies, character analyses, verse explanations, and personalized study plans for deeper biblical understanding.",
    keywords: "Bible study, Bible study hub, topical Bible study, Bible characters, Bible verse study, AI Bible study, biblical learning, scripture study",
    canonicalUrl: "https://bibleaura.xyz/study-hub"
  },
  SERMONS: {
    title: "AI Sermon Library - Inspirational Sermons & Biblical Messages | Bible Aura",
    description: "Explore our AI-curated sermon library with powerful biblical messages, inspirational teachings, and spiritual guidance. Find sermons by topic, scripture, or theme.",
    keywords: "sermons, Christian sermons, biblical sermons, AI sermons, sermon library, inspirational messages, biblical teachings, spiritual guidance",
    canonicalUrl: "https://bibleaura.xyz/sermons"
  },
  BLOG: {
    title: "Bible AI Blog - Expert Insights on AI-Powered Bible Study | Bible Aura",
    description: "Discover expert insights on Bible AI, AI-powered Bible study, and digital biblical analysis. Learn how artificial intelligence transforms modern Bible study and spiritual growth.",
    keywords: "Bible AI blog, AI Bible study insights, biblical AI articles, Christian AI technology, Bible study tips, AI spiritual guidance",
    canonicalUrl: "https://bibleaura.xyz/blog"
  },
  ABOUT: {
    title: "About Bible Aura - AI-Powered Biblical Insight Platform | Bible Aura",
    description: "Learn about Bible Aura's mission to transform Bible study through AI technology. Discover our story, values, and commitment to providing authentic biblical insights.",
    keywords: "about Bible Aura, Bible AI platform, Christian AI company, biblical AI technology, Bible study platform",
    canonicalUrl: "https://bibleaura.xyz/about"
  },
  CONTACT: {
    title: "Contact Bible Aura - Get Support for Bible AI Platform | Bible Aura",
    description: "Contact Bible Aura for support, feedback, or questions about our AI-powered Bible study platform. We're here to help enhance your spiritual journey.",
    keywords: "contact Bible Aura, Bible AI support, customer service, Bible platform help, spiritual guidance contact",
    canonicalUrl: "https://bibleaura.xyz/contact"
  }
};

// Helper function to generate structured data for blog posts
export const createBlogPostStructuredData = (
  title: string,
  description: string,
  datePublished: string,
  author: string = "Bible Aura Team",
  url: string
) => ({
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": title,
  "description": description,
  "datePublished": datePublished,
  "dateModified": new Date().toISOString(),
  "author": {
    "@type": "Person",
    "name": author
  },
  "publisher": {
    "@type": "Organization",
    "@id": "https://bibleaura.xyz/#organization"
  },
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": url
  },
  "image": "https://bibleaura.xyz/✦Bible%20Aura%20(2).png",
  "url": url
}); 