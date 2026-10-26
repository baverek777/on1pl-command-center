import { useState } from 'react';
import {
  FolderKanban,
  Plus,
  Search,
  FileText,
  MoreHorizontal,
  Star,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Project {
  id: string;
  name: string;
  description: string;
  filesCount: number;
  lastModified: Date;
  starred: boolean;
  color: string;
}

const mockProjects: Project[] = [
  {
    id: '1',
    name: 'Strategia SQB Sezon 12',
    description: 'Plany taktyczne i składy na sprawdziany dywizjonowe',
    filesCount: 14,
    lastModified: new Date(Date.now() - 3600000),
    starred: true,
    color: '#d4a574',
  },
  {
    id: '2',
    name: 'Rekrutacja Q4 2026',
    description: 'Materiały rekrutacyjne, posty i skrypty',
    filesCount: 8,
    lastModified: new Date(Date.now() - 86400000),
    starred: true,
    color: '#4ade80',
  },
  {
    id: '3',
    name: 'TikTok Content Plan',
    description: 'Harmonogram i skrypty dla @.on1pl',
    filesCount: 23,
    lastModified: new Date(Date.now() - 172800000),
    starred: false,
    color: '#818cf8',
  },
  {
    id: '4',
    name: 'Bot ON1PL v3',
    description: 'Dokumentacja i konfiguracja bota Discord',
    filesCount: 6,
    lastModified: new Date(Date.now() - 259200000),
    starred: false,
    color: '#f472b6',
  },
  {
    id: '5',
    name: 'Analiza Meta WT',
    description: 'Bieżąca analiza mety War Thunder dla top BR',
    filesCount: 11,
    lastModified: new Date(Date.now() - 432000000),
    starred: false,
    color: '#fb923c',
  },
];

function formatRelativeTime(date: Date): string {
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 60) return `${minutes} min temu`;
  if (hours < 24) return `${hours}h temu`;
  return `${days}d temu`;
}

export function ProjectsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'starred'>('all');

  const filteredProjects = mockProjects.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'all' || p.starred;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex-shrink-0 px-8 pt-8 pb-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold font-display text-white flex items-center gap-3">
              <FolderKanban className="w-7 h-7 text-copper" />
              Projekty
            </h1>
            <p className="text-white/50 text-sm mt-1">
              Organizuj pliki, dokumenty i zasoby dywizjonu
            </p>
          </div>
          <button className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Nowy Projekt
          </button>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="text"
              placeholder="Szukaj projektów..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <div className="flex items-center gap-1 bg-stealth-600 rounded-lg p-1">
            <button
              onClick={() => setFilter('all')}
              className={cn(
                'px-3 py-1.5 rounded-md text-sm transition-all',
                filter === 'all'
                  ? 'bg-stealth-400 text-white'
                  : 'text-white/50 hover:text-white/70'
              )}
            >
              Wszystkie
            </button>
            <button
              onClick={() => setFilter('starred')}
              className={cn(
                'px-3 py-1.5 rounded-md text-sm transition-all flex items-center gap-1.5',
                filter === 'starred'
                  ? 'bg-stealth-400 text-white'
                  : 'text-white/50 hover:text-white/70'
              )}
            >
              <Star className="w-3.5 h-3.5" />
              Ulubione
            </button>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="flex-1 overflow-y-auto px-8 pb-8 scrollbar-thin">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="card-interactive group"
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className="w-3 h-3 rounded-full mt-1"
                  style={{ backgroundColor: project.color }}
                />
                <div className="flex items-center gap-1">
                  {project.starred && (
                    <Star className="w-4 h-4 text-copper fill-copper" />
                  )}
                  <button className="p-1 rounded hover:bg-stealth-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreHorizontal className="w-4 h-4 text-white/50" />
                  </button>
                </div>
              </div>
              <h3 className="text-white font-semibold mb-1">{project.name}</h3>
              <p className="text-white/40 text-sm mb-4">{project.description}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs text-white/30">
                  <span className="flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5" />
                    {project.filesCount} plików
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {formatRelativeTime(project.lastModified)}
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-copper transition-colors" />
              </div>
            </div>
          ))}

          {/* New Project Card */}
          <div className="border-2 border-dashed border-stealth-400/30 rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-copper/30 hover:bg-stealth-700/50 transition-all min-h-[160px]">
            <div className="w-10 h-10 rounded-full bg-stealth-600 flex items-center justify-center">
              <Plus className="w-5 h-5 text-white/40" />
            </div>
            <span className="text-sm text-white/40">Utwórz nowy projekt</span>
          </div>
        </div>
      </div>
    </div>
  );
}
