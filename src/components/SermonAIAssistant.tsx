import React, { useState, useEffect, useCallback } from 'react';
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
import { useToast } from '@/hooks/use-toast';
import { 
  Sparkles, Bot, Lightbulb, Target, Users, Heart, BookOpen, 
  CheckCircle, AlertCircle, RefreshCw, Wand2, PenTool, 
  FileText, MessageSquare, Brain, Zap, Star, ArrowRight,
  Clock, TrendingUp, Shield, Globe, Award
} from 'lucide-react';

interface SermonOutline {
  title: string;
  mainPoints: string[];
  introduction: string;
  conclusion: string;
  scriptureReferences: string[];
  illustrations: string[];
  applications: string[];
}

interface WritingSuggestion {
  id: string;
  type: 'grammar' | 'theology' | 'engagement' | 'transition' | 'clarity';
  text: string;
  suggestion: string;
  position: number;
  severity: 'info' | 'warning' | 'error';
  category: string;
}

interface SermonAIAssistantProps {
  currentContent: string;
  onContentUpdate: (content: string) => void;
  onOutlineGenerated: (outline: SermonOutline) => void;
  sermonTitle: string;
  scriptureReference: string;
}

const SermonAIAssistant: React.FC<SermonAIAssistantProps> = ({
  currentContent,
  onContentUpdate,
  onOutlineGenerated,
  sermonTitle,
  scriptureReference
}) => {
  const { toast } = useToast();
  
  // States
  const [activeTab, setActiveTab] = useState<'generator' | 'assistant' | 'suggestions'>('generator');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Generator states
  const [topic, setTopic] = useState('');
  const [audience, setAudience] = useState('general');
  const [sermonType, setSermonType] = useState('expository');
  const [tone, setTone] = useState('inspiring');
  const [generatedOutline, setGeneratedOutline] = useState<SermonOutline | null>(null);
  
  // Assistant states
  const [suggestions, setSuggestions] = useState<WritingSuggestion[]>([]);
  const [realTimeSuggestions, setRealTimeSuggestions] = useState<string[]>([]);
  const [aiInput, setAiInput] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  
  // AI Chat states
  const [chatMessages, setChatMessages] = useState<{id: string, role: 'user' | 'assistant', content: string, timestamp: string}[]>([]);
  const [isChatMode, setIsChatMode] = useState(false);

  // Analyze content for suggestions
  const analyzeContent = useCallback(async (content: string) => {
    if (!content.trim() || content.length < 50) return;

    setIsAnalyzing(true);
    try {
      // Simulate AI analysis with realistic suggestions
      const newSuggestions: WritingSuggestion[] = [];
      
      // Grammar and clarity checks
      if (content.includes('alot')) {
        newSuggestions.push({
          id: 'grammar-1',
          type: 'grammar',
          text: 'alot',
          suggestion: 'a lot',
          position: content.indexOf('alot'),
          severity: 'error',
          category: 'Grammar'
        });
      }
      
      // Theological accuracy checks
      if (content.toLowerCase().includes('works salvation')) {
        newSuggestions.push({
          id: 'theology-1',
          type: 'theology',
          text: 'works salvation',
          suggestion: 'Consider clarifying that salvation is by faith alone, not by works (Ephesians 2:8-9)',
          position: content.toLowerCase().indexOf('works salvation'),
          severity: 'warning',
          category: 'Theological Accuracy'
        });
      }
      
      // Engagement suggestions
      if (content.split('.').length > 10 && !content.includes('?')) {
        newSuggestions.push({
          id: 'engagement-1',
          type: 'engagement',
          text: '',
          suggestion: 'Consider adding a rhetorical question to engage your audience',
          position: Math.floor(content.length / 2),
          severity: 'info',
          category: 'Audience Engagement'
        });
      }
      
      // Transition suggestions
      const paragraphs = content.split('\n\n');
      if (paragraphs.length > 2) {
        const transitionWords = ['furthermore', 'moreover', 'additionally', 'therefore', 'consequently'];
        const hasTransitions = transitionWords.some(word => content.toLowerCase().includes(word));
        
        if (!hasTransitions) {
          newSuggestions.push({
            id: 'transition-1',
            type: 'transition',
            text: '',
            suggestion: 'Add transition words between paragraphs for better flow',
            position: content.indexOf('\n\n'),
            severity: 'info',
            category: 'Flow & Structure'
          });
        }
      }
      
      setSuggestions(newSuggestions);
    } catch (error) {
      console.error('Error analyzing content:', error);
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  // Generate sermon outline
  const generateSermonOutline = async () => {
    if (!topic.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter a sermon topic or scripture reference",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      // Simulate AI sermon generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const outlineTemplates = {
        expository: {
          title: `Understanding ${topic}: A Biblical Perspective`,
          mainPoints: [
            `The Context of ${topic}`,
            `The Meaning of ${topic}`,
            `The Application of ${topic}`,
            `Living Out ${topic} Today`
          ],
          introduction: `Hook: Start with a relatable story or question about ${topic}.\nContext: Explain the historical and cultural background.\nThesis: Today we'll discover what God's Word teaches us about ${topic} and how it transforms our lives.`,
          conclusion: `Recap the main points about ${topic}.\nChallenge: Call the audience to specific action.\nPrayer: Lead in a prayer for God's help in applying these truths.`,
          scriptureReferences: [scriptureReference || 'Romans 12:1-2', 'Philippians 4:13', '2 Timothy 3:16-17'],
          illustrations: [
            'Personal testimony about struggling with or experiencing this truth',
            'Historical example of someone who embodied this principle',
            'Modern-day story that illustrates the concept'
          ],
          applications: [
            'Personal reflection: How does this apply to your relationship with God?',
            'Family application: How can this truth transform your home?',
            'Community impact: How can we live this out together as a church?'
          ]
        },
        topical: {
          title: `${topic}: God's Design for Life`,
          mainPoints: [
            `What the Bible Says About ${topic}`,
            `Why ${topic} Matters to God`,
            `How to Embrace ${topic} in Daily Life`
          ],
          introduction: `Open with current events or cultural perspective on ${topic}.\nTransition to God's perspective.\nPreview the biblical teaching on ${topic}.`,
          conclusion: `Summarize God's heart for ${topic}.\nIssue a clear call to action.\nProvide practical next steps.`,
          scriptureReferences: ['Psalm 119:105', 'Proverbs 3:5-6', 'Matthew 6:33'],
          illustrations: [
            'Contrast between worldly and biblical perspectives',
            'Story of transformation through biblical truth',
            'Analogy that makes the concept clear and memorable'
          ],
          applications: [
            'Individual commitment to biblical principles',
            'Practical steps for implementation',
            'Accountability and community support'
          ]
        }
      };

      const template = outlineTemplates[sermonType as keyof typeof outlineTemplates];
      
      setGeneratedOutline(template);
      onOutlineGenerated(template);
      
      toast({
        title: "✨ Sermon Outline Generated!",
        description: "Your AI-powered sermon outline is ready for customization",
      });
      
    } catch (error) {
      console.error('Error generating sermon:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate sermon outline. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Real-time writing assistance
  const getWritingAssistance = async () => {
    if (!aiInput.trim()) return;
    
    setIsAnalyzing(true);
    try {
      // Simulate AI assistance
      const assistanceTemplates = {
        hook: [
          "What if I told you that everything you thought you knew about [topic] was just the beginning?",
          "In a world where [current issue], God offers us a different way...",
          "The story begins not with our questions, but with God's answer..."
        ],
        transition: [
          "This leads us to our next important truth...",
          "But there's more to this story that we need to understand...",
          "Now, let's explore what this means for us today..."
        ],
        conclusion: [
          "So what does this mean for us as we leave here today?",
          "The question isn't whether God is faithful, but whether we will respond in faith...",
          "May we go from this place transformed by the truth we've encountered..."
        ]
      };

      const responseType = aiInput.toLowerCase().includes('hook') ? 'hook' :
                          aiInput.toLowerCase().includes('transition') ? 'transition' : 'conclusion';
      
      const responses = assistanceTemplates[responseType];
      const response = responses[Math.floor(Math.random() * responses.length)];
      
      if (isChatMode) {
        // Add to chat messages
        const userMessage = {
          id: Date.now().toString(),
          role: 'user' as const,
          content: aiInput,
          timestamp: new Date().toISOString()
        };
        
        const aiMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant' as const,
          content: response,
          timestamp: new Date().toISOString()
        };
        
        setChatMessages(prev => [...prev, userMessage, aiMessage]);
        setAiInput('');
      } else {
        setAiResponse(response);
      }
    } catch (error) {
      console.error('Error getting assistance:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handle quick helper clicks in chat mode
  const handleQuickHelperClick = (prompt: string) => {
    if (isChatMode) {
      setAiInput(prompt);
    } else {
      setAiInput(prompt);
      getWritingAssistance();
    }
  };

  // Real-time content analysis
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      analyzeContent(currentContent);
    }, 1000);

    return () => clearTimeout(debounceTimer);
  }, [currentContent, analyzeContent]);

  return (
    <div className="w-full h-full flex flex-col bg-white">
      <div className="border-b bg-gradient-to-r from-orange-50 to-red-50 p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-500 rounded-lg">
            <span className="text-white text-lg font-bold">✦</span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">AI Assistant</h3>
            <p className="text-sm text-gray-600">Smart sermon preparation</p>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="flex-1 flex flex-col">
        <TabsList className="grid grid-cols-3 m-4 mb-0">
          <TabsTrigger value="generator" className="flex items-center gap-2 data-[state=active]:bg-orange-500 data-[state=active]:text-white">
            <span className="text-orange-500 data-[state=active]:text-white">✦</span>
            Generate
          </TabsTrigger>
          <TabsTrigger value="assistant" className="flex items-center gap-2 data-[state=active]:bg-orange-500 data-[state=active]:text-white">
            <span className="text-orange-500 data-[state=active]:text-white">✦</span>
            Writing
          </TabsTrigger>
          <TabsTrigger value="suggestions" className="flex items-center gap-2 relative data-[state=active]:bg-orange-500 data-[state=active]:text-white">
            <span className="text-orange-500 data-[state=active]:text-white">✦</span>
            Tips
            {suggestions.length > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 text-xs">
                {suggestions.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-hidden">
          {/* Intelligent Sermon Generator */}
          <TabsContent value="generator" className="h-full m-0 p-4">
            <ScrollArea className="h-full">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <span className="text-orange-500 text-lg">✦</span>
                      Sermon Generator
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Topic or Scripture Reference</label>
                      <Input
                        placeholder="e.g., 'Faith in difficult times' or 'Romans 8:28'"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        className="border-gray-300"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Sermon Type</label>
                        <Select value={sermonType} onValueChange={setSermonType}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="expository">Expository</SelectItem>
                            <SelectItem value="topical">Topical</SelectItem>
                            <SelectItem value="narrative">Narrative</SelectItem>
                            <SelectItem value="biographical">Biographical</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Target Audience</label>
                        <Select value={audience} onValueChange={setAudience}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="general">General Congregation</SelectItem>
                            <SelectItem value="youth">Youth</SelectItem>
                            <SelectItem value="adults">Adults</SelectItem>
                            <SelectItem value="seniors">Seniors</SelectItem>
                            <SelectItem value="families">Families</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Tone</label>
                      <Select value={tone} onValueChange={setTone}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="inspiring">Inspiring</SelectItem>
                          <SelectItem value="challenging">Challenging</SelectItem>
                          <SelectItem value="comforting">Comforting</SelectItem>
                          <SelectItem value="teaching">Teaching</SelectItem>
                          <SelectItem value="evangelistic">Evangelistic</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button 
                      onClick={generateSermonOutline}
                      disabled={isGenerating || !topic.trim()}
                      className="w-full bg-orange-500 hover:bg-orange-600"
                    >
                      {isGenerating ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <span className="mr-2">✦</span>
                          Generate Outline
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>

                {/* Generated Outline Display */}
                {generatedOutline && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <span className="text-orange-500 text-lg">✦</span>
                        Generated Outline
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-lg text-orange-700 mb-2">{generatedOutline.title}</h4>
                      </div>

                      <div>
                        <h5 className="font-medium mb-2 flex items-center gap-2">
                          <Target className="h-4 w-4" />
                          Main Points
                        </h5>
                        <ul className="space-y-1">
                          {generatedOutline.mainPoints.map((point, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-orange-600 font-bold">{index + 1}.</span>
                              <span>{point}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h5 className="font-medium mb-2 flex items-center gap-2">
                          <BookOpen className="h-4 w-4" />
                          Scripture References
                        </h5>
                        <div className="flex flex-wrap gap-2">
                          {generatedOutline.scriptureReferences.map((ref, index) => (
                            <Badge key={index} variant="outline" className="text-blue-700 border-blue-300">
                              {ref}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <Button
                        onClick={() => {
                          const outlineText = `# ${generatedOutline.title}\n\n## Introduction\n${generatedOutline.introduction}\n\n## Main Points\n${generatedOutline.mainPoints.map((point, i) => `${i + 1}. ${point}`).join('\n')}\n\n## Conclusion\n${generatedOutline.conclusion}`;
                          onContentUpdate(outlineText);
                          toast({
                            title: "✦ Outline Applied",
                            description: "Added to your sermon",
                          });
                        }}
                        className="w-full bg-orange-600 hover:bg-orange-700"
                      >
                        <span className="mr-2">✦</span>
                        Apply Outline
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Smart Content Assistant */}
          <TabsContent value="assistant" className="h-full m-0 p-4">
            <ScrollArea className="h-full">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-orange-500 text-lg">✦</span>
                        Writing Assistant
                      </div>
                      <div className="flex items-center gap-2">
                        <Label htmlFor="chat-mode" className="text-sm">Chat Mode</Label>
                        <Switch
                          id="chat-mode"
                          checked={isChatMode}
                          onCheckedChange={setIsChatMode}
                        />
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {isChatMode ? (
                      // Chat Mode Interface
                      <div className="flex flex-col h-96">
                        <ScrollArea className="flex-1 p-4 border rounded-lg bg-gray-50">
                          {chatMessages.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                              <span className="text-3xl text-orange-500 block mb-2">✦</span>
                              <p className="text-sm">Start a conversation about your sermon</p>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              {chatMessages.map((message) => (
                                <div
                                  key={message.id}
                                  className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                  {message.role === 'assistant' && (
                                    <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center flex-shrink-0">
                                      <span className="text-white text-sm">✦</span>
                                    </div>
                                  )}
                                  
                                  <div className={`max-w-[80%] ${message.role === 'user' ? 'order-first' : ''}`}>
                                    <div className={`rounded-xl px-4 py-2 text-sm ${
                                      message.role === 'user'
                                        ? 'bg-orange-500 text-white ml-auto'
                                        : 'bg-white border border-gray-200'
                                    }`}>
                                      <p className="whitespace-pre-wrap">{message.content}</p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </ScrollArea>
                        
                        <div className="flex gap-2 mt-4">
                          <Input
                            placeholder="Ask me anything about your sermon..."
                            value={aiInput}
                            onChange={(e) => setAiInput(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                getWritingAssistance();
                              }
                            }}
                            disabled={isAnalyzing}
                          />
                          <Button
                            onClick={getWritingAssistance}
                            disabled={isAnalyzing || !aiInput.trim()}
                            size="sm"
                            className="bg-orange-500 hover:bg-orange-600"
                          >
                            {isAnalyzing ? (
                              <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                              <span>✦</span>
                            )}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      // Regular Mode Interface
                      <>
                        <div>
                          <label className="block text-sm font-medium mb-2">How can I help?</label>
                          <Textarea
                            placeholder="e.g., 'Write a hook about faith' or 'Suggest a transition'"
                            value={aiInput}
                            onChange={(e) => setAiInput(e.target.value)}
                            className="min-h-[80px]"
                          />
                        </div>

                        <Button 
                          onClick={getWritingAssistance}
                          disabled={isAnalyzing || !aiInput.trim()}
                          className="w-full bg-orange-500 hover:bg-orange-600"
                        >
                          {isAnalyzing ? (
                            <>
                              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                              Thinking...
                            </>
                          ) : (
                            <>
                              <span className="mr-2">✦</span>
                              Get Help
                            </>
                          )}
                        </Button>

                        {aiResponse && (
                          <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                            <h5 className="font-medium text-orange-800 mb-2">✦ Suggestion:</h5>
                            <p className="text-gray-700 italic">"{aiResponse}"</p>
                            <Button
                              size="sm"
                              variant="outline"
                              className="mt-3 border-orange-300 text-orange-600 hover:bg-orange-50"
                              onClick={() => {
                                onContentUpdate(currentContent + '\n\n' + aiResponse);
                                toast({
                                  title: "✦ Added",
                                  description: "Added to sermon",
                                });
                              }}
                            >
                              <span className="mr-2">✦</span>
                              Add
                            </Button>
                          </div>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <span className="text-orange-500 text-lg">✦</span>
                      Quick Helpers
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: 'Hooks', icon: '✦', prompt: 'Generate engaging opening hooks' },
                        { label: 'Transitions', icon: '✦', prompt: 'Suggest smooth transitions' },
                        { label: 'Stories', icon: '✦', prompt: 'Provide relevant illustrations' },
                        { label: 'Applications', icon: '✦', prompt: 'Help with practical applications' },
                        { label: 'Conclusions', icon: '✦', prompt: 'Write a powerful conclusion' },
                        { label: 'Prayers', icon: '✦', prompt: 'Suggest prayer points' }
                      ].map((helper) => (
                        <Button
                          key={helper.label}
                          variant="outline"
                          className="h-auto p-3 flex flex-col items-center gap-2 hover:bg-orange-50 border-orange-200"
                          onClick={() => handleQuickHelperClick(helper.prompt)}
                        >
                          <span className="text-lg text-orange-500">{helper.icon}</span>
                          <span className="text-sm">{helper.label}</span>
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Real-time Suggestions */}
          <TabsContent value="suggestions" className="h-full m-0 p-4">
            <ScrollArea className="h-full">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold flex items-center gap-2">
                    <span className="text-orange-500 text-lg">✦</span>
                    Analysis
                    {isAnalyzing && <RefreshCw className="h-4 w-4 animate-spin text-orange-500" />}
                  </h3>
                  <Badge variant="outline" className="text-xs border-orange-200 text-orange-600">
                    {suggestions.length} tips
                  </Badge>
                </div>

                {suggestions.length === 0 ? (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <span className="text-4xl text-orange-500 block mb-3">✦</span>
                      <h4 className="font-medium text-gray-800 mb-2">Looking good!</h4>
                      <p className="text-sm text-gray-600">
                        {currentContent.length > 50 
                          ? "No issues found."
                          : "Start writing to get tips."}
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {suggestions.map((suggestion) => (
                      <Card key={suggestion.id} className="border-l-4 border-l-orange-400">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0">
                              {suggestion.severity === 'error' && <AlertCircle className="h-5 w-5 text-red-500" />}
                              {suggestion.severity === 'warning' && <AlertCircle className="h-5 w-5 text-yellow-500" />}
                              {suggestion.severity === 'info' && <Lightbulb className="h-5 w-5 text-blue-500" />}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="outline" className="text-xs">
                                  {suggestion.category}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-700 mb-2">
                                {suggestion.suggestion}
                              </p>
                              {suggestion.text && (
                                <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                                  Found: "{suggestion.text}"
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default SermonAIAssistant; 