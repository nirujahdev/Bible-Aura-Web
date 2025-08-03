import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronLeft, ChevronRight, BookOpen, Check } from 'lucide-react';

interface CalendarChapterSelectorProps {
  bookName: string;
  totalChapters: number;
  currentChapter: number;
  completedChapters?: number[];
  onChapterSelect: (chapter: number) => void;
  onClose?: () => void;
}

export function CalendarChapterSelector({
  bookName,
  totalChapters,
  currentChapter,
  completedChapters = [],
  onChapterSelect,
  onClose
}: CalendarChapterSelectorProps) {
  const [currentPage, setCurrentPage] = useState(Math.ceil(currentChapter / 24));
  const chaptersPerPage = 24; // 6 columns x 4 rows
  const totalPages = Math.ceil(totalChapters / chaptersPerPage);

  const getChaptersForPage = (page: number) => {
    const startChapter = (page - 1) * chaptersPerPage + 1;
    const endChapter = Math.min(page * chaptersPerPage, totalChapters);
    return Array.from({ length: endChapter - startChapter + 1 }, (_, i) => startChapter + i);
  };

  const getChapterStatus = (chapter: number) => {
    if (completedChapters.includes(chapter)) return 'completed';
    if (chapter === currentChapter) return 'current';
    if (chapter < currentChapter) return 'past';
    return 'future';
  };

  const getChapterStyles = (chapter: number) => {
    const status = getChapterStatus(chapter);
    
    switch (status) {
      case 'completed':
        return 'bg-green-600 text-white hover:bg-green-700 border-green-600';
      case 'current':
        return 'bg-orange-600 text-white hover:bg-orange-700 border-orange-600 ring-2 ring-orange-200';
      case 'past':
        return 'bg-gray-200 text-gray-700 hover:bg-gray-300 border-gray-300';
      default:
        return 'bg-white text-gray-700 hover:bg-gray-50 border-gray-200';
    }
  };

  const handleChapterClick = (chapter: number) => {
    onChapterSelect(chapter);
    onClose?.();
  };

  const navigatePage = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    } else if (direction === 'next' && currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const chapters = getChaptersForPage(currentPage);

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-orange-600" />
            <div>
              <CardTitle className="text-xl text-gray-800">{bookName}</CardTitle>
              <p className="text-sm text-gray-600 mt-1">Select a chapter to read</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {totalChapters} chapters
            </Badge>
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose}>
                ✕
              </Button>
            )}
          </div>
        </div>
        
        {/* Page Navigation */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigatePage('prev')}
              disabled={currentPage === 1}
              className="flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigatePage('next')}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        {/* Chapter Grid */}
        <div className="grid grid-cols-6 gap-3">
          {chapters.map((chapter) => (
            <Button
              key={chapter}
              variant="outline"
              className={`h-12 w-full text-sm font-semibold relative transition-all duration-200 ${getChapterStyles(chapter)}`}
              onClick={() => handleChapterClick(chapter)}
            >
              {chapter}
              {completedChapters.includes(chapter) && (
                <Check className="w-3 h-3 absolute top-1 right-1" />
              )}
            </Button>
          ))}
        </div>
        
        {/* Legend */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-600 rounded border"></div>
              <span className="text-gray-600">Completed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-600 rounded border ring-2 ring-orange-200"></div>
              <span className="text-gray-600">Current</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-200 rounded border"></div>
              <span className="text-gray-600">Read</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-white rounded border border-gray-200"></div>
              <span className="text-gray-600">Unread</span>
            </div>
          </div>
        </div>
        
        {/* Quick Navigation */}
        <div className="mt-4 flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleChapterClick(1)}
            disabled={currentChapter === 1}
          >
            First Chapter
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleChapterClick(totalChapters)}
            disabled={currentChapter === totalChapters}
          >
            Last Chapter
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default CalendarChapterSelector; 