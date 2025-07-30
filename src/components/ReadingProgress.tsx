import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Calendar, CheckCircle, Book, Target, Clock, Sparkles, BookOpen } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ReadingPlan {
  id: string;
  name: string;
  description: string;
  duration_days: number;
  plan_data: unknown;
}

interface UserProgress {
  id: string;
  plan_id: string;
  current_day: number;
  completed_days: number[];
  started_at: string;
  last_read_at?: string;
  completed_at?: string;
}

interface DailyReading {
  day: number;
  date: Date;
  readings: Array<{ book: string; chapters: string }>;
}

const ReadingProgress = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentPlan, setCurrentPlan] = useState<ReadingPlan | null>(null);
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [todaysReading, setTodaysReading] = useState<DailyReading | null>(null);
  const [weekReadings, setWeekReadings] = useState<DailyReading[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadUserProgress();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadUserProgress = async () => {
    if (!user) return;

    try {
      // Get user's current reading progress
      const { data: progressData, error: progressError } = await supabase
        .from('reading_progress')
        .select(`
          *,
          reading_plans (*)
        `)
        .eq('user_id', user.id)
        .is('completed_at', null)
        .order('started_at', { ascending: false })
        .limit(1);

      if (progressError) throw progressError;

      if (progressData && progressData.length > 0) {
        const progress = progressData[0];
        setUserProgress(progress);
        setCurrentPlan(progress.reading_plans);

                 // Calculate today's reading and upcoming week
         if (progress.reading_plans.plan_data) {
           const planData = progress.reading_plans.plan_data as unknown as DailyReading[];
          const today = new Date();
          const startDate = new Date(progress.started_at);
          const daysSinceStart = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
          
          // Find today's reading
          const todayReading = planData.find(reading => reading.day === daysSinceStart);
          setTodaysReading(todayReading || null);

          // Get this week's readings (next 7 days from current day)
          const weekReadings = planData
            .filter(reading => reading.day >= daysSinceStart && reading.day < daysSinceStart + 7)
            .slice(0, 7);
          setWeekReadings(weekReadings);
        }
      }
    } catch (error) {
      console.error('Error loading user progress:', error);
      toast({
        title: "Error",
        description: "Failed to load reading progress",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const markDayCompleted = async (day: number) => {
    if (!userProgress || !user) return;

    try {
      const updatedCompletedDays = [...(userProgress.completed_days || []), day];
      const isCurrentDay = day === userProgress.current_day;

      const updateData: Record<string, unknown> = {
        completed_days: updatedCompletedDays,
        last_read_at: new Date().toISOString()
      };

      // If completing current day, advance to next day
      if (isCurrentDay) {
        updateData.current_day = day + 1;
      }

      // Check if plan is completed
      if (updatedCompletedDays.length === currentPlan?.duration_days) {
        updateData.completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('reading_progress')
        .update(updateData)
        .eq('id', userProgress.id);

      if (error) throw error;

      // Update local state
      setUserProgress({
        ...userProgress,
        ...updateData
      });

      toast({
        title: "Great job!",
        description: `Day ${day} reading completed!`,
      });

      // Reload progress to get updated data
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

  const markDayIncomplete = async (day: number) => {
    if (!userProgress || !user) return;

    try {
      const updatedCompletedDays = (userProgress.completed_days || []).filter(d => d !== day);

      const { error } = await supabase
        .from('reading_progress')
        .update({
          completed_days: updatedCompletedDays,
          completed_at: null // Remove completion if unchecking
        })
        .eq('id', userProgress.id);

      if (error) throw error;

      setUserProgress({
        ...userProgress,
        completed_days: updatedCompletedDays,
        completed_at: null
      });

      toast({
        title: "Updated",
        description: `Day ${day} marked as incomplete`,
      });

    } catch (error) {
      console.error('Error updating progress:', error);
      toast({
        title: "Error",
        description: "Failed to update reading progress",
        variant: "destructive"
      });
    }
  };

  const getDayStatus = (day: number) => {
    if (!userProgress) return 'upcoming';
    
    const completedDays = userProgress.completed_days || [];
    if (completedDays.includes(day)) return 'completed';
    if (day < userProgress.current_day) return 'missed';
    if (day === userProgress.current_day) return 'current';
    return 'upcoming';
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Clock className="h-5 w-5 animate-spin mr-2" />
            Loading reading plan...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!user) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Reading Plan Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center py-6">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Sign in to track your reading progress</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!currentPlan || !userProgress) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Reading Plan Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center py-6">
            <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">No active reading plan</p>
            <p className="text-sm text-muted-foreground">Create a reading plan to get started!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const completedDays = userProgress.completed_days?.length || 0;
  const totalDays = currentPlan.duration_days;
  const progressPercentage = Math.round((completedDays / totalDays) * 100);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Reading Plan Progress
          <Sparkles className="h-4 w-4 text-primary" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Plan Overview */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium">{currentPlan.name}</span>
                         <Badge>
               {completedDays}/{totalDays} days
             </Badge>
          </div>
          <Progress value={progressPercentage} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>{progressPercentage}% complete</span>
            <span>{totalDays - completedDays} days remaining</span>
          </div>
        </div>

        {/* Today's Reading */}
        {todaysReading && (
          <div className="bg-accent rounded-lg p-4 border-l-4 border-primary">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-medium">Today's Reading - Day {todaysReading.day}</h4>
                  <Badge variant={getDayStatus(todaysReading.day) === 'completed' ? 'default' : 'secondary'}>
                    {getDayStatus(todaysReading.day) === 'completed' ? 'Completed' : 'Pending'}
                  </Badge>
                </div>
                <div className="space-y-1">
                  {todaysReading.readings.map((reading, index) => (
                    <p key={index} className="text-sm">
                      <span className="font-medium">{reading.book}</span> {reading.chapters}
                    </p>
                  ))}
                </div>
              </div>
              <Checkbox
                checked={getDayStatus(todaysReading.day) === 'completed'}
                onCheckedChange={(checked) => {
                  if (checked) {
                    markDayCompleted(todaysReading.day);
                  } else {
                    markDayIncomplete(todaysReading.day);
                  }
                }}
                className="mt-1"
              />
            </div>
          </div>
        )}

        {/* This Week's Readings */}
        {weekReadings.length > 0 && (
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Book className="h-4 w-4" />
              This Week's Readings
            </h4>
            <div className="space-y-2">
              {weekReadings.map((reading) => {
                const status = getDayStatus(reading.day);
                const isCompleted = status === 'completed';
                const isCurrent = status === 'current';
                const isMissed = status === 'missed';
                
                return (
                  <div
                    key={reading.day}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      isCurrent ? 'bg-primary/5 border-primary' :
                      isCompleted ? 'bg-green-50 border-green-200' :
                      isMissed ? 'bg-red-50 border-red-200' :
                      'bg-background border-border'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={isCompleted}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            markDayCompleted(reading.day);
                          } else {
                            markDayIncomplete(reading.day);
                          }
                        }}
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">Day {reading.day}</span>
                          {isCurrent && <Badge className="text-xs">Today</Badge>}
                          {isMissed && <Badge variant="destructive" className="text-xs">Missed</Badge>}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {reading.readings.map((r, i) => (
                            <span key={i}>
                              {r.book} {r.chapters}
                              {i < reading.readings.length - 1 ? ', ' : ''}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    {reading.day === userProgress.current_day && (
                      <Button
                        variant="divine"
                        size="sm"
                        onClick={() => markDayCompleted(reading.day)}
                        disabled={isCompleted}
                      >
                        <CheckCircle className="h-4 w-4" />
                        {isCompleted ? 'Done' : 'Mark Complete'}
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Plan completion celebration */}
        {userProgress.completed_at && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
            <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="font-medium text-green-800">Congratulations!</p>
            <p className="text-sm text-green-600">You've completed your reading plan!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ReadingProgress;