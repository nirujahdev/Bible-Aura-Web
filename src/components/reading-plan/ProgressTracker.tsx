// Progress Tracker - Interactive and visually appealing

import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { CheckCircle2, Target, Flame, TrendingUp } from 'lucide-react';

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
  const remaining = totalDays - completedCount;

  return (
    <Card className="p-3.5 md:p-4 rounded-xl md:rounded-xl bg-gradient-to-br from-white to-orange-50/30 border border-orange-200/60 shadow-md hover:shadow-lg transition-shadow">
      <div className="space-y-3 md:space-y-3">
        {/* Header with Stats - Mobile Optimized */}
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm md:text-base font-bold text-gray-800 flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4 md:h-4 md:w-4 text-orange-500 flex-shrink-0" />
              <span>Your Progress</span>
            </h3>
            <p className="text-[11px] md:text-xs text-gray-600 mt-1">
              {completedCount} of {totalDays} days completed
            </p>
          </div>
          
          {/* Badges */}
          <div className="flex items-center gap-1.5 md:gap-2">
            {streak > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-gradient-to-r from-orange-100 to-orange-200 border border-orange-300 shadow-sm"
              >
                <Flame className="h-3 w-3 md:h-3.5 md:w-3.5 text-orange-600" />
                <span className="text-xs md:text-sm font-bold text-orange-700">{streak}</span>
              </motion.div>
            )}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="px-2.5 md:px-3 py-1 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs md:text-sm font-bold shadow-md shadow-orange-500/30"
            >
              {percentage}%
            </motion.div>
          </div>
        </div>

        {/* Animated Progress Bar */}
        <div className="relative h-2.5 md:h-3 bg-gray-200 rounded-full overflow-hidden shadow-inner">
          <motion.div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-orange-500 via-orange-500 to-orange-600 rounded-full shadow-sm"
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />
          </motion.div>
        </div>

        {/* Compact Stats - Mobile Optimized */}
        <div className="flex items-center justify-between pt-2.5 md:pt-2 border-t border-gray-200/60">
          <motion.div
            className="flex items-center gap-2 md:gap-2 flex-1"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 md:h-4 md:w-4 text-green-500 flex-shrink-0" />
              <span className="text-base md:text-base font-bold text-gray-800">{completedCount}</span>
            </div>
            <span className="text-[11px] md:text-xs text-gray-600 ml-1">completed</span>
          </motion.div>
          
          <motion.div
            className="flex items-center gap-2 md:gap-2 flex-1 justify-end"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="flex items-center gap-1.5">
              <Target className="h-4 w-4 md:h-4 md:w-4 text-orange-500 flex-shrink-0" />
              <span className="text-base md:text-base font-bold text-gray-800">{remaining}</span>
            </div>
            <span className="text-[11px] md:text-xs text-gray-600 ml-1">remaining</span>
          </motion.div>
        </div>
      </div>
    </Card>
  );
}

