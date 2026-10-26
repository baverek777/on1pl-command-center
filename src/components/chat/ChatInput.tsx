import { useState, useRef, useCallback, useEffect } from 'react';
import { SendHorizontal, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChatStore } from '@/stores';
import { cn } from '@/lib/utils';
import { resolveSmartAIResponse } from '@/lib/aiEngine';

function getApiUrl(endpoint: string): string {
  const base = window.location.port === '5173' ? 'http://localhost:3001' : '';
  return `${base}${endpoint}`;
}

interface ChatInputProps {
  conversationId?: string | null;
}

export default function ChatInput({ conversationId }: ChatInputProps) {
  const [text, setText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { createConversation, addMessage, updateLastMessage, setStreaming, isStreaming, conversations } =
    useChatStore();

  const adjustTextareaHeight = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    const maxHeight = 6 * 24;
    el.style.height = `${Math.min(el.scrollHeight, maxHeight)}px`;
  }, []);

  useEffect(() => {
    adjustTextareaHeight();
  }, [text, adjustTextareaHeight]);

  const callAI = useCallback(
    async (convId: string, userMessage: string) => {
      setStreaming(true);
      setIsSending(true);

      // Add streaming placeholder
      addMessage(convId, {
        role: 'assistant',
        content: '',
        isStreaming: true,
      });

      try {
        // Build conversation history for context
        const conv = conversations.find((c) => c.id === convId);
        const history = conv
          ? conv.messages
              .filter((m) => m.role === 'user' || m.role === 'assistant')
              .filter((m) => m.content && m.content.trim() !== '')
              .slice(-10) // Last 10 messages for context
              .map((m) => ({ role: m.role, content: m.content }))
          : [{ role: 'user' as const, content: userMessage }];

        // Call backend AI endpoint
        const res = await fetch(getApiUrl('/api/chat'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: history }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.response) {
            // Simulate typing effect for better UX
            const fullText = data.response;
            const chunkSize = Math.max(3, Math.floor(fullText.length / 30));
            let currentIndex = 0;

            const typeInterval = setInterval(() => {
              currentIndex = Math.min(currentIndex + chunkSize, fullText.length);
              updateLastMessage(convId, fullText.slice(0, currentIndex));

              if (currentIndex >= fullText.length) {
                clearInterval(typeInterval);
                setStreaming(false);
                setIsSending(false);
              }
            }, 25);

            return;
          }
        }

        // If backend API is not available or returned non-ok (e.g. during deployment), use client smart AI engine
        const fallbackText = await resolveSmartAIResponse(userMessage, history);
        const chunkSize = Math.max(3, Math.floor(fallbackText.length / 30));
        let currentIndex = 0;

        const typeInterval = setInterval(() => {
          currentIndex = Math.min(currentIndex + chunkSize, fallbackText.length);
          updateLastMessage(convId, fallbackText.slice(0, currentIndex));

          if (currentIndex >= fallbackText.length) {
            clearInterval(typeInterval);
            setStreaming(false);
            setIsSending(false);
          }
        }, 20);

        return;
      } catch (err) {
        // Fallback on any network error
        try {
          const fallbackText = await resolveSmartAIResponse(userMessage);
          updateLastMessage(convId, fallbackText);
        } catch {
          updateLastMessage(convId, 'Wystąpił problem z przetworzeniem zapytania. Spróbuj ponownie.');
        }
      } finally {
        setStreaming(false);
        setIsSending(false);
      }
    },
    [addMessage, updateLastMessage, setStreaming, conversations]
  );

  const handleSend = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed || isStreaming) return;

    let activeConvId = conversationId;

    if (!activeConvId) {
      activeConvId = createConversation();
    }

    addMessage(activeConvId, {
      role: 'user',
      content: trimmed,
    });

    setText('');

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    callAI(activeConvId, trimmed);
  }, [text, conversationId, createConversation, addMessage, callAI, isStreaming]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  return (
    <div className="w-full max-w-3xl mx-auto px-4">
      <div className="relative flex items-end gap-2 rounded-2xl border border-white/10 bg-[#1a1a1a] p-2 shadow-lg shadow-black/20 transition-colors focus-within:border-[#d4a574]/40 focus-within:shadow-[#d4a574]/5">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isStreaming ? 'AI generuje odpowiedź...' : 'Napisz wiadomość do ON1PL AI...'}
          disabled={isStreaming}
          rows={1}
          className={cn(
            'flex-1 resize-none bg-transparent px-3 py-2.5 text-sm text-white',
            'placeholder:text-gray-500 outline-none',
            'scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
          style={{ maxHeight: `${6 * 24}px` }}
        />

        <AnimatePresence>
          {text.trim().length > 0 && !isStreaming && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
              onClick={handleSend}
              className={cn(
                'flex-shrink-0 flex items-center justify-center',
                'h-9 w-9 rounded-xl',
                'bg-gradient-to-br from-[#d4a574] to-[#c9956b]',
                'text-[#121212] shadow-md shadow-[#d4a574]/20',
                'hover:shadow-lg hover:shadow-[#d4a574]/30',
                'active:scale-95 transition-all duration-150',
                'cursor-pointer'
              )}
            >
              <SendHorizontal className="h-4 w-4" />
            </motion.button>
          )}
        </AnimatePresence>

        {isStreaming && (
          <div className="flex-shrink-0 flex items-center justify-center h-9 w-9 rounded-xl bg-white/5">
            <Loader2 className="h-4 w-4 text-[#d4a574] animate-spin" />
          </div>
        )}
      </div>

      <p className="mt-2 text-center text-[11px] text-gray-600">
        ON1PL AI · Inteligentny Asystent Dywizjonu
      </p>
    </div>
  );
}
