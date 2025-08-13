import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useToast } from '@/hooks/use-toast';
import { 
  Brain, Bot, Sparkles, Wand2, MessageSquare, Lightbulb, 
  Search, BookOpen, Target, RefreshCw, ChevronDown, ChevronUp,
  PenTool, Quote, List, Heart, Globe, Music, Gift, Award,
  FileText, Edit3, Plus, Settings, X, Send, Copy, Eye,
  Mic, Volume2, Timer, Calendar, Users, Church, Star
} from 'lucide-react';

interface SermonAISidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  currentSermonContent: string;
  onContentUpdate: (content: string) => void;
  sermonTitle: string;
  scriptureReference: string;
}

interface AITool {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: 'generate' | 'enhance' | 'research' | 'review';
}

const SermonAISidebar: React.FC<SermonAISidebarProps> = ({
  isOpen,
  onToggle,
  currentSermonContent,
  onContentUpdate,
  sermonTitle,
  scriptureReference
}) => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('tools');
  const [expandedSections, setExpandedSections] = useState<string[]>(['generate']);
  const [aiInput, setAiInput] = useState('');
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [conversationHistory, setConversationHistory] = useState<Array<{
    type: 'user' | 'ai';
    content: string;
    timestamp: Date;
  }>>([]);

  // AI Tools Configuration
  const aiTools: AITool[] = [
    {
      id: 'outline-generator',
      name: 'Generate Outline',
      description: 'Create a structured sermon outline from topic or scripture',
      icon: <List className="h-4 w-4" />,
      category: 'generate'
    },
    {
      id: 'introduction-writer',
      name: 'Write Introduction',
      description: 'Generate compelling sermon introductions and hooks',
      icon: <Sparkles className="h-4 w-4" />,
      category: 'generate'
    },
    {
      id: 'illustration-finder',
      name: 'Find Illustrations',
      description: 'Suggest relevant stories and examples',
      icon: <Lightbulb className="h-4 w-4" />,
      category: 'enhance'
    },
    {
      id: 'application-generator',
      name: 'Generate Applications',
      description: 'Create practical life applications for your points',
      icon: <Target className="h-4 w-4" />,
      category: 'enhance'
    },
    {
      id: 'scripture-research',
      name: 'Scripture Research',
      description: 'Find cross-references and background information',
      icon: <BookOpen className="h-4 w-4" />,
      category: 'research'
    },
    {
      id: 'cultural-context',
      name: 'Cultural Context',
      description: 'Get historical and cultural background',
      icon: <Globe className="h-4 w-4" />,
      category: 'research'
    },
    {
      id: 'sermon-enhancer',
      name: 'Enhance Content',
      description: 'Improve clarity, flow, and impact',
      icon: <PenTool className="h-4 w-4" />,
      category: 'review'
    },
    {
      id: 'conclusion-writer',
      name: 'Write Conclusion',
      description: 'Create powerful closing and call to action',
      icon: <Heart className="h-4 w-4" />,
      category: 'generate'
    },
    {
      id: 'worship-suggestions',
      name: 'Worship Integration',
      description: 'Suggest songs and worship elements',
      icon: <Music className="h-4 w-4" />,
      category: 'enhance'
    }
  ];

  // DeepSeek API call
  const callDeepSeekAPI = async (prompt: string): Promise<string> => {
    const apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY || import.meta.env.VITE_AI_API_KEY;
    
    if (!apiKey || apiKey === 'demo-key' || apiKey === 'your_deepseek_api_key_here') {
      throw new Error('🔑 Bible Aura AI is not configured! Please contact support.');
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
            content: `You are an expert sermon writing assistant. You help pastors and speakers create biblically sound, engaging, and practical sermons. 

Current Sermon Context:
- Title: ${sermonTitle || 'Untitled Sermon'}
- Scripture: ${scriptureReference || 'Not specified'}
- Current Content Length: ${currentSermonContent.length} characters

Provide helpful, practical, and theologically sound assistance.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.7,
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  };

  // Execute AI tool
  const executeAITool = async (toolId: string, input?: string) => {
    setIsGenerating(true);
    setSelectedTool(toolId);

    try {
      let prompt = '';
      const tool = aiTools.find(t => t.id === toolId);
      
      // Build prompt based on tool type
      switch (toolId) {
        case 'outline-generator':
          prompt = `Create a detailed sermon outline for:
Topic: ${sermonTitle || input || 'Biblical message'}
Scripture: ${scriptureReference}
Please provide:
1. Main theme/central message
2. 3-4 main points with sub-points
3. Introduction hook
4. Conclusion with call to action
5. Practical applications for each point

Make it practical, engaging, and biblically sound.`;
          break;

        case 'introduction-writer':
          prompt = `Write a compelling sermon introduction for:
Topic: ${sermonTitle}
Scripture: ${scriptureReference}
${input ? `Additional context: ${input}` : ''}

Create an engaging hook that:
- Captures attention immediately
- Connects to modern life
- Leads naturally to the scripture passage
- Sets the tone for the message

Length: 2-3 paragraphs.`;
          break;

        case 'illustration-finder':
          prompt = `Suggest 3-5 powerful illustrations for a sermon about:
Topic: ${sermonTitle}
Scripture: ${scriptureReference}
${input ? `Specific point/theme: ${input}` : ''}

Provide illustrations that are:
- Relatable to modern audiences
- Memorable and impactful
- Appropriate for church setting
- Diverse in style (stories, analogies, examples)

Include both contemporary and timeless examples.`;
          break;

        case 'application-generator':
          prompt = `Generate practical life applications for:
Topic: ${sermonTitle}
Scripture: ${scriptureReference}
${input ? `Specific teaching: ${input}` : ''}

Provide 5-7 practical applications that are:
- Actionable and specific
- Relevant to different life stages
- Biblically grounded
- Achievable for average believers

Include applications for personal life, family, work, and community.`;
          break;

        case 'scripture-research':
          prompt = `Provide comprehensive biblical research for:
Scripture: ${scriptureReference}
${input ? `Research focus: ${input}` : ''}

Include:
1. Historical and cultural context
2. Key Hebrew/Greek terms and meanings
3. Cross-references and parallel passages
4. Author's intent and original audience
5. How it fits into the broader biblical narrative
6. Major commentaries' perspectives

Make it accessible for sermon preparation.`;
          break;

        case 'cultural-context':
          prompt = `Explain the cultural and historical context of:
Scripture: ${scriptureReference}
Topic: ${sermonTitle}
${input ? `Specific aspect: ${input}` : ''}

Cover:
- Historical setting and time period
- Cultural practices and customs
- Social/political environment
- Religious context
- How this context affects interpretation
- Modern parallels and applications

Help the audience understand the original setting.`;
          break;

        case 'sermon-enhancer':
          prompt = `Enhance and improve this sermon content:

Current Content:
${currentSermonContent.substring(0, 2000)}${currentSermonContent.length > 2000 ? '...' : ''}

${input ? `Specific improvement focus: ${input}` : ''}

Please improve:
- Clarity and flow
- Transitions between points
- Engagement and impact
- Biblical grounding
- Practical relevance
- Language and style

Provide specific suggestions and improved versions.`;
          break;

        case 'conclusion-writer':
          prompt = `Write a powerful sermon conclusion for:
Topic: ${sermonTitle}
Scripture: ${scriptureReference}
${input ? `Key takeaways: ${input}` : ''}

Current sermon context:
${currentSermonContent.substring(Math.max(0, currentSermonContent.length - 500))}

Create a conclusion that:
- Summarizes key points
- Challenges and inspires
- Includes clear call to action
- Ends with hope and encouragement
- Provides practical next steps

Length: 2-3 paragraphs with strong finish.`;
          break;

        case 'worship-suggestions':
          prompt = `Suggest worship songs and elements for:
Topic: ${sermonTitle}
Scripture: ${scriptureReference}
${input ? `Worship focus: ${input}` : ''}

Provide suggestions for:
- Opening worship songs (2-3)
- Response/reflection songs (2-3)
- Closing songs (2-3)
- Special elements (prayer, communion, etc.)
- Instrumental background music

Include both contemporary and traditional options.`;
          break;

        default:
          prompt = `Help with sermon preparation for:
Topic: ${sermonTitle}
Scripture: ${scriptureReference}
Request: ${input || 'General assistance'}

Provide helpful, practical, and biblically sound guidance.`;
      }

      const response = await callDeepSeekAPI(prompt);
      
      // Add to conversation history
      const userMessage = {
        type: 'user' as const,
        content: `${tool?.name}: ${input || 'Generate content'}`,
        timestamp: new Date()
      };
      
      const aiMessage = {
        type: 'ai' as const,
        content: response,
        timestamp: new Date()
      };

      setConversationHistory(prev => [...prev, userMessage, aiMessage]);

      toast({
        title: `${tool?.name} Complete! ✨`,
        description: 'AI assistance has been generated',
      });

    } catch (error) {
      console.error('Error executing AI tool:', error);
      toast({
        title: "AI Tool Failed",
        description: error instanceof Error ? error.message : "Failed to execute AI tool",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
      setSelectedTool(null);
    }
  };

  // Send custom AI request
  const sendAIRequest = async () => {
    if (!aiInput.trim()) return;

    const prompt = `${aiInput}

Context:
- Sermon Title: ${sermonTitle}
- Scripture: ${scriptureReference}
- Current Content: ${currentSermonContent.substring(0, 500)}${currentSermonContent.length > 500 ? '...' : ''}

Please provide helpful sermon writing assistance.`;

    setIsGenerating(true);
    try {
      const response = await callDeepSeekAPI(prompt);
      
      const userMessage = {
        type: 'user' as const,
        content: aiInput,
        timestamp: new Date()
      };
      
      const aiMessage = {
        type: 'ai' as const,
        content: response,
        timestamp: new Date()
      };

      setConversationHistory(prev => [...prev, userMessage, aiMessage]);
      setAiInput('');

      toast({
        title: "AI Response Generated! 💬",
        description: 'Your custom request has been processed',
      });

    } catch (error) {
      toast({
        title: "Request Failed",
        description: "Failed to process AI request",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Toggle section expansion
  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  // Copy content to clipboard
  const copyToClipboard = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast({
        title: "Copied! 📋",
        description: "Content copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy content",
        variant: "destructive"
      });
    }
  };

  // Insert content into sermon
  const insertContent = (content: string) => {
    const updatedContent = currentSermonContent + '\n\n' + content;
    onContentUpdate(updatedContent);
    toast({
      title: "Content Added! ✅",
      description: "AI content has been added to your sermon",
    });
  };

  if (!isOpen) return null;

  const toolsByCategory = aiTools.reduce((acc, tool) => {
    if (!acc[tool.category]) acc[tool.category] = [];
    acc[tool.category].push(tool);
    return acc;
  }, {} as Record<string, AITool[]>);

  const categoryNames = {
    generate: 'Generate Content',
    enhance: 'Enhance & Improve',
    research: 'Research & Study',
    review: 'Review & Refine'
  };

  return (
    <div className="w-80 bg-white border-l border-gray-200 h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b bg-gradient-to-r from-primary/10 to-primary/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">AI Sermon Assistant</h3>
          </div>
          <Button variant="ghost" size="sm" onClick={onToggle}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <Badge variant="secondary" className="mt-2">
          <Bot className="h-3 w-3 mr-1" />
          ✦ Bible Aura AI
        </Badge>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-2 mx-4 mt-4">
          <TabsTrigger value="tools" className="text-xs">AI Tools</TabsTrigger>
          <TabsTrigger value="chat" className="text-xs">AI Chat</TabsTrigger>
        </TabsList>

        {/* AI Tools Tab */}
        <TabsContent value="tools" className="flex-1 overflow-hidden">
          <ScrollArea className="h-full px-4">
            <div className="space-y-4 pb-4">
              {Object.entries(categoryNames).map(([category, name]) => (
                <Collapsible
                  key={category}
                  open={expandedSections.includes(category)}
                  onOpenChange={() => toggleSection(category)}
                >
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" className="w-full justify-between p-2 h-auto">
                      <span className="font-medium text-sm">{name}</span>
                      {expandedSections.includes(category) ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-2 mt-2">
                    {toolsByCategory[category as keyof typeof toolsByCategory]?.map((tool) => (
                      <Card key={tool.id} className="p-3 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start gap-2">
                          <div className="text-primary mt-1">{tool.icon}</div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm">{tool.name}</h4>
                            <p className="text-xs text-gray-600 mt-1">{tool.description}</p>
                            <Button
                              size="sm"
                              className="mt-2 h-7 text-xs"
                              onClick={() => executeAITool(tool.id)}
                              disabled={isGenerating && selectedTool === tool.id}
                            >
                              {isGenerating && selectedTool === tool.id ? (
                                <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                              ) : (
                                <Sparkles className="h-3 w-3 mr-1" />
                              )}
                              {isGenerating && selectedTool === tool.id ? 'Generating...' : 'Use Tool'}
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* AI Chat Tab */}
        <TabsContent value="chat" className="flex-1 flex flex-col">
          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full px-4">
              <div className="space-y-3 pb-4">
                {conversationHistory.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <MessageSquare className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm">Start a conversation with AI</p>
                    <p className="text-xs">Ask questions about your sermon</p>
                  </div>
                ) : (
                  conversationHistory.map((message, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg ${
                        message.type === 'user'
                          ? 'bg-primary/10 ml-4'
                          : 'bg-gray-50 mr-4'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <div className="flex-shrink-0">
                          {message.type === 'user' ? (
                            <Users className="h-4 w-4 text-primary" />
                          ) : (
                            <Bot className="h-4 w-4 text-gray-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          <div className="flex gap-1 mt-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 text-xs"
                              onClick={() => copyToClipboard(message.content)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                            {message.type === 'ai' && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 text-xs"
                                onClick={() => insertContent(message.content)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Chat Input */}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Textarea
                placeholder="Ask AI about your sermon..."
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                className="min-h-[60px] resize-none text-sm"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendAIRequest();
                  }
                }}
              />
              <Button
                size="sm"
                onClick={sendAIRequest}
                disabled={isGenerating || !aiInput.trim()}
                className="self-end"
              >
                {isGenerating ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SermonAISidebar; 