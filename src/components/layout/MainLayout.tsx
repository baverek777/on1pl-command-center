import React, { useEffect } from 'react';
import { Menu, X, Shield, Search } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { SearchModal } from '@/components/search/SearchModal';
import { useNavigationStore } from '@/stores';

interface MainLayoutProps {
  children: React.ReactNode;
}

const PAGE_NAMES: Record<string, string> = {
  chat: 'Czat Taktyczny AI',
  projects: 'Projekty',
  artifacts: 'Artefakty',
  connectors: 'Integracje',
  bot: 'Panel Bota',
  content: 'Generator Treści',
  settings: 'Ustawienia',
};

export function MainLayout({ children }: MainLayoutProps) {
  const {
    searchOpen,
    setSearchOpen,
    mobileMenuOpen,
    toggleMobileMenu,
    setMobileMenuOpen,
    currentPage,
  } = useNavigationStore();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen(!searchOpen);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchOpen, setSearchOpen]);

  return (
    <div className="flex flex-col md:flex-row h-screen w-screen overflow-hidden bg-[#121212] text-white">
      {/* Mobile Top Header (md:hidden) */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-[#181818] border-b border-white/10 shrink-0 z-30">
        <div className="flex items-center gap-3">
          <button
            onClick={toggleMobileMenu}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-colors border border-white/5"
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-[#d4a574]" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-base text-[#d4a574]">^ON1PL^</span>
            <span className="text-white/40 text-xs">/ {PAGE_NAMES[currentPage] || 'Panel'}</span>
          </div>
        </div>

        <button
          onClick={() => setSearchOpen(true)}
          className="p-2 rounded-xl bg-white/5 text-white/60 hover:text-white transition-colors"
          title="Szukaj (Ctrl+K)"
        >
          <Search className="w-4 h-4" />
        </button>
      </header>

      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm md:hidden animate-fade-in"
        />
      )}

      {/* Left Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative bg-[#121212]">
        {children}
      </main>

      {/* Global Search Modal (Ctrl+K) */}
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}

export default MainLayout;
