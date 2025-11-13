// Reading Plan Display - Main display with tabs

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar, LayoutList, List, RotateCcw } from 'lucide-react';
import { ReadingPlan } from '@/lib/storage';
import DailyPlanCard from './DailyPlanCard';
import WeeklyPlanView from './WeeklyPlanView';
import CalendarView from './CalendarView';
import ProgressTracker from './ProgressTracker';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface ReadingPlanDisplayProps {
  plan: ReadingPlan;
  onToggle: (day: number) => void;
  onReset: () => void;
  stats: {
    completed: number;
    total: number;
    percentage: number;
    streak: number;
  };
}

export default function ReadingPlanDisplay({ 
  plan, 
  onToggle, 
  onReset,
  stats 
}: ReadingPlanDisplayProps) {
  const [activeTab, setActiveTab] = useState('daily');

  return (
    <div className="space-y-6">
      {/* Progress Tracker */}
      <ProgressTracker
        completedCount={stats.completed}
        totalDays={stats.total}
        streak={stats.streak}
      />

      {/* Action Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <span className="text-orange-400">✦</span>
            Your Reading Plan
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            {plan.preferences.scope} • {plan.preferences.duration} days • {plan.preferences.daysPerWeek} days/week
          </p>
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              className="backdrop-blur-xl bg-white/5 hover:bg-red-500/20 border-white/20 hover:border-red-400/40 text-gray-300 hover:text-red-400"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset Plan
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="backdrop-blur-xl bg-gray-900/95 border border-white/20">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white">Reset Reading Plan?</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-400">
                This will delete your current plan and all progress. You'll need to create a new plan from scratch.
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-white/10 hover:bg-white/20 border-white/20 text-white">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={onReset}
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                Reset Plan
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="sticky top-0 z-10 bg-gradient-to-br from-orange-50/10 to-amber-50/10 backdrop-blur-xl rounded-xl p-1 border border-white/10">
          <TabsList className="grid w-full grid-cols-3 bg-transparent">
            <TabsTrigger
              value="daily"
              className="data-[state=active]:bg-orange-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-orange-500/50"
            >
              <List className="h-4 w-4 mr-2" />
              Daily
            </TabsTrigger>
            <TabsTrigger
              value="weekly"
              className="data-[state=active]:bg-orange-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-orange-500/50"
            >
              <LayoutList className="h-4 w-4 mr-2" />
              Weekly
            </TabsTrigger>
            <TabsTrigger
              value="calendar"
              className="data-[state=active]:bg-orange-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-orange-500/50"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Calendar
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="mt-6">
          <TabsContent value="daily" className="mt-0">
            <ScrollArea className="h-[calc(100vh-500px)] pr-4">
              <div className="space-y-4">
                {plan.days.map((day) => (
                  <DailyPlanCard
                    key={day.day}
                    day={day}
                    onToggle={() => onToggle(day.day)}
                  />
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="weekly" className="mt-0">
            <ScrollArea className="h-[calc(100vh-500px)] pr-4">
              <WeeklyPlanView
                plan={plan.days}
                onToggle={onToggle}
              />
            </ScrollArea>
          </TabsContent>

          <TabsContent value="calendar" className="mt-0">
            <ScrollArea className="h-[calc(100vh-500px)] pr-4">
              <CalendarView
                plan={plan.days}
                onToggle={onToggle}
              />
            </ScrollArea>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

