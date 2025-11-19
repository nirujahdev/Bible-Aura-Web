// Agent Modal - NotebookLM-style interface for AI agents
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, X, FileText, BookOpen, PenTool, Sparkles, Scale } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BibleAuraLoadingAnimation } from '@/components/BibleAuraLoadingAnimation';

interface AgentModalProps {
  open: boolean;
  onClose: () => void;
  agentId: string;
  agentName: string;
  notebookId: string;
  sourceCount: number;
  onGenerated: () => void;
}

interface FormatOption {
  id: string;
  title: string;
  description: string;
  icon: any;
}

const formatOptions: Record<string, FormatOption[]> = {
  summarize: [
    {
      id: 'briefing',
      title: 'Briefing Doc',
      description: 'Overview of your sources featuring key insights and quotes',
      icon: FileText,
    },
    {
      id: 'detailed',
      title: 'Detailed Summary',
      description: 'Comprehensive analysis with main themes and evidence',
      icon: BookOpen,
    },
    {
      id: 'executive',
      title: 'Executive Summary',
      description: 'Concise high-level overview of critical takeaways',
      icon: Sparkles,
    },
  ],
  'search-qa': [
    {
      id: 'answer',
      title: 'Direct Answer',
      description: 'A focused answer to your question with scripture references',
      icon: FileText,
    },
    {
      id: 'explanation',
      title: 'Detailed Explanation',
      description: 'Comprehensive answer with context and cross-references',
      icon: BookOpen,
    },
  ],
  'cross-reference': [
    {
      id: 'list',
      title: 'Reference List',
      description: 'A curated list of related verses and passages',
      icon: FileText,
    },
    {
      id: 'analysis',
      title: 'Cross-Reference Analysis',
      description: 'Detailed analysis of connections between verses',
      icon: BookOpen,
    },
  ],
  curriculum: [
    {
      id: 'study-plan',
      title: 'Study Plan',
      description: 'Structured day-by-day study guide with verses and questions',
      icon: BookOpen,
    },
    {
      id: 'curriculum',
      title: 'Curriculum Framework',
      description: 'Complete curriculum outline with objectives and activities',
      icon: FileText,
    },
  ],
  sermon: [
    {
      id: 'outline',
      title: 'Sermon Outline',
      description: 'Structured outline with main points and applications',
      icon: FileText,
    },
    {
      id: 'full',
      title: 'Full Sermon',
      description: 'Complete sermon draft with introduction, body, and conclusion',
      icon: BookOpen,
    },
  ],
  doctrinal: [
    {
      id: 'harmony',
      title: 'Doctrinal Harmony',
      description: 'Reconciliation of different perspectives on the topic',
      icon: Scale,
    },
    {
      id: 'multi-perspective',
      title: 'Multi-Perspective Analysis',
      description: 'Analysis from different theological viewpoints',
      icon: BookOpen,
    },
  ],
};

const languages = [
  { value: 'en', label: 'English (default)' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'pt', label: 'Portuguese' },
  { value: 'zh', label: 'Chinese' },
  { value: 'ja', label: 'Japanese' },
  { value: 'ko', label: 'Korean' },
];

export function AgentModal({
  open,
  onClose,
  agentId,
  agentName,
  notebookId,
  sourceCount,
  onGenerated,
}: AgentModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedFormat, setSelectedFormat] = useState<string>('');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [description, setDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const formats = formatOptions[agentId] || formatOptions.summarize;
  const defaultFormat = formats[0]?.id || 'briefing';

  // Set default format when modal opens
  useState(() => {
    if (open && !selectedFormat) {
      setSelectedFormat(defaultFormat);
      setDescription(getDefaultDescription(agentId, defaultFormat));
    }
  });

  const handleFormatSelect = (formatId: string) => {
    setSelectedFormat(formatId);
    setDescription(getDefaultDescription(agentId, formatId));
  };

  const handleGenerate = async () => {
    if (!user || !notebookId) return;

    if (!selectedFormat) {
      toast({
        title: 'Format required',
        description: 'Please select a format for your output',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Session expired. Please log in again.');
      }

      // Map agent ID to API agentType
      const agentTypeMap: Record<string, string> = {
        'summarize': 'summarize',
        'search-qa': 'search_qa',
        'cross-reference': 'cross_reference',
        'curriculum': 'curriculum',
        'sermon': 'sermon',
        'doctrinal': 'doctrinal',
      };

      const agentType = agentTypeMap[agentId] || 'summarize';

      // Build request body based on agent type
      let requestBody: any = {
        agentType,
        notebookId,
        format: selectedFormat,
        language: selectedLanguage,
      };

      // Add agent-specific parameters
      if (agentId === 'search-qa' && description) {
        requestBody.question = description;
      } else if (agentId === 'cross-reference' && description) {
        requestBody.verseReference = description;
      } else if (agentId === 'curriculum' && description) {
        requestBody.topic = description;
      } else if (agentId === 'sermon' && description) {
        requestBody.scriptureReference = description;
      } else if (agentId === 'doctrinal' && description) {
        requestBody.doctrinalQuestion = description;
      } else if (agentId === 'summarize') {
        // Map frontend format IDs to API summaryType
        const formatToSummaryType: Record<string, string> = {
          'briefing': 'brief',
          'detailed': 'detailed',
          'executive': 'thematic',
        };
        requestBody.summaryType = formatToSummaryType[selectedFormat] || 'detailed';
        if (description) {
          requestBody.customInstructions = description;
        }
      }

      const response = await fetch('/api/research-lab/agents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || 'Failed to generate output');
      }

      const data = await response.json();

      // Check if there's a warning about save failure
      if (data.warning) {
        toast({
          title: 'Generated with warning',
          description: data.warning,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Generation started',
          description: `Your ${agentName} output is being generated. This may take a few minutes.`,
        });
      }

      // Only call onGenerated if we have an outputId (successfully saved)
      if (data.outputId) {
        onGenerated();
      } else if (data.success && data.status === 'completed') {
        // Content was generated but not saved - still trigger refresh to show it
        onGenerated();
      }

      handleClose();
    } catch (error: any) {
      console.error('Agent generation error:', error);
      toast({
        title: 'Generation failed',
        description: error.message || 'Failed to generate output. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClose = () => {
    setSelectedFormat(defaultFormat);
    setDescription('');
    setSelectedLanguage('en');
    setIsGenerating(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-8 w-8 p-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <FileText className="h-5 w-5 text-orange-500" />
            <DialogTitle className="text-lg sm:text-xl">Create {agentName}</DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-8 w-8 p-0 ml-auto"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Format Selection */}
          <div>
            <Label className="text-base font-semibold mb-3 block">Format</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {formats.map((format) => {
                const Icon = format.icon;
                const isSelected = selectedFormat === format.id;
                return (
                  <Card
                    key={format.id}
                    className={cn(
                      'cursor-pointer transition-all hover:shadow-md',
                      isSelected
                        ? 'ring-2 ring-orange-500 bg-orange-50'
                        : 'hover:bg-gray-50'
                    )}
                    onClick={() => handleFormatSelect(format.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          'p-2 rounded-lg',
                          isSelected ? 'bg-orange-100' : 'bg-gray-100'
                        )}>
                          <Icon className={cn(
                            'h-5 w-5',
                            isSelected ? 'text-orange-600' : 'text-gray-600'
                          )} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm mb-1">{format.title}</h4>
                          <p className="text-xs text-gray-600 line-clamp-2">{format.description}</p>
                        </div>
                        {isSelected && (
                          <div className="w-2 h-2 rounded-full bg-orange-500 flex-shrink-0 mt-1" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Language Selection */}
          <div>
            <Label htmlFor="language" className="text-base font-semibold mb-2 block">
              Choose language
            </Label>
            <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
              <SelectTrigger id="language" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value}>
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description Input */}
          <div>
            <Label htmlFor="description" className="text-base font-semibold mb-2 block">
              Describe the {agentName.toLowerCase()} that you want to create
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={getPlaceholder(agentId)}
              className="min-h-[150px] text-sm"
            />
          </div>

          {/* Generate Button */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={handleClose} disabled={isGenerating}>
              Cancel
            </Button>
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !selectedFormat}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              {isGenerating ? (
                <>
                  <BibleAuraLoadingAnimation className="h-4 w-4 mr-2" />
                  Generating...
                </>
              ) : (
                'Generate'
              )}
            </Button>
          </div>

          {/* Disclaimer */}
          <p className="text-xs text-gray-500 text-center">
            Bible Aura can be inaccurate; please double-check its responses.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function getDefaultDescription(agentId: string, formatId: string): string {
  const descriptions: Record<string, Record<string, string>> = {
    summarize: {
      briefing: 'Create a comprehensive briefing document that synthesizes the main themes and ideas from the sources. Start with a concise Executive Summary that presents the most critical takeaways upfront. The body of the document must provide a detailed and thorough examination of the main themes, evidence, and conclusions found in the sources. This analysis should be structured logically with headings and bullet points to ensure clarity. The tone must be objective and incisive.',
      detailed: 'Generate a detailed summary that covers all major points, themes, and insights from the sources. Include key quotes and evidence to support the main arguments.',
      executive: 'Create a concise executive summary highlighting the most important findings and conclusions from the sources.',
    },
    'search-qa': {
      answer: 'Provide a direct, scripture-grounded answer to the question based on the notebook sources.',
      explanation: 'Give a comprehensive explanation with context, cross-references, and theological insights.',
    },
    'cross-reference': {
      list: 'Generate a curated list of related Bible verses and passages that connect to the specified reference or theme.',
      analysis: 'Provide a detailed analysis showing how different verses relate to each other and form a cohesive theological theme.',
    },
    curriculum: {
      'study-plan': 'Create a structured study plan with daily readings, discussion questions, and reflection prompts.',
      curriculum: 'Design a complete curriculum framework with learning objectives, activities, and assessment methods.',
    },
    sermon: {
      outline: 'Generate a sermon outline with main points, sub-points, illustrations, and applications.',
      full: 'Create a complete sermon draft with introduction, main body, illustrations, and conclusion.',
    },
    doctrinal: {
      harmony: 'Reconcile different perspectives on this doctrinal question, showing how they can be harmonized or where genuine differences exist.',
      'multi-perspective': 'Present multiple theological perspectives on this topic, explaining each viewpoint and their scriptural basis.',
    },
  };

  return descriptions[agentId]?.[formatId] || '';
}

function getPlaceholder(agentId: string): string {
  const placeholders: Record<string, string> = {
    summarize: 'Describe the type of summary you want...',
    'search-qa': 'Enter your theological question...',
    'cross-reference': 'Enter a verse reference or theme...',
    curriculum: 'Enter the topic, duration, and target audience...',
    sermon: 'Enter the scripture reference and sermon type...',
    doctrinal: 'Enter your doctrinal question...',
  };

  return placeholders[agentId] || 'Enter your instructions...';
}

