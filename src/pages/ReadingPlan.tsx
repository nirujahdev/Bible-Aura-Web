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
import { ModernLayout } from '@/components/ModernLayout';

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
    <ModernLayout>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
        <div className={`container mx-auto ${isMobile ? 'px-4 py-6' : 'px-4 py-12'}`}>
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={`text-center ${isMobile ? 'mb-6' : 'mb-12'}`}
          >
            <div className={`inline-flex items-center justify-center ${isMobile ? 'w-16 h-16' : 'w-20 h-20'} rounded-full bg-gradient-to-br from-orange-500 to-orange-600 shadow-2xl shadow-orange-500/50 ${isMobile ? 'mb-4' : 'mb-6'}`}>
              <Calendar className={`${isMobile ? 'h-8 w-8' : 'h-10 w-10'} text-white`} />
            </div>
            
            <h1 className={`${isMobile ? 'text-3xl' : 'text-5xl md:text-6xl'} font-bold text-gray-800 mb-4`}>
              Bible Reading Planner
            </h1>
            
            <p className={`${isMobile ? 'text-base' : 'text-xl'} text-gray-600 max-w-2xl mx-auto`}>
              Build your personalized scripture journey. Create structured reading plans tailored to your spiritual goals.
            </p>

            {plan && (
              <div className="mt-6 inline-flex items-center gap-3 px-6 py-3 rounded-full bg-orange-500/20 border border-orange-400/30 backdrop-blur-xl">
                <Sparkles className="h-5 w-5 text-orange-500" />
                <span className="text-sm font-medium text-orange-700">
                  Active Plan: {stats.completed} of {stats.total} days completed
                </span>
              </div>
            )}
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {!plan ? (
              /* Show Wizard if no plan exists */
              <div>
                <div className="text-center mb-8">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-xl">
                    <BookOpen className="h-4 w-4 text-orange-400" />
                    <span className="text-sm text-gray-300">Let's create your plan in 5 simple steps</span>
                  </div>
                </div>
                <ReadingPlanWizard onComplete={handleWizardComplete} />
              </div>
            ) : (
              /* Show Plan Display if plan exists */
              <ReadingPlanDisplay
                plan={plan}
                onToggle={handleToggleDay}
                onReset={handleResetPlan}
                stats={stats}
              />
            )}
          </motion.div>

          {/* Features Section (if no plan) */}
          {!plan && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {[
                {
                  icon: '📖',
                  title: 'Personalized Plans',
                  description: 'Choose from Whole Bible, Testament-specific, or themed reading plans'
                },
                {
                  icon: '📅',
                  title: 'Flexible Schedule',
                  description: 'Set your own pace with customizable duration and reading days per week'
                },
                {
                  icon: '📊',
                  title: 'Track Progress',
                  description: 'Visual progress tracking with daily, weekly, and calendar views'
                }
              ].map((feature, index) => (
                <div
                  key={index}
                  className="p-6 rounded-2xl backdrop-blur-xl bg-white/90 border border-orange-200/40 hover:bg-white transition-all shadow-sm"
                >
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </ModernLayout>
  );
}

