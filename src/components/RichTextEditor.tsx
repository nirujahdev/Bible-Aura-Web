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

  // Combine refs
  React.useImperativeHandle(ref, () => editorRef.current as HTMLDivElement);

  // Update editor content when value prop changes (but not from internal changes)
  useEffect(() => {
    if (editorRef.current && !isInternalChange.current) {
      const currentHtml = editorRef.current.innerHTML;
      if (currentHtml !== value) {
        const selection = window.getSelection();
        const range = selection?.rangeCount ? selection.getRangeAt(0) : null;
        const wasFocused = document.activeElement === editorRef.current;
        
        editorRef.current.innerHTML = value || '';
        
        // Restore selection if editor was focused
        if (wasFocused && range && editorRef.current.contains(range.commonAncestorContainer)) {
          try {
            selection?.removeAllRanges();
            selection?.addRange(range);
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
      const html = editorRef.current.innerHTML;
      onChange(html);
    }
  }, [onChange]);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
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

