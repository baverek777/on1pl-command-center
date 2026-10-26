import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Search,
  MessageSquare,
  FolderKanban,
  FileBox,
  Plug,
  Bot,
  PenTool,
  Settings,
  ArrowRight,
  Sparkles,
  Command,
  X,
} from 'lucide-react';
import { useNavigationStore, useChatStore } from '@/stores';
import type { NavigationPage } from '@/types';
import { cn } from '@/lib/utils';

interface SearchItem {
  id: string;
  title: string;
  subtitle: string;
  category: 'chats' | 'projects' | 'artifacts' | 'connectors' | 'commands';
  icon: React.ElementType;
  page?: NavigationPage;
  action?: () => void;
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'chats' | 'projects' | 'artifacts' | 'commands'>('all');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const { setPage } = useNavigationStore();
  const { conversations, setActiveConversation } = useChatStore();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    } else {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const items: SearchItem[] = useMemo(() => {
    const list: SearchItem[] = [
      // Commands / Pages
      {
        id: 'cmd-new-chat',
        title: 'Nowy czat AI',
        subtitle: 'Rozpocznij konwersację z asystentem dywizjonu ^ON1PL^',
        category: 'commands',
        icon: Sparkles,
        action: () => {
          setActiveConversation(null);
          setPage('chat');
        },
      },
      {
        id: 'cmd-bot',
        title: 'Panel Bota Discord & Analityka SQB',
        subtitle: 'Zarządzanie botem, monitoring sprawdzianów i meta 11.7',
        category: 'commands',
        icon: Bot,
        page: 'bot',
      },
      {
        id: 'cmd-connectors',
        title: 'Hub Integracji (Connectors)',
        subtitle: 'Google Sheets (Akta), TikTok, YouTube, GitHub, Teams',
        category: 'commands',
        icon: Plug,
        page: 'connectors',
      },
      {
        id: 'cmd-content',
        title: 'Generator Treści & Rekrutacja',
        subtitle: 'Ogłoszenia, skrypty TikTok @.on1pl, szablony SQB',
        category: 'commands',
        icon: PenTool,
        page: 'content',
      },
      {
        id: 'cmd-projects',
        title: 'Projekty taktyczne dywizjonu',
        subtitle: 'Strategie SQB, plany rekrutacji i harmonogramy',
        category: 'projects',
        icon: FolderKanban,
        page: 'projects',
      },
      {
        id: 'cmd-artifacts',
        title: 'Artefakty & Raporty',
        subtitle: 'Wygenerowane pliki, arkusze i konfiguracje',
        category: 'artifacts',
        icon: FileBox,
        page: 'artifacts',
      },
      {
        id: 'cmd-settings',
        title: 'Ustawienia & Linki Dostępowe',
        subtitle: 'Zarządzanie tunelem Cloudflare, językiem i rolami',
        category: 'commands',
        icon: Settings,
        page: 'settings',
      },
    ];

    // Chats from store
    conversations.forEach((c) => {
      list.push({
        id: `chat-${c.id}`,
        title: c.title,
        subtitle: `Czat • ${c.messages.length} wiadomości`,
        category: 'chats',
        icon: MessageSquare,
        action: () => {
          setActiveConversation(c.id);
          setPage('chat');
        },
      });
    });

    return list;
  }, [conversations, setActiveConversation, setPage]);

  const filteredItems = useMemo(() => {
    let result = items;
    if (activeFilter !== 'all') {
      result = result.filter((it) => it.category === activeFilter);
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(
        (it) => it.title.toLowerCase().includes(q) || it.subtitle.toLowerCase().includes(q)
      );
    }
    return result;
  }, [items, activeFilter, query]);

  const handleSelect = (item: SearchItem) => {
    if (item.action) {
      item.action();
    } else if (item.page) {
      setPage(item.page);
    }
    onClose();
  };

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1 < filteredItems.length ? prev + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 >= 0 ? prev - 1 : filteredItems.length - 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          handleSelect(filteredItems[selectedIndex]);
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredItems, selectedIndex, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-2xl bg-[#181818] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search header */}
        <div className="flex items-center px-4 py-3.5 border-b border-white/10 gap-3">
          <Search className="w-5 h-5 text-[#d4a574] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Szukaj czatów, projektów, narzędzi, mety WT... (np. SQB, Leopard, TikTok)"
            className="flex-1 bg-transparent text-white text-sm placeholder:text-gray-500 outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
          >
            <kbd className="px-2 py-0.5 text-[10px] font-mono bg-white/5 border border-white/10 rounded text-gray-400">
              ESC
            </kbd>
          </button>
        </div>

        {/* Filter categories */}
        <div className="flex items-center gap-1 px-4 py-2 bg-[#141414] border-b border-white/5 overflow-x-auto no-scrollbar">
          {(
            [
              { id: 'all', label: 'Wszystko' },
              { id: 'commands', label: 'Narzędzia' },
              { id: 'chats', label: 'Czaty' },
              { id: 'projects', label: 'Projekty' },
              { id: 'artifacts', label: 'Artefakty' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveFilter(tab.id);
                setSelectedIndex(0);
              }}
              className={cn(
                'px-2.5 py-1 rounded-md text-xs font-medium transition-colors shrink-0',
                activeFilter === tab.id
                  ? 'bg-[#d4a574]/20 text-[#d4a574] border border-[#d4a574]/30'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-gray-500 text-sm">
              Nie znaleziono wyników dla „{query}”
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-150',
                    isSelected
                      ? 'bg-gradient-to-r from-[#d4a574]/15 to-[#d4a574]/5 border border-[#d4a574]/30 text-white'
                      : 'hover:bg-white/[0.04] text-gray-300 border border-transparent'
                  )}
                >
                  <div
                    className={cn(
                      'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
                      isSelected
                        ? 'bg-[#d4a574] text-[#121212]'
                        : 'bg-white/5 text-gray-400'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate text-white">{item.title}</p>
                    <p className="text-xs text-gray-500 truncate">{item.subtitle}</p>
                  </div>
                  {isSelected && (
                    <div className="flex items-center gap-1 text-[11px] text-[#d4a574] shrink-0 font-mono">
                      <span>Wybierz</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Modal footer hints */}
        <div className="flex items-center justify-between px-4 py-2 bg-[#121212] border-t border-white/5 text-[11px] text-gray-500">
          <div className="flex items-center gap-3">
            <span>↑↓ nawigacja</span>
            <span>↵ wybierz</span>
            <span>esc zamknij</span>
          </div>
          <span className="text-[#d4a574]">^ON1PL^ Command Center</span>
        </div>
      </div>
    </div>
  );
}

export default SearchModal;
