import React, { useState } from 'react';
import {
  Shield,
  MessageSquare,
  Mail,
  Lock,
  ArrowRight,
  AlertTriangle,
  Loader2,
  XCircle,
} from 'lucide-react';
import { useUserStore } from '@/stores';

export function LoginPage() {
  const { login, accessDenied, setAccessDenied } = useUserStore();
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const getApiUrl = (endpoint: string) => {
    const base = window.location.port === '5173' ? 'http://localhost:3001' : '';
    return `${base}${endpoint}`;
  };

  const handleDiscordOAuth = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    setAccessDenied(null);
    try {
      const res = await fetch(getApiUrl('/api/auth/discord'));
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setErrorMessage('Nie udało się wygenerować linku autoryzacji Discord.');
        setIsLoading(false);
      }
    } catch (e) {
      setErrorMessage('Błąd połączenia z serwerem autoryzacji. Upewnij się, że bot działa.');
      setIsLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch(getApiUrl('/api/auth/login-email'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        login(
          {
            id: data.user.id,
            name: data.user.displayName || data.user.username,
            role: data.user.role || 'Commander',
            avatar: data.user.avatar,
            discordId: data.user.discordId,
            email: data.user.email,
            hasGeneralRole: true,
          },
          data.token
        );
      } else {
        setErrorMessage(data.error || 'Nieprawidłowe dane logowania.');
      }
    } catch (e) {
      setErrorMessage('Błąd połączenia z serwerem logowania.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = () => {
    login({
      name: 'Paweł',
      role: 'Commander',
      discordId: 'pawel#0001',
      email: 'pawel.commander@on1pl.gg',
      hasGeneralRole: true,
    });
  };

  return (
    <div className="min-h-screen w-screen bg-[#0e0e0e] flex items-center justify-center p-4 relative overflow-hidden select-none">
      {/* Background glowing decorations */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#d4a574]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-[#181818] border border-white/10 rounded-2xl p-8 shadow-2xl relative z-10">
        {/* Squadron Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#d4a574]/20 to-[#c9956b]/10 border border-[#d4a574]/40 mb-4 shadow-lg shadow-[#d4a574]/10">
            <Shield className="w-7 h-7 text-[#d4a574]" />
          </div>
          <h1 className="text-2xl font-bold font-display tracking-tight text-white">
            ^ON1PL^ <span className="text-[#d4a574]">Command Center</span>
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Centrum Dowodzenia & Dostęp Administracyjny Dywizjonu
          </p>
        </div>

        {/* Access Denied Warning */}
        {accessDenied && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-start gap-3 animate-fade-in">
            <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-200 mb-1">Brak Wymaganych Uprawnień</p>
              <p className="text-red-300/90 leading-relaxed">{accessDenied}</p>
            </div>
          </div>
        )}

        {/* Error message */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Requirements Box */}
        <div className="bg-[#121212] border border-white/5 rounded-xl p-3 mb-6 text-xs text-gray-400 space-y-1.5">
          <div className="flex items-center gap-2 text-white font-medium">
            <span className="w-2 h-2 rounded-full bg-[#d4a574]" />
            <span>Wymóg dostępu: Ranga Generał</span>
          </div>
          <p className="text-[11px] text-gray-500 pl-4">
            Dostęp przyznawany jest wyłącznie oficerom z rangą <strong className="text-gray-300">Generał</strong> lub uprawnieniami administratora na serwerze Discord <strong className="text-gray-300">ON1PL-ONE NOVA PL</strong>.
          </p>
        </div>

        {/* OAuth Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleDiscordOAuth}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-[#5865F2] hover:bg-[#4752c4] text-white font-semibold rounded-xl transition-all duration-200 active:scale-[0.99] disabled:opacity-50 shadow-md shadow-[#5865F2]/20 text-sm"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <MessageSquare className="w-5 h-5" />
            )}
            <span>Zaloguj przez Discord (OAuth2)</span>
          </button>

          <button
            type="button"
            onClick={() => setShowEmailForm(!showEmailForm)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white font-medium rounded-xl transition-all duration-200 border border-white/5 text-xs"
          >
            <Mail className="w-4 h-4 text-[#d4a574]" />
            <span>{showEmailForm ? 'Ukryj logowanie e-mail' : 'Zaloguj przez E-mail i Hasło'}</span>
          </button>
        </div>

        {/* Email form collapse */}
        {showEmailForm && (
          <form onSubmit={handleEmailSubmit} className="mt-4 pt-4 border-t border-white/5 space-y-3 animate-fade-in">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field py-2 text-xs"
                placeholder="twoj.mail@gmail.com"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Hasło</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field py-2 text-xs"
                placeholder="Twoje hasło"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#d4a574] hover:bg-[#e0b88a] text-[#121212] font-semibold rounded-xl text-xs transition-all"
            >
              <span>Zaloguj przez E-mail</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <p className="text-[10px] text-gray-500 text-center">
              * E-mail i hasło ustawisz po pierwszym zalogowaniu przez Discord w Ustawieniach.
            </p>
          </form>
        )}

        {/* Demo Fast Bypass for Development */}
        <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-[11px] text-gray-500">
          <span>Dla dowódcy:</span>
          <button
            onClick={handleDemoLogin}
            className="text-xs text-[#d4a574] hover:underline"
          >
            Podgląd roboczy (Paweł · Dowódca)
          </button>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
