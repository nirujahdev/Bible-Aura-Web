// Progress Tracker - Shows completion stats

import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Trophy, Flame, CheckCircle2, Target } from 'lucide-react';
import { motion } from 'framer-motion';

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
    <Card className="p-6 rounded-2xl backdrop-blur-xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 border border-orange-300/30 shadow-xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Trophy className="h-5 w-5 text-orange-400" />
            Your Progress
          </h3>
          {streak > 0 && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/30 border border-orange-400/50">
              <Flame className="h-4 w-4 text-orange-400" />
              <span className="text-sm font-medium text-orange-200">{streak} day streak!</span>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-300">Completion</span>
            <span className="font-bold text-orange-400">{percentage}%</span>
          </div>
          
          <div className="relative">
            <Progress 
              value={percentage} 
              className="h-4 bg-white/10 rounded-full overflow-hidden"
            />
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="absolute top-0 left-0 h-4 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full shadow-lg shadow-orange-500/50"
            />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* Completed Days */}
          <div className="bg-white/10 rounded-xl p-4 border border-white/20">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="h-4 w-4 text-green-400" />
              <div className="text-xs text-gray-400">Completed</div>
            </div>
            <div className="text-2xl font-bold text-white">{completedCount}</div>
            <div className="text-xs text-gray-400 mt-1">days done</div>
          </div>

          {/* Remaining Days */}
          <div className="bg-white/10 rounded-xl p-4 border border-white/20">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-orange-400" />
              <div className="text-xs text-gray-400">Remaining</div>
            </div>
            <div className="text-2xl font-bold text-white">{totalDays - completedCount}</div>
            <div className="text-xs text-gray-400 mt-1">days left</div>
          </div>
        </div>

        {/* Completion Text */}
        <div className="pt-4 border-t border-white/10">
          <div className="text-sm text-center text-gray-300">
            {completedCount === totalDays ? (
              <span className="text-green-400 font-semibold">🎉 Plan completed! Excellent work!</span>
            ) : (
              <span>
                <span className="font-semibold text-orange-400">{completedCount}</span>
                {' '}of{' '}
                <span className="font-semibold text-white">{totalDays}</span>
                {' '}days completed
              </span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

