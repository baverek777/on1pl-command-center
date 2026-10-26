import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Play,
  Square,
  RotateCw,
  Trash2,
  Copy,
  Check,
  Activity,
  Cpu,
  MemoryStick,
  Shield,
  Swords,
  Plane,
  Clock,
  Users,
  ChevronRight,
  Wifi,
  WifiOff,
  Loader2,
  Terminal,
  Info,
  AlertTriangle,
  AlertCircle,
  Bug,
  Crosshair,
  Trophy,
  Star,
  Zap,
  Target,
  KeyRound,
  ExternalLink,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useBotStore, useSettingsStore } from '@/stores';
import { cn } from '@/lib/utils';
import type { BotLogEntry, VehicleMeta } from '@/types';

// ─── Helper: format uptime ────────────────────────────────────────────────
function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const parts: string[] = [];
  if (d > 0) parts.push(`${d}d`);
  if (h > 0 || d > 0) parts.push(`${h}h`);
  parts.push(`${m}m`);
  return parts.join(' ');
}

// ─── Helper: format countdown ─────────────────────────────────────────────
function formatCountdown(targetDate: Date): string {
  const diff = targetDate.getTime() - Date.now();
  if (diff <= 0) return 'Teraz';
  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  if (hours > 24) {
    const days = Math.floor(hours / 24);
    return `za ${days}d ${hours % 24}h`;
  }
  if (hours > 0) return `za ${hours}h ${minutes}m`;
  return `za ${minutes}m`;
}

// ─── Helper: format log timestamp ─────────────────────────────────────────
function formatLogTime(date: Date): string {
  return new Intl.DateTimeFormat('pl-PL', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(new Date(date));
}

// ─── Mock log messages for auto-generation ────────────────────────────────
const MOCK_LOG_MESSAGES: Array<{ level: BotLogEntry['level']; message: string; source: string }> = [
  { level: 'info', message: 'Heartbeat OK — ping: 42ms', source: 'discord' },
  { level: 'info', message: 'Synchronizacja danych SQB zakończona', source: 'sqb' },
  { level: 'debug', message: 'Cache odświeżony — 1247 wpisów', source: 'system' },
  { level: 'info', message: 'Komenda /stats wykonana przez użytkownika Paweł', source: 'discord' },
  { level: 'warning', message: 'Rate limit Discord API — czekam 1.2s', source: 'discord' },
  { level: 'info', message: 'Aktualizacja meta pojazdów zakończona', source: 'api' },
  { level: 'debug', message: 'WebSocket reconnect — próba 1/3', source: 'tunnel' },
  { level: 'info', message: 'Nowy członek dołączył do serwera: GunnerPL', source: 'discord' },
  { level: 'error', message: 'Timeout połączenia z War Thunder API', source: 'api' },
  { level: 'info', message: 'Backup bazy danych zakończony — 2.4MB', source: 'system' },
  { level: 'warning', message: 'Pamięć przekroczyła 75% — rozważ restart', source: 'system' },
  { level: 'info', message: 'Komenda /lineup wyświetlona w #taktyka', source: 'discord' },
  { level: 'debug', message: 'GC wykonane — zwolniono 12MB', source: 'system' },
  { level: 'info', message: 'Tunel Cloudflare — latency: 28ms', source: 'tunnel' },
  { level: 'info', message: 'Monitoring SQB — sprawdzam nowe wydarzenia', source: 'sqb' },
  { level: 'warning', message: 'Duplikat komendy zignorowany — anti-spam', source: 'discord' },
  { level: 'info', message: 'Statystyki gracza pobrane pomyślnie', source: 'api' },
  { level: 'error', message: 'Nie udało się pobrać danych z Thunderskill', source: 'api' },
  { level: 'info', message: 'Automatyczna rola przyznana: Rekrut → Członek', source: 'discord' },
  { level: 'debug', message: 'Event loop lag: 2.1ms — norma', source: 'system' },
];

// ─── Vehicle Meta Data ────────────────────────────────────────────────────
const TANK_META: VehicleMeta[] = [
  { id: 't1', name: 'Leopard 2A7V', type: 'tank', nation: 'Niemcy', battleRating: 11.7, rank: 7, tier: 'S', winRate: 62, killDeathRatio: 1.8, popularity: 95 },
  { id: 't2', name: 'Strv 122B+', type: 'tank', nation: 'Szwecja', battleRating: 11.7, rank: 7, tier: 'S', winRate: 60, killDeathRatio: 1.7, popularity: 88 },
  { id: 't3', name: 'T-80BVM', type: 'tank', nation: 'ZSRR', battleRating: 11.7, rank: 7, tier: 'A', winRate: 53, killDeathRatio: 1.3, popularity: 92 },
  { id: 't4', name: 'M1A2 SEP', type: 'tank', nation: 'USA', battleRating: 11.7, rank: 7, tier: 'A', winRate: 51, killDeathRatio: 1.2, popularity: 85 },
  { id: 't5', name: 'Leclerc SXXI', type: 'tank', nation: 'Francja', battleRating: 11.7, rank: 7, tier: 'B', winRate: 48, killDeathRatio: 1.1, popularity: 60 },
];

const AIRCRAFT_META: VehicleMeta[] = [
  { id: 'a1', name: 'F-16C', type: 'aircraft', nation: 'USA', battleRating: 13.0, rank: 8, tier: 'S', winRate: 58, killDeathRatio: 2.1, popularity: 97 },
  { id: 'a2', name: 'JAS39 Gripen', type: 'aircraft', nation: 'Szwecja', battleRating: 13.0, rank: 8, tier: 'S', winRate: 57, killDeathRatio: 2.0, popularity: 90 },
  { id: 'a3', name: 'Su-27', type: 'aircraft', nation: 'ZSRR', battleRating: 13.0, rank: 8, tier: 'A', winRate: 52, killDeathRatio: 1.6, popularity: 88 },
  { id: 'a4', name: 'Mirage 4000', type: 'aircraft', nation: 'Francja', battleRating: 12.7, rank: 8, tier: 'A', winRate: 50, killDeathRatio: 1.4, popularity: 72 },
];

const RECOMMENDED_LINEUPS = [
  {
    name: 'NATO Top Tier',
    vehicles: ['Leopard 2A7V', 'Leopard 2A6', 'PUMA', 'F-16C'],
    nation: 'Niemcy',
  },
  {
    name: 'Szwedzka Ściana',
    vehicles: ['Strv 122B+', 'Strv 122A', 'CV90120', 'JAS39 Gripen'],
    nation: 'Szwecja',
  },
  {
    name: 'Czerwony Przypływ',
    vehicles: ['T-80BVM', 'T-72B3', '2S38', 'Su-27'],
    nation: 'ZSRR',
  },
];

const MISSILE_META = [
  { name: 'AIM-9M Sidewinder', type: 'IR AAM', guidance: 'Smokeless IRCCM', tier: 'S' as const, note: 'Top na F-16C / Gripen' },
  { name: 'R-73 Archer', type: 'IR AAM', guidance: 'HMD + 40G Thrust', tier: 'S' as const, note: 'Zabójczy na bliski dystans Su-27' },
  { name: 'AIM-120A AMRAAM', type: 'ARH AAM', guidance: 'Radar Aktywny BVR', tier: 'S' as const, note: 'Fire-and-forget poza zasięgiem wzroku' },
  { name: 'Kh-38ML / MT', type: 'AGM CAS', guidance: 'Laser / Termowizja', tier: 'S' as const, note: 'Snajperskie CAS do Su-25SM3 / Su-34' },
];

const SQB_EXTERNAL_FEEDS = [
  {
    name: 'StatShark.net SQB Feed',
    url: 'https://statshark.net/squadron/ON1PL',
    rating: 1847,
    rank: '#87 Global',
    status: 'Zsynchronizowano',
    lastSync: '2 min temu',
  },
  {
    name: 'SRE Bot (sre.pawjob.us)',
    url: 'https://sre.pawjob.us/squadron/ON1PL',
    winRate: '71.4%',
    battles: '142 w sezonie',
    status: 'Webhook aktywny',
    lastSync: 'Na żywo',
  },
];

// ─── Tier Badge ───────────────────────────────────────────────────────────
function TierBadge({ tier }: { tier: VehicleMeta['tier'] }) {
  const colors: Record<string, string> = {
    S: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
    A: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
    B: 'bg-blue-500/20 text-blue-400 border-blue-500/40',
    C: 'bg-gray-500/20 text-gray-400 border-gray-500/40',
    D: 'bg-red-500/20 text-red-400 border-red-500/40',
  };
  return (
    <span className={cn('inline-flex items-center justify-center w-7 h-7 rounded text-xs font-bold border', colors[tier])}>
      {tier}
    </span>
  );
}

// ─── Progress Bar ─────────────────────────────────────────────────────────
function AnimatedProgressBar({ value, label, icon: Icon }: { value: number; label: string; icon: React.ElementType }) {
  const color = value < 50 ? 'bg-emerald-500' : value < 80 ? 'bg-yellow-500' : 'bg-red-500';
  const textColor = value < 50 ? 'text-emerald-400' : value < 80 ? 'text-yellow-400' : 'text-red-400';

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Icon className="w-4 h-4" />
          <span>{label}</span>
        </div>
        <span className={cn('text-sm font-semibold tabular-nums', textColor)}>{value}%</span>
      </div>
      <div className="h-2.5 bg-[#2a2a2a] rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-1000 ease-out', color)}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

// ─── Log Level Badge ──────────────────────────────────────────────────────
function LogLevelBadge({ level }: { level: BotLogEntry['level'] }) {
  const config: Record<BotLogEntry['level'], { icon: React.ElementType; className: string; label: string }> = {
    info: { icon: Info, className: 'bg-blue-500/15 text-blue-400 border-blue-500/30', label: 'INFO' },
    warning: { icon: AlertTriangle, className: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30', label: 'WARN' },
    error: { icon: AlertCircle, className: 'bg-red-500/15 text-red-400 border-red-500/30', label: 'ERR' },
    debug: { icon: Bug, className: 'bg-gray-500/15 text-gray-400 border-gray-500/30', label: 'DBG' },
  };
  const { icon: Icon, className, label } = config[level];

  return (
    <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border tracking-wider', className)}>
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
}

// ─── SQB Status Badge ─────────────────────────────────────────────────────
function SQBStatusBadge({ status }: { status: 'upcoming' | 'live' | 'completed' }) {
  const config: Record<string, { className: string; label: string; pulse?: boolean }> = {
    upcoming: { className: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30', label: 'Nadchodzący' },
    live: { className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30', label: 'Na żywo', pulse: true },
    completed: { className: 'bg-gray-500/15 text-gray-400 border-gray-500/30', label: 'Zakończony' },
  };
  const { className, label, pulse } = config[status];

  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold border', className)}>
      {pulse && <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" /><span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" /></span>}
      {!pulse && status === 'upcoming' && <Clock className="w-3 h-3" />}
      {label}
    </span>
  );
}

// ─── Tunnel Status Badge ──────────────────────────────────────────────────
function TunnelStatusBadge({ status }: { status: 'connected' | 'disconnected' | 'checking' }) {
  const config: Record<string, { icon: React.ElementType; className: string; label: string }> = {
    connected: { icon: Wifi, className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30', label: 'Połączono' },
    disconnected: { icon: WifiOff, className: 'bg-red-500/15 text-red-400 border-red-500/30', label: 'Rozłączono' },
    checking: { icon: Loader2, className: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30', label: 'Sprawdzanie...' },
  };
  const { icon: Icon, className, label } = config[status];

  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border', className)}>
      <Icon className={cn('w-3.5 h-3.5', status === 'checking' && 'animate-spin')} />
      {label}
    </span>
  );
}

// ─── Win Rate Bar ─────────────────────────────────────────────────────────
function WinRateBar({ value }: { value: number }) {
  const color = value >= 55 ? 'bg-emerald-500' : value >= 50 ? 'bg-yellow-500' : 'bg-red-500';
  return (
    <div className="flex items-center gap-2 min-w-[120px]">
      <div className="flex-1 h-1.5 bg-[#2a2a2a] rounded-full overflow-hidden">
        <div className={cn('h-full rounded-full', color)} style={{ width: `${value}%` }} />
      </div>
      <span className="text-xs text-gray-400 tabular-nums w-10 text-right">{value}%</span>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ─── MAIN COMPONENT ───────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════
export function BotPanel() {
  const {
    status,
    logs,
    sqbEvents,
    setStatus,
    addLog,
    clearLogs,
    toggleBot,
    restartBot,
  } = useBotStore();

  const { settings } = useSettingsStore();

  const [tunnelInput, setTunnelInput] = useState(status.tunnelUrl);
  const [copied, setCopied] = useState(false);
  const [logFilter, setLogFilter] = useState<'all' | BotLogEntry['level']>('all');
  const logContainerRef = useRef<HTMLDivElement>(null);
  const [uptimeDisplay, setUptimeDisplay] = useState(status.uptime);

  // ─── Discord Bot Integration States ──────────────────────────────────
  const [tokenInput, setTokenInput] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [botUserTag, setBotUserTag] = useState<string | null>(null);
  const [connectedGuilds, setConnectedGuilds] = useState<Array<{ name: string; memberCount: number }>>([]);
  const [hasSavedToken, setHasSavedToken] = useState(false);

  // Sync with real bot API if running
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const apiBase = window.location.port === '5173' ? 'http://localhost:3001' : '';
        const res = await fetch(`${apiBase}/api/status`);
        if (res.ok) {
          const data = await res.json();
          if (data.isRunning !== status.isRunning) {
            setStatus({ isRunning: data.isRunning });
          }
          if (data.user) setBotUserTag(data.user.tag);
          if (data.guilds) setConnectedGuilds(data.guilds);
          if (data.hasToken) setHasSavedToken(true);
        }
      } catch (e) {
        // backend offline / fallback
      }
    };
    fetchStatus();
    const interval = setInterval(fetchStatus, 3000);
    return () => clearInterval(interval);
  }, [status.isRunning, setStatus]);

  const handleConnectToken = async () => {
    if (!tokenInput.trim()) return;
    setIsConnecting(true);
    try {
      const apiBase = window.location.port === '5173' ? 'http://localhost:3001' : '';
      const res = await fetch(`${apiBase}/api/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: tokenInput.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        addLog({ level: 'info', message: 'Token bota zapisany. Bot uruchomiony!', source: 'discord' });
        setHasSavedToken(true);
        setStatus({ isRunning: true });
      }
    } catch (e) {
      addLog({ level: 'error', message: 'Błąd połączenia z lokalnym API bota', source: 'panel' });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleStopBotBackend = async () => {
    try {
      const apiBase = window.location.port === '5173' ? 'http://localhost:3001' : '';
      await fetch(`${apiBase}/api/stop`, { method: 'POST' });
    } catch (e) {}
    toggleBot();
  };

  // ─── Uptime ticker ────────────────────────────────────────────────────
  useEffect(() => {
    if (!status.isRunning) return;
    setUptimeDisplay(status.uptime);
    const interval = setInterval(() => {
      setUptimeDisplay((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [status.isRunning, status.uptime]);

  // ─── Auto-generate mock logs ──────────────────────────────────────────
  useEffect(() => {
    if (!status.isRunning) return;
    const interval = setInterval(() => {
      const randomLog = MOCK_LOG_MESSAGES[Math.floor(Math.random() * MOCK_LOG_MESSAGES.length)];
      addLog(randomLog);
    }, 4000 + Math.random() * 4000);
    return () => clearInterval(interval);
  }, [status.isRunning, addLog]);

  // ─── Simulate CPU/Memory fluctuations ─────────────────────────────────
  useEffect(() => {
    if (!status.isRunning) return;
    const interval = setInterval(() => {
      setStatus({
        cpuUsage: Math.max(3, Math.min(95, status.cpuUsage + Math.floor(Math.random() * 15 - 7))),
        memoryUsage: Math.max(30, Math.min(92, status.memoryUsage + Math.floor(Math.random() * 8 - 3))),
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [status.isRunning, status.cpuUsage, status.memoryUsage, setStatus]);

  // ─── Simulate tunnel reconnect after checking ─────────────────────────
  useEffect(() => {
    if (status.tunnelStatus !== 'checking') return;
    const timeout = setTimeout(() => {
      setStatus({ tunnelStatus: 'connected' });
      addLog({ level: 'info', message: 'Tunel Cloudflare połączony pomyślnie', source: 'tunnel' });
    }, 2500);
    return () => clearTimeout(timeout);
  }, [status.tunnelStatus, setStatus, addLog]);

  // ─── Auto-scroll logs ─────────────────────────────────────────────────
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  // ─── Copy tunnel URL ──────────────────────────────────────────────────
  const handleCopyUrl = useCallback(() => {
    navigator.clipboard.writeText(tunnelInput).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [tunnelInput]);

  // ─── Tunnel URL update ────────────────────────────────────────────────
  const handleTunnelUrlBlur = useCallback(() => {
    if (tunnelInput !== status.tunnelUrl) {
      setStatus({ tunnelUrl: tunnelInput, tunnelStatus: 'checking' });
      addLog({ level: 'info', message: `Aktualizacja URL tunelu: ${tunnelInput}`, source: 'tunnel' });
    }
  }, [tunnelInput, status.tunnelUrl, setStatus, addLog]);

  // ─── Filtered logs ────────────────────────────────────────────────────
  const filteredLogs = useMemo(() => {
    if (logFilter === 'all') return logs;
    return logs.filter((log) => log.level === logFilter);
  }, [logs, logFilter]);

  const logFilterOptions: Array<{ key: 'all' | BotLogEntry['level']; label: string }> = [
    { key: 'all', label: 'Wszystkie' },
    { key: 'info', label: 'Info' },
    { key: 'warning', label: 'Ostrzeżenia' },
    { key: 'error', label: 'Błędy' },
    { key: 'debug', label: 'Debug' },
  ];

  return (
    <div className="flex-1 h-full overflow-y-auto custom-scrollbar">
      <div className="max-w-[1600px] mx-auto p-6 space-y-6">
        {/* ─── Header ──────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#d4a574] to-[#c9956b] flex items-center justify-center">
              <Shield className="w-5 h-5 text-[#121212]" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white font-['Manrope']">Panel Bota Discord ^ON1PL^</h1>
              <p className="text-sm text-gray-500">Zarządzanie botem, autoryzacja tokenem i monitoring systemu</p>
            </div>
          </div>
          <a
            href="https://discord.com/oauth2/authorize?client_id=1564365365918695454&permissions=8&scope=bot%20applications.commands"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-[#5865F2] hover:bg-[#4752c4] text-white text-xs font-semibold rounded-xl shadow-lg shadow-[#5865F2]/20 transition-all duration-200"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Dodaj bota na serwer Discord
          </a>
        </div>

        {/* ─── Bot Token Connection Box ─────────────────────────────────── */}
        <div className="bg-[#181818] border border-[#d4a574]/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#d4a574]/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-[#d4a574]" />
                <h2 className="text-base font-bold text-white">Połączenie z Twoim Botem Discord</h2>
                <span className="text-[10px] bg-[#d4a574]/15 text-[#d4a574] border border-[#d4a574]/30 px-2 py-0.5 rounded-full font-mono">
                  ID: 1564365365918695454
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Wklej poniżej <strong className="text-gray-200">Token bota</strong> z Developer Portal, aby połączyć panel www z Discordem.
              </p>
            </div>

            {botUserTag && (
              <span className="badge badge-green text-xs shrink-0 flex items-center gap-1.5 py-1 px-3">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Zalogowano: {botUserTag}
              </span>
            )}
          </div>

          {/* Quick steps */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 mb-4 text-xs">
            <div className="p-2.5 rounded-xl bg-[#121212] border border-white/5">
              <span className="font-bold text-[#d4a574]">1. Zakładka „Bot"</span>
              <p className="text-gray-400 text-[11px] mt-0.5">W Developer Portal kliknij <strong>Bot</strong> po lewej stronie.</p>
            </div>
            <div className="p-2.5 rounded-xl bg-[#121212] border border-white/5">
              <span className="font-bold text-[#d4a574]">2. Pobierz Token</span>
              <p className="text-gray-400 text-[11px] mt-0.5">Kliknij <strong>Reset Token</strong> i skopiuj wygenerowany klucz.</p>
            </div>
            <div className="p-2.5 rounded-xl bg-[#121212] border border-white/5">
              <span className="font-bold text-[#d4a574]">3. Zaznacz Intents</span>
              <p className="text-gray-400 text-[11px] mt-0.5">Włącz 3 suwaki <em>Privileged Gateway Intents</em> i zapisz.</p>
            </div>
          </div>

          {/* Token input & action */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <input
                type={showToken ? 'text' : 'password'}
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                placeholder={hasSavedToken ? '••••••••••••••••••••••••••••••••• (Token zapisany)' : 'Wklej tutaj Token Bota (np. MTU2ND...)'}
                className="w-full bg-[#121212] border border-[#333] rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-[#d4a574] focus:ring-1 focus:ring-[#d4a574]/30 transition-all pr-10"
              />
              <button
                type="button"
                onClick={() => setShowToken(!showToken)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
              >
                {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <button
              onClick={handleConnectToken}
              disabled={isConnecting || !tokenInput.trim()}
              className="px-5 py-2.5 bg-[#d4a574] hover:bg-[#e0b88a] text-[#121212] font-semibold text-sm rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Łączenie...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  Połącz i Uruchom
                </>
              )}
            </button>
          </div>
        </div>

        {/* ─── Top Row: Bot Status ─────────────────────────────────────── */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            {/* Left: Status + Uptime */}
            <div className="flex items-center gap-5">
              {/* Status Dot */}
              <div className="relative">
                <div className={cn(
                  'w-14 h-14 rounded-2xl flex items-center justify-center',
                  status.isRunning
                    ? 'bg-emerald-500/10 border border-emerald-500/30'
                    : 'bg-red-500/10 border border-red-500/30'
                )}>
                  <div className="relative">
                    {status.isRunning && (
                      <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-40" />
                    )}
                    <span className={cn(
                      'relative block w-4 h-4 rounded-full',
                      status.isRunning ? 'bg-emerald-500' : 'bg-red-500'
                    )} />
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-lg font-bold text-white font-['Manrope'] flex items-center gap-2">
                  Bot ^ON1PL^
                  <span className={cn(
                    'text-sm font-medium px-2.5 py-0.5 rounded-full',
                    status.isRunning
                      ? 'bg-emerald-500/15 text-emerald-400'
                      : 'bg-red-500/15 text-red-400'
                  )}>
                    {status.isRunning ? 'Aktywny' : 'Zatrzymany'}
                  </span>
                </h2>
                <div className="flex items-center gap-4 mt-1">
                  <span className="text-sm text-gray-400 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    Uptime: <span className="text-white font-semibold tabular-nums">{formatUptime(uptimeDisplay)}</span>
                  </span>
                  <span className="text-sm text-gray-400 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5" />
                    Logi: <span className="text-white font-semibold tabular-nums">{logs.length}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={toggleBot}
                className={cn(
                  'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200',
                  status.isRunning
                    ? 'bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500/25'
                    : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25'
                )}
              >
                {status.isRunning ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {status.isRunning ? 'Zatrzymaj' : 'Uruchom'}
              </button>
              <button
                onClick={() => {
                  restartBot();
                  setUptimeDisplay(0);
                }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-yellow-500/15 text-yellow-400 border border-yellow-500/30 hover:bg-yellow-500/25 transition-all duration-200"
              >
                <RotateCw className="w-4 h-4" />
                Restart
              </button>
              <button
                onClick={clearLogs}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-[#2a2a2a] text-gray-400 border border-[#333] hover:bg-[#333] hover:text-gray-300 transition-all duration-200"
              >
                <Trash2 className="w-4 h-4" />
                Wyczyść logi
              </button>
            </div>
          </div>

          {/* Tunnel URL */}
          <div className="mt-5 pt-5 border-t border-[#2a2a2a]">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <label className="text-sm text-gray-400 whitespace-nowrap flex items-center gap-1.5 min-w-[100px]">
                <Wifi className="w-3.5 h-3.5" />
                URL Tunelu:
              </label>
              <div className="flex-1 flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={tunnelInput}
                    onChange={(e) => setTunnelInput(e.target.value)}
                    onBlur={handleTunnelUrlBlur}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleTunnelUrlBlur();
                        (e.target as HTMLInputElement).blur();
                      }
                    }}
                    className="w-full bg-[#121212] border border-[#333] rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-[#d4a574] focus:ring-1 focus:ring-[#d4a574]/30 transition-colors"
                    placeholder="https://..."
                  />
                </div>
                <button
                  onClick={handleCopyUrl}
                  className="flex items-center justify-center w-9 h-9 rounded-lg bg-[#2a2a2a] border border-[#333] hover:bg-[#333] transition-colors text-gray-400 hover:text-white"
                  title="Kopiuj URL"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
                <TunnelStatusBadge status={status.tunnelStatus} />
              </div>
            </div>
          </div>

          {/* Connected Discord Guilds & BotGhost Bridge */}
          {connectedGuilds.length > 0 && (
            <div className="mt-4 pt-4 border-t border-[#2a2a2a] flex flex-wrap items-center gap-2">
              <span className="text-xs text-gray-400 font-medium">Podłączone serwery Discord:</span>
              {connectedGuilds.map((g) => (
                <span
                  key={g.name}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#121212] border border-[#d4a574]/30 text-xs text-white"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <strong>{g.name}</strong>
                  <span className="text-gray-500">({g.memberCount} graczy)</span>
                </span>
              ))}
              <a
                href="https://dashboard.botghost.com/dashboard/settings"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-[#d4a574] hover:text-[#e0b88a] px-3 py-1 rounded-lg bg-[#d4a574]/10 border border-[#d4a574]/20 transition-colors ml-auto"
              >
                <span>Otwórz BotGhost Dashboard</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </div>

        {/* ─── Middle Row: Metrics + SQB ──────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* System Metrics */}
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <Activity className="w-5 h-5 text-[#d4a574]" />
              <h3 className="text-base font-bold text-white font-['Manrope']">Metryki Systemu</h3>
            </div>
            <div className="space-y-5">
              <AnimatedProgressBar value={status.cpuUsage} label="Użycie CPU" icon={Cpu} />
              <AnimatedProgressBar value={status.memoryUsage} label="Użycie pamięci RAM" icon={MemoryStick} />
            </div>
            <div className="mt-6 pt-4 border-t border-[#2a2a2a] grid grid-cols-2 gap-4">
              <div className="bg-[#121212] rounded-xl p-3">
                <p className="text-xs text-gray-500 mb-1">Ostatni restart</p>
                <p className="text-sm text-white font-semibold">
                  {status.lastRestart
                    ? new Intl.DateTimeFormat('pl-PL', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      }).format(new Date(status.lastRestart))
                    : 'Brak danych'}
                </p>
              </div>
              <div className="bg-[#121212] rounded-xl p-3">
                <p className="text-xs text-gray-500 mb-1">API Endpoint</p>
                <p className="text-sm text-white font-semibold truncate" title={settings.botApiEndpoint}>
                  {settings.botApiEndpoint}
                </p>
              </div>
            </div>
          </div>

          {/* SQB Monitor */}
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <Swords className="w-5 h-5 text-[#d4a574]" />
              <h3 className="text-base font-bold text-white font-['Manrope']">Sprawdziany Dywizjonowe</h3>
            </div>
            <div className="space-y-3">
              {sqbEvents.map((event) => (
                <div
                  key={event.id}
                  className="bg-[#121212] border border-[#2a2a2a] rounded-xl p-4 hover:border-[#333] transition-colors"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-white truncate">{event.name}</h4>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {event.participants} graczy
                        </span>
                        <span className="flex items-center gap-1">
                          <Crosshair className="w-3 h-3" />
                          BR {event.battleRating}
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-[#2a2a2a] text-gray-400 font-medium">
                          {event.mode}
                        </span>
                      </div>
                    </div>
                    <SQBStatusBadge status={event.status} />
                  </div>

                  {event.status === 'upcoming' && (
                    <div className="mt-2 pt-2 border-t border-[#2a2a2a] flex items-center gap-2 text-xs text-yellow-400">
                      <Clock className="w-3 h-3" />
                      <span className="font-medium">{formatCountdown(new Date(event.date))}</span>
                    </div>
                  )}

                  {event.status === 'completed' && event.result && (
                    <div className="mt-2 pt-2 border-t border-[#2a2a2a] flex items-center gap-4 text-xs">
                      <span className="flex items-center gap-1 text-gray-400">
                        <Trophy className="w-3 h-3 text-[#d4a574]" />
                        <span className="text-emerald-400 font-bold">{event.result.wins}W</span>
                        <span className="text-gray-600">/</span>
                        <span className="text-red-400 font-bold">{event.result.losses}L</span>
                      </span>
                      <span className="flex items-center gap-1 text-gray-400">
                        <Star className="w-3 h-3 text-[#d4a574]" />
                        Rating: <span className="text-white font-bold">{event.result.rating}</span>
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* StatShark & SRE Bot Integration Feeds */}
            <div className="mt-4 pt-4 border-t border-[#2a2a2a]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Integracje analityczne SQB
                </span>
                <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Sync
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {SQB_EXTERNAL_FEEDS.map((feed, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-[#121212] border border-[#2a2a2a] text-xs hover:border-[#d4a574]/30 transition-colors"
                  >
                    <div className="flex items-center justify-between font-medium text-white mb-1">
                      <span className="truncate text-[#d4a574]">{feed.name}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-gray-400">
                      <span>{feed.rank || feed.winRate}</span>
                      <span className="text-gray-500">{feed.lastSync}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ─── Bottom Section: Logs + War Thunder Meta ────────────────── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Log Stream - 2 columns wide */}
          <div className="xl:col-span-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-[#d4a574]" />
                <h3 className="text-base font-bold text-white font-['Manrope']">Logi Systemowe</h3>
                <span className="text-xs text-gray-500 bg-[#2a2a2a] px-2 py-0.5 rounded-full tabular-nums">
                  {filteredLogs.length}
                </span>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {logFilterOptions.map((option) => (
                  <button
                    key={option.key}
                    onClick={() => setLogFilter(option.key)}
                    className={cn(
                      'px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200',
                      logFilter === option.key
                        ? 'bg-[#d4a574]/15 text-[#d4a574] border border-[#d4a574]/30'
                        : 'bg-[#2a2a2a] text-gray-500 border border-transparent hover:text-gray-300 hover:bg-[#333]'
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div
              ref={logContainerRef}
              className="h-[340px] overflow-y-auto custom-scrollbar bg-[#121212] rounded-xl border border-[#2a2a2a] p-1"
            >
              {filteredLogs.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-600 text-sm">
                  Brak logów do wyświetlenia
                </div>
              ) : (
                <div className="space-y-0.5">
                  {filteredLogs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-start gap-3 px-3 py-2 rounded-lg hover:bg-[#1a1a1a]/50 transition-colors group"
                    >
                      <span className="text-[11px] text-gray-600 font-mono tabular-nums whitespace-nowrap pt-0.5 min-w-[65px]">
                        {formatLogTime(log.timestamp)}
                      </span>
                      <LogLevelBadge level={log.level} />
                      <span className="text-sm text-gray-300 font-mono flex-1 break-all leading-relaxed">
                        {log.message}
                      </span>
                      {log.source && (
                        <span className="text-[10px] text-gray-600 bg-[#1e1e1e] px-1.5 py-0.5 rounded font-mono whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                          {log.source}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* War Thunder Meta */}
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-5">
              <Target className="w-5 h-5 text-[#d4a574]" />
              <h3 className="text-base font-bold text-white font-['Manrope']">Meta War Thunder 11.7 RB</h3>
            </div>

            {/* Tanks */}
            <div className="mb-5">
              <div className="flex items-center gap-1.5 mb-3">
                <Shield className="w-3.5 h-3.5 text-gray-500" />
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Czołgi</h4>
              </div>
              <div className="space-y-2">
                {TANK_META.map((vehicle) => (
                  <div
                    key={vehicle.id}
                    className="flex items-center gap-3 bg-[#121212] rounded-lg px-3 py-2 border border-[#2a2a2a] hover:border-[#333] transition-colors"
                  >
                    <TierBadge tier={vehicle.tier} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white font-medium truncate">{vehicle.name}</p>
                      <p className="text-[10px] text-gray-600">{vehicle.nation}</p>
                    </div>
                    <WinRateBar value={vehicle.winRate} />
                  </div>
                ))}
              </div>
            </div>

            {/* Aircraft */}
            <div className="mb-5">
              <div className="flex items-center gap-1.5 mb-3">
                <Plane className="w-3.5 h-3.5 text-gray-500" />
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Lotnictwo</h4>
              </div>
              <div className="space-y-2">
                {AIRCRAFT_META.map((vehicle) => (
                  <div
                    key={vehicle.id}
                    className="flex items-center gap-3 bg-[#121212] rounded-lg px-3 py-2 border border-[#2a2a2a] hover:border-[#333] transition-colors"
                  >
                    <TierBadge tier={vehicle.tier} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white font-medium truncate">{vehicle.name}</p>
                      <p className="text-[10px] text-gray-600">{vehicle.nation}</p>
                    </div>
                    <WinRateBar value={vehicle.winRate} />
                  </div>
                ))}
              </div>
            </div>

            {/* Missiles & Armament Meta */}
            <div className="mb-5">
              <div className="flex items-center gap-1.5 mb-3 pt-4 border-t border-[#2a2a2a]">
                <Crosshair className="w-3.5 h-3.5 text-[#d4a574]" />
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Top Rakiety & Uzbrojenie</h4>
              </div>
              <div className="space-y-2">
                {MISSILE_META.map((m, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2.5 bg-[#121212] rounded-lg px-3 py-2 border border-[#2a2a2a]"
                  >
                    <TierBadge tier={m.tier} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-white font-medium truncate">{m.name}</p>
                      <p className="text-[10px] text-gray-500 truncate">{m.guidance} • {m.note}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommended Lineups */}
            <div>
              <div className="flex items-center gap-1.5 mb-3 pt-4 border-t border-[#2a2a2a]">
                <Zap className="w-3.5 h-3.5 text-[#d4a574]" />
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Zalecane składy</h4>
              </div>
              <div className="space-y-2">
                {RECOMMENDED_LINEUPS.map((lineup, idx) => (
                  <div
                    key={idx}
                    className="bg-[#121212] rounded-lg border border-[#2a2a2a] p-3 hover:border-[#d4a574]/30 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="text-sm font-semibold text-[#d4a574]">{lineup.name}</h5>
                      <span className="text-[10px] text-gray-600 bg-[#1e1e1e] px-1.5 py-0.5 rounded">{lineup.nation}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {lineup.vehicles.map((v, vi) => (
                        <span
                          key={vi}
                          className="text-[11px] text-gray-400 bg-[#1e1e1e] border border-[#2a2a2a] px-2 py-0.5 rounded-md group-hover:border-[#333] transition-colors"
                        >
                          {v}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BotPanel;
