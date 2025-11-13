// Reading Plan Display - Optimized side-by-side layout

import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';
import { ReadingPlan } from '@/lib/storage';
import DailyPlanCard from './DailyPlanCard';
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
  return (
    <div className="space-y-4">
      {/* Progress Tracker */}
      <ProgressTracker
        completedCount={stats.completed}
        totalDays={stats.total}
        streak={stats.streak}
      />

      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <span className="text-orange-500">✦</span>
            {plan.preferences.scope}
          </h2>
          <p className="text-xs text-gray-600 mt-0.5">
            {plan.preferences.duration} days • {plan.preferences.daysPerWeek} days/week
          </p>
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="bg-white hover:bg-red-50 border-gray-200 hover:border-red-300 text-gray-700 hover:text-red-600"
            >
              <RotateCcw className="h-3 w-3 mr-1.5" />
              Reset
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-white border border-gray-200">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-gray-900">Reset Reading Plan?</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-600">
                This will delete your current plan and all progress. You'll need to create a new plan from scratch.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50">
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

      {/* Two Column Layout: Daily List + Calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: Daily Reading List */}
        <div className="space-y-3 max-h-[calc(100vh-320px)] overflow-y-auto pr-2">
          {plan.days.map((day) => (
            <DailyPlanCard
              key={day.day}
              day={day}
              onToggle={() => onToggle(day.day)}
            />
          ))}
        </div>

        {/* Right: Calendar View - Sticky on larger screens */}
        <div className="lg:sticky lg:top-4 lg:self-start">
          <CalendarView plan={plan} onToggle={onToggle} />
        </div>
      </div>
    </div>
  );
}
