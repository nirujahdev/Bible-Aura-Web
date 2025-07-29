import { useState, useEffect } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Book, Loader2, ExternalLink, Star } from 'lucide-react';
import bibleApi from '@/lib/bible-api';

interface VerseData {
  text: string;
  reference: string;
  book: string;
  chapter: number;
  verse: number;
}

interface VerseTooltipProps {
  children: React.ReactNode;
  verseReference: string;
  translation?: string;
  className?: string;
}

// Regex patterns to match various verse reference formats
const VERSE_PATTERNS = [
  // "John 3:16", "1 Corinthians 13:4-8", "Gen 1:1"
  /\b(\d?\s?[A-Za-z]+\.?\s?\d+):(\d+)(?:-(\d+))?\b/g,
  // "Jn 3:16", "1 Cor 13:4"
  /\b([A-Za-z]{2,3}\.?\s?\d+):(\d+)(?:-(\d+))?\b/g
];

// Common Bible book abbreviations mapping
const BOOK_ABBREVIATIONS: Record<string, string> = {
  // Old Testament
  'gen': 'genesis', 'genesis': 'genesis',
  'exo': 'exodus', 'exodus': 'exodus', 'ex': 'exodus',
  'lev': 'leviticus', 'leviticus': 'leviticus',
  'num': 'numbers', 'numbers': 'numbers',
  'deu': 'deuteronomy', 'deuteronomy': 'deuteronomy', 'deut': 'deuteronomy',
  'jos': 'joshua', 'joshua': 'joshua',
  'jdg': 'judges', 'judges': 'judges',
  'rut': 'ruth', 'ruth': 'ruth',
  '1sa': '1samuel', '1 samuel': '1samuel', '1 sam': '1samuel',
  '2sa': '2samuel', '2 samuel': '2samuel', '2 sam': '2samuel',
  '1ki': '1kings', '1 kings': '1kings',
  '2ki': '2kings', '2 kings': '2kings',
  'psa': 'psalms', 'psalms': 'psalms', 'ps': 'psalms',
  'pro': 'proverbs', 'proverbs': 'proverbs', 'prov': 'proverbs',
  'ecc': 'ecclesiastes', 'ecclesiastes': 'ecclesiastes',
  'isa': 'isaiah', 'isaiah': 'isaiah', 'is': 'isaiah',
  'jer': 'jeremiah', 'jeremiah': 'jeremiah',
  'eze': 'ezekiel', 'ezekiel': 'ezekiel',
  'dan': 'daniel', 'daniel': 'daniel',
  
  // New Testament
  'mat': 'matthew', 'matthew': 'matthew', 'mt': 'matthew',
  'mar': 'mark', 'mark': 'mark', 'mk': 'mark',
  'luk': 'luke', 'luke': 'luke', 'lk': 'luke',
  'joh': 'john', 'john': 'john', 'jn': 'john',
  'act': 'acts', 'acts': 'acts',
  'rom': 'romans', 'romans': 'romans',
  '1co': '1corinthians', '1 corinthians': '1corinthians', '1 cor': '1corinthians',
  '2co': '2corinthians', '2 corinthians': '2corinthians', '2 cor': '2corinthians',
  'gal': 'galatians', 'galatians': 'galatians',
  'eph': 'ephesians', 'ephesians': 'ephesians',
  'phi': 'philippians', 'philippians': 'philippians', 'phil': 'philippians',
  'col': 'colossians', 'colossians': 'colossians',
  '1th': '1thessalonians', '1 thessalonians': '1thessalonians', '1 thess': '1thessalonians',
  '2th': '2thessalonians', '2 thessalonians': '2thessalonians', '2 thess': '2thessalonians',
  '1ti': '1timothy', '1 timothy': '1timothy', '1 tim': '1timothy',
  '2ti': '2timothy', '2 timothy': '2timothy', '2 tim': '2timothy',
  'tit': 'titus', 'titus': 'titus',
  'phm': 'philemon', 'philemon': 'philemon',
  'heb': 'hebrews', 'hebrews': 'hebrews',
  'jas': 'james', 'james': 'james',
  '1pe': '1peter', '1 peter': '1peter', '1 pet': '1peter',
  '2pe': '2peter', '2 peter': '2peter', '2 pet': '2peter',
  '1jo': '1john', '1 john': '1john', '1 jn': '1john',
  '2jo': '2john', '2 john': '2john', '2 jn': '2john',
  '3jo': '3john', '3 john': '3john', '3 jn': '3john',
  'jud': 'jude', 'jude': 'jude',
  'rev': 'revelation', 'revelation': 'revelation'
};

function normalizeBookName(bookName: string): string {
  const normalized = bookName.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
  return BOOK_ABBREVIATIONS[normalized] || normalized;
}

export function VerseTooltip({ 
  children, 
  verseReference, 
  translation = 'KJV',
  className = ""
}: VerseTooltipProps) {
  const [verseData, setVerseData] = useState<VerseData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const parseVerseReference = (ref: string) => {
    // Try to parse "Book Chapter:Verse" format
    const match = ref.match(/^(.+?)\s+(\d+):(\d+)(?:-(\d+))?$/i);
    if (!match) return null;

    const [, bookName, chapter, startVerse, endVerse] = match;
    const normalizedBook = normalizeBookName(bookName);
    
    return {
      book: normalizedBook,
      chapter: parseInt(chapter),
      verse: parseInt(startVerse),
      endVerse: endVerse ? parseInt(endVerse) : undefined
    };
  };

  const loadVerseData = async () => {
    const parsed = parseVerseReference(verseReference);
    if (!parsed) {
      setError('Invalid verse reference format');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const books = bibleApi.getBooks();
      const book = books.find(b => 
        b.id.toLowerCase() === parsed.book || 
        b.name.toLowerCase() === parsed.book ||
        normalizeBookName(b.name) === parsed.book
      );

      if (!book) {
        throw new Error(`Book "${parsed.book}" not found`);
      }

      const verses = await bibleApi.fetchChapter(book.id, parsed.chapter, translation);
      const targetVerse = verses.find(v => v.verse === parsed.verse);

      if (!targetVerse) {
        throw new Error(`Verse ${parsed.verse} not found in ${book.name} ${parsed.chapter}`);
      }

      let verseText = targetVerse.text;
      
      // If it's a range, get multiple verses
      if (parsed.endVerse && parsed.endVerse > parsed.verse) {
        const rangeVerses = verses.filter(v => 
          v.verse >= parsed.verse && v.verse <= parsed.endVerse
        );
        verseText = rangeVerses.map(v => `${v.verse} ${v.text}`).join(' ');
      }

      setVerseData({
        text: verseText,
        reference: `${book.name} ${parsed.chapter}:${parsed.verse}${parsed.endVerse ? `-${parsed.endVerse}` : ''}`,
        book: book.name,
        chapter: parsed.chapter,
        verse: parsed.verse
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load verse');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && !verseData && !loading) {
      loadVerseData();
    }
  }, [isOpen, verseReference, translation]);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <span 
          className={`cursor-pointer text-primary hover:text-primary/80 underline underline-offset-2 decoration-primary/50 hover:decoration-primary transition-colors ${className}`}
          onClick={() => setIsOpen(true)}
        >
          {children}
        </span>
      </PopoverTrigger>
      <PopoverContent 
        className="w-80 p-0"
        side="top"
        align="center"
      >
        <div className="p-4">
          {loading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              <span className="text-sm text-muted-foreground">Loading verse...</span>
            </div>
          ) : error ? (
            <div className="text-center py-4">
              <Book className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-2">Could not load verse</p>
              <p className="text-xs text-red-500">{error}</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={loadVerseData}
                className="mt-2"
              >
                Try Again
              </Button>
            </div>
          ) : verseData ? (
            <div className="space-y-3">
              {/* Header */}
              <div className="flex items-center justify-between border-b pb-2">
                <div className="flex items-center gap-2">
                  <Book className="h-4 w-4 text-primary" />
                  <h4 className="font-semibold text-sm">{verseData.reference}</h4>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {translation}
                </Badge>
              </div>

              {/* Verse Text */}
              <div className="space-y-2">
                <p className="text-sm leading-relaxed">
                  {verseData.text}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-2 border-t">
                <div className="flex items-center gap-1">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="h-6 px-2 text-xs"
                  >
                    <Star className="h-3 w-3 mr-1" />
                    Favorite
                  </Button>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="h-6 px-2 text-xs"
                  onClick={() => {
                    // Navigate to full Bible view
                    window.open(`/bible?book=${verseData.book}&chapter=${verseData.chapter}&verse=${verseData.verse}`, '_blank');
                  }}
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Read Full Chapter
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// Helper component to automatically detect and wrap verse references in text
interface AutoVerseTooltipProps {
  text: string;
  translation?: string;
  className?: string;
}

export function AutoVerseTooltip({ 
  text, 
  translation = 'KJV',
  className = ""
}: AutoVerseTooltipProps) {
  const processText = (inputText: string) => {
    const parts: (string | React.ReactNode)[] = [];
    let lastIndex = 0;
    let matchCount = 0;

    // Combine all verse patterns
    const combinedPattern = new RegExp(
      VERSE_PATTERNS.map(p => p.source).join('|'),
      'gi'
    );

    let match;
    while ((match = combinedPattern.exec(inputText)) !== null && matchCount < 10) {
      // Add text before the match
      if (match.index > lastIndex) {
        parts.push(inputText.slice(lastIndex, match.index));
      }

      // Add the verse reference as a tooltip
      const verseRef = match[0];
      parts.push(
        <VerseTooltip 
          key={`verse-${matchCount}`}
          verseReference={verseRef}
          translation={translation}
          className={className}
        >
          {verseRef}
        </VerseTooltip>
      );

      lastIndex = match.index + match[0].length;
      matchCount++;
    }

    // Add remaining text
    if (lastIndex < inputText.length) {
      parts.push(inputText.slice(lastIndex));
    }

    return parts.length > 1 ? parts : inputText;
  };

  const processedContent = processText(text);

  if (Array.isArray(processedContent)) {
    return <>{processedContent}</>;
  }

  return <>{processedContent}</>;
} 