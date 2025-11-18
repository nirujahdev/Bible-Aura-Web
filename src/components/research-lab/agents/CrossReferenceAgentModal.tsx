// Cross-Reference Discovery Agent Modal
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Link2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { BibleAuraLoadingAnimation } from '@/components/BibleAuraLoadingAnimation';

interface CrossReferenceAgentModalProps {
  notebookId: string;
  open: boolean;
  onClose: () => void;
  onGenerated?: () => void;
}

export function CrossReferenceAgentModal({ notebookId, open, onClose, onGenerated }: CrossReferenceAgentModalProps) {
  const [verseReference, setVerseReference] = useState('');
  const [theme, setTheme] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!verseReference.trim() && !theme.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a verse reference or theme',
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
          agentType: 'cross_reference',
          notebookId,
          verseReference: verseReference.trim() || undefined,
          theme: theme.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to find cross-references');
      }

      setResult(data.crossReferences);
      toast({
        title: 'Success',
        description: 'Cross-references found successfully',
      });
      // Notify parent and close modal for background processing
      if (onGenerated) {
        onGenerated();
      }
      onClose();
    } catch (error: any) {
      console.error('Cross-reference error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to find cross-references',
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
            <Link2 className="h-5 w-5 text-green-600" />
            Cross-Reference Discovery
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div>
            <Label htmlFor="verseReference">Verse Reference (optional)</Label>
            <Input
              id="verseReference"
              placeholder="e.g., John 3:16"
              value={verseReference}
              onChange={(e) => setVerseReference(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="theme">OR Theme (optional)</Label>
            <Textarea
              id="theme"
              placeholder="e.g., forgiveness, grace, salvation"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              rows={2}
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter either a verse reference or a theme to find related verses.
            </p>
          </div>

          {!result && (
            <>
              {isGenerating ? (
                <div className="py-6">
                  <BibleAuraLoadingAnimation message="Finding cross-references..." size="medium" />
                </div>
              ) : (
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating || (!verseReference.trim() && !theme.trim())}
                  className="w-full"
                >
                  Find Cross-References
                </Button>
              )}
            </>
          )}

          {result && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold mb-2">Cross-References</h3>
                <div className="text-sm text-gray-700 whitespace-pre-wrap">{result}</div>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => { setResult(null); setVerseReference(''); setTheme(''); }} variant="outline" className="flex-1">
                  Search Again
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

