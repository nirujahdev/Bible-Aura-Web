// Studio Panel - Right panel in notebook view with 6 AI Agents
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  FileText, 
  Search,
  Link2,
  BookOpen,
  Mic,
  Scale,
  Sparkles,
  FilePlus
} from 'lucide-react';
import { SummarizeAgentModal } from './agents/SummarizeAgentModal';
import { SearchQAAgentModal } from './agents/SearchQAAgentModal';
import { CrossReferenceAgentModal } from './agents/CrossReferenceAgentModal';
import { CurriculumAgentModal } from './agents/CurriculumAgentModal';
import { SermonAgentModal } from './agents/SermonAgentModal';
import { DoctrinalAgentModal } from './agents/DoctrinalAgentModal';

interface StudioPanelProps {
  notebookId: string;
}

const aiAgents = [
  { 
    id: 'summarize', 
    name: 'Summarization & Synthesis', 
    icon: FileText, 
    color: 'bg-blue-50 text-blue-600',
    description: 'Summarize and synthesize multiple sources'
  },
  { 
    id: 'search-qa', 
    name: 'Theology Q&A', 
    icon: Search, 
    color: 'bg-purple-50 text-purple-600',
    description: 'Bible-focused questions and answers'
  },
  { 
    id: 'cross-reference', 
    name: 'Cross-Reference Discovery', 
    icon: Link2, 
    color: 'bg-green-50 text-green-600',
    description: 'Find related Bible verses and connections'
  },
  { 
    id: 'curriculum', 
    name: 'Study Plan Builder', 
    icon: BookOpen, 
    color: 'bg-orange-50 text-orange-600',
    description: 'Create Bible study curricula'
  },
  { 
    id: 'sermon', 
    name: 'Sermon Assistant', 
    icon: Mic, 
    color: 'bg-pink-50 text-pink-600',
    description: 'Prepare sermon outlines and content'
  },
  { 
    id: 'doctrinal', 
    name: 'Doctrinal Harmonization', 
    icon: Scale, 
    color: 'bg-indigo-50 text-indigo-600',
    description: 'Harmonize doctrine and perspectives'
  },
];

export function StudioPanel({ notebookId }: StudioPanelProps) {
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const handleOpenAgent = (agentId: string) => {
    setActiveModal(agentId);
  };

  const handleCloseModal = () => {
    setActiveModal(null);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-3 sm:p-4 border-b border-gray-200 bg-white">
        <h2 className="font-semibold text-gray-900 text-sm sm:text-base">Studio</h2>
        <p className="text-xs text-gray-500 mt-1">AI-powered Bible research agents</p>
      </div>

      {/* Agents Grid */}
      <ScrollArea className="flex-1">
        <div className="p-3 sm:p-4">
          <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-4 sm:mb-6">
            {aiAgents.map((agent) => {
              const Icon = agent.icon;
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
        />
      )}
      {activeModal === 'search-qa' && (
        <SearchQAAgentModal
          notebookId={notebookId}
          open={true}
          onClose={handleCloseModal}
        />
      )}
      {activeModal === 'cross-reference' && (
        <CrossReferenceAgentModal
          notebookId={notebookId}
          open={true}
          onClose={handleCloseModal}
        />
      )}
      {activeModal === 'curriculum' && (
        <CurriculumAgentModal
          notebookId={notebookId}
          open={true}
          onClose={handleCloseModal}
        />
      )}
      {activeModal === 'sermon' && (
        <SermonAgentModal
          notebookId={notebookId}
          open={true}
          onClose={handleCloseModal}
        />
      )}
      {activeModal === 'doctrinal' && (
        <DoctrinalAgentModal
          notebookId={notebookId}
          open={true}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}
