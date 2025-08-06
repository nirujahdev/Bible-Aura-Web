import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { BookOpen, Plus } from 'lucide-react';

interface StructuredAIResponseProps {
  content: string;
  timestamp?: string;
}

interface ParsedSection {
  title: string;
  content: string[];
}

interface ParsedResponse {
  mainTitle: string;
  sections: ParsedSection[];
}

const parseAIResponse = (content: string): ParsedResponse => {
  const lines = content.split('\n').filter(line => line.trim());
  
  let mainTitle = '';
  const sections: ParsedSection[] = [];
  let currentSection: ParsedSection | null = null;
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Main title (starts with ✮)
    if (trimmedLine.startsWith('✮')) {
      mainTitle = trimmedLine.replace('✮', '').trim();
    }
    // Section header (starts with ↗)
    else if (trimmedLine.startsWith('↗')) {
      // Save previous section if exists
      if (currentSection) {
        sections.push(currentSection);
      }
      // Start new section
      currentSection = {
        title: trimmedLine.replace('↗', '').trim(),
        content: []
      };
    }
    // Bullet point (starts with •)
    else if (trimmedLine.startsWith('•')) {
      if (currentSection) {
        currentSection.content.push(trimmedLine.replace('•', '').trim());
      }
    }
    // Regular content line
    else if (trimmedLine && currentSection) {
      currentSection.content.push(trimmedLine);
    }
  }
  
  // Add the last section
  if (currentSection) {
    sections.push(currentSection);
  }
  
  return { mainTitle, sections };
};

const StructuredAIResponse: React.FC<StructuredAIResponseProps> = ({ content, timestamp }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const parsed = parseAIResponse(content);
  
  const addToJournal = async () => {
    if (!user) {
      toast({
        title: "Sign In Required",
        description: "Please sign in to save to journal",
        variant: "destructive"
      });
      return;
    }

    try {
      const journalEntry = `AI Bible Study Insight - ${new Date().toLocaleDateString()}

${content}

Personal Reflection:
[Add your thoughts and insights about this AI response here]

How does this help my understanding?
[Personal reflection space]

Action Steps:
[How will I apply this insight to my life?]`;

      const { error } = await supabase
        .from('journal_entries')
        .insert({
          user_id: user.id,
          title: `AI Bible Study - ${parsed.mainTitle || 'Bible Insight'}`,
          content: journalEntry,
          entry_date: new Date().toISOString(),
          category: 'ai_study',
          tags: ['ai_study', 'bible_study'],
          metadata: {
            ai_response: content,
            timestamp: timestamp
          }
        });

      if (error) throw error;

      toast({
        title: "Added to Journal",
        description: "AI response saved to your journal for further reflection",
      });
    } catch (error) {
      console.error('Error adding to journal:', error);
      toast({
        title: "Error",
        description: "Failed to save to journal",
        variant: "destructive"
      });
    }
  };
  
  // If parsing fails, show original content
  if (!parsed.mainTitle && parsed.sections.length === 0) {
    return (
      <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-4 rounded-2xl border border-orange-100 shadow-sm">
        <p className="whitespace-pre-wrap leading-relaxed text-gray-800" style={{
          fontFamily: 'Montserrat, sans-serif',
          fontWeight: '500'
        }}>
          {content}
        </p>
        
        {/* Add to Journal Button */}
        <div className="flex justify-end mt-4">
          <Button
            onClick={addToJournal}
            size="sm"
            variant="outline"
            className="bg-white hover:bg-orange-50 border-orange-200 text-orange-700 hover:text-orange-800"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add to Journal
          </Button>
        </div>
        
        {timestamp && (
          <div className="flex items-center gap-1 mt-3 text-xs text-orange-600/70">
            <span className="w-1 h-1 bg-orange-400 rounded-full"></span>
            {new Date(timestamp).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Title */}
      {parsed.mainTitle && (
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-4 rounded-2xl shadow-sm">
          <h3 className="text-white font-semibold text-lg text-center" style={{
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: '600'
          }}>
            {parsed.mainTitle}
          </h3>
        </div>
      )}
      
      {/* Sections */}
      <div className="space-y-3">
        {parsed.sections.map((section, index) => (
          <Card key={index} className="overflow-hidden border-orange-100 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="bg-gradient-to-r from-orange-100 to-amber-100 px-4 py-3 border-b border-orange-200">
              <h4 className="font-semibold text-orange-800 flex items-center gap-2" style={{
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: '600'
              }}>
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                {section.title}
              </h4>
            </div>
            <CardContent className="p-4 bg-gradient-to-br from-white to-orange-50/30">
              <div className="space-y-2">
                {section.content.map((item, itemIndex) => (
                  <div key={itemIndex} className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 bg-orange-400 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-gray-700 leading-relaxed" style={{
                      fontFamily: 'Montserrat, sans-serif',
                      fontWeight: '500'
                    }}>
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Add to Journal Button */}
      <div className="flex justify-end">
        <Button
          onClick={addToJournal}
          size="sm"
          variant="outline"
          className="bg-white hover:bg-orange-50 border-orange-200 text-orange-700 hover:text-orange-800"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add to Journal
        </Button>
      </div>
      
      {/* Timestamp */}
      {timestamp && (
        <div className="flex items-center justify-center gap-2 mt-4 text-xs text-orange-600/70">
          <div className="w-1 h-1 bg-orange-400 rounded-full"></div>
          <span style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: '500' }}>
            {new Date(timestamp).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </span>
          <div className="w-1 h-1 bg-orange-400 rounded-full"></div>
        </div>
      )}
    </div>
  );
};

export default StructuredAIResponse; 