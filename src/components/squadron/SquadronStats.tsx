import { useState } from 'react';
import { Shield, Mic, MessageSquare, Search, UserCheck, Gamepad2, Calendar, Clock, AlertCircle, ExternalLink } from 'lucide-react';

interface Member {
  id: string;
  discordNick: string;
  wtNick: string;
  militaryRank: string;
  voiceHours: number;
  messagesCount: number;
  status: 'online' | 'sqb' | 'offline';
  brTop: string;
}

const INITIAL_MEMBERS: Member[] = [
  { id: '1', discordNick: '.baver', wtNick: 'Baver_-', militaryRank: 'Generał', voiceHours: 156, messagesCount: 2100, status: 'sqb', brTop: '5.0 (Dowódca / Meta)' },
  { id: '2', discordNick: 'Vortex #7777', wtNick: 'Vortex_PL', militaryRank: 'Pułkownik', voiceHours: 98, messagesCount: 920, status: 'online', brTop: '5.0 (Medium Tanks)' },
  { id: '3', discordNick: 'Phantom #404', wtNick: 'Phantom_Ace', militaryRank: 'Major', voiceHours: 76, messagesCount: 640, status: 'online', brTop: '5.0 (Air Support)' },
  { id: '4', discordNick: 'Kowalsky #1234', wtNick: 'Kowalsky_WT', militaryRank: 'Porucznik', voiceHours: 45, messagesCount: 310, status: 'offline', brTop: '5.0 (Heavy Lineup)' },
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
  const members = INITIAL_MEMBERS.filter(m => 
    m.discordNick.toLowerCase().includes(search.toLowerCase()) ||
    m.wtNick.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto text-gray-200 animate-fade-in overflow-y-auto h-full scrollbar-thin">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 glass-panel p-6 rounded-2xl shadow-xl">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2 text-amber-400">
            <Shield className="w-7 h-7" />
            Bitwy Dywizjonowe (SQB) & Harmonogram ^ON1PL^
          </h2>
          <p className="text-sm text-zinc-400 mt-1">
            Oficjalny terminarz bitew dywizjonowych War Thunder, timesloty oraz ewidencja składu.
          </p>
        </div>
        
        {/* Odnośniki do zewnętrznych statystyk */}
        <div className="flex items-center gap-2">
          <a 
            href="https://statshark.net/" 
            target="_blank" 
            rel="noreferrer"
            className="flex items-center gap-1.5 text-xs bg-black/40 border border-zinc-700 hover:border-amber-500 px-3 py-2 rounded-xl text-zinc-300 transition-all"
          >
            StatShark <ExternalLink className="w-3 h-3 text-amber-400" />
          </a>
          <a 
            href="https://sre.pawjob.us/" 
            target="_blank" 
            rel="noreferrer"
            className="flex items-center gap-1.5 text-xs bg-black/40 border border-zinc-700 hover:border-amber-500 px-3 py-2 rounded-xl text-zinc-300 transition-all"
          >
            SRE Pawjob <ExternalLink className="w-3 h-3 text-amber-400" />
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl shadow-xl space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Calendar className="w-5 h-5 text-amber-400" /> Harmonogram Sezonu SQB (Battle Rating)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {SQB_SCHEDULE.map((item, idx) => (
              <div 
                key={idx} 
                className={`p-3 rounded-xl border transition-all ${
                  item.active 
                    ? 'bg-amber-500/20 border-amber-500 shadow-lg ring-1 ring-amber-500' 
                    : 'bg-black/20 border-zinc-800'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className={`text-lg font-extrabold ${item.active ? 'text-amber-400' : 'text-gray-300'}`}>
                    BR {item.br}
                  </span>
                  {item.active && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-black uppercase animate-pulse">
                      Aktywny
                    </span>
                  )}
                </div>
                <div className="text-xs mt-1 font-mono text-zinc-400">
                  {item.dates}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl shadow-xl space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-blue-400" /> Timesloty SQB
            </h3>
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/30">
                <div className="text-xs font-semibold text-blue-400 uppercase tracking-wider">EU Timeslot</div>
                <div className="text-xl font-mono font-bold mt-1 text-white">15:00 — 23:00</div>
              </div>
              <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/30">
                <div className="text-xs font-semibold text-purple-400 uppercase tracking-wider">NA Timeslot</div>
                <div className="text-xl font-mono font-bold mt-1 text-white">02:00 — 08:00</div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-amber-400 bg-amber-500/10 p-3 rounded-xl border border-amber-500/20">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Zbierz skład 10 minut przed startem tury!</span>
          </div>
        </div>
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-zinc-800 bg-black/20 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h3 className="font-semibold text-base flex items-center gap-2">
            <Gamepad2 className="w-5 h-5 text-amber-400" /> Ewidencja Składu Dywizjonu (Stopnie Wojskowe)
          </h3>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-3 w-4 h-4 text-zinc-400" />
            <input 
              type="text"
              placeholder="Szukaj gracza..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-black/30 border border-zinc-700 rounded-xl pl-9 pr-4 py-1.5 text-sm text-white focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 bg-black/10 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6">Discord (Nick DC)</th>
                <th className="py-4 px-6">War Thunder (Nick WT)</th>
                <th className="py-4 px-6">Stopień Wojskowy</th>
                <th className="py-4 px-6">Specjalizacja / Lineup</th>
                <th className="py-4 px-6"><Mic className="w-4 h-4 inline mr-1" /> Głos (h)</th>
                <th className="py-4 px-6"><MessageSquare className="w-4 h-4 inline mr-1" /> Wiadomości</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/40 text-sm">
              {members.map((m) => (
                <tr key={m.id} className="hover:bg-white/5 transition-colors">
                  <td className="py-4 px-6 flex items-center gap-3">
                    <span className={`w-2.5 h-2.5 rounded-full ${
                      m.status === 'sqb' ? 'bg-amber-500 animate-pulse' :
                      m.status === 'online' ? 'bg-emerald-500' : 'bg-zinc-600'
                    }`} />
                    <span className="text-xs uppercase font-semibold text-zinc-400">{m.status}</span>
                  </td>
                  <td className="py-4 px-6 font-mono text-amber-400 flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-amber-500" />
                    {m.discordNick}
                  </td>
                  <td className="py-4 px-6 font-mono text-blue-400 flex items-center gap-2">
                    <Gamepad2 className="w-4 h-4 text-blue-500" />
                    {m.wtNick}
                  </td>
                  <td className="py-4 px-6 font-semibold text-white">{m.militaryRank}</td>
                  <td className="py-4 px-6 text-zinc-300">{m.brTop}</td>
                  <td className="py-4 px-6 font-semibold text-white">{m.voiceHours} h</td>
                  <td className="py-4 px-6 text-zinc-400">{m.messagesCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default SquadronStats;
