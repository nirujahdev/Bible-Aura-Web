import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { X, Plus, GripVertical, Edit2, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StickyNote {
  id: string;
  content: string;
  position: { x: number; y: number };
  width?: number;
  height?: number;
  color?: string;
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
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [draggingNote, setDraggingNote] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [newNotePosition, setNewNotePosition] = useState<{ x: number; y: number } | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const noteColors = ['bg-yellow-100', 'bg-blue-100', 'bg-green-100', 'bg-pink-100', 'bg-purple-100'];

  // Strip HTML tags for display
  const stripHtml = (html: string) => {
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  const sermonText = sermon.content ? stripHtml(sermon.content) : '';
  const sections = sermonText.split(/\n\s*\n/).filter(s => s.trim());

  const updateNotes = useCallback((updatedNotes: StickyNote[]) => {
    setStickyNotes(updatedNotes);
    if (onUpdateStickyNotes) {
      onUpdateStickyNotes(updatedNotes);
    }
  }, [onUpdateStickyNotes]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Don't add note if clicking on an existing note
    if ((e.target as HTMLElement).closest('.sticky-note')) {
      return;
    }

    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      setNewNotePosition({ x, y });
      setIsAddingNote(true);
    }
  };

  const addStickyNote = () => {
    if (!newNotePosition) return;
    
    const newNote: StickyNote = {
      id: Date.now().toString(),
      content: '',
      position: newNotePosition,
      width: 200,
      height: 150,
      color: noteColors[Math.floor(Math.random() * noteColors.length)]
    };
    
    const updatedNotes = [...stickyNotes, newNote];
    updateNotes(updatedNotes);
    
    setEditingNote(newNote.id);
    setNewNotePosition(null);
    setIsAddingNote(false);
  };

  const removeStickyNote = (id: string) => {
    const updatedNotes = stickyNotes.filter(note => note.id !== id);
    updateNotes(updatedNotes);
    if (editingNote === id) {
      setEditingNote(null);
    }
  };

  const updateNoteContent = (id: string, content: string) => {
    const updatedNotes = stickyNotes.map(note => 
      note.id === id ? { ...note, content } : note
    );
    updateNotes(updatedNotes);
  };

  const handleNoteMouseDown = (e: React.MouseEvent, noteId: string) => {
    e.stopPropagation();
    if (e.target instanceof HTMLElement && (
      e.target.closest('textarea') || 
      e.target.closest('button') ||
      e.target.closest('.grip-handle')
    )) {
      return; // Don't drag if clicking on textarea or button
    }

    const note = stickyNotes.find(n => n.id === noteId);
    if (!note) return;

    setDraggingNote(noteId);
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!draggingNote || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - dragOffset.x;
    const y = e.clientY - rect.top - dragOffset.y;

    // Constrain to canvas bounds
    const constrainedX = Math.max(0, Math.min(x, rect.width - 200));
    const constrainedY = Math.max(0, Math.min(y, rect.height - 150));

    const updatedNotes = stickyNotes.map(note =>
      note.id === draggingNote
        ? { ...note, position: { x: constrainedX, y: constrainedY } }
        : note
    );
    setStickyNotes(updatedNotes);
  }, [draggingNote, dragOffset, stickyNotes]);

  const handleMouseUp = useCallback(() => {
    if (draggingNote) {
      updateNotes(stickyNotes);
      setDraggingNote(null);
    }
  }, [draggingNote, stickyNotes, updateNotes]);

  useEffect(() => {
    if (draggingNote) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [draggingNote, handleMouseMove, handleMouseUp]);

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-700 hover:bg-gray-100"
          >
            <X className="h-4 w-4 mr-2" />
            Close View
          </Button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{sermon.title || 'Untitled Sermon'}</h1>
            {sermon.scripture_reference && (
              <p className="text-sm text-gray-500">{sermon.scripture_reference}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAddingNote(true)}
            className="text-gray-700 border-gray-300 hover:bg-gray-50"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Note
          </Button>
        </div>
      </div>

      {/* Interactive Canvas */}
      <div 
        ref={canvasRef}
        className="flex-1 relative overflow-auto bg-white cursor-crosshair"
        onClick={handleCanvasClick}
        style={{ cursor: isAddingNote ? 'crosshair' : 'default' }}
      >
        {/* Sermon Content - Centered */}
        <div className="absolute inset-0 flex items-center justify-center p-8 pointer-events-none">
          <div className="max-w-4xl w-full">
            <div
              className="text-center space-y-8 pointer-events-auto"
              style={{
                fontSize: '24px',
                lineHeight: '1.8',
                color: '#1f2937'
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
          </div>
        </div>

        {/* Sticky Notes - Positioned absolutely */}
        {stickyNotes.map((note) => {
          const isEditing = editingNote === note.id;
          const isDragging = draggingNote === note.id;
          
          return (
            <div
              key={note.id}
              className={cn(
                "sticky-note absolute border-2 rounded-lg shadow-lg p-3 cursor-move transition-shadow",
                note.color || 'bg-yellow-100',
                isDragging ? 'shadow-2xl z-50' : 'z-40',
                isEditing ? 'border-orange-400' : 'border-gray-300'
              )}
              style={{
                left: `${note.position.x}px`,
                top: `${note.position.y}px`,
                width: note.width || 200,
                minHeight: note.height || 150,
              }}
              onMouseDown={(e) => handleNoteMouseDown(e, note.id)}
            >
              {/* Grip Handle */}
              <div className="grip-handle flex items-center justify-between mb-2 pb-2 border-b border-gray-300">
                <GripVertical className="h-4 w-4 text-gray-400 cursor-grab active:cursor-grabbing" />
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingNote(isEditing ? null : note.id);
                    }}
                    className="h-6 w-6 p-0 text-gray-600 hover:text-blue-600"
                  >
                    <Edit2 className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeStickyNote(note.id);
                    }}
                    className="h-6 w-6 p-0 text-gray-600 hover:text-red-600"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {/* Note Content */}
              {isEditing ? (
                <Textarea
                  value={note.content}
                  onChange={(e) => updateNoteContent(note.id, e.target.value)}
                  onBlur={() => {
                    // Keep editing until user clicks outside or saves
                    setTimeout(() => {
                      if (document.activeElement !== document.querySelector(`textarea[data-note-id="${note.id}"]`)) {
                        setEditingNote(null);
                      }
                    }, 200);
                  }}
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                  className="w-full min-h-[100px] resize-none border-0 focus:ring-2 focus:ring-orange-400 bg-transparent text-gray-800"
                  placeholder="Write your note here..."
                  autoFocus
                  data-note-id={note.id}
                />
              ) : (
                <div
                  className="text-sm text-gray-800 whitespace-pre-wrap cursor-text min-h-[100px]"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingNote(note.id);
                  }}
                >
                  {note.content || <span className="text-gray-400 italic">Click to edit...</span>}
                </div>
              )}
            </div>
          );
        })}

        {/* New Note Placeholder */}
        {isAddingNote && newNotePosition && (
          <div
            className="absolute border-2 border-dashed border-orange-400 rounded-lg bg-orange-50 p-3 z-50"
            style={{
              left: `${newNotePosition.x}px`,
              top: `${newNotePosition.y}px`,
              width: 200,
              minHeight: 150,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <Textarea
              autoFocus
              placeholder="Write your note here..."
              className="w-full min-h-[100px] resize-none border-0 focus:ring-2 focus:ring-orange-400 bg-transparent"
              onBlur={(e) => {
                const content = e.target.value.trim();
                if (content) {
                  const newNote: StickyNote = {
                    id: Date.now().toString(),
                    content,
                    position: newNotePosition,
                    width: 200,
                    height: 150,
                    color: noteColors[Math.floor(Math.random() * noteColors.length)]
                  };
                  updateNotes([...stickyNotes, newNote]);
                }
                setIsAddingNote(false);
                setNewNotePosition(null);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setIsAddingNote(false);
                  setNewNotePosition(null);
                }
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
