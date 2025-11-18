// Studio Panel - Right panel in notebook view
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Music, 
  Video, 
  Network, 
  FileText, 
  CreditCard, 
  HelpCircle,
  Sparkles,
  FilePlus
} from 'lucide-react';

interface StudioPanelProps {
  notebookId: string;
}

const studioTools = [
  { id: 'audio', name: 'Audio Overview', icon: Music, color: 'bg-blue-50 text-blue-600' },
  { id: 'video', name: 'Video Overview', icon: Video, color: 'bg-purple-50 text-purple-600' },
  { id: 'mindmap', name: 'Mind Map', icon: Network, color: 'bg-green-50 text-green-600' },
  { id: 'reports', name: 'Reports', icon: FileText, color: 'bg-orange-50 text-orange-600' },
  { id: 'flashcards', name: 'Flashcards', icon: CreditCard, color: 'bg-pink-50 text-pink-600' },
  { id: 'quiz', name: 'Quiz', icon: HelpCircle, color: 'bg-indigo-50 text-indigo-600' },
];

export function StudioPanel({ notebookId }: StudioPanelProps) {
  const handleGenerate = (toolId: string) => {
    // TODO: Implement tool generation with GLM-4.5-Air
    console.log('Generate:', toolId);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <h2 className="font-semibold text-gray-900">Studio</h2>
      </div>

      {/* Tools Grid */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          <div className="grid grid-cols-2 gap-3 mb-6">
            {studioTools.map((tool) => {
              const Icon = tool.icon;
              return (
                <Card
                  key={tool.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleGenerate(tool.id)}
                >
                  <CardContent className="p-4 flex flex-col items-center text-center">
                    <div className={`w-12 h-12 rounded-lg ${tool.color} flex items-center justify-center mb-2`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <p className="text-xs font-medium text-gray-900">{tool.name}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Info Message */}
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <Sparkles className="h-5 w-5 text-gray-400 mx-auto mb-2" />
            <p className="text-xs text-gray-600 mb-1">
              Studio output will be saved here.
            </p>
            <p className="text-xs text-gray-500">
              After adding sources, click to add Audio Overview, study guide, mind map and more!
            </p>
          </div>
        </div>
      </ScrollArea>

      {/* Add Note Button */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <Button
          variant="outline"
          className="w-full bg-black text-white hover:bg-gray-800"
        >
          <FilePlus className="h-4 w-4 mr-2" />
          Add note
        </Button>
      </div>
    </div>
  );
}

