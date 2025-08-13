import { supabase } from '@/integrations/supabase/client';

interface SermonGenerationRequest {
  topic: string;
  scripture: string;
  audienceType: string;
  denominationLens: string;
  sermonType: string;
  length: string;
  language: string;
  mood?: string;
  occasion?: string;
  includeOutlineOnly?: boolean;
  includeFullScript?: boolean;
  includeDevotionalVersion?: boolean;
  includeWorshipSuggestions?: boolean;
}

interface AdvancedOptions {
  theologicalDepth: number;
  illustrationStyle: string;
  applicationFocus: string;
}

interface GeneratedSermon {
  title: string;
  overview: {
    centralMessage: string;
    mainPoints: string[];
    targetAudience: string;
    occasion: string;
  };
  openingHook: {
    story: string;
    connection: string;
    bridge: string;
  };
  scriptureFoundation: {
    primaryText: string;
    context: string;
    originalLanguage: string;
    authorIntent: string;
  };
  theologicalFramework: {
    keyTheology: string;
    redemptiveContext: string;
    crossReferences: string[];
    doctrinalConnections: string[];
  };
  mainPoints: Array<{
    title: string;
    content: string;
    scriptureSupport: string[];
    illustrations: string[];
    applications: string[];
  }>;
  realWorldApplications: {
    actionSteps: string[];
    lifeChallenges: string[];
    practicalTools: string[];
  };
  callToAction: {
    commitment: string;
    prayer: string;
    nextSteps: string[];
    resources: string[];
  };
  closing: {
    summary: string;
    benediction: string;
    preview: string;
  };
  studyGuide: {
    discussionQuestions: string[];
    memoryVerse: string;
    additionalStudy: string[];
    prayerPoints: string[];
  };
  worshipSuggestions?: {
    openingSongs: string[];
    responseSongs: string[];
    closingSongs: string[];
  };
  estimatedDuration: number;
  wordCount: number;
}

export class EnhancedSermonAI {
  private static audienceTemplates = {
    youth: {
      language: 'contemporary and relatable',
      illustrations: 'social media, technology, school, relationships',
      applications: 'peer pressure, identity, future planning, faith in action',
      engagement: 'interactive questions, multimedia references, group activities'
    },
    adults: {
      language: 'mature and practical',
      illustrations: 'work, family, finances, health',
      applications: 'parenting, career decisions, relationships, stewardship',
      engagement: 'personal reflection, real-life scenarios, actionable steps'
    },
    seniors: {
      language: 'respectful and wisdom-focused',
      illustrations: 'life experience, legacy, grandchildren, health challenges',
      applications: 'mentoring, legacy building, contentment, hope',
      engagement: 'storytelling, shared experiences, gentle encouragement'
    },
    families: {
      language: 'inclusive and practical',
      illustrations: 'home life, parenting, traditions, community',
      applications: 'family devotions, child-rearing, marriage, home management',
      engagement: 'family activities, generational perspectives, household applications'
    },
    'non-believers': {
      language: 'accessible and non-judgmental',
      illustrations: 'universal experiences, hope, purpose, love',
      applications: 'life meaning, relationships, hope, spiritual journey',
      engagement: 'gentle invitation, clear explanation, practical benefits'
    },
    'new-believers': {
      language: 'encouraging and foundational',
      illustrations: 'growth, learning, community, discovery',
      applications: 'spiritual disciplines, church community, Bible study, prayer',
      engagement: 'basic concepts, encouragement, next steps, support'
    },
    'mature-believers': {
      language: 'deep and challenging',
      illustrations: 'ministry, leadership, theological concepts, service',
      applications: 'discipleship, ministry, theological growth, leadership',
      engagement: 'complex concepts, challenge to grow, ministry opportunities'
    }
  };

  private static denominationalLenses = {
    evangelical: {
      emphasis: 'Biblical authority, personal relationship with Jesus, evangelism',
      theology: 'Conservative interpretation, salvation by faith alone',
      worship: 'Contemporary and traditional hymns, Bible-centered',
      application: 'Personal devotion, evangelism, biblical living'
    },
    pentecostal: {
      emphasis: 'Holy Spirit gifts, divine healing, prophetic ministry',
      theology: 'Charismatic gifts, baptism in the Holy Spirit',
      worship: 'Praise and worship, spiritual gifts, healing prayer',
      application: 'Spirit-led living, prayer for healing, exercising gifts'
    },
    baptist: {
      emphasis: 'Believer\'s baptism, congregational autonomy, missions',
      theology: 'Baptist distinctives, autonomous church governance',
      worship: 'Traditional and contemporary, baptism emphasis',
      application: 'Personal faith decision, missionary involvement, church autonomy'
    },
    catholic: {
      emphasis: 'Sacramental life, tradition and scripture, social justice',
      theology: 'Catholic teaching, sacramental theology, papal authority',
      worship: 'Liturgical elements, sacramental focus, traditional prayers',
      application: 'Sacramental living, social justice, church teaching'
    },
    methodist: {
      emphasis: 'Social holiness, grace, practical Christianity',
      theology: 'Wesleyan theology, prevenient grace, social action',
      worship: 'Methodist traditions, social justice themes',
      application: 'Social action, personal holiness, community service'
    },
    presbyterian: {
      emphasis: 'Reformed theology, predestination, covenant',
      theology: 'Calvinist doctrine, sovereignty of God, covenant theology',
      worship: 'Reformed liturgy, psalm singing, structured worship',
      application: 'Covenant living, divine sovereignty, reformed life'
    },
    lutheran: {
      emphasis: 'Law and gospel, sacramental life, liturgical worship',
      theology: 'Lutheran confessions, justification by faith, sacraments',
      worship: 'Liturgical structure, sacramental focus, traditional elements',
      application: 'Sacramental living, gospel freedom, Lutheran identity'
    },
    'non-denominational': {
      emphasis: 'Biblical teaching, simple church, practical faith',
      theology: 'Bible-based, non-creedal, practical Christianity',
      worship: 'Flexible format, contemporary music, practical teaching',
      application: 'Biblical living, practical faith, community focus'
    }
  };

  private static sermonTypeTemplates = {
    expository: {
      structure: 'Verse-by-verse exposition with contextual analysis',
      approach: 'Deep dive into specific passage with historical context',
      points: 'Based on natural divisions in the text',
      focus: 'What the text meant and what it means today'
    },
    topical: {
      structure: 'Theme-based with supporting scriptures',
      approach: 'Exploring a topic through various biblical passages',
      points: 'Logical progression through topic aspects',
      focus: 'Biblical perspective on contemporary issues'
    },
    narrative: {
      structure: 'Story-driven with character development',
      approach: 'Following biblical narrative with modern parallels',
      points: 'Story progression with life lessons',
      focus: 'Learning from biblical characters and events'
    },
    biographical: {
      structure: 'Character study with life lessons',
      approach: 'Examining biblical character\'s life and faith journey',
      points: 'Key moments and decisions in character\'s life',
      focus: 'How biblical characters model faith for today'
    },
    devotional: {
      structure: 'Personal reflection and application',
      approach: 'Intimate and personal exploration of faith',
      points: 'Personal spiritual growth themes',
      focus: 'Heart change and spiritual formation'
    },
    evangelistic: {
      structure: 'Gospel presentation with clear invitation',
      approach: 'Presenting the good news of salvation',
      points: 'Human need, God\'s solution, personal response',
      focus: 'Clear gospel message and invitation to faith'
    },
    apologetic: {
      structure: 'Defending faith with evidence and reasoning',
      approach: 'Addressing doubts and questions about Christianity',
      points: 'Evidence for faith, addressing objections',
      focus: 'Strengthening faith through reason and evidence'
    }
  };

  static async generateComprehensiveSermon(
    request: SermonGenerationRequest,
    advancedOptions: AdvancedOptions
  ): Promise<GeneratedSermon> {
    try {
      // Build comprehensive prompt for AI
      const prompt = this.buildEnhancedPrompt(request, advancedOptions);
      
      // Call DeepSeek API for actual AI generation
      const response = await this.callDeepSeekAPI(prompt);
      
      let sermon: GeneratedSermon;
      try {
        // Try to parse as JSON first
        sermon = JSON.parse(response);
      } catch (parseError) {
        // If JSON parsing fails, use enhanced parsing
        sermon = await this.parseAIResponse(response, request, advancedOptions);
      }
      
      // Enhance with calculated fields
      sermon.estimatedDuration = this.calculateDuration(request.length);
      sermon.wordCount = this.calculateWordCount(request.length);
      
      // Log generation for analytics
      await this.logSermonGeneration(request, sermon);
      
      return sermon;
    } catch (error) {
      console.error('Error generating sermon:', error);
      throw new Error('Failed to generate sermon. Please try again.');
    }
  }

  // DeepSeek API call for sermon generation
  private static async callDeepSeekAPI(prompt: string): Promise<string> {
    const apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY || import.meta.env.VITE_AI_API_KEY;
    
    if (!apiKey || apiKey === 'demo-key' || apiKey === 'your_deepseek_api_key_here') {
      throw new Error('🔑 DeepSeek API key not configured! Please check your environment variables.');
    }

    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: 'You are an expert theological AI assistant specializing in creating comprehensive, biblically-grounded sermons. You excel at crafting engaging, theologically sound, and practically applicable sermons for diverse audiences and denominational contexts. Always respond in valid JSON format.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 8000,
        temperature: 0.7,
        stream: false
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('DeepSeek API Error:', errorText);
      throw new Error(`Bible Aura AI error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  }

  // Enhanced AI response parsing
  private static async parseAIResponse(
    response: string, 
    request: SermonGenerationRequest, 
    options: AdvancedOptions
  ): Promise<GeneratedSermon> {
    // If AI response is not JSON, create structured sermon from text
    const lines = response.split('\n').filter(line => line.trim());
    const title = this.extractTitle(lines) || this.generateDynamicTitle(request);
    
    return {
      title,
      overview: {
        centralMessage: this.extractOrGenerate(lines, 'central message', () => this.generateCentralMessage(request)),
        mainPoints: this.extractMainPointsFromText(lines) || this.generateMainPoints(request),
        targetAudience: request.audienceType,
        occasion: request.occasion || 'sunday-service'
      },
      openingHook: this.generateOpeningHook(request),
      scriptureFoundation: this.generateScriptureFoundation(request),
      theologicalFramework: this.generateTheologicalFramework(request),
      mainPoints: this.generateDetailedMainPoints(request, options),
      realWorldApplications: this.generateApplications(request),
      callToAction: this.generateCallToAction(request),
      closing: this.generateClosing(request, title),
      studyGuide: this.generateStudyGuide(request),
      ...(request.includeWorshipSuggestions && {
        worshipSuggestions: this.generateWorshipSuggestions(request)
      }),
      estimatedDuration: this.calculateDuration(request.length),
      wordCount: this.calculateWordCount(request.length)
    };
  }

  // Helper methods for parsing AI response
  private static extractTitle(lines: string[]): string | null {
    for (const line of lines) {
      if (line.toLowerCase().includes('title:') || line.toLowerCase().includes('sermon title:')) {
        return line.replace(/.*title:\s*/i, '').trim();
      }
    }
    return null;
  }

  private static extractOrGenerate(lines: string[], keyword: string, fallback: () => string): string {
    for (const line of lines) {
      if (line.toLowerCase().includes(keyword.toLowerCase())) {
        return line.replace(new RegExp(`.*${keyword}:\\s*`, 'i'), '').trim();
      }
    }
    return fallback();
  }

  private static extractMainPointsFromText(lines: string[]): string[] | null {
    const points: string[] = [];
    let inPointsSection = false;
    
    for (const line of lines) {
      if (line.toLowerCase().includes('main points') || line.toLowerCase().includes('key points')) {
        inPointsSection = true;
        continue;
      }
      
      if (inPointsSection && line.match(/^\d+\./)) {
        points.push(line.replace(/^\d+\.\s*/, '').trim());
      } else if (inPointsSection && points.length > 0 && !line.match(/^\d+\./)) {
        break;
      }
    }
    
    return points.length > 0 ? points : null;
  }

  private static buildEnhancedPrompt(
    request: SermonGenerationRequest,
    options: AdvancedOptions
  ): string {
    const audienceTemplate = this.audienceTemplates[request.audienceType as keyof typeof this.audienceTemplates];
    const denominationTemplate = this.denominationalLenses[request.denominationLens as keyof typeof this.denominationalLenses];
    const sermonTypeTemplate = this.sermonTypeTemplates[request.sermonType as keyof typeof this.sermonTypeTemplates];

    return `
Generate a comprehensive ${request.length} ${request.sermonType} sermon in ${request.language} with the following specifications:

CORE INFORMATION:
- Topic: ${request.topic}
- Scripture: ${request.scripture}
- Target Audience: ${request.audienceType}
- Denominational Perspective: ${request.denominationLens}
- Mood/Tone: ${request.mood}
- Occasion: ${request.occasion}

AUDIENCE CUSTOMIZATION:
- Language Style: ${audienceTemplate?.language}
- Illustration Focus: ${audienceTemplate?.illustrations}
- Application Areas: ${audienceTemplate?.applications}
- Engagement Method: ${audienceTemplate?.engagement}

DENOMINATIONAL LENS:
- Theological Emphasis: ${denominationTemplate?.emphasis}
- Doctrinal Framework: ${denominationTemplate?.theology}
- Worship Integration: ${denominationTemplate?.worship}
- Practical Application: ${denominationTemplate?.application}

SERMON TYPE STRUCTURE:
- Approach: ${sermonTypeTemplate?.approach}
- Point Structure: ${sermonTypeTemplate?.points}
- Primary Focus: ${sermonTypeTemplate?.focus}

ADVANCED OPTIONS:
- Theological Depth: ${options.theologicalDepth}/5
- Illustration Style: ${options.illustrationStyle}
- Application Focus: ${options.applicationFocus}

Please structure your response as a comprehensive JSON object with the following structure:

{
  "title": "Compelling sermon title",
  "overview": {
    "centralMessage": "One-sentence central message",
    "mainPoints": ["Point 1", "Point 2", "Point 3"],
    "targetAudience": "${request.audienceType}",
    "occasion": "${request.occasion}"
  },
  "openingHook": {
    "story": "Engaging opening story/illustration",
    "connection": "How it connects to audience",
    "bridge": "Transition to main scripture"
  },
  "scriptureFoundation": {
    "primaryText": "${request.scripture}",
    "context": "Historical and cultural context",
    "originalLanguage": "Hebrew/Greek insights",
    "authorIntent": "Author's intended message"
  },
  "theologicalFramework": {
    "keyTheology": "Core theological concepts",
    "redemptiveContext": "How this fits in God's redemptive plan",
    "crossReferences": ["supporting verses"],
    "doctrinalConnections": ["relevant doctrines"]
  },
  "mainPoints": [
    {
      "title": "Main point title",
      "content": "Detailed explanation (300-500 words)",
      "scriptureSupport": ["supporting verses"],
      "illustrations": ["relevant illustrations"],
      "applications": ["practical applications"]
    }
  ],
  "realWorldApplications": {
    "actionSteps": ["specific action steps"],
    "lifeChallenges": ["addressing life challenges"],
    "practicalTools": ["practical tools for implementation"]
  },
  "callToAction": {
    "commitment": "Specific commitment request",
    "prayer": "Closing prayer",
    "nextSteps": ["follow-up actions"],
    "resources": ["additional resources"]
  },
  "closing": {
    "summary": "Key takeaways summary",
    "benediction": "Blessing/benediction",
    "preview": "Preview of next week/series"
  },
  "studyGuide": {
    "discussionQuestions": ["discussion questions"],
    "memoryVerse": "Key memory verse",
    "additionalStudy": ["additional study resources"],
    "prayerPoints": ["prayer points"]
  }${request.includeWorshipSuggestions ? `,
  "worshipSuggestions": {
    "openingSongs": ["opening song suggestions"],
    "responseSongs": ["response/meditation songs"],
    "closingSongs": ["closing/sending songs"]
  }` : ''}
}

OUTPUT REQUIREMENTS:
- Respond ONLY with valid JSON - no additional text or formatting
- Include comprehensive manuscript with transitions
- Provide cross-references and original language insights
- Include practical applications for target audience
- Generate discussion questions and study guide
${request.includeWorshipSuggestions ? '- Include worship song suggestions' : ''}
${request.includeDevotionalVersion ? '- Include devotional adaptation' : ''}
- Ensure cultural sensitivity for ${request.language} audience
- Maintain theological accuracy within ${request.denominationLens} framework
- Make content practical and engaging for ${request.audienceType} audience
    `;
  }

  private static async generateSermonFromTemplate(
    request: SermonGenerationRequest,
    options: AdvancedOptions
  ): Promise<GeneratedSermon> {
    const topicOrScripture = request.topic || request.scripture;
    const title = this.generateDynamicTitle(request);
    
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 3000));

    return {
      title,
      overview: {
        centralMessage: this.generateCentralMessage(request),
        mainPoints: this.generateMainPoints(request),
        targetAudience: request.audienceType,
        occasion: request.occasion || 'sunday-service'
      },
      openingHook: this.generateOpeningHook(request),
      scriptureFoundation: this.generateScriptureFoundation(request),
      theologicalFramework: this.generateTheologicalFramework(request),
      mainPoints: this.generateDetailedMainPoints(request, options),
      realWorldApplications: this.generateApplications(request),
      callToAction: this.generateCallToAction(request),
      closing: this.generateClosing(request, title),
      studyGuide: this.generateStudyGuide(request),
      ...(request.includeWorshipSuggestions && {
        worshipSuggestions: this.generateWorshipSuggestions(request)
      }),
      estimatedDuration: this.calculateDuration(request.length),
      wordCount: this.calculateWordCount(request.length)
    };
  }

  private static generateDynamicTitle(request: SermonGenerationRequest): string {
    const moodTitleMap = {
      inspiring: ['Discovering', 'Embracing', 'Finding', 'Experiencing'],
      challenging: ['The Call to', 'Rising to', 'Confronting', 'Standing for'],
      comforting: ['Finding Peace in', 'God\'s Comfort Through', 'Hope in', 'Rest in'],
      teaching: ['Understanding', 'Learning from', 'Biblical Truth About', 'God\'s Word on'],
      evangelistic: ['The Gospel of', 'God\'s Love in', 'Salvation Through', 'Grace in'],
      prophetic: ['God\'s Word on', 'A Divine Message About', 'The Truth About', 'Heaven\'s View of']
    };

    const denominationMap = {
      evangelical: ['Biblical', 'Faith-Filled', 'Christ-Centered'],
      pentecostal: ['Spirit-Empowered', 'Anointed', 'Supernatural'],
      baptist: ['Faithful', 'Biblical', 'God-Honoring'],
      catholic: ['Sacred', 'Blessed', 'Divine'],
      methodist: ['Grace-Filled', 'Transforming', 'Holy'],
      presbyterian: ['Covenant', 'Reformed', 'God\'s Sovereign'],
      lutheran: ['Gospel-Centered', 'Grace and Truth', 'Justified'],
      'non-denominational': ['Simple', 'Biblical', 'Faith-Based']
    };

    const moodWords = moodTitleMap[request.mood as keyof typeof moodTitleMap] || ['Understanding'];
    const denomWords = denominationMap[request.denominationLens as keyof typeof denominationMap] || ['Biblical'];
    
    const moodWord = moodWords[Math.floor(Math.random() * moodWords.length)];
    const denomWord = denomWords[Math.floor(Math.random() * denomWords.length)];
    
    const topic = request.topic || this.getTopicFromScripture(request.scripture);
    
    // Create dynamic title based on sermon type
    switch (request.sermonType) {
      case 'expository':
        return `${denomWord} Truth: ${topic}`;
      case 'topical':
        return `${moodWord} ${topic}`;
      case 'narrative':
        return `The Story of ${topic}`;
      case 'biographical':
        return `Learning from ${topic}`;
      case 'devotional':
        return `Heart to Heart: ${topic}`;
      case 'evangelistic':
        return `Good News: ${topic}`;
      default:
        return `${moodWord} ${topic}`;
    }
  }

  private static getTopicFromScripture(scripture: string): string {
    const scriptureTopics: Record<string, string> = {
      'john 3:16': 'God\'s Love',
      'romans 8:28': 'God\'s Providence',
      'philippians 4:13': 'Strength in Christ',
      'psalm 23': 'The Good Shepherd',
      'matthew 6:9-13': 'The Lord\'s Prayer',
      '1 corinthians 13': 'Love',
      'ephesians 2:8-9': 'Grace and Salvation',
      'jeremiah 29:11': 'God\'s Plans',
      'isaiah 40:31': 'Renewed Strength',
      'romans 12:1-2': 'Living Sacrifice'
    };

    const key = scripture.toLowerCase().replace(/:/g, ':').replace(/\s+/g, ' ').trim();
    return scriptureTopics[key] || 'Faith and Life';
  }

  private static generateCentralMessage(request: SermonGenerationRequest): string {
    const denominationFocus = this.denominationalLenses[request.denominationLens as keyof typeof this.denominationalLenses];
    const topic = request.topic || this.getTopicFromScripture(request.scripture);
    
    const messageBases = [
      `Through ${topic}, God calls us to experience His ${denominationFocus?.emphasis.split(',')[0]} in daily life`,
      `The biblical truth of ${topic} transforms how we understand God's heart for His people`,
      `In ${topic}, we discover practical wisdom for living out our faith with integrity and purpose`,
      `God's Word about ${topic} provides the foundation we need for authentic Christian living`
    ];

    return messageBases[Math.floor(Math.random() * messageBases.length)];
  }

  private static generateMainPoints(request: SermonGenerationRequest): string[] {
    const topic = request.topic || this.getTopicFromScripture(request.scripture);
    const lengthPoints = {
      short: 2,
      medium: 3,
      long: 4,
      extended: 4
    };

    const pointCount = lengthPoints[request.length as keyof typeof lengthPoints] || 3;
    
    // Generate points based on sermon type
    switch (request.sermonType) {
      case 'expository':
        return [
          `The Context and Meaning of ${topic}`,
          `The Theological Significance of ${topic}`,
          `The Personal Application of ${topic}`,
          pointCount > 3 ? `Living Out ${topic} in Community` : null
        ].filter(Boolean) as string[];
      
      case 'topical':
        return [
          `What Scripture Teaches About ${topic}`,
          `Why ${topic} Matters to God and Us`,
          `How to Embrace ${topic} in Daily Life`,
          pointCount > 3 ? `Sharing ${topic} with Others` : null
        ].filter(Boolean) as string[];
      
      case 'narrative':
        return [
          `The Setting and Context of the Story`,
          `The Unfolding Drama and Key Lessons`,
          `How This Story Speaks to Our Lives Today`,
          pointCount > 3 ? `Living Out the Story's Message` : null
        ].filter(Boolean) as string[];
      
      default:
        return [
          `Understanding ${topic} Biblically`,
          `Experiencing ${topic} Personally`,
          `Sharing ${topic} Practically`,
          pointCount > 3 ? `Growing in ${topic} Continually` : null
        ].filter(Boolean) as string[];
    }
  }

  // Additional helper methods...
  private static generateOpeningHook(request: SermonGenerationRequest) {
    const audienceHooks = {
      youth: `Picture this: You're scrolling through social media, and every post seems to show people living their best life. But what if I told you that true life isn't found in likes, follows, or perfect photos?`,
      adults: `Between work deadlines, family responsibilities, and life's unexpected challenges, we often wonder if there's more to life than just getting through each day.`,
      seniors: `After years of experience, we've learned that life's greatest treasures aren't found in our accomplishments, but in something much deeper.`,
      families: `Every family has its moments—the good, the challenging, and everything in between. But what if there was a secret to transforming your home into something truly special?`,
      'non-believers': `Whether you're religious or not, we all share the same fundamental questions: Why are we here? What's the point of it all? Is there hope when life gets hard?`,
      'new-believers': `Starting a journey of faith can feel overwhelming. Where do you begin? What does it really mean to follow Jesus?`,
      'mature-believers': `As seasoned believers, we sometimes wonder: How can we continue growing? How can our faith remain fresh and impactful?`
    };

    const hook = audienceHooks[request.audienceType as keyof typeof audienceHooks] || audienceHooks.adults;
    
    return {
      story: hook,
      connection: `This universal human experience connects us all, regardless of our background or life stage.`,
      bridge: `Today's Scripture passage speaks directly to this need, offering us God's perspective and practical wisdom.`
    };
  }

  private static generateScriptureFoundation(request: SermonGenerationRequest) {
    return {
      primaryText: request.scripture || 'Romans 8:28',
      context: `This passage was written in a specific historical context that helps us understand its meaning for today. The original audience faced challenges that mirror our modern struggles.`,
      originalLanguage: `Key terms in the original Hebrew/Greek provide deeper meaning that enriches our understanding of God's intended message.`,
      authorIntent: `The author wrote with specific pastoral and theological purposes that speak directly to the needs of believers then and now.`
    };
  }

  private static generateTheologicalFramework(request: SermonGenerationRequest) {
    const denominationTheology = this.denominationalLenses[request.denominationLens as keyof typeof this.denominationalLenses];
    
    return {
      keyTheology: `This passage reveals fundamental truths about God's character and His relationship with humanity, particularly emphasizing ${denominationTheology?.emphasis}.`,
      redemptiveContext: `Within God's overarching plan of redemption, this truth fits perfectly into the gospel narrative.`,
      crossReferences: ['Romans 8:28', 'Philippians 4:13', '2 Timothy 3:16-17'],
      doctrinalConnections: ['Divine sovereignty', 'Human responsibility', 'Sanctification', 'Biblical authority']
    };
  }

  private static generateDetailedMainPoints(request: SermonGenerationRequest, options: AdvancedOptions) {
    const mainPoints = this.generateMainPoints(request);
    
    return mainPoints.map((pointTitle, index) => ({
      title: pointTitle,
      content: `This point explores the depth of ${pointTitle.toLowerCase()} through careful examination of Scripture and practical application for ${request.audienceType} audience.`,
      scriptureSupport: [
        'Romans 15:4',
        '2 Timothy 3:16-17',
        'Psalm 119:105'
      ],
      illustrations: this.generateIllustrations(request, options.illustrationStyle),
      applications: this.generatePointApplications(request, pointTitle)
    }));
  }

  private static generateIllustrations(request: SermonGenerationRequest, style: string): string[] {
    const audienceTemplate = this.audienceTemplates[request.audienceType as keyof typeof this.audienceTemplates];
    
    const illustrations = [
      `A ${style} story that resonates with ${request.audienceType} involving ${audienceTemplate?.illustrations}`,
      `Historical example that demonstrates this principle in action`,
      `Contemporary illustration that makes this concept relatable and memorable`
    ];

    return illustrations;
  }

  private static generatePointApplications(request: SermonGenerationRequest, pointTitle: string): string[] {
    const audienceTemplate = this.audienceTemplates[request.audienceType as keyof typeof this.audienceTemplates];
    
    return [
      `Personal reflection: How does ${pointTitle.toLowerCase()} apply to your ${audienceTemplate?.applications.split(',')[0]}?`,
      `Practical step: Implement this truth in your daily routine this week`,
      `Community application: Share this insight with others in your circle`
    ];
  }

  private static generateApplications(request: SermonGenerationRequest) {
    const audienceTemplate = this.audienceTemplates[request.audienceType as keyof typeof this.audienceTemplates];
    
    return {
      actionSteps: [
        `Begin each day with prayer asking God to help you live out this truth`,
        `Identify one specific area where you can apply this teaching this week`,
        `Share your commitment with a trusted friend for accountability`,
        `Study additional passages that reinforce these principles`
      ],
      lifeChallenges: [
        `When facing ${audienceTemplate?.applications.split(',')[0]}, remember God's faithfulness`,
        `In your daily responsibilities, choose to honor God through your actions`,
        `During difficult decisions, seek God's wisdom through His Word and prayer`
      ],
      practicalTools: [
        `Daily devotional reading plan focused on this topic`,
        `Journal for recording insights and answered prayers`,
        `Accountability checklist for weekly progress review`,
        `Scripture memory system for key verses`
      ]
    };
  }

  private static generateCallToAction(request: SermonGenerationRequest) {
    const denominationTemplate = this.denominationalLenses[request.denominationLens as keyof typeof this.denominationalLenses];
    
    return {
      commitment: `Today, I'm asking you to make a specific commitment to live out this truth in alignment with ${denominationTemplate?.emphasis}.`,
      prayer: `Let's pray together for God's strength and wisdom as we take these faithful steps forward.`,
      nextSteps: [
        `Join our small group study to explore this topic further`,
        `Consider how you can serve others through this understanding`,
        `Look for opportunities to share what you've learned`,
        `Commit to daily application of these principles`
      ],
      resources: [
        `Recommended books for deeper study`,
        `Online resources and study guides`,
        `Local ministry opportunities that align with this teaching`,
        `Prayer and accountability partnerships`
      ]
    };
  }

  private static generateClosing(request: SermonGenerationRequest, title: string) {
    return {
      summary: `Today we've discovered that ${title.toLowerCase()} is not just theological concept, but a life-transforming truth that God wants to work in and through us.`,
      benediction: `May the God of all grace strengthen you in every good work and word, and may His peace, which surpasses understanding, guard your hearts and minds in Christ Jesus. Amen.`,
      preview: `Next week, we'll continue exploring how this truth connects to our calling as faithful disciples.`
    };
  }

  private static generateStudyGuide(request: SermonGenerationRequest) {
    return {
      discussionQuestions: [
        `How has your understanding of this topic deepened after today's message?`,
        `What specific challenges do you face in applying this truth to your life?`,
        `How can our community support each other in living this out?`,
        `What examples have you seen of people effectively applying this principle?`,
        `How does this truth relate to other areas of spiritual growth?`
      ],
      memoryVerse: request.scripture || '2 Timothy 3:16-17',
      additionalStudy: [
        `Read the full chapter containing today's main passage`,
        `Study the cross-references mentioned throughout the sermon`,
        `Research the historical background of the biblical text`,
        `Explore practical applications through Christian living resources`
      ],
      prayerPoints: [
        `Ask God for wisdom to understand His Word more deeply`,
        `Pray for strength to apply these truths consistently`,
        `Intercede for friends and family who need this message`,
        `Thank God for His faithfulness revealed in Scripture`
      ]
    };
  }

  private static generateWorshipSuggestions(request: SermonGenerationRequest) {
    const denominationWorship = this.denominationalLenses[request.denominationLens as keyof typeof this.denominationalLenses];
    
    // Base suggestions that can be adapted
    const baseSongs = {
      opening: ['How Great Is Our God', 'Blessed Be Your Name', '10,000 Reasons'],
      response: ['Lord, I Need You', 'Cornerstone', 'In Christ Alone'],
      closing: ['The Blessing', 'Way Maker', 'Great Are You Lord']
    };

    // Add denominational preferences
    if (request.denominationLens === 'catholic' || request.denominationLens === 'lutheran') {
      baseSongs.opening.push('Holy, Holy, Holy', 'Come, Thou Almighty King');
      baseSongs.closing.push('Be Thou My Vision', 'How Great Thou Art');
    }

    if (request.denominationLens === 'pentecostal') {
      baseSongs.opening.push('Spirit Break Out', 'Holy Spirit, Come');
      baseSongs.response.push('Spirit Song', 'Breathe on Me');
    }

    return {
      openingSongs: baseSongs.opening.slice(0, 3),
      responseSongs: baseSongs.response.slice(0, 3),
      closingSongs: baseSongs.closing.slice(0, 3)
    };
  }

  private static calculateDuration(length: string): number {
    const durations = {
      short: 8,
      medium: 18,
      long: 35,
      extended: 50
    };
    return durations[length as keyof typeof durations] || 18;
  }

  private static calculateWordCount(length: string): number {
    const wordCounts = {
      short: 1200,
      medium: 2700,
      long: 5250,
      extended: 7500
    };
    return wordCounts[length as keyof typeof wordCounts] || 2700;
  }

  private static async logSermonGeneration(request: SermonGenerationRequest, sermon: GeneratedSermon) {
    try {
      // Log to analytics (optional)
      console.log('Sermon generated:', {
        topic: request.topic,
        scripture: request.scripture,
        audience: request.audienceType,
        denomination: request.denominationLens,
        type: request.sermonType,
        language: request.language,
        wordCount: sermon.wordCount,
        duration: sermon.estimatedDuration
      });
    } catch (error) {
      console.error('Error logging sermon generation:', error);
    }
  }
}

export default EnhancedSermonAI; 