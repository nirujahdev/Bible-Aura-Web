// Weekly Plan View - Group readings by week

import { Card } from '@/components/ui/card';
import { ReadingPlanDay } from '@/lib/storage';
import { CheckCircle2, Circle } from 'lucide-react';

interface WeeklyPlanViewProps {
  plan: ReadingPlanDay[];
  onToggle: (day: number) => void;
}

export default function WeeklyPlanView({ plan, onToggle }: WeeklyPlanViewProps) {
  // Group days into weeks (7 days each)
  const weeks: ReadingPlanDay[][] = [];
  for (let i = 0; i < plan.length; i += 7) {
    weeks.push(plan.slice(i, i + 7));
  }

  return (
    <div className="space-y-6">
      {weeks.map((week, weekIndex) => {
        const weekNumber = weekIndex + 1;
        const completedInWeek = week.filter(d => d.completed).length;
        const totalInWeek = week.length;
        const weekProgress = Math.round((completedInWeek / totalInWeek) * 100);

        return (
          <Card
            key={weekIndex}
            className="p-6 rounded-2xl backdrop-blur-xl bg-white/10 border border-white/20"
          >
            {/* Week Header */}
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/10">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <span className="text-orange-400">✦</span>
                WEEK {weekNumber}
              </h3>
              <div className="flex items-center gap-3">
                <div className="text-sm text-gray-400">
                  {completedInWeek} / {totalInWeek} days
                </div>
                <div className="text-sm font-semibold text-orange-400">
                  {weekProgress}%
                </div>
              </div>
            </div>

            {/* Days in Week */}
            <div className="space-y-3">
              {week.map((day) => (
                <div
                  key={day.day}
                  onClick={() => onToggle(day.day)}
                  className={`p-4 rounded-xl cursor-pointer transition-all hover:scale-[1.01] ${
                    day.completed
                      ? 'bg-green-500/20 border border-green-300/40'
                      : 'bg-white/5 border border-white/10 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Day Number */}
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                      day.completed
                        ? 'bg-green-500 text-white'
                        : 'bg-orange-500 text-white'
                    }`}>
                      {day.day}
                    </div>

                    {/* Reading List */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="font-medium text-white text-sm">Day {day.day}</div>
                        {day.completed && (
                          <CheckCircle2 className="h-4 w-4 text-green-400" />
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {day.reading.map((passage, idx) => (
                          <span
                            key={idx}
                            className="text-xs bg-orange-500/20 text-orange-300 px-2 py-1 rounded-lg border border-orange-400/30"
                          >
                            {passage}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Status Icon */}
                    <div className="flex-shrink-0">
                      {day.completed ? (
                        <CheckCircle2 className="h-5 w-5 text-green-400" />
                      ) : (
                        <Circle className="h-5 w-5 text-gray-500" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        );
      })}
    </div>
  );
}

