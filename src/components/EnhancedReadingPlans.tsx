import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { 
  Calendar, BookOpen, Target, Clock, Play, Pause, Check, 
  ChevronRight, Star, Heart, Award, X, AlertTriangle 
} from 'lucide-react';

interface ReadingPlan {
  id: string;
  name: string;
  description: string;
  duration_days: number;
  plan_data: DailyReading[];
}

interface DailyReading {
  day: number;
  date?: string;
  readings: Array<{ book: string; chapters: string; verses?: string[] }>;
}

interface UserProgress {
  id: string;
  plan_id: string;
  current_day: number;
  completed_days: number[];
  started_at: string;
  last_read_at?: string;
  completed_at?: string;
  reading_plans: ReadingPlan;
}

interface EnhancedReadingPlansProps {
  onNavigateToVerse?: (book: string, chapter: number) => void;
}

const motivationalVerses = [
  {
    text: "Your word is a lamp for my feet, a light on my path.",
    reference: "Psalm 119:105"
  },
  {
    text: "Do not let this Book of the Law depart from your mouth; meditate on it day and night.",
    reference: "Joshua 1:8"
  },
  {
    text: "All Scripture is God-breathed and is useful for teaching, rebuking, correcting and training in righteousness.",
    reference: "2 Timothy 3:16"
  },
  {
    text: "The word of God is alive and active. Sharper than any double-edged sword.",
    reference: "Hebrews 4:12"
  },
  {
    text: "Man shall not live on bread alone, but on every word that comes from the mouth of God.",
    reference: "Matthew 4:4"
  }
];

const predefinedPlans: ReadingPlan[] = [
  {
    id: 'bible-year',
    name: 'Bible in a Year',
    description: 'Complete the Bible in one year',
    duration_days: 365,
    plan_data: [] // Will be generated
  },
  {
    id: 'new-testament-90',
    name: 'New Testament in 90 Days',
    description: 'Focus on the New Testament',
    duration_days: 90,
    plan_data: []
  },
  {
    id: 'psalms-month',
    name: 'Psalms in a Month',
    description: 'One chapter of Psalms daily',
    duration_days: 31,
    plan_data: []
  },
  {
    id: 'gospels-30',
    name: 'Gospels in 30 Days',
    description: 'Read through the four Gospels',
    duration_days: 30,
    plan_data: []
  }
];

export function EnhancedReadingPlans({ onNavigateToVerse }: EnhancedReadingPlansProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [currentPlan, setCurrentPlan] = useState<UserProgress | null>(null);
  const [availablePlans] = useState<ReadingPlan[]>(predefinedPlans);
  const [loading, setLoading] = useState(true);
  const [todaysReading, setTodaysReading] = useState<DailyReading | null>(null);
  const [weekReadings, setWeekReadings] = useState<DailyReading[]>([]);
  const [showQuitDialog, setShowQuitDialog] = useState(false);
  const [motivationalVerse, setMotivationalVerse] = useState(motivationalVerses[0]);

  useEffect(() => {
    if (user) {
      loadUserProgress();
    }
  }, [user]);

  useEffect(() => {
    if (currentPlan) {
      calculateTodaysReading();
    }
  }, [currentPlan]);

  const loadUserProgress = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data: progressData, error } = await supabase
        .from('reading_progress')
        .select(`
          *,
          reading_plans (*)
        `)
        .eq('user_id', user.id)
        .is('completed_at', null)
        .order('started_at', { ascending: false })
        .limit(1);

      if (error && error.code !== 'PGRST116') throw error;

      if (progressData && progressData.length > 0) {
        setCurrentPlan(progressData[0] as UserProgress);
      }
    } catch (error) {
      console.error('Error loading reading progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTodaysReading = () => {
    if (!currentPlan?.reading_plans?.plan_data) return;

    const today = new Date();
    const startDate = new Date(currentPlan.started_at);
    const daysSinceStart = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    const planData = currentPlan.reading_plans.plan_data as DailyReading[];
    const todayReading = planData.find(reading => reading.day === daysSinceStart);
    setTodaysReading(todayReading || null);

    // Get this week's readings
    const weekReadings = planData
      .filter(reading => reading.day >= daysSinceStart && reading.day < daysSinceStart + 7)
      .slice(0, 7);
    setWeekReadings(weekReadings);
  };

  const startReadingPlan = async (plan: ReadingPlan) => {
    if (!user) return;

    try {
      // Generate plan data if empty
      const planData = generatePlanData(plan);
      
      // Save plan to database if it doesn't exist
      const { data: existingPlan } = await supabase
        .from('reading_plans')
        .select('id')
        .eq('id', plan.id)
        .single();

      if (!existingPlan) {
        await supabase
          .from('reading_plans')
          .insert({
            id: plan.id,
            name: plan.name,
            description: plan.description,
            duration_days: plan.duration_days,
            plan_data: planData
          });
      }

      // Create user progress
      const { data: progressData, error } = await supabase
        .from('reading_progress')
        .insert({
          user_id: user.id,
          plan_id: plan.id,
          current_day: 1,
          completed_days: [],
          started_at: new Date().toISOString()
        })
        .select(`
          *,
          reading_plans (*)
        `)
        .single();

      if (error) throw error;

      setCurrentPlan(progressData as UserProgress);
      toast({
        title: "Reading Plan Started! 🎉",
        description: `You've started the ${plan.name} plan. Happy reading!`,
      });
    } catch (error) {
      console.error('Error starting reading plan:', error);
      toast({
        title: "Error",
        description: "Failed to start reading plan. Please try again.",
        variant: "destructive"
      });
    }
  };

  const markDayCompleted = async (day: number) => {
    if (!currentPlan || !user) return;

    try {
      const updatedCompletedDays = [...(currentPlan.completed_days || []), day];
      const isCurrentDay = day === currentPlan.current_day;

      const updateData: any = {
        completed_days: updatedCompletedDays,
        last_read_at: new Date().toISOString()
      };

      if (isCurrentDay) {
        updateData.current_day = day + 1;
      }

      // Check if plan is completed
      if (updatedCompletedDays.length === currentPlan.reading_plans.duration_days) {
        updateData.completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('reading_progress')
        .update(updateData)
        .eq('id', currentPlan.id);

      if (error) throw error;

      setCurrentPlan({
        ...currentPlan,
        ...updateData
      });

      toast({
        title: "Great job! ⭐",
        description: `Day ${day} reading completed! Keep up the good work!`,
      });

      // Reload to get updated data
      loadUserProgress();
    } catch (error) {
      console.error('Error updating progress:', error);
      toast({
        title: "Error",
        description: "Failed to update reading progress",
        variant: "destructive"
      });
    }
  };

  const handleQuitPlan = () => {
    // Show random motivational verse
    const randomVerse = motivationalVerses[Math.floor(Math.random() * motivationalVerses.length)];
    setMotivationalVerse(randomVerse);
    setShowQuitDialog(true);
  };

  const confirmQuitPlan = async () => {
    if (!currentPlan) return;

    try {
      const { error } = await supabase
        .from('reading_progress')
        .update({ completed_at: new Date().toISOString() })
        .eq('id', currentPlan.id);

      if (error) throw error;

      setCurrentPlan(null);
      setShowQuitDialog(false);
      toast({
        title: "Plan Ended",
        description: "Remember, God's Word is always here when you're ready to return.",
      });
    } catch (error) {
      console.error('Error quitting plan:', error);
      toast({
        title: "Error",
        description: "Failed to quit reading plan",
        variant: "destructive"
      });
    }
  };

  const generatePlanData = (plan: ReadingPlan): DailyReading[] => {
    // This is a simplified version - you can enhance this based on your needs
    const planData: DailyReading[] = [];
    
    switch (plan.id) {
      case 'bible-year':
        // Generate 365 days of Bible readings
        for (let day = 1; day <= 365; day++) {
          planData.push({
            day,
            readings: [
              { book: 'Genesis', chapters: `${Math.ceil(day / 7)}` }, // Simplified
            ]
          });
        }
        break;
      
      case 'psalms-month':
        for (let day = 1; day <= 31; day++) {
          planData.push({
            day,
            readings: [
              { book: 'Psalms', chapters: `${day}` }
            ]
          });
        }
        break;
      
      // Add other plan types...
      default:
        // Generic plan
        for (let day = 1; day <= plan.duration_days; day++) {
          planData.push({
            day,
            readings: [
              { book: 'Psalms', chapters: `${day}` }
            ]
          });
        }
    }
    
    return planData;
  };

  const getProgressPercentage = () => {
    if (!currentPlan) return 0;
    return (currentPlan.completed_days.length / currentPlan.reading_plans.duration_days) * 100;
  };

  const getDaysRemaining = () => {
    if (!currentPlan) return 0;
    return currentPlan.reading_plans.duration_days - currentPlan.completed_days.length;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (!currentPlan) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Choose Your Reading Plan</h2>
          <p className="text-gray-600">Start your journey through God's Word</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {availablePlans.map((plan) => (
            <Card key={plan.id} className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-orange-200">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg text-gray-800">{plan.name}</CardTitle>
                    <Badge variant="outline" className="mt-2">
                      {plan.duration_days} days
                    </Badge>
                  </div>
                  <BookOpen className="h-6 w-6 text-orange-600" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">{plan.description}</p>
                <Button 
                  onClick={() => startReadingPlan(plan)}
                  className="w-full bg-orange-600 hover:bg-orange-700"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Start Plan
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Plan Overview */}
      <Card className="border-l-4 border-l-orange-600">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl text-gray-800">{currentPlan.reading_plans.name}</CardTitle>
              <p className="text-gray-600 mt-1">{currentPlan.reading_plans.description}</p>
            </div>
            <Button 
              variant="outline" 
              onClick={handleQuitPlan}
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              <X className="w-4 h-4 mr-2" />
              Quit Plan
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Progress</span>
                <span className="text-sm text-gray-600">
                  {currentPlan.completed_days.length} of {currentPlan.reading_plans.duration_days} days
                </span>
              </div>
              <Progress value={getProgressPercentage()} className="h-2" />
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-orange-600">{currentPlan.current_day}</div>
                <div className="text-xs text-gray-500">Current Day</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{currentPlan.completed_days.length}</div>
                <div className="text-xs text-gray-500">Completed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">{getDaysRemaining()}</div>
                <div className="text-xs text-gray-500">Remaining</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Today's Reading */}
      {todaysReading && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-orange-600" />
              Today's Reading - Day {todaysReading.day}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {todaysReading.readings.map((reading, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-4 h-4 text-gray-600" />
                    <div>
                      <div className="font-medium text-gray-800">{reading.book}</div>
                      <div className="text-sm text-gray-600">Chapter {reading.chapters}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onNavigateToVerse?.(reading.book, parseInt(reading.chapters))}
                    >
                      Read
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                    {currentPlan.completed_days.includes(todaysReading.day) ? (
                      <Badge variant="default" className="bg-green-600">
                        <Check className="w-3 h-3 mr-1" />
                        Done
                      </Badge>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => markDayCompleted(todaysReading.day)}
                        className="bg-orange-600 hover:bg-orange-700"
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Mark Done
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Week Overview */}
      {weekReadings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-600" />
              This Week's Plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <div className="space-y-2">
                {weekReadings.map((reading) => (
                  <div 
                    key={reading.day}
                    className={`flex items-center justify-between p-2 rounded ${
                      currentPlan.completed_days.includes(reading.day)
                        ? 'bg-green-50 border border-green-200'
                        : reading.day === currentPlan.current_day
                        ? 'bg-orange-50 border border-orange-200'
                        : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                        currentPlan.completed_days.includes(reading.day)
                          ? 'bg-green-600 text-white'
                          : reading.day === currentPlan.current_day
                          ? 'bg-orange-600 text-white'
                          : 'bg-gray-300 text-gray-600'
                      }`}>
                        {reading.day}
                      </div>
                      <div className="text-sm">
                        {reading.readings.map(r => `${r.book} ${r.chapters}`).join(', ')}
                      </div>
                    </div>
                    {currentPlan.completed_days.includes(reading.day) && (
                      <Check className="w-4 h-4 text-green-600" />
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Quit Confirmation Dialog */}
      <Dialog open={showQuitDialog} onOpenChange={setShowQuitDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Don't Give Up!
            </DialogTitle>
            <DialogDescription className="space-y-4">
              <div className="text-center p-4 bg-amber-50 rounded-lg border border-amber-200">
                <Heart className="w-8 h-8 text-red-500 mx-auto mb-2" />
                <blockquote className="text-lg font-medium text-gray-800 mb-2">
                  "{motivationalVerse.text}"
                </blockquote>
                <cite className="text-sm text-gray-600">— {motivationalVerse.reference}</cite>
              </div>
              <p className="text-center text-gray-600">
                God's Word brings life and hope. Consider taking a short break instead of quitting completely.
              </p>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:justify-center">
            <Button
              variant="outline"
              onClick={() => setShowQuitDialog(false)}
              className="flex-1"
            >
              Continue Plan
            </Button>
            <Button
              variant="outline"
              onClick={confirmQuitPlan}
              className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
            >
              End Plan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default EnhancedReadingPlans; 