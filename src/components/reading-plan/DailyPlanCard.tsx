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
      <div className="flex items-start gap-3">
        {/* Day Number Badge */}
        <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm ${
          day.completed
            ? 'bg-green-500 text-white'
            : 'bg-orange-500 text-white'
        }`}>
          {day.day}
        </div>

        {/* Reading Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-800 text-sm">Day {day.day}</h3>
            {day.completed ? (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            ) : (
              <Circle className="h-5 w-5 text-gray-300" />
            )}
          </div>
          
          {/* Reading List */}
          <div className="flex flex-wrap gap-1.5">
            {day.reading.map((passage, idx) => (
              <span
                key={idx}
                className={`text-xs px-2 py-1 rounded-md inline-flex items-center gap-1 ${
                  day.completed
                    ? 'bg-green-100 text-green-700 border border-green-200'
                    : 'bg-orange-50 text-orange-700 border border-orange-200'
                }`}
              >
                <BookOpen className="h-3 w-3" />
                {passage}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}

