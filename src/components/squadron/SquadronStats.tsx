import { useState } from 'react';
import {
  Shield,
  Search,
  UserCheck,
  Calendar,
  Clock,
  Swords,
  Flame,
  Award,
  Users,
  Radio,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { useNavigationStore } from '@/stores';

interface Member {
  id: string;
  discordNick: string;
  wtNick: string;
  role: string;
  voiceHours: number;
  messagesCount: number;
  status: 'online' | 'sqb' | 'offline';
  brTop: string;
  specialization: string;
}

const INITIAL_MEMBERS: Member[] = [
  {
    id: '1',
    discordNick: 'Paweł #0001',
    wtNick: 'ON1PL_Pawel',
    role: 'Marszałek / Commander',
    voiceHours: 142,
    messagesCount: 1850,
    status: 'sqb',
    brTop: '5.0 (Lineup History/Meta)',
    specialization: 'Dowódca Taktyczny / Czołgi Średnie'
  },
  {
    id: '2',
    discordNick: 'Vortex #7777',
    wtNick: 'Vortex_PL',
    role: 'Generał / Officer',
    voiceHours: 98,
    messagesCount: 920,
    status: 'online',
    brTop: '5.0 (Medium Tanks)',
    specialization: 'T-34-57 / Flanker'
  },
  {
    id: '3',
    discordNick: 'Phantom #404',
    wtNick: 'Phantom_Ace',
    role: 'Kapitan / Pilot',
    voiceHours: 76,
    messagesCount: 640,
    status: 'sqb',
    brTop: '5.0 (Air Support)',
    specialization: 'CAS / Yak-3 & P-47D'
  },
  {
    id: '4',
    discordNick: 'Kowalsky #1234',
    wtNick: 'Kowalsky_WT',
    role: 'Podporucznik / SQB Squad',
    voiceHours: 45,
    messagesCount: 310,
    status: 'online',
    brTop: '5.0 (Heavy Lineup)',
    specialization: 'KW-85 / Frontline Breaker'
  },
  {
    id: '5',
    discordNick: 'Siergiej #9921',
    wtNick: 'ON1PL_Siergiej',
    role: 'Podporucznik',
    voiceHours: 38,
    messagesCount: 220,
    status: 'offline',
    brTop: '5.0 (Sherman FL10/Firefly)',
    specialization: 'Wsparcie Ogniowe'
  },
  {
    id: '6',
    discordNick: 'ThunderBolt #2026',
    wtNick: 'TBolt_PL',
    role: 'Porucznik',
    voiceHours: 62,
    messagesCount: 480,
    status: 'sqb',
    brTop: '5.0 (Anti-Air)',
    specialization: 'Ostwind / ZSU-37 AA Screen'
  }
];

const SQB_SCHEDULE = [
  { br: '14.7', dates: '01.09.2026 — 08.09.2026', active: false },
  { br: '12.0', dates: '08.09.2026 — 15.09.2026', active: false },
  { br: '11.0', dates: '15.09.2026 — 22.09.2026', active: false },
  { br: '10.0', dates: '22.09.2026 — 29.09.2026', active: false },
  { br: '9.0', dates: '29.09.2026 — 06.10.2026', active: false },
  { br: '8.0', dates: '06.10.2026 — 13.10.2026', active: false },
  { br: '7.0', dates: '13.10.2026 — 20.10.2026', active: false },
  { br: '6.0', dates: '20.10.2026 — 27.10.2026', active: false },
  { br: '5.0', dates: '27.10.2026 — 01.11.2026', active: true },
];

export function SquadronStats() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'online' | 'sqb' | 'offline'>('all');
  const { setPage } = useNavigationStore();

  const members = INITIAL_MEMBERS.filter((m) => {
    const matchSearch =
      m.discordNick.toLowerCase().includes(search.toLowerCase()) ||
      m.wtNick.toLowerCase().includes(search.toLowerCase()) ||
      m.role.toLowerCase().includes(search.toLowerCase()) ||
      m.specialization.toLowerCase().includes(search.toLowerCase());

    const matchStatus = statusFilter === 'all' || m.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const sqbActiveCount = INITIAL_MEMBERS.filter((m) => m.status === 'sqb').length;
  const onlineCount = INITIAL_MEMBERS.filter((m) => m.status !== 'offline').length;

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto overflow-y-auto h-full scrollbar-thin">
      {/* ── Nagłówek Dywizjonu ── */}
      <div className="glass-panel p-6 rounded-2xl shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30">
              SQB War Thunder Season 2026
            </span>
            <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 animate-pulse">
              <Radio className="w-3 h-3" /> Bitwy Aktywne
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight flex items-center gap-3" style={{ color: 'var(--accent)' }}>
            <Shield className="w-8 h-8" />
            Sprawdziany Dywizjonowe (SQB) & Harmonogram ^ON1PL^
          </h2>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Oficjalny terminarz bitew dywizjonowych War Thunder, timesloty operacyjne oraz ewidencja składu bojowego.
          </p>
        </div>

        <button
          onClick={() => setPage('chat')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all shadow-md active:scale-95"
          style={{
            backgroundColor: 'var(--accent)',
            color: '#121212',
          }}
        >
          <Sparkles className="w-4 h-4" />
          Zapytaj Asystenta AI o metę 5.0
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* ── Kafelki Timeslotów & Stan Gotowości ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* EU Timeslot */}
        <div className="glass-panel p-5 rounded-xl relative overflow-hidden border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Clock className="w-4 h-4" /> EU Timeslot
            </span>
            <span className="text-[11px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">
              Główny
            </span>
          </div>
          <div className="text-2xl font-black tracking-tight text-white">
            15:00 — 23:00
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Czas warszawski (CEST). Maksymalna mobilizacja składu bojowego ^ON1PL^.
          </p>
        </div>

        {/* NA Timeslot */}
        <div className="glass-panel p-5 rounded-xl relative overflow-hidden border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
              <Clock className="w-4 h-4" /> NA Timeslot
            </span>
            <span className="text-[11px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono">
              Nocny
            </span>
          </div>
          <div className="text-2xl font-black tracking-tight text-white">
            02:00 — 08:00
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Dyżur nocny i wsparcie punktowe w drabince dywizjonowej.
          </p>
        </div>

        {/* Stan Składu */}
        <div className="glass-panel p-5 rounded-xl relative overflow-hidden border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <Users className="w-4 h-4" /> Skład Bojowy
            </span>
            <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
              Online: {onlineCount}
            </span>
          </div>
          <div className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <Swords className="w-6 h-6 text-emerald-400" />
            {sqbActiveCount} w bitwie SQB
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Wymagana ranga: od Podporucznika wzwyż do udziału w składzie oficerskim.
          </p>
        </div>
      </div>

      {/* ── Harmonogram Sezonu SQB & Aktualna Meta ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Harmonogram Sezonu (BR) */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2 text-white">
              <Calendar className="w-5 h-5 text-amber-500" /> Harmonogram Sezonu SQB (Battle Rating)
            </h3>
            <span className="text-xs text-zinc-400">
              Rotacja cotygodniowa
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {SQB_SCHEDULE.map((item, index) => (
              <div
                key={index}
                className={`p-3.5 rounded-xl border transition-all duration-200 ${
                  item.active
                    ? 'bg-gradient-to-br from-amber-500/25 to-amber-900/30 border-amber-500/80 shadow-lg shadow-amber-500/10 ring-1 ring-amber-500/50'
                    : 'bg-black/20 border-zinc-800/80 opacity-60 hover:opacity-90'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-mono font-bold text-zinc-300">
                    BR {item.br}
                  </span>
                  {item.active && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-500 text-zinc-950 flex items-center gap-1 animate-pulse">
                      <Flame className="w-3 h-3 fill-current" /> AKTYWNY
                    </span>
                  )}
                </div>
                <div className="text-xs font-medium text-zinc-300">
                  {item.dates}
                </div>
                {item.active && (
                  <p className="text-[11px] text-amber-300 mt-2 font-medium">
                    Obecna meta: T-34-57, Sherman Firefly, KW-85, P-47D, Yak-3.
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Panel Taktyczny Mety 5.0 */}
        <div className="glass-panel p-6 rounded-2xl shadow-xl space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm uppercase tracking-wider mb-2">
              <Award className="w-4 h-4" /> Wytyczne Taktyczne BR 5.0
            </div>
            <h4 className="text-lg font-bold text-white mb-2">
              Priorytet Liniowy ^ON1PL^
            </h4>
            <ul className="space-y-2 text-xs text-zinc-300 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                <span><strong>Flanka i Przebicie:</strong> T-34-57 (Zis-4) oraz M4A1 (76) W – dynamiczne przejmowanie punktów centralnych.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                <span><strong>Obrona Wzgórz:</strong> KW-85 z asystą dział przeciwpancernych 57mm / 85mm.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                <span><strong>CAS & Przewaga Powietrzna:</strong> Minimum 2 pilotów w gotowości (Yak-3 jako czyściciel nieba, P-47D do eliminacji ciężkich celów).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                <span><strong>Komunikacja:</strong> Obowiązkowy kanał Discord Voice podczas okna 15:00-23:00.</span>
              </li>
            </ul>
          </div>

          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200">
            Obowiązuje od <strong>27.10.2026</strong> do <strong>01.11.2026</strong>. Po zakończeniu następuje przejście do kolejnego cyklu.
          </div>
        </div>
      </div>

      {/* ── Tabela Składu Dywizjonu & Mapowanie DC -> WT ── */}
      <div className="glass-panel p-6 rounded-2xl shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2 text-white">
              <UserCheck className="w-5 h-5 text-amber-500" />
              Ewidencja Składu Dywizjonu (Discord Nick ➔ War Thunder Nick)
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Weryfikacja rang dywizjonowych (Podporucznik+), statystyki aktywności Voice i wiadomości.
            </p>
          </div>

          {/* Filtry i wyszukiwarka */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <div className="flex rounded-lg bg-black/40 p-1 border border-zinc-700/50 text-xs">
              {(['all', 'sqb', 'online', 'offline'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setStatusFilter(filter)}
                  className={`px-3 py-1 rounded-md capitalize transition-all ${
                    statusFilter === filter
                      ? 'bg-amber-500 text-black font-bold'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {filter === 'all' ? 'Wszyscy' : filter}
                </button>
              ))}
            </div>

            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Szukaj gracza, WT, roli..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-black/30 border border-zinc-700/50 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Tabela */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-300">
            <thead className="text-xs uppercase bg-black/40 text-zinc-400 border-b border-zinc-800">
              <tr>
                <th scope="col" className="px-4 py-3">Status</th>
                <th scope="col" className="px-4 py-3">Discord Nick</th>
                <th scope="col" className="px-4 py-3">Nick War Thunder</th>
                <th scope="col" className="px-4 py-3">Ranga Dywizjonowa</th>
                <th scope="col" className="px-4 py-3">Specjalizacja</th>
                <th scope="col" className="px-4 py-3">Voice (h)</th>
                <th scope="col" className="px-4 py-3">Wiadomości</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {members.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-6 text-zinc-500 text-sm">
                    Nie znaleziono żołnierzy spełniających kryteria.
                  </td>
                </tr>
              ) : (
                members.map((member) => (
                  <tr key={member.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3">
                      {member.status === 'sqb' && (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          <Swords className="w-3 h-3" /> W bitwie SQB
                        </span>
                      )}
                      {member.status === 'online' && (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          <span className="w-2 h-2 rounded-full bg-emerald-400" /> Online
                        </span>
                      )}
                      {member.status === 'offline' && (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-zinc-700/30 text-zinc-500 border border-zinc-700/30">
                          <span className="w-2 h-2 rounded-full bg-zinc-600" /> Offline
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-semibold text-white">
                      {member.discordNick}
                    </td>
                    <td className="px-4 py-3 font-mono text-amber-400">
                      {member.wtNick}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                        {member.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-zinc-400">
                      {member.specialization}
                    </td>
                    <td className="px-4 py-3 font-mono text-zinc-200">
                      {member.voiceHours} h
                    </td>
                    <td className="px-4 py-3 font-mono text-zinc-200">
                      {member.messagesCount}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default SquadronStats;
