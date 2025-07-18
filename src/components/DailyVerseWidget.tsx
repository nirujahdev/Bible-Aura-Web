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
import bibleApi from '@/lib/bible-api';

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
}

// Enhanced Biblical AI function for daily verse generation
const generateDailyVerse = async (): Promise<VerseOfDay> => {
  const themes = [
    'Faith and Trust', 'Love and Compassion', 'Hope and Encouragement', 
    'Peace and Rest', 'Wisdom and Guidance', 'Strength and Courage',
    'Gratitude and Praise', 'Forgiveness and Grace', 'Joy and Celebration',
    'Prayer and Worship', 'Service and Purpose', 'Growth and Transformation'
  ];
  
  const todayTheme = themes[new Date().getDate() % themes.length];
  
  try {
    // First, get a random verse from Bible API
    const books = await bibleApi.getBooks('kjv');
    const randomBook = books[Math.floor(Math.random() * books.length)];
    const randomChapter = Math.floor(Math.random() * randomBook.chapters) + 1;
    const verses = await bibleApi.fetchChapter(randomBook.id, randomChapter, 'kjv');
    const randomVerse = verses[Math.floor(Math.random() * verses.length)];
    
    // Generate AI context using our multi-model system
    const contextPrompt = `Provide a thoughtful, encouraging daily devotional context for this Bible verse, focusing on the theme of "${todayTheme}":

Verse: "${randomVerse.text}" - ${randomVerse.reference}

Write a 2-3 sentence reflection that:
1. Explains the verse in simple, practical terms
2. Connects it to daily spiritual life
3. Offers encouragement for today's journey
4. Relates to the theme: ${todayTheme}

Keep it personal, uplifting, and actionable. Base everything strictly on biblical truth.`;

    // Use our existing OpenAI setup from Chat.tsx
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer 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',
        'HTTP-Referer': 'https://bible-aura.app',
        'X-Title': '✦Bible Aura - Daily Verse',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'moonshotai/kimi-k2:free',
        messages: [
          {
            role: 'system',
            content: 'You are a biblical scholar providing daily devotional insights. Always base responses strictly on biblical truth and provide encouraging, practical application.'
          },
          {
            role: 'user',
            content: contextPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 300
      })
    });

    if (!response.ok) {
      throw new Error('Failed to generate AI context');
    }

    const data = await response.json();
    const aiContext = data.choices[0]?.message?.content || 
      `This verse reminds us of God's faithfulness and love. As we focus on ${todayTheme} today, let this scripture guide your heart and actions.`;

    return {
      text: randomVerse.text,
      reference: randomVerse.reference,
      context: aiContext,
      theme: todayTheme
    };
  } catch (error) {
    console.error('Error generating daily verse:', error);
    
    // Fallback verses for different themes
    const fallbackVerses = {
      'Faith and Trust': {
        text: 'Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.',
        reference: 'Proverbs 3:5-6',
        context: 'When life feels uncertain, God calls us to trust Him completely. Today, surrender your worries and lean into His perfect wisdom and timing.',
        theme: 'Faith and Trust'
      },
      'Love and Compassion': {
        text: 'And now these three remain: faith, hope and love. But the greatest of these is love.',
        reference: '1 Corinthians 13:13',
        context: 'Love is the greatest gift we can give and receive. Let God\'s love flow through you today in every interaction and relationship.',
        theme: 'Love and Compassion'
      }
    };
    
    return fallbackVerses[todayTheme as keyof typeof fallbackVerses] || fallbackVerses['Faith and Trust'];
  }
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
        description: "Your daily verse has been refreshed with AI insights",
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
      <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-orange-800 flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Daily Verse
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 animate-pulse">
            <div className="h-4 bg-orange-200 rounded w-3/4"></div>
            <div className="h-3 bg-orange-100 rounded w-1/2"></div>
            <div className="h-16 bg-orange-100 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!dailyVerse) return null;

  return (
    <Card className="enhanced-card border-orange-200/60 bg-gradient-to-br from-orange-50/80 to-amber-50/80 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.02]">
      <CardHeader className="pb-4 space-y-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-orange-800 flex items-center gap-3 text-xl font-bold">
            <div className="p-2 bg-orange-100 rounded-lg">
              <BookOpen className="h-6 w-6 text-orange-600" />
            </div>
            <span>Today's Verse</span>
            <Sparkles className="h-5 w-5 text-amber-500 animate-pulse" />
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-orange-600 border-orange-300 bg-white/60 backdrop-blur-sm px-3 py-1">
              <Calendar className="h-3 w-3 mr-2" />
              {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </Badge>
          </div>
        </div>
        <Badge className="bg-gradient-to-r from-orange-100 to-amber-100 text-orange-700 w-fit px-4 py-2 rounded-full font-medium">
          🎯 {dailyVerse.theme}
        </Badge>
      </CardHeader>

      <CardContent className="space-y-6 pb-6">
        {/* Bible Verse */}
        <div className="relative bg-gradient-to-r from-white/80 to-orange-50/80 rounded-xl p-6 border border-orange-100/50">
          <Quote className="h-8 w-8 text-orange-300 absolute -top-2 -left-2 bg-white rounded-full p-1 shadow-md" />
          <blockquote className="text-gray-800 font-medium leading-relaxed pl-4 pr-2 text-lg">
            "{dailyVerse.text}"
          </blockquote>
          <cite className="text-orange-600 font-semibold text-base mt-4 block pl-4 border-l-4 border-orange-300">
            — {dailyVerse.reference}
          </cite>
        </div>

        <Separator className="bg-gradient-to-r from-transparent via-orange-200 to-transparent h-px" />

        {/* AI Context */}
        <div className="bg-gradient-to-br from-white/80 to-blue-50/40 rounded-xl p-5 border border-blue-100/50 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Sparkles className="h-5 w-5 text-blue-600" />
            </div>
            <span className="text-base font-semibold text-blue-700">AI Spiritual Insights</span>
          </div>
          <p className="text-gray-700 leading-relaxed text-base">
            {dailyVerse.context}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="btn-group pt-2">
          <Button
            onClick={addToJournal}
            size="lg"
            className="gradient-primary hover:shadow-lg text-white flex-1 font-semibold py-3 rounded-xl transition-all duration-300 hover:scale-105"
          >
            <PenTool className="h-5 w-5 mr-2" />
            Add to Journal
          </Button>
          
          <Button
            onClick={copyVerse}
            variant="outline"
            size="lg"
            className="border-orange-300 text-orange-600 hover:bg-orange-50 hover:shadow-md px-4 py-3 rounded-xl transition-all duration-300"
          >
            <Copy className="h-5 w-5" />
          </Button>
          
          <Button
            onClick={refreshVerse}
            variant="outline"
            size="lg"
            className="border-orange-300 text-orange-600 hover:bg-orange-50 hover:shadow-md px-4 py-3 rounded-xl transition-all duration-300"
            disabled={loading}
          >
            <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {/* Additional Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-orange-100">
          <Link 
            to="/bible" 
            className="flex items-center gap-2 text-orange-600 hover:text-orange-800 font-medium transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-orange-50"
          >
            <BookOpen className="h-4 w-4" />
            Read More Scripture
          </Link>
          <Link 
            to="/chat" 
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-blue-50"
          >
            <Sparkles className="h-4 w-4" />
            Ask AI About This Verse
          </Link>
        </div>
      </CardContent>
    </Card>
  );
} 