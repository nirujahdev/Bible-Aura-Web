// Summarization & Synthesis Agent Modal
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { BibleAuraLoadingAnimation } from '@/components/BibleAuraLoadingAnimation';

interface SummarizeAgentModalProps {
  notebookId: string;
  open: boolean;
  onClose: () => void;
  onGenerated?: () => void;
}

export function SummarizeAgentModal({ notebookId, open, onClose, onGenerated }: SummarizeAgentModalProps) {
  const [summaryType, setSummaryType] = useState<'brief' | 'detailed' | 'thematic'>('detailed');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const { toast } = useToast();

  const handleGenerate = async () => {
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
          agentType: 'summarize',
          notebookId,
          summaryType,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate summary');
      }

      setResult(data.summary);
      toast({
        title: 'Success',
        description: 'Summary generated successfully',
      });
      // Notify parent and close modal for background processing
      if (onGenerated) {
        onGenerated();
      }
      onClose();
    } catch (error: any) {
      console.error('Summarize error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to generate summary',
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
            <FileText className="h-5 w-5 text-blue-600" />
            Summarization & Synthesis Agent
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div>
            <Label htmlFor="summaryType">Summary Type</Label>
            <Select value={summaryType} onValueChange={(v: any) => setSummaryType(v)}>
              <SelectTrigger id="summaryType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="brief">Brief (2-3 paragraphs)</SelectItem>
                <SelectItem value="detailed">Detailed (comprehensive)</SelectItem>
                <SelectItem value="thematic">Thematic (organized by themes)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {!result && (
            <>
              {isGenerating ? (
                <div className="py-6">
                  <BibleAuraLoadingAnimation message="Generating summary..." size="medium" />
                </div>
              ) : (
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="w-full"
                >
                  Generate Summary
                </Button>
              )}
            </>
          )}

          {result && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold mb-2">Summary</h3>
                <div className="text-sm text-gray-700 whitespace-pre-wrap">{result}</div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleGenerate} variant="outline" className="flex-1">
                  Regenerate
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

