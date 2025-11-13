// Daily Plan Card - Individual day's reading

import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { CheckCircle2, Circle } from 'lucide-react';
import { ReadingPlanDay } from '@/lib/storage';

interface DailyPlanCardProps {
  day: ReadingPlanDay;
  onToggle: () => void;
}

export default function DailyPlanCard({ day, onToggle }: DailyPlanCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        className={`p-4 rounded-xl shadow-lg transition-all duration-300 cursor-pointer hover:scale-[1.02] ${
          day.completed
            ? 'bg-green-500/20 border-green-300/40 backdrop-blur-xl'
            : 'bg-white/10 border-white/20 backdrop-blur-xl hover:bg-white/15'
        }`}
        onClick={onToggle}
      >
        <div className="flex items-start gap-4">
          {/* Day Badge */}
          <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-bold shadow-lg ${
            day.completed
              ? 'bg-gradient-to-br from-green-400 to-green-600 text-white'
              : 'bg-gradient-to-br from-orange-400 to-orange-600 text-white'
          }`}>
            {day.day}
          </div>

          {/* Reading List */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-white">Day {day.day}</h3>
              {day.completed && (
                <CheckCircle2 className="h-4 w-4 text-green-400" />
              )}
            </div>
            <div className="space-y-1">
              {day.reading.map((passage, idx) => (
                <div
                  key={idx}
                  className="text-sm text-gray-300 flex items-center gap-2"
                >
                  <span className="text-orange-400">✦</span>
                  {passage}
                </div>
              ))}
            </div>
          </div>

          {/* Checkbox */}
          <div className="flex-shrink-0 flex items-center">
            <div
              className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                day.completed
                  ? 'bg-green-500 border-green-400'
                  : 'border-white/30 hover:border-orange-400'
              }`}
              onClick={(e) => {
                e.stopPropagation();
                onToggle();
              }}
            >
              {day.completed && (
                <CheckCircle2 className="h-4 w-4 text-white" />
              )}
            </div>
          </div>
        </div>

        {/* Status Badge */}
        <div className="mt-3 pt-3 border-t border-white/10">
          <div className={`text-xs font-medium inline-flex items-center gap-1 ${
            day.completed ? 'text-green-400' : 'text-gray-400'
          }`}>
            {day.completed ? (
              <>
                <CheckCircle2 className="h-3 w-3" />
                Completed
              </>
            ) : (
              <>
                <Circle className="h-3 w-3" />
                Pending
              </>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

