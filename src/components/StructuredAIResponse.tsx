import React from 'react';
import { motion } from 'framer-motion';

interface StructuredAIResponseProps {
  content: string;
  verseReference?: string;
}

export const StructuredAIResponse = React.memo(function StructuredAIResponse({ content }: StructuredAIResponseProps) {

  // Format content using the specific Bible Aura symbols
  const formatContent = (text: string) => {
    let formattedText = text;
    
    // Ensure proper spacing and formatting for the special symbols
    formattedText = formattedText.replace(/➤\s*/g, '➤ ');
    formattedText = formattedText.replace(/⤷\s*/g, '⤷ ');
    formattedText = formattedText.replace(/↗\s*/g, '↗ ');
    
    return formattedText.trim();
  };

  const renderFormattedContent = (text: string) => {
    const lines = text.split('\n');
    
    return lines.map((line, index) => {
      const trimmedLine = line.trim();
      
      if (!trimmedLine) {
        return <br key={index} />;
      }
      
      // Main title with ➤ symbol
      if (trimmedLine.startsWith('➤ ')) {
        const titleText = trimmedLine.substring(2);
        return (
          <div key={index} className="font-bold text-gray-900 text-lg mt-4 first:mt-0 mb-2">
            <span className="text-orange-500 mr-2">➤</span>
            {titleText}
          </div>
        );
      }
      
      // Sub-sections with ⤷ symbol
      if (trimmedLine.startsWith('⤷ ')) {
        const sectionText = trimmedLine.substring(2);
        return (
          <div key={index} className="text-gray-700 ml-6 mb-2 leading-relaxed">
            <span className="text-orange-400 mr-2">⤷</span>
            {sectionText}
          </div>
        );
      }
      
      // Additional sections with ↗ symbol
      if (trimmedLine.startsWith('↗ ')) {
        const additionalText = trimmedLine.substring(2);
        return (
          <div key={index} className="text-gray-700 ml-6 mb-2 leading-relaxed">
            <span className="text-orange-400 mr-2">↗</span>
            {additionalText}
          </div>
        );
      }
      
      // Regular text
      return (
        <div key={index} className="text-gray-700 mb-1 leading-relaxed ml-6">
          {trimmedLine}
        </div>
      );
    });
  };

  const formattedContent = formatContent(content);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-lg p-4"
    >
      <div className="prose prose-gray max-w-none">
        {renderFormattedContent(formattedContent)}
      </div>
    </motion.div>
  );
}); 