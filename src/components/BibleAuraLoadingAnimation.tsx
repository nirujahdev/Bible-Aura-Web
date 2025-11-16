// ✦ Bible Aura Loading Animation Component
// Beautiful animated loading indicator for AI responses

import { motion } from 'framer-motion';

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

// Inline compact version for chat messages
export function InlineLoadingIndicator() {
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
      <span className="text-sm text-gray-600">Bible Aura is thinking</span>
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

