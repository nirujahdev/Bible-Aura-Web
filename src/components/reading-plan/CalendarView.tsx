// Calendar View - Visual calendar grid

import { Card } from '@/components/ui/card';
import { ReadingPlanDay } from '@/lib/storage';
import { CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface CalendarViewProps {
  plan: ReadingPlanDay[];
  onToggle: (day: number) => void;
}

export default function CalendarView({ plan, onToggle }: CalendarViewProps) {
  // Calculate weeks needed
  const totalDays = plan.length;
  const weeksNeeded = Math.ceil(totalDays / 7);
  
  // Create calendar grid
  const calendar: (ReadingPlanDay | null)[][] = [];
  for (let week = 0; week < weeksNeeded; week++) {
    const weekDays: (ReadingPlanDay | null)[] = [];
    for (let day = 0; day < 7; day++) {
      const dayIndex = week * 7 + day;
      weekDays.push(dayIndex < totalDays ? plan[dayIndex] : null);
    }
    calendar.push(weekDays);
  }

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <Card className="p-6 rounded-2xl backdrop-blur-xl bg-white/10 border border-white/20">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <span className="text-orange-400">✦</span>
          Calendar View
        </h3>
        <p className="text-sm text-gray-400 mt-1">
          Click any day to mark as completed
        </p>
      </div>

      {/* Day Names Header */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {dayNames.map((name) => (
          <div
            key={name}
            className="text-center text-xs font-semibold text-gray-400 py-2"
          >
            {name}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="space-y-2">
        {calendar.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7 gap-2">
            {week.map((day, dayIndex) => (
              <motion.div
                key={`${weekIndex}-${dayIndex}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: (weekIndex * 7 + dayIndex) * 0.01 }}
              >
                {day ? (
                  <div
                    onClick={() => onToggle(day.day)}
                    className={`aspect-square rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all hover:scale-105 ${
                      day.completed
                        ? 'bg-green-500/20 border-2 border-green-400 shadow-lg shadow-green-500/30'
                        : 'bg-white/10 border border-white/20 hover:bg-white/15 hover:border-orange-400'
                    }`}
                  >
                    <div className={`font-bold text-sm ${
                      day.completed ? 'text-green-400' : 'text-white'
                    }`}>
                      {day.day}
                    </div>
                    {day.completed && (
                      <CheckCircle2 className="h-4 w-4 text-green-400 mt-1" />
                    )}
                    {!day.completed && (
                      <div className="text-xs text-gray-400 mt-1">
                        {day.reading.length}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="aspect-square rounded-xl bg-white/5 border border-white/10" />
                )}
              </motion.div>
            ))}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-6 pt-6 border-t border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-green-500/20 border-2 border-green-400" />
          <span className="text-xs text-gray-400">Completed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-white/10 border border-white/20" />
          <span className="text-xs text-gray-400">Pending</span>
        </div>
      </div>
    </Card>
  );
}

