import React, { useState, useRef } from 'react';
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  Brain, Sparkles, Bot, Target, Users, BookOpen, Church, Clock,
  FileDown, Printer, Share, RefreshCw, Settings, Languages, 
  Wand2, Star, CheckCircle, Download, Copy, Eye, Heart,
  Volume2, Music, Gift, Award, Zap, MessageSquare, PenTool,
  FileText, Lightbulb, Globe, Calendar, Tag, ListOrdered
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface SermonGenerationRequest {
  topic: string;
  scripture: string;
  audienceType: string;
  denominationLens: string;
  sermonType: string;
  length: string;
  language: string;
  mood: string;
  occasion: string;
  includeOutlineOnly: boolean;
  includeFullScript: boolean;
  includeDevotionalVersion: boolean;
  includeWorshipSuggestions: boolean;
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
  };
  closing: {
    summary: string;
    benediction: string;
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

interface SermonAIGeneratorProps {
  onSermonGenerated: (sermon: GeneratedSermon) => void;
  isVisible: boolean;
}

const SermonAIGenerator: React.FC<SermonAIGeneratorProps> = ({ 
  onSermonGenerated, 
  isVisible 
}) => {
  const { toast } = useToast();
  const sermonRef = useRef<HTMLDivElement>(null);
  
  // Form states
  const [formData, setFormData] = useState<SermonGenerationRequest>({
    topic: '',
    scripture: '',
    audienceType: 'adults',
    denominationLens: 'evangelical',
    sermonType: 'expository',
    length: 'medium',
    language: 'english',
    mood: 'inspiring',
    occasion: 'sunday-service',
    includeOutlineOnly: false,
    includeFullScript: true,
    includeDevotionalVersion: false,
    includeWorshipSuggestions: true,
    theologicalDepth: 3,
    illustrationStyle: 'contemporary',
    applicationFocus: 'practical'
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSermon, setGeneratedSermon] = useState<GeneratedSermon | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // DeepSeek API call for sermon generation
  const callDeepSeekAPI = async (prompt: string): Promise<string> => {
    const apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY || import.meta.env.VITE_AI_API_KEY;
    
    if (!apiKey || apiKey === 'demo-key' || apiKey === 'your_deepseek_api_key_here') {
      throw new Error('🔑 DeepSeek API key not configured! Please add your API key to environment variables.');
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
            content: 'You are an expert theological AI assistant specializing in creating comprehensive, biblically-grounded sermons. You excel at crafting engaging, theologically sound, and practically applicable sermons for diverse audiences and denominational contexts.'
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
      throw new Error(`DeepSeek API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  };

  // Build comprehensive prompt for sermon generation
  const buildSermonPrompt = (request: SermonGenerationRequest): string => {
    return `
Generate a comprehensive ${request.length} ${request.sermonType} sermon with the following specifications:

**CORE INFORMATION:**
- Topic: ${request.topic}
- Scripture: ${request.scripture}
- Target Audience: ${request.audienceType}
- Denominational Perspective: ${request.denominationLens}
- Sermon Type: ${request.sermonType}
- Length: ${request.length}
- Language: ${request.language}
- Mood/Tone: ${request.mood}
- Occasion: ${request.occasion}

**ADVANCED OPTIONS:**
- Theological Depth: ${request.theologicalDepth}/5
- Illustration Style: ${request.illustrationStyle}
- Application Focus: ${request.applicationFocus}

**OUTPUT REQUIREMENTS:**
${request.includeFullScript ? '✅ Include full sermon manuscript with transitions' : '❌ No full manuscript'}
${request.includeOutlineOnly ? '✅ Provide detailed outline structure' : '❌ No outline-only version'}
${request.includeDevotionalVersion ? '✅ Include devotional adaptation' : '❌ No devotional version'}
${request.includeWorshipSuggestions ? '✅ Include worship song suggestions' : '❌ No worship suggestions'}

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
  "mainPoints": [
    {
      "title": "Main point title",
      "content": "Detailed explanation (200-400 words)",
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
    "nextSteps": ["follow-up actions"]
  },
  "closing": {
    "summary": "Key takeaways summary",
    "benediction": "Blessing/benediction"
  },
  "studyGuide": {
    "discussionQuestions": ["discussion questions"],
    "memoryVerse": "Key memory verse",
    "additionalStudy": ["additional study resources"],
    "prayerPoints": ["prayer points"]
  },
  ${request.includeWorshipSuggestions ? `"worshipSuggestions": {
    "openingSongs": ["opening song suggestions"],
    "responseSongs": ["response songs"],
    "closingSongs": ["closing songs"]
  },` : ''}
  "estimatedDuration": ${request.length === 'short' ? 15 : request.length === 'medium' ? 25 : request.length === 'long' ? 35 : 45},
  "wordCount": ${request.length === 'short' ? 2000 : request.length === 'medium' ? 3500 : request.length === 'long' ? 5000 : 7000}
}

Ensure the sermon is:
- Theologically sound and biblically grounded
- Culturally appropriate for ${request.language} speakers
- Audience-appropriate for ${request.audienceType}
- Denominationally sensitive to ${request.denominationLens} perspectives
- Practically applicable with clear action steps
- Engaging with relevant illustrations and stories
`;
  };

  // Generate sermon using DeepSeek API
  const generateSermon = async () => {
    if (!formData.topic && !formData.scripture) {
      toast({
        title: "Missing Information",
        description: "Please provide either a topic or scripture reference",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      const prompt = buildSermonPrompt(formData);
      const response = await callDeepSeekAPI(prompt);
      
      // Parse the JSON response
      let sermon: GeneratedSermon;
      try {
        sermon = JSON.parse(response);
      } catch (parseError) {
        // If JSON parsing fails, create a structured response from the text
        sermon = parseTextResponse(response);
      }

      setGeneratedSermon(sermon);
      onSermonGenerated(sermon);
      setShowPreview(true);

      toast({
        title: "Sermon Generated Successfully! ✨",
        description: `Created a ${formData.length} ${formData.sermonType} sermon with ${sermon.wordCount} words`,
      });

    } catch (error) {
      console.error('Error generating sermon:', error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate sermon. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Parse text response if JSON parsing fails
  const parseTextResponse = (response: string): GeneratedSermon => {
    // Basic fallback parsing - in production, you'd want more sophisticated parsing
    return {
      title: formData.topic || "AI Generated Sermon",
      overview: {
        centralMessage: "AI-generated message based on your requirements",
        mainPoints: ["Point 1", "Point 2", "Point 3"],
        targetAudience: formData.audienceType,
        occasion: formData.occasion
      },
      openingHook: {
        story: response.substring(0, 200) + "...",
        connection: "Connects to audience experience",
        bridge: "Leads to main scripture passage"
      },
      scriptureFoundation: {
        primaryText: formData.scripture,
        context: "Biblical context and background",
        originalLanguage: "Original language insights",
        authorIntent: "Author's intended message"
      },
      mainPoints: [
        {
          title: "Main Point 1",
          content: response.substring(200, 600),
          scriptureSupport: [formData.scripture],
          illustrations: ["Relevant illustration"],
          applications: ["Practical application"]
        }
      ],
      realWorldApplications: {
        actionSteps: ["Take specific action", "Apply this truth", "Share with others"],
        lifeChallenges: ["Face challenges with faith", "Trust God's plan"],
        practicalTools: ["Daily prayer", "Bible study", "Community involvement"]
      },
      callToAction: {
        commitment: "Make a commitment to live out this truth",
        prayer: "Prayer for strength and guidance",
        nextSteps: ["Continue studying", "Join a small group", "Serve others"]
      },
      closing: {
        summary: "Summary of key points",
        benediction: "May God bless you and keep you"
      },
      studyGuide: {
        discussionQuestions: ["How does this apply to your life?", "What challenges do you face?"],
        memoryVerse: formData.scripture,
        additionalStudy: ["Read the full chapter", "Study cross-references"],
        prayerPoints: ["Pray for understanding", "Pray for application"]
      },
      estimatedDuration: formData.length === 'short' ? 15 : formData.length === 'medium' ? 25 : 35,
      wordCount: response.length
    };
  };

  // Export to PDF
  const exportToPDF = async () => {
    if (!generatedSermon || !sermonRef.current) {
      toast({
        title: "No Sermon to Export",
        description: "Please generate a sermon first",
        variant: "destructive"
      });
      return;
    }

    setIsExporting(true);
    try {
      const canvas = await html2canvas(sermonRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true
      });

      const imgData = canvas.getDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${generatedSermon.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`);

      toast({
        title: "PDF Export Successful! 📄",
        description: "Your sermon has been downloaded as a PDF",
      });

    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export PDF. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Copy sermon to clipboard
  const copyToClipboard = async () => {
    if (!generatedSermon) return;

    const sermonText = formatSermonForClipboard(generatedSermon);
    try {
      await navigator.clipboard.writeText(sermonText);
      toast({
        title: "Copied to Clipboard! 📋",
        description: "Sermon content copied successfully",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy to clipboard",
        variant: "destructive"
      });
    }
  };

  // Format sermon for clipboard
  const formatSermonForClipboard = (sermon: GeneratedSermon): string => {
    return `
${sermon.title}

OVERVIEW:
${sermon.overview.centralMessage}

MAIN POINTS:
${sermon.mainPoints.map((point, index) => `${index + 1}. ${point.title}\n${point.content}`).join('\n\n')}

SCRIPTURE FOUNDATION:
${sermon.scriptureFoundation.primaryText}
${sermon.scriptureFoundation.context}

APPLICATIONS:
${sermon.realWorldApplications.actionSteps.map(step => `• ${step}`).join('\n')}

CALL TO ACTION:
${sermon.callToAction.commitment}

STUDY GUIDE:
Discussion Questions:
${sermon.studyGuide.discussionQuestions.map(q => `• ${q}`).join('\n')}

Memory Verse: ${sermon.studyGuide.memoryVerse}
    `.trim();
  };

  if (!isVisible) return null;

  return (
    <div className="space-y-6">
      {/* AI Sermon Generator Form */}
      <Card className="border-2 border-primary/20">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            AI Sermon Generator
            <Badge variant="secondary" className="ml-auto">
              <Sparkles className="h-3 w-3 mr-1" />
              DeepSeek AI
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic Settings</TabsTrigger>
              <TabsTrigger value="advanced">Advanced Options</TabsTrigger>
              <TabsTrigger value="output">Output Options</TabsTrigger>
            </TabsList>

            {/* Basic Settings */}
            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="topic">Sermon Topic</Label>
                  <Input
                    id="topic"
                    placeholder="e.g., Faith in difficult times"
                    value={formData.topic}
                    onChange={(e) => setFormData(prev => ({ ...prev, topic: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="scripture">Scripture Reference</Label>
                  <Input
                    id="scripture"
                    placeholder="e.g., Romans 8:28"
                    value={formData.scripture}
                    onChange={(e) => setFormData(prev => ({ ...prev, scripture: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="audience">Target Audience</Label>
                  <Select value={formData.audienceType} onValueChange={(value) => setFormData(prev => ({ ...prev, audienceType: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="youth">Youth (13-25)</SelectItem>
                      <SelectItem value="adults">Adults (26-65)</SelectItem>
                      <SelectItem value="seniors">Seniors (65+)</SelectItem>
                      <SelectItem value="families">Families</SelectItem>
                      <SelectItem value="seekers">Seekers/Non-believers</SelectItem>
                      <SelectItem value="newBelievers">New Believers</SelectItem>
                      <SelectItem value="matureBelievers">Mature Believers</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="denomination">Denominational Lens</Label>
                  <Select value={formData.denominationLens} onValueChange={(value) => setFormData(prev => ({ ...prev, denominationLens: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="evangelical">Evangelical</SelectItem>
                      <SelectItem value="pentecostal">Pentecostal</SelectItem>
                      <SelectItem value="baptist">Baptist</SelectItem>
                      <SelectItem value="catholic">Catholic</SelectItem>
                      <SelectItem value="methodist">Methodist</SelectItem>
                      <SelectItem value="presbyterian">Presbyterian</SelectItem>
                      <SelectItem value="lutheran">Lutheran</SelectItem>
                      <SelectItem value="non-denominational">Non-denominational</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sermonType">Sermon Type</Label>
                  <Select value={formData.sermonType} onValueChange={(value) => setFormData(prev => ({ ...prev, sermonType: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="expository">Expository</SelectItem>
                      <SelectItem value="topical">Topical</SelectItem>
                      <SelectItem value="narrative">Narrative</SelectItem>
                      <SelectItem value="biographical">Biographical</SelectItem>
                      <SelectItem value="devotional">Devotional</SelectItem>
                      <SelectItem value="evangelistic">Evangelistic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="length">Sermon Length</Label>
                  <Select value={formData.length} onValueChange={(value) => setFormData(prev => ({ ...prev, length: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="short">Short (10-15 min)</SelectItem>
                      <SelectItem value="medium">Medium (20-25 min)</SelectItem>
                      <SelectItem value="long">Long (30-35 min)</SelectItem>
                      <SelectItem value="extended">Extended (40+ min)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            {/* Advanced Options */}
            <TabsContent value="advanced" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="mood">Sermon Mood/Tone</Label>
                    <Select value={formData.mood} onValueChange={(value) => setFormData(prev => ({ ...prev, mood: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="inspiring">Inspiring</SelectItem>
                        <SelectItem value="challenging">Challenging</SelectItem>
                        <SelectItem value="comforting">Comforting</SelectItem>
                        <SelectItem value="teaching">Teaching</SelectItem>
                        <SelectItem value="evangelistic">Evangelistic</SelectItem>
                        <SelectItem value="prophetic">Prophetic</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="occasion">Occasion</Label>
                    <Select value={formData.occasion} onValueChange={(value) => setFormData(prev => ({ ...prev, occasion: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sunday-service">Sunday Service</SelectItem>
                        <SelectItem value="easter">Easter</SelectItem>
                        <SelectItem value="christmas">Christmas</SelectItem>
                        <SelectItem value="funeral">Funeral</SelectItem>
                        <SelectItem value="wedding">Wedding</SelectItem>
                        <SelectItem value="baptism">Baptism</SelectItem>
                        <SelectItem value="communion">Communion</SelectItem>
                        <SelectItem value="revival">Revival</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <Select value={formData.language} onValueChange={(value) => setFormData(prev => ({ ...prev, language: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="english">English</SelectItem>
                        <SelectItem value="tamil">Tamil</SelectItem>
                        <SelectItem value="sinhala">Sinhala</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="theologicalDepth">Theological Depth: {formData.theologicalDepth}</Label>
                    <Slider
                      id="theologicalDepth"
                      min={1}
                      max={5}
                      step={1}
                      value={[formData.theologicalDepth]}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, theologicalDepth: value[0] }))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Basic</span>
                      <span>Intermediate</span>
                      <span>Advanced</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="illustrationStyle">Illustration Style</Label>
                    <Select value={formData.illustrationStyle} onValueChange={(value) => setFormData(prev => ({ ...prev, illustrationStyle: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="contemporary">Contemporary</SelectItem>
                        <SelectItem value="historical">Historical</SelectItem>
                        <SelectItem value="personal">Personal</SelectItem>
                        <SelectItem value="biblical">Biblical</SelectItem>
                        <SelectItem value="scientific">Scientific</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="applicationFocus">Application Focus</Label>
                    <Select value={formData.applicationFocus} onValueChange={(value) => setFormData(prev => ({ ...prev, applicationFocus: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="practical">Practical</SelectItem>
                        <SelectItem value="spiritual">Spiritual</SelectItem>
                        <SelectItem value="relational">Relational</SelectItem>
                        <SelectItem value="social">Social</SelectItem>
                        <SelectItem value="missional">Missional</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Output Options */}
            <TabsContent value="output" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="includeFullScript"
                      checked={formData.includeFullScript}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, includeFullScript: checked }))}
                    />
                    <Label htmlFor="includeFullScript">Full Sermon Manuscript</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="includeOutlineOnly"
                      checked={formData.includeOutlineOnly}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, includeOutlineOnly: checked }))}
                    />
                    <Label htmlFor="includeOutlineOnly">Outline Only Version</Label>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="includeDevotionalVersion"
                      checked={formData.includeDevotionalVersion}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, includeDevotionalVersion: checked }))}
                    />
                    <Label htmlFor="includeDevotionalVersion">Devotional Version</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="includeWorshipSuggestions"
                      checked={formData.includeWorshipSuggestions}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, includeWorshipSuggestions: checked }))}
                    />
                    <Label htmlFor="includeWorshipSuggestions">Worship Suggestions</Label>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Generate Button */}
          <div className="flex gap-3">
            <Button 
              onClick={generateSermon} 
              disabled={isGenerating}
              className="flex-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Generating Sermon...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate AI Sermon
                </>
              )}
            </Button>
            {generatedSermon && (
              <Button variant="outline" onClick={() => setShowPreview(true)}>
                <Eye className="mr-2 h-4 w-4" />
                Preview
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Sermon Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Generated Sermon Preview
              <div className="flex gap-2 ml-auto">
                <Button size="sm" variant="outline" onClick={copyToClipboard}>
                  <Copy className="h-4 w-4 mr-1" />
                  Copy
                </Button>
                <Button size="sm" variant="outline" onClick={exportToPDF} disabled={isExporting}>
                  {isExporting ? (
                    <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4 mr-1" />
                  )}
                  PDF
                </Button>
              </div>
            </DialogTitle>
          </DialogHeader>
          
          {generatedSermon && (
            <div ref={sermonRef} className="space-y-6 p-6 bg-white text-black">
              {/* Sermon Header */}
              <div className="text-center border-b pb-4">
                <h1 className="text-3xl font-bold mb-2">{generatedSermon.title}</h1>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><strong>Scripture:</strong> {generatedSermon.scriptureFoundation.primaryText}</p>
                  <p><strong>Audience:</strong> {generatedSermon.overview.targetAudience}</p>
                  <p><strong>Duration:</strong> {generatedSermon.estimatedDuration} minutes</p>
                  <p><strong>Word Count:</strong> {generatedSermon.wordCount} words</p>
                </div>
              </div>

              {/* Central Message */}
              <div>
                <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Central Message
                </h2>
                <p className="text-lg italic bg-blue-50 p-3 rounded-lg border-l-4 border-blue-500">
                  {generatedSermon.overview.centralMessage}
                </p>
              </div>

              {/* Opening Hook */}
              <div>
                <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Opening Hook
                </h2>
                <div className="space-y-2">
                  <p><strong>Story:</strong> {generatedSermon.openingHook.story}</p>
                  <p><strong>Connection:</strong> {generatedSermon.openingHook.connection}</p>
                  <p><strong>Bridge:</strong> {generatedSermon.openingHook.bridge}</p>
                </div>
              </div>

              {/* Scripture Foundation */}
              <div>
                <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Scripture Foundation
                </h2>
                <div className="space-y-2 bg-green-50 p-4 rounded-lg">
                  <p><strong>Primary Text:</strong> {generatedSermon.scriptureFoundation.primaryText}</p>
                  <p><strong>Context:</strong> {generatedSermon.scriptureFoundation.context}</p>
                  <p><strong>Original Language:</strong> {generatedSermon.scriptureFoundation.originalLanguage}</p>
                  <p><strong>Author's Intent:</strong> {generatedSermon.scriptureFoundation.authorIntent}</p>
                </div>
              </div>

              {/* Main Points */}
              <div>
                <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                  <ListOrdered className="h-5 w-5" />
                  Main Points
                </h2>
                {generatedSermon.mainPoints.map((point, index) => (
                  <div key={index} className="mb-6 border rounded-lg p-4 bg-gray-50">
                    <h3 className="text-lg font-semibold mb-2">
                      {index + 1}. {point.title}
                    </h3>
                    <p className="mb-3">{point.content}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <strong>Scripture Support:</strong>
                        <ul className="list-disc list-inside mt-1">
                          {point.scriptureSupport.map((ref, i) => (
                            <li key={i}>{ref}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <strong>Illustrations:</strong>
                        <ul className="list-disc list-inside mt-1">
                          {point.illustrations.map((ill, i) => (
                            <li key={i}>{ill}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <strong>Applications:</strong>
                        <ul className="list-disc list-inside mt-1">
                          {point.applications.map((app, i) => (
                            <li key={i}>{app}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Real World Applications */}
              <div>
                <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Real World Applications
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-yellow-50 p-3 rounded-lg">
                    <strong>Action Steps:</strong>
                    <ul className="list-disc list-inside mt-2 text-sm">
                      {generatedSermon.realWorldApplications.actionSteps.map((step, i) => (
                        <li key={i}>{step}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-orange-50 p-3 rounded-lg">
                    <strong>Life Challenges:</strong>
                    <ul className="list-disc list-inside mt-2 text-sm">
                      {generatedSermon.realWorldApplications.lifeChallenges.map((challenge, i) => (
                        <li key={i}>{challenge}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <strong>Practical Tools:</strong>
                    <ul className="list-disc list-inside mt-2 text-sm">
                      {generatedSermon.realWorldApplications.practicalTools.map((tool, i) => (
                        <li key={i}>{tool}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Call to Action */}
              <div>
                <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Call to Action
                </h2>
                <div className="space-y-3 bg-red-50 p-4 rounded-lg border-l-4 border-red-500">
                  <p><strong>Commitment:</strong> {generatedSermon.callToAction.commitment}</p>
                  <p><strong>Prayer:</strong> {generatedSermon.callToAction.prayer}</p>
                  <div>
                    <strong>Next Steps:</strong>
                    <ul className="list-disc list-inside mt-1">
                      {generatedSermon.callToAction.nextSteps.map((step, i) => (
                        <li key={i}>{step}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Closing */}
              <div>
                <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Closing
                </h2>
                <div className="space-y-2 bg-green-50 p-4 rounded-lg">
                  <p><strong>Summary:</strong> {generatedSermon.closing.summary}</p>
                  <p><strong>Benediction:</strong> {generatedSermon.closing.benediction}</p>
                </div>
              </div>

              {/* Study Guide */}
              <div>
                <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Study Guide
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <strong>Discussion Questions:</strong>
                      <ul className="list-disc list-inside mt-1 text-sm">
                        {generatedSermon.studyGuide.discussionQuestions.map((q, i) => (
                          <li key={i}>{q}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <strong>Memory Verse:</strong>
                      <p className="text-sm italic">{generatedSermon.studyGuide.memoryVerse}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <strong>Additional Study:</strong>
                      <ul className="list-disc list-inside mt-1 text-sm">
                        {generatedSermon.studyGuide.additionalStudy.map((study, i) => (
                          <li key={i}>{study}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <strong>Prayer Points:</strong>
                      <ul className="list-disc list-inside mt-1 text-sm">
                        {generatedSermon.studyGuide.prayerPoints.map((prayer, i) => (
                          <li key={i}>{prayer}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Worship Suggestions (if included) */}
              {generatedSermon.worshipSuggestions && (
                <div>
                  <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
                    <Music className="h-5 w-5" />
                    Worship Suggestions
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <strong>Opening Songs:</strong>
                      <ul className="list-disc list-inside mt-1 text-sm">
                        {generatedSermon.worshipSuggestions.openingSongs.map((song, i) => (
                          <li key={i}>{song}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg">
                      <strong>Response Songs:</strong>
                      <ul className="list-disc list-inside mt-1 text-sm">
                        {generatedSermon.worshipSuggestions.responseSongs.map((song, i) => (
                          <li key={i}>{song}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-purple-50 p-3 rounded-lg">
                      <strong>Closing Songs:</strong>
                      <ul className="list-disc list-inside mt-1 text-sm">
                        {generatedSermon.worshipSuggestions.closingSongs.map((song, i) => (
                          <li key={i}>{song}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SermonAIGenerator; 