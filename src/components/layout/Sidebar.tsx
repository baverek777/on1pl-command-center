import { useState, useCallback, useRef, useEffect } from 'react';
import {
  Search,
  FolderKanban,
  FileBox,
  Plug,
  Bot,
  PenTool,
  Settings,
  FolderOpen,
  Clapperboard,
  MessageSquare,
  Plus,
  ChevronLeft,
  ChevronRight,
  Clock,
  LogOut,
  Globe,
  Moon,
  User,
  ExternalLink,
  Sheet,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useChatStore, useNavigationStore, useUserStore } from '@/stores';
import type { NavigationPage } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { pl } from 'date-fns/locale';

// ─── Discord Pinned Items (External Direct Links) ──────────────────────────

interface DiscordPinnedItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  url: string;
}

const discordPinnedItems: DiscordPinnedItem[] = [
  {
    id: 'akta',
    label: 'ON1PL Akta',
    icon: Sheet,
    url: 'https://docs.google.com/spreadsheets/d/1KcHjmev34Xtp9oxnQJTHVaU2acvkaYY_kAGelEX_Nuo/edit?gid=1458623191#gid=1458623191',
  },
  {
    id: 'tiktok',
    label: 'ON1PL TikTok',
    icon: Clapperboard,
    url: 'https://www.tiktok.com/@.on1pl',
  },
  {
    id: 'discord',
    label: 'ON1PL Discord',
    icon: MessageSquare,
    url: 'https://discord.gg/on1pl',
  },
];

// ─── Navigation Items ──────────────────────────────────────────────────────

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  page?: NavigationPage;
  action?: 'search';
  hint?: string;
}

const navItems: NavItem[] = [
  { id: 'search', label: 'Szukaj', icon: Search, action: 'search', hint: 'Ctrl+K' },
  { id: 'projects', label: 'Projekty', icon: FolderKanban, page: 'projects' },
  { id: 'artifacts', label: 'Artefakty', icon: FileBox, page: 'artifacts' },
  { id: 'connectors', label: 'Integracje', icon: Plug, page: 'connectors' },
  { id: 'bot', label: 'Panel Bota', icon: Bot, page: 'bot' },
  { id: 'content', label: 'Generator Treści', icon: PenTool, page: 'content' },
  { id: 'settings', label: 'Ustawienia', icon: Settings, page: 'settings' },
];

// ─── User Dropdown Menu ────────────────────────────────────────────────────

interface UserDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  collapsed: boolean;
}

function UserDropdown({ isOpen, onClose, collapsed }: UserDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { setPage } = useNavigationStore();
  const { logout } = useUserStore();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const menuItems = [
    {
      label: 'Ustawienia',
      icon: Settings,
      onClick: () => {
        setPage('settings');
        onClose();
      },
    },
    {
      label: 'Język (PL/EN)',
      icon: Globe,
      onClick: () => {
        onClose();
      },
    },
    {
      label: 'Przełącznik trybu',
      icon: Moon,
      onClick: () => {
        onClose();
      },
    },
    {
      label: 'Wyloguj',
      icon: LogOut,
      onClick: () => {
        logout();
        onClose();
      },
      danger: true,
    },
  ];

  return (
    <div
      ref={dropdownRef}
      className={cn(
        'absolute bottom-full mb-2 bg-stealth-600 border border-stealth-400/30 rounded-xl',
        'shadow-xl shadow-black/40 overflow-hidden z-50',
        'animate-fade-in',
        collapsed ? 'left-1 w-52' : 'left-2 right-2'
      )}
    >
      {menuItems.map((item, idx) => {
        const Icon = item.icon;
        return (
          <button
            key={idx}
            onClick={item.onClick}
            className={cn(
              'w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors duration-150',
              item.danger
                ? 'text-red-400 hover:bg-red-500/10'
                : 'text-white/70 hover:bg-stealth-500/50 hover:text-white'
            )}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            <span>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ─── Sidebar Component ─────────────────────────────────────────────────────

export function Sidebar() {
  const { conversations, createConversation, setActiveConversation } = useChatStore();
  const {
    currentPage,
    sidebarCollapsed,
    toggleSidebar,
    setPage,
    setSearchOpen,
    mobileMenuOpen,
    setMobileMenuOpen,
  } = useNavigationStore();
  const { user } = useUserStore();

  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [showAllChats, setShowAllChats] = useState(false);

  const collapsed = sidebarCollapsed;

  const handleNewChat = useCallback(() => {
    const id = createConversation();
    setActiveConversation(id);
    setPage('chat');
    setMobileMenuOpen(false);
  }, [createConversation, setActiveConversation, setPage, setMobileMenuOpen]);

  const handleNavClick = useCallback(
    (item: NavItem) => {
      setMobileMenuOpen(false);
      if (item.action === 'search') {
        setSearchOpen(true);
      } else if (item.page) {
        setPage(item.page);
      }
    },
    [setPage, setSearchOpen, setMobileMenuOpen]
  );

  const handleChatClick = useCallback(
    (chatId: string) => {
      setActiveConversation(chatId);
      setPage('chat');
      setMobileMenuOpen(false);
    },
    [setActiveConversation, setPage, setMobileMenuOpen]
  );

  const recentChats = showAllChats ? conversations : conversations.slice(0, 5);

  const formatRelativeTime = (date: Date) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true, locale: pl });
    } catch {
      return '';
    }
  };

  return (
    <aside
      className={cn(
        'h-screen flex flex-col bg-stealth-800 border-r border-stealth-400/20',
        'transition-all duration-300 ease-in-out flex-shrink-0',
        // Desktop
        'hidden md:flex relative',
        collapsed ? 'md:w-16' : 'md:w-[280px]',
        // Mobile Drawer
        mobileMenuOpen && 'flex fixed inset-y-0 left-0 z-50 w-[280px] shadow-2xl bg-[#141414]'
      )}
    >
      {/* Collapse Toggle Button (Desktop only) */}
      <button
        onClick={toggleSidebar}
        className={cn(
          'hidden md:flex absolute -right-3 top-6 z-20 w-6 h-6 rounded-full',
          'bg-stealth-600 border border-stealth-400/30',
          'items-center justify-center',
          'text-white/50 hover:text-copper hover:border-copper/30',
          'transition-all duration-200'
        )}
      >
        {collapsed ? (
          <ChevronRight className="w-3.5 h-3.5" />
        ) : (
          <ChevronLeft className="w-3.5 h-3.5" />
        )}
      </button>

      {/* ── Top Section: Logo + New Chat ── */}
      <div className="px-3 pt-5 pb-3 flex-shrink-0">
        {/* Logo */}
        <div className={cn('mb-4', collapsed ? 'px-0 text-center' : 'px-1')}>
          {collapsed ? (
            <span className="text-lg font-bold text-gradient-copper font-display">^</span>
          ) : (
            <>
              <h1 className="text-xl font-bold text-gradient-copper font-display tracking-tight">
                ^ON1PL^
              </h1>
              <p className="text-[11px] text-white/40 mt-0.5 tracking-widest uppercase">
                Command Center
              </p>
            </>
          )}
        </div>

        {/* New Chat Button */}
        <button
          onClick={handleNewChat}
          className={cn(
            'w-full flex items-center justify-center gap-2 py-2.5 rounded-lg',
            'bg-copper/10 border border-copper/20 text-copper',
            'hover:bg-copper/15 hover:border-copper/30',
            'active:scale-[0.98] transition-all duration-200',
            'font-medium text-sm',
            collapsed && 'px-0'
          )}
          title="Nowy czat"
        >
          <Plus className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span>Nowy czat</span>}
        </button>
      </div>

      {/* ── Scrollable Middle Section ── */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-3 py-1">
        {/* Navigation Items */}
        <nav className="space-y-0.5 mb-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.page === currentPage;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item)}
                title={collapsed ? item.label : undefined}
                className={cn(
                  'w-full',
                  isActive ? 'sidebar-item-active' : 'sidebar-item',
                  collapsed && 'justify-center px-2'
                )}
              >
                <Icon className="w-[18px] h-[18px] flex-shrink-0" />
                {!collapsed && (
                  <>
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.hint && (
                      <span className="text-[10px] text-white/30 bg-stealth-500/50 px-1.5 py-0.5 rounded font-mono">
                        {item.hint}
                      </span>
                    )}
                  </>
                )}
              </button>
            );
          })}
        </nav>

        {/* Divider */}
        <div className="divider" />

        {/* ── Discord Pinned Section (Direct External Links) ── */}
        <div className="mb-4 mt-3">
          {!collapsed && (
            <div className="flex items-center gap-2 px-3 mb-2">
              <span className="text-[11px] font-semibold text-copper/80 uppercase tracking-wider">
                Serwer Discord
              </span>
              <div className="flex-1 h-px bg-copper/10" />
            </div>
          )}
          <div className="space-y-1">
            {discordPinnedItems.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.id}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMobileMenuOpen(false)}
                  title={collapsed ? `${item.label} (otwórz w nowej karcie)` : undefined}
                  className={cn(
                    'sidebar-item w-full flex items-center justify-between group',
                    collapsed && 'justify-center px-2'
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon className="w-[18px] h-[18px] text-[#d4a574] group-hover:scale-110 transition-transform shrink-0" />
                    {!collapsed && (
                      <span className="flex-1 text-left truncate text-white/80 group-hover:text-white transition-colors">
                        {item.label}
                      </span>
                    )}
                  </div>
                  {!collapsed && (
                    <ExternalLink className="w-3.5 h-3.5 text-white/20 group-hover:text-[#d4a574] transition-colors shrink-0" />
                  )}
                </a>
              );
            })}
          </div>
        </div>

        {/* Divider */}
        <div className="divider" />

        {/* ── Recent Chats Section ── */}
        {!collapsed && (
          <div className="mt-3">
            <div className="flex items-center justify-between px-3 mb-2">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-white/30" />
                <span className="text-[11px] font-semibold text-white/40 uppercase tracking-wider">
                  Ostatnie
                </span>
              </div>
              {conversations.length > 5 && (
                <button
                  onClick={() => setShowAllChats(!showAllChats)}
                  className="text-[11px] text-copper/70 hover:text-copper transition-colors"
                >
                  {showAllChats ? 'Zwiń' : 'Wyświetl wszystko'}
                </button>
              )}
            </div>
            <div className="space-y-0.5">
              {recentChats.length === 0 && (
                <p className="text-xs text-white/25 px-3 py-2">Brak ostatnich czatów</p>
              )}
              {recentChats.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => handleChatClick(chat.id)}
                  className={cn(
                    'w-full text-left px-3 py-2 rounded-lg transition-all duration-150',
                    'hover:bg-stealth-500/50 group',
                    chat.id ===
                      useChatStore.getState().activeConversationId
                      ? 'bg-stealth-500/30 text-white'
                      : 'text-white/60'
                  )}
                >
                  <p className="text-sm truncate group-hover:text-white transition-colors">
                    {chat.title}
                  </p>
                  <p className="text-[10px] text-white/25 mt-0.5">
                    {formatRelativeTime(chat.updatedAt)}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Bottom User Profile Widget ── */}
      <div className="flex-shrink-0 border-t border-stealth-400/20 px-3 py-3 relative">
        <UserDropdown
          isOpen={userDropdownOpen}
          onClose={() => setUserDropdownOpen(false)}
          collapsed={collapsed}
        />
        <button
          onClick={() => setUserDropdownOpen(!userDropdownOpen)}
          className={cn(
            'w-full flex items-center gap-3 px-2 py-2 rounded-lg',
            'hover:bg-stealth-500/40 transition-all duration-200',
            collapsed && 'justify-center px-0'
          )}
        >
          {/* Avatar */}
          <div
            className={cn(
              'flex-shrink-0 w-9 h-9 rounded-full',
              'bg-stealth-600 border-2 border-copper/40',
              'flex items-center justify-center',
              'text-copper font-semibold text-sm'
            )}
          >
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              user.name.charAt(0).toUpperCase()
            )}
          </div>

          {/* Name & Role */}
          {!collapsed && (
            <div className="flex-1 text-left min-w-0">
              <p className="text-sm font-medium text-white truncate">{user.name}</p>
              <p className="text-[11px] text-copper/70">{user.role}</p>
            </div>
          )}

          {/* Chevron */}
          {!collapsed && (
            <User className="w-4 h-4 text-white/30 flex-shrink-0" />
          )}
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
