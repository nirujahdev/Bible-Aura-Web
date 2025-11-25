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
  ChevronRight,
  X,
  Copy,
  Trash2,
  Globe,
  PenSquare
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
    color: 'text-blue-600',
    chip: 'bg-blue-50 border-blue-100',
    outputType: 'summarization' as const
  },
  { 
    id: 'cross-reference', 
    name: 'Cross-Reference', 
    icon: Link2, 
    color: 'text-emerald-600',
    chip: 'bg-emerald-50 border-emerald-100',
    outputType: 'cross_references' as const
  },
  { 
    id: 'curriculum', 
    name: 'Study Builder', 
    icon: BookOpen, 
    color: 'text-amber-600',
    chip: 'bg-amber-50 border-amber-100',
    outputType: 'curriculum' as const
  },
  { 
    id: 'sermon', 
    name: 'Sermon Assistant', 
    icon: Mic, 
    color: 'text-pink-600',
    chip: 'bg-pink-50 border-pink-100',
    outputType: 'sermon' as const
  },
  { 
    id: 'doctrinal', 
    name: 'Doctrine Lens', 
    icon: Scale, 
    color: 'text-indigo-600',
    chip: 'bg-indigo-50 border-indigo-100',
    outputType: 'doctrinal_harmony' as const
  },
  { 
    id: 'translate', 
    name: 'Translate', 
    icon: Globe, 
    color: 'text-teal-600',
    chip: 'bg-teal-50 border-teal-100',
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
      <div className="flex-1 flex flex-col gap-3 p-3 sm:p-4">
        {/* Agents Grid - NotebookLM style */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] font-semibold tracking-wide text-gray-500 uppercase">Notebook AI studio</p>
            <div className="flex items-center gap-1 text-[11px] text-gray-500">
              <Sparkles className="h-3 w-3 text-orange-500" />
              <span>{completedOutputs.length} saved</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            {aiAgents.map((agent) => {
              const Icon = agent.icon;
              const isGenerating = generatingTypes.includes(agent.id);
              return (
                <Card
                  key={agent.id}
                  className={`cursor-pointer rounded-2xl border ${agent.chip} group transition-all duration-200 overflow-hidden`}
                  onClick={() => handleOpenAgent(agent.id)}
                >
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className={`w-8 h-8 rounded-xl bg-white/70 flex items-center justify-center ${agent.color}`}>
                        <Icon className="h-3 w-3" />
                      </div>
                      <PenSquare className="h-3 w-3 text-gray-400" />
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs sm:text-sm font-semibold text-gray-900 leading-tight">{agent.name}</p>
                      <div className="flex items-center gap-1 text-[11px] text-gray-500 flex-shrink-0 ml-1">
                        {isGenerating && <span className="h-1.5 w-1.5 rounded-full bg-orange-500 animate-pulse" />}
                        <ChevronRight className="h-3 w-3 text-gray-400 group-hover:text-orange-600 transition-colors" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
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

        {/* Generated Content Area */}
        <div className="flex-1 overflow-hidden rounded-2xl border border-gray-200 bg-white">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-900">Generated content</p>
              <p className="text-xs text-gray-500">Agent outputs stay organized here.</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-gray-500 hover:text-orange-600"
              onClick={() => completedOutputs[0] && setSelectedOutput(completedOutputs[0])}
            >
              View latest
            </Button>
          </div>

          <ScrollArea className="h-full">
            <div className="p-3 sm:p-4 space-y-3">
              {/* Generating Status */}
              {generatingTypes.length > 0 && !activeAgentModal && (
                <div className="space-y-2">
                  {generatingTypes.map((agentId) => {
                    const agent = aiAgents.find(a => a.id === agentId) || aiAgents[0];
                    return (
                      <div
                        key={agentId}
                        className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm"
                      >
                        <div className="flex items-center gap-3">
                          <BibleAuraLoadingAnimation className="h-5 w-5" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">
                              Generating {agent.name.toLowerCase()}...
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              Analyzing {sourceCount} source{sourceCount !== 1 ? 's' : ''} • This may take 10-30 seconds
                            </p>
                            <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                              <div className="bg-orange-500 h-1.5 rounded-full animate-pulse" style={{ width: '60%' }} />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Completed Outputs */}
              {completedOutputs.length > 0 ? (
                <div className="space-y-2">
                  {completedOutputs.map((output) => {
                    if (!output || !output.id) return null;
                    
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
                        className="bg-white rounded-xl p-3 flex items-center gap-3 border border-gray-200 hover:shadow-md transition-all cursor-pointer group"
                        onClick={() => setSelectedOutput(output)}
                      >
                        <div className={`w-11 h-11 rounded-lg ${agent.color} flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105`}>
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
              ) : (
                generatingTypes.length === 0 && (
                  <div className="text-center py-8 text-sm text-gray-500 border border-dashed border-gray-200 rounded-xl">
                    No agent outputs yet. Run an agent to see results here.
                  </div>
                )
              )}
            </div>
          </ScrollArea>
        </div>
      </div>

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
