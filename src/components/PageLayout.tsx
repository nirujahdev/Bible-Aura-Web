import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PageLayoutProps {
  children: ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  title?: string;
  description?: string;
  showHeader?: boolean;
}

export function PageLayout({ 
  children, 
  className = '',
  maxWidth = 'xl',
  padding = 'md',
  title,
  description,
  showHeader = false
}: PageLayoutProps) {
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md', 
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    '2xl': 'max-w-7xl',
    full: 'max-w-full'
  };

  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6 lg:p-8',
    lg: 'p-8 lg:p-12'
  };

  return (
    <div className="min-h-screen bg-gray-50/30">
      <div className={cn(
        'w-full',
        maxWidth !== 'full' && 'mx-auto',
        maxWidthClasses[maxWidth],
        paddingClasses[padding],
        className
      )}>
        {showHeader && (title || description) && (
          <div className="mb-6 lg:mb-8">
            {title && (
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                {title}
              </h1>
            )}
            {description && (
              <p className="text-gray-600 text-lg">
                {description}
              </p>
            )}
          </div>
        )}
        <div className="w-full">
          {children}
        </div>
      </div>
    </div>
  );
} 