// Calendar View - Compact grid display

import { Card } from '@/components/ui/card';
import { CheckCircle2, Circle } from 'lucide-react';
import { ReadingPlan } from '@/lib/storage';

interface CalendarViewProps {
  plan: ReadingPlan;
  onToggle: (day: number) => void;
}

export default function CalendarView({ plan, onToggle }: CalendarViewProps) {
  // Group days into weeks (7 days per row)
  const weeks: typeof plan.days[][] = [];
  for (let i = 0; i < plan.days.length; i += 7) {
    weeks.push(plan.days.slice(i, i + 7));
  }

  return (
    <Card className="p-4 rounded-xl bg-white border border-gray-200 shadow-sm">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-gray-800">Calendar Overview</h3>
        <p className="text-xs text-gray-600 mt-0.5">Click any day to toggle completion</p>
      </div>

      <div className="space-y-3 max-h-[calc(100vh-360px)] overflow-y-auto pr-2">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex}>
            <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Week {weekIndex + 1}
            </div>
            <div className="grid grid-cols-7 gap-1.5">
              {week.map((day) => (
                <button
                  key={day.day}
                  onClick={() => onToggle(day.day)}
                  className={`aspect-square rounded-lg transition-all duration-200 hover:scale-105 border-2 ${
                    day.completed
                      ? 'bg-green-500 border-green-600 text-white'
                      : 'bg-white border-gray-300 text-gray-700 hover:border-orange-400'
                  }`}
                  title={`Day ${day.day}: ${day.reading.join(', ')}`}
                >
                  <div className="flex flex-col items-center justify-center gap-0.5">
                    <div className="text-xs font-bold">{day.day}</div>
                    {day.completed ? (
                      <CheckCircle2 className="h-3 w-3" />
                    ) : (
                      <Circle className="h-3 w-3 text-gray-400" />
                    )}
                  </div>
                </button>
              ))}
              {/* Fill remaining cells if week is incomplete */}
              {week.length < 7 &&
                Array.from({ length: 7 - week.length }).map((_, idx) => (
                  <div key={`empty-${idx}`} className="aspect-square" />
                ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
