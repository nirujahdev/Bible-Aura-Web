// Chat Panel - Center panel in notebook view - Enhanced UI
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  getChatMessages, 
  createChatMessage, 
  type ChatMessage 
} from '@/lib/research-lab/db-operations';
import { Send, Upload, ArrowUp, FlaskConical, MessageSquare, Mic } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useVoiceInput } from '@/hooks/useVoiceInput';

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
  const { 
    transcript, 
    isListening, 
    error: voiceError, 
    startListening, 
    stopListening, 
    reset: resetVoice,
    isSupported: isVoiceSupported 
  } = useVoiceInput();

  // Update input when transcript changes
  useEffect(() => {
    if (transcript) {
      setInput(prev => prev + (prev ? ' ' : '') + transcript);
      resetVoice();
    }
  }, [transcript, resetVoice]);

  // Show voice error toast
  useEffect(() => {
    if (voiceError) {
      toast({
        title: 'Voice Input Error',
        description: voiceError,
        variant: 'destructive',
      });
    }
  }, [voiceError, toast]);

  useEffect(() => {
    if (notebookId && user) {
      loadMessages();
    } else if (!user) {
      setMessages([]);
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

      // Call GLM-4.5-Air API for response
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Session expired. Please log in again.');
      }

      const response = await fetch('/api/research-lab/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          notebookId,
          message: messageText,
        }),
      });

      if (!response.ok) {
        let errorMessage = 'Failed to get AI response';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
          
          // Handle specific error cases
          if (errorData.error === 'Sources are still processing') {
            toast({
              title: 'Sources are processing',
              description: errorData.message || 'Please wait for sources to finish processing before asking questions.',
              variant: 'default',
              duration: 5000,
            });
          } else if (errorData.error === 'No sources found in notebook') {
            toast({
              title: 'No sources available',
              description: errorData.message || 'Please add sources to your notebook before asking questions.',
              variant: 'destructive',
              duration: 5000,
            });
          }
        } catch (e) {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      const aiResponse = data.message || 'No response generated';

      // Update UI with AI message (it's already saved by the API)
      const aiMessage: Message = {
        id: data.messageId || Date.now().toString(),
        role: 'assistant',
        content: aiResponse,
        created_at: new Date().toISOString(),
        sources_used: data.sourcesUsed || [],
      };

      setMessages(prev => [...prev, aiMessage]);
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
      <ScrollArea className="flex-1 p-3 sm:p-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4 animate-in fade-in duration-500">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center mb-5 shadow-lg">
              <MessageSquare className="h-8 w-8 sm:h-10 sm:w-10 text-orange-600" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Start Your Research</h3>
            <p className="text-sm sm:text-base text-gray-600 mb-4 max-w-md">
              Add sources to your notebook and ask questions about Bible, theology, or Christian content
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2 text-xs sm:text-sm border-orange-200 hover:bg-orange-50 hover:border-orange-300 transition-all duration-200"
            >
              <Upload className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
              <span className="hidden sm:inline">Upload a source</span>
              <span className="sm:hidden">Upload</span>
            </Button>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {messages.map((message, index) => (
              <div
                key={message.id}
                className={cn(
                  'flex animate-in fade-in slide-in-from-bottom-2 duration-300',
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className={cn(
                    'max-w-[85%] sm:max-w-[80%] rounded-xl px-4 py-3 sm:px-5 sm:py-4 transition-all duration-300 text-sm sm:text-base shadow-sm hover:shadow-md',
                    message.role === 'user'
                      ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white'
                      : 'bg-gradient-to-br from-gray-50 to-white text-gray-900 border border-gray-200'
                  )}
                >
                  <p className="whitespace-pre-wrap break-words leading-relaxed">{message.content}</p>
                  {message.sources_used && message.sources_used.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200/30">
                      <p className="text-xs font-medium opacity-80">
                        📚 {message.sources_used.length} source{message.sources_used.length !== 1 ? 's' : ''} used
                      </p>
                    </div>
                  )}
                </motion.div>
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

      {/* Input Area - Enhanced */}
      <div className="border-t border-gray-200 p-3 sm:p-4 bg-gradient-to-b from-white to-gray-50/50 safe-area-bottom shadow-lg">
        <div className="flex gap-2 sm:gap-3">
          <div className="relative flex-1">
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
              className="min-h-[50px] sm:min-h-[60px] resize-none text-sm pr-10"
              disabled={loading}
            />
            {isVoiceSupported && (
              <Button
                variant="ghost"
                size="sm"
                onClick={isListening ? stopListening : startListening}
                disabled={loading}
                className={`absolute right-2 bottom-2 h-8 w-8 p-0 ${
                  isListening ? 'text-red-500 animate-pulse' : 'text-gray-500'
                }`}
                title={isListening ? 'Stop recording' : 'Start voice input'}
              >
                <Mic className="h-4 w-4" />
              </Button>
            )}
          </div>
          <Button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="bg-orange-500 hover:bg-orange-600 text-white self-end p-2 sm:p-2 h-auto"
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

