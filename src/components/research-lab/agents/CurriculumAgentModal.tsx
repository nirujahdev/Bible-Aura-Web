// Curriculum & Study Plan Builder Agent Modal
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { BookOpen, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface CurriculumAgentModalProps {
  notebookId: string;
  open: boolean;
  onClose: () => void;
}

export function CurriculumAgentModal({ notebookId, open, onClose }: CurriculumAgentModalProps) {
  const [topic, setTopic] = useState('');
  const [duration, setDuration] = useState('');
  const [audience, setAudience] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a study topic',
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
          agentType: 'curriculum',
          notebookId,
          topic: topic.trim(),
          duration: duration.trim() || undefined,
          audience: audience.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate curriculum');
      }

      setResult(data.curriculum);
      toast({
        title: 'Success',
        description: 'Curriculum generated successfully',
      });
    } catch (error: any) {
      console.error('Curriculum error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to generate curriculum',
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
            <BookOpen className="h-5 w-5 text-orange-600" />
            Curriculum & Study Plan Builder
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div>
            <Label htmlFor="topic">Study Topic *</Label>
            <Input
              id="topic"
              placeholder="e.g., Prayer in the Bible, The Book of Romans"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="duration">Duration (optional)</Label>
            <Input
              id="duration"
              placeholder="e.g., 4 weeks, 10 sessions"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="audience">Audience (optional)</Label>
            <Input
              id="audience"
              placeholder="e.g., teens, new believers, small group"
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
            />
          </div>

          {!result && (
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !topic.trim()}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating curriculum...
                </>
              ) : (
                'Generate Curriculum'
              )}
            </Button>
          )}

          {result && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold mb-2">Study Plan</h3>
                <div className="text-sm text-gray-700 whitespace-pre-wrap">{result}</div>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => { setResult(null); setTopic(''); setDuration(''); setAudience(''); }} variant="outline" className="flex-1">
                  Create Another
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

