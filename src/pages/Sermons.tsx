import React, { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { 
  FileText, Plus, Edit3, Trash2, Search, Calendar, BookOpen, Lightbulb, 
  Target, Users, Clock, Mic, Star, Timer, Eye, Printer, Share, Settings,
  Brain, Sparkles, Save, Type, AlignLeft, Bold, Italic, List, 
  Presentation, FileDown, Volume2, BarChart, MessageSquare, Copy,
  ChevronDown, ChevronUp, Maximize, Minimize, PaintBucket, Languages,
  PenTool, RefreshCw, Archive, FolderOpen, UserPlus, GitBranch,
  ThumbsUp, TrendingUp, Database, Highlighter, Smartphone
} from "lucide-react";

// Rich Text Editor (will be dynamically imported)
const ReactQuill = React.lazy(() => import('react-quill'));

// Enhanced Sermon Generation with Biblical and Theological Knowledge
const OPENROUTER_API_KEY = "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";
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

// Christian theology database
const CHRISTIAN_THEOLOGICAL_KNOWLEDGE = {
  classics: {
    "John Calvin": ["Institutes of the Christian Religion", "Commentaries", "Reformed Theology"],
    "Augustine": ["Confessions", "City of God", "On Christian Doctrine"],
    "Thomas Aquinas": ["Summa Theologica", "Natural Law", "Scholastic Theology"],
    "Martin Luther": ["Commentary on Romans", "Justification by Faith", "Protestant Reformation"],
    "John Wesley": ["Sermons", "Methodist Theology", "Sanctification"]
  },
  modern: {
    "C.S. Lewis": ["Mere Christianity", "The Problem of Pain", "Apologetics"],
    "Dietrich Bonhoeffer": ["The Cost of Discipleship", "Ethics", "Radical Christianity"],
    "A.W. Tozer": ["The Pursuit of God", "The Knowledge of the Holy", "Mystical Theology"],
    "John Stott": ["The Cross of Christ", "Basic Christianity", "Evangelical Theology"],
    "Tim Keller": ["The Reason for God", "Gospel-Centered Ministry", "Urban Ministry"]
  },
  contemporary: {
    "N.T. Wright": ["Simply Christian", "Surprised by Hope", "New Testament Theology"],
    "Rick Warren": ["Purpose Driven Life", "Purpose Driven Church", "Practical Ministry"],
    "Max Lucado": ["Grace for the Moment", "Inspirational Writing", "Pastoral Care"],
    "Philip Yancey": ["What's So Amazing About Grace", "Apologetics", "Doubt and Faith"],
    "Francis Chan": ["Crazy Love", "Radical Discipleship", "Missional Living"]
  }
};

// Enhanced sermon generation function
const generateEnhancedSermon = async (topic: string, scripture: string, settings: { style: string; length: string; audience: string; includeQuotes: boolean }) => {
  try {
    // Search for relevant Bible verses using our Bible API
    const relevantVerses = await searchRelevantVerses(topic, scripture);
    
    // Get theological insights from Christian authors
    const theologicalInsights = getTheologicalInsights(topic);
    
    // Create enhanced prompt for sermon generation
    const enhancedPrompt = createSermonPrompt(topic, scripture, settings, relevantVerses, theologicalInsights);
    
    // Call AI with enhanced context
    const aiResponse = await callSermonGenerationAPI(enhancedPrompt);
    
    // Parse and structure the response
    return parseSermonResponse(aiResponse, topic, scripture, settings);
    
  } catch (error) {
    console.error('Error in enhanced sermon generation:', error);
    throw error;
  }
};

// Search for relevant Bible verses based on topic
const searchRelevantVerses = async (topic: string, scripture: string): Promise<string[]> => {
  try {
    const bibleApi = (await import('@/lib/bible-api')).default;
    const verses: string[] = [];
    
    // If specific scripture is provided, fetch it
    if (scripture) {
      const verse = await bibleApi.getVerseByReference(scripture, 'kjv');
      if (verse) {
        verses.push(`"${verse.text}" (${verse.reference})`);
      }
    }
    
    // Search for topic-related verses
    if (topic) {
      const searchResults = await bibleApi.searchVerses(topic, 'kjv', 5);
      searchResults.forEach(verse => {
        verses.push(`"${verse.text}" (${verse.reference})`);
      });
    }
    
    return verses.slice(0, 8); // Limit to 8 most relevant verses
  } catch (error) {
    console.error('Error searching verses:', error);
    return [];
  }
};

// Get theological insights from Christian authors
const getTheologicalInsights = (topic: string): string[] => {
  const insights: string[] = [];
  const topicLower = topic.toLowerCase();
  
  // Map topics to relevant authors and their works
  const topicMappings: Record<string, string[]> = {
    'grace': ['Augustine - Grace and Free Will', 'John Calvin - Irresistible Grace', 'Philip Yancey - What\'s So Amazing About Grace'],
    'faith': ['Martin Luther - Justification by Faith', 'John Stott - Basic Christianity', 'Tim Keller - The Reason for God'],
    'love': ['C.S. Lewis - The Four Loves', 'A.W. Tozer - The Pursuit of God', 'Max Lucado - Grace for the Moment'],
    'salvation': ['John Calvin - Reformed Soteriology', 'John Wesley - Methodist Salvation', 'Tim Keller - Gospel-Centered Ministry'],
    'discipleship': ['Dietrich Bonhoeffer - The Cost of Discipleship', 'Francis Chan - Crazy Love', 'John Stott - Basic Christianity'],
    'prayer': ['A.W. Tozer - The Pursuit of God', 'John Wesley - Methodist Prayer', 'Tim Keller - Prayer'],
    'suffering': ['C.S. Lewis - The Problem of Pain', 'Philip Yancey - Where Is God When It Hurts', 'Dietrich Bonhoeffer - Letters from Prison'],
    'hope': ['N.T. Wright - Surprised by Hope', 'C.S. Lewis - Mere Christianity', 'Max Lucado - Anxious for Nothing']
  };
  
  // Find relevant insights
  Object.keys(topicMappings).forEach(key => {
    if (topicLower.includes(key)) {
      insights.push(...topicMappings[key]);
    }
  });
  
  // Add general theological perspectives if no specific matches
  if (insights.length === 0) {
    insights.push(
      'Augustine - The importance of Scripture in understanding God\'s will',
      'John Calvin - The sovereignty of God in all aspects of life',
      'C.S. Lewis - The practical application of Christian truth'
    );
  }
  
  return insights.slice(0, 5);
};

// Create enhanced sermon prompt
const createSermonPrompt = (topic: string, scripture: string, settings: { style: string; length: string; audience: string; includeQuotes: boolean }, verses: string[], insights: string[]): string => {
  return `You are an expert Christian theologian and preacher tasked with creating a comprehensive sermon.

SERMON REQUIREMENTS:
- Topic: ${topic || 'Biblical teaching'}
- Primary Scripture: ${scripture || 'To be determined'}
- Length: ${settings.length} minutes
- Audience: ${settings.audience}
- Tone: ${settings.tone}
- Application Focus: ${settings.application_focus}

BIBLICAL FOUNDATION:
${verses.map(verse => `- ${verse}`).join('\n')}

THEOLOGICAL INSIGHTS FROM CHRISTIAN AUTHORS:
${insights.map(insight => `- ${insight}`).join('\n')}

Please create a detailed sermon with:
1. Compelling title
2. Strong introduction with hook
3. 3-4 main points with biblical support
4. Practical applications for daily life
5. Powerful conclusion with call to action
6. Additional scripture references throughout

The sermon should be thoroughly biblical, theologically sound, and practically relevant for modern believers.

Format your response as JSON with these keys:
- title: Sermon title
- introduction: Opening section
- mainPoints: Array of {title, content, scriptureSupport, application}
- conclusion: Closing thoughts
- callToAction: Specific next steps
- additionalScriptures: Array of relevant verse references`;
};

// Call OpenRouter API for sermon generation
const callSermonGenerationAPI = async (prompt: string): Promise<string> => {
  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "HTTP-Referer": "https://bible-aura.app",
        "X-Title": "Bible Aura - Sermon Generator",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "model": "moonshotai/kimi-k2:free",
        "messages": [
          {
            "role": "system",
            "content": "You are a master Christian theologian and preacher with deep knowledge of Scripture, church history, and contemporary Christian authors. Generate biblically faithful, theologically sound, and practically relevant sermons."
          },
          {
            "role": "user",
            "content": prompt
          }
        ],
        "temperature": 0.8,
        "max_tokens": 2000
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || "";
  } catch (error) {
    console.error('Sermon generation API error:', error);
    throw error;
  }
};

// Parse sermon response into structured format
const parseSermonResponse = (aiResponse: string, topic: string, scripture: string, settings: { style: string; length: string; audience: string; includeQuotes: boolean }) => {
  try {
    // Try to parse JSON response
    const parsed = JSON.parse(aiResponse);
    
    // Create structured sermon content
    const mainPoints = parsed.mainPoints || [
      { title: "Understanding the Context", content: "Biblical and historical background", duration: parseInt(settings.length) / 3 },
      { title: "Personal Application", content: "How this applies to our lives today", duration: parseInt(settings.length) / 3 },
      { title: "Living it Out", content: "Practical steps for implementation", duration: parseInt(settings.length) / 3 }
    ];
    
    const fullContent = `
# ${parsed.title || `Sermon on ${topic || scripture}`}

## Introduction
${parsed.introduction || `Today we explore the profound truths found in ${scripture || topic}...`}

## Main Points

        ${mainPoints.map((point: string, index: number) => `
### ${index + 1}. ${point.title}
${point.content}

**Scripture Support:** ${point.scriptureSupport || 'See primary text'}
**Application:** ${point.application || 'Consider how this applies to your daily walk with Christ'}
`).join('')}

## Conclusion
${parsed.conclusion || 'As we conclude, let us remember the transformative power of God\'s Word in our lives...'}

## Call to Action
${parsed.callToAction || 'This week, I challenge you to apply these biblical truths in practical ways...'}

## Additional Scripture References
${(parsed.additionalScriptures || []).map((ref: string) => `- ${ref}`).join('\n')}
`;

    return {
      title: parsed.title || `Sermon on ${topic || scripture}`,
      content: fullContent,
      outline: {
        introduction: parsed.introduction || `Introduction to ${topic || scripture}`,
        mainPoints: mainPoints,
        conclusion: parsed.conclusion || "Summary and call to action",
        callToAction: parsed.callToAction || "Practical next steps for the congregation"
      },
      scripture_references: [
        ...(scripture ? [scripture] : []),
        ...(parsed.additionalScriptures || [])
      ],
      tags: [settings.audience, settings.application_focus, "AI Generated", "Biblically Based"]
    };
    
  } catch (error) {
    console.error('Error parsing sermon response:', error);
    
    // Fallback to simple structure if JSON parsing fails
    return {
      title: `Sermon on ${topic || scripture}`,
      content: aiResponse || `A comprehensive sermon exploring ${topic || scripture} with biblical insights and practical applications.`,
      outline: {
        introduction: `Introduction to ${topic || scripture}`,
        mainPoints: [
          { title: "Biblical Foundation", content: "Exploring the scriptural basis", duration: parseInt(settings.length) / 3 },
          { title: "Theological Insights", content: "Learning from Christian scholars", duration: parseInt(settings.length) / 3 },
          { title: "Practical Application", content: "Living out these truths", duration: parseInt(settings.length) / 3 }
        ],
        conclusion: "Summary and call to action",
        callToAction: "Practical next steps for spiritual growth"
      },
      scripture_references: scripture ? [scripture] : [],
      tags: [settings.audience, settings.application_focus, "AI Generated", "Biblically Based"]
    };
  }
};

interface Sermon {
  id: string;
  title: string;
  content: string | null;
  outline: any | null;
  scripture_references: string[] | null;
  status: string | null;
  tags: string[] | null;
  series_name: string | null;
  template_type: string | null;
  ai_generated: boolean;
  word_count: number;
  estimated_duration: number;
  last_auto_save: string | null;
  version: number;
  created_at: string;
  updated_at: string;
  delivered_at: string | null;
  recording_url: string | null;
  feedback_score: number | null;
  view_count: number;
}

interface SermonTemplate {
  id: string;
  name: string;
  type: string;
  structure: any;
  description: string;
}

interface AISettings {
  denomination: string;
  tone: string;
  audience: string;
  length: string;
  illustration_style: string;
  application_focus: string;
}

interface BibleVerse {
  reference: string;
  text: string;
  translation: string;
}

const Sermons = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // State Management
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [selectedSermon, setSelectedSermon] = useState<Sermon | null>(null);
  const [showSermonDialog, setShowSermonDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("editor");
  const [editorMode, setEditorMode] = useState<'rich' | 'outline' | 'presentation'>('rich');
  const [loading, setLoading] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);
  
  // Sermon Content
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [richContent, setRichContent] = useState("");
  const [outline, setOutline] = useState<any>({
    introduction: "",
    mainPoints: [{ title: "", content: "", duration: 5 }],
    conclusion: "",
    callToAction: ""
  });
  const [scriptureRefs, setScriptureRefs] = useState("");
  const [status, setStatus] = useState("draft");
  const [tags, setTags] = useState("");
  const [seriesName, setSeriesName] = useState("");
  const [templateType, setTemplateType] = useState("");
  const [isAIGenerated, setIsAIGenerated] = useState(false);
  const [privateNotes, setPrivateNotes] = useState("");
  
  // Word Count & Analytics
  const [wordCount, setWordCount] = useState(0);
  const [estimatedDuration, setEstimatedDuration] = useState(0);
  const [readingProgress, setReadingProgress] = useState(0);
  
  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [seriesFilter, setSeriesFilter] = useState("all");
  const [sortBy, setSortBy] = useState("updated_at");
  
  // AI Features
  const [showAIDialog, setShowAIDialog] = useState(false);
  const [aiSettings, setAISettings] = useState<AISettings>({
    denomination: "general",
    tone: "conversational",
    audience: "adult",
    length: "30",
    illustration_style: "modern",
    application_focus: "personal"
  });
  const [aiPrompt, setAIPrompt] = useState("");
  const [aiScripture, setAIScripture] = useState("");
  const [generateLoading, setGenerateLoading] = useState(false);
  
  // Bible Verse Lookup
  const [showVerseDialog, setShowVerseDialog] = useState(false);
  const [verseQuery, setVerseQuery] = useState("");
  const [verseResults, setVerseResults] = useState<BibleVerse[]>([]);
  const [selectedTranslation, setSelectedTranslation] = useState("ESV");
  
  // Templates
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [templates, setTemplates] = useState<SermonTemplate[]>([]);
  
  // Collaboration
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [shareSettings, setShareSettings] = useState({
    allowComments: true,
    requireApproval: false,
    teamMembers: [] as string[]
  });
  
  // Delivery Features
  const [presentationMode, setPresentationMode] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  const [practiceMode, setPracticeMode] = useState(false);
  const [practiceTimer, setPracticeTimer] = useState(0);
  const [currentSection, setCurrentSection] = useState(0);
  
  // Auto-save
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>();
  const lastSaveRef = useRef<string>("");
  
  // Constants
  const statuses = [
    { value: "draft", label: "📝 Draft", color: "bg-gray-100 text-gray-800" },
    { value: "in_progress", label: "⏳ In Progress", color: "bg-blue-100 text-blue-800" },
    { value: "review", label: "👀 Review", color: "bg-yellow-100 text-yellow-800" },
    { value: "ready", label: "✅ Ready", color: "bg-green-100 text-green-800" },
    { value: "delivered", label: "🎤 Delivered", color: "bg-purple-100 text-purple-800" },
    { value: "archived", label: "📁 Archived", color: "bg-gray-100 text-gray-600" }
  ];

  const translations = ["ESV", "NIV", "KJV", "NASB", "NLT", "NKJV", "CSB", "MSG"];

  const sermonTemplates = [
    {
      id: "three-point",
      name: "Three-Point Sermon",
      type: "topical",
      description: "Classic three-point structure with introduction and conclusion",
      structure: {
        introduction: "Hook, Context, Preview",
        points: ["First Point", "Second Point", "Third Point"],
        conclusion: "Summary, Application, Call to Action"
      }
    },
    {
      id: "expository",
      name: "Expository Sermon",
      type: "expository",
      description: "Verse-by-verse exposition of Scripture",
      structure: {
        introduction: "Context, Background, Main Idea",
        points: ["Observation", "Interpretation", "Application"],
        conclusion: "Summary, Personal Response"
      }
    },
    {
      id: "narrative",
      name: "Narrative Sermon",
      type: "narrative",
      description: "Story-driven message following narrative structure",
      structure: {
        introduction: "Setting the Scene",
        points: ["Conflict", "Resolution", "Transformation"],
        conclusion: "Modern Application"
      }
    }
  ];

  // Auto-save functionality
  const triggerAutoSave = useCallback(() => {
    const currentContent = JSON.stringify({
      title, content: richContent, outline, scriptureRefs, tags, seriesName, privateNotes
    });
    
    if (currentContent !== lastSaveRef.current && user && title.trim()) {
      setAutoSaving(true);
      
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
      
      autoSaveTimeoutRef.current = setTimeout(async () => {
        try {
          await saveSermon(true);
          lastSaveRef.current = currentContent;
          setAutoSaving(false);
        } catch (error) {
          setAutoSaving(false);
        }
      }, 2000);
    }
  }, [title, richContent, outline, scriptureRefs, tags, seriesName, privateNotes, user]);

  // Word count calculation
  const calculateWordCount = useCallback((text: string) => {
    const plainText = text.replace(/<[^>]*>/g, '').trim();
    const words = plainText.split(/\s+/).filter(word => word.length > 0).length;
    setWordCount(words);
    setEstimatedDuration(Math.ceil(words / 150)); // 150 words per minute average
    return words;
  }, []);

  // Load sermons on mount
  useEffect(() => {
    if (user) {
      loadSermons();
    }
  }, [user]);

  // Auto-save trigger
  useEffect(() => {
    triggerAutoSave();
  }, [triggerAutoSave]);

  // Word count calculation
  useEffect(() => {
    calculateWordCount(richContent + JSON.stringify(outline));
  }, [richContent, outline, calculateWordCount]);

  const loadSermons = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('sermons')
        .select('*')
        .eq('user_id', user.id)
        .order(sortBy, { ascending: false });

      if (error) throw error;
      setSermons(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load sermons",
        variant: "destructive"
      });
    }
  };

  const saveSermon = async (isAutoSave: boolean = false) => {
    if (!user || !title.trim()) return;

    setLoading(!isAutoSave);
    try {
      const scriptureArray = scriptureRefs.split(',').map(ref => ref.trim()).filter(ref => ref);
      const tagArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      
      const sermonData = {
        user_id: user.id,
        title: title.trim(),
        content: richContent || null,
        outline: outline,
        scripture_references: scriptureArray.length > 0 ? scriptureArray : null,
        status,
        tags: tagArray.length > 0 ? tagArray : null,
        series_name: seriesName.trim() || null,
        template_type: templateType || null,
        ai_generated: isAIGenerated,
        word_count: wordCount,
        estimated_duration: estimatedDuration,
        last_auto_save: isAutoSave ? new Date().toISOString() : null,
        version: selectedSermon ? (selectedSermon.version || 1) + 1 : 1
      };

      if (selectedSermon) {
        const { error } = await supabase
          .from('sermons')
          .update(sermonData)
          .eq('id', selectedSermon.id);
        
        if (error) throw error;
        if (!isAutoSave) {
          toast({ title: "Success", description: "Sermon updated successfully" });
        }
      } else {
        const { data, error } = await supabase
          .from('sermons')
          .insert(sermonData)
          .select()
          .single();
        
        if (error) throw error;
        setSelectedSermon(data);
        if (!isAutoSave) {
          toast({ title: "Success", description: "Sermon created successfully" });
        }
      }

      await loadSermons();
      if (!isAutoSave) {
        resetForm();
      }
    } catch (error) {
      if (!isAutoSave) {
        toast({
          title: "Error",
          description: "Failed to save sermon",
          variant: "destructive"
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const generateAISermon = async () => {
    if (!aiPrompt.trim() && !aiScripture.trim()) {
      toast({
        title: "Error",
        description: "Please provide either a topic or scripture reference",
        variant: "destructive"
      });
      return;
    }

    setGenerateLoading(true);
    try {
      // Enhanced AI sermon generation with biblical and theological knowledge
      const sermon = await generateEnhancedSermon(aiPrompt, aiScripture, aiSettings);

      setTitle(sermon.title);
      setRichContent(sermon.content);
      setOutline(sermon.outline);
      setScriptureRefs(sermon.scripture_references.join(', '));
      setTags(sermon.tags.join(', '));
      setIsAIGenerated(true);
      setStatus("draft");
      
      setShowAIDialog(false);
      toast({
        title: "Success",
        description: "AI sermon generated successfully with biblical insights and theological knowledge!",
      });
    } catch (error) {
      console.error('Error generating sermon:', error);
      toast({
        title: "Error",
        description: "Failed to generate AI sermon. Please try again.",
        variant: "destructive"
      });
    } finally {
      setGenerateLoading(false);
    }
  };

  const searchBibleVerses = async () => {
    if (!verseQuery.trim()) return;

    try {
      // Use real Bible API for verse search
      const bibleApi = (await import('@/lib/bible-api')).default;
      const results = await bibleApi.searchVerses(verseQuery, selectedTranslation || 'kjv', 10);
      
      // Convert to expected format
      const verses: BibleVerse[] = results.map(verse => ({
        reference: verse.reference,
        text: verse.text,
        translation: selectedTranslation || 'kjv'
      }));
      
      setVerseResults(verses);
      
      if (verses.length === 0) {
        toast({
          title: "No results",
          description: "No verses found for your search query. Try different keywords.",
        });
      }
    } catch (error) {
      console.error('Bible verse search error:', error);
      toast({
        title: "Error",
        description: "Failed to search verses. Please try again.",
        variant: "destructive"
      });
    }
  };

  const insertVerse = (verse: BibleVerse) => {
    const verseText = `"${verse.text}" (${verse.reference} ${verse.translation})`;
    setRichContent(prev => prev + '\n\n' + verseText);
    setShowVerseDialog(false);
    
    // Add to scripture references if not already there
    const refs = scriptureRefs.split(',').map(r => r.trim()).filter(r => r);
    if (!refs.includes(verse.reference)) {
      setScriptureRefs(refs.concat(verse.reference).join(', '));
    }
  };

  const applyTemplate = (template: any) => {
    setTemplateType(template.id);
    setOutline({
      introduction: template.structure.introduction,
      mainPoints: template.structure.points.map((point: string) => ({
        title: point,
        content: "",
        duration: 5
      })),
      conclusion: template.structure.conclusion,
      callToAction: ""
    });
    setShowTemplateDialog(false);
    toast({
      title: "Template Applied",
      description: `${template.name} template has been applied to your sermon.`
    });
  };

  const duplicateSermon = async (sermon: Sermon) => {
    const newSermon = {
      ...sermon,
      id: undefined,
      title: `${sermon.title} (Copy)`,
      status: 'draft',
      version: 1,
      created_at: undefined,
      updated_at: undefined,
      delivered_at: null,
      recording_url: null
    };
    
    try {
      const { error } = await supabase
        .from('sermons')
        .insert(newSermon);
      
      if (error) throw error;
      await loadSermons();
      toast({
        title: "Success",
        description: "Sermon duplicated successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to duplicate sermon",
        variant: "destructive"
      });
    }
  };

  const exportSermon = (format: 'txt' | 'pdf' | 'print') => {
    if (!selectedSermon) return;
    
    if (format === 'print') {
      window.print();
    } else if (format === 'txt') {
      const content = `${selectedSermon.title}\n\n${selectedSermon.content || ''}`;
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedSermon.title}.txt`;
      a.click();
    }
    // PDF export would require additional library
  };

  const resetForm = () => {
    setSelectedSermon(null);
    setTitle("");
    setContent("");
    setRichContent("");
    setOutline({
      introduction: "",
      mainPoints: [{ title: "", content: "", duration: 5 }],
      conclusion: "",
      callToAction: ""
    });
    setScriptureRefs("");
    setStatus("draft");
    setTags("");
    setSeriesName("");
    setTemplateType("");
    setIsAIGenerated(false);
    setPrivateNotes("");
    setShowSermonDialog(false);
    setActiveTab("editor");
    setEditorMode('rich');
  };

  const editSermon = (sermon: Sermon) => {
    setSelectedSermon(sermon);
    setTitle(sermon.title);
    setContent(sermon.content || "");
    setRichContent(sermon.content || "");
    setOutline(sermon.outline || {
      introduction: "",
      mainPoints: [{ title: "", content: "", duration: 5 }],
      conclusion: "",
      callToAction: ""
    });
    setScriptureRefs(sermon.scripture_references?.join(', ') || "");
    setStatus(sermon.status || "draft");
    setTags(sermon.tags?.join(', ') || "");
    setSeriesName(sermon.series_name || "");
    setTemplateType(sermon.template_type || "");
    setIsAIGenerated(sermon.ai_generated || false);
    setShowSermonDialog(true);
  };

  const deleteSermon = async (sermonId: string) => {
    try {
      const { error } = await supabase
        .from('sermons')
        .delete()
        .eq('id', sermonId);

      if (error) throw error;
      
      await loadSermons();
      toast({ title: "Success", description: "Sermon deleted" });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete sermon",
        variant: "destructive"
      });
    }
  };

  const getStatusDisplay = (statusValue: string | null) => {
    const statusObj = statuses.find(s => s.value === statusValue);
    return statusObj ? (
      <Badge className={statusObj.color}>
        {statusObj.label}
      </Badge>
    ) : null;
  };

  const filteredSermons = sermons.filter(sermon => {
    const matchesSearch = sermon.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sermon.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sermon.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = statusFilter === "all" || sermon.status === statusFilter;
    const matchesSeries = seriesFilter === "all" || sermon.series_name === seriesFilter;
    
    return matchesSearch && matchesStatus && matchesSeries;
  });

  const uniqueSeries = Array.from(new Set(sermons.map(s => s.series_name).filter(Boolean)));

  if (!user) {
    return (
      <div className="h-screen bg-background flex items-center justify-center p-8">
        <div className="text-center space-y-6 max-w-md">
          <Mic className="h-16 w-16 text-primary mx-auto" />
          <h1 className="text-3xl font-bold text-primary">Sermon Creator</h1>
          <p className="text-muted-foreground text-lg">
            Create and manage your sermons with AI assistance
          </p>
          <p className="text-sm text-muted-foreground">
            Please sign in to access the sermon creator
          </p>
          <Button 
            asChild 
            size="lg"
            className="bg-primary hover:bg-primary/90"
          >
            <a href="/auth">Sign In</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background overflow-hidden flex flex-col">
      {/* Header */}
      <div className="bg-aura-gradient text-white p-4 border-b flex-shrink-0">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mic className="h-6 w-6" />
              <h1 className="text-2xl font-divine">Advanced Sermon Creator</h1>
              <Star className="h-5 w-5" />
            </div>
            <div className="flex items-center gap-2">
              {autoSaving && (
                <div className="flex items-center gap-2 text-white/80">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Auto-saving...</span>
                </div>
              )}
              <Button variant="outline" className="text-white border-white/20 hover:bg-white/10">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
          <p className="text-white/80 mt-1">Professional sermon creation with AI assistance and collaboration tools</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          
          {/* Action Bar */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div className="flex flex-wrap gap-2">
              <Dialog open={showSermonDialog} onOpenChange={setShowSermonDialog}>
                <DialogTrigger asChild>
                  <Button onClick={resetForm}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Sermon
                  </Button>
                </DialogTrigger>
              </Dialog>
              
              <Dialog open={showAIDialog} onOpenChange={setShowAIDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Brain className="h-4 w-4 mr-2" />
                    AI Generate
                  </Button>
                </DialogTrigger>
              </Dialog>
              
              <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <FileText className="h-4 w-4 mr-2" />
                    Templates
                  </Button>
                </DialogTrigger>
              </Dialog>
              
              <Button variant="outline">
                <Archive className="h-4 w-4 mr-2" />
                Series Manager
              </Button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search sermons..."
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {statuses.map(status => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={seriesFilter} onValueChange={setSeriesFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by series" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Series</SelectItem>
                {uniqueSeries.map(series => (
                  <SelectItem key={series} value={series!}>
                    {series}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="updated_at">Last Updated</SelectItem>
                <SelectItem value="created_at">Date Created</SelectItem>
                <SelectItem value="title">Title</SelectItem>
                <SelectItem value="status">Status</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Stats Dashboard */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
            <Card>
              <CardContent className="p-4 text-center">
                <FileText className="h-6 w-6 mx-auto mb-2 text-primary" />
                <div className="text-xl font-bold">{sermons.length}</div>
                <div className="text-xs text-muted-foreground">Total Sermons</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <Target className="h-6 w-6 mx-auto mb-2 text-green-600" />
                <div className="text-xl font-bold">
                  {sermons.filter(s => s.status === 'ready').length}
                </div>
                <div className="text-xs text-muted-foreground">Ready</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <Mic className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                <div className="text-xl font-bold">
                  {sermons.filter(s => s.status === 'delivered').length}
                </div>
                <div className="text-xs text-muted-foreground">Delivered</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <Brain className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                <div className="text-xl font-bold">
                  {sermons.filter(s => s.ai_generated).length}
                </div>
                <div className="text-xs text-muted-foreground">AI Generated</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <FolderOpen className="h-6 w-6 mx-auto mb-2 text-orange-600" />
                <div className="text-xl font-bold">{uniqueSeries.length}</div>
                <div className="text-xs text-muted-foreground">Series</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <TrendingUp className="h-6 w-6 mx-auto mb-2 text-indigo-600" />
                <div className="text-xl font-bold">
                  {Math.round(sermons.reduce((acc, s) => acc + (s.feedback_score || 0), 0) / sermons.length) || 0}%
                </div>
                <div className="text-xs text-muted-foreground">Avg Rating</div>
              </CardContent>
            </Card>
          </div>

          {/* Sermons Grid */}
          <div className="grid gap-6">
            {filteredSermons.length > 0 ? (
              filteredSermons.map((sermon) => (
                <Card key={sermon.id} className="group hover:shadow-lg transition-all duration-200">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-3 flex-1">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>Created {new Date(sermon.created_at).toLocaleDateString()}</span>
                          {sermon.updated_at !== sermon.created_at && (
                            <span>• Updated {new Date(sermon.updated_at).toLocaleDateString()}</span>
                          )}
                          {sermon.delivered_at && (
                            <span>• Delivered {new Date(sermon.delivered_at).toLocaleDateString()}</span>
                          )}
                        </div>
                        
                        <CardTitle className="text-xl group-hover:text-primary transition-colors">
                          {sermon.title}
                          {sermon.ai_generated && (
                            <Badge variant="outline" className="ml-2">
                              <Sparkles className="h-3 w-3 mr-1" />
                              AI
                            </Badge>
                          )}
                        </CardTitle>
                        
                        <div className="flex flex-wrap gap-2">
                          {sermon.status && getStatusDisplay(sermon.status)}
                          {sermon.series_name && (
                            <Badge variant="secondary">
                              <FolderOpen className="h-3 w-3 mr-1" />
                              {sermon.series_name}
                            </Badge>
                          )}
                          {sermon.tags?.map((tag, idx) => (
                            <Badge key={idx} variant="outline">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Type className="h-4 w-4" />
                            <span>{sermon.word_count} words</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{sermon.estimated_duration} min</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            <span>{sermon.view_count} views</span>
                          </div>
                          {sermon.feedback_score && (
                            <div className="flex items-center gap-1">
                              <ThumbsUp className="h-4 w-4" />
                              <span>{sermon.feedback_score}% positive</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => editSermon(sermon)}
                          title="Edit Sermon"
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => duplicateSermon(sermon)}
                          title="Duplicate Sermon"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteSermon(sermon.id)}
                          title="Delete Sermon"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    {sermon.content && (
                      <p className="text-muted-foreground mb-4 line-clamp-3">
                        {sermon.content.replace(/<[^>]*>/g, '').substring(0, 200)}
                        {sermon.content.length > 200 && "..."}
                      </p>
                    )}
                    
                    {sermon.scripture_references && sermon.scripture_references.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium flex items-center gap-2">
                          <BookOpen className="h-4 w-4" />
                          Scripture References
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {sermon.scripture_references.map((ref, idx) => (
                            <Badge key={idx} variant="secondary">
                              {ref}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center mt-4 pt-4 border-t">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedSermon(sermon);
                            setPresentationMode(true);
                          }}
                        >
                          <Presentation className="h-4 w-4 mr-2" />
                          Present
                        </Button>
                                                 <Button
                           size="sm"
                           variant="outline"
                           onClick={() => exportSermon('print')}
                         >
                           <Printer className="h-4 w-4 mr-2" />
                           Print
                         </Button>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Share className="h-4 w-4 mr-2" />
                          Share
                        </Button>
                        <Button size="sm" variant="outline">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Feedback
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Mic className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">
                    {searchQuery ? "No sermons found" : "Start Creating Sermons"}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery 
                      ? "Try adjusting your search terms or create a new sermon."
                      : "Begin organizing your messages with AI assistance and professional tools."
                    }
                  </p>
                  <div className="flex gap-2 justify-center">
                    <Button onClick={() => setShowSermonDialog(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Sermon
                    </Button>
                    <Button variant="outline" onClick={() => setShowAIDialog(true)}>
                      <Brain className="h-4 w-4 mr-2" />
                      AI Generate
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Sermon Dialog */}
      <Dialog open={showSermonDialog} onOpenChange={setShowSermonDialog}>
        <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2">
                {selectedSermon ? "Edit Sermon" : "Create New Sermon"}
                {autoSaving && (
                  <Badge variant="outline" className="text-xs">
                    <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                    Auto-saving...
                  </Badge>
                )}
              </DialogTitle>
              <div className="flex items-center gap-2">
                <div className="text-sm text-muted-foreground">
                  {wordCount} words • {estimatedDuration} min
                </div>
                {editorMode !== 'presentation' && (
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant={editorMode === 'rich' ? 'default' : 'outline'}
                      onClick={() => setEditorMode('rich')}
                    >
                      <Type className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant={editorMode === 'outline' ? 'default' : 'outline'}
                      onClick={() => setEditorMode('outline')}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant={editorMode === 'presentation' ? 'default' : 'outline'}
                      onClick={() => setEditorMode('presentation')}
                    >
                      <Presentation className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </DialogHeader>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="editor">Editor</TabsTrigger>
              <TabsTrigger value="outline">Outline</TabsTrigger>
              <TabsTrigger value="verses">Verses</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="collaboration">Share</TabsTrigger>
              <TabsTrigger value="delivery">Delivery</TabsTrigger>
            </TabsList>
            
            {/* Editor Tab */}
            <TabsContent value="editor" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                <div className="lg:col-span-3 space-y-4">
                  <div>
                    <Label htmlFor="title">Sermon Title *</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Enter sermon title..."
                      className="text-lg"
                    />
                  </div>

                  {editorMode === 'rich' && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label>Sermon Content</Label>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setShowVerseDialog(true)}
                          >
                            <BookOpen className="h-4 w-4 mr-2" />
                            Add Verse
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setFontSize(prev => Math.min(prev + 2, 24))}
                          >
                            <Type className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="border rounded-lg">
                        <React.Suspense fallback={<div className="h-96 bg-muted animate-pulse rounded-lg" />}>
                          <ReactQuill
                            value={richContent}
                            onChange={setRichContent}
                            modules={{
                              toolbar: [
                                [{ 'header': [1, 2, 3, false] }],
                                ['bold', 'italic', 'underline', 'strike'],
                                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                                [{ 'indent': '-1'}, { 'indent': '+1' }],
                                ['link', 'blockquote'],
                                ['clean']
                              ],
                            }}
                            style={{ minHeight: '400px', fontSize: `${fontSize}px` }}
                          />
                        </React.Suspense>
                      </div>
                    </div>
                  )}

                  {editorMode === 'presentation' && (
                    <div className="bg-black text-white p-8 rounded-lg min-h-[500px]">
                      <div className="text-center">
                        <h1 className="text-4xl font-bold mb-8">{title}</h1>
                        <div 
                          className="text-2xl leading-relaxed"
                          style={{ fontSize: `${fontSize + 8}px` }}
                          dangerouslySetInnerHTML={{ __html: richContent }}
                        />
                      </div>
                      <div className="fixed bottom-4 right-4 flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setFontSize(prev => Math.max(prev - 2, 12))}
                        >
                          A-
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setFontSize(prev => Math.min(prev + 2, 32))}
                        >
                          A+
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="space-y-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="w-full justify-start"
                        onClick={() => setShowTemplateDialog(true)}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Apply Template
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="w-full justify-start"
                        onClick={() => setShowAIDialog(true)}
                      >
                        <Brain className="h-4 w-4 mr-2" />
                        AI Improve
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="w-full justify-start"
                        onClick={() => exportSermon('txt')}
                      >
                        <FileDown className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Statistics</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Words:</span>
                        <span className="font-mono">{wordCount}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Duration:</span>
                        <span className="font-mono">{estimatedDuration} min</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Characters:</span>
                        <span className="font-mono">{richContent.length}</span>
                      </div>
                      <Progress value={(wordCount / 3000) * 100} className="h-2" />
                      <div className="text-xs text-muted-foreground">
                        Target: 3000 words
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Private Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Textarea
                        value={privateNotes}
                        onChange={(e) => setPrivateNotes(e.target.value)}
                        placeholder="Private notes, reminders, delivery notes..."
                        className="min-h-[100px] text-sm"
                      />
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
            
            {/* Outline Tab */}
            <TabsContent value="outline" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  {/* Introduction */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Lightbulb className="h-5 w-5" />
                        Introduction
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Textarea
                        value={outline.introduction}
                        onChange={(e) => setOutline(prev => ({ ...prev, introduction: e.target.value }))}
                        placeholder="Hook, context, main idea preview..."
                        className="min-h-[120px]"
                      />
                    </CardContent>
                  </Card>

                  {/* Main Points */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <List className="h-5 w-5" />
                          Main Points
                        </CardTitle>
                        <Button
                          size="sm"
                          onClick={() => setOutline(prev => ({
                            ...prev,
                            mainPoints: [...prev.mainPoints, { title: "", content: "", duration: 5 }]
                          }))}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Point
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {outline.mainPoints.map((point, index) => (
                        <Card key={index} className="border-l-4 border-l-primary">
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <h4 className="font-semibold">Point {index + 1}</h4>
                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Clock className="h-4 w-4" />
                                  <Input
                                    type="number"
                                    value={point.duration}
                                    onChange={(e) => {
                                      const newPoints = [...outline.mainPoints];
                                      newPoints[index].duration = parseInt(e.target.value) || 5;
                                      setOutline(prev => ({ ...prev, mainPoints: newPoints }));
                                    }}
                                    className="w-16 h-8"
                                    min="1"
                                    max="60"
                                  />
                                  <span>min</span>
                                </div>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    if (outline.mainPoints.length > 1) {
                                      setOutline(prev => ({
                                        ...prev,
                                        mainPoints: prev.mainPoints.filter((_, i) => i !== index)
                                      }));
                                    }
                                  }}
                                  disabled={outline.mainPoints.length === 1}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <Input
                              value={point.title}
                              onChange={(e) => {
                                const newPoints = [...outline.mainPoints];
                                newPoints[index].title = e.target.value;
                                setOutline(prev => ({ ...prev, mainPoints: newPoints }));
                              }}
                              placeholder="Point title or main idea..."
                              className="font-medium"
                            />
                            <Textarea
                              value={point.content}
                              onChange={(e) => {
                                const newPoints = [...outline.mainPoints];
                                newPoints[index].content = e.target.value;
                                setOutline(prev => ({ ...prev, mainPoints: newPoints }));
                              }}
                              placeholder="Supporting details, scriptures, illustrations, applications..."
                              className="min-h-[100px]"
                            />
                          </CardContent>
                        </Card>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Conclusion */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        Conclusion
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Textarea
                        value={outline.conclusion}
                        onChange={(e) => setOutline(prev => ({ ...prev, conclusion: e.target.value }))}
                        placeholder="Summary of main points, final thoughts..."
                        className="min-h-[100px]"
                      />
                    </CardContent>
                  </Card>

                  {/* Call to Action */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Call to Action
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Textarea
                        value={outline.callToAction}
                        onChange={(e) => setOutline(prev => ({ ...prev, callToAction: e.target.value }))}
                        placeholder="Practical next steps, response, commitment..."
                        className="min-h-[100px]"
                      />
                    </CardContent>
                  </Card>
                </div>

                {/* Outline Sidebar */}
                <div className="space-y-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Structure Tools</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Button size="sm" variant="outline" className="w-full justify-start">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Reorganize Points
                      </Button>
                      <Button size="sm" variant="outline" className="w-full justify-start">
                        <Lightbulb className="h-4 w-4 mr-2" />
                        Add Transition
                      </Button>
                      <Button size="sm" variant="outline" className="w-full justify-start">
                        <BookOpen className="h-4 w-4 mr-2" />
                        Find Illustration
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Timing Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="text-sm space-y-2">
                        <div className="flex justify-between">
                          <span>Introduction:</span>
                          <span>3 min</span>
                        </div>
                        {outline.mainPoints.map((point, index) => (
                          <div key={index} className="flex justify-between">
                            <span>Point {index + 1}:</span>
                            <span>{point.duration} min</span>
                          </div>
                        ))}
                        <div className="flex justify-between">
                          <span>Conclusion:</span>
                          <span>5 min</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-semibold">
                          <span>Total:</span>
                          <span>{8 + outline.mainPoints.reduce((acc, p) => acc + p.duration, 0)} min</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
            
            {/* Verses Tab */}
            <TabsContent value="verses" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Search className="h-5 w-5" />
                        Verse Search
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex gap-2">
                        <Input
                          value={verseQuery}
                          onChange={(e) => setVerseQuery(e.target.value)}
                          placeholder="Search by topic, reference, or keywords..."
                          className="flex-1"
                        />
                        <Select value={selectedTranslation} onValueChange={setSelectedTranslation}>
                          <SelectTrigger className="w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {translations.map(translation => (
                              <SelectItem key={translation} value={translation}>
                                {translation}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button onClick={searchBibleVerses}>
                          <Search className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {["love", "faith", "hope", "forgiveness", "salvation", "grace"].map(topic => (
                          <Button
                            key={topic}
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setVerseQuery(topic);
                              searchBibleVerses();
                            }}
                          >
                            {topic}
                          </Button>
                        ))}
                      </div>

                      <ScrollArea className="h-96">
                        <div className="space-y-3">
                          {verseResults.map((verse, index) => (
                            <Card key={index} className="border-l-4 border-l-blue-500">
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between mb-2">
                                  <Badge variant="outline" className="text-primary">
                                    {verse.reference} ({verse.translation})
                                  </Badge>
                                  <Button 
                                    size="sm" 
                                    onClick={() => insertVerse(verse)}
                                    className="ml-2"
                                  >
                                    <Plus className="h-4 w-4 mr-1" />
                                    Insert
                                  </Button>
                                </div>
                                <p className="text-sm leading-relaxed">{verse.text}</p>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5" />
                        Scripture References
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Textarea
                        value={scriptureRefs}
                        onChange={(e) => setScriptureRefs(e.target.value)}
                        placeholder="Enter scripture references (comma-separated)..."
                        className="min-h-[100px]"
                      />
                      
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Quick References</Label>
                        <div className="flex flex-wrap gap-2">
                          {scriptureRefs.split(',').map(ref => ref.trim()).filter(ref => ref).map((ref, index) => (
                            <Badge key={index} variant="secondary" className="flex items-center gap-2">
                              {ref}
                              <button 
                                onClick={() => {
                                  const refs = scriptureRefs.split(',').map(r => r.trim()).filter(r => r);
                                  setScriptureRefs(refs.filter(r => r !== ref).join(', '));
                                }}
                                className="ml-1"
                              >
                                ×
                              </button>
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Database className="h-5 w-5" />
                        Cross References
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 text-sm">
                        <div className="p-3 bg-muted rounded-lg">
                          <div className="font-medium mb-1">Related to: John 3:16</div>
                          <div className="text-muted-foreground">
                            • Romans 5:8 - God's love demonstrated<br/>
                            • 1 John 4:9 - God's love manifested<br/>
                            • Ephesians 2:4-5 - Rich in mercy
                          </div>
                        </div>
                        <Button size="sm" variant="outline" className="w-full">
                          Generate Cross References
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Languages className="h-5 w-5" />
                        Original Language
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 text-sm">
                        <div className="p-3 bg-muted rounded-lg">
                          <div className="font-medium mb-1">Greek: ἀγάπη (agape)</div>
                          <div className="text-muted-foreground">
                            Unconditional love, divine love, sacrificial love
                          </div>
                        </div>
                        <Button size="sm" variant="outline" className="w-full">
                          Word Study Tools
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
            
            {/* Details Tab */}
            <TabsContent value="details" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Basic Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Status</Label>
                          <Select value={status} onValueChange={setStatus}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {statuses.map((statusOption) => (
                                <SelectItem key={statusOption.value} value={statusOption.value}>
                                  {statusOption.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Template Type</Label>
                          <Select value={templateType} onValueChange={setTemplateType}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select template" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="three-point">Three-Point</SelectItem>
                              <SelectItem value="expository">Expository</SelectItem>
                              <SelectItem value="narrative">Narrative</SelectItem>
                              <SelectItem value="topical">Topical</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <Label>Series Name</Label>
                        <Input
                          value={seriesName}
                          onChange={(e) => setSeriesName(e.target.value)}
                          placeholder="e.g., 'Faith in Action', 'Easter Series'..."
                        />
                      </div>

                      <div>
                        <Label>Tags</Label>
                        <Input
                          value={tags}
                          onChange={(e) => setTags(e.target.value)}
                          placeholder="Sunday Service, Youth, Easter (comma-separated)"
                        />
                        <div className="flex flex-wrap gap-2 mt-2">
                          {["Sunday Service", "Youth", "Easter", "Christmas", "Baptism", "Communion", "Faith", "Hope", "Love", "Prayer"].map(tag => (
                            <Button
                              key={tag}
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                const currentTags = tags.split(',').map(t => t.trim()).filter(t => t);
                                if (!currentTags.includes(tag)) {
                                  setTags([...currentTags, tag].join(', '));
                                }
                              }}
                              className="text-xs"
                            >
                              {tag}
                            </Button>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id="ai-generated"
                          checked={isAIGenerated}
                          onCheckedChange={setIsAIGenerated}
                        />
                        <Label htmlFor="ai-generated">AI Generated</Label>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Analytics & Metadata</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <Label className="text-xs text-muted-foreground">Word Count</Label>
                          <div className="font-mono text-lg">{wordCount}</div>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Est. Duration</Label>
                          <div className="font-mono text-lg">{estimatedDuration} min</div>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Characters</Label>
                          <div className="font-mono text-lg">{richContent.length}</div>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Version</Label>
                          <div className="font-mono text-lg">{selectedSermon?.version || 1}</div>
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-2">
                        <Label className="text-sm">Reading Level</Label>
                        <Progress value={75} className="h-2" />
                        <div className="text-xs text-muted-foreground">Grade 8 level (Good for general audience)</div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm">Completion Status</Label>
                        <Progress value={(wordCount / 3000) * 100} className="h-2" />
                        <div className="text-xs text-muted-foreground">
                          {Math.round((wordCount / 3000) * 100)}% of target length
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Delivery Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label>Delivery Date</Label>
                        <Input
                          type="datetime-local"
                          className="w-full"
                        />
                      </div>

                      <div>
                        <Label>Recording URL</Label>
                        <Input
                          placeholder="https://..."
                          className="w-full"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-xs text-muted-foreground">View Count</Label>
                          <div className="font-mono">{selectedSermon?.view_count || 0}</div>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Feedback Score</Label>
                          <div className="font-mono">{selectedSermon?.feedback_score || 0}%</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
            
            {/* Collaboration Tab */}
            <TabsContent value="collaboration" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Share className="h-5 w-5" />
                        Share Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Allow Comments</Label>
                            <div className="text-sm text-muted-foreground">
                              Team members can leave feedback
                            </div>
                          </div>
                          <Switch
                            checked={shareSettings.allowComments}
                            onCheckedChange={(checked) => 
                              setShareSettings(prev => ({ ...prev, allowComments: checked }))
                            }
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Require Approval</Label>
                            <div className="text-sm text-muted-foreground">
                              Submit for review before delivery
                            </div>
                          </div>
                          <Switch
                            checked={shareSettings.requireApproval}
                            onCheckedChange={(checked) => 
                              setShareSettings(prev => ({ ...prev, requireApproval: checked }))
                            }
                          />
                        </div>

                        <Separator />

                        <div>
                          <Label>Share Link</Label>
                          <div className="flex gap-2 mt-2">
                            <Input
                              value="https://sermon.app/share/abc123"
                              readOnly
                              className="font-mono text-sm"
                            />
                            <Button size="sm" variant="outline">
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Quick Share</Label>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <MessageSquare className="h-4 w-4 mr-2" />
                              Email Team
                            </Button>
                            <Button size="sm" variant="outline">
                              <Share className="h-4 w-4 mr-2" />
                              Generate PDF
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <GitBranch className="h-5 w-5" />
                        Version History
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-48">
                        <div className="space-y-3">
                          {[
                            { version: "v3", date: "2024-01-15", author: "Current User", changes: "Updated conclusion and added illustrations" },
                            { version: "v2", date: "2024-01-14", author: "Team Lead", changes: "Reviewed and approved main points" },
                            { version: "v1", date: "2024-01-13", author: "Current User", changes: "Initial draft created" }
                          ].map((item, index) => (
                            <div key={index} className="flex items-start justify-between p-3 border rounded-lg">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline">{item.version}</Badge>
                                  <span className="text-sm font-medium">{item.author}</span>
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">
                                  {item.date} • {item.changes}
                                </div>
                              </div>
                              <Button size="sm" variant="ghost">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <UserPlus className="h-5 w-5" />
                        Team Members
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label>Add Team Member</Label>
                        <div className="flex gap-2 mt-2">
                          <Input placeholder="Enter email address..." />
                          <Button size="sm">
                            <UserPlus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Current Team</Label>
                        <div className="space-y-2">
                          {[
                            { name: "John Pastor", role: "Lead Pastor", email: "john@church.com" },
                            { name: "Sarah Teacher", role: "Youth Leader", email: "sarah@church.com" },
                            { name: "Mike Elder", role: "Elder", email: "mike@church.com" }
                          ].map((member, index) => (
                            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                              <div>
                                <div className="font-medium">{member.name}</div>
                                <div className="text-sm text-muted-foreground">{member.role}</div>
                              </div>
                              <Select defaultValue="reviewer">
                                <SelectTrigger className="w-32">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="editor">Editor</SelectItem>
                                  <SelectItem value="reviewer">Reviewer</SelectItem>
                                  <SelectItem value="viewer">Viewer</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5" />
                        Comments
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-48">
                        <div className="space-y-3">
                          {[
                            { author: "Sarah Teacher", time: "2 hours ago", comment: "Love the illustration in point 2! Very relatable for our youth group." },
                            { author: "Mike Elder", time: "1 day ago", comment: "Consider adding more scripture support for the third point." }
                          ].map((comment, index) => (
                            <div key={index} className="p-3 border rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium text-sm">{comment.author}</span>
                                <span className="text-xs text-muted-foreground">{comment.time}</span>
                              </div>
                              <p className="text-sm">{comment.comment}</p>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                      <div className="mt-4">
                        <Textarea placeholder="Add a comment..." className="min-h-[80px]" />
                        <Button size="sm" className="mt-2">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Add Comment
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
            
            {/* Delivery Tab */}
            <TabsContent value="delivery" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Presentation className="h-5 w-5" />
                        Presentation Mode
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label>Large Font Mode</Label>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label>Dark Mode</Label>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label>Highlight Current Section</Label>
                          <Switch defaultChecked />
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <Label>Font Size</Label>
                        <div className="flex items-center gap-4 mt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setFontSize(prev => Math.max(prev - 2, 12))}
                          >
                            A-
                          </Button>
                          <span className="font-mono text-sm w-12 text-center">{fontSize}px</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setFontSize(prev => Math.min(prev + 2, 32))}
                          >
                            A+
                          </Button>
                        </div>
                      </div>

                      <Button className="w-full">
                        <Presentation className="h-4 w-4 mr-2" />
                        Enter Presentation Mode
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Timer className="h-5 w-5" />
                        Practice Timer
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-center">
                        <div className="text-4xl font-mono font-bold">
                          {Math.floor(practiceTimer / 60).toString().padStart(2, '0')}:
                          {(practiceTimer % 60).toString().padStart(2, '0')}
                        </div>
                        <div className="text-sm text-muted-foreground mt-2">
                          Section: Introduction
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button 
                          className="flex-1"
                          onClick={() => setPracticeMode(!practiceMode)}
                        >
                          {practiceMode ? 'Pause' : 'Start'} Practice
                        </Button>
                        <Button variant="outline" onClick={() => setPracticeTimer(0)}>
                          Reset
                        </Button>
                      </div>

                      <div className="space-y-2">
                        <Label>Section Timing</Label>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span>Introduction:</span>
                            <span className="text-green-600">✓ 3:20</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Point 1:</span>
                            <span className="font-mono">--:--</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Point 2:</span>
                            <span className="font-mono">--:--</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Conclusion:</span>
                            <span className="font-mono">--:--</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Highlighter className="h-5 w-5" />
                        Delivery Tools
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <Button variant="outline" className="w-full justify-start">
                          <PenTool className="h-4 w-4 mr-2" />
                          Highlight Key Points
                        </Button>
                        <Button variant="outline" className="w-full justify-start">
                          <Volume2 className="h-4 w-4 mr-2" />
                          Voice Notes
                        </Button>
                        <Button variant="outline" className="w-full justify-start">
                          <Smartphone className="h-4 w-4 mr-2" />
                          Mobile Friendly View
                        </Button>
                                                 <Button variant="outline" className="w-full justify-start">
                           <Printer className="h-4 w-4 mr-2" />
                           Print Pulpit Notes
                         </Button>
                      </div>

                      <Separator />

                      <div>
                        <Label>Quick Actions</Label>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          <Button size="sm" variant="outline">
                            <FileDown className="h-4 w-4 mr-2" />
                            Export
                          </Button>
                          <Button size="sm" variant="outline">
                            <Share className="h-4 w-4 mr-2" />
                            Share
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart className="h-5 w-5" />
                        Delivery Analytics
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                          <div className="text-2xl font-bold">4.8</div>
                          <div className="text-xs text-muted-foreground">Avg Rating</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold">156</div>
                          <div className="text-xs text-muted-foreground">Views</div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Engagement:</span>
                          <span>92%</span>
                        </div>
                        <Progress value={92} className="h-2" />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm">Recent Feedback</Label>
                        <div className="space-y-2">
                          {[
                            { rating: 5, comment: "Powerful message!" },
                            { rating: 4, comment: "Clear and practical." }
                          ].map((feedback, index) => (
                            <div key={index} className="p-2 bg-muted rounded text-sm">
                              <div className="flex items-center gap-2 mb-1">
                                <div className="flex">
                                  {Array.from({length: 5}).map((_, i) => (
                                    <Star 
                                      key={i} 
                                      className={`h-3 w-3 ${i < feedback.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                                    />
                                  ))}
                                </div>
                              </div>
                              <p className="text-xs text-muted-foreground">{feedback.comment}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex gap-2 pt-4 border-t">
            <Button onClick={() => saveSermon(false)} disabled={!title.trim() || loading}>
              <Save className="h-4 w-4 mr-2" />
              {selectedSermon ? "Update Sermon" : "Save Sermon"}
            </Button>
            <Button variant="outline" onClick={resetForm}>
              Cancel
            </Button>
            <div className="flex-1" />
            <Button variant="outline" onClick={() => setPracticeMode(true)}>
              <Timer className="h-4 w-4 mr-2" />
              Practice Mode
            </Button>
                         <Button variant="outline" onClick={() => exportSermon('print')}>
               <Printer className="h-4 w-4 mr-2" />
               Print
             </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* AI Generation Dialog */}
      <Dialog open={showAIDialog} onOpenChange={setShowAIDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              AI Sermon Generator
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Topic or Theme</Label>
                <Input
                  value={aiPrompt}
                  onChange={(e) => setAIPrompt(e.target.value)}
                  placeholder="e.g., Forgiveness, Faith, Hope..."
                />
              </div>
              <div>
                <Label>Scripture Reference</Label>
                <Input
                  value={aiScripture}
                  onChange={(e) => setAIScripture(e.target.value)}
                  placeholder="e.g., John 3:16, Romans 8:28..."
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Denomination</Label>
                <Select value={aiSettings.denomination} onValueChange={(value) => setAISettings(prev => ({ ...prev, denomination: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General Christian</SelectItem>
                    <SelectItem value="baptist">Baptist</SelectItem>
                    <SelectItem value="methodist">Methodist</SelectItem>
                    <SelectItem value="presbyterian">Presbyterian</SelectItem>
                    <SelectItem value="pentecostal">Pentecostal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Sermon Length</Label>
                <Select value={aiSettings.length} onValueChange={(value) => setAISettings(prev => ({ ...prev, length: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="45">45 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Tone</Label>
                <Select value={aiSettings.tone} onValueChange={(value) => setAISettings(prev => ({ ...prev, tone: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="formal">Formal</SelectItem>
                    <SelectItem value="conversational">Conversational</SelectItem>
                    <SelectItem value="evangelistic">Evangelistic</SelectItem>
                    <SelectItem value="teaching">Teaching</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Audience</Label>
                <Select value={aiSettings.audience} onValueChange={(value) => setAISettings(prev => ({ ...prev, audience: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="adult">Adult</SelectItem>
                    <SelectItem value="youth">Youth</SelectItem>
                    <SelectItem value="children">Children</SelectItem>
                    <SelectItem value="mixed">Mixed Congregation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button onClick={generateAISermon} disabled={generateLoading || (!aiPrompt.trim() && !aiScripture.trim())}>
              {generateLoading ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
              Generate Sermon
            </Button>
            <Button variant="outline" onClick={() => setShowAIDialog(false)}>
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Template Selection Dialog */}
      <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Sermon Templates</DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {sermonTemplates.map((template) => (
              <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <Badge variant="outline">{template.type}</Badge>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    {template.description}
                  </p>
                  <div className="space-y-2 text-sm">
                    <div><strong>Introduction:</strong> {template.structure.introduction}</div>
                    <div><strong>Points:</strong> {template.structure.points.join(', ')}</div>
                    <div><strong>Conclusion:</strong> {template.structure.conclusion}</div>
                  </div>
                  <Button 
                    className="w-full mt-4" 
                    onClick={() => applyTemplate(template)}
                  >
                    Apply Template
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Bible Verse Lookup Dialog */}
      <Dialog open={showVerseDialog} onOpenChange={setShowVerseDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Bible Verse Lookup
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={verseQuery}
                onChange={(e) => setVerseQuery(e.target.value)}
                placeholder="Search for verses... (e.g., love, faith, John 3:16)"
                className="flex-1"
              />
              <Select value={selectedTranslation} onValueChange={setSelectedTranslation}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {translations.map(translation => (
                    <SelectItem key={translation} value={translation}>
                      {translation}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={searchBibleVerses}>
                <Search className="h-4 w-4" />
              </Button>
            </div>
            
            <ScrollArea className="h-96">
              <div className="space-y-4">
                {verseResults.map((verse, index) => (
                  <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-medium text-primary mb-2">
                            {verse.reference} ({verse.translation})
                          </div>
                          <p className="text-sm">{verse.text}</p>
                        </div>
                        <Button size="sm" onClick={() => insertVerse(verse)}>
                          <Plus className="h-4 w-4 mr-1" />
                          Insert
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Sermons;