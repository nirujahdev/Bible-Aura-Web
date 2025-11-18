// Studio Panel - Right panel in notebook view with 6 AI Agents
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/hooks/useAuth';
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
  Video,
  Star
} from 'lucide-react';
import { BibleAuraLoadingAnimation, InlineLoadingIndicator } from '@/components/BibleAuraLoadingAnimation';
import { getStudioOutputs, type StudioOutput } from '@/lib/research-lab/db-operations';
import { SummarizeAgentModal } from './agents/SummarizeAgentModal';
import { SearchQAAgentModal } from './agents/SearchQAAgentModal';
import { CrossReferenceAgentModal } from './agents/CrossReferenceAgentModal';
import { CurriculumAgentModal } from './agents/CurriculumAgentModal';
import { SermonAgentModal } from './agents/SermonAgentModal';
import { DoctrinalAgentModal } from './agents/DoctrinalAgentModal';
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
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [outputs, setOutputs] = useState<StudioOutput[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingOutputs, setGeneratingOutputs] = useState<Set<string>>(new Set());

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
      // For now, we'll check outputs - in a real implementation, you'd track generation status
      setGeneratingOutputs(generating);
    } catch (error) {
      console.error('Error loading outputs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAgent = (agentId: string) => {
    setActiveModal(agentId);
  };

  const handleCloseModal = () => {
    setActiveModal(null);
    // Reload outputs when modal closes (in case generation started)
    if (notebookId && user) {
      setTimeout(() => loadOutputs(), 1000);
    }
  };

  const handleOutputGenerated = (outputType: string) => {
    // Mark as generating temporarily
    setGeneratingOutputs(prev => new Set(prev).add(outputType));
    // Reload outputs
    loadOutputs();
    // Remove from generating after a delay
    setTimeout(() => {
      setGeneratingOutputs(prev => {
        const next = new Set(prev);
        next.delete(outputType);
        return next;
      });
    }, 2000);
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
          {/* Agents Grid */}
          <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-4 sm:mb-6">
            {aiAgents.map((agent) => {
              const Icon = agent.icon;
              const isGenerating = generatingTypes.includes(agent.outputType);
              return (
                <Card
                  key={agent.id}
                  className="cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-105 active:scale-95 touch-manipulation"
                  onClick={() => handleOpenAgent(agent.id)}
                >
                  <CardContent className="p-3 sm:p-4 flex flex-col items-center text-center">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg ${agent.color} flex items-center justify-center mb-2 transition-transform duration-200 group-hover:scale-110`}>
                      <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                    </div>
                    <p className="text-xs font-medium text-gray-900 leading-tight mb-1">{agent.name}</p>
                    <p className="text-[10px] text-gray-500 leading-tight">{agent.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Generating Status */}
          {generatingTypes.length > 0 && (
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

      {/* Agent Modals */}
      {activeModal === 'summarize' && (
        <SummarizeAgentModal
          notebookId={notebookId}
          open={true}
          onClose={handleCloseModal}
          onGenerated={() => handleOutputGenerated('summarization')}
        />
      )}
      {activeModal === 'search-qa' && (
        <SearchQAAgentModal
          notebookId={notebookId}
          open={true}
          onClose={handleCloseModal}
          onGenerated={() => handleOutputGenerated('theology_qa')}
        />
      )}
      {activeModal === 'cross-reference' && (
        <CrossReferenceAgentModal
          notebookId={notebookId}
          open={true}
          onClose={handleCloseModal}
          onGenerated={() => handleOutputGenerated('cross_references')}
        />
      )}
      {activeModal === 'curriculum' && (
        <CurriculumAgentModal
          notebookId={notebookId}
          open={true}
          onClose={handleCloseModal}
          onGenerated={() => handleOutputGenerated('curriculum')}
        />
      )}
      {activeModal === 'sermon' && (
        <SermonAgentModal
          notebookId={notebookId}
          open={true}
          onClose={handleCloseModal}
          onGenerated={() => handleOutputGenerated('sermon')}
        />
      )}
      {activeModal === 'doctrinal' && (
        <DoctrinalAgentModal
          notebookId={notebookId}
          open={true}
          onClose={handleCloseModal}
          onGenerated={() => handleOutputGenerated('doctrinal_harmony')}
        />
      )}
    </div>
  );
}
