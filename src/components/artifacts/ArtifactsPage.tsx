import { useState } from 'react';
import {
  FileBox,
  Search,
  Download,
  Eye,
  Clock,
  FileText,
  FileImage,
  FileCode,
  Table,
  Plus,
  Trash2,
  Copy,
  Check,
  X,
  Sparkles,
  AlertCircle,
  FolderKanban,
} from 'lucide-react';
import { useArtifactStore, useProjectStore } from '@/stores';
import { cn } from '@/lib/utils';
import type { ArtifactItem } from '@/types';

function getTypeIcon(type: ArtifactItem['type']) {
  switch (type) {
    case 'document':
      return <FileText className="w-5 h-5 text-blue-400" />;
    case 'image':
      return <FileImage className="w-5 h-5 text-purple-400" />;
    case 'code':
      return <FileCode className="w-5 h-5 text-emerald-400" />;
    case 'spreadsheet':
      return <Table className="w-5 h-5 text-green-400" />;
    default:
      return <FileText className="w-5 h-5 text-white/50" />;
  }
}

function getTypeName(type: ArtifactItem['type']) {
  switch (type) {
    case 'document':
      return 'Dokument';
    case 'image':
      return 'Obraz';
    case 'code':
      return 'Kod';
    case 'spreadsheet':
      return 'Arkusz';
    default:
      return 'Plik';
  }
}

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

export function ArtifactsPage() {
  const { artifacts, addArtifact, deleteArtifact } = useArtifactStore();
  const { projects } = useProjectStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedArtifact, setSelectedArtifact] = useState<ArtifactItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // New artifact modal state
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<ArtifactItem['type']>('document');
  const [newContent, setNewContent] = useState('');
  const [newProject, setNewProject] = useState(projects[0]?.name || 'Centrum Operacyjne ^ON1PL^');
  const [formError, setFormError] = useState<string | null>(null);

  const filtered = artifacts.filter((a) => {
    const matchesSearch =
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.preview && a.preview.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (a.content && a.content.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = typeFilter === 'all' || a.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const handleCopyContent = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownload = (artifact: ArtifactItem) => {
    const content = artifact.content || artifact.preview || '';
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = artifact.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCreateArtifact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      setFormError('Podaj nazwę pliku / notatki.');
      return;
    }

    addArtifact({
      name: newName.trim(),
      type: newType,
      content: newContent,
      project: newProject || 'Centrum Operacyjne ^ON1PL^',
    });

    setNewName('');
    setNewContent('');
    setFormError(null);
    setIsNewModalOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Czy na pewno chcesz usunąć artefakt "${name}"?`)) {
      deleteArtifact(id);
      if (selectedArtifact?.id === id) {
        setSelectedArtifact(null);
      }
    }
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Header */}
      <div className="flex-shrink-0 px-4 sm:px-8 pt-6 sm:pt-8 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold font-display text-white flex items-center gap-3">
              <FileBox className="w-6 h-6 sm:w-7 sm:h-7 text-[#d4a574]" />
              Artefakty & Baza Danych
            </h1>
            <p className="text-white/50 text-xs sm:text-sm mt-1">
              Pliki taktyczne, skrypty rekrutacyjne i notatki operacyjne dywizjonu ^ON1PL^
            </p>
          </div>
          <button
            onClick={() => {
              setFormError(null);
              setIsNewModalOpen(true);
            }}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#d4a574] hover:bg-[#c49360] text-black font-semibold text-sm transition-all duration-200 active:scale-95 shadow-lg shadow-[#d4a574]/15 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Nowy Artefakt</span>
          </button>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="text"
              placeholder="Szukaj artefaktów i treści..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#181818] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#d4a574]/60 transition-colors"
            />
          </div>
          <div className="flex items-center gap-1 bg-[#181818] border border-white/10 rounded-xl p-1 overflow-x-auto scrollbar-none">
            {[
              { id: 'all', label: 'Wszystkie' },
              { id: 'document', label: 'Dokumenty' },
              { id: 'code', label: 'Kod' },
              { id: 'spreadsheet', label: 'Arkusze' },
              { id: 'image', label: 'Obrazy' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setTypeFilter(tab.id)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap',
                  typeFilter === tab.id
                    ? 'bg-white/10 text-white shadow-sm'
                    : 'text-white/50 hover:text-white/80'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Artifacts List */}
      <div className="flex-1 px-4 sm:px-8 pb-8">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-white/10 rounded-2xl bg-[#141414]/50 p-6">
            <div className="w-12 h-12 rounded-2xl bg-[#d4a574]/10 border border-[#d4a574]/20 flex items-center justify-center mb-3">
              <FileBox className="w-6 h-6 text-[#d4a574]" />
            </div>
            <h3 className="text-base font-semibold text-white mb-1">Brak artefaktów</h3>
            <p className="text-xs text-white/40 max-w-sm mb-4">
              Utwórz nowy artefakt lub wygeneruj skrypt/notatkę, aby zachować ją w bazie.
            </p>
            <button
              onClick={() => setIsNewModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/15 text-white text-xs font-semibold rounded-xl transition-all"
            >
              <Plus className="w-4 h-4 text-[#d4a574]" />
              Dodaj pierwszy plik
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filtered.map((artifact) => (
              <div
                key={artifact.id}
                className="group bg-[#181818] hover:bg-[#1e1e1e] border border-white/5 hover:border-white/15 rounded-2xl p-4 transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md"
              >
                <div
                  onClick={() => setSelectedArtifact(artifact)}
                  className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0 cursor-pointer"
                >
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 shrink-0 group-hover:border-[#d4a574]/30 transition-colors">
                    {getTypeIcon(artifact.type)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm text-white group-hover:text-[#d4a574] transition-colors truncate">
                        {artifact.name}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 text-white/50 border border-white/5">
                        {getTypeName(artifact.type)}
                      </span>
                      {artifact.project && (
                        <span className="text-[10px] text-[#d4a574]/80 hidden md:inline-flex items-center gap-1">
                          • {artifact.project}
                        </span>
                      )}
                    </div>
                    {artifact.preview && (
                      <p className="text-xs text-white/50 line-clamp-1 mt-1 font-mono">
                        {artifact.preview}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right actions & metadata */}
                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-white/5">
                  <div className="text-[11px] text-white/40 flex items-center gap-3">
                    <span>{artifact.size}</span>
                    <span className="hidden sm:inline">•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-white/30" />
                      {formatRelativeTime(artifact.createdAt)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setSelectedArtifact(artifact)}
                      className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
                      title="Podgląd treści"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    {artifact.content && (
                      <button
                        onClick={() => handleCopyContent(artifact.content!, artifact.id)}
                        className="p-1.5 rounded-lg text-white/40 hover:text-[#d4a574] hover:bg-white/10 transition-colors"
                        title="Kopiuj treść"
                      >
                        {copiedId === artifact.id ? (
                          <Check className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    )}

                    <button
                      onClick={() => handleDownload(artifact)}
                      className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
                      title="Pobierz"
                    >
                      <Download className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDelete(artifact.id, artifact.name)}
                      className="p-1.5 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      title="Usuń"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal 1: Podgląd Artefaktu */}
      {selectedArtifact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-2xl bg-[#181818] border border-white/10 rounded-2xl p-6 shadow-2xl relative max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-white/5 shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-xl bg-white/5 border border-white/5 shrink-0">
                  {getTypeIcon(selectedArtifact.type)}
                </div>
                <div className="min-w-0">
                  <h2 className="text-base font-bold text-white truncate">
                    {selectedArtifact.name}
                  </h2>
                  <p className="text-xs text-white/40 mt-0.5">
                    {getTypeName(selectedArtifact.type)} • {selectedArtifact.size} • {selectedArtifact.project || 'Brak projektu'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedArtifact(null)}
                className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content view */}
            <div className="flex-1 overflow-y-auto my-4 bg-[#121212] border border-white/5 rounded-xl p-4 font-mono text-xs text-white/80 whitespace-pre-wrap leading-relaxed select-text">
              {selectedArtifact.content || selectedArtifact.preview || 'Brak zapisanej treści tekstowej dla tego pliku.'}
            </div>

            {/* Footer buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-white/5 shrink-0">
              <button
                onClick={() => handleDelete(selectedArtifact.id, selectedArtifact.name)}
                className="flex items-center gap-1.5 px-3 py-2 text-red-400 hover:bg-red-500/10 rounded-xl text-xs font-semibold transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Usuń artefakt
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownload(selectedArtifact)}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-medium transition-colors border border-white/5"
                >
                  <Download className="w-3.5 h-3.5" />
                  Pobierz
                </button>
                <button
                  onClick={() =>
                    handleCopyContent(
                      selectedArtifact.content || selectedArtifact.preview || '',
                      selectedArtifact.id
                    )
                  }
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#d4a574] hover:bg-[#c49360] text-black rounded-xl text-xs font-bold transition-all active:scale-95 shadow-md shadow-[#d4a574]/20"
                >
                  {copiedId === selectedArtifact.id ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Skopiowano!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Kopiuj treść</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Nowy Artefakt */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-[#181818] border border-white/10 rounded-2xl p-6 shadow-2xl relative max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-white/5 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#d4a574]/15 border border-[#d4a574]/30 flex items-center justify-center">
                  <FileBox className="w-4 h-4 text-[#d4a574]" />
                </div>
                <h2 className="text-lg font-bold text-white">Nowy Artefakt</h2>
              </div>
              <button
                onClick={() => setIsNewModalOpen(false)}
                className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateArtifact} className="space-y-4 my-4 overflow-y-auto flex-1 pr-1">
              {formError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1.5">
                  Nazwa pliku / notatki *
                </label>
                <input
                  type="text"
                  placeholder="np. Skrypt_TikTok_Meme.txt, Taktyka_Obrony.md"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-[#121212] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#d4a574] transition-colors"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1.5">
                    Typ pliku
                  </label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as ArtifactItem['type'])}
                    className="w-full bg-[#121212] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#d4a574]"
                  >
                    <option value="document">Dokument (.md / .txt)</option>
                    <option value="code">Kod / Konfiguracja (.json / .js)</option>
                    <option value="spreadsheet">Arkusz (.csv)</option>
                    <option value="image">Obraz / Media</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1.5">
                    Przypisany projekt
                  </label>
                  <select
                    value={newProject}
                    onChange={(e) => setNewProject(e.target.value)}
                    className="w-full bg-[#121212] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#d4a574]"
                  >
                    {projects.map((p) => (
                      <option key={p.id} value={p.name}>
                        {p.name}
                      </option>
                    ))}
                    {projects.length === 0 && (
                      <option value="Centrum Operacyjne ^ON1PL^">
                        Centrum Operacyjne ^ON1PL^
                      </option>
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1.5">
                  Treść pliku lub notatki
                </label>
                <textarea
                  rows={6}
                  placeholder="Wpisz treść dokumentu, wygenerowany skrypt, notatki ze spotkania..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full bg-[#121212] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white placeholder-white/30 focus:outline-none focus:border-[#d4a574] transition-colors resize-none leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-white/60 hover:text-white hover:bg-white/5 transition-colors"
                >
                  Anuluj
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#d4a574] hover:bg-[#c49360] text-black font-semibold text-xs transition-all active:scale-95 shadow-md shadow-[#d4a574]/20"
                >
                  Dodaj artefakt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ArtifactsPage;
