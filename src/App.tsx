import { useEffect, useState } from 'react';
import { useNavigationStore, useUserStore } from '@/stores';
import { MainLayout } from '@/components/layout/MainLayout';
import { ChatView } from '@/components/chat/ChatView';
import { BotPanel } from '@/components/bot/BotPanel';
import { ConnectorsHub } from '@/components/connectors/ConnectorsHub';
import { ContentGenerator } from '@/components/content/ContentGenerator';
import { SettingsPanel } from '@/components/settings/SettingsPanel';
import { LoginPage } from '@/components/auth/LoginPage';
import { ProjectsPage } from '@/components/projects/ProjectsPage';
import { ArtifactsPage } from '@/components/artifacts/ArtifactsPage';

function AppContent() {
  const { currentPage } = useNavigationStore();

  const renderPage = () => {
    switch (currentPage) {
      case 'chat':
        return <ChatView />;
      case 'bot':
        return <BotPanel />;
      case 'connectors':
        return <ConnectorsHub />;
      case 'content':
        return <ContentGenerator />;
      case 'settings':
        return <SettingsPanel />;
      case 'projects':
        return <ProjectsPage />;
      case 'artifacts':
        return <ArtifactsPage />;
      default:
        return <ChatView />;
    }
  };

  return <MainLayout>{renderPage()}</MainLayout>;
}

export default function App() {
  const { isAuthenticated, login, setAccessDenied } = useUserStore();
  const [checkingAuth, setCheckingAuth] = useState(false);

  // Handle OAuth callback parameters on load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const hasAccess = params.get('hasAccess');
    const error = params.get('error');

    if (error) {
      setAccessDenied('Wystąpił błąd podczas logowania przez Discord. Spróbuj ponownie.');
      window.history.replaceState({}, document.title, window.location.pathname);
      return;
    }

    if (token) {
      if (hasAccess === 'false') {
        setAccessDenied(
          'Odmowa dostępu. Do centrum dowodzenia ^ON1PL^ mają wgląd wyłącznie osoby posiadające rangę Generał lub uprawnienia Administratora na serwerze ON1PL-ONE NOVA PL.'
        );
        window.history.replaceState({}, document.title, window.location.pathname);
        return;
      }

      setCheckingAuth(true);
      const apiBase = window.location.port === '5173' ? 'http://localhost:3001' : '';
      fetch(`${apiBase}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.user) {
            login(
              {
                id: data.user.id,
                name: data.user.displayName || data.user.username,
                role: data.user.role || 'Commander',
                avatar: data.user.avatar,
                discordId: `${data.user.username}`,
                email: data.user.email,
                hasGeneralRole: data.user.hasGeneralRole,
                memberRoles: data.user.memberRoles,
                isOnOn1plServer: data.user.isOnOn1plServer,
              },
              token
            );
          }
        })
        .catch((e) => {
          console.error('Błąd pobierania profilu:', e);
        })
        .finally(() => {
          setCheckingAuth(false);
          window.history.replaceState({}, document.title, window.location.pathname);
        });
    }
  }, [login, setAccessDenied]);

  if (checkingAuth) {
    return (
      <div className="min-h-screen w-screen bg-[#0e0e0e] flex items-center justify-center text-white font-mono text-sm">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#d4a574] border-t-transparent rounded-full animate-spin" />
          <span>Autoryzacja rangi Generał w dywizjonie ^ON1PL^...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return <AppContent />;
}
