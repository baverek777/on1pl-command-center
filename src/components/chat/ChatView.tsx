import { useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Crosshair, Shield, Users, BarChart3 } from 'lucide-react';
import { useChatStore } from '@/stores';
import { cn, getGreeting, getGreetingSubtext } from '@/lib/utils';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';

interface SuggestionCard {
  icon: React.ElementType;
  label: string;
  prompt: string;
}

const SUGGESTIONS: SuggestionCard[] = [
  {
    icon: Crosshair,
    label: 'Analiza meta 11.7 RB',
    prompt: 'Przeanalizuj aktualną metę na BR 11.7 w trybie RB. Jakie pojazdy i składy są najbardziej efektywne?',
  },
  {
    icon: Shield,
    label: 'Status dywizjonu',
    prompt: 'Pokaż aktualny status dywizjonu ^ON1PL^ — liczba członków, ranking, aktywność i nadchodzące wydarzenia.',
  },
  {
    icon: Users,
    label: 'Przygotuj post rekrutacyjny',
    prompt: 'Przygotuj profesjonalny post rekrutacyjny dla dywizjonu ^ON1PL^ na Discord i media społecznościowe.',
  },
  {
    icon: BarChart3,
    label: 'Sprawdź statystyki SQB',
    prompt: 'Pokaż szczegółowe statystyki SQB z ostatniego tygodnia — wyniki, rating, najlepsi gracze.',
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
    (prompt: string) => {
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

      const AI_QUICK_RESPONSES: Record<string, string> = {
        meta: 'Analiza meta na BR 11.7 RB wskazuje na dominację Leopardów 2A7V i Strv 122B+ w aktualnej rotacji. Polecam skład: 2x Leopard 2A7V, 1x PUMA, 1x Tornado IDS jako CAS. Alternatywnie, Leclerc SXXI + AMX-40 dają bardzo solidne wyniki na mapach otwartych. T-80BVM również utrzymuje się w top-tier dzięki niskiej sylwetce i dobrej mobilności.',
        status:
          'Status dywizjonu ^ON1PL^:\n\n👥 Członków: 128/128 (pełny skład)\n🟢 Online teraz: 23 członków\n📊 Ranking SQB: #87 (↑12 pozycji)\n⭐ Aktualny rating: 1847\n🎯 Win-rate SQB: 71.4%\n📅 Następny SQB: za 2h\n\nWszystko działa sprawnie, Dowódco. Drużyna jest gotowa na wieczorny sprawdzian.',
        rekrutacyjny:
          'Przygotowałem draft postu rekrutacyjnego:\n\n🏆 ^ON1PL^ Squadron — Dołącz do Elity!\n\n🎮 Aktywny dywizjon War Thunder\n📊 Top 100 w rankingu SQB\n🎯 Regularne treningi i SQB\n💬 Aktywny Discord z ponad 150 członkami\n\nWymagania:\n• Min. 1 pojazd na BR 10.0+\n• Aktywność min. 3x w tygodniu\n• Discord obowiązkowy\n\nDołącz teraz: discord.gg/on1pl',
        statystyki:
          'Statystyki SQB z ostatniego tygodnia:\n\n📊 Rozegrane bitwy: 14\n✅ Wygrane: 9 (64.3%)\n❌ Przegrane: 5\n📈 Zmiana ratingu: +47 (1800 → 1847)\n🏆 Najlepsza seria: 4 wygrane z rzędu\n\nNajlepsi gracze tygodnia:\n1. Maverick_PL — 23 fragi, 4.2 K/D\n2. SteelHawk — 19 fragów, 3.8 K/D\n3. NightRider — 17 fragów, 3.1 K/D',
      };

      let responseKey = 'status';
      if (prompt.includes('meta') || prompt.includes('Meta')) responseKey = 'meta';
      else if (prompt.includes('rekrut') || prompt.includes('post')) responseKey = 'rekrutacyjny';
      else if (prompt.includes('statystyk') || prompt.includes('SQB')) responseKey = 'statystyki';

      const delay = 1000 + Math.random() * 1000;
      setTimeout(() => {
        updateLastMessage(convId, AI_QUICK_RESPONSES[responseKey]);
        setStreaming(false);
      }, delay);
    },
    [createConversation, addMessage, setStreaming, updateLastMessage]
  );

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-1 flex-col items-center justify-center px-6"
    >
      {/* Greeting */}
      <motion.div variants={itemVariants} className="text-center mb-10">
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-[#d4a574] via-[#e0b88a] to-[#c9956b] bg-clip-text text-transparent mb-3 font-[Manrope]">
          {getGreeting()}
        </h1>
        <p className="text-base text-gray-400">{getGreetingSubtext()}</p>
      </motion.div>

      {/* Suggestion cards — 2x2 grid */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl mb-10"
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
                'group flex items-center gap-3 rounded-xl px-4 py-3.5 text-left',
                'bg-white/[0.03] border border-white/[0.06]',
                'hover:bg-white/[0.06] hover:border-[#d4a574]/20',
                'transition-all duration-200 cursor-pointer'
              )}
            >
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-[#d4a574]/10 text-[#d4a574] group-hover:bg-[#d4a574]/15 transition-colors">
                <Icon className="h-4 w-4" />
              </div>
              <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
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
      <div className="flex-shrink-0 border-t border-white/5 bg-[#121212]/80 backdrop-blur-md py-4">
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
