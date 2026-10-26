import React, { useState } from 'react';
import {
  Settings,
  User,
  Shield,
  Bot,
  Link,
  Globe,
  Bell,
  Sparkles,
  Copy,
  Check,
  Trash2,
  ExternalLink,
  Save,
  RefreshCw,
  Server,
  Zap,
  KeyRound,
  Lock,
} from 'lucide-react';
import { useSettingsStore, useUserStore, useBotStore } from '@/stores';
import type { ShareLink } from '@/types';
import { cn, generateId } from '@/lib/utils';

export function SettingsPanel() {
  const { settings, updateSettings } = useSettingsStore();
  const { user, updateProfile, sessionToken } = useUserStore();
  const { status, setStatus } = useBotStore();

  // Local form states
  const [userName, setUserName] = useState(user.name);
  const [userRole, setUserRole] = useState(user.role);
  const [tunnelInput, setTunnelInput] = useState(settings.tunnelUrl);
  const [apiEndpointInput, setApiEndpointInput] = useState(settings.botApiEndpoint);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Email + password link states
  const [linkEmailInput, setLinkEmailInput] = useState(user.email || '');
  const [linkPasswordInput, setLinkPasswordInput] = useState('');
  const [linkPasswordConfirm, setLinkPasswordConfirm] = useState('');
  const [linkSuccess, setLinkSuccess] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);
  const [isLinking, setIsLinking] = useState(false);

  // Share links state
  const [shareLinks, setShareLinks] = useState<ShareLink[]>([
    {
      id: 'sh-1',
      url: 'https://on1pl.gg/invite/adm_9f3a8b',
      expiresAt: new Date(Date.now() + 86400000 * 7),
      createdBy: 'Paweł (Commander)',
      permissions: ['view', 'edit', 'admin'],
      usageCount: 1,
      maxUsages: 3,
    },
    {
      id: 'sh-2',
      url: 'https://on1pl.gg/invite/sqb_2c11d0',
      expiresAt: new Date(Date.now() + 86400000 * 2),
      createdBy: 'Paweł (Commander)',
      permissions: ['view'],
      usageCount: 4,
      maxUsages: 10,
    },
  ]);

  // New share link modal/form state
  const [newPermissions, setNewPermissions] = useState<('view' | 'edit' | 'admin')[]>(['view', 'edit']);
  const [newExpiryDays, setNewExpiryDays] = useState<number>(7);
  const [newMaxUsages, setNewMaxUsages] = useState<number>(5);

  const handleSaveGeneral = () => {
    updateProfile({ name: userName, role: userRole });
    updateSettings({
      tunnelUrl: tunnelInput,
      botApiEndpoint: apiEndpointInput,
    });
    setStatus({ tunnelUrl: tunnelInput });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleLinkCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkEmailInput || !linkPasswordInput) return;
    if (linkPasswordInput.length < 6) {
      setLinkError('Hasło musi mieć co najmniej 6 znaków.');
      return;
    }
    if (linkPasswordInput !== linkPasswordConfirm) {
      setLinkError('Hasła nie są identyczne.');
      return;
    }
    setIsLinking(true);
    setLinkError(null);
    try {
      const apiBase = window.location.port === '5173' ? 'http://localhost:3001' : '';
      const res = await fetch(`${apiBase}/api/auth/link-credentials`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: sessionToken ? `Bearer ${sessionToken}` : '',
        },
        body: JSON.stringify({ email: linkEmailInput, password: linkPasswordInput }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        updateProfile({ email: linkEmailInput, emailLinked: true });
        setLinkSuccess(true);
        setLinkPasswordInput('');
        setLinkPasswordConfirm('');
        setTimeout(() => setLinkSuccess(false), 3000);
      } else {
        setLinkError(data.error || 'Błąd zapisu danych logowania.');
      }
    } catch (err) {
      setLinkError('Błąd połączenia z serwerem.');
    } finally {
      setIsLinking(false);
    }
  };

  const handleGenerateShareLink = () => {
    const code = generateId().slice(0, 8);
    const newLink: ShareLink = {
      id: `sh-${Date.now()}`,
      url: `https://on1pl.gg/invite/adm_${code}`,
      expiresAt: new Date(Date.now() + newExpiryDays * 86400000),
      createdBy: `${user.name} (${user.role})`,
      permissions: [...newPermissions],
      usageCount: 0,
      maxUsages: newMaxUsages,
    };
    setShareLinks([newLink, ...shareLinks]);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(id);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  const handleRevokeLink = (id: string) => {
    setShareLinks(shareLinks.filter((l) => l.id !== id));
  };

  const togglePermission = (perm: 'view' | 'edit' | 'admin') => {
    if (newPermissions.includes(perm)) {
      if (newPermissions.length > 1) {
        setNewPermissions(newPermissions.filter((p) => p !== perm));
      }
    } else {
      setNewPermissions([...newPermissions, perm]);
    }
  };

  return (
    <div className="flex-1 h-full overflow-y-auto px-6 py-8 scrollbar-thin">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-5">
          <div>
            <h1 className="text-2xl font-bold font-display text-white flex items-center gap-3">
              <Settings className="w-7 h-7 text-[#d4a574]" />
              Ustawienia & Bezpieczeństwo
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Konfiguracja profilu, uprawnień rangi Generał oraz danych logowania ^ON1PL^
            </p>
          </div>
          <button
            onClick={handleSaveGeneral}
            className="flex items-center gap-2 px-4 py-2 bg-[#d4a574] text-[#121212] font-semibold rounded-lg hover:bg-[#e0b88a] transition-all"
          >
            {saveSuccess ? (
              <>
                <Check className="w-4 h-4 text-emerald-950" />
                Zapisano!
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Zapisz zmiany
              </>
            )}
          </button>
        </div>

        {/* Section 1: Profil Administratora */}
        <div className="bg-[#181818] border border-white/5 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-lg bg-[#d4a574]/15 text-[#d4a574] flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Profil Dowódcy</h2>
              <p className="text-xs text-gray-400">Twoje dane w panelu dowodzenia ^ON1PL^</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">Imię / Nick</label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="input-field"
                placeholder="Paweł"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">Rola w dywizjonie</label>
              <select
                value={userRole}
                onChange={(e) => setUserRole(e.target.value as any)}
                className="input-field"
              >
                <option value="Commander">Commander (Generał / Dowódca)</option>
                <option value="Officer">Officer (Oficer)</option>
                <option value="Member">Member (Członek)</option>
                <option value="Recruit">Recruit (Rekrut)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">Discord ID</label>
              <input
                type="text"
                disabled
                value={user.discordId || 'pawel#0001'}
                className="input-field opacity-60 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">E-mail powiadomień</label>
              <input
                type="email"
                value={user.email || ''}
                disabled
                placeholder="Podepnij e-mail w sekcji poniżej"
                className="input-field opacity-75"
              />
            </div>
          </div>
        </div>

        {/* Section 1.5: Podłącz E-mail i Hasło (Dostęp z telefonu / bez Discorda) */}
        <div className="bg-[#181818] border border-[#d4a574]/25 rounded-2xl p-6 relative overflow-hidden">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-lg bg-[#d4a574]/15 text-[#d4a574] flex items-center justify-center">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Logowanie przez E-mail i Hasło (Dostęp bez Discorda)</h2>
              <p className="text-xs text-gray-400">
                Podepnij swój e-mail, aby móc logować się do panelu z telefonu nawet gdy nie masz pod ręką Discorda.
              </p>
            </div>
          </div>

          <form onSubmit={handleLinkCredentials} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">Twój E-mail</label>
                <input
                  type="email"
                  value={linkEmailInput}
                  onChange={(e) => setLinkEmailInput(e.target.value)}
                  className="input-field"
                  placeholder="twoj.mail@gmail.com"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">Nowe hasło</label>
                <input
                  type="password"
                  value={linkPasswordInput}
                  onChange={(e) => setLinkPasswordInput(e.target.value)}
                  className="input-field"
                  placeholder="Min. 6 znaków"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">Powtórz hasło</label>
                <input
                  type="password"
                  value={linkPasswordConfirm}
                  onChange={(e) => setLinkPasswordConfirm(e.target.value)}
                  className="input-field"
                  placeholder="Powtórz hasło"
                  required
                />
              </div>
            </div>

            {linkError && (
              <p className="text-xs text-amber-400">{linkError}</p>
            )}

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-gray-500">
                * Konto jest trwale powiązane z Twoją rangą Generał na serwerze Discord ^ON1PL^.
              </span>
              <button
                type="submit"
                disabled={isLinking}
                className="flex items-center gap-2 px-4 py-2 bg-[#d4a574] hover:bg-[#e0b88a] text-[#121212] font-semibold text-xs rounded-lg transition-all"
              >
                {linkSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-950" />
                    Zapisano dane logowania!
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    Zapisz e-mail i hasło
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Section 2: Konfiguracja Bota Discord & Tunelu Cloudflare */}
        <div className="bg-[#181818] border border-white/5 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-indigo-500/15 text-indigo-400 flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-white">Połączenie z Botem Discord</h2>
                <p className="text-xs text-gray-400">Endpoint tunelu Cloudflare oraz lokalny serwis bota</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'w-2.5 h-2.5 rounded-full',
                  status.tunnelStatus === 'connected' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                )}
              />
              <span className="text-xs text-gray-300 capitalize">
                {status.tunnelStatus === 'connected' ? 'Połączony' : 'Offline / Sprawdzanie'}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">
                Aktywny adres tunelu Cloudflare (trycloudflare.com)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tunnelInput}
                  onChange={(e) => setTunnelInput(e.target.value)}
                  placeholder="https://on1pl-bot-random.trycloudflare.com"
                  className="input-field font-mono text-sm"
                />
                <button
                  onClick={() => {
                    setStatus({ tunnelStatus: 'checking' });
                    setTimeout(() => setStatus({ tunnelStatus: 'connected' }), 1000);
                  }}
                  title="Sprawdź połączenie"
                  className="px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-300 hover:text-white transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">
                Wewnętrzny port API bota
              </label>
              <input
                type="text"
                value={apiEndpointInput}
                onChange={(e) => setApiEndpointInput(e.target.value)}
                placeholder="http://localhost:3001"
                className="input-field font-mono text-sm"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Generator Bezpiecznych Linków Dostępowych dla Administratorów */}
        <div className="bg-[#181818] border border-white/5 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-white">Generator Linków Dostępowych</h2>
                <p className="text-xs text-gray-400">Bezpieczne zaproszenia dla oficerów i administratorów dywizjonu</p>
              </div>
            </div>
          </div>

          {/* Generator Controls */}
          <div className="bg-[#141414] border border-white/5 rounded-xl p-4 mb-6">
            <h3 className="text-xs font-semibold text-gray-300 uppercase tracking-wider mb-3">
              Utwórz nowe jednorazowe/ograniczone zaproszenie
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Uprawnienia</label>
                <div className="flex flex-wrap gap-2">
                  {(['view', 'edit', 'admin'] as const).map((perm) => (
                    <button
                      key={perm}
                      onClick={() => togglePermission(perm)}
                      className={cn(
                        'px-2.5 py-1 text-xs rounded-md border font-medium transition-colors',
                        newPermissions.includes(perm)
                          ? 'bg-[#d4a574]/20 border-[#d4a574] text-[#d4a574]'
                          : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                      )}
                    >
                      {perm === 'view' ? 'Podgląd' : perm === 'edit' ? 'Edycja' : 'Admin'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Ważność linku</label>
                <select
                  value={newExpiryDays}
                  onChange={(e) => setNewExpiryDays(Number(e.target.value))}
                  className="input-field py-1.5 text-xs"
                >
                  <option value={1}>24 godziny</option>
                  <option value={7}>7 dni</option>
                  <option value={30}>30 dni</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Max użyć</label>
                <select
                  value={newMaxUsages}
                  onChange={(e) => setNewMaxUsages(Number(e.target.value))}
                  className="input-field py-1.5 text-xs"
                >
                  <option value={1}>1 użycie (jednorazowy)</option>
                  <option value={3}>3 użycia</option>
                  <option value={10}>10 użyć</option>
                  <option value={50}>50 użyć</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleGenerateShareLink}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-[#d4a574] hover:text-[#121212] text-white text-xs font-semibold rounded-lg transition-all"
            >
              <KeyRound className="w-3.5 h-3.5" />
              Wygeneruj bezpieczny link
            </button>
          </div>

          {/* Active Links Table */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Aktywne linki dostępowe ({shareLinks.length})
            </h3>
            {shareLinks.map((link) => (
              <div
                key={link.id}
                className="flex items-center justify-between p-3 bg-[#141414] border border-white/5 rounded-xl hover:border-white/10 transition-colors"
              >
                <div className="flex-1 min-w-0 pr-4">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-[#d4a574] truncate">{link.url}</span>
                    <div className="flex gap-1 shrink-0">
                      {link.permissions.map((p) => (
                        <span key={p} className="badge badge-copper text-[10px]">
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1">
                    Użycia: {link.usageCount} / {link.maxUsages} • Wygasa za{' '}
                    {Math.ceil((link.expiresAt.getTime() - Date.now()) / 86400000)} dni
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleCopy(link.url, link.id)}
                    className="p-1.5 rounded hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                    title="Kopiuj link"
                  >
                    {copiedLink === link.id ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => handleRevokeLink(link.id)}
                    className="p-1.5 rounded hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors"
                    title="Unieważnij"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 4: Gotowość Komercyjna & Multi-Server Deployment */}
        <div className="bg-[#181818] border border-white/5 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center">
                <Server className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-white">Gotowość Komercyjna & Multi-Guild</h2>
                <p className="text-xs text-gray-400">Skalowalna architektura do obsługi wielu dywizjonów War Thunder</p>
              </div>
            </div>
            <span className="badge badge-copper">Plan Dywizjon Pro</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            <div className="p-3 bg-[#141414] border border-white/5 rounded-xl">
              <p className="text-xs text-gray-400">Serwery Discord</p>
              <p className="text-lg font-bold text-white mt-1">1 / 5</p>
              <p className="text-[10px] text-gray-500">Główny: ON1PL-ONE NOVA PL</p>
            </div>
            <div className="p-3 bg-[#141414] border border-white/5 rounded-xl">
              <p className="text-xs text-gray-400">Zapytania AI</p>
              <p className="text-lg font-bold text-white mt-1">Nielimitowane</p>
              <p className="text-[10px] text-emerald-400">Polski model taktyczny</p>
            </div>
            <div className="p-3 bg-[#141414] border border-white/5 rounded-xl">
              <p className="text-xs text-gray-400">Architektura API & Bota</p>
              <p className="text-lg font-bold text-white mt-1">Aktywna 24/7</p>
              <p className="text-[10px] text-[#d4a574]">Render Cloud + Discord Gateway</p>
            </div>
          </div>
        </div>

        {/* Section 5: O aplikacji */}
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-xs text-gray-500">
          <div>
            <p className="text-gray-300 font-medium">^ON1PL^ Command Center v2.4.0</p>
            <p>Zbudowano dla społeczności War Thunder Dywizjonu ^ON1PL^</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[#d4a574]">Status: Operacyjny</span>
            <span>•</span>
            <span>Ranga autoryzowana: Generał</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsPanel;
