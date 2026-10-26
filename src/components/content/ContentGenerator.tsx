import { useState, useCallback } from 'react';
import {
  PenTool,
  FileText,
  Video,
  Users,
  Copy,
  Sparkles,
  ChevronDown,
  Check,
  Eye,
  Wand2,
  Send,
} from 'lucide-react';

type TabId = 'announcements' | 'tiktok' | 'recruitment';

const tabs: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'announcements', label: 'Ogłoszenia', icon: FileText },
  { id: 'tiktok', label: 'TikTok / Memy', icon: Video },
  { id: 'recruitment', label: 'Rekrutacja', icon: Users },
];

type AnnouncementTemplate = 'clan' | 'rules' | 'event';
type TikTokTone = 'serious' | 'shitpost' | 'meme' | 'recruitment';
type RecruitmentPlatform = 'discord' | 'forum' | 'reddit';

const templateLabels: Record<AnnouncementTemplate, string> = {
  clan: 'Ogłoszenie klanowe',
  rules: 'Aktualizacja zasad',
  event: 'Event',
};

const toneLabels: Record<TikTokTone, string> = {
  serious: 'Poważny',
  shitpost: 'Shitpost',
  meme: 'Meme',
  recruitment: 'Rekrutacyjny',
};

const platformLabels: Record<RecruitmentPlatform, string> = {
  discord: 'Discord',
  forum: 'Forum WT',
  reddit: 'Reddit',
};

const sampleAnnouncements: Record<AnnouncementTemplate, string> = {
  clan: `📢 **OGŁOSZENIE DYWIZJONU ^ON1PL^**

Dowódcy, piloci, czołgiści — mamy ważne wieści!

🎯 **Sprawdzian Dywizjonowy #48** odbędzie się w sobotę o 20:00.
📋 BR: 11.7 | Tryb: RB
👥 Wymagana obecność minimum 12 graczy.

⚡ Lineup obowiązkowy:
• Leopard 2A7V / Strv 122B+
• PUMA / Begleitpanzer
• Tornado / Gripen

Zapisy w kanale #sqb-zapisy. Brak obecności bez zgłoszenia = ostrzeżenie.

— Dowództwo ^ON1PL^`,

  rules: `📜 **AKTUALIZACJA REGULAMINU ^ON1PL^**

Z dniem dzisiejszym wprowadzamy następujące zmiany:

1️⃣ Minimalna aktywność: 3 SQB w miesiącu (było: 2)
2️⃣ Nowy system rang — szczegóły w #regulamin
3️⃣ Obowiązkowy lineup check przed każdym SQB

❓ Pytania kierujcie do oficerów.
✅ Potwierdzenie zapoznania się — reaguj ✅ pod tą wiadomością.`,

  event: `🎮 **EVENT: TURNIEJ WEWNĘTRZNY ^ON1PL^**

📅 Data: Niedziela, 20:00
🏆 Format: 1v1, Single Elimination
🎯 BR: 7.7 Ground RB

💰 Nagrody:
🥇 Rola VIP + custom avatar
🥈 Rola Honorowa
🥉 Wspomnienie w kronikach klanu

📝 Zapisy: reaguj 🎮 pod tą wiadomością
⏰ Deadline zapisów: Sobota 23:59`,
};

const sampleScripts: Record<TikTokTone, string> = {
  serious: `🎬 SKRYPT @.on1pl — POWAŻNY

[0:00-0:03] HACZYK:
"Dywizjon, który wygrywa 73% SQB... oto jak to robimy."
(pokazanie statystyk na ekranie)

[0:03-0:08] INTRO:
Szybkie cięcia z najlepszych momentów SQB
Muzyka: epicki ambient

[0:08-0:25] TREŚĆ GŁÓWNA:
• Pokaz lineup strategy
• Callouts i komunikacja drużynowa
• Key plays z ostatniego SQB

[0:25-0:30] CTA:
"Chcesz dołączyć do ^ON1PL^? Link w bio."
(logo + overlay z zaproszeniem Discord)

📝 Notatki:
- Napisy PL + EN
- Aspect ratio: 9:16
- Sugerowane hashtagi: #warthunder #squadron #esports`,

  shitpost: `🎬 SKRYPT @.on1pl — SHITPOST

[0:00-0:02] HACZYK:
"POV: Dołączyłeś do ^ON1PL^ i pierwszy SQB za 5 minut"
(panika.mp3)

[0:02-0:05] 
Losowe cięcia: ktoś respawnuje się 3 razy w 10 sekund
Tekst na ekranie: "to będzie dobrze"

[0:05-0:12]
Montaż absurdów z gry:
• Helikopter zderza się z drzewem
• Ktoś pisze "GG" po 30 sekundach
• Bomb drop na własny czołg

[0:12-0:15] 
Zwrot akcji: wygrana 16:0
Tekst: "Nani?!"

📝 Notatki:
- Dużo efektów dźwiękowych
- Vine boom obowiązkowy
- #shitpost #warthundermemes`,

  meme: `🎬 SKRYPT @.on1pl — MEME

[0:00-0:02] HACZYK:
Klasyczny meme template: Drake / Expanding brain / Distracted BF
Kontekst: lineup do SQB

[0:02-0:08] SETUP:
❌ "Branie jednego czołgu na SQB"
❌ "Branie lineup bez AA"
❌ "Branie premium czołgu"
✅ "Branie KV-2 na 11.7 bo haha duża lufa"

[0:08-0:12] PUNCHLINE:
Footage: KV-2 one-shotuje Leoparda 2
Całe lobby: 💀

[0:12-0:15] OUTRO:
"Subscribe dla więcej ^ON1PL^ content"
(logo)

📝 Notatki:
- Użyj popularnego fontu meme
- Trending audio jeśli pasuje`,

  recruitment: `🎬 SKRYPT @.on1pl — REKRUTACJA

[0:00-0:03] HACZYK:
"Szukasz dywizjonu, który traktuje SQB poważnie?"
(epicka muzyka + statystyki ^ON1PL^)

[0:03-0:10] WARTOŚĆ:
"W ^ON1PL^ oferujemy:"
• ✅ Regularne SQB (3-4x/tydzień)
• ✅ Coaching od TOP graczy
• ✅ Aktywna społeczność Discord
• ✅ System rang i progresji

[0:10-0:20] DOWODY:
• Montaż z wygranych SQB
• Screeny z rankingu dywizjonów
• Fragmenty voice chatu (hype po wygranej)

[0:20-0:25] WYMAGANIA:
"Czego szukamy:"
• BR 11.0+ (Ground RB)
• Aktywność 3+ SQB/miesiąc
• Discord + mikrofon

[0:25-0:30] CTA:
"Link do Discord w bio — dołącz już dziś! 🔥"

📝 Notatki:
- Professional vibe
- Dobre oświetlenie napisów
- #warthunder #recruitment #squadron #LFG`,
};

function AnnouncementsTab() {
  const [template, setTemplate] = useState<AnnouncementTemplate>('clan');
  const [content, setContent] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(true);

  const handleGenerateAI = () => {
    setContent(sampleAnnouncements[template]);
  };

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [content]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Editor */}
      <div className="space-y-4">
        {/* Template selector */}
        <div className="relative">
          <label className="text-xs text-gray-500 mb-1.5 block">Szablon</label>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="w-full flex items-center justify-between bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white hover:border-[#d4a574]/30 transition-colors"
          >
            <span>{templateLabels[template]}</span>
            <ChevronDown className="w-4 h-4 text-gray-500" />
          </button>
          {showDropdown && (
            <div className="absolute z-10 mt-1 w-full bg-[#1e1e1e] border border-white/10 rounded-lg shadow-xl overflow-hidden">
              {(Object.keys(templateLabels) as AnnouncementTemplate[]).map((key) => (
                <button
                  key={key}
                  onClick={() => {
                    setTemplate(key);
                    setShowDropdown(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-sm hover:bg-white/5 transition-colors ${
                    template === key ? 'text-[#d4a574]' : 'text-gray-300'
                  }`}
                >
                  {templateLabels[key]}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Text area */}
        <div>
          <label className="text-xs text-gray-500 mb-1.5 block">Treść</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Wpisz treść ogłoszenia lub wygeneruj automatycznie..."
            className="w-full h-64 bg-[#1a1a1a] border border-white/10 rounded-lg p-4 text-sm text-white placeholder-gray-600 resize-none focus:outline-none focus:border-[#d4a574]/40 transition-colors font-mono"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleGenerateAI}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#d4a574] hover:bg-[#c9956b] text-black text-sm font-medium rounded-lg transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            Generuj AI
          </button>
          <button
            onClick={handleCopy}
            disabled={!content}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#1a1a1a] border border-white/10 hover:border-[#d4a574]/30 text-gray-300 disabled:text-gray-600 disabled:hover:border-white/10 text-sm rounded-lg transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Skopiowano!' : 'Kopiuj do Discord'}
          </button>
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="ml-auto flex items-center gap-2 px-3 py-2.5 text-gray-500 hover:text-gray-300 text-sm transition-colors lg:hidden"
          >
            <Eye className="w-4 h-4" />
            Podgląd
          </button>
        </div>
      </div>

      {/* Preview */}
      {showPreview && (
        <div>
          <label className="text-xs text-gray-500 mb-1.5 block">Podgląd Discord</label>
          <div className="bg-[#36393f] rounded-lg overflow-hidden border border-white/5">
            <div className="border-l-4 border-[#d4a574] p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-full bg-[#d4a574]/30 flex items-center justify-center">
                  <span className="text-[10px] font-bold text-[#d4a574]">B</span>
                </div>
                <span className="text-sm font-semibold text-[#d4a574]">^ON1PL^ Bot</span>
                <span className="text-[10px] bg-[#5865f2] text-white px-1.5 py-0.5 rounded font-medium">
                  BOT
                </span>
                <span className="text-[10px] text-gray-500 ml-auto">Dzisiaj o {new Date().getHours()}:{String(new Date().getMinutes()).padStart(2, '0')}</span>
              </div>
              <div className="text-sm text-gray-200 whitespace-pre-wrap break-words leading-relaxed">
                {content || (
                  <span className="text-gray-500 italic">
                    Wpisz treść lub kliknij „Generuj AI" aby zobaczyć podgląd...
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TikTokTab() {
  const [tone, setTone] = useState<TikTokTone>('serious');
  const [script, setScript] = useState('');
  const [copied, setCopied] = useState(false);

  const handleGenerate = () => {
    setScript(sampleScripts[tone]);
  };

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(script);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [script]);

  return (
    <div className="space-y-6">
      {/* Tone selector */}
      <div>
        <label className="text-xs text-gray-500 mb-2 block">Ton skryptu @.on1pl</label>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(toneLabels) as TikTokTone[]).map((t) => (
            <button
              key={t}
              onClick={() => setTone(t)}
              className={`px-4 py-2 text-sm rounded-lg border transition-all ${
                tone === t
                  ? 'bg-[#d4a574]/15 border-[#d4a574]/40 text-[#d4a574]'
                  : 'bg-[#1a1a1a] border-white/10 text-gray-400 hover:border-white/20'
              }`}
            >
              {toneLabels[t]}
            </button>
          ))}
        </div>
      </div>

      {/* Generate button */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleGenerate}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#d4a574] hover:bg-[#c9956b] text-black text-sm font-medium rounded-lg transition-colors"
        >
          <Wand2 className="w-4 h-4" />
          Generuj Skrypt
        </button>
        {script && (
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#1a1a1a] border border-white/10 hover:border-[#d4a574]/30 text-gray-300 text-sm rounded-lg transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Skopiowano!' : 'Kopiuj skrypt'}
          </button>
        )}
      </div>

      {/* Script display */}
      {script && (
        <div className="bg-[#1a1a1a] rounded-xl border border-white/5 overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/5 bg-white/[0.02]">
            <Video className="w-4 h-4 text-[#d4a574]" />
            <span className="text-xs font-medium text-gray-400">
              Skrypt — {toneLabels[tone]}
            </span>
          </div>
          <pre className="p-4 text-sm text-gray-300 whitespace-pre-wrap font-[Inter,sans-serif] leading-relaxed">
            {script}
          </pre>
        </div>
      )}
    </div>
  );
}

function RecruitmentTab() {
  const [title, setTitle] = useState('');
  const [requirements, setRequirements] = useState('BR 11.0+, 3+ SQB/miesiąc, Discord + mikrofon');
  const [stats, setStats] = useState('K/D: 1.0+, WR: 50%+');
  const [description, setDescription] = useState('');
  const [platform, setPlatform] = useState<RecruitmentPlatform>('discord');
  const [generated, setGenerated] = useState('');
  const [copied, setCopied] = useState(false);

  const handleGenerate = () => {
    const platformFormats: Record<RecruitmentPlatform, string> = {
      discord: `🎯 **${title || 'REKRUTACJA DO ^ON1PL^'}**

Dywizjon **^ON1PL^** szuka nowych członków!

📋 **Wymagania:**
${requirements.split(',').map((r) => `• ${r.trim()}`).join('\n')}

📊 **Statystyki:**
${stats.split(',').map((s) => `• ${s.trim()}`).join('\n')}

🏛️ **O dywizjonie:**
${description || 'Aktywny dywizjon z regularnym uczestnictwem w SQB. Przyjazna atmosfera, doświadczeni gracze, regularne eventy.'}

🔗 **Jak dołączyć?**
Napisz do oficera lub dowódcy na Discordzie.

— ^ON1PL^ Rekrutacja`,

      forum: `[b][size=150]${title || 'REKRUTACJA DO ^ON1PL^'}[/size][/b]

Dywizjon [b]^ON1PL^[/b] prowadzi rekrutację!

[b]Wymagania:[/b]
[list]
${requirements.split(',').map((r) => `[*]${r.trim()}`).join('\n')}
[/list]

[b]Statystyki:[/b]
[list]
${stats.split(',').map((s) => `[*]${s.trim()}`).join('\n')}
[/list]

[b]O nas:[/b]
${description || 'Aktywny dywizjon z regularnym uczestnictwem w SQB. Przyjazna atmosfera, doświadczeni gracze, regularne eventy.'}

[b]Kontakt:[/b] Discord ^ON1PL^`,

      reddit: `# ${title || 'REKRUTACJA DO ^ON1PL^'} [PC/EU]

**Dywizjon ^ON1PL^** szuka aktywnych graczy!

## Wymagania:
${requirements.split(',').map((r) => `- ${r.trim()}`).join('\n')}

## Statystyki:
${stats.split(',').map((s) => `- ${s.trim()}`).join('\n')}

## O nas:
${description || 'Aktywny dywizjon z regularnym uczestnictwem w SQB. Przyjazna atmosfera, doświadczeni gracze, regularne eventy.'}

## Jak dołączyć?
Napisz w komentarzu lub skontaktuj się przez Discord.

---
*^ON1PL^ — War Thunder Squadron*`,
    };

    setGenerated(platformFormats[platform]);
  };

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(generated);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [generated]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Form */}
      <div className="space-y-4">
        <div>
          <label className="text-xs text-gray-500 mb-1.5 block">Tytuł</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Rekrutacja do ^ON1PL^"
            className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#d4a574]/40 transition-colors"
          />
        </div>

        <div>
          <label className="text-xs text-gray-500 mb-1.5 block">Wymagania (BR, aktywność)</label>
          <input
            type="text"
            value={requirements}
            onChange={(e) => setRequirements(e.target.value)}
            className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#d4a574]/40 transition-colors"
          />
        </div>

        <div>
          <label className="text-xs text-gray-500 mb-1.5 block">Statystyki</label>
          <input
            type="text"
            value={stats}
            onChange={(e) => setStats(e.target.value)}
            className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#d4a574]/40 transition-colors"
          />
        </div>

        <div>
          <label className="text-xs text-gray-500 mb-1.5 block">Opis dywizjonu</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Opisz dywizjon, jego cele i atmosferę..."
            className="w-full h-28 bg-[#1a1a1a] border border-white/10 rounded-lg p-4 text-sm text-white placeholder-gray-600 resize-none focus:outline-none focus:border-[#d4a574]/40 transition-colors"
          />
        </div>

        {/* Platform selector */}
        <div>
          <label className="text-xs text-gray-500 mb-2 block">Platforma</label>
          <div className="flex gap-2">
            {(Object.keys(platformLabels) as RecruitmentPlatform[]).map((p) => (
              <button
                key={p}
                onClick={() => setPlatform(p)}
                className={`px-4 py-2 text-sm rounded-lg border transition-all ${
                  platform === p
                    ? 'bg-[#d4a574]/15 border-[#d4a574]/40 text-[#d4a574]'
                    : 'bg-[#1a1a1a] border-white/10 text-gray-400 hover:border-white/20'
                }`}
              >
                {platformLabels[p]}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleGenerate}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#d4a574] hover:bg-[#c9956b] text-black text-sm font-medium rounded-lg transition-colors"
          >
            <Send className="w-4 h-4" />
            Generuj post
          </button>
          {generated && (
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#1a1a1a] border border-white/10 hover:border-[#d4a574]/30 text-gray-300 text-sm rounded-lg transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Skopiowano!' : 'Kopiuj'}
            </button>
          )}
        </div>
      </div>

      {/* Preview */}
      <div>
        <label className="text-xs text-gray-500 mb-1.5 block">
          Podgląd — {platformLabels[platform]}
        </label>
        <div className="bg-[#1a1a1a] rounded-xl border border-white/5 overflow-hidden">
          <pre className="p-4 text-sm text-gray-300 whitespace-pre-wrap font-[Inter,sans-serif] leading-relaxed max-h-[500px] overflow-y-auto">
            {generated || (
              <span className="text-gray-600 italic">
                Wypełnij formularz i kliknij „Generuj post" aby zobaczyć podgląd...
              </span>
            )}
          </pre>
        </div>
      </div>
    </div>
  );
}

export function ContentGenerator() {
  const [activeTab, setActiveTab] = useState<TabId>('announcements');

  return (
    <div className="flex-1 overflow-y-auto p-6 font-[Inter,sans-serif]">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#d4a574]/15 flex items-center justify-center">
            <PenTool className="w-5 h-5 text-[#d4a574]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Generator Treści</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Twórz ogłoszenia, skrypty i posty rekrutacyjne dla ^ON1PL^
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 bg-[#1a1a1a] rounded-xl p-1 border border-white/5 w-fit">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-all ${
                  activeTab === tab.id
                    ? 'bg-[#d4a574]/15 text-[#d4a574]'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        <div className="bg-[#1e1e1e] rounded-xl border border-white/5 p-6">
          {activeTab === 'announcements' && <AnnouncementsTab />}
          {activeTab === 'tiktok' && <TikTokTab />}
          {activeTab === 'recruitment' && <RecruitmentTab />}
        </div>
      </div>
    </div>
  );
}

export default ContentGenerator;
