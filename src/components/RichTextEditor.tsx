import React, { useRef, useEffect, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const RichTextEditor = React.forwardRef<HTMLDivElement, RichTextEditorProps>(({
  value,
  onChange,
  placeholder = 'Start writing...',
  className,
  style
}, ref) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const isInternalChange = useRef(false);
  const lastValueRef = useRef<string>('');
  const isTypingRef = useRef(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Combine refs
  React.useImperativeHandle(ref, () => editorRef.current as HTMLDivElement);

  // Update editor content when value prop changes (but not from internal changes)
  useEffect(() => {
    // Skip if this is an internal change or if user is actively typing
    if (isInternalChange.current || isTypingRef.current) {
      isInternalChange.current = false;
      return;
    }

    if (editorRef.current) {
      const currentHtml = editorRef.current.innerHTML;
      // Only update if value actually changed from external source
      if (currentHtml !== value && value !== lastValueRef.current) {
        const selection = window.getSelection();
        let savedRange: Range | null = null;
        
        // Save selection if editor is focused
        if (document.activeElement === editorRef.current && selection && selection.rangeCount > 0) {
          try {
            savedRange = selection.getRangeAt(0).cloneRange();
          } catch (e) {
            // Ignore selection errors
          }
        }
        
        editorRef.current.innerHTML = value || '';
        lastValueRef.current = value || '';
        
        // Restore selection if we saved it
        if (savedRange && selection) {
          try {
            selection.removeAllRanges();
            selection.addRange(savedRange);
          } catch (e) {
            // Ignore selection errors
          }
        }
      }
    }
    isInternalChange.current = false;
  }, [value]);

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      isInternalChange.current = true;
      isTypingRef.current = true;
      
      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Set timeout to mark typing as complete
      typingTimeoutRef.current = setTimeout(() => {
        isTypingRef.current = false;
      }, 300);
      
      const html = editorRef.current.innerHTML;
      lastValueRef.current = html;
      onChange(html);
    }
  }, [onChange]);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    isInternalChange.current = true;
    document.execCommand('insertText', false, text);
    // Trigger input event manually
    if (editorRef.current) {
      const event = new Event('input', { bubbles: true });
      editorRef.current.dispatchEvent(event);
    }
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={editorRef}
      contentEditable
      onInput={handleInput}
      onPaste={handlePaste}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      className={cn(
        'min-h-[200px] w-full outline-none',
        'prose prose-sm max-w-none',
        'focus:ring-0 focus-visible:ring-0',
        '[&:empty]:before:content-[attr(data-placeholder)] [&:empty]:before:text-gray-400 [&:empty]:before:pointer-events-none',
        '[&_h1]:text-3xl [&_h1]:font-bold [&_h1]:mt-4 [&_h1]:mb-2',
        '[&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mt-3 [&_h2]:mb-2',
        '[&_h3]:text-xl [&_h3]:font-bold [&_h3]:mt-2 [&_h3]:mb-1',
        '[&_blockquote]:border-l-4 [&_blockquote]:border-gray-300 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:my-2',
        '[&_ul]:list-disc [&_ul]:ml-6 [&_ul]:my-2',
        '[&_ol]:list-decimal [&_ol]:ml-6 [&_ol]:my-2',
        '[&_p]:my-2',
        '[&_strong]:font-bold',
        '[&_em]:italic',
        '[&_u]:underline',
        className
      )}
      data-placeholder={placeholder}
      style={style}
      suppressContentEditableWarning
      dangerouslySetInnerHTML={{ __html: value || '' }}
    />
  );
});

RichTextEditor.displayName = 'RichTextEditor';

// Export formatting functions
export const formatText = {
  bold: () => document.execCommand('bold', false),
  italic: () => document.execCommand('italic', false),
  underline: () => document.execCommand('underline', false),
  strikethrough: () => document.execCommand('strikethrough', false),
  
  heading1: () => document.execCommand('formatBlock', false, '<h1>'),
  heading2: () => document.execCommand('formatBlock', false, '<h2>'),
  heading3: () => document.execCommand('formatBlock', false, '<h3>'),
  
  alignLeft: () => document.execCommand('justifyLeft', false),
  alignCenter: () => document.execCommand('justifyCenter', false),
  alignRight: () => document.execCommand('justifyRight', false),
  alignJustify: () => document.execCommand('justifyFull', false),
  
  insertUnorderedList: () => document.execCommand('insertUnorderedList', false),
  insertOrderedList: () => document.execCommand('insertOrderedList', false),
  
  removeFormat: () => document.execCommand('removeFormat', false),
  
  foreColor: (color: string) => document.execCommand('foreColor', false, color),
  backColor: (color: string) => document.execCommand('backColor', false, color),
  
  createLink: (url: string) => {
    const selectedText = window.getSelection()?.toString();
    if (selectedText) {
      document.execCommand('createLink', false, url);
    }
  },
  
  insertText: (text: string) => document.execCommand('insertText', false, text),
};

