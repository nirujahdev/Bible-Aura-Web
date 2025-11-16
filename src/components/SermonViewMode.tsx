import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { X, Plus, GripVertical, Edit2, Trash2, Highlighter, Underline, StickyNote, Palette, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface StickyNote {
  id: string;
  content: string;
  position: { x: number; y: number };
  width?: number;
  height?: number;
  color?: string;
}

interface Highlight {
  id: string;
  startOffset: number;
  endOffset: number;
  color: string;
  text: string;
}

interface Underline {
  id: string;
  startOffset: number;
  endOffset: number;
  color: string;
  text: string;
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

const NOTE_COLORS = [
  { name: 'Yellow', class: 'bg-yellow-100', border: 'border-yellow-300', dot: 'bg-yellow-400' },
  { name: 'Blue', class: 'bg-blue-100', border: 'border-blue-300', dot: 'bg-blue-400' },
  { name: 'Green', class: 'bg-green-100', border: 'border-green-300', dot: 'bg-green-400' },
  { name: 'Pink', class: 'bg-pink-100', border: 'border-pink-300', dot: 'bg-pink-400' },
  { name: 'Purple', class: 'bg-purple-100', border: 'border-purple-300', dot: 'bg-purple-400' },
  { name: 'Orange', class: 'bg-orange-100', border: 'border-orange-300', dot: 'bg-orange-400' },
];

const HIGHLIGHT_COLORS = [
  { name: 'Yellow', class: 'bg-yellow-200', dot: 'bg-yellow-400' },
  { name: 'Green', class: 'bg-green-200', dot: 'bg-green-400' },
  { name: 'Blue', class: 'bg-blue-200', dot: 'bg-blue-400' },
  { name: 'Pink', class: 'bg-pink-200', dot: 'bg-pink-400' },
  { name: 'Orange', class: 'bg-orange-200', dot: 'bg-orange-400' },
];

const UNDERLINE_COLORS = [
  { name: 'Red', class: 'border-red-400', dot: 'bg-red-400' },
  { name: 'Blue', class: 'border-blue-400', dot: 'bg-blue-400' },
  { name: 'Green', class: 'border-green-400', dot: 'bg-green-400' },
  { name: 'Purple', class: 'border-purple-400', dot: 'bg-purple-400' },
  { name: 'Orange', class: 'border-orange-400', dot: 'bg-orange-400' },
];

export function SermonViewMode({ 
  sermon, 
  onClose,
  stickyNotes: initialStickyNotes = [],
  onUpdateStickyNotes
}: SermonViewModeProps) {
  const [stickyNotes, setStickyNotes] = useState<StickyNote[]>(initialStickyNotes);
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [underlines, setUnderlines] = useState<Underline[]>([]);
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [draggingNote, setDraggingNote] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [newNotePosition, setNewNotePosition] = useState<{ x: number; y: number } | null>(null);
  const [selectedNoteColor, setSelectedNoteColor] = useState(NOTE_COLORS[0]);
  const [selectedHighlightColor, setSelectedHighlightColor] = useState(HIGHLIGHT_COLORS[0]);
  const [selectedUnderlineColor, setSelectedUnderlineColor] = useState(UNDERLINE_COLORS[0]);
  const [activeTool, setActiveTool] = useState<'note' | 'highlight' | 'underline' | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const canvasRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

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

  const handleHighlight = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.toString().trim() === '') {
      return;
    }

    const range = selection.getRangeAt(0);
    const text = selection.toString();
    
    if (contentRef.current && contentRef.current.contains(range.commonAncestorContainer)) {
      const newHighlight: Highlight = {
        id: Date.now().toString(),
        startOffset: 0, // Simplified - would need proper offset calculation
        endOffset: text.length,
        color: selectedHighlightColor.class,
        text: text
      };
      setHighlights([...highlights, newHighlight]);
      selection.removeAllRanges();
      setActiveTool(null);
    }
  };

  const handleUnderline = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.toString().trim() === '') {
      return;
    }

    const range = selection.getRangeAt(0);
    const text = selection.toString();
    
    if (contentRef.current && contentRef.current.contains(range.commonAncestorContainer)) {
      const newUnderline: Underline = {
        id: Date.now().toString(),
        startOffset: 0,
        endOffset: text.length,
        color: selectedUnderlineColor.class,
        text: text
      };
      setUnderlines([...underlines, newUnderline]);
      selection.removeAllRanges();
      setActiveTool(null);
    }
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('.sticky-note') || 
        (e.target as HTMLElement).closest('.content-box')) {
      return;
    }

    if (activeTool === 'note' && isAddingNote) {
      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const constrainedX = Math.max(10, Math.min(x - 100, rect.width - 210));
        const constrainedY = Math.max(10, Math.min(y - 75, rect.height - 160));
        
        setNewNotePosition({ x: constrainedX, y: constrainedY });
      }
    } else if (activeTool === 'highlight') {
      handleHighlight();
    } else if (activeTool === 'underline') {
      handleUnderline();
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
      color: selectedNoteColor.class
    };
    
    updateNotes([...stickyNotes, newNote]);
    setEditingNote(newNote.id);
    setNewNotePosition(null);
    setIsAddingNote(false);
    setActiveTool(null);
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
      return;
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
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-700 hover:bg-gray-100"
          >
            {sidebarOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Canvas */}
        <div 
          ref={canvasRef}
          className={cn(
            "flex-1 relative overflow-auto bg-gray-50 transition-all",
            activeTool === 'note' && isAddingNote && "cursor-crosshair",
            activeTool === 'highlight' && "cursor-text"
          )}
          onClick={handleCanvasClick}
        >
          {/* Content Box - Red Border */}
          <div className="absolute inset-0 flex items-start justify-center p-8">
            <div 
              ref={contentRef}
              className="content-box w-full max-w-4xl bg-white border-4 border-red-500 rounded-lg shadow-lg overflow-hidden"
              style={{ minHeight: '80vh' }}
            >
              <ScrollArea className="h-full max-h-[80vh]">
                <div className="p-8">
                  <div
                    className="space-y-8"
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
                      <p className="text-gray-500 text-center">No content available</p>
                    )}
                  </div>
                </div>
              </ScrollArea>
            </div>
          </div>

          {/* Sticky Notes */}
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

                {isEditing ? (
                  <Textarea
                    value={note.content}
                    onChange={(e) => updateNoteContent(note.id, e.target.value)}
                    onBlur={() => {
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
              className="absolute border-2 border-dashed border-orange-400 rounded-lg bg-orange-50 p-3 z-50 shadow-lg"
              style={{
                left: `${newNotePosition.x}px`,
                top: `${newNotePosition.y}px`,
                width: 200,
                minHeight: 150,
              }}
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <Textarea
                autoFocus
                placeholder="Write your note here..."
                className="w-full min-h-[100px] resize-none border-0 focus:ring-2 focus:ring-orange-400 bg-transparent text-gray-800"
                onBlur={(e) => {
                  const content = e.target.value.trim();
                  if (content) {
                    const newNote: StickyNote = {
                      id: Date.now().toString(),
                      content,
                      position: newNotePosition,
                      width: 200,
                      height: 150,
                      color: selectedNoteColor.class
                    };
                    updateNotes([...stickyNotes, newNote]);
                  }
                  setIsAddingNote(false);
                  setNewNotePosition(null);
                  setActiveTool(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    setIsAddingNote(false);
                    setNewNotePosition(null);
                    setActiveTool(null);
                  }
                }}
              />
            </div>
          )}
        </div>

        {/* Annotation Sidebar */}
        {sidebarOpen && (
          <div className="w-80 bg-white border-l border-gray-200 flex flex-col shadow-lg">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Annotation Tools</h2>
            </div>
            
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-6">
                {/* Sticky Notes */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <StickyNote className="h-5 w-5 text-orange-600" />
                    <h3 className="font-semibold text-gray-800">Sticky Notes</h3>
                  </div>
                  <Button
                    variant={activeTool === 'note' ? "default" : "outline"}
                    size="sm"
                    className="w-full mb-3"
                    onClick={() => {
                      setActiveTool(activeTool === 'note' ? null : 'note');
                      setIsAddingNote(activeTool !== 'note');
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {activeTool === 'note' ? 'Cancel' : 'Add Note'}
                  </Button>
                  <div className="space-y-2">
                    <p className="text-xs text-gray-600 mb-2">Note Color:</p>
                    <div className="grid grid-cols-3 gap-2">
                      {NOTE_COLORS.map((color) => (
                        <button
                          key={color.name}
                          onClick={() => setSelectedNoteColor(color)}
                          className={cn(
                            "h-10 rounded border-2 transition-all",
                            color.border,
                            selectedNoteColor.name === color.name && "ring-2 ring-orange-500 ring-offset-2"
                          )}
                        >
                          <div className={cn("w-full h-full rounded", color.class)} />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Highlight */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Highlighter className="h-5 w-5 text-yellow-600" />
                    <h3 className="font-semibold text-gray-800">Highlight</h3>
                  </div>
                  <Button
                    variant={activeTool === 'highlight' ? "default" : "outline"}
                    size="sm"
                    className="w-full mb-3"
                    onClick={() => setActiveTool(activeTool === 'highlight' ? null : 'highlight')}
                  >
                    <Highlighter className="h-4 w-4 mr-2" />
                    {activeTool === 'highlight' ? 'Cancel' : 'Select Text to Highlight'}
                  </Button>
                  <div className="space-y-2">
                    <p className="text-xs text-gray-600 mb-2">Highlight Color:</p>
                    <div className="grid grid-cols-3 gap-2">
                      {HIGHLIGHT_COLORS.map((color) => (
                        <button
                          key={color.name}
                          onClick={() => setSelectedHighlightColor(color)}
                          className={cn(
                            "h-10 rounded border-2 transition-all",
                            color.class,
                            selectedHighlightColor.name === color.name && "ring-2 ring-orange-500 ring-offset-2"
                          )}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Underline */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Underline className="h-5 w-5 text-blue-600" />
                    <h3 className="font-semibold text-gray-800">Underline</h3>
                  </div>
                  <Button
                    variant={activeTool === 'underline' ? "default" : "outline"}
                    size="sm"
                    className="w-full mb-3"
                    onClick={() => setActiveTool(activeTool === 'underline' ? null : 'underline')}
                  >
                    <Underline className="h-4 w-4 mr-2" />
                    {activeTool === 'underline' ? 'Cancel' : 'Select Text to Underline'}
                  </Button>
                  <div className="space-y-2">
                    <p className="text-xs text-gray-600 mb-2">Underline Color:</p>
                    <div className="grid grid-cols-3 gap-2">
                      {UNDERLINE_COLORS.map((color) => (
                        <button
                          key={color.name}
                          onClick={() => setSelectedUnderlineColor(color)}
                          className={cn(
                            "h-10 rounded border-2 transition-all",
                            color.class,
                            selectedUnderlineColor.name === color.name && "ring-2 ring-orange-500 ring-offset-2"
                          )}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </div>
        )}
      </div>
    </div>
  );
}
