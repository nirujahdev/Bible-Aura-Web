import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface StructuredAIResponseProps {
  content: string;
  verseReference?: string;
}

interface ResponseSection {
  title: string;
  content: string;
  icon?: string;
}

export const StructuredAIResponse = React.memo(function StructuredAIResponse({ content, verseReference }: StructuredAIResponseProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['verse', 'simple_explanation']));

  // Parse the AI response into structured sections
  const parseResponse = (text: string): ResponseSection[] => {
    const sections: ResponseSection[] = [];
    
    // Check if it's a structured response with sections
    if (text.includes('➤') || text.includes('⤷') || text.includes('↗')) {
      const lines = text.split('\n').filter(line => line.trim());
      let currentSection: ResponseSection | null = null;
      
      for (const line of lines) {
        if (line.includes('➤')) {
          // Verse section
          if (currentSection) sections.push(currentSection);
          currentSection = {
            title: 'Verse',
            content: line.replace('➤', '').trim(),
            icon: '📖'
          };
        } else if (line.includes('⤷') || line.includes('↗')) {
          // Other sections
          if (currentSection) sections.push(currentSection);
          const sectionContent = line.replace(/[⤷↗]/g, '').trim();
          
          if (sectionContent.toLowerCase().includes('historical')) {
            currentSection = {
              title: 'Historical Context',
              content: '',
              icon: '🏛️'
            };
          } else if (sectionContent.toLowerCase().includes('theology') || sectionContent.toLowerCase().includes('theological') || sectionContent.toLowerCase().includes('doctrine')) {
            currentSection = {
              title: 'Theological Significance',
              content: '',
              icon: '✨'
            };
          } else if (sectionContent.toLowerCase().includes('simple') || sectionContent.toLowerCase().includes('explanation')) {
            currentSection = {
              title: 'Simple Explanation',
              content: '',
              icon: '💡'
            };
          } else if (sectionContent.toLowerCase().includes('application') || sectionContent.toLowerCase().includes('practical')) {
            currentSection = {
              title: 'Practical Application',
              content: '',
              icon: '🌟'
            };
          } else if (sectionContent.toLowerCase().includes('cross') || sectionContent.toLowerCase().includes('reference')) {
            currentSection = {
              title: 'Cross References',
              content: '',
              icon: '📚'
            };
          } else if (sectionContent.toLowerCase().includes('summary')) {
            currentSection = {
              title: 'Summary',
              content: '',
              icon: '📝'
            };
          } else if (sectionContent.toLowerCase().includes('verse')) {
            currentSection = {
              title: 'Verse',
              content: '',
              icon: '📖'
            };
          } else {
            currentSection = {
              title: sectionContent || 'Additional Context',
              content: '',
              icon: '📚'
            };
          }
        } else if (currentSection && line.trim()) {
          // Add content to current section, removing bullet points for cleaner display
          const cleanLine = line.replace(/^[•·]/g, '').trim();
          currentSection.content += (currentSection.content ? '\n' : '') + cleanLine;
        }
      }
      
      if (currentSection) sections.push(currentSection);
    } else {
      // Fallback for unstructured responses - try to create sections based on content
      const paragraphs = text.split('\n\n').filter(p => p.trim());
      
      if (verseReference && paragraphs.length > 0) {
        sections.push({
          title: 'Verse',
          content: paragraphs[0],
          icon: '📖'
        });
        
        if (paragraphs.length > 1) {
          sections.push({
            title: 'Analysis',
            content: paragraphs.slice(1).join('\n\n'),
            icon: '💡'
          });
        }
      } else {
        sections.push({
          title: 'Response',
          content: text,
          icon: '💬'
        });
      }
    }
    
    return sections;
  };

  const sections = parseResponse(content);

  const toggleSection = (sectionTitle: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionTitle.toLowerCase().replace(/\s+/g, '_'))) {
      newExpanded.delete(sectionTitle.toLowerCase().replace(/\s+/g, '_'));
    } else {
      newExpanded.add(sectionTitle.toLowerCase().replace(/\s+/g, '_'));
    }
    setExpandedSections(newExpanded);
  };

  const isExpanded = (sectionTitle: string) => 
    expandedSections.has(sectionTitle.toLowerCase().replace(/\s+/g, '_'));

  return (
    <div className="space-y-3">
      {/* Header with verse reference if available */}
      {verseReference && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-2 rounded-lg text-center font-medium"
        >
          {verseReference.toUpperCase()}
        </motion.div>
      )}

      {/* Response sections */}
      {sections.map((section, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="border-orange-200 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader 
              className="py-3 px-4 cursor-pointer hover:bg-orange-50 transition-colors"
              onClick={() => toggleSection(section.title)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-orange-500">{section.icon}</span>
                  <h3 className="font-medium text-gray-800">{section.title}</h3>
                </div>
                <motion.div
                  animate={{ rotate: isExpanded(section.title) ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </motion.div>
              </div>
            </CardHeader>
            
            <AnimatePresence>
              {isExpanded(section.title) && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  style={{ overflow: 'hidden' }}
                >
                  <CardContent className="pt-0 px-4 pb-4">
                    <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {section.content}
                    </div>
                  </CardContent>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </motion.div>
      ))}
         </div>
   );
}); 