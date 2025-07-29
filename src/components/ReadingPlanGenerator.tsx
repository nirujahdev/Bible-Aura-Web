import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, BookOpen, Target, Clock, Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ReadingPlanGeneratorProps {
  onPlanCreated?: () => void;
}

const ReadingPlanGenerator = ({ onPlanCreated }: ReadingPlanGeneratorProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState({
    planName: '',
    startDate: '',
    endDate: '',
    planType: '',
    readingFrequency: 'daily'
  });

  const planTypes = [
    { value: 'whole-bible', label: 'Whole Bible', duration: '365 days', description: 'Read through the entire Bible' },
    { value: 'new-testament', label: 'New Testament', duration: '90 days', description: 'Focus on the New Testament' },
    { value: 'old-testament', label: 'Old Testament', duration: '275 days', description: 'Journey through the Old Testament' },
    { value: 'psalms-proverbs', label: 'Psalms & Proverbs', duration: '60 days', description: 'Wisdom and worship' },
    { value: 'gospels', label: 'Four Gospels', duration: '30 days', description: 'Life of Jesus Christ' },
    { value: 'custom', label: 'Custom Plan', duration: 'Variable', description: 'Create your own reading plan' }
  ];

  const frequencies = [
    { value: 'daily', label: 'Daily', description: 'Read every day' },
    { value: 'weekdays', label: 'Weekdays Only', description: 'Monday through Friday' },
    { value: 'custom', label: 'Custom Days', description: 'Choose specific days' }
  ];

  const generateBibleReadingPlan = (planType: string, startDate: Date, endDate: Date, frequency: string) => {
    const plans: Record<string, { books: Array<{ name: string; chapters: number }> }> = {
      'whole-bible': {
        books: [
          // Old Testament
          { name: 'Genesis', chapters: 50 },
          { name: 'Exodus', chapters: 40 },
          { name: 'Leviticus', chapters: 27 },
          { name: 'Numbers', chapters: 36 },
          { name: 'Deuteronomy', chapters: 34 },
          { name: 'Joshua', chapters: 24 },
          { name: 'Judges', chapters: 21 },
          { name: 'Ruth', chapters: 4 },
          { name: '1 Samuel', chapters: 31 },
          { name: '2 Samuel', chapters: 24 },
          { name: '1 Kings', chapters: 22 },
          { name: '2 Kings', chapters: 25 },
          { name: '1 Chronicles', chapters: 29 },
          { name: '2 Chronicles', chapters: 36 },
          { name: 'Ezra', chapters: 10 },
          { name: 'Nehemiah', chapters: 13 },
          { name: 'Esther', chapters: 10 },
          { name: 'Job', chapters: 42 },
          { name: 'Psalms', chapters: 150 },
          { name: 'Proverbs', chapters: 31 },
          { name: 'Ecclesiastes', chapters: 12 },
          { name: 'Song of Solomon', chapters: 8 },
          { name: 'Isaiah', chapters: 66 },
          { name: 'Jeremiah', chapters: 52 },
          { name: 'Lamentations', chapters: 5 },
          { name: 'Ezekiel', chapters: 48 },
          { name: 'Daniel', chapters: 12 },
          { name: 'Hosea', chapters: 14 },
          { name: 'Joel', chapters: 3 },
          { name: 'Amos', chapters: 9 },
          { name: 'Obadiah', chapters: 1 },
          { name: 'Jonah', chapters: 4 },
          { name: 'Micah', chapters: 7 },
          { name: 'Nahum', chapters: 3 },
          { name: 'Habakkuk', chapters: 3 },
          { name: 'Zephaniah', chapters: 3 },
          { name: 'Haggai', chapters: 2 },
          { name: 'Zechariah', chapters: 14 },
          { name: 'Malachi', chapters: 4 },
          // New Testament
          { name: 'Matthew', chapters: 28 },
          { name: 'Mark', chapters: 16 },
          { name: 'Luke', chapters: 24 },
          { name: 'John', chapters: 21 },
          { name: 'Acts', chapters: 28 },
          { name: 'Romans', chapters: 16 },
          { name: '1 Corinthians', chapters: 16 },
          { name: '2 Corinthians', chapters: 13 },
          { name: 'Galatians', chapters: 6 },
          { name: 'Ephesians', chapters: 6 },
          { name: 'Philippians', chapters: 4 },
          { name: 'Colossians', chapters: 4 },
          { name: '1 Thessalonians', chapters: 5 },
          { name: '2 Thessalonians', chapters: 3 },
          { name: '1 Timothy', chapters: 6 },
          { name: '2 Timothy', chapters: 4 },
          { name: 'Titus', chapters: 3 },
          { name: 'Philemon', chapters: 1 },
          { name: 'Hebrews', chapters: 13 },
          { name: 'James', chapters: 5 },
          { name: '1 Peter', chapters: 5 },
          { name: '2 Peter', chapters: 3 },
          { name: '1 John', chapters: 5 },
          { name: '2 John', chapters: 1 },
          { name: '3 John', chapters: 1 },
          { name: 'Jude', chapters: 1 },
          { name: 'Revelation', chapters: 22 }
        ]
      },
      'new-testament': {
        books: [
          { name: 'Matthew', chapters: 28 },
          { name: 'Mark', chapters: 16 },
          { name: 'Luke', chapters: 24 },
          { name: 'John', chapters: 21 },
          { name: 'Acts', chapters: 28 },
          { name: 'Romans', chapters: 16 },
          { name: '1 Corinthians', chapters: 16 },
          { name: '2 Corinthians', chapters: 13 },
          { name: 'Galatians', chapters: 6 },
          { name: 'Ephesians', chapters: 6 },
          { name: 'Philippians', chapters: 4 },
          { name: 'Colossians', chapters: 4 },
          { name: '1 Thessalonians', chapters: 5 },
          { name: '2 Thessalonians', chapters: 3 },
          { name: '1 Timothy', chapters: 6 },
          { name: '2 Timothy', chapters: 4 },
          { name: 'Titus', chapters: 3 },
          { name: 'Philemon', chapters: 1 },
          { name: 'Hebrews', chapters: 13 },
          { name: 'James', chapters: 5 },
          { name: '1 Peter', chapters: 5 },
          { name: '2 Peter', chapters: 3 },
          { name: '1 John', chapters: 5 },
          { name: '2 John', chapters: 1 },
          { name: '3 John', chapters: 1 },
          { name: 'Jude', chapters: 1 },
          { name: 'Revelation', chapters: 22 }
        ]
      },
      'old-testament': {
        books: [
          { name: 'Genesis', chapters: 50 },
          { name: 'Exodus', chapters: 40 },
          { name: 'Leviticus', chapters: 27 },
          { name: 'Numbers', chapters: 36 },
          { name: 'Deuteronomy', chapters: 34 },
          { name: 'Joshua', chapters: 24 },
          { name: 'Judges', chapters: 21 },
          { name: 'Ruth', chapters: 4 },
          { name: '1 Samuel', chapters: 31 },
          { name: '2 Samuel', chapters: 24 },
          { name: '1 Kings', chapters: 22 },
          { name: '2 Kings', chapters: 25 },
          { name: '1 Chronicles', chapters: 29 },
          { name: '2 Chronicles', chapters: 36 },
          { name: 'Ezra', chapters: 10 },
          { name: 'Nehemiah', chapters: 13 },
          { name: 'Esther', chapters: 10 },
          { name: 'Job', chapters: 42 },
          { name: 'Psalms', chapters: 150 },
          { name: 'Proverbs', chapters: 31 },
          { name: 'Ecclesiastes', chapters: 12 },
          { name: 'Song of Solomon', chapters: 8 },
          { name: 'Isaiah', chapters: 66 },
          { name: 'Jeremiah', chapters: 52 },
          { name: 'Lamentations', chapters: 5 },
          { name: 'Ezekiel', chapters: 48 },
          { name: 'Daniel', chapters: 12 },
          { name: 'Hosea', chapters: 14 },
          { name: 'Joel', chapters: 3 },
          { name: 'Amos', chapters: 9 },
          { name: 'Obadiah', chapters: 1 },
          { name: 'Jonah', chapters: 4 },
          { name: 'Micah', chapters: 7 },
          { name: 'Nahum', chapters: 3 },
          { name: 'Habakkuk', chapters: 3 },
          { name: 'Zephaniah', chapters: 3 },
          { name: 'Haggai', chapters: 2 },
          { name: 'Zechariah', chapters: 14 },
          { name: 'Malachi', chapters: 4 }
        ]
      },
      'psalms-proverbs': {
        books: [
          { name: 'Psalms', chapters: 150 },
          { name: 'Proverbs', chapters: 31 }
        ]
      },
      'gospels': {
        books: [
          { name: 'Matthew', chapters: 28 },
          { name: 'Mark', chapters: 16 },
          { name: 'Luke', chapters: 24 },
          { name: 'John', chapters: 21 }
        ]
      }
    };

    const selectedPlan = plans[planType];
    if (!selectedPlan) return [];

    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    interface Book {
      name: string;
      chapters: number;
    }
    
    const totalChapters = selectedPlan.books.reduce((sum: number, book: Book) => sum + book.chapters, 0);
    const chaptersPerDay = Math.ceil(totalChapters / totalDays);

    const dailyReadings = [];
    let currentBookIndex = 0;
    let currentChapter = 1;
    const currentDate = new Date(startDate);

    for (let day = 1; day <= totalDays; day++) {
      const reading = {
        day,
        date: new Date(currentDate),
        readings: [] as Array<{ book: string; chapters: string }>
      };

      let chaptersAssigned = 0;
      while (chaptersAssigned < chaptersPerDay && currentBookIndex < selectedPlan.books.length) {
        const currentBook = selectedPlan.books[currentBookIndex];
        const remainingInBook = currentBook.chapters - currentChapter + 1;
        const chaptersToAssign = Math.min(chaptersPerDay - chaptersAssigned, remainingInBook);

        if (chaptersToAssign === 1) {
          reading.readings.push({
            book: currentBook.name,
            chapters: currentChapter.toString()
          });
        } else {
          reading.readings.push({
            book: currentBook.name,
            chapters: `${currentChapter}-${currentChapter + chaptersToAssign - 1}`
          });
        }

        currentChapter += chaptersToAssign;
        chaptersAssigned += chaptersToAssign;

        if (currentChapter > currentBook.chapters) {
          currentBookIndex++;
          currentChapter = 1;
        }
      }

      dailyReadings.push(reading);
      currentDate.setDate(currentDate.getDate() + 1);

      if (currentBookIndex >= selectedPlan.books.length) break;
    }

    return dailyReadings;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to create a reading plan.",
        variant: "destructive"
      });
      return;
    }

    if (!formData.planName || !formData.startDate || !formData.endDate || !formData.planType) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);

    try {
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      
      if (endDate <= startDate) {
        toast({
          title: "Invalid Dates",
          description: "End date must be after start date.",
          variant: "destructive"
        });
        setIsGenerating(false);
        return;
      }

      const planData = generateBibleReadingPlan(formData.planType, startDate, endDate, formData.readingFrequency);
      const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

      // Save the reading plan to the database
      const { data: readingPlan, error: planError } = await supabase
        .from('reading_plans')
        .insert({
          name: formData.planName,
          description: `${formData.planType} reading plan (${totalDays} days)`,
          duration_days: totalDays,
          plan_data: planData,
          is_active: true
        })
        .select()
        .single();

      if (planError) throw planError;

      // Create user's reading progress record
      const { error: progressError } = await supabase
        .from('reading_progress')
        .insert({
          user_id: user.id,
          plan_id: readingPlan.id,
          current_day: 1,
          completed_days: [],
          started_at: startDate.toISOString()
        });

      if (progressError) throw progressError;

      toast({
        title: "Reading Plan Created!",
        description: `Your ${formData.planName} reading plan has been created successfully.`,
      });

      // Reset form
      setFormData({
        planName: '',
        startDate: '',
        endDate: '',
        planType: '',
        readingFrequency: 'daily'
      });

      if (onPlanCreated) {
        onPlanCreated();
      }

    } catch (error) {
      console.error('Error creating reading plan:', error);
      toast({
        title: "Error",
        description: "Failed to create reading plan. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Create Reading Plan
          <Sparkles className="h-4 w-4 text-primary" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="planName">Plan Name</Label>
              <Input
                id="planName"
                placeholder="My Bible Reading Plan"
                value={formData.planName}
                onChange={(e) => setFormData({ ...formData, planName: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="planType">Plan Type</Label>
              <Select value={formData.planType} onValueChange={(value) => setFormData({ ...formData, planType: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a reading plan" />
                </SelectTrigger>
                <SelectContent>
                  {planTypes.map((plan) => (
                    <SelectItem key={plan.value} value={plan.value}>
                      <div>
                        <div className="font-medium">{plan.label}</div>
                        <div className="text-xs text-muted-foreground">{plan.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="frequency">Reading Frequency</Label>
              <Select value={formData.readingFrequency} onValueChange={(value) => setFormData({ ...formData, readingFrequency: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="How often will you read?" />
                </SelectTrigger>
                <SelectContent>
                  {frequencies.map((freq) => (
                    <SelectItem key={freq.value} value={freq.value}>
                      <div>
                        <div className="font-medium">{freq.label}</div>
                        <div className="text-xs text-muted-foreground">{freq.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button type="submit" disabled={isGenerating} className="w-full btn-divine">
            {isGenerating ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Generating Plan...
              </>
            ) : (
              <>
                <BookOpen className="h-4 w-4 mr-2" />
                Create Reading Plan
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ReadingPlanGenerator; 