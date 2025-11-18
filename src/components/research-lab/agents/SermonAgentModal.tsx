// Sermon Preparation & Generation Assistant Modal
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Mic, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface SermonAgentModalProps {
  notebookId: string;
  open: boolean;
  onClose: () => void;
}

export function SermonAgentModal({ notebookId, open, onClose }: SermonAgentModalProps) {
  const [scriptureReference, setScriptureReference] = useState('');
  const [sermonType, setSermonType] = useState<'expository' | 'topical' | 'narrative'>('expository');
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
          agentType: 'sermon',
          notebookId,
          scriptureReference: scriptureReference.trim() || undefined,
          sermonType,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate sermon outline');
      }

      setResult(data.sermon);
      toast({
        title: 'Success',
        description: 'Sermon outline generated successfully',
      });
    } catch (error: any) {
      console.error('Sermon error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to generate sermon outline',
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
            <Mic className="h-5 w-5 text-pink-600" />
            Sermon Preparation Assistant
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div>
            <Label htmlFor="scriptureReference">Scripture Reference (optional)</Label>
            <Input
              id="scriptureReference"
              placeholder="e.g., Romans 8:1-17"
              value={scriptureReference}
              onChange={(e) => setScriptureReference(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="sermonType">Sermon Type</Label>
            <Select value={sermonType} onValueChange={(v: any) => setSermonType(v)}>
              <SelectTrigger id="sermonType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="expository">Expository (verse-by-verse)</SelectItem>
                <SelectItem value="topical">Topical (theme-based)</SelectItem>
                <SelectItem value="narrative">Narrative (story-based)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {!result && (
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating sermon outline...
                </>
              ) : (
                'Generate Sermon Outline'
              )}
            </Button>
          )}

          {result && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold mb-2">Sermon Outline</h3>
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

