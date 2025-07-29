import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

// Base skeleton components
export function SkeletonText({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <Skeleton className={cn("h-4 w-full", className)} {...props} />;
}

export function SkeletonTitle({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <Skeleton className={cn("h-6 w-3/4", className)} {...props} />;
}

export function SkeletonButton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <Skeleton className={cn("h-10 w-24", className)} {...props} />;
}

export function SkeletonAvatar({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <Skeleton className={cn("h-12 w-12 rounded-full", className)} {...props} />;
}

export function SkeletonIcon({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <Skeleton className={cn("h-5 w-5", className)} {...props} />;
}

// Widget-specific skeleton components

interface WidgetSkeletonProps {
  className?: string;
}

export function WidgetSkeleton({ className }: WidgetSkeletonProps) {
  return (
    <Card className={cn("h-full animate-pulse", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <SkeletonIcon />
          <SkeletonTitle className="w-32" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <SkeletonText />
        <SkeletonText className="w-2/3" />
        <div className="flex gap-2">
          <SkeletonButton className="flex-1" />
          <SkeletonButton className="flex-1" />
        </div>
      </CardContent>
    </Card>
  );
}

export function DailyVerseSkeletonLoad() {
  return (
    <Card className="w-full animate-pulse">
      <CardHeader className="text-center space-y-4 py-8">
        <div className="space-y-2">
          <SkeletonTitle className="h-8 w-48 mx-auto" />
          <Skeleton className="h-4 w-32 mx-auto" />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main verse skeleton */}
        <div className="text-center space-y-4 p-6 bg-gray-50 rounded-lg">
          <div className="space-y-2">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-5/6 mx-auto" />
            <Skeleton className="h-6 w-4/6 mx-auto" />
          </div>
          <Skeleton className="h-5 w-40 mx-auto" />
        </div>
        
        {/* AI context skeleton */}
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        
        {/* Action buttons skeleton */}
        <div className="flex gap-2">
          <SkeletonButton className="flex-1" />
          <SkeletonButton className="flex-1" />
          <SkeletonButton className="flex-1" />
        </div>
      </CardContent>
    </Card>
  );
}

export function BibleStudySkeletonLoad() {
  return (
    <Card className="h-full animate-pulse border-blue-200 bg-blue-50/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <SkeletonIcon />
          <SkeletonTitle className="w-28" />
          <Skeleton className="h-6 w-16 ml-auto rounded-full" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick stats skeleton */}
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-3 bg-white/60 rounded-lg space-y-1">
            <Skeleton className="h-6 w-8 mx-auto" />
            <Skeleton className="h-3 w-12 mx-auto" />
          </div>
          <div className="text-center p-3 bg-white/60 rounded-lg space-y-1">
            <Skeleton className="h-6 w-8 mx-auto" />
            <Skeleton className="h-3 w-12 mx-auto" />
          </div>
        </div>
        
        {/* Recent bookmarks skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <div className="space-y-2">
            <div className="p-2 bg-white/60 rounded-lg space-y-1">
              <Skeleton className="h-3 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <div className="p-2 bg-white/60 rounded-lg space-y-1">
              <Skeleton className="h-3 w-5/6" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          </div>
        </div>
        
        <SkeletonButton className="w-full" />
      </CardContent>
    </Card>
  );
}

export function AIChatSkeletonLoad() {
  return (
    <Card className="h-full animate-pulse border-purple-200 bg-purple-50/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <SkeletonIcon />
          <SkeletonTitle className="w-24" />
          <Skeleton className="h-6 w-20 ml-auto rounded-full" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick stats skeleton */}
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-3 bg-white/60 rounded-lg space-y-1">
            <Skeleton className="h-6 w-6 mx-auto" />
            <Skeleton className="h-3 w-16 mx-auto" />
          </div>
          <div className="text-center p-3 bg-white/60 rounded-lg space-y-1">
            <Skeleton className="h-6 w-6 mx-auto" />
            <Skeleton className="h-3 w-14 mx-auto" />
          </div>
        </div>
        
        {/* Recent conversations skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <div className="space-y-2">
            <div className="p-2 bg-white/60 rounded-lg space-y-1">
              <Skeleton className="h-3 w-3/4" />
              <Skeleton className="h-3 w-1/3" />
            </div>
            <div className="p-2 bg-white/60 rounded-lg space-y-1">
              <Skeleton className="h-3 w-5/6" />
              <Skeleton className="h-3 w-1/4" />
            </div>
          </div>
        </div>
        
        <SkeletonButton className="w-full" />
      </CardContent>
    </Card>
  );
}

export function JournalSkeletonLoad() {
  return (
    <Card className="h-full animate-pulse border-green-200 bg-green-50/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <SkeletonIcon />
          <SkeletonTitle className="w-16" />
          <Skeleton className="h-6 w-16 ml-auto rounded-full" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick stats skeleton */}
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-3 bg-white/60 rounded-lg space-y-1">
            <Skeleton className="h-6 w-6 mx-auto" />
            <Skeleton className="h-3 w-12 mx-auto" />
          </div>
          <div className="text-center p-3 bg-white/60 rounded-lg space-y-1">
            <Skeleton className="h-6 w-6 mx-auto" />
            <Skeleton className="h-3 w-16 mx-auto" />
          </div>
        </div>
        
        {/* Recent entries skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <div className="space-y-2">
            <div className="p-2 bg-white/60 rounded-lg space-y-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-4 w-12 rounded-full" />
              </div>
              <Skeleton className="h-3 w-full" />
            </div>
            <div className="p-2 bg-white/60 rounded-lg space-y-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-4 w-10 rounded-full" />
              </div>
              <Skeleton className="h-3 w-4/5" />
            </div>
          </div>
        </div>
        
        <SkeletonButton className="w-full" />
      </CardContent>
    </Card>
  );
}

export function PrayerSkeletonLoad() {
  return (
    <Card className="h-full animate-pulse border-amber-200 bg-amber-50/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <SkeletonIcon />
          <SkeletonTitle className="w-14" />
          <Skeleton className="h-6 w-12 ml-auto rounded-full" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Prayer stats skeleton */}
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center p-2 bg-white/60 rounded-lg space-y-1">
            <Skeleton className="h-5 w-5 mx-auto" />
            <Skeleton className="h-3 w-8 mx-auto" />
          </div>
          <div className="text-center p-2 bg-white/60 rounded-lg space-y-1">
            <Skeleton className="h-5 w-5 mx-auto" />
            <Skeleton className="h-3 w-10 mx-auto" />
          </div>
          <div className="text-center p-2 bg-white/60 rounded-lg space-y-1">
            <Skeleton className="h-5 w-5 mx-auto" />
            <Skeleton className="h-3 w-6 mx-auto" />
          </div>
        </div>
        
        {/* Recent prayers skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <div className="space-y-2">
            <div className="p-2 bg-white/60 rounded-lg space-y-1">
              <div className="flex items-center justify-between">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-4 w-12 rounded-full" />
              </div>
              <Skeleton className="h-3 w-3/4" />
            </div>
            <div className="p-2 bg-white/60 rounded-lg space-y-1">
              <div className="flex items-center justify-between">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-4 w-10 rounded-full" />
              </div>
              <Skeleton className="h-3 w-2/3" />
            </div>
          </div>
        </div>
        
        <SkeletonButton className="w-full" />
      </CardContent>
    </Card>
  );
}

export function ReadingProgressSkeletonLoad() {
  return (
    <Card className="h-full animate-pulse border-teal-200 bg-teal-50/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <SkeletonIcon />
          <SkeletonTitle className="w-28" />
          <Skeleton className="h-6 w-12 ml-auto rounded-full" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress stats skeleton */}
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-16" />
            </div>
            <Skeleton className="h-2 w-full rounded-full" />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-3 bg-white/60 rounded-lg space-y-1">
              <Skeleton className="h-6 w-6 mx-auto" />
              <Skeleton className="h-3 w-16 mx-auto" />
            </div>
            <div className="text-center p-3 bg-white/60 rounded-lg space-y-1">
              <Skeleton className="h-6 w-6 mx-auto" />
              <Skeleton className="h-3 w-12 mx-auto" />
            </div>
          </div>
        </div>
        
        {/* Achievement skeleton */}
        <div className="flex items-center gap-2 p-3 bg-white/60 rounded-lg">
          <Skeleton className="h-8 w-8 rounded" />
          <div className="flex-1 space-y-1">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        
        <SkeletonButton className="w-full" />
      </CardContent>
    </Card>
  );
}

// Dashboard layout skeletons
export function DashboardHeaderSkeleton() {
  return (
    <div className="bg-gradient-to-r from-primary via-primary/90 to-primary/80 text-white p-6 rounded-xl mb-8 animate-pulse">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48 bg-white/20" />
          <Skeleton className="h-5 w-64 bg-white/20" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-10 w-28 bg-white/20 rounded-lg" />
          <Skeleton className="h-10 w-20 bg-white/20 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export function DashboardStatsSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i} className="animate-pulse">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-12" />
                <Skeleton className="h-3 w-8" />
              </div>
              <Skeleton className="h-12 w-12 rounded-full" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function DashboardWidgetsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      <BibleStudySkeletonLoad />
      <AIChatSkeletonLoad />
      <JournalSkeletonLoad />
      <PrayerSkeletonLoad />
      <ReadingProgressSkeletonLoad />
      <WidgetSkeleton className="border-gray-200 bg-gray-50/50" />
    </div>
  );
} 