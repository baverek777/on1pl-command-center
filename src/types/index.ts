export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

export interface ChatConversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
  pinned?: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  role: 'Commander' | 'Officer' | 'Member' | 'Recruit';
  avatar?: string;
  discordId?: string;
  email?: string;
  hasGeneralRole?: boolean;
  emailLinked?: boolean;
  memberRoles?: string[];
  isOnOn1plServer?: boolean;
}

export interface BotStatus {
  isRunning: boolean;
  uptime: number;
  lastRestart: Date | null;
  tunnelUrl: string;
  tunnelStatus: 'connected' | 'disconnected' | 'checking';
  memoryUsage: number;
  cpuUsage: number;
}

export interface BotLogEntry {
  id: string;
  timestamp: Date;
  level: 'info' | 'warning' | 'error' | 'debug';
  message: string;
  source?: string;
}

export interface Connector {
  id: string;
  name: string;
  description: string;
  icon: string;
  status: 'connected' | 'disconnected' | 'error';
  category: 'google' | 'microsoft' | 'social' | 'dev';
  lastSync?: Date;
  config?: Record<string, string>;
}

export interface DiscordServer {
  id: string;
  name: string;
  memberCount: number;
  onlineCount: number;
  channels: DiscordChannel[];
}

export interface DiscordChannel {
  id: string;
  name: string;
  type: 'text' | 'voice' | 'announcement';
  unreadCount?: number;
}

export interface SQBEvent {
  id: string;
  name: string;
  date: Date;
  status: 'upcoming' | 'live' | 'completed';
  participants: number;
  battleRating: string;
  mode: 'RB' | 'SB' | 'AB';
  result?: {
    wins: number;
    losses: number;
    rating: number;
  };
}

export interface VehicleMeta {
  id: string;
  name: string;
  type: 'tank' | 'aircraft' | 'helicopter' | 'ship';
  nation: string;
  battleRating: number;
  rank: number;
  tier: 'S' | 'A' | 'B' | 'C' | 'D';
  winRate: number;
  killDeathRatio: number;
  popularity: number;
}

export interface ProjectItem {
  id: string;
  name: string;
  description: string;
  filesCount: number;
  lastModified: string;
  starred: boolean;
  color: string;
}

export interface ArtifactItem {
  id: string;
  name: string;
  type: 'document' | 'image' | 'code' | 'spreadsheet';
  content?: string;
  size: string;
  createdAt: string;
  project?: string;
  preview?: string;
}

export interface RecruitmentPost {
  id: string;
  title: string;
  content: string;
  platform: 'discord' | 'tiktok' | 'youtube' | 'forum';
  status: 'draft' | 'published' | 'archived';
  createdAt: Date;
  views?: number;
  engagement?: number;
}

export interface ShareLink {
  id: string;
  url: string;
  expiresAt: Date;
  createdBy: string;
  permissions: ('view' | 'edit' | 'admin')[];
  usageCount: number;
  maxUsages: number;
}

export type NavigationPage = 
  | 'chat'
  | 'projects'
  | 'artifacts'
  | 'connectors'
  | 'bot'
  | 'settings'
  | 'content'
  | 'search';

export interface AppSettings {
  tunnelUrl: string;
  language: 'pl' | 'en';
  theme: 'dark' | 'light';
  notifications: boolean;
  autoReconnect: boolean;
  botApiEndpoint: string;
}
