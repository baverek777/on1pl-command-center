import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  ChatConversation,
  ChatMessage,
  NavigationPage,
  UserProfile,
  BotStatus,
  BotLogEntry,
  Connector,
  AppSettings,
  SQBEvent,
} from '@/types';
import { generateId } from '@/lib/utils';

// ─── Chat Store ───────────────────────────────────────────────────────────

interface ChatState {
  conversations: ChatConversation[];
  activeConversationId: string | null;
  isStreaming: boolean;

  createConversation: () => string;
  deleteConversation: (id: string) => void;
  setActiveConversation: (id: string | null) => void;
  addMessage: (conversationId: string, message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  updateLastMessage: (conversationId: string, content: string) => void;
  setStreaming: (streaming: boolean) => void;
  getActiveConversation: () => ChatConversation | undefined;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      conversations: [],
      activeConversationId: null,
      isStreaming: false,

      createConversation: () => {
        const id = generateId();
        const conversation: ChatConversation = {
          id,
          title: 'Nowy czat',
          messages: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        set((state) => ({
          conversations: [conversation, ...state.conversations],
          activeConversationId: id,
        }));
        return id;
      },

      deleteConversation: (id) => {
        set((state) => ({
          conversations: state.conversations.filter((c) => c.id !== id),
          activeConversationId:
            state.activeConversationId === id ? null : state.activeConversationId,
        }));
      },

      setActiveConversation: (id) => {
        set({ activeConversationId: id });
      },

      addMessage: (conversationId, message) => {
        const newMessage: ChatMessage = {
          ...message,
          id: generateId(),
          timestamp: new Date(),
        };
        set((state) => ({
          conversations: state.conversations.map((conv) =>
            conv.id === conversationId
              ? {
                  ...conv,
                  messages: [...conv.messages, newMessage],
                  updatedAt: new Date(),
                  title:
                    conv.messages.length === 0 && message.role === 'user'
                      ? message.content.slice(0, 50)
                      : conv.title,
                }
              : conv
          ),
        }));
      },

      updateLastMessage: (conversationId, content) => {
        set((state) => ({
          conversations: state.conversations.map((conv) =>
            conv.id === conversationId
              ? {
                  ...conv,
                  messages: conv.messages.map((msg, idx) =>
                    idx === conv.messages.length - 1
                      ? { ...msg, content, isStreaming: false }
                      : msg
                  ),
                }
              : conv
          ),
        }));
      },

      setStreaming: (streaming) => {
        set({ isStreaming: streaming });
      },

      getActiveConversation: () => {
        const state = get();
        return state.conversations.find((c) => c.id === state.activeConversationId);
      },
    }),
    {
      name: 'on1pl-chat-store',
      partialize: (state) => ({
        conversations: state.conversations.map((c) => ({
          ...c,
          messages: c.messages.map((m) => ({ ...m, isStreaming: false })),
        })),
        activeConversationId: state.activeConversationId,
      }),
    }
  )
);

// ─── Navigation Store ─────────────────────────────────────────────────────

interface NavigationState {
  currentPage: NavigationPage;
  sidebarCollapsed: boolean;
  searchOpen: boolean;
  setPage: (page: NavigationPage) => void;
  toggleSidebar: () => void;
  setSearchOpen: (open: boolean) => void;
}

export const useNavigationStore = create<NavigationState>((set) => ({
  currentPage: 'chat',
  sidebarCollapsed: false,
  searchOpen: false,
  setPage: (page) => set({ currentPage: page }),
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setSearchOpen: (open) => set({ searchOpen: open }),
}));

// ─── User Store ───────────────────────────────────────────────────────────

interface UserState {
  user: UserProfile;
  isAuthenticated: boolean;
  sessionToken: string | null;
  accessDenied: string | null;
  login: (profile: Partial<UserProfile>, token?: string) => void;
  logout: () => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  setSessionToken: (token: string | null) => void;
  setAccessDenied: (reason: string | null) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: {
        id: 'commander-1',
        name: 'Paweł',
        role: 'Commander',
        discordId: 'pawel#0001',
        hasGeneralRole: true,
      },
      isAuthenticated: true,
      sessionToken: null,
      accessDenied: null,

      login: (profile, token) => {
        set((state) => ({
          user: { ...state.user, ...profile },
          isAuthenticated: true,
          accessDenied: null,
          sessionToken: token !== undefined ? token : state.sessionToken,
        }));
      },

      logout: () => {
        set({ isAuthenticated: false, sessionToken: null });
      },

      updateProfile: (updates) => {
        set((state) => ({
          user: { ...state.user, ...updates },
        }));
      },

      setSessionToken: (token) => {
        set({ sessionToken: token });
      },

      setAccessDenied: (reason) => {
        set({ accessDenied: reason, isAuthenticated: false });
      },
    }),
    { name: 'on1pl-user-store' }
  )
);

// ─── Bot Store ────────────────────────────────────────────────────────────

interface BotState {
  status: BotStatus;
  logs: BotLogEntry[];
  sqbEvents: SQBEvent[];
  setStatus: (status: Partial<BotStatus>) => void;
  addLog: (entry: Omit<BotLogEntry, 'id' | 'timestamp'>) => void;
  clearLogs: () => void;
  toggleBot: () => void;
  restartBot: () => void;
}

export const useBotStore = create<BotState>()(
  persist(
    (set) => ({
      status: {
        isRunning: true,
        uptime: 172800,
        lastRestart: new Date(Date.now() - 172800000),
        tunnelUrl: 'https://on1pl-bot-random.trycloudflare.com',
        tunnelStatus: 'connected',
        memoryUsage: 67,
        cpuUsage: 12,
      },
      logs: [
        {
          id: '1',
          timestamp: new Date(Date.now() - 60000),
          level: 'info',
          message: 'Bot ON1PL uruchomiony pomyślnie',
          source: 'system',
        },
        {
          id: '2',
          timestamp: new Date(Date.now() - 45000),
          level: 'info',
          message: 'Połączono z serwerem Discord: ^ON1PL^ Squadron',
          source: 'discord',
        },
        {
          id: '3',
          timestamp: new Date(Date.now() - 30000),
          level: 'info',
          message: 'Tunel Cloudflare aktywny: on1pl-bot-random.trycloudflare.com',
          source: 'tunnel',
        },
        {
          id: '4',
          timestamp: new Date(Date.now() - 15000),
          level: 'warning',
          message: 'Wysoki czas odpowiedzi API War Thunder (>2s)',
          source: 'api',
        },
        {
          id: '5',
          timestamp: new Date(),
          level: 'info',
          message: 'SQB monitoring aktywny — następny sprawdzian za 2h',
          source: 'sqb',
        },
      ],
      sqbEvents: [
        {
          id: 'sqb-1',
          name: 'Sprawdzian Dywizjonowy #47',
          date: new Date(Date.now() + 7200000),
          status: 'upcoming',
          participants: 12,
          battleRating: '11.7',
          mode: 'RB',
        },
        {
          id: 'sqb-2',
          name: 'Sprawdzian Dywizjonowy #46',
          date: new Date(Date.now() - 86400000),
          status: 'completed',
          participants: 16,
          battleRating: '11.7',
          mode: 'RB',
          result: { wins: 5, losses: 2, rating: 1847 },
        },
        {
          id: 'sqb-3',
          name: 'Sprawdzian Dywizjonowy #45',
          date: new Date(Date.now() - 172800000),
          status: 'completed',
          participants: 14,
          battleRating: '11.3',
          mode: 'RB',
          result: { wins: 4, losses: 3, rating: 1832 },
        },
      ],

      setStatus: (status) =>
        set((state) => ({ status: { ...state.status, ...status } })),

      addLog: (entry) =>
        set((state) => ({
          logs: [
            ...state.logs,
            { ...entry, id: generateId(), timestamp: new Date() },
          ].slice(-200),
        })),

      clearLogs: () => set({ logs: [] }),

      toggleBot: () =>
        set((state) => {
          const isRunning = !state.status.isRunning;
          return {
            status: {
              ...state.status,
              isRunning,
              tunnelStatus: isRunning ? 'checking' : 'disconnected',
            },
            logs: [
              ...state.logs,
              {
                id: generateId(),
                timestamp: new Date(),
                level: 'info' as const,
                message: isRunning
                  ? 'Uruchamianie bota ON1PL...'
                  : 'Zatrzymywanie bota ON1PL...',
                source: 'system',
              },
            ],
          };
        }),

      restartBot: () =>
        set((state) => ({
          status: {
            ...state.status,
            isRunning: true,
            uptime: 0,
            lastRestart: new Date(),
            tunnelStatus: 'checking',
          },
          logs: [
            ...state.logs,
            {
              id: generateId(),
              timestamp: new Date(),
              level: 'info' as const,
              message: 'Restartowanie bota ON1PL...',
              source: 'system',
            },
          ],
        })),
    }),
    {
      name: 'on1pl-bot-store',
      partialize: (state) => ({
        status: state.status,
        sqbEvents: state.sqbEvents,
      }),
    }
  )
);

// ─── Connectors Store ─────────────────────────────────────────────────────

interface ConnectorsState {
  connectors: Connector[];
  toggleConnector: (id: string) => void;
  updateConnectorConfig: (id: string, config: Record<string, string>) => void;
}

export const useConnectorsStore = create<ConnectorsState>()(
  persist(
    (set) => ({
      connectors: [
        {
          id: 'google-sheets',
          name: 'Google Sheets',
          description: '^ON1PL^ Akta — analiza danych arkusza przez AI',
          icon: 'Sheet',
          status: 'connected',
          category: 'google',
          lastSync: new Date(Date.now() - 300000),
        },
        {
          id: 'google-drive',
          name: 'Google Drive',
          description: 'Dokumenty i pliki dywizjonu',
          icon: 'HardDrive',
          status: 'connected',
          category: 'google',
          lastSync: new Date(Date.now() - 600000),
        },
        {
          id: 'gmail',
          name: 'Gmail',
          description: 'Poczta administracyjna dywizjonu',
          icon: 'Mail',
          status: 'disconnected',
          category: 'google',
        },
        {
          id: 'google-slides',
          name: 'Google Slides',
          description: 'Prezentacje taktyczne i briefingowe',
          icon: 'Presentation',
          status: 'disconnected',
          category: 'google',
        },
        {
          id: 'onedrive',
          name: 'OneDrive / Teams',
          description: 'Microsoft OneDrive i Teams',
          icon: 'Cloud',
          status: 'disconnected',
          category: 'microsoft',
        },
        {
          id: 'youtube',
          name: 'YouTube',
          description: 'Analiza statystyk i rekrutacja wideo',
          icon: 'Youtube',
          status: 'disconnected',
          category: 'social',
        },
        {
          id: 'tiktok',
          name: 'TikTok Inspector',
          description: 'Analiza @.on1pl — haczyki, format, statystyki',
          icon: 'Clapperboard',
          status: 'connected',
          category: 'social',
          lastSync: new Date(Date.now() - 1800000),
        },
        {
          id: 'github',
          name: 'GitHub',
          description: 'Repozytoria kodu bota i narzędzi',
          icon: 'Github',
          status: 'connected',
          category: 'dev',
          lastSync: new Date(Date.now() - 900000),
        },
        {
          id: 'botghost',
          name: 'BotGhost Dashboard',
          description: 'Zewnętrzny panel modułów i reguł bota (dashboard.botghost.com)',
          icon: 'Bot',
          status: 'connected',
          category: 'dev',
          lastSync: new Date(),
          config: {
            url: 'https://dashboard.botghost.com/dashboard/settings',
          },
        },
      ],

      toggleConnector: (id) =>
        set((state) => ({
          connectors: state.connectors.map((c) =>
            c.id === id
              ? {
                  ...c,
                  status: c.status === 'connected' ? 'disconnected' : 'connected',
                  lastSync: c.status === 'disconnected' ? new Date() : c.lastSync,
                }
              : c
          ),
        })),

      updateConnectorConfig: (id, config) =>
        set((state) => ({
          connectors: state.connectors.map((c) =>
            c.id === id ? { ...c, config: { ...c.config, ...config } } : c
          ),
        })),
    }),
    { name: 'on1pl-connectors-store' }
  )
);

// ─── Settings Store ───────────────────────────────────────────────────────

interface SettingsState {
  settings: AppSettings;
  updateSettings: (updates: Partial<AppSettings>) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      settings: {
        tunnelUrl: 'https://on1pl-bot-random.trycloudflare.com',
        language: 'pl',
        theme: 'dark',
        notifications: true,
        autoReconnect: true,
        botApiEndpoint: 'http://localhost:3001',
      },
      updateSettings: (updates) =>
        set((state) => ({
          settings: { ...state.settings, ...updates },
        })),
    }),
    { name: 'on1pl-settings-store' }
  )
);
