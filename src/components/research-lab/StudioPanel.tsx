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
  X,
  Copy,
  Trash2,
  Globe
} from 'lucide-react';
import { BibleAuraLoadingAnimation, InlineLoadingIndicator } from '@/components/BibleAuraLoadingAnimation';
import { getStudioOutputs, type StudioOutput } from '@/lib/research-lab/db-operations';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AgentModal } from './agents/AgentModal';
import { StudioOutputView } from './StudioOutputView';
import { AddManualNoteModal } from './AddManualNoteModal';
import { formatRelativeTime, getOutputTitle, getFormatLabel } from '@/lib/research-lab/utils';

interface StudioPanelProps {
  notebookId: string;
}

const aiAgents = [
  { 
    id: 'summarize', 
    name: 'Summarize', 
    icon: FileText, 
    color: 'bg-blue-50 text-blue-600',
    outputType: 'summarization' as const
  },
  { 
    id: 'search-qa', 
    name: 'AskScripture', 
    icon: Search, 
    color: 'bg-purple-50 text-purple-600',
    outputType: 'theology_qa' as const
  },
  { 
    id: 'cross-reference', 
    name: 'Cross-Reference', 
    icon: Link2, 
    color: 'bg-green-50 text-green-600',
    outputType: 'cross_references' as const
  },
  { 
    id: 'curriculum', 
    name: 'Study Builder', 
    icon: BookOpen, 
    color: 'bg-orange-50 text-orange-600',
    outputType: 'curriculum' as const
  },
  { 
    id: 'sermon', 
    name: 'Sermon Assistant', 
    icon: Mic, 
    color: 'bg-pink-50 text-pink-600',
    outputType: 'sermon' as const
  },
  { 
    id: 'doctrinal', 
    name: 'Doctrine Lens', 
    icon: Scale, 
    color: 'bg-indigo-50 text-indigo-600',
    outputType: 'doctrinal_harmony' as const
  },
  { 
    id: 'translate', 
    name: 'Translate', 
    icon: Globe, 
    color: 'bg-teal-50 text-teal-600',
    outputType: 'translation' as const
  },
];


// Helper function to get agent info from output type
function getAgentInfo(outputType: string) {
  if (outputType === 'manual_note') {
    return {
      id: 'manual_note',
      name: 'Manual Note',
      icon: FileText,
      color: 'bg-gray-50 text-gray-600',
      outputType: 'manual_note' as const,
    };
  }
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
    case 'translation':
      return Globe;
    case 'manual_note':
      return FileText;
    default:
      return FileText;
  }
}

export function StudioPanel({ notebookId }: StudioPanelProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeAgentModal, setActiveAgentModal] = useState<string | null>(null);
  const [outputs, setOutputs] = useState<StudioOutput[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingOutputs, setGeneratingOutputs] = useState<Set<string>>(new Set());
  const [sourceCount, setSourceCount] = useState(0);
  const [selectedOutput, setSelectedOutput] = useState<StudioOutput | null>(null);
  const [addNoteModalOpen, setAddNoteModalOpen] = useState(false);

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
    if (!notebookId || !user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await getStudioOutputs(notebookId, user.id);
      if (error) {
        console.error('Error loading outputs:', error);
        setOutputs([]); // Set empty array on error
        return;
      }
      setOutputs(data || []);
      
      // Update generating outputs set
      const generating = new Set<string>();
      setGeneratingOutputs(generating);
    } catch (error: any) {
      console.error('Error loading outputs:', error);
      setOutputs([]); // Set empty array on error
      // Don't show toast - errors are handled gracefully
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAgent = (agentId: string) => {
    setActiveAgentModal(agentId);
  };

  const handleCloseAgent = () => {
    setActiveAgentModal(null);
  };

  const handleAgentGenerated = () => {
    setGeneratingOutputs(prev => {
      const next = new Set(prev);
      if (activeAgentModal) {
        next.add(activeAgentModal);
      }
      return next;
    });
    setTimeout(() => loadOutputs(), 2000);
  };

  // Get outputs grouped by status
  const completedOutputs = outputs.filter(o => o.content);
  const generatingTypes = Array.from(generatingOutputs);

  // Show output view if one is selected
  if (selectedOutput) {
    return (
      <StudioOutputView
        output={selectedOutput}
        sourceCount={sourceCount}
        onClose={() => setSelectedOutput(null)}
        onDelete={async (id) => {
          const { error } = await supabase
            .from('research_studio_outputs')
            .delete()
            .eq('id', id);
          if (!error) {
            loadOutputs();
            toast({ title: 'Deleted', description: 'Output removed' });
          }
        }}
      />
    );
  }

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
          {/* Agents Grid - Enhanced with better styling */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 mb-4 sm:mb-6">
            {aiAgents.map((agent) => {
              const Icon = agent.icon;
              const isGenerating = generatingTypes.includes(agent.id);
              return (
                <Card
                  key={agent.id}
                  className={`cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 touch-manipulation border-2 ${
                    activeAgentModal === agent.id 
                      ? 'ring-2 ring-orange-500 border-orange-300 shadow-lg' 
                      : 'border-transparent hover:border-gray-200'
                  }`}
                  onClick={() => handleOpenAgent(agent.id)}
                >
                  <CardContent className="p-3 sm:p-4 flex flex-col items-center text-center group">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl ${agent.color} flex items-center justify-center mb-2 transition-all duration-300 group-hover:scale-110 group-hover:shadow-md`}>
                      <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                    </div>
                    <p className="text-xs sm:text-sm font-semibold text-gray-900 leading-tight group-hover:text-orange-600 transition-colors">{agent.name}</p>
                    {isGenerating && (
                      <div className="mt-1.5">
                        <div className="w-1 h-1 bg-orange-500 rounded-full animate-pulse"></div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Agent Modal */}
          {activeAgentModal && (
            <AgentModal
              open={true}
              onClose={handleCloseAgent}
              agentId={activeAgentModal}
              agentName={aiAgents.find(a => a.id === activeAgentModal)?.name || 'Agent'}
              notebookId={notebookId}
              sourceCount={sourceCount}
              onGenerated={handleAgentGenerated}
            />
          )}

          {/* Generating Status - NotebookLM Style with Progress */}
          {generatingTypes.length > 0 && !activeAgentModal && (
            <div className="mb-4 space-y-2">
              {generatingTypes.map((agentId) => {
                const agent = aiAgents.find(a => a.id === agentId) || aiAgents[0];
                const outputType = agent.outputType;
                return (
                  <div
                    key={agentId}
                    className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0">
                        <BibleAuraLoadingAnimation className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          Generating {agent.name.toLowerCase()}...
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Analyzing {sourceCount} source{sourceCount !== 1 ? 's' : ''} • This may take 10-30 seconds
                        </p>
                        {/* Progress bar */}
                        <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                          <div 
                            className="bg-orange-500 h-1.5 rounded-full animate-pulse"
                            style={{ width: '60%' }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Completed Outputs List - NotebookLM Style */}
          {completedOutputs.length > 0 && (
            <div className="mb-4 space-y-1">
              {completedOutputs.map((output) => {
                if (!output || !output.id) return null; // Safety check
                
                const agent = getAgentInfo(output.output_type);
                const OutputIcon = getOutputIcon(output.output_type);
                const outputSourceCount = output.content?.sourcesUsed?.length || 
                                        output.content?.sourceIds?.length || 
                                        output.metadata?.sourcesUsed?.length || 
                                        sourceCount || 0;
                const outputTitle = getOutputTitle(output);
                const formatLabel = getFormatLabel(output.output_type, output.metadata?.format);
                const generatedAt = (output as any).generated_at || output.created_at || new Date().toISOString();
                const timeAgo = formatRelativeTime(generatedAt);
                
                return (
                  <div
                    key={output.id}
                    className="bg-white rounded-lg p-3 flex items-center gap-3 border border-gray-200 hover:shadow-md transition-all cursor-pointer group"
                    onClick={() => setSelectedOutput(output)}
                  >
                    <div className={`w-10 h-10 rounded-lg ${agent.color} flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105`}>
                      <OutputIcon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate group-hover:text-orange-600 transition-colors">
                        {outputTitle}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {formatLabel && `${formatLabel} · `}
                        {outputSourceCount} source{outputSourceCount !== 1 ? 's' : ''} · {timeAgo}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedOutput(output);
                        }}
                      >
                        <Play className="h-4 w-4 text-blue-600" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                          <DropdownMenuItem onClick={() => setSelectedOutput(output)}>
                            <Play className="h-4 w-4 mr-2" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={async () => {
                            const text = typeof output.content === 'string' 
                              ? output.content 
                              : JSON.stringify(output.content, null, 2);
                            await navigator.clipboard.writeText(text);
                            toast({ title: 'Copied', description: 'Output copied to clipboard' });
                          }}>
                            <Copy className="h-4 w-4 mr-2" />
                            Copy
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={async () => {
                              if (confirm('Delete this output?')) {
                                const { error } = await supabase
                                  .from('research_studio_outputs')
                                  .delete()
                                  .eq('id', output.id);
                                if (!error) {
                                  loadOutputs();
                                  toast({ title: 'Deleted', description: 'Output removed' });
                                }
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
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
          onClick={() => setAddNoteModalOpen(true)}
        >
          <FilePlus className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
          Add note
        </Button>
      </div>

      {/* Add Manual Note Modal */}
      {notebookId && (
        <AddManualNoteModal
          open={addNoteModalOpen}
          onClose={() => setAddNoteModalOpen(false)}
          notebookId={notebookId}
          onSaved={() => {
            loadOutputs();
          }}
        />
      )}
    </div>
  );
}
