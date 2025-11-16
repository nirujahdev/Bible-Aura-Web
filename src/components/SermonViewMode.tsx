import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, Plus, ChevronLeft, ChevronRight, StickyNote } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StickyNote {
  id: string;
  content: string;
  position?: { x: number; y: number };
}

interface SermonViewModeProps {
  sermon: {
    title?: string;
    content?: string | null;
    scripture_reference?: string | null;
    sermon_date?: string | null;
    congregation?: string | null;
  };
  onClose: () => void;
  stickyNotes?: StickyNote[];
  onUpdateStickyNotes?: (notes: StickyNote[]) => void;
}

export function SermonViewMode({ 
  sermon, 
  onClose,
  stickyNotes: initialStickyNotes = [],
  onUpdateStickyNotes
}: SermonViewModeProps) {
  const [stickyNotes, setStickyNotes] = useState<StickyNote[]>(initialStickyNotes);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState('');
  const contentRef = useRef<HTMLDivElement>(null);

  // Strip HTML tags for display
  const stripHtml = (html: string) => {
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  const sermonText = sermon.content ? stripHtml(sermon.content) : '';
  const sections = sermonText.split(/\n\s*\n/).filter(s => s.trim());

  const addStickyNote = () => {
    if (!newNoteContent.trim()) return;
    
    const newNote: StickyNote = {
      id: Date.now().toString(),
      content: newNoteContent.trim()
    };
    
    const updatedNotes = [...stickyNotes, newNote];
    setStickyNotes(updatedNotes);
    if (onUpdateStickyNotes) {
      onUpdateStickyNotes(updatedNotes);
    }
    
    setNewNoteContent('');
    setIsAddingNote(false);
  };

  const removeStickyNote = (id: string) => {
    const updatedNotes = stickyNotes.filter(note => note.id !== id);
    setStickyNotes(updatedNotes);
    if (onUpdateStickyNotes) {
      onUpdateStickyNotes(updatedNotes);
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="bg-gray-900 text-white px-4 py-3 flex items-center justify-between border-b border-gray-800">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-white hover:bg-gray-800"
          >
            <X className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">{sermon.title || 'Untitled Sermon'}</h1>
            {sermon.scripture_reference && (
              <p className="text-sm text-gray-400">{sermon.scripture_reference}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsAddingNote(true)}
            className="text-white hover:bg-gray-800"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Note
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sermon Content - Centered */}
        <div className="flex-1 flex items-center justify-center p-8 overflow-y-auto">
          <ScrollArea className="w-full max-w-4xl">
            <div
              ref={contentRef}
              className="text-center space-y-8"
              style={{
                fontSize: '24px',
                lineHeight: '1.8',
                color: '#ffffff'
              }}
            >
              {sections.map((section, index) => (
                <div key={index} className="mb-8">
                  <p className="whitespace-pre-wrap">{section}</p>
                </div>
              ))}
              {sections.length === 0 && (
                <p className="text-gray-500">No content available</p>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Sticky Notes Sidebar */}
        <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
          <div className="p-4 border-b border-gray-700">
            <h2 className="text-white font-semibold flex items-center gap-2">
              <StickyNote className="h-4 w-4" />
              Notes
            </h2>
          </div>
          
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-3">
              {isAddingNote ? (
                <Card className="bg-gray-700 border-gray-600">
                  <CardContent className="p-3">
                    <Textarea
                      value={newNoteContent}
                      onChange={(e) => setNewNoteContent(e.target.value)}
                      placeholder="Add a note..."
                      className="bg-gray-800 text-white border-gray-600 min-h-[100px] resize-none"
                      autoFocus
                    />
                    <div className="flex gap-2 mt-2">
                      <Button
                        size="sm"
                        onClick={addStickyNote}
                        className="bg-orange-600 hover:bg-orange-700"
                      >
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setIsAddingNote(false);
                          setNewNoteContent('');
                        }}
                        className="text-white hover:bg-gray-600"
                      >
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : null}

              {stickyNotes.map((note) => (
                <Card key={note.id} className="bg-yellow-100 border-yellow-300">
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm text-gray-800 flex-1 whitespace-pre-wrap">
                        {note.content}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeStickyNote(note.id)}
                        className="h-6 w-6 p-0 text-gray-600 hover:text-red-600"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {stickyNotes.length === 0 && !isAddingNote && (
                <div className="text-center py-8 text-gray-400">
                  <StickyNote className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No notes yet</p>
                  <p className="text-xs mt-1">Click "Add Note" to create one</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}

