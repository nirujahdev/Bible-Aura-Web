// Calendar View - Compact interactive grid without scrolling

import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { CheckCircle2, Circle, Sparkles } from 'lucide-react';
import { ReadingPlan } from '@/lib/storage';
import { useState } from 'react';

interface CalendarViewProps {
  plan: ReadingPlan;
  onToggle: (day: number) => void;
}

export default function CalendarView({ plan, onToggle }: CalendarViewProps) {
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);
  
  // Group days into weeks (7 days per row)
  const weeks: typeof plan.days[][] = [];
  for (let i = 0; i < plan.days.length; i += 7) {
    weeks.push(plan.days.slice(i, i + 7));
  }

  // Show first 4 weeks by default, allow expansion
  const visibleWeeks = selectedWeek === null ? weeks.slice(0, 4) : weeks;
  const hasMoreWeeks = weeks.length > 4;

  return (
    <Card className="p-2 md:p-3 rounded-xl md:rounded-lg bg-white border border-gray-200 shadow-sm">
      <div className="mb-2 md:mb-3">
        <h3 className="text-sm md:text-base font-bold text-gray-800 flex items-center gap-2">
          <span className="text-orange-500 text-lg md:text-base">✦</span>
          Calendar Overview
        </h3>
        <p className="text-[11px] md:text-xs text-orange-600 mt-1">Tap any day to mark complete</p>
      </div>

      <div className="space-y-2 md:space-y-2.5">
        {visibleWeeks.map((week, weekIndex) => {
          const completedCount = week.filter(d => d.completed).length;
          const weekProgress = (completedCount / week.length) * 100;
          
          return (
            <motion.div
              key={weekIndex}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: weekIndex * 0.05 }}
              className="space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <div className="text-[9px] md:text-xs font-semibold text-orange-600 uppercase tracking-wider">
                  Week {weekIndex + 1}
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-1 w-12 md:w-20 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-orange-500 to-orange-600 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${weekProgress}%` }}
                      transition={{ duration: 0.5, delay: weekIndex * 0.1 }}
                    />
                  </div>
                  <span className="text-[9px] md:text-xs text-orange-600 font-medium">
                    {completedCount}/{week.length}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-1 md:gap-1.5">
                {week.map((day) => (
                  <motion.button
                    key={day.day}
                    onClick={() => onToggle(day.day)}
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.9 }}
                    className={`aspect-square rounded-lg md:rounded-lg transition-all duration-200 border-2 relative overflow-hidden touch-manipulation ${
                      day.completed
                        ? 'bg-gradient-to-br from-green-500 to-green-600 border-green-600 text-white shadow-md shadow-green-500/30 active:shadow-lg'
                        : 'bg-white border-gray-300 text-gray-700 hover:border-orange-400 active:border-orange-500 hover:bg-orange-50 active:bg-orange-100'
                    }`}
                    title={`Day ${day.day}: ${day.reading.join(', ')}`}
                  >
                    <div className="flex flex-col items-center justify-center gap-0.5 h-full">
                      <div className={`text-[10px] md:text-xs font-bold ${day.completed ? 'text-white' : 'text-orange-600'}`}>
                        {day.day}
                      </div>
                      {day.completed ? (
                        <motion.div
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ type: "spring", stiffness: 200 }}
                        >
                          <Sparkles className="h-2.5 w-2.5 md:h-3 md:w-3 text-white" />
                        </motion.div>
                      ) : (
                        <Circle className="h-2.5 w-2.5 md:h-3 md:w-3 text-orange-400" />
                      )}
                    </div>
                  </motion.button>
                ))}
                {/* Fill remaining cells if week is incomplete */}
                {week.length < 7 &&
                  Array.from({ length: 7 - week.length }).map((_, idx) => (
                    <div key={`empty-${idx}`} className="aspect-square" />
                  ))}
              </div>
            </motion.div>
          );
        })}
        
        {/* Show More Button - Mobile Optimized */}
        {hasMoreWeeks && selectedWeek === null && (
          <motion.button
            onClick={() => setSelectedWeek(weeks.length)}
            className="w-full py-2 md:py-1.5 text-xs md:text-sm text-orange-600 hover:text-orange-700 active:text-orange-800 font-semibold md:font-medium border-2 border-orange-200 rounded-xl md:rounded-lg hover:bg-orange-50 active:bg-orange-100 transition-colors touch-manipulation"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Show All {weeks.length} Weeks
          </motion.button>
        )}
        
        {selectedWeek !== null && (
          <motion.button
            onClick={() => setSelectedWeek(null)}
            className="w-full py-2 md:py-1.5 text-xs md:text-sm text-orange-600 hover:text-orange-700 active:text-orange-800 font-semibold md:font-medium border-2 border-orange-200 rounded-xl md:rounded-lg hover:bg-orange-50 active:bg-orange-100 transition-colors touch-manipulation"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Show Less
          </motion.button>
        )}
      </div>
    </Card>
  );
}
