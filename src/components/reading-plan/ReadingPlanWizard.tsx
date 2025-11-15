// Reading Plan Wizard - 5-step form for creating a reading plan

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import WizardQuestion from './WizardQuestion';
import WizardNavigation from './WizardNavigation';
import { ReadingPlanPreferences } from '@/lib/storage';
import { getAllBooks, getThemePacks } from '@/lib/generateReadingPlan';

interface ReadingPlanWizardProps {
  onComplete: (preferences: ReadingPlanPreferences) => void;
}

export default function ReadingPlanWizard({ onComplete }: ReadingPlanWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [preferences, setPreferences] = useState<Partial<ReadingPlanPreferences>>({
    scope: '',
    specificBooks: [],
    duration: 90,
    daysPerWeek: 5,
    readingSize: 'Auto',
    language: 'English'
  });

  const totalSteps = 5;
  const allBooks = getAllBooks();
  const themePacks = getThemePacks();

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete wizard
      onComplete(preferences as ReadingPlanPreferences);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updatePreference = (key: keyof ReadingPlanPreferences, value: any) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  const toggleBook = (book: string) => {
    const current = preferences.specificBooks || [];
    if (current.includes(book)) {
      updatePreference('specificBooks', current.filter(b => b !== book));
    } else {
      updatePreference('specificBooks', [...current, book]);
    }
  };

  // Check if current step can proceed
  const canProceed = () => {
    switch (currentStep) {
      case 1:
        if (preferences.scope === 'Specific Books') {
          return (preferences.specificBooks?.length || 0) > 0;
        }
        return !!preferences.scope;
      case 2:
        return !!preferences.duration && preferences.duration > 0;
      case 3:
        return !!preferences.daysPerWeek;
      case 4:
        return !!preferences.readingSize;
      case 5:
        return !!preferences.language;
      default:
        return true;
    }
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -300 : 300,
      opacity: 0
    })
  };

  return (
    <Card className="max-w-2xl mx-auto p-8 rounded-2xl bg-white border border-orange-200 shadow-2xl">
      <AnimatePresence mode="wait" custom={1}>
        <motion.div
          key={currentStep}
          custom={1}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.3 }}
        >
          {/* Step 1: Reading Scope */}
          {currentStep === 1 && (
            <WizardQuestion
              title="What would you like to read?"
              description="Choose the scope of your reading plan"
              step={1}
              totalSteps={totalSteps}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {['Whole Bible', 'New Testament', 'Old Testament', 'Specific Books', ...themePacks].map((option) => (
                  <Button
                    key={option}
                    onClick={() => updatePreference('scope', option)}
                    variant={preferences.scope === option ? 'default' : 'outline'}
                    className={`h-auto py-4 justify-start text-left transition-all ${
                      preferences.scope === option
                        ? 'bg-orange-500 hover:bg-orange-600 text-white border-orange-400 shadow-lg shadow-orange-500/30'
                        : 'bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`text-lg ${preferences.scope === option ? 'text-white' : 'text-orange-500'}`}>
                        {option === 'Whole Bible' && '📖'}
                        {option === 'New Testament' && '✝️'}
                        {option === 'Old Testament' && '📜'}
                        {option === 'Specific Books' && '📚'}
                        {themePacks.includes(option) && '✦'}
                      </span>
                      <div>
                        <div className={`font-medium ${preferences.scope === option ? 'text-white' : 'text-gray-800'}`}>{option}</div>
                        {option === 'Whole Bible' && <div className={`text-xs ${preferences.scope === option ? 'text-orange-100' : 'text-gray-600'}`}>All 66 books</div>}
                        {option === 'New Testament' && <div className={`text-xs ${preferences.scope === option ? 'text-orange-100' : 'text-gray-600'}`}>27 books</div>}
                        {option === 'Old Testament' && <div className={`text-xs ${preferences.scope === option ? 'text-orange-100' : 'text-gray-600'}`}>39 books</div>}
                        {option === 'Specific Books' && <div className={`text-xs ${preferences.scope === option ? 'text-orange-100' : 'text-gray-600'}`}>Choose your own</div>}
                        {option === 'Faith' && <div className={`text-xs ${preferences.scope === option ? 'text-orange-100' : 'text-gray-600'}`}>Hebrews, James, Romans...</div>}
                        {option === 'Prayer' && <div className={`text-xs ${preferences.scope === option ? 'text-orange-100' : 'text-gray-600'}`}>Psalms, Timothy...</div>}
                        {option === "Jesus' Teachings" && <div className={`text-xs ${preferences.scope === option ? 'text-orange-100' : 'text-gray-600'}`}>The Four Gospels</div>}
                        {option === 'Wisdom' && <div className={`text-xs ${preferences.scope === option ? 'text-orange-100' : 'text-gray-600'}`}>Proverbs, Ecclesiastes...</div>}
                      </div>
                    </div>
                  </Button>
                ))}
              </div>

              {/* Book selection for "Specific Books" */}
              {preferences.scope === 'Specific Books' && (
                <div className="mt-6">
                  <div className="mb-3 text-sm text-gray-700">
                    Select books ({preferences.specificBooks?.length || 0} selected):
                  </div>
                  <ScrollArea className="h-64 rounded-lg border border-gray-200 p-4 bg-gray-50">
                    <div className="grid grid-cols-2 gap-2">
                      {allBooks.map((book) => (
                        <label
                          key={book}
                          className="flex items-center gap-2 p-2 rounded hover:bg-gray-100 cursor-pointer transition-colors"
                        >
                          <Checkbox
                            checked={preferences.specificBooks?.includes(book)}
                            onCheckedChange={() => toggleBook(book)}
                            className="border-gray-300 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                          />
                          <span className="text-sm text-gray-800">{book}</span>
                        </label>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </WizardQuestion>
          )}

          {/* Step 2: Duration */}
          {currentStep === 2 && (
            <WizardQuestion
              title="How long is your plan?"
              description="Choose the duration in days"
              step={2}
              totalSteps={totalSteps}
            >
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                {[30, 60, 90, 180, 365].map((days) => (
                  <Button
                    key={days}
                    onClick={() => updatePreference('duration', days)}
                    variant={preferences.duration === days ? 'default' : 'outline'}
                    className={`h-auto py-4 flex-col transition-all ${
                      preferences.duration === days
                        ? 'bg-orange-500 hover:bg-orange-600 text-white border-orange-400 shadow-lg shadow-orange-500/30'
                        : 'bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-800'
                    }`}
                  >
                    <div className={`text-2xl font-bold ${preferences.duration === days ? 'text-white' : 'text-gray-800'}`}>{days}</div>
                    <div className={`text-xs ${preferences.duration === days ? 'text-orange-100' : 'text-gray-600'}`}>days</div>
                  </Button>
                ))}
                <div className="col-span-3 md:col-span-6">
                  <div className="text-sm text-gray-700 mb-2">Or enter custom:</div>
                  <Input
                    type="number"
                    min="7"
                    max="730"
                    value={preferences.duration}
                    onChange={(e) => updatePreference('duration', parseInt(e.target.value) || 90)}
                    className="bg-white border-gray-200 text-gray-800"
                    placeholder="Custom days"
                  />
                </div>
              </div>
            </WizardQuestion>
          )}

          {/* Step 3: Days per Week */}
          {currentStep === 3 && (
            <WizardQuestion
              title="How many days per week?"
              description="Choose your reading frequency"
              step={3}
              totalSteps={totalSteps}
            >
              <div className="grid grid-cols-3 gap-4">
                {[3, 5, 7].map((days) => (
                  <Button
                    key={days}
                    onClick={() => updatePreference('daysPerWeek', days)}
                    variant={preferences.daysPerWeek === days ? 'default' : 'outline'}
                    className={`h-auto py-6 flex-col transition-all ${
                      preferences.daysPerWeek === days
                        ? 'bg-orange-500 hover:bg-orange-600 text-white border-orange-400 shadow-lg shadow-orange-500/30'
                        : 'bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-800'
                    }`}
                  >
                    <div className={`text-3xl font-bold ${preferences.daysPerWeek === days ? 'text-white' : 'text-gray-800'}`}>{days}</div>
                    <div className={`text-xs mt-1 ${preferences.daysPerWeek === days ? 'text-orange-100' : 'text-gray-600'}`}>days/week</div>
                    <div className={`text-xs mt-1 ${preferences.daysPerWeek === days ? 'text-orange-100' : 'text-gray-500'}`}>
                      {days === 3 && 'Flexible'}
                      {days === 5 && 'Consistent'}
                      {days === 7 && 'Daily'}
                    </div>
                  </Button>
                ))}
              </div>
            </WizardQuestion>
          )}

          {/* Step 4: Reading Size */}
          {currentStep === 4 && (
            <WizardQuestion
              title="Reading size per day"
              description="How much would you like to read each day?"
              step={4}
              totalSteps={totalSteps}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { value: 'Short', label: 'Short', desc: '1 chapter', icon: '📄' },
                  { value: 'Medium', label: 'Medium', desc: '2-3 chapters', icon: '📖' },
                  { value: 'Deep', label: 'Deep', desc: '3-5 chapters', icon: '📚' },
                  { value: 'Auto', label: 'Auto', desc: 'Distribute evenly', icon: '✦' }
                ].map((option) => (
                  <Button
                    key={option.value}
                    onClick={() => updatePreference('readingSize', option.value)}
                    variant={preferences.readingSize === option.value ? 'default' : 'outline'}
                    className={`h-auto py-4 justify-start text-left transition-all ${
                      preferences.readingSize === option.value
                        ? 'bg-orange-500 hover:bg-orange-600 text-white border-orange-400 shadow-lg shadow-orange-500/30'
                        : 'bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`text-2xl ${preferences.readingSize === option.value ? 'text-white' : 'text-orange-500'}`}>{option.icon}</span>
                      <div>
                        <div className={`font-medium ${preferences.readingSize === option.value ? 'text-white' : 'text-gray-800'}`}>{option.label}</div>
                        <div className={`text-xs ${preferences.readingSize === option.value ? 'text-orange-100' : 'text-gray-600'}`}>{option.desc}</div>
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </WizardQuestion>
          )}

          {/* Step 5: Language */}
          {currentStep === 5 && (
            <WizardQuestion
              title="Select your language"
              description="Choose the Bible translation language"
              step={5}
              totalSteps={totalSteps}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { value: 'English', label: 'English', flag: '🇺🇸', desc: 'King James Version' },
                  { value: 'Tamil', label: 'Tamil', flag: '🇮🇳', desc: 'Tamil Bible' }
                ].map((option) => (
                  <Button
                    key={option.value}
                    onClick={() => updatePreference('language', option.value)}
                    variant={preferences.language === option.value ? 'default' : 'outline'}
                    className={`h-auto py-6 justify-start text-left transition-all ${
                      preferences.language === option.value
                        ? 'bg-orange-500 hover:bg-orange-600 text-white border-orange-400 shadow-lg shadow-orange-500/30'
                        : 'bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-800'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-4xl">{option.flag}</span>
                      <div>
                        <div className={`font-medium text-lg ${preferences.language === option.value ? 'text-white' : 'text-gray-800'}`}>{option.label}</div>
                        <div className={`text-xs ${preferences.language === option.value ? 'text-orange-100' : 'text-gray-600'}`}>{option.desc}</div>
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </WizardQuestion>
          )}
        </motion.div>
      </AnimatePresence>

      <WizardNavigation
        onNext={handleNext}
        onBack={handleBack}
        isFirst={currentStep === 1}
        isLast={currentStep === totalSteps}
        canProceed={canProceed()}
      />
    </Card>
  );
}

