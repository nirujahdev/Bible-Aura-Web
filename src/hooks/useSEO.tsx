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
    title: "✦ Bible Aura | AI-Powered Biblical Insights & Bible AI Chat",
    description: "Experience Bible Aura - the ultimate AI-powered Bible study platform. Chat with our Bible AI, get instant verse explanations, and discover deeper spiritual insights. Free Bible AI chat and study tools.",
    keywords: "Bible aura, bible aura ai, bible aura chat, Bible AI chat, bible ai chatbot, bible ai assistant, AI Bible verse explanation, Bible AI, AI Bible study, Bible chat, digital Bible, Bible journal, Bible verse analysis, AI biblical insights, Bible AI assistant, Christian AI, Bible study tools, biblical AI companion, scripture AI, Bible chatbot, AI powered Bible, Bible verse explanation, biblical study AI, smart Bible study, AI Bible interpretation, Bible AI oracle, Christian chatbot, biblical AI analysis, Bible study AI, AI Bible commentary, Bible AI questions, spiritual AI companion, AI scripture study, Bible AI help, digital Bible study, AI Bible insights, Bible verse AI, Christian AI assistant, biblical AI chat, AI Bible guidance, bible aura platform, bible aura online, bible aura app, free bible ai, best bible ai, bible ai free, bible study ai free, christian ai tools, bible aura wisdom, bible aura insights, bible aura devotional",
    canonicalUrl: "https://bibleaura.xyz/"
  },
  ABOUT: {
    title: "About Bible Aura | The Story Behind Our AI Bible Assistant & Bible AI Chat",
    description: "Discover how Bible Aura revolutionizes Bible study with AI technology. Learn about our Bible AI chat, our mission to make Scripture accessible, and how faith meets cutting-edge AI innovation.",
    keywords: "about Bible Aura, Bible AI story, Christian technology, AI Bible development, faith and technology, Bible app creators, bible aura story, bible aura mission, bible aura team, bible aura vision, AI Bible platform, Christian AI innovation, biblical technology, faith-based AI, religious AI development, Bible AI creators, spiritual technology, christian tech startup, bible aura company, bible aura about us, AI scripture platform, biblical AI development, christian ai assistant development",
    canonicalUrl: "https://bibleaura.xyz/about"
  },
  FEATURES: {
    title: "Bible Aura Features | AI Bible Chat, Study Tools & Scripture Analysis",
    description: "Explore Bible Aura's powerful features: Bible AI chat, verse explanation, cross-references, theology insights, daily devotionals, and intelligent Scripture analysis—all powered by advanced AI.",
    keywords: "Bible study AI tools, Bible verse explanation tools, AI Bible features, Bible study app features, Christian AI tools, bible aura features, bible ai chat features, AI Bible commentary, bible study tools ai, scripture analysis ai, biblical insights ai, verse analysis tools, bible chat features, christian app features, bible ai assistant features, biblical study features, scripture study tools, bible research tools, theological ai tools, biblical analysis software, christian study software, bible learning tools, scripture learning tools, biblical education tools",
    canonicalUrl: "https://bibleaura.xyz/features"
  },
  BLOG: {
    title: "Bible Aura Blog | Bible AI Chat Tips, Scripture Study & Spiritual Growth",
    description: "Discover Bible study tips, AI Bible insights, and spiritual growth articles. Learn how Bible Aura's AI chat transforms Scripture study with fresh biblical perspectives and deeper understanding.",
    keywords: "Bible study tips, AI Bible insights, Scripture study guides, Bible learning articles, Christian study tips, bible aura blog, bible ai chat tips, AI Bible study tips, biblical insights blog, christian ai blog, bible study advice, scripture study advice, biblical learning blog, christian education blog, faith blog, spiritual growth blog, bible wisdom blog, scripture wisdom blog, biblical knowledge blog, christian knowledge blog, AI bible commentary blog, theological insights blog, biblical understanding blog, spiritual understanding blog, christian understanding blog",
    canonicalUrl: "https://bibleaura.xyz/blog"
  },
  PRICING: {
    title: "Bible Aura Pricing | Free Bible AI Chat & Pro Bible Study Plans",
    description: "Start free with Bible Aura's AI Bible chat and verse explanations, or upgrade to Pro for unlimited access to advanced Bible study tools, AI insights, and premium features.",
    keywords: "Bible app pricing, AI Bible study plans, Christian app subscription, Bible study premium features, bible aura pricing, bible ai chat free, free bible ai, bible ai premium, christian ai subscription, bible study subscription, ai bible tools pricing, biblical insights pricing, scripture study pricing, bible app plans, christian app plans, bible study plans, scripture study plans, biblical education pricing, christian education pricing, faith app pricing, spiritual app pricing, bible learning pricing, scripture learning pricing",
    canonicalUrl: "https://bibleaura.xyz/pricing"
  },
  AUTH: {
    title: "Login to Bible Aura | Access Your Bible AI Chat & Study Tools",
    description: "Sign in to Bible Aura and continue your spiritual journey with personalized Bible AI chat, saved study notes, devotionals, and intelligent Scripture insights tailored to your faith growth.",
    keywords: "login Bible Aura, Bible app login, Christian app sign in, Bible study account, bible aura login, bible ai chat login, AI Bible login, scripture study login, biblical insights login, christian ai login, bible study signin, scripture study signin, faith app login, spiritual app login, bible learning login, scripture learning login, biblical education login, christian education login, bible platform login, scripture platform login",
    canonicalUrl: "https://bibleaura.xyz/auth"
  },
  BIBLE_AI: {
    title: "Bible AI Chat | AI-Powered Biblical Study & Scripture Analysis | Bible Aura",
    description: "Experience the power of Bible AI with Bible Aura's intelligent chat system. Get instant biblical insights, AI-powered scripture analysis, and personalized Bible study assistance. Chat with our Bible AI now!",
    keywords: "Bible AI, bible ai chat, bible ai chatbot, bible ai assistant, AI Bible study, Bible AI assistant, AI scripture analysis, Christian AI, biblical AI, AI Bible commentary, smart Bible study, AI Bible insights, bible aura ai, bible aura chat, bible aura ai chat, AI Bible oracle, biblical AI chat, scripture AI chat, christian chatbot, religious ai chat, bible chat ai, verse analysis AI, biblical analysis AI, scripture analysis AI, theological AI, biblical insights AI, christian insights AI, faith AI, spiritual AI, bible study AI, scripture study AI, biblical education AI, christian education AI",
    canonicalUrl: "https://bibleaura.xyz/bible-ai"
  },
  BIBLE: {
    title: "Digital Bible | Read, Study & Analyze Scripture with AI | Bible Aura",
    description: "Read the Bible online with Bible Aura's AI-powered insights, cross-references, and study tools. Multiple translations, verse highlighting, bookmarks, and intelligent biblical analysis in one platform.",
    keywords: "digital Bible, online Bible, Bible study, Bible reading, KJV Bible, Bible translations, Bible AI, scripture study, Bible verse search, bible aura bible, AI Bible reader, smart Bible app, interactive Bible, Bible study online, scripture reading online, biblical text analysis, Bible concordance, Bible commentary, Bible dictionary, Bible atlas, Bible study guide, scripture study guide, biblical research, christian study, faith study, spiritual study, bible learning, scripture learning, biblical education, christian education",
    canonicalUrl: "https://bibleaura.xyz/bible"
  },
  JOURNAL: {
    title: "Bible Journal | AI-Enhanced Spiritual Journaling & Reflection | Bible Aura",
    description: "Keep a digital Bible journal with Bible Aura's AI-powered insights and reflection prompts. Track your spiritual journey, receive personalized guidance, and deepen your faith through intelligent journaling.",
    keywords: "Bible journal, digital journal, spiritual journaling, Christian journal, Bible study journal, AI journal, faith journal, spiritual diary, bible aura journal, AI Bible journal, intelligent journaling, scripture journaling, biblical reflection, christian reflection, faith reflection, spiritual reflection, bible meditation, scripture meditation, biblical devotional, christian devotional, faith devotional, spiritual devotional, bible diary, scripture diary, biblical notes, christian notes, faith notes, spiritual notes, bible thoughts, scripture thoughts, biblical insights journal, christian insights journal",
    canonicalUrl: "https://bibleaura.xyz/journal"
  },
  STUDY_HUB: {
    title: "Bible Study Hub | AI-Powered Biblical Learning Center | Bible Aura",
    description: "Comprehensive Bible study resources powered by AI. Access topical studies, character analyses, verse explanations, and personalized study plans for deeper biblical understanding with Bible Aura.",
    keywords: "Bible study, Bible study hub, topical Bible study, Bible characters, Bible verse study, AI Bible study, biblical learning, scripture study, bible aura study hub, Bible study center, biblical education hub, christian education hub, scripture learning hub, bible research hub, biblical analysis hub, christian analysis hub, theological study hub, biblical insights hub, christian insights hub, faith study hub, spiritual study hub, bible knowledge hub, scripture knowledge hub, biblical wisdom hub, christian wisdom hub, biblical understanding hub, christian understanding hub",
    canonicalUrl: "https://bibleaura.xyz/study-hub"
  },
  SERMONS: {
    title: "AI Sermon Library | Inspirational Sermons & Biblical Messages | Bible Aura",
    description: "Explore Bible Aura's AI-curated sermon library with powerful biblical messages, inspirational teachings, and spiritual guidance. Find sermons by topic, scripture, or theme with intelligent search.",
    keywords: "sermons, Christian sermons, biblical sermons, AI sermons, sermon library, inspirational messages, biblical teachings, spiritual guidance, bible aura sermons, AI sermon assistant, sermon search, biblical messages, christian messages, faith messages, spiritual messages, bible preaching, scripture preaching, biblical preaching, christian preaching, faith preaching, spiritual preaching, sermon preparation, biblical preparation, christian preparation, theological sermons, biblical exposition, christian exposition, scripture exposition",
    canonicalUrl: "https://bibleaura.xyz/sermons"
  },
  CONTACT: {
    title: "Contact Bible Aura | Get Support for Bible AI Chat & Platform | Bible Aura",
    description: "Contact Bible Aura for support, feedback, or questions about our AI-powered Bible study platform. Get help with Bible AI chat, technical support, and enhance your spiritual journey.",
    keywords: "contact Bible Aura, Bible AI support, customer service, Bible platform help, spiritual guidance contact, bible aura support, bible ai chat support, bible app support, christian app support, bible study support, scripture study support, biblical insights support, christian insights support, faith app contact, spiritual app contact, bible platform contact, scripture platform contact, biblical education support, christian education support, bible help, scripture help, biblical help, christian help, faith help, spiritual help",
    canonicalUrl: "https://bibleaura.xyz/contact"
  },
  BIBLE_QA: {
    title: "Bible Q&A | Ask Bible AI Questions & Get Scripture Answers | Bible Aura",
    description: "Ask any Bible question and get intelligent AI-powered answers. Bible Aura's Q&A system provides biblical insights, verse explanations, and theological guidance for all your Scripture questions.",
    keywords: "Bible Q&A, Bible questions and answers, ask Bible AI, Bible AI questions, scripture questions, biblical questions, christian questions, faith questions, spiritual questions, bible aura qa, bible aura questions, AI Bible answers, biblical answers, christian answers, faith answers, spiritual answers, bible help, scripture help, biblical help, christian help, faith help, spiritual help, bible guidance, scripture guidance, biblical guidance, christian guidance, faith guidance, spiritual guidance, theological questions, biblical theology questions",
    canonicalUrl: "https://bibleaura.xyz/bible-qa"
  },
  DASHBOARD: {
    title: "Bible Study Dashboard | Your Personal AI Bible Study Center | Bible Aura",
    description: "Access your personalized Bible study dashboard with AI insights, reading progress, journal entries, saved verses, and intelligent study recommendations tailored to your spiritual growth.",
    keywords: "Bible study dashboard, personal Bible study, AI Bible dashboard, bible aura dashboard, christian dashboard, faith dashboard, spiritual dashboard, bible study tracker, scripture study tracker, biblical insights dashboard, christian insights dashboard, bible progress, scripture progress, biblical progress, christian progress, faith progress, spiritual progress, bible analytics, scripture analytics, biblical analytics, christian analytics, faith analytics, spiritual analytics, bible study statistics, scripture study statistics",
    canonicalUrl: "https://bibleaura.xyz/dashboard"
  },
  FAVORITES: {
    title: "Favorite Bible Verses | Save & Organize Scripture with AI | Bible Aura",
    description: "Save, organize, and revisit your favorite Bible verses with Bible Aura's intelligent bookmarking system. Get AI insights on your saved verses and track your spiritual growth.",
    keywords: "favorite Bible verses, save Bible verses, Bible bookmarks, scripture bookmarks, biblical bookmarks, bible aura favorites, bible verse collection, scripture collection, biblical collection, favorite scripture, saved verses, saved scripture, bible verse organizer, scripture organizer, biblical organizer, bible memory verses, scripture memory verses, biblical memory verses, bible verse tracker, scripture verse tracker, biblical verse tracker, personal bible verses, personal scripture, personal biblical collection",
    canonicalUrl: "https://bibleaura.xyz/favorites"
  },
  TOPICAL_STUDY: {
    title: "Topical Bible Study | AI-Powered Scripture Topics & Themes | Bible Aura",
    description: "Explore Bible topics and themes with Bible Aura's AI-powered topical study system. Discover connected verses, theological insights, and comprehensive biblical understanding by topic.",
    keywords: "topical Bible study, Bible topics, Bible themes, scripture topics, biblical topics, AI topical study, bible aura topical study, thematic Bible study, biblical themes, christian themes, faith themes, spiritual themes, bible study by topic, scripture study by topic, biblical study by topic, theological topics, biblical theology topics, christian theology topics, doctrinal study, biblical doctrine, christian doctrine, systematic theology, biblical systematic theology",
    canonicalUrl: "https://bibleaura.xyz/topical-study"
  },
  PARABLES_STUDY: {
    title: "Bible Parables Study | AI Analysis of Jesus' Parables | Bible Aura",
    description: "Study Jesus' parables with Bible Aura's AI-powered analysis. Understand the deeper meanings, historical context, and spiritual lessons from the parables of Jesus Christ.",
    keywords: "Bible parables, Jesus parables, parable study, AI parable analysis, bible aura parables, parables of Jesus, biblical parables, christian parables, faith parables, spiritual parables, parable meanings, parable interpretations, parable explanations, parable lessons, parable teachings, parable insights, parable wisdom, parable understanding, gospel parables, new testament parables, jesus teachings, christ teachings, biblical teachings, christian teachings",
    canonicalUrl: "https://bibleaura.xyz/parables-study"
  },
  SONGS: {
    title: "Christian Songs & Hymns | AI-Curated Sacred Music | Bible Aura",
    description: "Discover Christian songs, hymns, and worship music curated by AI. Find songs that complement your Bible study and enhance your spiritual worship experience with Bible Aura.",
    keywords: "Christian songs, christian hymns, worship music, sacred music, spiritual songs, bible aura songs, AI curated music, christian music, faith music, spiritual music, worship songs, praise songs, devotional music, biblical songs, scripture songs, christian worship, faith worship, spiritual worship, church music, congregational music, traditional hymns, modern christian music, contemporary christian music, gospel music, christian praise music",
    canonicalUrl: "https://bibleaura.xyz/songs"
  },
  SERMON_WRITER: {
    title: "AI Sermon Writer | Create Biblical Sermons with AI | Bible Aura",
    description: "Create powerful sermons with Bible Aura's AI sermon writer. Get biblical outlines, scripture references, and theological insights to craft inspiring messages for your congregation.",
    keywords: "AI sermon writer, sermon preparation, biblical sermon writing, christian sermon writer, bible aura sermon writer, AI sermon assistant, sermon creator, sermon generator, biblical preaching, christian preaching, sermon outlines, biblical outlines, christian outlines, sermon ideas, biblical ideas, christian ideas, sermon inspiration, biblical inspiration, christian inspiration, pastoral tools, ministry tools, preaching tools, biblical ministry, christian ministry, church ministry, theological writing, biblical writing, christian writing",
    canonicalUrl: "https://bibleaura.xyz/sermon-writer"
  },
  SERMON_LIBRARY: {
    title: "Sermon Library | Biblical Messages & Preaching Resources | Bible Aura",
    description: "Access Bible Aura's comprehensive sermon library with biblical messages, preaching resources, and spiritual guidance. Find sermons organized by topic, scripture, and theme.",
    keywords: "sermon library, biblical sermons, christian sermons, preaching library, bible aura sermon library, sermon collection, biblical messages, christian messages, spiritual messages, faith messages, sermon archive, biblical archive, christian archive, preaching archive, ministry archive, sermon database, biblical database, christian database, preaching database, ministry database, theological sermons, biblical preaching, christian preaching, expository preaching, topical preaching",
    canonicalUrl: "https://bibleaura.xyz/sermon-library"
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