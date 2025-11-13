// Progress Tracker - Compact and clean design

import { Card } from '@/components/ui/card';
import { CheckCircle2, Target, Flame } from 'lucide-react';

interface ProgressTrackerProps {
  completedCount: number;
  totalDays: number;
  streak: number;
}

export default function ProgressTracker({ 
  completedCount, 
  totalDays,
  streak 
}: ProgressTrackerProps) {
  const percentage = totalDays > 0 ? Math.round((completedCount / totalDays) * 100) : 0;

  return (
    <Card className="p-4 rounded-xl bg-white border border-orange-200/40 shadow-sm">
      <div className="space-y-3">
        {/* Header with Stats */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-gray-700">Your Progress</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {completedCount} of {totalDays} days completed
            </p>
          </div>
          
          {/* Percentage Badge */}
          <div className="flex items-center gap-2">
            {streak > 0 && (
              <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-orange-100 border border-orange-200">
                <Flame className="h-3 w-3 text-orange-500" />
                <span className="text-xs font-semibold text-orange-700">{streak}</span>
              </div>
            )}
            <div className="px-3 py-1 rounded-lg bg-orange-500 text-white text-sm font-bold">
              {percentage}%
            </div>
          </div>
        </div>

        {/* Compact Progress Bar */}
        <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-orange-500 to-orange-600 rounded-full transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Compact Stats */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span className="text-sm font-semibold text-gray-700">{completedCount}</span>
            </div>
            <span className="text-xs text-gray-500">done</span>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Target className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-semibold text-gray-700">{totalDays - completedCount}</span>
            </div>
            <span className="text-xs text-gray-500">remaining</span>
          </div>
        </div>
      </div>
    </Card>
  );
}

