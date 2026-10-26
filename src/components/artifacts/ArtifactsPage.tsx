import { useState } from 'react';
import {
  FileBox,
  Search,
  Filter,
  Download,
  Eye,
  Clock,
  FileText,
  FileImage,
  FileCode,
  Table,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Artifact {
  id: string;
  name: string;
  type: 'document' | 'image' | 'code' | 'spreadsheet';
  size: string;
  createdAt: Date;
  project?: string;
  preview?: string;
}

const mockArtifacts: Artifact[] = [
  {
    id: '1',
    name: 'Strategia_SQB_S12.md',
    type: 'document',
    size: '24 KB',
    createdAt: new Date(Date.now() - 3600000),
    project: 'Strategia SQB Sezon 12',
    preview: 'Analiza składów i taktyk na sprawdziany dywizjonowe...',
  },
  {
    id: '2',
    name: 'lineup_117_rb.json',
    type: 'code',
    size: '4.2 KB',
    createdAt: new Date(Date.now() - 7200000),
    project: 'Analiza Meta WT',
    preview: '{"lineup": [{"vehicle": "Leopard 2A7V", "br": "11.7"}...]}',
  },
  {
    id: '3',
    name: 'rekrutacja_post_v3.md',
    type: 'document',
    size: '8 KB',
    createdAt: new Date(Date.now() - 86400000),
    project: 'Rekrutacja Q4 2026',
    preview: '🏆 ^ON1PL^ szuka nowych pilotów i czołgistów...',
  },
  {
    id: '4',
    name: 'tiktok_skrypt_meme.txt',
    type: 'document',
    size: '2.1 KB',
    createdAt: new Date(Date.now() - 172800000),
    project: 'TikTok Content Plan',
    preview: 'Hook: "Kiedy grasz 11.7 i widzisz 4 Gripeny..."',
  },
  {
    id: '5',
    name: 'sqb_wyniki_s11.csv',
    type: 'spreadsheet',
    size: '156 KB',
    createdAt: new Date(Date.now() - 432000000),
    project: 'Strategia SQB Sezon 12',
    preview: 'Data,Wynik,Rating,Uczestnicy...',
  },
  {
    id: '6',
    name: 'on1pl_banner.png',
    type: 'image',
    size: '2.4 MB',
    createdAt: new Date(Date.now() - 604800000),
    project: 'Rekrutacja Q4 2026',
  },
];

function getTypeIcon(type: Artifact['type']) {
  switch (type) {
    case 'document':
      return <FileText className="w-5 h-5 text-blue-400" />;
    case 'image':
      return <FileImage className="w-5 h-5 text-purple-400" />;
    case 'code':
      return <FileCode className="w-5 h-5 text-emerald-400" />;
    case 'spreadsheet':
      return <Table className="w-5 h-5 text-green-400" />;
  }
}

function getTypeName(type: Artifact['type']) {
  switch (type) {
    case 'document': return 'Dokument';
    case 'image': return 'Obraz';
    case 'code': return 'Kod';
    case 'spreadsheet': return 'Arkusz';
  }
}

function formatRelativeTime(date: Date): string {
  const diff = Date.now() - date.getTime();
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (hours < 24) return `${hours}h temu`;
  return `${days}d temu`;
}

export function ArtifactsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const filtered = mockArtifacts.filter((a) => {
    const matchesSearch = a.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || a.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex-shrink-0 px-8 pt-8 pb-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold font-display text-white flex items-center gap-3">
              <FileBox className="w-7 h-7 text-copper" />
              Artefakty
            </h1>
            <p className="text-white/50 text-sm mt-1">
              Wygenerowane pliki, dokumenty i zasoby
            </p>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="text"
              placeholder="Szukaj artefaktów..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <div className="flex items-center gap-1 bg-stealth-600 rounded-lg p-1">
            {(['all', 'document', 'code', 'spreadsheet', 'image'] as const).map(
              (type) => (
                <button
                  key={type}
                  onClick={() => setTypeFilter(type)}
                  className={cn(
                    'px-3 py-1.5 rounded-md text-sm transition-all',
                    typeFilter === type
                      ? 'bg-stealth-400 text-white'
                      : 'text-white/50 hover:text-white/70'
                  )}
                >
                  {type === 'all'
                    ? 'Wszystkie'
                    : getTypeName(type as Artifact['type'])}
                </button>
              )
            )}
          </div>
        </div>
      </div>

      {/* Artifacts List */}
      <div className="flex-1 overflow-y-auto px-8 pb-8 scrollbar-thin">
        <div className="space-y-2 mt-4">
          {filtered.map((artifact) => (
            <div
              key={artifact.id}
              className="card-interactive flex items-center gap-4 group"
            >
              <div className="w-10 h-10 rounded-lg bg-stealth-600 flex items-center justify-center flex-shrink-0">
                {getTypeIcon(artifact.type)}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-medium text-sm truncate">
                  {artifact.name}
                </h3>
                <div className="flex items-center gap-2 text-xs text-white/30 mt-0.5">
                  {artifact.project && (
                    <>
                      <span className="text-copper/70">{artifact.project}</span>
                      <span>·</span>
                    </>
                  )}
                  <span>{artifact.size}</span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatRelativeTime(artifact.createdAt)}
                  </span>
                </div>
                {artifact.preview && (
                  <p className="text-white/20 text-xs mt-1 truncate">
                    {artifact.preview}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-2 rounded-lg hover:bg-stealth-500 text-white/40 hover:text-white">
                  <Eye className="w-4 h-4" />
                </button>
                <button className="p-2 rounded-lg hover:bg-stealth-500 text-white/40 hover:text-white">
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-white/30">
            <Filter className="w-10 h-10 mb-3" />
            <p className="text-sm">Brak artefaktów pasujących do filtrów</p>
          </div>
        )}
      </div>
    </div>
  );
}
