// Reading Plan Display - Interactive tabbed layout with minimal scrolling

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { RotateCcw, List, Calendar } from 'lucide-react';
import { ReadingPlan } from '@/lib/storage';
import DailyPlanCard from './DailyPlanCard';
import CalendarView from './CalendarView';
import ProgressTracker from './ProgressTracker';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

type ViewMode = 'list' | 'calendar';

interface ReadingPlanDisplayProps {
  plan: ReadingPlan;
  onToggle: (day: number) => void;
  onReset: () => void;
  stats: {
    completed: number;
    total: number;
    percentage: number;
    streak: number;
  };
}

export default function ReadingPlanDisplay({ 
  plan, 
  onToggle, 
  onReset,
  stats 
}: ReadingPlanDisplayProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [currentPage, setCurrentPage] = useState(0);
  
  // Pagination for list view
  const itemsPerPage = 10;
  const totalPages = Math.ceil(plan.days.length / itemsPerPage);
  const paginatedDays = plan.days.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  return (
    <div className="space-y-3 md:space-y-4">
      {/* Progress Tracker - Compact */}
      <ProgressTracker
        completedCount={stats.completed}
        totalDays={stats.total}
        streak={stats.streak}
      />

      {/* Header Bar - Compact */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg md:text-xl font-bold text-gray-800 flex items-center gap-2">
            <span className="text-orange-500 text-xl md:text-2xl">✦</span>
            {plan.preferences.scope}
          </h2>
          <p className="text-xs text-gray-600 mt-0.5">
            {plan.preferences.duration} days • {plan.preferences.daysPerWeek} days/week
          </p>
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="bg-white hover:bg-red-50 border-gray-200 hover:border-red-300 text-gray-700 hover:text-red-600 text-xs md:text-sm"
            >
              <RotateCcw className="h-3 w-3 md:h-4 md:w-4 mr-1.5" />
              Reset
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-white border border-gray-200">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-gray-900">Reset Reading Plan?</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-600">
                This will delete your current plan and all progress. You'll need to create a new plan from scratch.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={onReset}
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                Reset Plan
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* View Tabs - Mobile Optimized */}
      <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)} className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-gray-100/50 p-0.5 md:p-1 h-11 md:h-12 rounded-lg md:rounded-md">
          <TabsTrigger 
            value="list" 
            className="text-[11px] md:text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm flex items-center justify-center gap-1 md:gap-2 h-full rounded-md transition-all data-[state=active]:text-orange-600 data-[state=inactive]:text-orange-500"
          >
            <List className="h-4 w-4 md:h-4 md:w-4" />
            <span className="font-medium">List</span>
          </TabsTrigger>
          <TabsTrigger 
            value="calendar" 
            className="text-[11px] md:text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm flex items-center justify-center gap-1 md:gap-2 h-full rounded-md transition-all data-[state=active]:text-orange-600 data-[state=inactive]:text-orange-500"
          >
            <Calendar className="h-4 w-4 md:h-4 md:w-4" />
            <span className="font-medium">Calendar</span>
          </TabsTrigger>
        </TabsList>

        {/* Content Area - No internal scrolling, fits viewport */}
        <div className="mt-3 md:mt-4 min-h-0">
          <AnimatePresence mode="wait">
            {/* List View - Mobile Optimized */}
            {viewMode === 'list' && (
              <motion.div
                key="list"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-2 md:space-y-3"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 md:gap-3">
                  {paginatedDays.map((day) => (
                    <DailyPlanCard
                      key={day.day}
                      day={day}
                      onToggle={() => onToggle(day.day)}
                    />
                  ))}
                </div>
                
                {/* Pagination - Mobile Optimized */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 md:gap-3 pt-3 md:pt-4 border-t border-gray-200">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                      disabled={currentPage === 0}
                      className="h-9 md:h-8 text-xs md:text-sm px-4 md:px-3 touch-manipulation"
                    >
                      Previous
                    </Button>
                    <span className="text-xs md:text-sm text-gray-600 px-2 md:px-3 font-medium">
                      {currentPage + 1} / {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                      disabled={currentPage === totalPages - 1}
                      className="h-9 md:h-8 text-xs md:text-sm px-4 md:px-3 touch-manipulation"
                    >
                      Next
                    </Button>
                  </div>
                )}
              </motion.div>
            )}

            {/* Calendar View */}
            {viewMode === 'calendar' && (
              <motion.div
                key="calendar"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <CalendarView plan={plan} onToggle={onToggle} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Tabs>
    </div>
  );
}
