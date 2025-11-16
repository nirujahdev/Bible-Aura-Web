import React, { useEffect, useState } from 'react';
import { Sparkles, Loader2, Wand2, BookOpen, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { TextDiffView } from '@/components/TextDiffView';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

interface TextSelectionMenuProps {
  editorRef: React.RefObject<HTMLDivElement>;
  onReplaceText?: (originalText: string, newText: string) => void;
}

export function TextSelectionMenu({ editorRef, onReplaceText }: TextSelectionMenuProps) {
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [selectedText, setSelectedText] = useState('');
  const [selectedRange, setSelectedRange] = useState<Range | null>(null);
  const [showDiffView, setShowDiffView] = useState(false);
  const [generatedText, setGeneratedText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [availableAgents, setAvailableAgents] = useState<any[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    let selectionTimeout: NodeJS.Timeout | null = null;
    let isProcessing = false;

    const handleSelection = () => {
      // Prevent multiple simultaneous calls
      if (isProcessing) return;
      
      // Clear any pending timeout
      if (selectionTimeout) {
        clearTimeout(selectionTimeout);
      }

      // Debounce selection handling
      selectionTimeout = setTimeout(() => {
        isProcessing = true;
        
        try {
          const selection = window.getSelection();
          
          if (!selection || selection.rangeCount === 0) {
            setPosition(null);
            setSelectedText('');
            setSelectedRange(null);
            isProcessing = false;
            return;
          }

          const selectedTextContent = selection.toString().trim();
          
          if (selectedTextContent.length === 0) {
            setPosition(null);
            setSelectedText('');
            setSelectedRange(null);
            isProcessing = false;
            return;
          }

          // Check if selection is within our editor
          if (editorRef.current) {
            const anchorNode = selection.anchorNode;
            if (!anchorNode || !editorRef.current.contains(anchorNode)) {
              setPosition(null);
              setSelectedText('');
              setSelectedRange(null);
              isProcessing = false;
              return;
            }
          }

          const range = selection.getRangeAt(0);
          
          setSelectedText(selectedTextContent);
          setSelectedRange(range.cloneRange());

          // Get position of selection
          const rect = range.getBoundingClientRect();
          setPosition({
            x: rect.left + rect.width / 2,
            y: rect.top - 10
          });
        } catch (error) {
          console.error('Selection error:', error);
        } finally {
          isProcessing = false;
        }
      }, 100); // Debounce by 100ms
    };

    const handleMouseUp = (e: MouseEvent) => {
      // Only process if mouseup is in the editor
      if (editorRef.current && editorRef.current.contains(e.target as Node)) {
        handleSelection();
      } else {
        // Clear selection if clicking outside
        setPosition(null);
        setSelectedText('');
        setSelectedRange(null);
      }
    };

    const handleClick = (e: MouseEvent) => {
      // Hide menu if clicking outside editor
      if (editorRef.current && !editorRef.current.contains(e.target as Node)) {
        const selection = window.getSelection();
        if (selection) {
          selection.removeAllRanges();
        }
        setPosition(null);
        setSelectedText('');
        setSelectedRange(null);
      }
    };

    // Use mouseup instead of selectionchange for better performance
    document.addEventListener('mouseup', handleMouseUp, true);
    document.addEventListener('click', handleClick, true);

    return () => {
      if (selectionTimeout) {
        clearTimeout(selectionTimeout);
      }
      document.removeEventListener('mouseup', handleMouseUp, true);
      document.removeEventListener('click', handleClick, true);
    };
  }, [editorRef]);

  // Load available agents on mount
  useEffect(() => {
    const loadAgents = async () => {
      try {
        const { getAllAgents } = await import('@/lib/sermon-agents');
        const agents = getAllAgents();
        // Filter to only show writing/improvement agents for text selection
        const textAgents = agents.filter(agent => 
          agent.id === 'improve' || 
          agent.id === 'enhance' || 
          agent.id === 'find-scripture' ||
          agent.id === 'related-scripture-searcher' ||
          agent.id === 'sermon-sculptor'
        );
        setAvailableAgents(textAgents);
      } catch (error) {
        console.error('Error loading agents:', error);
      }
    };
    loadAgents();
  }, []);

  const handleAITool = async (toolId: string) => {
    if (!selectedText || !user) {
      toast({
        title: "Error",
        description: "Please select text and ensure you're logged in",
        variant: "destructive"
      });
      return;
    }
    
    setIsGenerating(true);
    setSelectedTool(toolId);
    // Keep menu visible but show loading state

    try {
      // Dynamically import and execute agent
      const { getAllAgents, executeAgent } = await import('@/lib/sermon-agents');
      const agents = getAllAgents();
      const agent = agents.find(a => a.id === toolId);
      
      if (!agent) {
        throw new Error('Tool not found');
      }

      // Execute agent with selected text as context
      const agentResult = await executeAgent(
        toolId,
        {
          content: selectedText,
          title: '',
          scripture: ''
        },
        user.id,
        {
          selectedText: selectedText
        }
      );

      if (agentResult && agentResult.content) {
        setGeneratedText(agentResult.content);
        setShowDiffView(true);
        setPosition(null); // Hide menu when showing diff view
      } else {
        throw new Error('Invalid response from AI');
      }
    } catch (error: any) {
      console.error('AI tool error:', error);
      toast({
        title: "Generation failed",
        description: error?.message || "Failed to generate content",
        variant: "destructive"
      });
      setIsGenerating(false);
      setSelectedTool(null);
    } finally {
      setIsGenerating(false);
      setSelectedTool(null);
    }
  };

  const handleAccept = () => {
    if (onReplaceText && selectedText && generatedText && selectedRange) {
      // Restore selection and replace text
      const selection = window.getSelection();
      if (selection && selectedRange) {
        try {
          selection.removeAllRanges();
          selection.addRange(selectedRange);
          
          // Replace the selected text with generated content
          if (editorRef.current) {
            const range = selection.getRangeAt(0);
            range.deleteContents();
            
            // Insert generated text as HTML
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = generatedText;
            const fragment = document.createDocumentFragment();
            while (tempDiv.firstChild) {
              fragment.appendChild(tempDiv.firstChild);
            }
            range.insertNode(fragment);
            
            // Update content
            const newContent = editorRef.current.innerHTML;
            // Trigger input event to update parent
            const event = new Event('input', { bubbles: true });
            editorRef.current.dispatchEvent(event);
            
            onReplaceText(selectedText, generatedText);
          }
        } catch (error) {
          console.error('Error replacing text:', error);
          // Fallback: use onReplaceText callback
          onReplaceText(selectedText, generatedText);
        }
      } else {
        // Fallback: use onReplaceText callback
        onReplaceText(selectedText, generatedText);
      }
      
      toast({
        title: "Content updated",
        description: "AI-generated content has been applied",
      });
    }
    setShowDiffView(false);
    setGeneratedText('');
    setSelectedText('');
    setSelectedRange(null);
    window.getSelection()?.removeAllRanges();
  };

  const handleDecline = () => {
    setShowDiffView(false);
    setGeneratedText('');
    setSelectedText('');
    setSelectedRange(null);
    toast({
      title: "Changes declined",
      description: "Original text kept",
    });
  };

  // Get agent icon
  const getAgentIcon = (agentId: string) => {
    const iconMap: Record<string, any> = {
      'improve': Wand2,
      'enhance': Sparkles,
      'find-scripture': BookOpen,
      'related-scripture-searcher': Search,
      'sermon-sculptor': Wand2,
    };
    return iconMap[agentId] || Sparkles;
  };

  // Get agent name
  const getAgentName = (agentId: string) => {
    const agent = availableAgents.find(a => a.id === agentId);
    return agent?.name || agentId;
  };

  if (!position || !selectedText) return null;

  return (
    <>
      <div
        className="fixed z-[100] bg-white border border-gray-200 rounded-lg shadow-xl p-2 flex flex-col gap-1 min-w-[200px]"
        style={{
          left: `${position.x}px`,
          top: `${position.y - 50}px`,
          transform: 'translateX(-50%)',
        }}
        onMouseDown={(e) => e.preventDefault()}
      >
        {isGenerating ? (
          <div className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600">
            <Loader2 className="h-4 w-4 animate-spin text-orange-500" />
            <span>Generating with {getAgentName(selectedTool || '')}...</span>
          </div>
        ) : (
          <>
            <div className="text-xs font-semibold text-gray-500 px-2 py-1 mb-1">AI Tools</div>
            {availableAgents.map((agent) => {
              const Icon = getAgentIcon(agent.id);
              return (
                <Button
                  key={agent.id}
                  variant="ghost"
                  size="sm"
                  onClick={() => handleAITool(agent.id)}
                  className="h-9 px-3 hover:bg-orange-50 justify-start text-left"
                  disabled={isGenerating}
                >
                  <Icon className="h-4 w-4 mr-2 text-orange-600" />
                  <span className="text-sm">{agent.name}</span>
                </Button>
              );
            })}
            {availableAgents.length === 0 && (
              <div className="px-3 py-2 text-xs text-gray-500">Loading tools...</div>
            )}
          </>
        )}
      </div>

      {/* Diff View Dialog */}
      <Dialog open={showDiffView} onOpenChange={setShowDiffView}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <TextDiffView
            originalText={selectedText}
            generatedText={generatedText}
            onAccept={handleAccept}
            onDecline={handleDecline}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

