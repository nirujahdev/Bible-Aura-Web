// Daily Plan Card - Interactive and animated design

import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { CheckCircle2, Circle, BookOpen, Sparkles } from 'lucide-react';
import { ReadingPlanDay } from '@/lib/storage';

interface DailyPlanCardProps {
  day: ReadingPlanDay;
  onToggle: () => void;
}

export default function DailyPlanCard({ day, onToggle }: DailyPlanCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className={`p-3 md:p-3 rounded-xl md:rounded-lg transition-all duration-300 cursor-pointer border group touch-manipulation ${
          day.completed
            ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-300 hover:border-green-400 active:border-green-500 shadow-sm hover:shadow-md active:shadow-sm'
            : 'bg-white border-gray-200 hover:border-orange-300 active:border-orange-400 hover:shadow-md active:shadow-sm hover:bg-orange-50/30 active:bg-orange-50/50'
        }`}
        onClick={onToggle}
      >
        <div className="flex items-center gap-2.5 md:gap-3">
          {/* Day Number Badge - Interactive */}
          <motion.div
            className={`flex-shrink-0 w-9 h-9 md:w-8 md:h-8 rounded-lg md:rounded-lg flex items-center justify-center font-bold text-sm md:text-sm shadow-md transition-all ${
              day.completed
                ? 'bg-gradient-to-br from-green-500 to-green-600 text-white'
                : 'bg-gradient-to-br from-orange-500 to-orange-600 text-white group-hover:from-orange-600 group-hover:to-orange-700 group-active:from-orange-700 group-active:to-orange-800'
            }`}
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
          >
            {day.completed ? <Sparkles className="h-4 w-4 md:h-4 md:w-4" /> : <span>{day.day}</span>}
          </motion.div>

          {/* Reading Content */}
          <div className="flex-1 min-w-0 flex items-center gap-2">
            {/* Reading List - Compact Pills - Mobile Optimized */}
            <div className="flex flex-wrap gap-1.5 md:gap-1.5 flex-1">
              {day.reading.slice(0, 2).map((passage, idx) => (
                <motion.span
                  key={idx}
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`text-[11px] md:text-xs px-2 md:px-2 py-1 md:py-0.5 rounded-lg md:rounded-md inline-flex items-center gap-1.5 md:gap-1 font-semibold md:font-medium transition-all ${
                    day.completed
                      ? 'bg-green-100 text-green-800 border border-green-300'
                      : 'bg-orange-100 text-orange-800 border border-orange-300'
                  }`}
                >
                  <BookOpen className="h-3 w-3 md:h-3 md:w-3 flex-shrink-0" />
                  <span className="truncate max-w-[110px] md:max-w-[150px]">{passage}</span>
                </motion.span>
              ))}
              {day.reading.length > 2 && (
                <span className={`text-[11px] md:text-xs px-2 md:px-2 py-1 md:py-0.5 rounded-lg md:rounded-md font-semibold md:font-medium ${
                  day.completed
                    ? 'bg-green-100 text-green-800 border border-green-300'
                    : 'bg-orange-100 text-orange-800 border border-orange-300'
                }`}>
                  +{day.reading.length - 2}
                </span>
              )}
            </div>
            
            {/* Completion Icon - Animated */}
            <motion.div
              animate={day.completed ? { scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] } : {}}
              transition={{ duration: 0.5 }}
            >
              {day.completed ? (
                <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5 text-green-600 flex-shrink-0" />
              ) : (
                <Circle className="h-4 w-4 md:h-5 md:w-5 text-gray-400 flex-shrink-0 group-hover:text-orange-500 transition-colors" />
              )}
            </motion.div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

