// Sermon Outline Builder - AI-assisted outline creation
import React, { useState, useEffect } from 'react';
import { useSermonAI, OutlineItem } from '@/contexts/SermonAIContext';
import { generateOutline, OutlineSuggestion } from '@/lib/sermon-ai-service';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, Plus, Trash2, ChevronUp, ChevronDown, 
  Sparkles, Edit2, Check, X, Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export function SermonOutlineBuilder() {
  const { state, updateOutline } = useSermonAI();
  const { user } = useAuth();
  const { toast } = useToast();
  const [outline, setOutline] = useState<OutlineItem[]>(state.outline);
  const [isGenerating, setIsGenerating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [topic, setTopic] = useState(state.sermonTitle || '');
  const [scripture, setScripture] = useState(state.scriptureReference || '');

  useEffect(() => {
    setOutline(state.outline);
  }, [state.outline]);

  const convertToOutlineItem = (suggestion: OutlineSuggestion, order: number): OutlineItem => {
    return {
      id: `item-${Date.now()}-${order}`,
      title: suggestion.title,
      level: suggestion.level || 1,
      content: suggestion.content,
      subItems: suggestion.subPoints?.map((sub, idx) => ({
        id: `sub-${Date.now()}-${order}-${idx}`,
        title: sub,
        level: (suggestion.level || 1) + 1,
        order: idx,
      })),
      order,
    };
  };

  const handleGenerateOutline = async () => {
    if (!topic.trim() && !scripture.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide a topic or scripture reference",
        variant: "destructive",
      });
      return;
    }

    if (!user) return;

    setIsGenerating(true);
    try {
      const suggestions = await generateOutline(
        topic,
        scripture,
        {
          audienceType: 'general',
          sermonType: 'expository',
          length: 'medium',
        },
        user.id
      );

      if (suggestions.length === 0) {
        toast({
          title: "No Outline Generated",
          description: "Could not generate outline. Please try again.",
          variant: "destructive",
        });
        return;
      }

      const newOutline = suggestions.map((suggestion, idx) => 
        convertToOutlineItem(suggestion, idx)
      );
      setOutline(newOutline);
      updateOutline(newOutline);
      
      toast({
        title: "Outline Generated",
        description: `Created ${newOutline.length} main points`,
      });
    } catch (error: any) {
      console.error('Outline generation error:', error);
      const errorMessage = error?.message || "Failed to generate outline";
      toast({
        title: error?.message?.includes('API key') ? "API Configuration Error" : "Generation Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddPoint = () => {
    const newPoint: OutlineItem = {
      id: `item-${Date.now()}`,
      title: 'New Point',
      level: 1,
      content: '',
      order: outline.length,
    };
    const newOutline = [...outline, newPoint];
    setOutline(newOutline);
    updateOutline(newOutline);
    setEditingId(newPoint.id);
    setEditTitle(newPoint.title);
    setEditContent(newPoint.content || '');
  };

  const handleDeletePoint = (id: string) => {
    const newOutline = outline.filter(item => item.id !== id);
    setOutline(newOutline);
    updateOutline(newOutline);
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newOutline = [...outline];
    [newOutline[index - 1], newOutline[index]] = [newOutline[index], newOutline[index - 1]];
    newOutline[index - 1].order = index - 1;
    newOutline[index].order = index;
    setOutline(newOutline);
    updateOutline(newOutline);
  };

  const handleMoveDown = (index: number) => {
    if (index === outline.length - 1) return;
    const newOutline = [...outline];
    [newOutline[index], newOutline[index + 1]] = [newOutline[index + 1], newOutline[index]];
    newOutline[index].order = index;
    newOutline[index + 1].order = index + 1;
    setOutline(newOutline);
    updateOutline(newOutline);
  };

  const handleStartEdit = (item: OutlineItem) => {
    setEditingId(item.id);
    setEditTitle(item.title);
    setEditContent(item.content || '');
  };

  const handleSaveEdit = () => {
    if (!editingId) return;
    const newOutline = outline.map(item =>
      item.id === editingId
        ? { ...item, title: editTitle, content: editContent }
        : item
    );
    setOutline(newOutline);
    updateOutline(newOutline);
    setEditingId(null);
    setEditTitle('');
    setEditContent('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditTitle('');
    setEditContent('');
  };

  const handleExportToContent = () => {
    const content = outline.map((item, idx) => {
      let text = `${idx + 1}. ${item.title}\n`;
      if (item.content) {
        text += `   ${item.content}\n`;
      }
      if (item.subItems && item.subItems.length > 0) {
        item.subItems.forEach((sub, subIdx) => {
          text += `   ${String.fromCharCode(97 + subIdx)}. ${sub.title}\n`;
        });
      }
      return text;
    }).join('\n');

    // Update sermon content with outline
    // This would need to be integrated with the sermon editor
    toast({
      title: "Outline Ready",
      description: "Outline structure created. You can now expand each point in your sermon.",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Outline Builder
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Generation Input */}
        <div className="space-y-2">
          <Input
            placeholder="Sermon Topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
          <Input
            placeholder="Scripture Reference (e.g., John 3:16)"
            value={scripture}
            onChange={(e) => setScripture(e.target.value)}
          />
          <Button
            onClick={handleGenerateOutline}
            disabled={isGenerating || (!topic.trim() && !scripture.trim())}
            className="w-full"
            size="sm"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate AI Outline
              </>
            )}
          </Button>
        </div>

        {/* Outline List */}
        {outline.length > 0 && (
          <div className="space-y-2 pt-2 border-t">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-600">
                {outline.length} Point{outline.length !== 1 ? 's' : ''}
              </span>
              <div className="flex gap-2">
                <Button
                  onClick={handleAddPoint}
                  variant="outline"
                  size="sm"
                  className="h-7"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add
                </Button>
                <Button
                  onClick={handleExportToContent}
                  variant="outline"
                  size="sm"
                  className="h-7"
                >
                  Export
                </Button>
              </div>
            </div>

            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {outline.map((item, index) => (
                <div
                  key={item.id}
                  className="border rounded-lg p-3 bg-gray-50"
                >
                  {editingId === item.id ? (
                    <div className="space-y-2">
                      <Input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        placeholder="Point title"
                        className="h-8"
                      />
                      <Textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        placeholder="Point content"
                        className="min-h-[60px] text-sm"
                      />
                      <div className="flex gap-2">
                        <Button
                          onClick={handleSaveEdit}
                          size="sm"
                          className="h-7"
                        >
                          <Check className="h-3 w-3 mr-1" />
                          Save
                        </Button>
                        <Button
                          onClick={handleCancelEdit}
                          variant="outline"
                          size="sm"
                          className="h-7"
                        >
                          <X className="h-3 w-3 mr-1" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">
                              {index + 1}
                            </Badge>
                            <h4 className="font-medium text-sm">{item.title}</h4>
                          </div>
                          {item.content && (
                            <p className="text-xs text-gray-600 mt-1 ml-8">
                              {item.content}
                            </p>
                          )}
                          {item.subItems && item.subItems.length > 0 && (
                            <div className="ml-8 mt-1 space-y-1">
                              {item.subItems.map((sub, subIdx) => (
                                <div key={sub.id} className="text-xs text-gray-500">
                                  {String.fromCharCode(97 + subIdx)}. {sub.title}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() => handleMoveUp(index)}
                            disabled={index === 0}
                          >
                            <ChevronUp className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() => handleMoveDown(index)}
                            disabled={index === outline.length - 1}
                          >
                            <ChevronDown className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() => handleStartEdit(item)}
                          >
                            <Edit2 className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-red-500 hover:text-red-600"
                            onClick={() => handleDeletePoint(item.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {outline.length === 0 && (
          <div className="text-center py-8 text-sm text-gray-500">
            <FileText className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p>No outline yet</p>
            <p className="text-xs mt-1">Generate one or add points manually</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

