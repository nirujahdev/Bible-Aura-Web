import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { VerseTooltip, AutoVerseTooltip } from '@/components/VerseTooltip';
import { Book, MousePointer, Sparkles } from 'lucide-react';

export default function VerseDemo() {
  const sampleTexts = [
    "For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life. - John 3:16",
    "Love is patient, love is kind. It does not envy, it does not boast. Read more in 1 Corinthians 13:4-8 for the full passage about love.",
    "Trust in the Lord with all your heart and lean not on your own understanding. (Proverbs 3:5-6)",
    "I can do all things through Christ who strengthens me. Philippians 4:13 is a powerful reminder of God's strength in us.",
    "The Lord is my shepherd, I lack nothing. Check out Psalm 23:1 for more encouragement.",
    "Be strong and courageous! Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go. Joshua 1:9",
    "And we know that in all things God works for the good of those who love him. Romans 8:28 gives us hope in difficult times."
  ];

  const manualVerseExamples = [
    { ref: "Genesis 1:1", text: "In the beginning God created the heavens and the earth." },
    { ref: "Matthew 5:16", text: "Let your light shine before others." },
    { ref: "Ephesians 2:8", text: "For it is by grace you have been saved." },
    { ref: "Isaiah 40:31", text: "Those who hope in the Lord will renew their strength." }
  ];

  return (
    <div className="h-screen bg-background overflow-auto">
      {/* Header */}
      <div className="bg-aura-gradient text-white p-4 border-b">
        <div className="w-full">
          <div className="flex items-center gap-2">
            <Book className="h-6 w-6" />
            <h1 className="text-2xl font-divine">Verse Lookup Demo</h1>
            <Sparkles className="h-5 w-5" />
          </div>
          <p className="text-white/80 mt-1">Click or hover over verse references to see the text</p>
        </div>
      </div>

      <div className="w-full px-4 py-6 space-y-6">
        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MousePointer className="h-5 w-5" />
              How to Use
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge className="bg-blue-100 text-blue-800">Step 1</Badge>
              <span className="text-sm">Look for verse references in blue underlined text</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-green-100 text-green-800">Step 2</Badge>
              <span className="text-sm">Click on any verse reference to see the full text</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-purple-100 text-purple-800">Step 3</Badge>
              <span className="text-sm">Use the popup to favorite verses or read full chapters</span>
            </div>
          </CardContent>
        </Card>

        {/* Auto-Detection Demo */}
        <Card>
          <CardHeader>
            <CardTitle>📖 Auto-Detection of Verse References</CardTitle>
            <p className="text-muted-foreground text-sm">
              The system automatically detects verse references in text and makes them clickable
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {sampleTexts.map((text, index) => (
              <div key={index} className="p-4 border rounded-lg bg-muted/20">
                <AutoVerseTooltip text={text} />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Manual Verse Tooltips */}
        <Card>
          <CardHeader>
            <CardTitle>🎯 Manual Verse Tooltips</CardTitle>
            <p className="text-muted-foreground text-sm">
              You can also manually wrap specific verse references
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {manualVerseExamples.map((example, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <p className="text-sm mb-2">
                    <VerseTooltip verseReference={example.ref}>
                      {example.ref}
                    </VerseTooltip>
                  </p>
                  <p className="text-xs text-muted-foreground italic">
                    "{example.text}"
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Supported Formats */}
        <Card>
          <CardHeader>
            <CardTitle>✅ Supported Verse Reference Formats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                "John 3:16",
                "1 Corinthians 13:4-8", 
                "Gen 1:1",
                "Ps 23:1",
                "Matt 5:16",
                "Rom 8:28",
                "1 Pet 2:9",
                "Rev 21:4",
                "Isaiah 40:31"
              ].map((format) => (
                <div key={format} className="p-2 border rounded text-center">
                  <AutoVerseTooltip text={format} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Integration Example */}
        <Card>
          <CardHeader>
            <CardTitle>🔗 Integration Example</CardTitle>
            <p className="text-muted-foreground text-sm">
              This feature can be used in journals, notes, discussions, and more
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 border-l-4 border-primary bg-primary/5">
              <h4 className="font-semibold mb-2">📝 Journal Entry Example</h4>
              <AutoVerseTooltip text="Today I was reflecting on God's love and remembered John 3:16. It made me think about how we should also love others as mentioned in 1 John 4:19. The connection between God's love and our response is beautiful." />
            </div>
            
            <div className="p-4 border-l-4 border-green-500 bg-green-50">
              <h4 className="font-semibold mb-2">💬 Discussion Example</h4>
              <AutoVerseTooltip text="When facing challenges, I always remember Philippians 4:13 and Romans 8:28. These verses have helped me through difficult times and remind me that God is always working for our good." />
            </div>
            
            <div className="p-4 border-l-4 border-blue-500 bg-blue-50">
              <h4 className="font-semibold mb-2">🎤 Sermon Notes Example</h4>
              <AutoVerseTooltip text="Pastor spoke about faith today, referencing Hebrews 11:1 and James 2:17. The connection between faith and works was powerful. Also mentioned Ephesians 2:8-9 about salvation by grace." />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 