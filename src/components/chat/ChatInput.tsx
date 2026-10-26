import { useState, useRef, useCallback, useEffect } from 'react';
import { SendHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChatStore } from '@/stores';
import { cn, generateId } from '@/lib/utils';

const AI_RESPONSES: string[] = [
  'Na podstawie aktualnych danych z SQB, dywizjon ^ON1PL^ utrzymuje się na stabilnej pozycji w rankingu. W ostatnich 7 dniach rozegraliśmy 14 bitew z win-rate na poziomie 62%. Najlepsze wyniki osiągamy na BR 11.7 w trybie RB — szczególnie na mapach miejskich, gdzie nasza koordynacja taktyczna daje przewagę.',
  'Analiza meta na BR 11.7 RB wskazuje na dominację Leopardów 2A7V i Strv 122B+ w aktualnej rotacji. Polecam skład: 2x Leopard 2A7V, 1x PUMA, 1x Tornado IDS jako CAS. Alternatywnie, Leclerc SXXI + AMX-40 dają bardzo solidne wyniki na mapach otwartych.',
  'Przygotowałem draft postu rekrutacyjnego:\n\n🏆 ^ON1PL^ Squadron — Dołącz do Elity!\n\n🎮 Aktywny dywizjon War Thunder\n📊 Top 100 w rankingu SQB\n🎯 Regularne treningi i SQB\n💬 Aktywny Discord z ponad 150 członkami\n\nWymagania:\n• Min. 1 pojazd na BR 10.0+\n• Aktywność min. 3x w tygodniu\n• Discord obowiązkowy\n\nDołącz teraz: discord.gg/on1pl',
  'Status dywizjonu ^ON1PL^:\n\n👥 Członków: 128/128 (pełny skład)\n🟢 Online teraz: 23 członków\n📊 Ranking SQB: #87 (↑12 pozycji)\n⭐ Aktualny rating: 1847\n🎯 Win-rate SQB: 71.4%\n📅 Następny SQB: za 2h\n\nWszystko działa sprawnie, Dowódco. Drużyna jest gotowa na wieczorny sprawdzian.',
  'Statystyki SQB z ostatniego tygodnia:\n\n📊 Rozegrane bitwy: 14\n✅ Wygrane: 9 (64.3%)\n❌ Przegrane: 5\n📈 Zmiana ratingu: +47 (1800 → 1847)\n🏆 Najlepsza seria: 4 wygrane z rzędu\n\nNajlepsi gracze tygodnia:\n1. Maverick_PL — 23 fragi, 4.2 K/D\n2. SteelHawk — 19 fragów, 3.8 K/D\n3. NightRider — 17 fragów, 3.1 K/D',
  'Raport taktyczny — analiza ostatniego SQB:\n\nMapa: Karelia (domination)\nWynik: Wygrana 3:1\n\n✅ Co zadziałało:\n• Szybkie zajęcie punktu C przez flanking team\n• Efektywne użycie CAS w drugiej połowie bitwy\n• Komunikacja drużynowa bez zarzutu\n\n⚠️ Do poprawy:\n• Zbyt agresywne wyjazdy na punkt A\n• Brak rozpoznania przed atakiem\n• Opóźnione spawny w drugiej fali',
  'Przeanalizowałem aktywność członków w tym tygodniu:\n\n🟢 Aktywni (3+ sesje): 47 osób\n🟡 Średni (1-2 sesje): 38 osób\n🔴 Nieaktywni (0 sesji): 43 osoby\n\nRekomendacja: Warto wysłać przypomnienie do nieaktywnych członków. 12 osób nie logowało się od ponad 14 dni — według regulaminu kwalifikują się do przeglądu członkostwa.',
  'Oto propozycja składu na dzisiejszy SQB (BR 11.7 RB):\n\n🛡️ Główny skład:\n• Leopard 2A7V × 3\n• Strv 122B+ × 2\n• T-80BVM × 1\n• Leclerc SXXI × 1\n• PUMA VJTF × 1\n\n✈️ CAS support:\n• Tornado IDS × 2\n• Su-25SM3 × 1\n\nSkład zoptymalizowany pod obecną metę. Każdy gracz powinien mieć backup na wypadek bana pojazdu.',
];

interface ChatInputProps {
  conversationId?: string | null;
}

export default function ChatInput({ conversationId }: ChatInputProps) {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { createConversation, addMessage, updateLastMessage, setStreaming } =
    useChatStore();

  const adjustTextareaHeight = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    const maxHeight = 6 * 24; // ~6 rows
    el.style.height = `${Math.min(el.scrollHeight, maxHeight)}px`;
  }, []);

  useEffect(() => {
    adjustTextareaHeight();
  }, [text, adjustTextareaHeight]);

  const simulateAIResponse = useCallback(
    (convId: string) => {
      setStreaming(true);

      // Add streaming placeholder
      addMessage(convId, {
        role: 'assistant',
        content: '',
        isStreaming: true,
      });

      // Simulate response delay (1-2 seconds)
      const delay = 1000 + Math.random() * 1000;
      setTimeout(() => {
        const response =
          AI_RESPONSES[Math.floor(Math.random() * AI_RESPONSES.length)];
        updateLastMessage(convId, response);
        setStreaming(false);
      }, delay);
    },
    [addMessage, updateLastMessage, setStreaming]
  );

  const handleSend = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed) return;

    let activeConvId = conversationId;

    // Create conversation if none exists
    if (!activeConvId) {
      activeConvId = createConversation();
    }

    // Add user message
    addMessage(activeConvId, {
      role: 'user',
      content: trimmed,
    });

    setText('');

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    // Simulate AI
    simulateAIResponse(activeConvId);
  }, [text, conversationId, createConversation, addMessage, simulateAIResponse]);

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
          placeholder="Napisz wiadomość do ON1PL AI..."
          rows={1}
          className={cn(
            'flex-1 resize-none bg-transparent px-3 py-2.5 text-sm text-white',
            'placeholder:text-gray-500 outline-none',
            'scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent'
          )}
          style={{ maxHeight: `${6 * 24}px` }}
        />

        <AnimatePresence>
          {text.trim().length > 0 && (
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
      </div>

      <p className="mt-2 text-center text-[11px] text-gray-600">
        ON1PL AI · Kontekst dywizjonowy
      </p>
    </div>
  );
}
