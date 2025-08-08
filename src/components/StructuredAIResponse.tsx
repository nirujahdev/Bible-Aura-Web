import React from 'react';
import { motion } from 'framer-motion';

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
            icon: '•'
          };
        } else if (line.includes('⤷') || line.includes('↗')) {
          // Other sections
          if (currentSection) sections.push(currentSection);
          const sectionContent = line.replace(/[⤷↗]/g, '').trim();
          
          if (sectionContent.toLowerCase().includes('historical')) {
            currentSection = {
              title: 'Historical Context',
              content: '',
              icon: '•'
            };
          } else if (sectionContent.toLowerCase().includes('theology') || sectionContent.toLowerCase().includes('theological') || sectionContent.toLowerCase().includes('doctrine')) {
            currentSection = {
              title: 'Theological Doctrine',
              content: '',
              icon: '•'
            };
          } else if (sectionContent.toLowerCase().includes('simple') || sectionContent.toLowerCase().includes('explanation')) {
            currentSection = {
              title: 'Simple Explanation',
              content: '',
              icon: '•'
            };
          } else if (sectionContent.toLowerCase().includes('application') || sectionContent.toLowerCase().includes('practical')) {
            currentSection = {
              title: 'Practical Application',
              content: '',
              icon: '•'
            };
          } else if (sectionContent.toLowerCase().includes('cross') || sectionContent.toLowerCase().includes('reference')) {
            currentSection = {
              title: 'Cross Reference',
              content: '',
              icon: '•'
            };
          } else if (sectionContent.toLowerCase().includes('summary')) {
            currentSection = {
              title: 'Summary',
              content: '',
              icon: '•'
            };
          } else if (sectionContent.toLowerCase().includes('verse')) {
            currentSection = {
              title: 'Verse',
              content: '',
              icon: '•'
            };
          } else {
            currentSection = {
              title: sectionContent || 'Additional Context',
              content: '',
              icon: '•'
            };
          }
        } else if (currentSection && line.trim()) {
          // Add content to current section, keeping bullet points for proper display
          const cleanLine = line.trim();
          if (cleanLine.startsWith('•') || cleanLine.startsWith('-')) {
            // Keep bullet points
            currentSection.content += (currentSection.content ? '\n' : '') + cleanLine;
          } else {
            // Add bullet point if line doesn't have one
            const bulletLine = cleanLine.startsWith('➤') || cleanLine.startsWith('⤷') || cleanLine.startsWith('↗') 
              ? cleanLine 
              : '• ' + cleanLine;
            currentSection.content += (currentSection.content ? '\n' : '') + bulletLine;
          }
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
          icon: '•'
        });
        
        if (paragraphs.length > 1) {
          sections.push({
            title: 'Analysis',
            content: paragraphs.slice(1).join('\n\n'),
            icon: '•'
          });
        }
      } else {
        sections.push({
          title: 'Response',
          content: text,
          icon: '•'
        });
      }
    }
    
    return sections;
  };

  const sections = parseResponse(content);

  return (
    <div className="space-y-4">
      {/* Header with verse reference if available */}
      {verseReference && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-3 rounded-lg text-center font-semibold"
        >
          <span className="text-orange-200">✦</span> {verseReference.toUpperCase()}
        </motion.div>
      )}

      {/* Response sections - Simple clean boxes */}
      {sections.map((section, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          {/* Simple Clean Box */}
          <div className="bg-orange-50 rounded-lg border border-orange-100">
            {/* Simple Header */}
            <div className="bg-orange-100 px-4 py-3 rounded-t-lg">
              <div className="flex items-center gap-2">
                <span className="text-orange-600 font-bold">{section.icon}</span>
                <h3 className="font-semibold text-orange-800">{section.title}</h3>
              </div>
            </div>
            
            {/* Simple Content */}
            <div className="p-4 bg-white rounded-b-lg">
              <div className="space-y-2">
                {section.content.split('\n').map((line, lineIndex) => {
                  const trimmedLine = line.trim();
                  
                  if (trimmedLine.startsWith('•')) {
                    return (
                      <div key={lineIndex} className="flex items-start gap-2">
                        <span className="text-orange-500 font-bold mt-0.5">•</span>
                        <span className="text-gray-700 leading-relaxed">
                          {trimmedLine.replace('•', '').trim()}
                        </span>
                      </div>
                    );
                  } else if (trimmedLine) {
                    return (
                      <div key={lineIndex} className="text-gray-700 leading-relaxed">
                        {trimmedLine}
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}); 