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
            icon: '⤷'
          };
        } else if (line.includes('⤷') || line.includes('↗')) {
          // Other sections
          if (currentSection) sections.push(currentSection);
          const sectionContent = line.replace(/[⤷↗]/g, '').trim();
          
          if (sectionContent.toLowerCase().includes('historical')) {
            currentSection = {
              title: 'Historical Context',
              content: '',
              icon: '⤷'
            };
          } else if (sectionContent.toLowerCase().includes('theology') || sectionContent.toLowerCase().includes('theological') || sectionContent.toLowerCase().includes('doctrine')) {
            currentSection = {
              title: 'Theological Doctrine',
              content: '',
              icon: '⤷'
            };
          } else if (sectionContent.toLowerCase().includes('simple') || sectionContent.toLowerCase().includes('explanation')) {
            currentSection = {
              title: 'Simple Explanation',
              content: '',
              icon: '⤷'
            };
          } else if (sectionContent.toLowerCase().includes('application') || sectionContent.toLowerCase().includes('practical')) {
            currentSection = {
              title: 'Practical Application',
              content: '',
              icon: '⤷'
            };
          } else if (sectionContent.toLowerCase().includes('cross') || sectionContent.toLowerCase().includes('reference')) {
            currentSection = {
              title: 'Cross Reference',
              content: '',
              icon: '⤷'
            };
          } else if (sectionContent.toLowerCase().includes('summary')) {
            currentSection = {
              title: 'Summary',
              content: '',
              icon: '⤷'
            };
          } else if (sectionContent.toLowerCase().includes('verse')) {
            currentSection = {
              title: 'Verse',
              content: '',
              icon: '⤷'
            };
          } else {
            currentSection = {
              title: sectionContent || 'Additional Context',
              content: '',
              icon: '⤷'
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
          icon: '⤷'
        });
        
        if (paragraphs.length > 1) {
          sections.push({
            title: 'Analysis',
            content: paragraphs.slice(1).join('\n\n'),
            icon: '⤷'
          });
        }
      } else {
        sections.push({
          title: 'Response',
          content: text,
          icon: '⤷'
        });
      }
    }
    
    return sections;
  };

  const sections = parseResponse(content);

  return (
    <div className="space-y-5">
      {/* Header with verse reference if available */}
      {verseReference && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-xl bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 text-white shadow-lg"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
          <div className="relative px-6 py-4 text-center">
            <div className="flex items-center justify-center gap-3">
              <span className="text-orange-200 text-2xl font-bold drop-shadow-lg">✦</span>
              <h2 className="text-xl font-bold tracking-wide uppercase drop-shadow-md">
                {verseReference}
              </h2>
            </div>
          </div>
        </motion.div>
      )}

      {/* Response sections as individual premium boxes */}
      {sections.map((section, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.15, duration: 0.6, ease: "easeOut" }}
          className="group relative"
        >
          {/* Premium Box Container */}
          <div className="relative overflow-hidden rounded-2xl bg-white shadow-xl border border-orange-100 hover:shadow-2xl transition-all duration-500">
            {/* Decorative Top Border */}
            <div className="h-1 bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600"></div>
            
            {/* Section Header */}
            <div className="relative bg-gradient-to-r from-orange-50 via-orange-100 to-orange-50 px-6 py-4 border-b border-orange-200">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
              <div className="relative flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg">
                  <span className="text-white font-bold text-lg drop-shadow-sm">{section.icon}</span>
                </div>
                <h3 className="text-xl font-bold text-orange-900 tracking-wide">
                  {section.title}
                </h3>
              </div>
            </div>
            
            {/* Section Content */}
            <div className="p-8 bg-gradient-to-b from-white to-gray-50/30">
              <div className="text-gray-800 leading-relaxed space-y-4">
                {section.content.split('\n').map((line, lineIndex) => {
                  const trimmedLine = line.trim();
                  
                  if (trimmedLine.startsWith('•')) {
                    return (
                      <motion.div 
                        key={lineIndex} 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: (index * 0.15) + (lineIndex * 0.05) }}
                        className="flex items-start gap-4 group/item"
                      >
                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-br from-orange-400 to-orange-500 shadow-sm mt-1 flex-shrink-0">
                          <span className="text-white font-bold text-sm">•</span>
                        </div>
                        <span className="flex-1 text-gray-700 leading-relaxed text-lg group-hover/item:text-gray-900 transition-colors duration-300">
                          {trimmedLine.replace('•', '').trim()}
                        </span>
                      </motion.div>
                    );
                  } else if (trimmedLine) {
                    return (
                      <motion.div 
                        key={lineIndex}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: (index * 0.15) + (lineIndex * 0.05) }}
                        className="text-gray-800 text-lg leading-relaxed font-medium"
                      >
                        {trimmedLine}
                      </motion.div>
                    );
                  }
                  return null;
                })}
              </div>
            </div>
            
            {/* Subtle Shadow Effect */}
            <div className="absolute inset-0 rounded-2xl shadow-inner pointer-events-none"></div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}); 