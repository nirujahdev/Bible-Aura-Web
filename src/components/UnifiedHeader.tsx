import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

interface UnifiedHeaderProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  children?: ReactNode;
}

export function UnifiedHeader({ icon: Icon, title, subtitle, children }: UnifiedHeaderProps) {
  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-3 sm:py-4 h-14 sm:h-16 flex items-center">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 sm:h-10 sm:w-10 flex items-center justify-center bg-orange-500 text-white rounded-lg shadow-sm">
              <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900">{title}</h1>
              <p className="text-xs text-gray-600 hidden sm:block">{subtitle}</p>
            </div>
          </div>
          {children && (
            <div className="hidden md:flex items-center">
              {children}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 