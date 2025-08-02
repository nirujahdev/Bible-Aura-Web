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

// Enhanced function to generate daily verse with AI insights
const generateDailyVerse = async (): Promise<VerseOfDay> => {
  try {
    // Get a random inspiring Bible verse
    const inspiringVerses = [
      { text: "For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, to give you hope and a future.", reference: "Jeremiah 29:11", theme: "Hope and Future" },
      { text: "Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.", reference: "Proverbs 3:5-6", theme: "Trust and Guidance" },
      { text: "I can do all this through him who gives me strength.", reference: "Philippians 4:13", theme: "Strength and Perseverance" },
      { text: "The Lord your God is with you, the Mighty Warrior who saves. He will take great delight in you; in his love he will no longer rebuke you, but will rejoice over you with singing.", reference: "Zephaniah 3:17", theme: "God's Love and Presence" },
      { text: "Therefore do not worry about tomorrow, for tomorrow will worry about itself. Each day has enough trouble of its own.", reference: "Matthew 6:34", theme: "Peace and Trust" },
      { text: "And we know that in all things God works for the good of those who love him, who have been called according to his purpose.", reference: "Romans 8:28", theme: "God's Sovereignty" },
      { text: "Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go.", reference: "Joshua 1:9", theme: "Courage and Faith" },
      { text: "The Lord is my shepherd, I lack nothing. He makes me lie down in green pastures, he leads me beside quiet waters, he refreshes my soul.", reference: "Psalm 23:1-3", theme: "Rest and Restoration" }
    ];

    // Select verse based on day of year to ensure consistency
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    const selectedVerse = inspiringVerses[dayOfYear % inspiringVerses.length];

    // Generate AI-enhanced context
    const contextPrompt = `Based on this Bible verse, provide a brief, encouraging devotional reflection that helps the reader apply this truth to their daily life:

Scripture: "${selectedVerse.text}" - ${selectedVerse.reference}
Theme: ${selectedVerse.theme}

Write 2-3 sentences that:
1. Explain the key spiritual truth in this verse
2. Make it personal and encouraging for today
3. Connect it to practical Christian living
4. Offer hope and inspiration

Keep it warm, biblical, and uplifting.`;

    // Use AI to generate devotional context
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer sk-6251eb1f9fb8476cb2aba1431ab3c114',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: 'You are a Christian devotional writer. Create inspiring, biblical reflections that help people connect God\'s word to their daily lives. Be encouraging, practical, and spiritually uplifting.'
          },
          {
            role: 'user',
            content: contextPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 200
      })
    });

    let aiContext = "God's word speaks directly to our hearts today. Take time to meditate on this verse and let its truth guide your steps. Remember that God's promises are faithful and His love for you is unchanging.";
    
    if (response.ok) {
      const data = await response.json();
      aiContext = data.choices[0]?.message?.content || aiContext;
    }

    return {
      text: selectedVerse.text,
      reference: selectedVerse.reference,
      context: aiContext,
      theme: selectedVerse.theme
    };
  } catch (error) {
    console.error('Error generating daily verse:', error);
    return getFallbackVerse();
  }
};

// Fallback function for error cases
const getFallbackVerse = (): VerseOfDay => {
  const fallbackVerses = [
    { text: "For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, to give you hope and a future.", reference: "Jeremiah 29:11", theme: "Hope and Future" },
    { text: "Trust in the Lord with all your heart and lean not on your own understanding.", reference: "Proverbs 3:5", theme: "Trust and Guidance" },
    { text: "I can do all this through him who gives me strength.", reference: "Philippians 4:13", theme: "Strength in Christ" }
  ];
  
  const randomVerse = fallbackVerses[Math.floor(Math.random() * fallbackVerses.length)];
  
  return {
    text: randomVerse.text,
    reference: randomVerse.reference,
    context: "God's word is living and active, speaking to our hearts each day. Let this verse encourage you and remind you of God's faithful love. Take time to reflect on how this truth applies to your life today.",
    theme: randomVerse.theme
  };
};

export default function DailyVerseWidget() {
  const [dailyVerse, setDailyVerse] = useState<VerseOfDay | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const loadDailyVerse = async () => {
    setLoading(true);
    try {
      // Check if we have today's verse in database
      const today = new Date().toISOString().split('T')[0];
      
      const { data: existingVerse, error } = await supabase
        .from('daily_verses')
        .select('*')
        .eq('verse_date', today)
        .single();

      if (existingVerse && !error) {
        setDailyVerse({
          text: existingVerse.verse_text,
          reference: existingVerse.verse_reference,
          context: existingVerse.ai_context,
          theme: existingVerse.daily_theme
        });
      } else {
        // Generate new verse
        const newVerse = await generateDailyVerse();
        setDailyVerse(newVerse);
        
        // Save to database
        if (user) {
          await supabase
            .from('daily_verses')
            .insert({
              user_id: user.id,
              verse_text: newVerse.text,
              verse_reference: newVerse.reference,
              ai_context: newVerse.context,
              daily_theme: newVerse.theme,
              verse_date: today
            });
        }
      }
    } catch (error) {
      console.error('Error loading daily verse:', error);
      const fallback = getFallbackVerse();
      setDailyVerse(fallback);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDailyVerse();
  }, []);

  const refreshVerse = async () => {
    setLoading(true);
    try {
      const newVerse = await generateDailyVerse();
      setDailyVerse(newVerse);
      
      toast({
        title: "Verse Refreshed",
        description: "Your daily verse has been updated",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh verse. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const copyVerse = async () => {
    if (dailyVerse) {
      const verseText = `"${dailyVerse.text}" - ${dailyVerse.reference}`;
      try {
        await navigator.clipboard.writeText(verseText);
        toast({
          title: "Copied!",
          description: "Verse copied to clipboard",
        });
      } catch (error) {
        toast({
          title: "Copy failed",
          description: "Could not copy to clipboard",
          variant: "destructive"
        });
      }
    }
  };

  const addToJournal = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save to your journal",
        variant: "destructive"
      });
      return;
    }

    if (dailyVerse) {
      try {
        const journalEntry = `Daily Verse - ${new Date().toLocaleDateString()}

"${dailyVerse.text}" - ${dailyVerse.reference}

Reflection:
${dailyVerse.context}

Theme: ${dailyVerse.theme}`;

        const { error } = await supabase
          .from('journal_entries')
          .insert({
            user_id: user.id,
            title: `Daily Verse - ${dailyVerse.reference}`,
            content: journalEntry,
            entry_date: new Date().toISOString()
          });

        if (error) throw error;

        toast({
          title: "Added to Journal",
          description: "Daily verse saved to your journal",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to save to journal",
          variant: "destructive"
        });
      }
    }
  };

  if (!dailyVerse) {
    return (
      <Card className="w-full max-w-2xl mx-auto bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200 shadow-lg">
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-8 w-8 animate-spin text-orange-500" />
            <span className="ml-3 text-lg text-gray-700">Loading today's verse...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200 shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-6 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
              <Calendar className="h-8 w-8 text-white" />
            </div>
            <div>
              <div>
                <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                  Today's Verse
                  <Sparkles className="h-5 w-5 text-yellow-200" />
                </h3>
                <p className="text-orange-100 mt-1">
                  Daily Scripture & Inspiration
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 bg-white/20 backdrop-blur-sm text-white rounded-full text-sm font-medium border border-white/30">
              📅 {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </div>
          </div>
        </div>

        {/* Theme Badge */}
        <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-full text-sm font-medium border border-white/30">
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
            <h4 className="text-lg font-semibold text-blue-800">Daily Reflection</h4>
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