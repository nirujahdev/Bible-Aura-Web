// Studio Panel - Right panel in notebook view with 6 AI Agents (Inline, no modals)
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  FileText, 
  Search,
  Link2,
  BookOpen,
  Mic,
  Scale,
  Sparkles,
  FilePlus,
  Play,
  MoreVertical,
  X
} from 'lucide-react';
import { BibleAuraLoadingAnimation, InlineLoadingIndicator } from '@/components/BibleAuraLoadingAnimation';
import { getStudioOutputs, type StudioOutput } from '@/lib/research-lab/db-operations';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface StudioPanelProps {
  notebookId: string;
}

const aiAgents = [
  { 
    id: 'summarize', 
    name: 'Summarization & Synthesis', 
    icon: FileText, 
    color: 'bg-blue-50 text-blue-600',
    description: 'Summarize and synthesize multiple sources',
    outputType: 'summarization' as const
  },
  { 
    id: 'search-qa', 
    name: 'Theology Q&A', 
    icon: Search, 
    color: 'bg-purple-50 text-purple-600',
    description: 'Bible-focused questions and answers',
    outputType: 'theology_qa' as const
  },
  { 
    id: 'cross-reference', 
    name: 'Cross-Reference Discovery', 
    icon: Link2, 
    color: 'bg-green-50 text-green-600',
    description: 'Find related Bible verses and connections',
    outputType: 'cross_references' as const
  },
  { 
    id: 'curriculum', 
    name: 'Study Plan Builder', 
    icon: BookOpen, 
    color: 'bg-orange-50 text-orange-600',
    description: 'Create Bible study curricula',
    outputType: 'curriculum' as const
  },
  { 
    id: 'sermon', 
    name: 'Sermon Assistant', 
    icon: Mic, 
    color: 'bg-pink-50 text-pink-600',
    description: 'Prepare sermon outlines and content',
    outputType: 'sermon' as const
  },
  { 
    id: 'doctrinal', 
    name: 'Doctrinal Harmonization', 
    icon: Scale, 
    color: 'bg-indigo-50 text-indigo-600',
    description: 'Harmonize doctrine and perspectives',
    outputType: 'doctrinal_harmony' as const
  },
];

// Helper function to format relative time
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

// Helper function to get agent info from output type
function getAgentInfo(outputType: string) {
  return aiAgents.find(a => a.outputType === outputType) || aiAgents[0];
}

// Helper function to get output icon
function getOutputIcon(outputType: string) {
  switch (outputType) {
    case 'summarization':
      return FileText;
    case 'theology_qa':
      return Search;
    case 'cross_references':
      return Link2;
    case 'curriculum':
      return BookOpen;
    case 'sermon':
      return Mic;
    case 'doctrinal_harmony':
      return Scale;
    default:
      return FileText;
  }
}

export function StudioPanel({ notebookId }: StudioPanelProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeAgent, setActiveAgent] = useState<string | null>(null);
  const [outputs, setOutputs] = useState<StudioOutput[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingOutputs, setGeneratingOutputs] = useState<Set<string>>(new Set());
  
  // Agent form states
  const [summaryType, setSummaryType] = useState<'brief' | 'detailed' | 'thematic'>('detailed');
  const [question, setQuestion] = useState('');
  const [verseReference, setVerseReference] = useState('');
  const [theme, setTheme] = useState('');
  const [topic, setTopic] = useState('');
  const [duration, setDuration] = useState('');
  const [audience, setAudience] = useState('');
  const [scriptureReference, setScriptureReference] = useState('');
  const [sermonType, setSermonType] = useState<'expository' | 'topical' | 'narrative'>('expository');
  const [doctrinalQuestion, setDoctrinalQuestion] = useState('');
  const [includePerspectives, setIncludePerspectives] = useState(true);

  useEffect(() => {
    if (notebookId && user) {
      loadOutputs();
      // Poll for updates every 5 seconds if there are generating outputs
      const interval = setInterval(() => {
        if (generatingOutputs.size > 0) {
          loadOutputs();
        }
      }, 5000);
      return () => clearInterval(interval);
    } else {
      setLoading(false);
    }
  }, [notebookId, user, generatingOutputs.size]);

  const loadOutputs = async () => {
    if (!notebookId || !user) return;

    try {
      const { data, error } = await getStudioOutputs(notebookId, user.id);
      if (error) {
        console.error('Error loading outputs:', error);
        return;
      }
      setOutputs(data || []);
      
      // Update generating outputs set
      const generating = new Set<string>();
      setGeneratingOutputs(generating);
    } catch (error) {
      console.error('Error loading outputs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAgent = async (agentId: string) => {
    if (!user || !notebookId) return;

    // Mark as generating
    setGeneratingOutputs(prev => new Set(prev).add(agentId));
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: 'Error',
          description: 'Please log in to use this feature',
          variant: 'destructive',
        });
        return;
      }

      // Build request body based on agent type
      let requestBody: any = {
        agentType: agentId === 'summarize' ? 'summarize' :
                    agentId === 'search-qa' ? 'search_qa' :
                    agentId === 'cross-reference' ? 'cross_reference' :
                    agentId === 'search-qa' ? 'search_qa' :
                    agentId === 'curriculum' ? 'curriculum' :
                    agentId === 'sermon' ? 'sermon' :
                    'doctrinal',
        notebookId,
      };

      // Add agent-specific parameters
      if (agentId === 'summarize') {
        requestBody.summaryType = summaryType;
      } else if (agentId === 'search-qa') {
        if (!question.trim()) {
          toast({
            title: 'Error',
            description: 'Please enter a question',
            variant: 'destructive',
          });
          setGeneratingOutputs(prev => {
            const next = new Set(prev);
            next.delete(agentId);
            return next;
          });
          return;
        }
        requestBody.question = question.trim();
      } else if (agentId === 'cross-reference') {
        if (!verseReference.trim() && !theme.trim()) {
          toast({
            title: 'Error',
            description: 'Please enter a verse reference or theme',
            variant: 'destructive',
          });
          setGeneratingOutputs(prev => {
            const next = new Set(prev);
            next.delete(agentId);
            return next;
          });
          return;
        }
        requestBody.verseReference = verseReference.trim() || undefined;
        requestBody.theme = theme.trim() || undefined;
      } else if (agentId === 'curriculum') {
        if (!topic.trim()) {
          toast({
            title: 'Error',
            description: 'Please enter a study topic',
            variant: 'destructive',
          });
          setGeneratingOutputs(prev => {
            const next = new Set(prev);
            next.delete(agentId);
            return next;
          });
          return;
        }
        requestBody.topic = topic.trim();
        requestBody.duration = duration.trim() || undefined;
        requestBody.audience = audience.trim() || undefined;
      } else if (agentId === 'sermon') {
        requestBody.scriptureReference = scriptureReference.trim() || undefined;
        requestBody.sermonType = sermonType;
      } else if (agentId === 'doctrinal') {
        if (!doctrinalQuestion.trim()) {
          toast({
            title: 'Error',
            description: 'Please enter a doctrinal question',
            variant: 'destructive',
          });
          setGeneratingOutputs(prev => {
            const next = new Set(prev);
            next.delete(agentId);
            return next;
          });
          return;
        }
        requestBody.doctrinalQuestion = doctrinalQuestion.trim();
        requestBody.includePerspectives = includePerspectives;
      }

      const response = await fetch('/api/research-lab/agents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(requestBody),
      });

      // Check if response is ok before parsing JSON
      if (!response.ok) {
        let errorMessage = 'Failed to generate';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorData.details || errorMessage;
        } catch (e) {
          // If JSON parsing fails, try to get text
          try {
            const errorText = await response.text();
            errorMessage = errorText || errorMessage;
          } catch (e2) {
            errorMessage = `HTTP ${response.status}: ${response.statusText}`;
          }
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();

      if (!data || data.error) {
        throw new Error(data.error || data.message || 'Failed to generate');
      }

      toast({
        title: 'Success',
        description: 'Generation started successfully',
      });

      // Close active agent and reload outputs
      setActiveAgent(null);
      setTimeout(() => loadOutputs(), 2000);
    } catch (error: any) {
      console.error('Agent generation error:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        agentId,
        notebookId,
        requestBody,
      });
      
      // Provide more specific error messages
      let errorMessage = error.message || 'Failed to generate';
      if (error.message?.includes('fetch')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
        errorMessage = 'Authentication failed. Please log in again.';
      } else if (error.message?.includes('GLM API key')) {
        errorMessage = 'AI service configuration error. Please contact support.';
      } else if (error.message?.includes('No sources')) {
        errorMessage = 'No sources found in notebook. Please add sources first.';
      }
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
        duration: 5000,
      });
    } finally {
      // Remove from generating set after a delay
      setTimeout(() => {
        setGeneratingOutputs(prev => {
          const next = new Set(prev);
          next.delete(agentId);
          return next;
        });
      }, 1000);
    }
  };

  const handleOpenAgent = (agentId: string) => {
    setActiveAgent(agentId);
  };

  const handleCloseAgent = () => {
    setActiveAgent(null);
  };

  // Get outputs grouped by status
  const completedOutputs = outputs.filter(o => o.content);
  const generatingTypes = Array.from(generatingOutputs);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-3 sm:p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-2 mb-1">
          <img 
            src="/✦Bible Aura (2).png" 
            alt="Bible Aura" 
            className="h-6 w-6 sm:h-8 sm:w-8 rounded"
          />
          <h2 className="font-semibold text-gray-900 text-sm sm:text-base">Studio</h2>
        </div>
        <p className="text-xs text-gray-500">AI-powered Bible research agents</p>
      </div>

      {/* Agents Grid & Outputs */}
      <ScrollArea className="flex-1">
        <div className="p-3 sm:p-4">
          {/* Agents Grid - Smaller Icons */}
          <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-4 sm:mb-6">
            {aiAgents.map((agent) => {
              const Icon = agent.icon;
              const isGenerating = generatingTypes.includes(agent.id);
              return (
                <Card
                  key={agent.id}
                  className={`cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-105 active:scale-95 touch-manipulation ${
                    activeAgent === agent.id ? 'ring-2 ring-orange-500' : ''
                  }`}
                  onClick={() => handleOpenAgent(agent.id)}
                >
                  <CardContent className="p-2 sm:p-3 flex flex-col items-center text-center">
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg ${agent.color} flex items-center justify-center mb-1.5 transition-transform duration-200`}>
                      <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                    <p className="text-[10px] sm:text-xs font-medium text-gray-900 leading-tight mb-0.5">{agent.name}</p>
                    <p className="text-[9px] sm:text-[10px] text-gray-500 leading-tight">{agent.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Active Agent Form */}
          {activeAgent && (
            <div className="mb-4 p-4 bg-white rounded-lg border-2 border-orange-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <img 
                    src="/✦Bible Aura (2).png" 
                    alt="Bible Aura" 
                    className="h-5 w-5 rounded"
                  />
                  <h3 className="font-semibold text-sm">
                    {aiAgents.find(a => a.id === activeAgent)?.name}
                  </h3>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCloseAgent}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-3">
                {/* Summarize Form */}
                {activeAgent === 'summarize' && (
                  <>
                    <div>
                      <Label htmlFor="summaryType" className="text-xs">Summary Type</Label>
                      <Select value={summaryType} onValueChange={(v: any) => setSummaryType(v)}>
                        <SelectTrigger id="summaryType" className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="brief">Brief (2-3 paragraphs)</SelectItem>
                          <SelectItem value="detailed">Detailed (comprehensive)</SelectItem>
                          <SelectItem value="thematic">Thematic (organized by themes)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      onClick={() => handleGenerateAgent('summarize')}
                      disabled={generatingTypes.includes('summarize')}
                      className="w-full h-8 text-xs"
                    >
                      {generatingTypes.includes('summarize') ? 'Generating...' : 'Generate Summary'}
                    </Button>
                  </>
                )}

                {/* Search Q&A Form */}
                {activeAgent === 'search-qa' && (
                  <>
                    <div>
                      <Label htmlFor="question" className="text-xs">Ask a Bible-related question</Label>
                      <Textarea
                        id="question"
                        placeholder="e.g., What does the Bible say about forgiveness?"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        rows={2}
                        className="text-xs"
                      />
                    </div>
                    <Button
                      onClick={() => handleGenerateAgent('search-qa')}
                      disabled={generatingTypes.includes('search-qa') || !question.trim()}
                      className="w-full h-8 text-xs"
                    >
                      {generatingTypes.includes('search-qa') ? 'Searching...' : 'Get Answer'}
                    </Button>
                  </>
                )}

                {/* Cross-Reference Form */}
                {activeAgent === 'cross-reference' && (
                  <>
                    <div>
                      <Label htmlFor="verseReference" className="text-xs">Verse Reference (optional)</Label>
                      <Input
                        id="verseReference"
                        placeholder="e.g., John 3:16"
                        value={verseReference}
                        onChange={(e) => setVerseReference(e.target.value)}
                        className="h-8 text-xs"
                      />
                    </div>
                    <div>
                      <Label htmlFor="theme" className="text-xs">OR Theme (optional)</Label>
                      <Textarea
                        id="theme"
                        placeholder="e.g., forgiveness, grace"
                        value={theme}
                        onChange={(e) => setTheme(e.target.value)}
                        rows={2}
                        className="text-xs"
                      />
                    </div>
                    <Button
                      onClick={() => handleGenerateAgent('cross-reference')}
                      disabled={generatingTypes.includes('cross-reference') || (!verseReference.trim() && !theme.trim())}
                      className="w-full h-8 text-xs"
                    >
                      {generatingTypes.includes('cross-reference') ? 'Finding...' : 'Find Cross-References'}
                    </Button>
                  </>
                )}

                {/* Curriculum Form */}
                {activeAgent === 'curriculum' && (
                  <>
                    <div>
                      <Label htmlFor="topic" className="text-xs">Study Topic *</Label>
                      <Input
                        id="topic"
                        placeholder="e.g., Prayer in the Bible"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        className="h-8 text-xs"
                      />
                    </div>
                    <div>
                      <Label htmlFor="duration" className="text-xs">Duration (optional)</Label>
                      <Input
                        id="duration"
                        placeholder="e.g., 4 weeks"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        className="h-8 text-xs"
                      />
                    </div>
                    <div>
                      <Label htmlFor="audience" className="text-xs">Audience (optional)</Label>
                      <Input
                        id="audience"
                        placeholder="e.g., teens, new believers"
                        value={audience}
                        onChange={(e) => setAudience(e.target.value)}
                        className="h-8 text-xs"
                      />
                    </div>
                    <Button
                      onClick={() => handleGenerateAgent('curriculum')}
                      disabled={generatingTypes.includes('curriculum') || !topic.trim()}
                      className="w-full h-8 text-xs"
                    >
                      {generatingTypes.includes('curriculum') ? 'Generating...' : 'Generate Curriculum'}
                    </Button>
                  </>
                )}

                {/* Sermon Form */}
                {activeAgent === 'sermon' && (
                  <>
                    <div>
                      <Label htmlFor="scriptureReference" className="text-xs">Scripture Reference (optional)</Label>
                      <Input
                        id="scriptureReference"
                        placeholder="e.g., Romans 8:1-17"
                        value={scriptureReference}
                        onChange={(e) => setScriptureReference(e.target.value)}
                        className="h-8 text-xs"
                      />
                    </div>
                    <div>
                      <Label htmlFor="sermonType" className="text-xs">Sermon Type</Label>
                      <Select value={sermonType} onValueChange={(v: any) => setSermonType(v)}>
                        <SelectTrigger id="sermonType" className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="expository">Expository</SelectItem>
                          <SelectItem value="topical">Topical</SelectItem>
                          <SelectItem value="narrative">Narrative</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      onClick={() => handleGenerateAgent('sermon')}
                      disabled={generatingTypes.includes('sermon')}
                      className="w-full h-8 text-xs"
                    >
                      {generatingTypes.includes('sermon') ? 'Generating...' : 'Generate Sermon Outline'}
                    </Button>
                  </>
                )}

                {/* Doctrinal Form */}
                {activeAgent === 'doctrinal' && (
                  <>
                    <div>
                      <Label htmlFor="doctrinalQuestion" className="text-xs">Doctrinal Question *</Label>
                      <Textarea
                        id="doctrinalQuestion"
                        placeholder="e.g., How can we reconcile Paul and James on faith vs. works?"
                        value={doctrinalQuestion}
                        onChange={(e) => setDoctrinalQuestion(e.target.value)}
                        rows={2}
                        className="text-xs"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="includePerspectives"
                        checked={includePerspectives}
                        onCheckedChange={(checked) => setIncludePerspectives(checked === true)}
                      />
                      <Label htmlFor="includePerspectives" className="text-xs font-normal cursor-pointer">
                        Include multiple perspectives
                      </Label>
                    </div>
                    <Button
                      onClick={() => handleGenerateAgent('doctrinal')}
                      disabled={generatingTypes.includes('doctrinal') || !doctrinalQuestion.trim()}
                      className="w-full h-8 text-xs"
                    >
                      {generatingTypes.includes('doctrinal') ? 'Harmonizing...' : 'Harmonize Doctrine'}
                    </Button>
                  </>
                )}
              </div>

              {/* Show loading animation when generating */}
              {generatingTypes.includes(activeAgent) && (
                <div className="mt-4 pt-4 border-t">
                  <BibleAuraLoadingAnimation 
                    message={`Generating ${aiAgents.find(a => a.id === activeAgent)?.name}...`} 
                    size="small" 
                  />
                </div>
              )}
            </div>
          )}

          {/* Generating Status */}
          {generatingTypes.length > 0 && !activeAgent && (
            <div className="mb-4 space-y-2">
              {generatingTypes.map((outputType) => {
                const agent = getAgentInfo(outputType);
                return (
                  <div
                    key={outputType}
                    className="bg-gray-50 rounded-lg p-3 border border-gray-200"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <img 
                        src="/✦Bible Aura (2).png" 
                        alt="Bible Aura" 
                        className="h-5 w-5 rounded flex-shrink-0"
                      />
                      <p className="text-sm font-medium text-gray-900">Generating {agent.name}...</p>
                    </div>
                    <div className="pl-8">
                      <InlineLoadingIndicator />
                      <p className="text-xs text-gray-500 mt-2">Come back in a few minutes</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Completed Outputs List */}
          {completedOutputs.length > 0 && (
            <div className="mb-4 space-y-2">
              {completedOutputs.map((output) => {
                const agent = getAgentInfo(output.output_type);
                const OutputIcon = getOutputIcon(output.output_type);
                const sourceCount = output.content?.sourcesUsed?.length || output.content?.sourceIds?.length || 0;
                const outputTitle = output.content?.topic || 
                                  output.content?.verseReference || 
                                  output.content?.question || 
                                  output.content?.scriptureReference ||
                                  output.content?.doctrinalQuestion ||
                                  agent.name;
                
                return (
                  <div
                    key={output.id}
                    className="bg-white rounded-lg p-3 flex items-center gap-3 border border-gray-200 hover:shadow-sm transition-shadow"
                  >
                    <div className={`w-8 h-8 rounded-lg ${agent.color} flex items-center justify-center flex-shrink-0`}>
                      <OutputIcon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{outputTitle}</p>
                      <p className="text-xs text-gray-500">
                        {sourceCount > 0 ? `${sourceCount} sources` : 'No sources'} · {formatRelativeTime(output.generated_at)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => {
                          // TODO: Open output viewer
                          console.log('View output:', output);
                        }}
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>View</DropdownMenuItem>
                          <DropdownMenuItem>Export</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Info Message */}
          <div className="bg-orange-50 rounded-lg p-3 sm:p-4 text-center border border-orange-200">
            <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600 mx-auto mb-2" />
            <p className="text-xs text-gray-700 mb-1 font-medium">
              AI agents analyze your notebook sources.
            </p>
            <p className="text-xs text-gray-600">
              All agents are Bible-focused and work with your uploaded content.
            </p>
          </div>
        </div>
      </ScrollArea>

      {/* Add Note Button */}
      <div className="p-3 sm:p-4 border-t border-gray-200 bg-white safe-area-bottom">
        <Button
          variant="outline"
          className="w-full bg-black text-white hover:bg-gray-800 text-sm sm:text-base h-10 sm:h-auto"
        >
          <FilePlus className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
          Add note
        </Button>
      </div>
    </div>
  );
}
