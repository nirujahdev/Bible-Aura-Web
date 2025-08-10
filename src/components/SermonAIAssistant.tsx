import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  Sparkles, Bot, Target, Users, Heart, BookOpen, 
  CheckCircle, RefreshCw, Wand2, 
  FileText, Brain, Zap, Star, ArrowRight,
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
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Generator states
  const [topic, setTopic] = useState('');
  const [audience, setAudience] = useState('general');
  const [sermonType, setSermonType] = useState('expository');
  const [tone, setTone] = useState('inspiring');
  const [generatedOutline, setGeneratedOutline] = useState<SermonOutline | null>(null);

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

      <Tabs value="generator" className="flex-1 flex flex-col">
        <TabsList className="grid grid-cols-1 m-4 mb-0">
          <TabsTrigger value="generator" className="flex items-center gap-2 data-[state=active]:bg-orange-500 data-[state=active]:text-white">
            <span className="text-orange-500 data-[state=active]:text-white">✦</span>
            Generate
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
        </div>
      </Tabs>
    </div>
  );
};

export default SermonAIAssistant; 