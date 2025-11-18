// Chat Panel - Center panel in notebook view
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  getChatMessages, 
  createChatMessage, 
  type ChatMessage 
} from '@/lib/research-lab/db-operations';
import { Send, Upload, ArrowUp, FlaskConical, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

// Message type from db-operations (ChatMessage)
type Message = ChatMessage;

interface ChatPanelProps {
  notebookId: string;
}

export function ChatPanel({ notebookId }: ChatPanelProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (notebookId && user) {
      loadMessages();
    }
  }, [notebookId, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadMessages = async () => {
    if (!notebookId || !user) return;

    try {
      const { data, error } = await getChatMessages(notebookId, user.id);
      if (error) throw error;
      setMessages(data || []);
    } catch (error: any) {
      console.error('Error loading messages:', error);
      // Only show error if it's not a table missing error (to avoid spam)
      const errorMessage = error?.message || String(error) || '';
      const isTableMissing = 
        errorMessage.includes('relation') && errorMessage.includes('does not exist') ||
        errorMessage.includes('PGRST116') ||
        (errorMessage.includes('JSON') && errorMessage.includes('DOCTYPE'));
      
      if (!isTableMissing) {
        // Don't show toast for initial load errors to avoid UI clutter
        // Errors will be handled at the notebook level
      }
    }
  };

  const handleSend = async () => {
    const messageText = input.trim();
    if (!messageText || loading || !user) return;

    // Add user message to UI
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      created_at: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Save user message
      const { data: savedMessage, error: saveError } = await createChatMessage({
        notebook_id: notebookId,
        user_id: user.id,
        role: 'user',
        content: messageText,
      });

      if (saveError) throw saveError;

      // TODO: Call GLM-4.5-Air API for response
      // For now, show placeholder response
      await new Promise(resolve => setTimeout(resolve, 1000));

      const aiResponse = 'This is a placeholder response. GLM-4.5-Air integration will be implemented in the next phase.';

      // Save AI message
      const { data: aiMessage, error: aiError } = await createChatMessage({
        notebook_id: notebookId,
        user_id: user.id,
        role: 'assistant',
        content: aiResponse,
      });

      if (aiError) throw aiError;

      if (aiMessage) {
        setMessages(prev => [...prev, aiMessage]);
      }
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat Messages */}
      <ScrollArea className="flex-1 p-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mb-4">
              <MessageSquare className="h-8 w-8 text-orange-600" />
            </div>
            <p className="text-gray-600 font-medium mb-2">Add a source to get started</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload a source
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={message.id}
                className={cn(
                  'flex animate-in fade-in slide-in-from-bottom-2 duration-300',
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div
                  className={cn(
                    'max-w-[80%] rounded-lg px-4 py-3 transition-all duration-200',
                    message.role === 'user'
                      ? 'bg-orange-500 text-white shadow-sm hover:shadow-md'
                      : 'bg-gray-100 text-gray-900 shadow-sm hover:shadow-md'
                  )}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  {message.sources_used && message.sources_used.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <p className="text-xs text-gray-500">
                        Sources: {message.sources_used.length}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2">
                <div className="bg-gray-100 rounded-lg px-4 py-3 shadow-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t border-gray-200 p-4 bg-white">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask about your sources..."
            className="min-h-[60px] resize-none"
            disabled={loading}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="bg-orange-500 hover:bg-orange-600 text-white self-end"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          {messages.length === 0 ? '0 sources' : `${messages.length} messages`}
        </p>
      </div>
    </div>
  );
}

