import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { 
  BookOpen, 
  RefreshCw, 
  Heart, 
  Share2, 
  Copy, 
  FileText, 
  Star,
  Sparkles,
  Calendar,
  Quote,
  PenTool
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { bibleApi } from '@/lib/bible-api';
import { billyGrahamDevotional } from '@/lib/billy-graham-devotional';

interface DailyVerse {
  id: string;
  verse_text: string;
  verse_reference: string;
  ai_context: string;
  daily_theme: string;
  verse_date: string;
  created_at: string;
}

interface VerseOfDay {
  text: string;
  reference: string;
  context: string;
  theme: string;
  billyGrahamContent?: string; // Optional expanded content
}

// Enhanced function to get Billy Graham devotional with AI enhancement
const generateDailyVerse = async (): Promise<VerseOfDay> => {
  try {
    // Get today's Billy Graham devotion
    const devotion = await billyGrahamDevotional.getTodaysVerse();
    
    if (!devotion) {
      return getFallbackVerse();
    }

    // Enhance the Billy Graham content with AI insights
    const contextPrompt = `Based on this Billy Graham devotional content, provide a brief, encouraging summary that captures the essence of his teaching:

Billy Graham's Teaching: "${devotion.devotional_content}"
Scripture: "${devotion.verse_text}" - ${devotion.verse_reference}
Theme: ${devotion.theme}

Write 2-3 sentences that:
1. Capture Billy Graham's key spiritual insight
2. Make it personal and encouraging for today
3. Connect it to practical Christian living
4. Stay true to his evangelical message

Keep it warm, biblical, and inspiring in Billy Graham's style.`;

    // Use AI to enhance Billy Graham's content
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer sk-50e2e8a01cc440c3bf61641eee6aa2a6',
        'HTTP-Referer': 'https://bible-aura.app',
        'X-Title': '✦Bible Aura - Billy Graham Daily Devotion',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-r1',
        messages: [
          {
            role: 'system',
            content: 'You are helping to summarize Billy Graham\'s devotional teachings. Maintain his warm, evangelical, and encouraging tone while making the content accessible for daily inspiration.'
          },
          {
            role: 'user',
            content: contextPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 250
      })
    });

    let enhancedContext = devotion.reflection;
    
    if (response.ok) {
      const data = await response.json();
      enhancedContext = data.choices[0]?.message?.content || devotion.reflection;
    }

    return {
      text: devotion.verse_text,
      reference: devotion.verse_reference,
      context: enhancedContext,
      theme: devotion.theme,
      billyGrahamContent: devotion.devotional_content // Extra content for expansion
    };
  } catch (error) {
    console.error('Error loading Billy Graham devotion:', error);
    return getFallbackVerse();
  }
};

// Fallback function for error cases
const getFallbackVerse = (): VerseOfDay => {
  const themes = [
    'Faith and Trust', 'Love and Compassion', 'Hope and Encouragement', 
    'Peace and Rest', 'Wisdom and Guidance', 'Strength and Courage',
    'Gratitude and Praise', 'Forgiveness and Grace', 'Joy and Celebration',
    'Prayer and Worship', 'Service and Purpose', 'Growth and Transformation'
  ];
  
  const todayTheme = themes[new Date().getDate() % themes.length];
  
  return {
    text: "Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.",
    reference: "Proverbs 3:5-6",
    context: `God calls us to trust Him completely. Today, surrender your worries and lean into His perfect wisdom and timing. This timeless truth reminds us that ${todayTheme} comes through trusting in His plan for your life.`,
    theme: todayTheme
  };
};

export function DailyVerseWidget() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [dailyVerse, setDailyVerse] = useState<VerseOfDay | null>(null);
  const [loading, setLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [todayDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    loadDailyVerse();
  }, [user]);

  const loadDailyVerse = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Check if we already have today's verse
      const { data: existingVerse, error } = await supabase
        .from('daily_verses')
        .select('*')
        .eq('user_id', user.id)
        .eq('verse_date', todayDate)
        .single();

      if (existingVerse && !error) {
        setDailyVerse({
          text: existingVerse.verse_text,
          reference: existingVerse.verse_reference,
          context: existingVerse.ai_context,
          theme: existingVerse.daily_theme
        });
      } else {
        // Generate new daily verse
        const newVerse = await generateDailyVerse();
        
        // Save to database
        const { error: insertError } = await supabase
          .from('daily_verses')
          .insert({
            user_id: user.id,
            verse_text: newVerse.text,
            verse_reference: newVerse.reference,
            ai_context: newVerse.context,
            daily_theme: newVerse.theme,
            verse_date: todayDate
          });

        if (insertError) {
          console.error('Error saving daily verse:', insertError);
        }

        setDailyVerse(newVerse);
      }

      // Check if verse is bookmarked
      checkIfBookmarked();
    } catch (error) {
      console.error('Error loading daily verse:', error);
      // Use fallback verse
      setDailyVerse({
        text: 'For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, to give you hope and a future.',
        reference: 'Jeremiah 29:11',
        context: 'God has beautiful plans for your life. Trust in His perfect timing and rest in His promises today.',
        theme: 'Hope and Encouragement'
      });
    } finally {
      setLoading(false);
    }
  };

  const checkIfBookmarked = async () => {
    if (!user || !dailyVerse) return;
    
    try {
      const { data } = await supabase
        .from('bookmarks')
        .select('id')
        .eq('user_id', user.id)
        .ilike('notes', `%${dailyVerse.reference}%`)
        .limit(1);
      
      setIsBookmarked(data && data.length > 0);
    } catch (error) {
      console.error('Error checking bookmark:', error);
    }
  };

  const refreshVerse = async () => {
    setLoading(true);
    try {
      const newVerse = await generateDailyVerse();
      
      // Update existing record or create new one
      const { error } = await supabase
        .from('daily_verses')
        .upsert({
          user_id: user.id,
          verse_text: newVerse.text,
          verse_reference: newVerse.reference,
          ai_context: newVerse.context,
          daily_theme: newVerse.theme,
          verse_date: todayDate
        });

      if (error) throw error;
      
      setDailyVerse(newVerse);
      toast({
        title: "New verse generated",
        description: "Your Billy Graham devotion has been refreshed",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh verse. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyVerse = async () => {
    if (!dailyVerse) return;
    
    const fullText = `"${dailyVerse.text}" - ${dailyVerse.reference}\n\n${dailyVerse.context}`;
    
    try {
      await navigator.clipboard.writeText(fullText);
      toast({
        title: "Copied to clipboard",
        description: "Daily verse and context copied successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const addToJournal = () => {
    if (!dailyVerse) return;
    
    const journalContent = `🌅 Daily Verse for ${new Date().toLocaleDateString()}\n\n"${dailyVerse.text}"\n- ${dailyVerse.reference}\n\n💭 Reflection:\n${dailyVerse.context}\n\n✍️ My thoughts:\n`;
    
    // Navigate to journal with pre-filled content
    window.location.href = `/journal?daily_verse=true&content=${encodeURIComponent(journalContent)}&theme=${encodeURIComponent(dailyVerse.theme)}`;
  };

  if (loading) {
    return (
      <Card className="overflow-hidden bg-gradient-to-br from-orange-50 via-white to-amber-50 border-0 shadow-lg">
        <CardContent className="p-8">
          <div className="space-y-6 animate-pulse">
            <div className="flex justify-between items-center">
              <div className="h-8 bg-orange-200 rounded-lg w-48"></div>
              <div className="h-6 bg-orange-100 rounded-full w-20"></div>
            </div>
            <div className="h-6 bg-orange-200 rounded-lg w-32"></div>
            <div className="space-y-3">
              <div className="h-5 bg-gray-200 rounded w-full"></div>
              <div className="h-5 bg-gray-200 rounded w-5/6"></div>
              <div className="h-5 bg-gray-200 rounded w-4/6"></div>
            </div>
            <div className="h-16 bg-gray-100 rounded-xl"></div>
            <div className="h-12 bg-orange-200 rounded-xl"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!dailyVerse) return null;

  return (
    <Card className="overflow-hidden bg-gradient-to-br from-orange-50 via-white to-amber-50 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
      {/* Header Section */}
      <div className="relative px-8 pt-8 pb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-orange-400 to-amber-500 rounded-2xl shadow-md">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  Today's Verse
                  <Sparkles className="h-5 w-5 text-amber-500" />
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Billy Graham's "Living in Christ" Daily Devotional
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 bg-orange-100 text-orange-700 rounded-full text-sm font-medium border border-orange-200">
              📅 {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </div>
          </div>
        </div>

        {/* Theme Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 rounded-full text-sm font-medium border border-purple-200 shadow-sm">
          🎯 {dailyVerse.theme}
        </div>
      </div>

      <CardContent className="px-8 pb-8 space-y-8">
        {/* Bible Verse Section */}
        <div className="relative">
          {/* Large Quote Mark */}
          <div className="absolute -top-4 -left-2 text-6xl text-orange-200 font-serif">"</div>
          
          <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-100 shadow-sm">
            <blockquote className="text-xl leading-relaxed text-gray-800 font-medium mb-6 pl-6">
              {dailyVerse.text}
            </blockquote>
            
            <div className="flex items-center gap-3 pl-6">
              <div className="w-1 h-8 bg-gradient-to-b from-orange-400 to-amber-500 rounded-full"></div>
              <cite className="text-orange-600 font-semibold text-lg">
                {dailyVerse.reference}
              </cite>
            </div>
          </div>
        </div>

        {/* AI Insights Section */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <h4 className="text-lg font-semibold text-blue-800">Billy Graham's Teaching</h4>
          </div>
          <p className="text-gray-700 leading-relaxed text-base">
            {dailyVerse.context}
          </p>
        </div>

        {/* Primary Action Button */}
        <div className="space-y-4">
          <Button
            onClick={addToJournal}
            size="lg"
            className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
          >
            <PenTool className="h-5 w-5 mr-3" />
            Add to Journal
          </Button>

          {/* Secondary Actions */}
          <div className="flex gap-3">
            <Button
              onClick={copyVerse}
              variant="outline"
              size="lg"
              className="flex-1 border-gray-200 hover:bg-gray-50 py-3 rounded-xl transition-all duration-200"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </Button>
            
            <Button
              onClick={refreshVerse}
              variant="outline"
              size="lg"
              className="flex-1 border-gray-200 hover:bg-gray-50 py-3 rounded-xl transition-all duration-200"
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-100">
          <Link 
            to="/bible" 
            className="flex items-center gap-2 text-orange-600 hover:text-orange-700 font-medium transition-colors duration-200 px-4 py-2.5 rounded-xl hover:bg-orange-50 group"
          >
            <BookOpen className="h-4 w-4 group-hover:scale-110 transition-transform" />
            Read More Scripture
          </Link>
          
          <Link 
            to="/chat" 
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200 px-4 py-2.5 rounded-xl hover:bg-blue-50 group"
          >
            <Sparkles className="h-4 w-4 group-hover:scale-110 transition-transform" />
            Ask AI About This Verse
          </Link>
        </div>
      </CardContent>
    </Card>
  );
} 