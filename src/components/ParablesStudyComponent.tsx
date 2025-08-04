import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Parable, ParableStudy } from '@/integrations/supabase/types';
import { 
  BookOpen, Users, Clock, Star, MessageSquare, 
  Heart, Lightbulb, PenTool, CheckCircle, 
  Play, Pause, RotateCcw, Share2, Bookmark,
  ArrowRight, ChevronDown, ChevronRight
} from 'lucide-react';

interface ParablesStudyComponentProps {
  selectedParableId?: string;
  onParableSelect?: (parable: Parable) => void;
}

const ParablesStudyComponent: React.FC<ParablesStudyComponentProps> = ({
  selectedParableId,
  onParableSelect
}) => {
  const { user } = useAuth();
  const { toast } = useToast();

  // State
  const [parables, setParables] = useState<Parable[]>([]);
  const [selectedParable, setSelectedParable] = useState<Parable | null>(null);
  const [userStudy, setUserStudy] = useState<ParableStudy | null>(null);
  const [loading, setLoading] = useState(false);
  const [studyNotes, setStudyNotes] = useState('');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['overview']));
  const [studyTimer, setStudyTimer] = useState(0);
  const [isStudying, setIsStudying] = useState(false);

  useEffect(() => {
    loadParables();
  }, []);

  useEffect(() => {
    if (selectedParableId) {
      const parable = parables.find(p => p.id === selectedParableId);
      if (parable) {
        selectParable(parable);
      }
    }
  }, [selectedParableId, parables]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isStudying) {
      interval = setInterval(() => {
        setStudyTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isStudying]);

  const loadParables = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('parables')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setParables(data || []);

      // Auto-select first parable if none selected
      if (data && data.length > 0 && !selectedParable) {
        selectParable(data[0]);
      }
    } catch (error) {
      console.error('Error loading parables:', error);
      toast({
        title: "Error",
        description: "Failed to load parable studies",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const selectParable = async (parable: Parable) => {
    setSelectedParable(parable);
    setExpandedSections(new Set(['overview']));
    
    if (onParableSelect) {
      onParableSelect(parable);
    }

    if (user) {
      await loadUserStudy(parable.id);
    }
  };

  const loadUserStudy = async (parableId: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('parable_studies')
        .select('*')
        .eq('user_id', user.id)
        .eq('parable_id', parableId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setUserStudy(data);
        setStudyNotes(data.personal_notes || '');
      } else {
        // Create new study record
        const newStudy = {
          user_id: user.id,
          parable_id: parableId,
          status: 'not_started' as const,
          progress: 0
        };

        const { data: created, error: createError } = await supabase
          .from('parable_studies')
          .insert([newStudy])
          .select()
          .single();

        if (createError) throw createError;
        setUserStudy(created);
        setStudyNotes('');
      }
    } catch (error) {
      console.error('Error loading user study:', error);
    }
  };

  const updateStudyProgress = async (progress: number, status?: string) => {
    if (!user || !userStudy) return;

    try {
      const updates: any = { 
        progress,
        time_spent: (userStudy.time_spent || 0) + Math.floor(studyTimer / 60)
      };
      
      if (status) {
        updates.status = status;
      }

      const { error } = await supabase
        .from('parable_studies')
        .update(updates)
        .eq('id', userStudy.id);

      if (error) throw error;

      setUserStudy(prev => prev ? { ...prev, ...updates } : null);
      setStudyTimer(0);

      if (status === 'completed') {
        toast({
          title: "Study Completed!",
          description: "You've finished studying this parable",
        });
      }
    } catch (error) {
      console.error('Error updating study progress:', error);
    }
  };

  const saveNotes = async () => {
    if (!user || !userStudy) return;

    try {
      const { error } = await supabase
        .from('parable_studies')
        .update({ personal_notes: studyNotes })
        .eq('id', userStudy.id);

      if (error) throw error;

      setUserStudy(prev => prev ? { ...prev, personal_notes: studyNotes } : null);
      
      toast({
        title: "Notes Saved",
        description: "Your study notes have been saved",
      });
    } catch (error) {
      console.error('Error saving notes:', error);
      toast({
        title: "Error",
        description: "Failed to save notes",
        variant: "destructive"
      });
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  const startStudy = () => {
    setIsStudying(true);
    if (userStudy?.status === 'not_started') {
      updateStudyProgress(10, 'in_progress');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-500';
      case 'intermediate': return 'bg-yellow-500';
      case 'advanced': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading parable studies...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex">
      {/* Sidebar - Parable List */}
      <div className="w-80 border-r bg-gray-50 overflow-y-auto">
        <div className="p-4">
          <h3 className="font-semibold text-gray-800 mb-4">Parable Studies</h3>
          <div className="space-y-3">
            {parables.map(parable => (
              <Card 
                key={parable.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedParable?.id === parable.id ? 'ring-2 ring-orange-500 bg-orange-50' : ''
                }`}
                onClick={() => selectParable(parable)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-gray-800 text-sm">{parable.title}</h4>
                    <Badge 
                      variant="outline" 
                      className={`text-xs text-white ${getDifficultyColor(parable.difficulty_level)}`}
                    >
                      {parable.difficulty_level}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">{parable.theme}</p>
                  <p className="text-xs text-blue-600 mb-3">{parable.scripture_reference}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{parable.study_duration} min</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      <span>{parable.target_audience}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {selectedParable ? (
          <div className="p-6">
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">{selectedParable.title}</h1>
                  <p className="text-gray-600">Theme: {selectedParable.theme}</p>
                  <p className="text-blue-600 font-medium">{selectedParable.scripture_reference}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={getDifficultyColor(selectedParable.difficulty_level) + ' text-white'}>
                      {selectedParable.difficulty_level}
                    </Badge>
                    <Badge variant="outline">{selectedParable.target_audience}</Badge>
                  </div>
                  <div className="text-sm text-gray-500">
                    Estimated time: {selectedParable.study_duration} minutes
                  </div>
                </div>
              </div>

              {/* Study Progress */}
              {user && userStudy && (
                <Card className="mb-4">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="font-medium">Study Progress</p>
                          <p className="text-sm text-gray-600">Status: {userStudy.status.replace('_', ' ')}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right mr-4">
                          <p className="text-sm font-medium">Timer: {formatTime(studyTimer)}</p>
                        </div>
                        <Button
                          size="sm"
                          variant={isStudying ? "destructive" : "default"}
                          onClick={() => setIsStudying(!isStudying)}
                        >
                          {isStudying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    <Progress value={userStudy.progress} className="mb-2" />
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>{userStudy.progress}% Complete</span>
                      <span>Time spent: {Math.floor((userStudy.time_spent || 0))} minutes</span>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Study Actions */}
              <div className="flex items-center gap-3 mb-6">
                <Button 
                  onClick={startStudy}
                  className="bg-orange-500 hover:bg-orange-600"
                  disabled={!user}
                >
                  <Play className="h-4 w-4 mr-2" />
                  {userStudy?.status === 'not_started' ? 'Start Study' : 'Continue Study'}
                </Button>
                <Button variant="outline" disabled={!user}>
                  <Bookmark className="h-4 w-4 mr-2" />
                  Bookmark
                </Button>
                <Button variant="outline">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>

            {/* Study Content */}
            <Tabs defaultValue="study" className="space-y-6">
              <TabsList>
                <TabsTrigger value="study">Study</TabsTrigger>
                <TabsTrigger value="notes">My Notes</TabsTrigger>
                <TabsTrigger value="discussion">Discussion</TabsTrigger>
              </TabsList>

              <TabsContent value="study" className="space-y-6">
                {/* Story Breakdown */}
                <Card>
                  <CardHeader>
                    <CardTitle 
                      className="flex items-center justify-between cursor-pointer"
                      onClick={() => toggleSection('story')}
                    >
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-orange-500" />
                        Story Breakdown
                      </div>
                      {expandedSections.has('story') ? 
                        <ChevronDown className="h-4 w-4" /> : 
                        <ChevronRight className="h-4 w-4" />
                      }
                    </CardTitle>
                  </CardHeader>
                  {expandedSections.has('story') && (
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">Setting</h4>
                        <p className="text-gray-700">{selectedParable.story_breakdown.setting}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Conflict</h4>
                        <p className="text-gray-700">{selectedParable.story_breakdown.conflict}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Characters</h4>
                        <div className="space-y-2">
                          {selectedParable.story_breakdown.characters.map((character, index) => (
                            <div key={index} className="border-l-4 border-orange-200 pl-4">
                              <h5 className="font-medium">{character.role}</h5>
                              <p className="text-sm text-gray-600">{character.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                      {selectedParable.story_breakdown.compassion_in_action && (
                        <div>
                          <h4 className="font-semibold mb-2">Compassion in Action</h4>
                          <ul className="list-disc list-inside space-y-1 text-gray-700">
                            {selectedParable.story_breakdown.compassion_in_action.map((action, index) => (
                              <li key={index}>{action}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  )}
                </Card>

                {/* Historical Context */}
                <Card>
                  <CardHeader>
                    <CardTitle 
                      className="flex items-center justify-between cursor-pointer"
                      onClick={() => toggleSection('historical')}
                    >
                      <div className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-orange-500" />
                        Historical & Cultural Context
                      </div>
                      {expandedSections.has('historical') ? 
                        <ChevronDown className="h-4 w-4" /> : 
                        <ChevronRight className="h-4 w-4" />
                      }
                    </CardTitle>
                  </CardHeader>
                  {expandedSections.has('historical') && (
                    <CardContent className="space-y-4">
                      {Object.entries(selectedParable.historical_context).map(([key, value]) => (
                        <div key={key}>
                          <h4 className="font-semibold mb-2 capitalize">{key.replace(/_/g, ' ')}</h4>
                          <p className="text-gray-700">{value}</p>
                        </div>
                      ))}
                    </CardContent>
                  )}
                </Card>

                {/* Theological Insights */}
                <Card>
                  <CardHeader>
                    <CardTitle 
                      className="flex items-center justify-between cursor-pointer"
                      onClick={() => toggleSection('theological')}
                    >
                      <div className="flex items-center gap-2">
                        <Lightbulb className="h-5 w-5 text-orange-500" />
                        Theological Insights
                      </div>
                      {expandedSections.has('theological') ? 
                        <ChevronDown className="h-4 w-4" /> : 
                        <ChevronRight className="h-4 w-4" />
                      }
                    </CardTitle>
                  </CardHeader>
                  {expandedSections.has('theological') && (
                    <CardContent className="space-y-4">
                      {Object.entries(selectedParable.theological_insights).map(([key, value]) => (
                        <div key={key}>
                          <h4 className="font-semibold mb-2 capitalize">{key.replace(/_/g, ' ')}</h4>
                          <p className="text-gray-700">{value}</p>
                        </div>
                      ))}
                    </CardContent>
                  )}
                </Card>

                {/* Spiritual Lessons */}
                <Card>
                  <CardHeader>
                    <CardTitle 
                      className="flex items-center justify-between cursor-pointer"
                      onClick={() => toggleSection('spiritual')}
                    >
                      <div className="flex items-center gap-2">
                        <Heart className="h-5 w-5 text-orange-500" />
                        Spiritual Lessons
                      </div>
                      {expandedSections.has('spiritual') ? 
                        <ChevronDown className="h-4 w-4" /> : 
                        <ChevronRight className="h-4 w-4" />
                      }
                    </CardTitle>
                  </CardHeader>
                  {expandedSections.has('spiritual') && (
                    <CardContent className="space-y-4">
                      {Object.entries(selectedParable.spiritual_lessons).map(([key, value]) => (
                        <div key={key}>
                          <h4 className="font-semibold mb-2 capitalize">{key.replace(/_/g, ' ')}</h4>
                          <p className="text-gray-700">{value}</p>
                        </div>
                      ))}
                    </CardContent>
                  )}
                </Card>

                {/* Modern Applications */}
                <Card>
                  <CardHeader>
                    <CardTitle 
                      className="flex items-center justify-between cursor-pointer"
                      onClick={() => toggleSection('applications')}
                    >
                      <div className="flex items-center gap-2">
                        <ArrowRight className="h-5 w-5 text-orange-500" />
                        Modern Applications
                      </div>
                      {expandedSections.has('applications') ? 
                        <ChevronDown className="h-4 w-4" /> : 
                        <ChevronRight className="h-4 w-4" />
                      }
                    </CardTitle>
                  </CardHeader>
                  {expandedSections.has('applications') && (
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">Practical Steps</h4>
                        <ul className="list-disc list-inside space-y-1 text-gray-700">
                          {selectedParable.modern_applications.practical_steps.map((step, index) => (
                            <li key={index}>{step}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Modern Contexts</h4>
                        <ul className="list-disc list-inside space-y-1 text-gray-700">
                          {selectedParable.modern_applications.modern_contexts.map((context, index) => (
                            <li key={index}>{context}</li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  )}
                </Card>

                {/* Reflective Questions */}
                <Card>
                  <CardHeader>
                    <CardTitle 
                      className="flex items-center justify-between cursor-pointer"
                      onClick={() => toggleSection('questions')}
                    >
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-orange-500" />
                        Reflective Questions
                      </div>
                      {expandedSections.has('questions') ? 
                        <ChevronDown className="h-4 w-4" /> : 
                        <ChevronRight className="h-4 w-4" />
                      }
                    </CardTitle>
                  </CardHeader>
                  {expandedSections.has('questions') && (
                    <CardContent>
                      <div className="space-y-3">
                        {selectedParable.reflective_questions.map((question, index) => (
                          <div key={index} className="p-3 bg-orange-50 rounded-lg">
                            <p className="text-gray-800">{index + 1}. {question}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  )}
                </Card>

                {/* Cross References */}
                <Card>
                  <CardHeader>
                    <CardTitle 
                      className="flex items-center justify-between cursor-pointer"
                      onClick={() => toggleSection('references')}
                    >
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-orange-500" />
                        Cross References
                      </div>
                      {expandedSections.has('references') ? 
                        <ChevronDown className="h-4 w-4" /> : 
                        <ChevronRight className="h-4 w-4" />
                      }
                    </CardTitle>
                  </CardHeader>
                  {expandedSections.has('references') && (
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {selectedParable.cross_references.map((reference, index) => (
                          <div key={index} className="p-3 border rounded-lg bg-blue-50">
                            <p className="text-blue-800 font-medium">{reference}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  )}
                </Card>

                {/* Complete Study Button */}
                {user && userStudy && userStudy.status !== 'completed' && (
                  <div className="text-center py-6">
                    <Button 
                      onClick={() => updateStudyProgress(100, 'completed')}
                      className="bg-green-500 hover:bg-green-600"
                      size="lg"
                    >
                      <CheckCircle className="h-5 w-5 mr-2" />
                      Mark as Completed
                    </Button>
                  </div>
                )}
              </TabsContent>

              {/* Notes Tab */}
              <TabsContent value="notes" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PenTool className="h-5 w-5 text-orange-500" />
                      Personal Study Notes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      placeholder="Write your personal insights, questions, and reflections here..."
                      value={studyNotes}
                      onChange={(e) => setStudyNotes(e.target.value)}
                      className="min-h-[300px] mb-4"
                    />
                    <Button onClick={saveNotes} disabled={!user}>
                      <PenTool className="h-4 w-4 mr-2" />
                      Save Notes
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Discussion Tab */}
              <TabsContent value="discussion" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-orange-500" />
                      Community Discussion
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-800 mb-2">Coming Soon</h3>
                      <p className="text-gray-600">
                        Community discussions will be available in a future update
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-800 mb-2">Select a Parable Study</h3>
              <p className="text-gray-600">Choose a parable from the sidebar to begin studying</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ParablesStudyComponent; 