// Doctrinal Harmonization & Multi-Perspective Agent Modal
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Scale, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface DoctrinalAgentModalProps {
  notebookId: string;
  open: boolean;
  onClose: () => void;
}

export function DoctrinalAgentModal({ notebookId, open, onClose }: DoctrinalAgentModalProps) {
  const [doctrinalQuestion, setDoctrinalQuestion] = useState('');
  const [includePerspectives, setIncludePerspectives] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!doctrinalQuestion.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a doctrinal question',
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

      const response = await fetch('/api/research-lab/agents/doctrinal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          notebookId,
          doctrinalQuestion: doctrinalQuestion.trim(),
          includePerspectives,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to harmonize doctrine');
      }

      setResult(data.harmonization);
      toast({
        title: 'Success',
        description: 'Doctrinal harmonization generated successfully',
      });
    } catch (error: any) {
      console.error('Doctrinal error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to harmonize doctrine',
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
            <Scale className="h-5 w-5 text-indigo-600" />
            Doctrinal Harmonization
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div>
            <Label htmlFor="doctrinalQuestion">Doctrinal Question *</Label>
            <Textarea
              id="doctrinalQuestion"
              placeholder="e.g., How can we reconcile Paul and James on faith vs. works?"
              value={doctrinalQuestion}
              onChange={(e) => setDoctrinalQuestion(e.target.value)}
              rows={3}
            />
            <p className="text-xs text-gray-500 mt-1">
              Ask questions about Bible doctrine, theology, or difficult passages.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="includePerspectives"
              checked={includePerspectives}
              onCheckedChange={(checked) => setIncludePerspectives(checked === true)}
            />
            <Label htmlFor="includePerspectives" className="text-sm font-normal cursor-pointer">
              Include multiple theological perspectives
            </Label>
          </div>

          {!result && (
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !doctrinalQuestion.trim()}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Harmonizing...
                </>
              ) : (
                'Harmonize Doctrine'
              )}
            </Button>
          )}

          {result && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold mb-2">Harmonization</h3>
                <div className="text-sm text-gray-700 whitespace-pre-wrap">{result}</div>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => { setResult(null); setDoctrinalQuestion(''); }} variant="outline" className="flex-1">
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

