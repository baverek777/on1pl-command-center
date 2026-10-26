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
  ProjectItem,
  ArtifactItem,
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
  mobileMenuOpen: boolean;
  searchOpen: boolean;
  setPage: (page: NavigationPage) => void;
  toggleSidebar: () => void;
  toggleMobileMenu: () => void;
  setMobileMenuOpen: (open: boolean) => void;
  setSearchOpen: (open: boolean) => void;
}

export const useNavigationStore = create<NavigationState>((set) => ({
  currentPage: 'chat',
  sidebarCollapsed: false,
  mobileMenuOpen: false,
  searchOpen: false,
  setPage: (page) => set({ currentPage: page, mobileMenuOpen: false }),
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  toggleMobileMenu: () => set((s) => ({ mobileMenuOpen: !s.mobileMenuOpen })),
  setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),
  setSearchOpen: (open) => set({ searchOpen: open }),
}));

// ─── Projects Store ───────────────────────────────────────────────────────

interface ProjectState {
  projects: ProjectItem[];
  addProject: (data: { name: string; description: string; color?: string }) => ProjectItem;
  deleteProject: (id: string) => void;
  toggleStarProject: (id: string) => void;
  updateProject: (id: string, updates: Partial<ProjectItem>) => void;
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set) => ({
      projects: [
        {
          id: 'proj-1',
          name: 'Centrum Operacyjne ^ON1PL^',
          description: 'Główny projekt zarządzania dywizjonem, botem i rekrutacją',
          filesCount: 3,
          lastModified: new Date().toISOString(),
          starred: true,
          color: '#d4a574',
        },
      ],
      addProject: ({ name, description, color = '#d4a574' }) => {
        const newProj: ProjectItem = {
          id: `proj-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          name,
          description,
          filesCount: 0,
          lastModified: new Date().toISOString(),
          starred: false,
          color,
        };
        set((state) => ({ projects: [newProj, ...state.projects] }));
        return newProj;
      },
      deleteProject: (id) =>
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
        })),
      toggleStarProject: (id) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id ? { ...p, starred: !p.starred, lastModified: new Date().toISOString() } : p
          ),
        })),
      updateProject: (id, updates) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id
              ? { ...p, ...updates, lastModified: new Date().toISOString() }
              : p
          ),
        })),
    }),
    { name: 'on1pl-projects-store' }
  )
);

// ─── Artifacts Store ──────────────────────────────────────────────────────

interface ArtifactState {
  artifacts: ArtifactItem[];
  addArtifact: (data: {
    name: string;
    type: 'document' | 'image' | 'code' | 'spreadsheet';
    content?: string;
    project?: string;
    size?: string;
  }) => ArtifactItem;
  deleteArtifact: (id: string) => void;
  updateArtifact: (id: string, updates: Partial<ArtifactItem>) => void;
}

export const useArtifactStore = create<ArtifactState>()(
  persist(
    (set) => ({
      artifacts: [
        {
          id: 'art-1',
          name: 'Regulamin_ON1PL_2026.md',
          type: 'document',
          size: '4.8 KB',
          createdAt: new Date().toISOString(),
          project: 'Centrum Operacyjne ^ON1PL^',
          preview: 'Oficjalny regulamin dywizjonu ^ON1PL^, zasady awansów i procedury rekrutacyjne.',
          content: `# REGULAMIN DYWIZJONU ^ON1PL^\n\n1. Szacunek i kultura na serwerze Discord.\n2. Aktywność na bitwach dywizjonowych oraz wspólnych treningach.\n3. Obowiązek posiadania sprawnego mikrofonu i komunikacji na voice chatu.\n4. Rangi oficerskie podlegają weryfikacji przez Dowódcę.`,
        },
        {
          id: 'art-2',
          name: 'Skrypt_TikTok_Rekrutacja.txt',
          type: 'document',
          size: '1.9 KB',
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          project: 'Centrum Operacyjne ^ON1PL^',
          preview: 'Haczyk: Szukasz elitarnego polskiego dywizjonu w War Thunder? Sprawdź ^ON1PL^...',
          content: `🎬 SKRYPT TIKTOK @.on1pl\n\n[0:00-0:03] HACZYK:\n"Szukasz polskiego dywizjonu, z którym wygrasz każdy mecz w War Thunder?"\n\n[0:03-0:15] ZALETY:\n- Aktywna społeczność Discord\n- Doświadczeni dowódcy i coaching\n- Zgrany skład na bitwach dywizjonowych\n\n[0:15-0:20] CTA:\n"Dołącz do ^ON1PL^ już dziś! Link w bio!"`,
        },
      ],
      addArtifact: ({ name, type, content = '', project = 'Centrum Operacyjne ^ON1PL^', size }) => {
        const calculatedSize = size || `${Math.max(1, Math.round(new Blob([content]).size / 1024))} KB`;
        const newArt: ArtifactItem = {
          id: `art-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          name,
          type,
          content,
          project,
          size: calculatedSize,
          createdAt: new Date().toISOString(),
          preview: content.slice(0, 120),
        };
        set((state) => ({ artifacts: [newArt, ...state.artifacts] }));
        return newArt;
      },
      deleteArtifact: (id) =>
        set((state) => ({
          artifacts: state.artifacts.filter((a) => a.id !== id),
        })),
      updateArtifact: (id, updates) =>
        set((state) => ({
          artifacts: state.artifacts.map((a) =>
            a.id === id ? { ...a, ...updates } : a
          ),
        })),
    }),
    { name: 'on1pl-artifacts-store' }
  )
);

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
          message: 'Bot ^ON1PL^ uruchomiony w chmurze Render',
          source: 'system',
        },
        {
          id: '2',
          timestamp: new Date(Date.now() - 45000),
          level: 'info',
          message: 'Połączono z serwerem Discord: ON1PL-ONE NOVA PL (181 członków)',
          source: 'discord',
        },
        {
          id: '3',
          timestamp: new Date(Date.now() - 30000),
          level: 'info',
          message: 'Tunel Cloudflare / API aktywne i nasłuchujące',
          source: 'tunnel',
        },
        {
          id: '4',
          timestamp: new Date(),
          level: 'info',
          message: 'Centrum sterowania ^ON1PL^ gotowe do pracy',
          source: 'system',
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
