import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { 
  Sparkles, Bot, BookOpen, Users, Church, Globe, Clock, 
  FileText, Star, Target, RefreshCw, Download, Share2,
  Wand2, Heart, MessageSquare, PenTool, CheckCircle,
  Volume2, Mic, Video, Settings, ChevronDown, ChevronRight
} from 'lucide-react';

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

interface EnhancedSermonGeneratorProps {
  onSermonGenerated?: (sermon: GeneratedSermon) => void;
  onSaveToJournal?: (content: string) => void;
  initialTopic?: string;
  initialScripture?: string;
}

const EnhancedSermonGenerator: React.FC<EnhancedSermonGeneratorProps> = ({
  onSermonGenerated,
  onSaveToJournal,
  initialTopic = '',
  initialScripture = ''
}) => {
  const { user } = useAuth();
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState<SermonGenerationRequest>({
    topic: initialTopic,
    scripture: initialScripture,
    audienceType: 'general',
    denominationLens: 'evangelical',
    sermonType: 'expository',
    length: 'medium',
    language: 'english',
    mood: 'inspiring',
    occasion: 'sunday-service'
  });

  // UI state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSermon, setGeneratedSermon] = useState<GeneratedSermon | null>(null);
  const [activeSection, setActiveSection] = useState<string>('overview');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['overview']));
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  // Advanced options
  const [advancedOptions, setAdvancedOptions] = useState({
    includeOutlineOnly: false,
    includeFullScript: true,
    includeDevotionalVersion: false,
    includeWorshipSuggestions: false,
    theologicalDepth: 3, // 1-5 scale
    illustrationStyle: 'mixed', // personal, historical, contemporary, mixed
    applicationFocus: 'balanced' // personal, family, community, balanced
  });

  const audienceTypes = [
    { value: 'general', label: 'General Congregation' },
    { value: 'youth', label: 'Youth (13-25)' },
    { value: 'adults', label: 'Adults (26-65)' },
    { value: 'seniors', label: 'Seniors (65+)' },
    { value: 'families', label: 'Families with Children' },
    { value: 'non-believers', label: 'Seekers/Non-believers' },
    { value: 'new-believers', label: 'New Believers' },
    { value: 'mature-believers', label: 'Mature Believers' }
  ];

  const denominationLenses = [
    { value: 'evangelical', label: 'Evangelical' },
    { value: 'pentecostal', label: 'Pentecostal/Charismatic' },
    { value: 'baptist', label: 'Baptist' },
    { value: 'methodist', label: 'Methodist' },
    { value: 'presbyterian', label: 'Presbyterian/Reformed' },
    { value: 'lutheran', label: 'Lutheran' },
    { value: 'catholic', label: 'Catholic' },
    { value: 'orthodox', label: 'Orthodox' },
    { value: 'anglican', label: 'Anglican/Episcopal' },
    { value: 'non-denominational', label: 'Non-denominational' }
  ];

  const sermonTypes = [
    { value: 'expository', label: 'Expository', description: 'Verse-by-verse explanation' },
    { value: 'topical', label: 'Topical', description: 'Theme-based teaching' },
    { value: 'narrative', label: 'Narrative', description: 'Story-driven approach' },
    { value: 'biographical', label: 'Biographical', description: 'Character study' },
    { value: 'devotional', label: 'Devotional', description: 'Personal reflection' },
    { value: 'apologetic', label: 'Apologetic', description: 'Defending the faith' },
    { value: 'evangelistic', label: 'Evangelistic', description: 'Gospel presentation' }
  ];

  const lengthOptions = [
    { value: 'short', label: 'Short (5-10 mins)', description: 'Devotional or children\'s message' },
    { value: 'medium', label: 'Medium (15-20 mins)', description: 'Standard Sunday message' },
    { value: 'long', label: 'Full (30-45 mins)', description: 'In-depth teaching' },
    { value: 'extended', label: 'Extended (45+ mins)', description: 'Conference or retreat style' }
  ];

  const languages = [
    { value: 'english', label: 'English', flag: '🇺🇸' },
    { value: 'tamil', label: 'Tamil', flag: '🇱🇰' },
    { value: 'sinhala', label: 'Sinhala', flag: '🇱🇰' }
  ];

  const moodOptions = [
    { value: 'inspiring', label: 'Inspiring', icon: '✨' },
    { value: 'challenging', label: 'Challenging', icon: '⚡' },
    { value: 'comforting', label: 'Comforting', icon: '🤗' },
    { value: 'teaching', label: 'Teaching', icon: '📚' },
    { value: 'evangelistic', label: 'Evangelistic', icon: '❤️' },
    { value: 'prophetic', label: 'Prophetic', icon: '🔥' }
  ];

  const occasionOptions = [
    { value: 'sunday-service', label: 'Sunday Service' },
    { value: 'midweek', label: 'Midweek Service' },
    { value: 'youth-service', label: 'Youth Service' },
    { value: 'special-event', label: 'Special Event' },
    { value: 'funeral', label: 'Funeral/Memorial' },
    { value: 'wedding', label: 'Wedding' },
    { value: 'baptism', label: 'Baptism' },
    { value: 'communion', label: 'Communion' },
    { value: 'easter', label: 'Easter' },
    { value: 'christmas', label: 'Christmas' },
    { value: 'new-year', label: 'New Year' }
  ];

  const updateFormData = (field: keyof SermonGenerationRequest, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  const generateSermon = async () => {
    if (!formData.topic.trim() && !formData.scripture.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide either a topic or scripture reference",
        variant: "destructive"
      });
      return;
    }

    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to generate sermons",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      // Simulate AI generation with realistic timing
      await new Promise(resolve => setTimeout(resolve, 8000));

      // Create comprehensive sermon based on form data
      const sermon = await generateComprehensiveSermon(formData, advancedOptions);
      
      setGeneratedSermon(sermon);
      setActiveSection('overview');
      setExpandedSections(new Set(['overview', 'main-points']));

      if (onSermonGenerated) {
        onSermonGenerated(sermon);
      }

      toast({
        title: "✦ Sermon Generated Successfully!",
        description: `Your ${formData.length} ${formData.sermonType} sermon is ready`,
      });

    } catch (error) {
      console.error('Error generating sermon:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate sermon. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const generateComprehensiveSermon = async (
    request: SermonGenerationRequest, 
    options: any
  ): Promise<GeneratedSermon> => {
    // Use the enhanced AI service
    const { EnhancedSermonAI } = await import('@/lib/enhancedSermonAI');
    return await EnhancedSermonAI.generateComprehensiveSermon(request, options);
  };

  const saveToDatabase = async (sermon: GeneratedSermon) => {
    if (!user) return;

    try {
      const sermonData = {
        user_id: user.id,
        title: sermon.title,
        content: formatSermonContent(sermon),
        scripture_reference: sermon.scriptureFoundation.primaryText,
        main_points: sermon.overview.mainPoints,
        illustrations: sermon.mainPoints.flatMap(p => p.illustrations),
        applications: sermon.realWorldApplications.actionSteps,
        language: formData.language,
        category: formData.sermonType,
        estimated_duration: sermon.estimatedDuration,
        word_count: sermon.wordCount,
        ai_generated: true,
        template_type: formData.sermonType,
        tags: [formData.mood, formData.occasio, formData.audienceType].filter(Boolean)
      };

      const { error } = await supabase
        .from('sermons')
        .insert([sermonData]);

      if (error) throw error;

      toast({
        title: "✦ Sermon Saved",
        description: "Your generated sermon has been saved to your library",
      });

    } catch (error) {
      console.error('Error saving sermon:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save sermon to database",
        variant: "destructive"
      });
    }
  };

  // Helper functions for sermon generation
  const generateSermonTitle = (topic: string, type: string, mood?: string): string => {
    const moodMap = {
      inspiring: ['Discovering', 'Embracing', 'Finding'],
      challenging: ['The Call to', 'Rising to', 'Confronting'],
      comforting: ['Finding Peace in', 'God\'s Comfort Through', 'Hope in'],
      teaching: ['Understanding', 'Learning from', 'Biblical Truth About'],
      evangelistic: ['The Gospel of', 'God\'s Love in', 'Salvation Through'],
      prophetic: ['God\'s Word on', 'A Divine Message About', 'The Truth About']
    };

    const prefix = moodMap[mood as keyof typeof moodMap]?.[Math.floor(Math.random() * 3)] || 'Understanding';
    return `${prefix} ${topic}`;
  };

  const generateOpeningHook = (topic: string, audience: string): string => {
    const hooks = {
      general: `Imagine a world where ${topic} transformed every aspect of daily life...`,
      youth: `What if everything you thought you knew about ${topic} was just the beginning of an incredible journey?`,
      adults: `In our fast-paced world filled with responsibilities and pressures, ${topic} offers something we all desperately need...`,
      seniors: `After years of life experience, we've learned that ${topic} isn't just theory—it's essential for truly living...`,
      families: `As families, we're constantly seeking ways to build stronger relationships and create lasting memories. ${topic} holds the key...`
    };

    return hooks[audience as keyof typeof hooks] || hooks.general;
  };

  const getRelevantScripture = (topic: string): string => {
    const topicScriptures: Record<string, string> = {
      'faith': 'Hebrews 11:1',
      'love': '1 Corinthians 13:4-7',
      'hope': 'Romans 15:13',
      'forgiveness': 'Ephesians 4:32',
      'grace': 'Ephesians 2:8-9',
      'prayer': 'Matthew 6:9-13',
      'peace': 'Philippians 4:6-7',
      'joy': 'Philippians 4:4',
      'wisdom': 'Proverbs 3:5-6',
      'salvation': 'Romans 10:9-10'
    };

    return topicScriptures[topic.toLowerCase()] || 'Romans 8:28';
  };

  // ... (Additional helper functions would be implemented here)

  const formatSermonContent = (sermon: GeneratedSermon): string => {
    return `# ${sermon.title}

## Overview
**Central Message:** ${sermon.overview.centralMessage}

**Main Points:**
${sermon.overview.mainPoints.map((point, i) => `${i + 1}. ${point}`).join('\n')}

## Opening Hook
${sermon.openingHook.story}

${sermon.openingHook.connection}

${sermon.openingHook.bridge}

## Scripture Foundation
**Primary Text:** ${sermon.scriptureFoundation.primaryText}

**Context:** ${sermon.scriptureFoundation.context}

**Original Language Insights:** ${sermon.scriptureFoundation.originalLanguage}

## Main Points
${sermon.mainPoints.map((point, i) => `
### ${i + 1}. ${point.title}
${point.content}

**Scripture Support:**
${point.scriptureSupport.map(ref => `- ${ref}`).join('\n')}

**Illustrations:**
${point.illustrations.map(ill => `- ${ill}`).join('\n')}

**Applications:**
${point.applications.map(app => `- ${app}`).join('\n')}
`).join('\n')}

## Real-World Applications
**Action Steps:**
${sermon.realWorldApplications.actionSteps.map(step => `- ${step}`).join('\n')}

## Call to Action
${sermon.callToAction.commitment}

**Prayer:** ${sermon.callToAction.prayer}

**Next Steps:**
${sermon.callToAction.nextSteps.map(step => `- ${step}`).join('\n')}

## Closing
${sermon.closing.summary}

**Benediction:** ${sermon.closing.benediction}

## Study Guide
**Discussion Questions:**
${sermon.studyGuide.discussionQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}

**Memory Verse:** ${sermon.studyGuide.memoryVerse}

**Additional Study:**
${sermon.studyGuide.additionalStudy.map(ref => `- ${ref}`).join('\n')}

---
*Generated by Bible Aura AI | Estimated Duration: ${sermon.estimatedDuration} minutes | Word Count: ${sermon.wordCount}*`;
  };

  return (
    <div className="w-full h-full flex flex-col bg-white">
      <div className="border-b bg-gradient-to-r from-orange-50 to-red-50 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500 rounded-lg">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Enhanced Sermon Generator</h3>
              <p className="text-sm text-gray-600">AI-powered biblical sermon creation</p>
            </div>
          </div>
          <Badge variant="outline" className="text-orange-600 border-orange-300">
            Powered by AI ✦
          </Badge>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {!generatedSermon ? (
          // Generation Form
          <ScrollArea className="h-full">
            <div className="p-6 space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-orange-500" />
                    Core Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="topic">Topic or Theme</Label>
                      <Input
                        id="topic"
                        placeholder="e.g., Faith in difficult times, God's love"
                        value={formData.topic}
                        onChange={(e) => updateFormData('topic', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="scripture">Scripture Reference</Label>
                      <Input
                        id="scripture"
                        placeholder="e.g., Romans 8:28, Philippians 4:13"
                        value={formData.scripture}
                        onChange={(e) => updateFormData('scripture', e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Sermon Configuration */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-orange-500" />
                    Sermon Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <Label>Sermon Type</Label>
                      <Select value={formData.sermonType} onValueChange={(value) => updateFormData('sermonType', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {sermonTypes.map(type => (
                            <SelectItem key={type.value} value={type.value}>
                              <div>
                                <div className="font-medium">{type.label}</div>
                                <div className="text-xs text-gray-500">{type.description}</div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Target Audience</Label>
                      <Select value={formData.audienceType} onValueChange={(value) => updateFormData('audienceType', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {audienceTypes.map(audience => (
                            <SelectItem key={audience.value} value={audience.value}>
                              {audience.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Denomination Lens</Label>
                      <Select value={formData.denominationLens} onValueChange={(value) => updateFormData('denominationLens', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {denominationLenses.map(denomination => (
                            <SelectItem key={denomination.value} value={denomination.value}>
                              {denomination.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Length</Label>
                      <Select value={formData.length} onValueChange={(value) => updateFormData('length', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {lengthOptions.map(length => (
                            <SelectItem key={length.value} value={length.value}>
                              <div>
                                <div className="font-medium">{length.label}</div>
                                <div className="text-xs text-gray-500">{length.description}</div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Language</Label>
                      <Select value={formData.language} onValueChange={(value) => updateFormData('language', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {languages.map(lang => (
                            <SelectItem key={lang.value} value={lang.value}>
                              <span className="flex items-center gap-2">
                                <span>{lang.flag}</span>
                                {lang.label}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Mood/Tone</Label>
                      <Select value={formData.mood} onValueChange={(value) => updateFormData('mood', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {moodOptions.map(mood => (
                            <SelectItem key={mood.value} value={mood.value}>
                              <span className="flex items-center gap-2">
                                <span>{mood.icon}</span>
                                {mood.label}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Advanced Options */}
              <Card>
                <CardHeader>
                  <CardTitle 
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                  >
                    <div className="flex items-center gap-2">
                      <Wand2 className="h-5 w-5 text-orange-500" />
                      Advanced Options
                    </div>
                    {showAdvancedOptions ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </CardTitle>
                </CardHeader>
                {showAdvancedOptions && (
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="outline-only">Include outline only</Label>
                        <Switch
                          id="outline-only"
                          checked={advancedOptions.includeOutlineOnly}
                          onCheckedChange={(checked) => 
                            setAdvancedOptions(prev => ({ ...prev, includeOutlineOnly: checked }))
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="full-script">Add full script with transitions</Label>
                        <Switch
                          id="full-script"
                          checked={advancedOptions.includeFullScript}
                          onCheckedChange={(checked) => 
                            setAdvancedOptions(prev => ({ ...prev, includeFullScript: checked }))
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="devotional">Add devotional version</Label>
                        <Switch
                          id="devotional"
                          checked={advancedOptions.includeDevotionalVersion}
                          onCheckedChange={(checked) => 
                            setAdvancedOptions(prev => ({ ...prev, includeDevotionalVersion: checked }))
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="worship">Include worship song suggestions</Label>
                        <Switch
                          id="worship"
                          checked={advancedOptions.includeWorshipSuggestions}
                          onCheckedChange={(checked) => 
                            setAdvancedOptions(prev => ({ ...prev, includeWorshipSuggestions: checked }))
                          }
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Theological Depth (1-5)</Label>
                      <Slider
                        value={[advancedOptions.theologicalDepth]}
                        onValueChange={([value]) => 
                          setAdvancedOptions(prev => ({ ...prev, theologicalDepth: value }))
                        }
                        max={5}
                        min={1}
                        step={1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>Basic</span>
                        <span>Academic</span>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>

              {/* Generate Button */}
              <Card>
                <CardContent className="p-6">
                  <Button 
                    onClick={generateSermon}
                    disabled={isGenerating || (!formData.topic.trim() && !formData.scripture.trim())}
                    className="w-full bg-orange-500 hover:bg-orange-600 h-12 text-lg"
                  >
                    {isGenerating ? (
                      <>
                        <RefreshCw className="h-5 w-5 mr-3 animate-spin" />
                        Generating Your Sermon...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-5 w-5 mr-3" />
                        Generate Comprehensive Sermon
                      </>
                    )}
                  </Button>
                  {isGenerating && (
                    <div className="mt-4 text-center">
                      <div className="text-sm text-gray-600 mb-2">
                        Creating your {formData.length} {formData.sermonType} sermon...
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-orange-500 h-2 rounded-full animate-pulse w-2/3"></div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </ScrollArea>
        ) : (
          // Generated Sermon Display
          <div className="h-full flex flex-col">
            {/* Header with actions */}
            <div className="border-b p-4 bg-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">{generatedSermon.title}</h2>
                  <div className="flex items-center gap-4 mt-2">
                    <Badge variant="outline">{generatedSermon.estimatedDuration} mins</Badge>
                    <Badge variant="outline">{generatedSermon.wordCount} words</Badge>
                    <Badge variant="outline">{formData.language}</Badge>
                    <Badge variant="outline">{formData.sermonType}</Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => saveToDatabase(generatedSermon)}>
                    <Download className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                  <Button variant="outline" size="sm">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setGeneratedSermon(null)}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    New
                  </Button>
                </div>
              </div>
            </div>

            {/* Sermon content with navigation */}
            <div className="flex-1 overflow-hidden flex">
              {/* Navigation sidebar */}
              <div className="w-64 border-r bg-gray-50 overflow-y-auto">
                <div className="p-4">
                  <h3 className="font-semibold text-gray-800 mb-3">Sermon Sections</h3>
                  <nav className="space-y-1">
                    {[
                      { id: 'overview', label: 'Overview', icon: Target },
                      { id: 'hook', label: 'Opening Hook', icon: Sparkles },
                      { id: 'scripture', label: 'Scripture Foundation', icon: BookOpen },
                      { id: 'theology', label: 'Theological Framework', icon: Star },
                      { id: 'main-points', label: 'Main Points', icon: MessageSquare },
                      { id: 'applications', label: 'Applications', icon: Heart },
                      { id: 'call-to-action', label: 'Call to Action', icon: Users },
                      { id: 'closing', label: 'Closing', icon: CheckCircle },
                      { id: 'study-guide', label: 'Study Guide', icon: PenTool }
                    ].map(section => {
                      const Icon = section.icon;
                      return (
                        <button
                          key={section.id}
                          onClick={() => setActiveSection(section.id)}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                            activeSection === section.id 
                              ? 'bg-orange-500 text-white' 
                              : 'text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                          <span className="text-sm">{section.label}</span>
                        </button>
                      );
                    })}
                  </nav>
                </div>
              </div>

              {/* Content area */}
              <div className="flex-1 overflow-y-auto p-6">
                {/* Render active section content here */}
                <SermonSectionRenderer 
                  sermon={generatedSermon} 
                  activeSection={activeSection} 
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper component for rendering sermon sections
const SermonSectionRenderer: React.FC<{ sermon: GeneratedSermon; activeSection: string }> = ({ 
  sermon, 
  activeSection 
}) => {
  const renderSection = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Central Message</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg italic text-gray-700">{sermon.overview.centralMessage}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Main Points</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-2">
                  {sermon.overview.mainPoints.map((point, index) => (
                    <li key={index} className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          </div>
        );
      
      case 'hook':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Opening Hook & Introduction</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Engaging Story</h4>
                <p className="text-gray-700">{sermon.openingHook.story}</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Connection to Audience</h4>
                <p className="text-gray-700">{sermon.openingHook.connection}</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Bridge to Scripture</h4>
                <p className="text-gray-700">{sermon.openingHook.bridge}</p>
              </div>
            </CardContent>
          </Card>
        );

      case 'scripture':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Scripture Foundation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Primary Text</h4>
                <p className="text-lg font-medium text-blue-700 bg-blue-50 p-3 rounded-lg">
                  {sermon.scriptureFoundation.primaryText}
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Historical & Cultural Context</h4>
                <p className="text-gray-700">{sermon.scriptureFoundation.context}</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Original Language Insights</h4>
                <p className="text-gray-700">{sermon.scriptureFoundation.originalLanguage}</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Author's Intent</h4>
                <p className="text-gray-700">{sermon.scriptureFoundation.authorIntent}</p>
              </div>
            </CardContent>
          </Card>
        );

      case 'main-points':
        return (
          <div className="space-y-6">
            {sermon.mainPoints.map((point, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold">
                      {index + 1}
                    </span>
                    {point.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h5 className="font-semibold mb-2">Content</h5>
                    <p className="text-gray-700">{point.content}</p>
                  </div>
                  <div>
                    <h5 className="font-semibold mb-2">Scripture Support</h5>
                    <div className="flex flex-wrap gap-2">
                      {point.scriptureSupport.map((ref, i) => (
                        <Badge key={i} variant="outline" className="text-blue-600 border-blue-300">
                          {ref}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h5 className="font-semibold mb-2">Illustrations</h5>
                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                      {point.illustrations.map((ill, i) => (
                        <li key={i}>{ill}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-semibold mb-2">Applications</h5>
                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                      {point.applications.map((app, i) => (
                        <li key={i}>{app}</li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        );

      // Add other section renderers as needed...

      default:
        return (
          <div className="text-center py-8">
            <p className="text-gray-500">Section content will be displayed here</p>
          </div>
        );
    }
  };

  return <div>{renderSection()}</div>;
};

// Additional helper functions for comprehensive sermon generation
const generateScriptureContext = (scripture: string): string => {
  return `This passage was written in a specific historical and cultural context that helps us understand its meaning for today. The original audience faced unique challenges that parallel our modern struggles.`;
};

const generateLanguageInsights = (scripture: string): string => {
  return `Key terms in the original Hebrew/Greek provide deeper meaning that enriches our understanding of God's intended message.`;
};

const generateAuthorIntent = (scripture: string): string => {
  return `The author wrote with specific pastoral and theological purposes that speak directly to the needs of believers then and now.`;
};

const generateTheologicalFramework = (request: SermonGenerationRequest) => ({
  keyTheology: `This passage reveals fundamental truths about God's character and His relationship with humanity.`,
  redemptiveContext: `Within God's overarching plan of redemption, this truth fits perfectly into the gospel narrative.`,
  crossReferences: [`Romans 8:28`, `Philippians 4:13`, `2 Timothy 3:16-17`],
  doctrinalConnections: [`Divine sovereignty`, `Human responsibility`, `Sanctification`, `Biblical authority`]
});

const generateMainPoints = (request: SermonGenerationRequest, options: any) => [
  {
    title: `The Biblical Foundation of ${request.topic || 'This Truth'}`,
    content: `Understanding what Scripture teaches about this topic provides the solid foundation we need for authentic faith and living.`,
    scriptureSupport: [`Romans 15:4`, `2 Timothy 3:16-17`, `Psalm 119:105`],
    illustrations: [
      `A personal story of someone who discovered this truth in Scripture`,
      `Historical example of how this truth sustained believers through trials`,
      `Contemporary illustration that makes this concept relatable`
    ],
    applications: [
      `Regular study of God's Word to understand His will`,
      `Memorizing key verses that reinforce this truth`,
      `Sharing these insights with others in your community`
    ]
  },
  {
    title: `Living Out This Truth in Daily Life`,
    content: `Moving from knowledge to practice requires intentional choices and dependence on God's Spirit.`,
    scriptureSupport: [`James 1:22-25`, `Philippians 2:12-13`, `Galatians 5:16`],
    illustrations: [
      `Practical example of someone applying this in their workplace`,
      `Family illustration showing how this truth transforms relationships`,
      `Community example of collective application`
    ],
    applications: [
      `Specific action steps for implementation this week`,
      `Accountability partnerships for ongoing growth`,
      `Regular evaluation of progress and areas for improvement`
    ]
  }
];

const generateApplications = (request: SermonGenerationRequest) => ({
  actionSteps: [
    `Begin each day with prayer asking God to help you live out this truth`,
    `Identify one specific area where you can apply this teaching this week`,
    `Share your commitment with a trusted friend for accountability`,
    `Study additional passages that reinforce these principles`
  ],
  lifeChallenges: [
    `When facing difficult circumstances, remember God's faithfulness`,
    `In relationships, choose love even when it's difficult`,
    `At work, maintain integrity regardless of external pressures`,
    `In decision-making, seek God's wisdom through His Word and prayer`
  ],
  practicalTools: [
    `Daily devotional reading plan focused on this topic`,
    `Journal for recording insights and answered prayers`,
    `Accountability checklist for weekly progress review`,
    `Scripture memory cards for key verses`
  ]
});

const generateCallToAction = (request: SermonGenerationRequest) => ({
  commitment: `Today, I'm asking you to make a specific commitment to live out this truth in your daily life.`,
  prayer: `Let's pray together for God's strength and wisdom as we take these next steps in faith.`,
  nextSteps: [
    `Join our small group study on this topic`,
    `Sign up for the discipleship class starting next month`,
    `Volunteer for a ministry opportunity that aligns with this teaching`,
    `Consider sharing your testimony of how God has worked in your life`
  ],
  resources: [
    `Recommended books for further study`,
    `Online resources and podcasts`,
    `Local ministry opportunities`,
    `Prayer and support groups`
  ]
});

const generateClosing = (title: string, request: SermonGenerationRequest) => ({
  summary: `Today we've discovered that ${title.toLowerCase()} is not just a nice idea, but a life-transforming truth that God wants to work in and through us.`,
  benediction: `May the God of peace, who brought back from the dead our Lord Jesus, equip you with everything good for doing His will, and may He work in us what is pleasing to Him. Amen.`,
  preview: `Next week, we'll continue our series by exploring how this truth connects to our calling as disciples.`
});

const generateStudyGuide = (request: SermonGenerationRequest) => ({
  discussionQuestions: [
    `How has your understanding of this topic changed after today's message?`,
    `What specific challenges do you face in applying this truth?`,
    `How can our small group support each other in living this out?`,
    `What examples have you seen of people effectively applying this principle?`,
    `How does this truth relate to other areas of Christian growth?`
  ],
  memoryVerse: `2 Timothy 3:16-17 - "All Scripture is God-breathed and is useful for teaching, rebuking, correcting and training in righteousness, so that the servant of God may be thoroughly equipped for every good work."`,
  additionalStudy: [
    `Read the full chapter containing today's main passage`,
    `Study cross-references mentioned in the sermon`,
    `Research the historical background of the biblical text`,
    `Find modern applications in Christian living books`
  ],
  prayerPoints: [
    `Ask God for wisdom to understand His Word more deeply`,
    `Pray for strength to apply these truths consistently`,
    `Intercede for friends and family who need to hear this message`,
    `Thank God for His faithfulness and love revealed in Scripture`
  ]
});

const generateWorshipSuggestions = (request: SermonGenerationRequest) => ({
  openingSongs: [
    `"How Great Is Our God" - Chris Tomlin`,
    `"Blessed Be Your Name" - Matt Redman`,
    `"10,000 Reasons" - Matt Redman`
  ],
  responseSongs: [
    `"Lord, I Need You" - Matt Maher`,
    `"Cornerstone" - Hillsong`,
    `"In Christ Alone" - Getty & Townend`
  ],
  closingSongs: [
    `"The Blessing" - Elevation Worship`,
    `"Way Maker" - Sinach`,
    `"Great Are You Lord" - All Sons & Daughters`
  ]
});

const calculateDuration = (length: string): number => {
  const durations = {
    short: 8,
    medium: 18,
    long: 35,
    extended: 50
  };
  return durations[length as keyof typeof durations] || 18;
};

const calculateWordCount = (length: string): number => {
  const wordCounts = {
    short: 1200,
    medium: 2700,
    long: 5250,
    extended: 7500
  };
  return wordCounts[length as keyof typeof wordCounts] || 2700;
};

export default EnhancedSermonGenerator; 