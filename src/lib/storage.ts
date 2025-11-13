// localStorage utilities for Bible Reading Plan

export interface ReadingPlanDay {
  day: number;
  reading: string[];
  completed: boolean;
  date?: string;
}

export interface ReadingPlanPreferences {
  scope: string;
  specificBooks?: string[];
  duration: number;
  daysPerWeek: number;
  readingSize: string;
  language: string;
}

export interface ReadingPlan {
  preferences: ReadingPlanPreferences;
  days: ReadingPlanDay[];
  createdAt: string;
  startDate: string;
}

const STORAGE_KEY = 'bibleAuraReadingPlan';
const PREFERENCES_KEY = 'bibleAuraReadingPreferences';

export const savePlan = (plan: ReadingPlan): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(plan));
  } catch (error) {
    console.error('Failed to save reading plan:', error);
  }
};

export const loadPlan = (): ReadingPlan | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    return JSON.parse(stored);
  } catch (error) {
    console.error('Failed to load reading plan:', error);
    return null;
  }
};

export const resetPlan = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to reset reading plan:', error);
  }
};

export const savePreferences = (preferences: ReadingPlanPreferences): void => {
  try {
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
  } catch (error) {
    console.error('Failed to save preferences:', error);
  }
};

export const loadPreferences = (): ReadingPlanPreferences | null => {
  try {
    const stored = localStorage.getItem(PREFERENCES_KEY);
    if (!stored) return null;
    return JSON.parse(stored);
  } catch (error) {
    console.error('Failed to load preferences:', error);
    return null;
  }
};

export const updateDayCompletion = (dayNumber: number, completed: boolean): void => {
  try {
    const plan = loadPlan();
    if (!plan) return;
    
    const dayIndex = plan.days.findIndex(d => d.day === dayNumber);
    if (dayIndex === -1) return;
    
    plan.days[dayIndex].completed = completed;
    savePlan(plan);
  } catch (error) {
    console.error('Failed to update day completion:', error);
  }
};

export const getCompletionStats = (): { completed: number; total: number; percentage: number; streak: number } => {
  try {
    const plan = loadPlan();
    if (!plan) return { completed: 0, total: 0, percentage: 0, streak: 0 };
    
    const completed = plan.days.filter(d => d.completed).length;
    const total = plan.days.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    // Calculate streak
    let streak = 0;
    for (let i = 0; i < plan.days.length; i++) {
      if (plan.days[i].completed) {
        streak++;
      } else {
        break;
      }
    }
    
    return { completed, total, percentage, streak };
  } catch (error) {
    console.error('Failed to get completion stats:', error);
    return { completed: 0, total: 0, percentage: 0, streak: 0 };
  }
};

