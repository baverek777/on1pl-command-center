import { useState } from 'react';
import {
  FolderKanban,
  Plus,
  Search,
  Star,
  Clock,
  Trash2,
  X,
  Sparkles,
  FileText,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { useProjectStore, useArtifactStore } from '@/stores';
import { cn } from '@/lib/utils';
import type { ProjectItem } from '@/types';

const COLOR_OPTIONS = [
  { label: 'Miedziany klanowy', value: '#d4a574' },
  { label: 'Złoty elitarny', value: '#eab308' },
  { label: 'Szmaragdowy', value: '#10b981' },
  { label: 'Szafirowy', value: '#3b82f6' },
  { label: 'Purpurowy', value: '#8b5cf6' },
  { label: 'Bursztynowy', value: '#f97316' },
];

function formatRelativeTime(dateStr: string): string {
  try {
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 2) return 'przed chwilą';
    if (minutes < 60) return `${minutes} min temu`;
    if (hours < 24) return `${hours}h temu`;
    return `${days}d temu`;
  } catch {
    return 'niedawno';
  }
}

export function ProjectsPage() {
  const { projects, addProject, deleteProject, toggleStarProject } = useProjectStore();
  const { artifacts } = useArtifactStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'starred'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New project form state
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [projectColor, setProjectColor] = useState(COLOR_OPTIONS[0].value);
  const [formError, setFormError] = useState<string | null>(null);

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'all' || p.starred;
    return matchesSearch && matchesFilter;
  });

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim()) {
      setFormError('Podaj nazwę projektu.');
      return;
    }

    addProject({
      name: projectName.trim(),
      description: projectDescription.trim() || 'Projekt dywizjonowy ^ON1PL^',
      color: projectColor,
    });

    setProjectName('');
    setProjectDescription('');
    setProjectColor(COLOR_OPTIONS[0].value);
    setFormError(null);
    setIsModalOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Czy na pewno chcesz usunąć projekt "${name}"?`)) {
      deleteProject(id);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Header */}
      <div className="flex-shrink-0 px-4 sm:px-8 pt-6 sm:pt-8 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold font-display text-white flex items-center gap-3">
              <FolderKanban className="w-6 h-6 sm:w-7 sm:h-7 text-[#d4a574]" />
              Projekty Dywizjonu
            </h1>
            <p className="text-white/50 text-xs sm:text-sm mt-1">
              Organizuj i zarządzaj zasobami, skryptami oraz dokumentacją ^ON1PL^
            </p>
          </div>
          <button
            onClick={() => {
              setFormError(null);
              setIsModalOpen(true);
            }}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#d4a574] hover:bg-[#c49360] text-black font-semibold text-sm transition-all duration-200 active:scale-95 shadow-lg shadow-[#d4a574]/15 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Nowy Projekt</span>
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="text"
              placeholder="Szukaj w projektach..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#181818] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#d4a574]/60 transition-colors"
            />
          </div>
          <div className="flex items-center gap-1 bg-[#181818] border border-white/10 rounded-xl p-1 self-start sm:self-auto">
            <button
              onClick={() => setFilter('all')}
              className={cn(
                'px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all',
                filter === 'all'
                  ? 'bg-white/10 text-white shadow-sm'
                  : 'text-white/50 hover:text-white/80'
              )}
            >
              Wszystkie ({projects.length})
            </button>
            <button
              onClick={() => setFilter('starred')}
              className={cn(
                'px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center gap-1.5',
                filter === 'starred'
                  ? 'bg-white/10 text-white shadow-sm'
                  : 'text-white/50 hover:text-white/80'
              )}
            >
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>Ulubione</span>
            </button>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="flex-1 px-4 sm:px-8 pb-8">
        {filteredProjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-white/10 rounded-2xl bg-[#141414]/50 p-6">
            <div className="w-12 h-12 rounded-2xl bg-[#d4a574]/10 border border-[#d4a574]/20 flex items-center justify-center mb-3">
              <FolderKanban className="w-6 h-6 text-[#d4a574]" />
            </div>
            <h3 className="text-base font-semibold text-white mb-1">
              {filter === 'starred' ? 'Brak ulubionych projektów' : 'Brak projektów'}
            </h3>
            <p className="text-xs text-white/40 max-w-sm mb-4">
              {filter === 'starred'
                ? 'Kliknij gwiazdkę przy dowolnym projekcie, aby dodać go do ulubionych.'
                : 'Utwórz swój pierwszy projekt, aby uporządkować dokumenty i materiały dywizjonu.'}
            </p>
            {filter !== 'starred' && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/15 text-white text-xs font-semibold rounded-xl transition-all"
              >
                <Plus className="w-4 h-4 text-[#d4a574]" />
                Dodaj projekt
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProjects.map((project) => {
              // Count artifacts in this project
              const projectArtifactsCount = artifacts.filter(
                (a) => a.project === project.name
              ).length;

              return (
                <div
                  key={project.id}
                  className="group relative bg-[#181818] hover:bg-[#1e1e1e] border border-white/5 hover:border-white/15 rounded-2xl p-5 transition-all duration-200 flex flex-col justify-between shadow-lg hover:shadow-black/40"
                >
                  <div>
                    {/* Top row: Color indicator & Star & Delete */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                          style={{ backgroundColor: project.color || '#d4a574' }}
                        />
                        <span className="text-[11px] font-mono text-white/40 uppercase tracking-wider">
                          Projekt ^ON1PL^
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => toggleStarProject(project.id)}
                          className="p-1.5 rounded-lg text-white/30 hover:text-amber-400 hover:bg-white/5 transition-all"
                          title={project.starred ? 'Usuń z ulubionych' : 'Dodaj do ulubionych'}
                        >
                          <Star
                            className={cn(
                              'w-4 h-4',
                              project.starred
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-white/40'
                            )}
                          />
                        </button>
                        <button
                          onClick={() => handleDelete(project.id, project.name)}
                          className="p-1.5 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                          title="Usuń projekt"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Title & Description */}
                    <h3 className="text-base font-bold text-white group-hover:text-[#d4a574] transition-colors mb-2">
                      {project.name}
                    </h3>
                    <p className="text-xs text-white/60 line-clamp-3 leading-relaxed mb-4">
                      {project.description}
                    </p>
                  </div>

                  {/* Bottom stats & last modified */}
                  <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-white/40">
                    <span className="flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-white/30" />
                      {projectArtifactsCount > 0
                        ? `${projectArtifactsCount} plików`
                        : `${project.filesCount || 0} plików`}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-white/30" />
                      {formatRelativeTime(project.lastModified)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal: Nowy Projekt */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-[#181818] border border-white/10 rounded-2xl p-6 shadow-2xl relative">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#d4a574]/15 border border-[#d4a574]/30 flex items-center justify-center">
                  <FolderKanban className="w-4 h-4 text-[#d4a574]" />
                </div>
                <h2 className="text-lg font-bold text-white">Nowy Projekt</h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-4">
              {formError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1.5">
                  Nazwa projektu *
                </label>
                <input
                  type="text"
                  placeholder="np. Rekrutacja Wiosna 2026, Kampania TikTok"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full bg-[#121212] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#d4a574] transition-colors"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1.5">
                  Opis
                </label>
                <textarea
                  rows={3}
                  placeholder="Krótki opis celów projektu, przypisanych osób i zadań..."
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  className="w-full bg-[#121212] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#d4a574] transition-colors resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/70 mb-2">
                  Kolor wyróżniający
                </label>
                <div className="flex items-center gap-2.5">
                  {COLOR_OPTIONS.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setProjectColor(c.value)}
                      style={{ backgroundColor: c.value }}
                      className={cn(
                        'w-7 h-7 rounded-full transition-transform active:scale-95 shadow-md',
                        projectColor === c.value
                          ? 'ring-2 ring-white ring-offset-2 ring-offset-[#181818] scale-110'
                          : 'opacity-70 hover:opacity-100'
                      )}
                      title={c.label}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-white/60 hover:text-white hover:bg-white/5 transition-colors"
                >
                  Anuluj
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#d4a574] hover:bg-[#c49360] text-black font-semibold text-xs transition-all active:scale-95 shadow-md shadow-[#d4a574]/20"
                >
                  Utwórz projekt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProjectsPage;
