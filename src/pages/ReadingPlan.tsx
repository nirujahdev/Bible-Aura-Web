// Bible Reading Plan Page

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Sparkles } from 'lucide-react';
import ReadingPlanWizard from '@/components/reading-plan/ReadingPlanWizard';
import ReadingPlanDisplay from '@/components/reading-plan/ReadingPlanDisplay';
import { 
  ReadingPlan as ReadingPlanType, 
  ReadingPlanPreferences, 
  loadPlan, 
  savePlan, 
  resetPlan, 
  updateDayCompletion, 
  getCompletionStats 
} from '@/lib/storage';
import { generateReadingPlan } from '@/lib/generateReadingPlan';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { useSEO, SEO_CONFIG } from '@/hooks/useSEO';
import { MobileOptimizedLayout } from '@/components/MobileOptimizedLayout';

export default function ReadingPlan() {
  useSEO({
    ...SEO_CONFIG.HOME,
    title: 'Bible Reading Planner | Bible Aura',
    description: 'Create your personalized Bible reading plan. Build structured scripture journeys tailored to your goals.',
  });

  const { toast } = useToast();
  const [plan, setPlan] = useState<ReadingPlanType | null>(null);
  const [stats, setStats] = useState({ completed: 0, total: 0, percentage: 0, streak: 0 });
  const isMobile = useIsMobile();

  useEffect(() => {
    // Load existing plan
    const existingPlan = loadPlan();
    if (existingPlan) {
      setPlan(existingPlan);
      updateStats();
    }
  }, []);

  const updateStats = () => {
    const newStats = getCompletionStats();
    setStats(newStats);
  };

  const handleWizardComplete = (preferences: ReadingPlanPreferences) => {
    try {
      const newPlan = generateReadingPlan(preferences);
      savePlan(newPlan);
      setPlan(newPlan);
      updateStats();
      
      toast({
        title: "Plan Created! ✦",
        description: `Your ${preferences.duration}-day reading plan is ready!`,
      });
    } catch (error) {
      console.error('Error creating plan:', error);
      toast({
        title: "Error",
        description: "Failed to create reading plan. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleToggleDay = (dayNumber: number) => {
    if (!plan) return;
    
    const dayIndex = plan.days.findIndex(d => d.day === dayNumber);
    if (dayIndex === -1) return;
    
    const newCompleted = !plan.days[dayIndex].completed;
    
    // Update local state
    const updatedPlan = {
      ...plan,
      days: plan.days.map(d =>
        d.day === dayNumber ? { ...d, completed: newCompleted } : d
      )
    };
    
    setPlan(updatedPlan);
    savePlan(updatedPlan);
    updateStats();
    
    toast({
      title: newCompleted ? "Day Completed! ✓" : "Day Unchecked",
      description: newCompleted 
        ? `Great progress! Day ${dayNumber} marked as complete.`
        : `Day ${dayNumber} marked as incomplete.`,
    });
  };

  const handleResetPlan = () => {
    resetPlan();
    setPlan(null);
    setStats({ completed: 0, total: 0, percentage: 0, streak: 0 });
    
    toast({
      title: "Plan Reset",
      description: "Your reading plan has been cleared. Create a new one below!",
    });
  };

  return (
    <MobileOptimizedLayout>
      <div className={`min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 ${isMobile ? 'pb-4' : ''}`}>
        <div className={`container mx-auto ${isMobile ? 'px-3 py-3' : 'px-4 md:px-6 py-4 max-w-7xl'}`}>
          {!plan ? (
            /* Show Wizard if no plan exists */
            <div className="max-w-2xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-6"
              >
                <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">Create Your Reading Plan</h2>
                <p className="text-sm text-gray-600">Answer 5 simple questions to get started</p>
              </motion.div>
              <ReadingPlanWizard onComplete={handleWizardComplete} />
            </div>
          ) : (
            /* Show Plan Display if plan exists */
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <ReadingPlanDisplay
                plan={plan}
                onToggle={handleToggleDay}
                onReset={handleResetPlan}
                stats={stats}
              />
            </motion.div>
          )}
        </div>
      </div>
    </MobileOptimizedLayout>
  );
}

