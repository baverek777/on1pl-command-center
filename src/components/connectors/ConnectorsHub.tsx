import { useState, useMemo } from 'react';
import {
  Sheet,
  HardDrive,
  Mail,
  Presentation,
  Cloud,
  Youtube,
  Clapperboard,
  Github,
  Link2,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Plug,
  ExternalLink,
  Loader2,
  Bot,
} from 'lucide-react';
import { useConnectorsStore } from '@/stores';
import type { Connector } from '@/types';

const iconMap: Record<string, React.ElementType> = {
  Sheet,
  HardDrive,
  Mail,
  Presentation,
  Cloud,
  Youtube,
  Clapperboard,
  Github,
  Bot,
};

const categoryLabels: Record<string, string> = {
  google: 'Google Workspace',
  microsoft: 'Microsoft',
  social: 'Social Media',
  dev: 'Programowanie',
};

const categoryOrder: string[] = ['google', 'microsoft', 'social', 'dev'];

function formatRelativeTime(date: Date): string {
  const now = Date.now();
  const diff = now - new Date(date).getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return `${seconds} sek. temu`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min temu`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} godz. temu`;
  const days = Math.floor(hours / 24);
  return `${days} dn. temu`;
}

interface ConnectorCardProps {
  connector: Connector;
  onToggle: () => void;
  onUpdateConfig: (config: Record<string, string>) => void;
}

function ConnectorCard({ connector, onToggle, onUpdateConfig }: ConnectorCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [linkInput, setLinkInput] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);

  const IconComponent = iconMap[connector.icon] || Plug;
  const isConnected = connector.status === 'connected';
  const hasLinkAnalysis = connector.id === 'tiktok' || connector.id === 'youtube';

  const handleAnalyze = () => {
    if (!linkInput.trim()) return;
    setAnalyzing(true);
    onUpdateConfig({ lastAnalyzedLink: linkInput });

    setTimeout(() => {
      setAnalyzing(false);
      if (connector.id === 'tiktok') {
        setAnalysisResult(
          `✅ Analiza TikTok zakończona\n\n` +
          `📊 Wyświetlenia: 14.2k\n` +
          `❤️ Polubienia: 2,340\n` +
          `💬 Komentarze: 89\n` +
          `📤 Udostępnienia: 156\n\n` +
          `🎯 Haczyk: Mocny (pierwsze 1.5s)\n` +
          `⏱️ Retencja: 72% (powyżej średniej)\n` +
          `🏷️ Sugerowane hashtagi: #warthunder #squadron #on1pl`
        );
      } else {
        setAnalysisResult(
          `✅ Analiza YouTube zakończona\n\n` +
          `📊 Wyświetlenia: 8,450\n` +
          `👍 Polubienia: 612\n` +
          `💬 Komentarze: 45\n\n` +
          `📈 CTR miniaturki: 6.8%\n` +
          `⏱️ Średni czas oglądania: 4:32 / 8:15\n` +
          `🎯 Retencja: 55%\n` +
          `🏷️ SEO Score: 7/10`
        );
      }
    }, 2000);
  };

  return (
    <div className="bg-[#1a1a1a] rounded-xl border border-white/5 hover:border-[#d4a574]/20 transition-all duration-300">
      <div
        className="flex items-center gap-4 p-4 cursor-pointer"
        onClick={() => (hasLinkAnalysis || connector.config) && setExpanded(!expanded)}
      >
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
            isConnected
              ? 'bg-[#d4a574]/15 text-[#d4a574]'
              : 'bg-white/5 text-gray-500'
          }`}
        >
          <IconComponent className="w-5 h-5" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium text-white truncate">{connector.name}</h3>
            {isConnected && connector.lastSync && (
              <span className="text-[10px] text-gray-500 shrink-0">
                {formatRelativeTime(connector.lastSync)}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 truncate mt-0.5">{connector.description}</p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {connector.config?.url && (
            <a
              href={connector.config.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg bg-white/5 hover:bg-[#d4a574]/20 text-gray-400 hover:text-[#d4a574] border border-white/5 transition-all"
              title="Otwórz zewnętrzny panel"
            >
              <span>Otwórz</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}

          {hasLinkAnalysis && (
            <button className="text-gray-500 hover:text-gray-300 transition-colors p-1">
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
            className={`relative w-11 h-6 rounded-full transition-colors duration-300 ${
              isConnected ? 'bg-emerald-500/80' : 'bg-gray-700'
            }`}
          >
            <div
              className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-300 ${
                isConnected ? 'translate-x-[22px]' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>
      </div>

      {expanded && hasLinkAnalysis && (
        <div className="px-4 pb-4 border-t border-white/5 pt-3 space-y-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={linkInput}
                onChange={(e) => setLinkInput(e.target.value)}
                placeholder={
                  connector.id === 'tiktok'
                    ? 'Wklej link do TikToka...'
                    : 'Wklej link do YouTube...'
                }
                className="w-full bg-[#121212] border border-white/10 rounded-lg py-2 pl-10 pr-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#d4a574]/40 transition-colors"
                onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
              />
            </div>
            <button
              onClick={handleAnalyze}
              disabled={analyzing || !linkInput.trim()}
              className="px-4 py-2 bg-[#d4a574] hover:bg-[#c9956b] disabled:bg-gray-700 disabled:text-gray-500 text-black text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
            >
              {analyzing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ExternalLink className="w-4 h-4" />
              )}
              Analizuj
            </button>
          </div>

          {analysisResult && (
            <div className="bg-[#121212] rounded-lg p-3 border border-white/5">
              <pre className="text-xs text-gray-300 whitespace-pre-wrap font-[Inter,sans-serif]">
                {analysisResult}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function ConnectorsHub() {
  const { connectors, toggleConnector, updateConnectorConfig } = useConnectorsStore();

  const grouped = useMemo(() => {
    const groups: Record<string, Connector[]> = {};
    for (const connector of connectors) {
      if (!groups[connector.category]) {
        groups[connector.category] = [];
      }
      groups[connector.category].push(connector);
    }
    return groups;
  }, [connectors]);

  const connectedCount = connectors.filter((c) => c.status === 'connected').length;

  return (
    <div className="flex-1 overflow-y-auto p-6 font-[Inter,sans-serif]">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#d4a574]/15 flex items-center justify-center">
                <Plug className="w-5 h-5 text-[#d4a574]" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Hub Integracji</h1>
                <p className="text-sm text-gray-500 mt-0.5">
                  Zarządzaj połączeniami z zewnętrznymi usługami
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-[#1a1a1a] rounded-lg px-3 py-2 border border-white/5">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-xs text-gray-400">
              {connectedCount} / {connectors.length} aktywnych
            </span>
          </div>
        </div>

        {/* Connector groups */}
        {categoryOrder.map((category) => {
          const items = grouped[category];
          if (!items || items.length === 0) return null;

          return (
            <div key={category}>
              <div className="flex items-center gap-3 mb-3">
                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                  {categoryLabels[category]}
                </h2>
                <div className="flex-1 h-px bg-white/5" />
                <span className="text-xs text-gray-600">
                  {items.filter((c) => c.status === 'connected').length} połączonych
                </span>
              </div>

              <div className="grid gap-3">
                {items.map((connector) => (
                  <ConnectorCard
                    key={connector.id}
                    connector={connector}
                    onToggle={() => toggleConnector(connector.id)}
                    onUpdateConfig={(config) => updateConnectorConfig(connector.id, config)}
                  />
                ))}
              </div>
            </div>
          );
        })}

        {/* Sync all button */}
        <div className="flex justify-center pt-4 pb-8">
          <button className="flex items-center gap-2 px-5 py-2.5 bg-[#1a1a1a] border border-white/10 hover:border-[#d4a574]/30 text-gray-400 hover:text-[#d4a574] rounded-xl text-sm transition-all">
            <RefreshCw className="w-4 h-4" />
            Synchronizuj wszystkie
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConnectorsHub;
