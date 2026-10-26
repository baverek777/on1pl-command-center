import { useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Shield, Users, Video, MessageSquare } from 'lucide-react';
import { useChatStore } from '@/stores';
import { cn, getGreeting, getGreetingSubtext } from '@/lib/utils';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';

function getApiUrl(endpoint: string): string {
  const base = window.location.port === '5173' ? 'http://localhost:3001' : '';
  return `${base}${endpoint}`;
}

interface SuggestionCard {
  icon: React.ElementType;
  label: string;
  prompt: string;
}

const SUGGESTIONS: SuggestionCard[] = [
  {
    icon: Shield,
    label: 'Status dywizjonu ^ON1PL^',
    prompt: 'Pokaż aktualny status dywizjonu ^ON1PL^, serwera Discord i narzędzi klanowych.',
  },
  {
    icon: Users,
    label: 'Przygotuj post rekrutacyjny',
    prompt: 'Przygotuj profesjonalny post rekrutacyjny dla dywizjonu ^ON1PL^ z linkiem discord.gg/on1pl.',
  },
  {
    icon: Video,
    label: 'Scenariusz na TikToka',
    prompt: 'Napisz chwytliwy scenariusz wideo na TikToka (@.on1pl) o życiu w polskim dywizjonie.',
  },
  {
    icon: MessageSquare,
    label: 'Pomoc w zarządzaniu',
    prompt: 'W czym możesz mi pomóc jako AI centrum dowodzenia ^ON1PL^?',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

function WelcomeScreen() {
  const { createConversation, addMessage, setStreaming, updateLastMessage } =
    useChatStore();

  const handleSuggestionClick = useCallback(
    async (prompt: string) => {
      const convId = createConversation();

      addMessage(convId, {
        role: 'user',
        content: prompt,
      });

      setStreaming(true);
      addMessage(convId, {
        role: 'assistant',
        content: '',
        isStreaming: true,
      });

      try {
        const res = await fetch(getApiUrl('/api/chat'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [{ role: 'user', content: prompt }],
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.response) {
            const fullText = data.response;
            const chunkSize = Math.max(3, Math.floor(fullText.length / 30));
            let currentIndex = 0;

            const typeInterval = setInterval(() => {
              currentIndex = Math.min(currentIndex + chunkSize, fullText.length);
              updateLastMessage(convId, fullText.slice(0, currentIndex));

              if (currentIndex >= fullText.length) {
                clearInterval(typeInterval);
                setStreaming(false);
              }
            }, 20);

            return;
          }
        }

        updateLastMessage(
          convId,
          'Wystąpił problem z połączeniem z silnikiem AI. Spróbuj ponownie za chwilę.'
        );
      } catch (err) {
        updateLastMessage(
          convId,
          'Błąd komunikacji z serwerem AI. Upewnij się, że backend bota działa.'
        );
      } finally {
        setStreaming(false);
      }
    },
    [createConversation, addMessage, setStreaming, updateLastMessage]
  );

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-1 flex-col items-center justify-center px-4 sm:px-6"
    >
      {/* Greeting */}
      <motion.div variants={itemVariants} className="text-center mb-8 sm:mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-to-r from-[#d4a574] via-[#e0b88a] to-[#c9956b] bg-clip-text text-transparent mb-3 font-display">
          {getGreeting()}
        </h1>
        <p className="text-sm sm:text-base text-gray-400">{getGreetingSubtext()}</p>
      </motion.div>

      {/* Suggestion cards — 2x2 grid */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl mb-8 sm:mb-10"
      >
        {SUGGESTIONS.map((card) => {
          const Icon = card.icon;
          return (
            <motion.button
              key={card.label}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSuggestionClick(card.prompt)}
              className={cn(
                'group flex items-center gap-3 rounded-2xl px-4 py-3.5 text-left',
                'bg-white/[0.03] border border-white/[0.06]',
                'hover:bg-white/[0.06] hover:border-[#d4a574]/30',
                'transition-all duration-200 cursor-pointer shadow-md'
              )}
            >
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-[#d4a574]/10 text-[#d4a574] group-hover:bg-[#d4a574]/20 transition-colors">
                <Icon className="h-4 w-4" />
              </div>
              <span className="text-xs sm:text-sm text-gray-300 group-hover:text-white transition-colors">
                {card.label}
              </span>
            </motion.button>
          );
        })}
      </motion.div>

      {/* Input */}
      <motion.div variants={itemVariants} className="w-full max-w-3xl">
        <ChatInput conversationId={null} />
      </motion.div>
    </motion.div>
  );
}

function ConversationView({ conversationId }: { conversationId: string }) {
  const conversation = useChatStore((s) =>
    s.conversations.find((c) => c.id === conversationId)
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation?.messages.length, conversation?.messages[conversation.messages.length - 1]?.content]);

  if (!conversation) return null;

  return (
    <div className="flex flex-1 flex-col min-h-0">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 scrollbar-thin scrollbar-thumb-white/5 scrollbar-track-transparent">
        <div className="mx-auto w-full max-w-3xl space-y-6">
          {conversation.messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Sticky input */}
      <div className="flex-shrink-0 border-t border-white/5 bg-[#121212]/90 backdrop-blur-md py-4">
        <ChatInput conversationId={conversationId} />
      </div>
    </div>
  );
}

export function ChatView() {
  const activeConversationId = useChatStore((s) => s.activeConversationId);

  return (
    <div className="flex h-full flex-col bg-[#121212]">
      {activeConversationId ? (
        <ConversationView conversationId={activeConversationId} />
      ) : (
        <WelcomeScreen />
      )}
    </div>
  );
}

export default ChatView;
