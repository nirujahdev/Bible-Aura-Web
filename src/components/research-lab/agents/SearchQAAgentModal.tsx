// Theology-Specific Search & Q&A Agent Modal
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { BibleAuraLoadingAnimation } from '@/components/BibleAuraLoadingAnimation';

interface SearchQAAgentModalProps {
  notebookId: string;
  open: boolean;
  onClose: () => void;
  onGenerated?: () => void;
}

export function SearchQAAgentModal({ notebookId, open, onClose, onGenerated }: SearchQAAgentModalProps) {
  const [question, setQuestion] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<{ question: string; answer: string } | null>(null);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!question.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a question',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    setResult(null);

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

      const response = await fetch('/api/research-lab/agents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          agentType: 'search_qa',
          notebookId,
          question: question.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to get answer');
      }

      setResult({ question: data.question, answer: data.answer });
      toast({
        title: 'Success',
        description: 'Answer generated successfully',
      });
      // Notify parent and close modal for background processing
      if (onGenerated) {
        onGenerated();
      }
      onClose();
    } catch (error: any) {
      console.error('Search Q&A error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to get answer',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <img 
              src="/✦Bible Aura (2).png" 
              alt="Bible Aura" 
              className="h-6 w-6 rounded"
            />
            <Search className="h-5 w-5 text-purple-600" />
            Theology-Specific Search & Q&A
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div>
            <Label htmlFor="question">Ask a Bible-related question</Label>
            <Textarea
              id="question"
              placeholder="e.g., What does the Bible say about forgiveness?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              rows={3}
            />
            <p className="text-xs text-gray-500 mt-1">
              Questions must be related to the Bible, theology, or Christianity.
            </p>
          </div>

          {!result && (
            <>
              {isGenerating ? (
                <div className="py-6">
                  <BibleAuraLoadingAnimation message="Searching for answer..." size="medium" />
                </div>
              ) : (
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating || !question.trim()}
                  className="w-full"
                >
                  Get Answer
                </Button>
              )}
            </>
          )}

          {result && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold mb-2">Question</h3>
                <p className="text-sm text-gray-700 mb-4">{result.question}</p>
                <h3 className="font-semibold mb-2">Answer</h3>
                <div className="text-sm text-gray-700 whitespace-pre-wrap">{result.answer}</div>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => { setResult(null); setQuestion(''); }} variant="outline" className="flex-1">
                  Ask Another
                </Button>
                <Button onClick={onClose} className="flex-1">
                  Done
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

