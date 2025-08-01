import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Sparkles, 
  Brain, 
  Heart, 
  BookOpen, 
  Lightbulb, 
  Users, 
  Clock, 
  Globe,
  X,
  Loader2,
  Star,
  MessageCircle
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface AIAnalysisProps {
  verseId: string;
  verseText: string;
  verseReference: string;
  isOpen: boolean;
  onClose: () => void;
}

type AnalysisType = 
  | 'theological' 
  | 'historical' 
  | 'devotional' 
  | 'application' 
  | 'cross-references' 
  | 'commentary';

interface AnalysisResult {
  type: AnalysisType;
  content: string;
  keyPoints: string[];
  references?: string[];
  timestamp: string;
}

const ANALYSIS_TYPES = [
  {
    id: 'theological' as AnalysisType,
    name: 'Theological Insight',
    icon: BookOpen,
    description: 'Deep theological meaning and doctrine',
    color: 'bg-blue-100 text-blue-800'
  },
  {
    id: 'historical' as AnalysisType,
    name: 'Historical Context',
    icon: Clock,
    description: 'Historical background and cultural context',
    color: 'bg-amber-100 text-amber-800'
  },
  {
    id: 'devotional' as AnalysisType,
    name: 'Devotional Reflection',
    icon: Heart,
    description: 'Personal spiritual application',
    color: 'bg-pink-100 text-pink-800'
  },
  {
    id: 'application' as AnalysisType,
    name: 'Practical Application',
    icon: Lightbulb,
    description: 'How to apply this in daily life',
    color: 'bg-green-100 text-green-800'
  },
  {
    id: 'cross-references' as AnalysisType,
    name: 'Cross References',
    icon: Globe,
    description: 'Related verses and themes',
    color: 'bg-purple-100 text-purple-800'
  },
  {
    id: 'commentary' as AnalysisType,
    name: 'Biblical Commentary',
    icon: Users,
    description: 'Scholarly commentary and interpretation',
    color: 'bg-indigo-100 text-indigo-800'
  }
];

// Mock AI analysis function - in real app, this would call an AI service
const generateAnalysis = async (type: AnalysisType, verseText: string, reference: string): Promise<AnalysisResult> => {
  // Simulate AI processing delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const analysisTemplates: Record<AnalysisType, () => AnalysisResult> = {
    theological: () => ({
      type: 'theological',
      content: `This passage reveals key theological truths about God's nature and relationship with humanity. The verse demonstrates the divine attributes of love, grace, and sovereignty. The theological implications point to the doctrine of salvation by grace and the eternal nature of God's covenant with His people.`,
      keyPoints: [
        'Divine grace and mercy',
        'Covenant relationship with God',
        'Salvation through faith',
        'God\'s eternal nature'
      ],
      references: ['Romans 3:23', 'Ephesians 2:8-9', 'John 1:17'],
      timestamp: new Date().toISOString()
    }),
    
    historical: () => ({
      type: 'historical',
      content: `This verse was written in a specific historical context that deeply influences its meaning. The cultural background of the ancient Near East, including the religious practices, social customs, and political climate of the time, provides crucial insight into the original audience's understanding.`,
      keyPoints: [
        'Ancient Near Eastern context',
        'Cultural and social background',
        'Political climate of the time',
        'Religious practices of the era'
      ],
      references: ['Historical texts', 'Archaeological findings'],
      timestamp: new Date().toISOString()
    }),
    
    devotional: () => ({
      type: 'devotional',
      content: `This beautiful passage speaks directly to the heart, offering comfort, encouragement, and spiritual nourishment. It reminds us of God's faithful love and invites us into deeper relationship with Him. The verse calls us to trust, surrender, and find peace in His promises.`,
      keyPoints: [
        'God\'s faithful love',
        'Invitation to trust',
        'Finding peace in promises',
        'Deepening relationship with God'
      ],
      timestamp: new Date().toISOString()
    }),
    
    application: () => ({
      type: 'application',
      content: `This verse provides practical guidance for daily Christian living. It challenges us to examine our attitudes, actions, and priorities in light of biblical truth. Here are specific ways to apply these principles in contemporary life.`,
      keyPoints: [
        'Examine personal attitudes',
        'Align actions with biblical truth',
        'Set godly priorities',
        'Practice Christian virtues daily'
      ],
      timestamp: new Date().toISOString()
    }),
    
    'cross-references': () => ({
      type: 'cross-references',
      content: `This verse connects to numerous other biblical passages that share similar themes, concepts, or language. These cross-references help us understand the broader biblical narrative and see how God's truth is woven throughout Scripture.`,
      keyPoints: [
        'Connected biblical themes',
        'Similar concepts in Scripture',
        'Part of broader narrative',
        'Consistent biblical truth'
      ],
      references: ['Matthew 5:16', 'Romans 12:1-2', '1 Peter 2:9', 'Philippians 4:13'],
      timestamp: new Date().toISOString()
    }),
    
    commentary: () => ({
      type: 'commentary',
      content: `Biblical scholars have provided rich commentary on this passage throughout church history. Their insights help us understand the original meaning, linguistic nuances, and interpretive challenges. This verse has been understood in various ways by different theological traditions.`,
      keyPoints: [
        'Scholarly interpretation',
        'Linguistic analysis',
        'Historical church understanding',
        'Different theological perspectives'
      ],
      references: ['John Calvin Commentary', 'Matthew Henry Commentary', 'Modern Biblical Commentaries'],
      timestamp: new Date().toISOString()
    })
  };
  
  return analysisTemplates[type]();
};

export function AIAnalysis({ verseId, verseText, verseReference, isOpen, onClose }: AIAnalysisProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedType, setSelectedType] = useState<AnalysisType>('theological');
  const [analysisResults, setAnalysisResults] = useState<Record<AnalysisType, AnalysisResult | null>>({
    theological: null,
    historical: null,
    devotional: null,
    application: null,
    'cross-references': null,
    commentary: null
  });
  const [loading, setLoading] = useState<AnalysisType | null>(null);

  const handleAnalyze = async (type: AnalysisType) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to access verse analysis features",
        variant: "destructive",
      });
      return;
    }

    setLoading(type);
    try {
      const result = await generateAnalysis(type, verseText, verseReference);
      setAnalysisResults(prev => ({
        ...prev,
        [type]: result
      }));
      toast({
        title: "Analysis complete",
        description: `${ANALYSIS_TYPES.find(t => t.id === type)?.name} generated successfully`,
      });
    } catch (error) {
      console.error('Error generating analysis:', error);
      toast({
        title: "Error",
        description: "Failed to generate analysis",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl">Verse Analysis</CardTitle>
              <p className="text-sm text-muted-foreground">{verseReference}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="flex-1 overflow-hidden">
          <div className="text-sm text-muted-foreground mb-6 p-4 bg-muted/50 rounded-lg">
            <strong>Verse:</strong> "{verseText}"
          </div>

          {!user ? (
            <div className="text-center py-12">
              <Brain className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Sign In Required</h3>
              <p className="text-muted-foreground">
                Please sign in to access verse analysis features
              </p>
            </div>
          ) : (
            <Tabs value={selectedType} onValueChange={(value) => setSelectedType(value as AnalysisType)} className="space-y-6">
              <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
                {ANALYSIS_TYPES.map((type) => (
                  <TabsTrigger key={type.id} value={type.id} className="text-xs">
                    <type.icon className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">{type.name.split(' ')[0]}</span>
                  </TabsTrigger>
                ))}
              </TabsList>

              {ANALYSIS_TYPES.map((type) => (
                <TabsContent key={type.id} value={type.id} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <type.icon className="h-5 w-5" />
                      <h3 className="text-xl font-semibold">{type.name}</h3>
                      <Badge className={type.color}>
                        {type.description}
                      </Badge>
                    </div>
                    <Button 
                      onClick={() => handleAnalyze(type.id)}
                      disabled={loading === type.id}
                      className="bg-primary hover:bg-primary/90"
                    >
                      {loading === type.id ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Brain className="h-4 w-4 mr-2" />
                          {analysisResults[type.id] ? 'Re-analyze' : 'Analyze'}
                        </>
                      )}
                    </Button>
                  </div>

                  {analysisResults[type.id] ? (
                    <Card>
                      <CardContent className="p-6 space-y-4">
                        <div className="prose max-w-none">
                          <p className="text-base leading-relaxed">
                            {analysisResults[type.id]!.content}
                          </p>
                        </div>

                        <div>
                          <h4 className="font-semibold mb-3 flex items-center gap-2">
                            <Star className="h-4 w-4" />
                            Key Points
                          </h4>
                          <ul className="space-y-2">
                            {analysisResults[type.id]!.keyPoints.map((point, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                                <span className="text-sm">{point}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {analysisResults[type.id]!.references && (
                          <div>
                            <h4 className="font-semibold mb-3 flex items-center gap-2">
                              <BookOpen className="h-4 w-4" />
                              References
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {analysisResults[type.id]!.references!.map((ref, index) => (
                                <Badge key={index} variant="outline">
                                  {ref}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between text-sm text-muted-foreground border-t pt-4">
                          <span>Generated by AI Analysis</span>
                          <span>{new Date(analysisResults[type.id]!.timestamp).toLocaleString()}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card className="border-dashed border-2">
                      <CardContent className="p-12 text-center">
                        <type.icon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <h4 className="text-lg font-medium mb-2">No Analysis Yet</h4>
                        <p className="text-muted-foreground mb-4">
                          Click "Analyze" to generate {type.name.toLowerCase()} for this verse
                        </p>
                        <Button 
                          onClick={() => handleAnalyze(type.id)}
                          disabled={loading === type.id}
                          variant="outline"
                        >
                          {loading === type.id ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Analyzing...
                            </>
                          ) : (
                            <>
                              <Brain className="h-4 w-4 mr-2" />
                              Start Analysis
                            </>
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
              ))}
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 