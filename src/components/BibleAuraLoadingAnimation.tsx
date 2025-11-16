// ✦ Bible Aura Loading Animation Component
// Beautiful animated loading indicator for AI responses

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LoadingAnimationProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
}

export function BibleAuraLoadingAnimation({ 
  message = 'Thinking...', 
  size = 'medium' 
}: LoadingAnimationProps) {
  
  const sizes = {
    small: { star: 'text-2xl', container: 'h-16' },
    medium: { star: 'text-4xl', container: 'h-24' },
    large: { star: 'text-6xl', container: 'h-32' }
  };

  return (
    <div className={`flex flex-col items-center justify-center ${sizes[size].container} gap-3`}>
      {/* Animated ✦ Star */}
      <motion.div
        className={`${sizes[size].star} font-bold`}
        style={{ color: '#f97316' }} // Orange color
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 180, 360],
          opacity: [0.6, 1, 0.6],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        ✦
      </motion.div>

      {/* Loading Message */}
      <motion.p
        className="text-sm text-gray-600 font-medium"
        animate={{
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        {message}
      </motion.p>

      {/* Animated Dots */}
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full bg-orange-500"
            animate={{
              y: [0, -8, 0],
              opacity: [0.3, 1, 0.3],
            }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: i * 0.15,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>
    </div>
  );
}

// Rotating thinking messages - changes every 2 seconds
const THINKING_MESSAGES = [
  "Searching through scripture...",
  "Analyzing verses...",
  "Writing response...",
  "Gathering insights...",
  "Connecting references...",
  "Formulating answer..."
];

// Hook for rotating messages
function useRotatingMessage(messages: string[], interval: number = 2000) {
  const [currentIndex, setCurrentIndex] = React.useState(0);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % messages.length);
    }, interval);

    return () => clearInterval(timer);
  }, [messages.length, interval]);

  return messages[currentIndex];
}

// Inline compact version for chat messages with rotating animations
export function InlineLoadingIndicator() {
  const currentMessage = useRotatingMessage(THINKING_MESSAGES, 2000);

  return (
    <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 rounded-lg">
      <motion.span
        className="text-xl text-orange-500 font-bold"
        animate={{
          rotate: [0, 360],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        ✦
      </motion.span>
      <AnimatePresence mode="wait">
        <motion.span
          key={currentMessage}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.3 }}
          className="text-sm text-gray-600"
        >
          {currentMessage}
        </motion.span>
      </AnimatePresence>
      <div className="flex gap-1 ml-1">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-orange-500"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.4, 1, 0.4],
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
      </div>
    </div>
  );
}

// Inline rotating thinking message component (for use in chat bubbles)
export function RotatingThinkingMessageInline() {
  const currentMessage = useRotatingMessage(THINKING_MESSAGES, 2000);

  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={currentMessage}
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -5 }}
        transition={{ duration: 0.3 }}
        className="text-sm text-gray-600"
      >
        {currentMessage}
      </motion.span>
    </AnimatePresence>
  );
}

// Pulsing ✦ for small spaces
export function PulsingStarLoader() {
  return (
    <motion.span
      className="inline-block text-orange-500 text-2xl font-bold"
      animate={{
        scale: [1, 1.3, 1],
        opacity: [0.5, 1, 0.5],
      }}
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      ✦
    </motion.span>
  );
}

