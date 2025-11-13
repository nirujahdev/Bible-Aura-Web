// Daily Plan Card - Clean and accessible design

import { Card } from '@/components/ui/card';
import { CheckCircle2, Circle, BookOpen } from 'lucide-react';
import { ReadingPlanDay } from '@/lib/storage';

interface DailyPlanCardProps {
  day: ReadingPlanDay;
  onToggle: () => void;
}

export default function DailyPlanCard({ day, onToggle }: DailyPlanCardProps) {
  return (
    <Card
      className={`p-4 rounded-xl transition-all duration-200 cursor-pointer border ${
        day.completed
          ? 'bg-green-50 border-green-300 hover:border-green-400'
          : 'bg-white border-gray-200 hover:border-orange-300 hover:shadow-sm'
      }`}
      onClick={onToggle}
    >
      <div className="flex items-center gap-3">
        {/* Day Number Badge - Compact */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
          day.completed
            ? 'bg-green-500 text-white'
            : 'bg-orange-500 text-white'
        }`}>
          {day.day}
        </div>

        {/* Reading Content */}
        <div className="flex-1 min-w-0 flex items-center gap-2">
          {/* Reading List - Compact Pills */}
          <div className="flex flex-wrap gap-1.5 flex-1">
            {day.reading.map((passage, idx) => (
              <span
                key={idx}
                className={`text-xs px-2 py-0.5 rounded-md inline-flex items-center gap-1 font-medium ${
                  day.completed
                    ? 'bg-green-100 text-green-800 border border-green-300'
                    : 'bg-orange-100 text-orange-800 border border-orange-300'
                }`}
              >
                <BookOpen className="h-3 w-3" />
                {passage}
              </span>
            ))}
          </div>
          
          {/* Completion Icon - Compact */}
          {day.completed ? (
            <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
          ) : (
            <Circle className="h-4 w-4 text-gray-400 flex-shrink-0" />
          )}
        </div>
      </div>
    </Card>
  );
}

