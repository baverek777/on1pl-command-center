import React, { useState, useEffect } from 'react';
import { Settings, Palette, User, Lock, Save } from 'lucide-react';
import { useSettingsStore, useUserStore } from '@/stores';

export function SettingsPanel() {
  const { settings, updateSettings } = useSettingsStore();
  const { user, updateProfile } = useUserStore();

  const [currentTheme, setCurrentTheme] = useState(() => {
    return localStorage.getItem('on1pl_theme') || settings.theme || 'stealth';
  });

  // Edytowalne dane profilu
  const [profile, setProfile] = useState({
    nickname: user.name || 'Baver_-',
    discordId: user.discordId || '.baver',
    email: user.email || 'baver@on1pl.gg',
    rank: user.role || 'Generał',
    password: '',
    confirmPassword: '',
  });

  const [saved, setSaved] = useState(false);

  useEffect(() => {
    document.body.className = '';
    if (currentTheme !== 'stealth') {
      document.body.classList.add(`theme-${currentTheme}`);
    }
    localStorage.setItem('on1pl_theme', currentTheme);
    updateSettings({ theme: currentTheme as any });
  }, [currentTheme, updateSettings]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name: profile.nickname,
      discordId: profile.discordId,
      email: profile.email,
      role: profile.rank as any,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto text-gray-200 animate-fade-in overflow-y-auto h-full scrollbar-thin">
      <div className="flex justify-between items-center glass-panel p-6 rounded-2xl shadow-xl">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2 text-amber-400">
            <Settings className="w-7 h-7" />
            Ustawienia & Bezpieczeństwo
          </h2>
          <p className="text-sm text-zinc-400 mt-1">
            Konfiguracja profilu, uprawnień rangi oraz preferencji interfejsu dywizjonu ^ON1PL^.
          </p>
        </div>
        {saved && (
          <span className="bg-emerald-500/20 border border-emerald-500 text-emerald-400 text-xs px-4 py-2 rounded-xl font-medium animate-bounce">
            Zmiany zostały zapisane pomyślnie!
          </span>
        )}
      </div>

      {/* Wybór motywów */}
      <div className="glass-panel p-6 rounded-2xl shadow-xl space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Palette className="w-5 h-5 text-amber-400" /> Motyw Interfejsu
        </h3>
        <p className="text-xs text-zinc-400">Wybierz jeden z dedykowanych motywów operacyjnych</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          {[
            { id: 'stealth', name: 'Stealth Dark', desc: '#121212 + miedziane akcenty' },
            { id: 'midnight', name: 'Midnight Black', desc: 'Głęboka czerń + neon blue' },
            { id: 'cloud', name: 'Cloud Light', desc: 'Jasny Glassmorphism #F0F4F8' },
            { id: 'cyber', name: 'Cyber Gold', desc: 'Wysoki kontrast + złoto' },
          ].map((theme) => (
            <button
              key={theme.id}
              type="button"
              onClick={() => setCurrentTheme(theme.id)}
              className={`p-4 rounded-xl border text-left transition-all ${
                currentTheme === theme.id
                  ? 'bg-amber-500/20 border-amber-500 shadow-lg ring-1 ring-amber-500'
                  : 'bg-black/30 border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <div className="font-semibold text-white text-sm">{theme.name}</div>
              <div className="text-[11px] text-zinc-400 mt-1">{theme.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Profil Dowódcy - W pełni edytowalny */}
      <form onSubmit={handleSave} className="glass-panel p-6 rounded-2xl shadow-xl space-y-6">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <User className="w-5 h-5 text-amber-400" /> Profil Gracza & Dowódcy
          </h3>
          <p className="text-xs text-zinc-400">Twoje dane w panelu dowodzenia ^ON1PL^</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
              Nick w War Thunder (WT)
            </label>
            <input
              type="text"
              value={profile.nickname}
              onChange={(e) => setProfile({ ...profile, nickname: e.target.value })}
              className="w-full bg-black/40 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
              Stopień Wojskowy
            </label>
            <select
              value={profile.rank}
              onChange={(e) => setProfile({ ...profile, rank: e.target.value })}
              className="w-full bg-black/40 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
            >
              <option value="Założyciel">Założyciel</option>
              <option value="Marszałek">Marszałek</option>
              <option value="Generał">Generał</option>
              <option value="Generał broni">Generał broni</option>
              <option value="Generał dywizji">Generał dywizji</option>
              <option value="Generał brygady">Generał brygady</option>
              <option value="Pułkownik">Pułkownik</option>
              <option value="Podpułkownik">Podpułkownik</option>
              <option value="Major">Major</option>
              <option value="Kapitan">Kapitan</option>
              <option value="Porucznik">Porucznik</option>
              <option value="Podporucznik">Podporucznik</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
              Discord ID (Nick DC)
            </label>
            <input
              type="text"
              value={profile.discordId}
              onChange={(e) => setProfile({ ...profile, discordId: e.target.value })}
              className="w-full bg-black/40 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
              E-mail powiadomień
            </label>
            <input
              type="email"
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              className="w-full bg-black/40 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Logowanie e-mail i hasło */}
        <div className="border-t border-zinc-800 pt-6 space-y-4">
          <h3 className="text-md font-semibold flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-400" /> Logowanie bezpośrednie (E-mail i Hasło)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                Nowe hasło
              </label>
              <input
                type="password"
                placeholder="Min. 6 znaków"
                value={profile.password}
                onChange={(e) => setProfile({ ...profile, password: e.target.value })}
                className="w-full bg-black/40 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                Powtórz hasło
              </label>
              <input
                type="password"
                placeholder="Powtórz hasło"
                value={profile.confirmPassword}
                onChange={(e) => setProfile({ ...profile, confirmPassword: e.target.value })}
                className="w-full bg-black/40 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-black font-semibold px-6 py-3 rounded-xl transition-all shadow-lg active:scale-95 cursor-pointer"
          >
            <Save className="w-4 h-4" /> Zapisz zmiany
          </button>
        </div>
      </form>
    </div>
  );
}

export default SettingsPanel;
