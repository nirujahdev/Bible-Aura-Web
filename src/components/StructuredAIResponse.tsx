import React from 'react';
import { motion } from 'framer-motion';

interface StructuredAIResponseProps {
  content: string;
  verseReference?: string;
}

export const StructuredAIResponse = React.memo(function StructuredAIResponse({ content, verseReference }: StructuredAIResponseProps) {

  // Parse and format the content for display
  const formatContent = (text: string): string => {
    let formattedText = text;
    
    // Format section headers with proper styling
    formattedText = formattedText.replace(/➤\s*/g, '\n\n**');
    formattedText = formattedText.replace(/⤷\s*/g, '\n\n**');
    formattedText = formattedText.replace(/↗\s*/g, '\n\n**');
    
    // Add closing ** for headers and ensure proper line breaks
    const lines = formattedText.split('\n');
    const processedLines = lines.map((line, index) => {
      if (line.trim().startsWith('**') && !line.includes('**', 2)) {
        return line + '**';
      }
      return line;
    });
    
    return processedLines.join('\n').trim();
  };

  const renderFormattedContent = (text: string) => {
    const lines = text.split('\n');
    
    return lines.map((line, index) => {
      const trimmedLine = line.trim();
      
      if (!trimmedLine) {
        return <div key={index} className="h-2"></div>;
      }
      
      // Handle section headers (bold text between **)
      if (trimmedLine.startsWith('**') && trimmedLine.endsWith('**')) {
        const headerText = trimmedLine.replace(/\*\*/g, '');
        return (
          <div key={index} className="mt-6 mb-3 first:mt-0">
            <h3 className="text-lg font-bold text-orange-800 border-b border-orange-200 pb-2">
              {headerText}
            </h3>
          </div>
        );
      }
      
      // Handle bullet points
      if (trimmedLine.startsWith('•')) {
        return (
          <div key={index} className="flex items-start gap-3 mb-2 ml-4">
            <span className="text-orange-500 font-bold mt-1 flex-shrink-0">•</span>
            <span className="text-gray-700 leading-relaxed">
              {trimmedLine.replace('•', '').trim()}
            </span>
          </div>
        );
      }
      
      // Handle regular content
      if (trimmedLine) {
        return (
          <div key={index} className="text-gray-700 leading-relaxed mb-2">
            {trimmedLine}
          </div>
        );
      }
      
      return null;
    });
  };

  const formattedContent = formatContent(content);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Single unified response box */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        {/* Header with verse reference if available */}
        {verseReference && (
          <div className="bg-orange-500 text-white px-4 py-3 text-center font-semibold">
            <span className="text-orange-200">✦</span> {verseReference.toUpperCase()}
          </div>
        )}
        
        {/* Main content area */}
        <div className="p-6">
          <div className="prose prose-gray max-w-none">
            {renderFormattedContent(formattedContent)}
          </div>
        </div>
      </div>
    </motion.div>
  );
}); 