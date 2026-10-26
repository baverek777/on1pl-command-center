import { useState, useCallback } from 'react';
import {
  PenTool,
  FileText,
  Video,
  Users,
  Copy,
  Sparkles,
  Check,
  Eye,
  Wand2,
  Send,
  Loader2,
  FileBox,
  AlertCircle,
  Megaphone,
} from 'lucide-react';
import { useArtifactStore, useUserStore } from '@/stores';
import { cn } from '@/lib/utils';

type TabId = 'announcements' | 'tiktok' | 'recruitment';
type AnnouncementTemplate = 'clan' | 'rules' | 'event';
type TikTokTone = 'serious' | 'shitpost' | 'meme' | 'recruitment';
type RecruitmentPlatform = 'discord' | 'forum' | 'social';

const TIKTOK_SCRIPTS: Record<TikTokTone, string[]> = {
  serious: [
    `🎬 SKRYPT @.on1pl — POWAŻNY (SQB FOCUS)

[0:00-0:03] HACZYK:
"Szukasz dywizjonu, który traktuje bitwy dywizjonowe z pełnym profesjonalizmem?"
(W tle: dynamiczne ujęcie czołgu Leopard 2A7V z logiem ^ON1PL^)

[0:03-0:10] WARTOŚĆ:
"W ^ON1PL^ oferujemy:
• Regularne bitwy dywizjonowe SQB w zgranym składzie
• Zaawansowany coaching od doświadczonych dowódców
• Pełną analitykę i wsparcie na voice-chacie"

[0:10-0:20] DOWÓD:
(Kompilacja najlepszych momentów z bitew klanowych, czyste zestrzelenia i wygrane 16:0)

[0:20-0:25] WYMAGANIA:
• Ground RB / Air RB na wysokim poziomie
• Sprawny mikrofon i kultura osobista
• Chęć ciągłego progresu w grze

[0:25-0:30] CTA:
"Link do rekrutacji na naszym Discordzie w bio — dołącz do elity!"

#warthunder #on1pl #squadron #esports #groundrb`,
    `🎬 SKRYPT @.on1pl — POWAŻNY (TAKTYKA & ANALIZA)

[0:00-0:03] HACZYK:
"Dlaczego większość dywizjonów przegrywa bitwy dywizjonowe w pierwszych 3 minutach?"

[0:03-0:12] ANALIZA:
"Brak koordynacji OPL oraz brak przewagi wysokości w powietrzu. W ^ON1PL^ każdy gracz ma wyznaczone zadanie jeszcze przed odliczaniem startowym."

[0:12-0:22] PREZENTACJA:
(Ujęcia z rozstawienia na mapie, osłona przeciwlotnicza, zrzuty amunicji precyzyjnej)

[0:22-0:30] CTA:
"Chcesz grać z najlepszymi, a nie losowymi graczami? Wejdź w link w bio i złóż podanie!"

#warthunder #gaming #on1pl #tactics`,
  ],

  shitpost: [
    `🎬 SKRYPT @.on1pl — SHITPOST

[0:00-0:02] HACZYK:
"POV: Dołączyłeś do ^ON1PL^ i Twój pierwszy mecz dywizjonowy zaczyna się za 30 sekund"
(Dźwięk: panika.mp3 / sirena)

[0:02-0:06]
(Gracz gorączkowo próbuje naprawić czołg, podczas gdy w tle słychać dowódcę krzyczącego pozycję wroga)

[0:06-0:14]
(Szybki montaż: ktoś zderza się z drzewem, helikopter rozbija się o telegraf, po czym gracz przypadkowo trafia wrogi samolot z armaty 120mm)

[0:14-0:20]
(Cisza... po czym pojawia się ekran 'VICTORY' i wynik 16:0)
Tekst na ekranie: "Wszystko zgodnie z planem."

[0:20-0:25] CTA:
"Dołącz do naszego cyrku na Discordzie — link w profilu! 😂"

#warthunder #shitpost #on1pl #memes #gamingcomedy`,
  ],

  meme: [
    `🎬 SKRYPT @.on1pl — MEME (FORMAT DRAKE / EXPANDING BRAIN)

[0:00-0:03] HACZYK:
"Granie w pojedynkę vs Granie w dywizjonie ^ON1PL^"

[0:03-0:08] SCENA 1:
❌ Gra solo:
- 5 przegranych z rzędu
- Team rozjeżdża się po rogach mapy
- Bomba zrzuca Cię po 15 sekundach

[0:08-0:16] SCENA 2:
✅ Gra w ^ON1PL^:
- Pełna osłona przeciwlotnicza
- Informacje o pozycji wroga co 2 sekundy
- Wygrany mecz za meczem i darmowe srebrne lwy

[0:16-0:22] CTA:
"Przestań cierpieć w randomach. Kliknij link w bio i dołącz do ^ON1PL^!"

#warthunder #wtmemes #on1pl #polskigaming`,
  ],

  recruitment: [
    `🎬 SKRYPT @.on1pl — REKRUTACYJNY

[0:00-0:03] HACZYK:
"Szukasz aktywnego, polskiego dywizjonu w War Thunder? ^ON1PL^ otwiera rekrutację!"

[0:03-0:12] CO OFERUJEMY:
• Codzienne wspólne bitwy i treningi
• Zgrana ekipa na Discordzie (180+ członków)
• Własne boty, statystyki i wsparcie taktyczne
• Brak toksyczności i dojrzałe podejście

[0:12-0:20] CZEGO WYMAGAMY:
• Aktywności w grze
• Posiadania Discorda i sprawnego mikrofonu
• Chęci gry zespołowej

[0:20-0:26] CTA:
"Wejdź na discord.gg/on1pl lub sprawdź link w naszym profilu! Czekamy na Ciebie!"

#rekrutacja #warthunderpl #on1pl #polska`,
  ],
};

const SAMPLE_ANNOUNCEMENTS: Record<AnnouncementTemplate, { title: string; content: string }> = {
  clan: {
    title: '📢 Oficjalne Ogłoszenie Dywizjonu ^ON1PL^',
    content: `Dowódcy, oficerowie i członkowie dywizjonu!

Informujemy o nadchodzących wspólnych manewrach dywizjonowych oraz podsumowaniu aktywności klanowej.

🎯 **Kluczowe informacje:**
• Wspólne bitwy odbędą się w ten weekend o 20:00
• Prosimy o wcześniejszą obecność na kanale głosowym Discord
• Każdy członek proszony jest o weryfikację składu maszyn

Wszelkie usprawiedliwienia nieobecności prosimy zgłaszać oficerom.
Do zobaczenia na polu bitwy!

— Dowództwo ^ON1PL^`,
  },
  rules: {
    title: '📜 Aktualizacja Regulaminu Dywizjonu ^ON1PL^',
    content: `Z dniem dzisiejszym wchodzi w życie zaktualizowany regulamin dywizjonu.

1️⃣ **Kultura i komunikacja:** Wzajemny szacunek na kanałach tekstowych i głosowych jest bezwzględnym priorytetem.
2️⃣ **Aktywność klanowa:** Minimalna aktywność wynosi co najmniej jedno wspólne posiedzenie w tygodniu.
3️⃣ **Obecność na zebraniach:** Rangi oficerskie zobowiązane są do regularnego udziału w naradach taktycznych.

Szczegółowy regulamin dostępny jest w zakładce #regulamin na naszym serwerze Discord.`,
  },
  event: {
    title: '🎮 Turniej Wewnętrzny Dywizjonu ^ON1PL^',
    content: `Zapraszamy wszystkich graczy ^ON1PL^ do wzięcia udziału w oficjalnym turnieju dywizjonowym!

🏆 **Format turnieju:**
• System pucharowy (Double Elimination)
• Wybór maszyn: uzgodniony wedle regulaminu turniejowego
• Transmisja i komentarz na żywo na voice-chacie

🎁 **Nagrody:**
🥇 1. Miejsce: Tytuł Mistrza Dywizjonu + rola specjalna na Discordzie
🥈 2. Miejsce: Wyróżnienie w kronice klanowej
🥉 3. Miejsce: Rola Honorowa

Zapisy przyjmujemy do piątku do godziny 22:00.`,
  },
};

export function ContentGenerator() {
  const { addArtifact } = useArtifactStore();
  const { user } = useUserStore();

  const [activeTab, setActiveTab] = useState<TabId>('tiktok');

  // TikTok state
  const [tiktokTone, setTiktokTone] = useState<TikTokTone>('serious');
  const [tiktokScript, setTiktokScript] = useState<string>(TIKTOK_SCRIPTS.serious[0]);
  const [copiedScript, setCopiedScript] = useState(false);
  const [savedArtifactNotice, setSavedArtifactNotice] = useState<string | null>(null);

  // Announcement state
  const [announcementTemplate, setAnnouncementTemplate] = useState<AnnouncementTemplate>('clan');
  const [announcementTitle, setAnnouncementTitle] = useState(SAMPLE_ANNOUNCEMENTS.clan.title);
  const [announcementContent, setAnnouncementContent] = useState(SAMPLE_ANNOUNCEMENTS.clan.content);
  const [copiedAnnouncement, setCopiedAnnouncement] = useState(false);
  const [isSendingDiscord, setIsSendingDiscord] = useState(false);
  const [sendSuccess, setSendSuccess] = useState<string | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);

  // Recruitment state
  const [recruitPlatform, setRecruitPlatform] = useState<RecruitmentPlatform>('discord');
  const [minBR, setMinBR] = useState('10.0+');
  const [recruitText, setRecruitText] = useState(`🏆 **DYWIZJON ^ON1PL^ OTWIERA REKRUTACJĘ!**

Szukasz zgranego zespołu, wysokiej kultury gry i regularnych wspólnych bitew? Dołącz do nas!

🛡️ **KIM JESTEŚMY?**
Jesteśmy aktywnym polskim dywizjonem zrzeszającym pasjonatów War Thunder. Stawiamy na zgranie, komunikację i wzajemny szacunek.

📋 **NASZE WYMAGANIA:**
• Maszyny o BR minimum ${minBR}
• Wiek: 16+ (lub wysoka dojrzałość)
• Sprawny mikrofon i obecność na Discordzie
• Zaangażowanie w życie dywizjonu

🎁 **CO ZYSKUJESZ?**
• Doświadczonych partnerów do gry codziennie
• Pomoc w grindzie i taktykach
• Zorganizowaną i przyjazną społeczność

🔗 **DOŁĄCZ DO NAS:**
Discord: https://discord.gg/on1pl
Do zobaczenia w bitwie! o7`);
  const [copiedRecruit, setCopiedRecruit] = useState(false);

  // Handlers
  const handleGenerateScript = () => {
    const scripts = TIKTOK_SCRIPTS[tiktokTone];
    const randomIndex = Math.floor(Math.random() * scripts.length);
    setTiktokScript(scripts[randomIndex]);
  };

  const handleCopy = (text: string, setCopied: (v: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveToArtifacts = (name: string, content: string, type: 'document' | 'code' = 'document') => {
    addArtifact({
      name,
      type,
      content,
      project: 'Centrum Operacyjne ^ON1PL^',
    });
    setSavedArtifactNotice(`Zapisano "${name}" w Artefaktach!`);
    setTimeout(() => setSavedArtifactNotice(null), 3000);
  };

  const handleTemplateChange = (tpl: AnnouncementTemplate) => {
    setAnnouncementTemplate(tpl);
    setAnnouncementTitle(SAMPLE_ANNOUNCEMENTS[tpl].title);
    setAnnouncementContent(SAMPLE_ANNOUNCEMENTS[tpl].content);
  };

  const handleSendToDiscord = async () => {
    setIsSendingDiscord(true);
    setSendSuccess(null);
    setSendError(null);
    try {
      const apiBase = window.location.port === '5173' ? 'http://localhost:3001' : '';
      const res = await fetch(`${apiBase}/api/post-announcement`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: announcementTitle,
          content: announcementContent,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSendSuccess(`Ogłoszenie zostało opublikowane na Discordzie w kanale #${data.channel || 'ogłoszenia'}!`);
      } else {
        setSendError(data.error || 'Nie udało się wysłać na Discord. Upewnij się, że bot ma uprawnienia.');
      }
    } catch {
      setSendError('Błąd połączenia z serwerem API bota.');
    } finally {
      setIsSendingDiscord(false);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Header */}
      <div className="flex-shrink-0 px-4 sm:px-8 pt-6 sm:pt-8 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold font-display text-white flex items-center gap-3">
              <PenTool className="w-6 h-6 sm:w-7 sm:h-7 text-[#d4a574]" />
              Generator Treści Dywizjonu
            </h1>
            <p className="text-white/50 text-xs sm:text-sm mt-1">
              Twórz oficjalne ogłoszenia klanowe, scenariusze wideo na TikTok oraz posty rekrutacyjne
            </p>
          </div>

          {savedArtifactNotice && (
            <div className="px-4 py-2 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-semibold flex items-center gap-2 animate-fade-in">
              <Check className="w-4 h-4" />
              <span>{savedArtifactNotice}</span>
            </div>
          )}
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-3 overflow-x-auto scrollbar-none">
          {[
            { id: 'tiktok' as const, label: 'TikTok & Media (@.on1pl)', icon: Video },
            { id: 'announcements' as const, label: 'Ogłoszenia Klanowe', icon: Megaphone },
            { id: 'recruitment' as const, label: 'Posty Rekrutacyjne', icon: Users },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap',
                  activeTab === tab.id
                    ? 'bg-[#d4a574]/15 text-[#d4a574] border border-[#d4a574]/30'
                    : 'text-white/50 hover:text-white hover:bg-white/5'
                )}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Tab Views */}
      <div className="flex-1 px-4 sm:px-8 pb-8">
        {/* ── 1. TIKTOK TAB ── */}
        {activeTab === 'tiktok' && (
          <div className="space-y-5">
            {/* Tone selector & Action buttons */}
            <div className="bg-[#181818] border border-white/5 rounded-2xl p-4 sm:p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <label className="text-xs font-semibold text-white/60 block mb-2">
                  Ton materiału dla TikToka (@.on1pl):
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  {(['serious', 'shitpost', 'meme', 'recruitment'] as const).map((tone) => (
                    <button
                      key={tone}
                      onClick={() => {
                        setTiktokTone(tone);
                        setTiktokScript(TIKTOK_SCRIPTS[tone][0]);
                      }}
                      className={cn(
                        'px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all',
                        tiktokTone === tone
                          ? 'bg-[#d4a574] text-black shadow-md shadow-[#d4a574]/20'
                          : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
                      )}
                    >
                      {tone === 'serious'
                        ? 'Poważny'
                        : tone === 'shitpost'
                        ? 'Shitpost'
                        : tone === 'meme'
                        ? 'Meme'
                        : 'Rekrutacyjny'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
                <button
                  onClick={handleGenerateScript}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/15 text-white rounded-xl text-xs font-bold transition-all active:scale-95 border border-white/10"
                >
                  <Wand2 className="w-3.5 h-3.5 text-[#d4a574]" />
                  <span>Nowy Wariant</span>
                </button>
                <button
                  onClick={() => handleCopy(tiktokScript, setCopiedScript)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-[#d4a574] hover:bg-[#c49360] text-black rounded-xl text-xs font-bold transition-all active:scale-95 shadow-md shadow-[#d4a574]/20"
                >
                  {copiedScript ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedScript ? 'Skopiowano!' : 'Kopiuj skrypt'}</span>
                </button>
                <button
                  onClick={() =>
                    handleSaveToArtifacts(
                      `Skrypt_TikTok_${tiktokTone}_${Date.now().toString().slice(-4)}.txt`,
                      tiktokScript
                    )
                  }
                  className="flex items-center gap-2 px-3 py-2.5 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white rounded-xl text-xs font-medium border border-white/5"
                  title="Zapisz do Artefaktów"
                >
                  <FileBox className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Editable Script Workspace */}
            <div className="bg-[#181818] border border-white/5 rounded-2xl p-5 shadow-lg">
              <div className="flex items-center justify-between mb-3 text-xs text-white/50">
                <span className="font-semibold uppercase tracking-wider">
                  Edytor Skryptu (możesz edytować bezpośrednio poniżej):
                </span>
                <span>Format: 9:16 pion / TikTok</span>
              </div>
              <textarea
                rows={16}
                value={tiktokScript}
                onChange={(e) => setTiktokScript(e.target.value)}
                className="w-full bg-[#121212] border border-white/10 rounded-xl p-4 font-mono text-xs sm:text-sm text-white/90 leading-relaxed focus:outline-none focus:border-[#d4a574] resize-none"
              />
            </div>
          </div>
        )}

        {/* ── 2. ANNOUNCEMENTS TAB ── */}
        {activeTab === 'announcements' && (
          <div className="space-y-5">
            {/* Template Chooser */}
            <div className="bg-[#181818] border border-white/5 rounded-2xl p-4 sm:p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <label className="text-xs font-semibold text-white/60 block mb-2">
                  Szablon ogłoszenia klanowego:
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  {(['clan', 'rules', 'event'] as const).map((tpl) => (
                    <button
                      key={tpl}
                      onClick={() => handleTemplateChange(tpl)}
                      className={cn(
                        'px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all',
                        announcementTemplate === tpl
                          ? 'bg-[#d4a574] text-black shadow-md shadow-[#d4a574]/20'
                          : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
                      )}
                    >
                      {tpl === 'clan'
                        ? 'Ogłoszenie Dywizjonu'
                        : tpl === 'rules'
                        ? 'Aktualizacja Zasad'
                        : 'Turniej / Event'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
                <button
                  onClick={() => handleCopy(`${announcementTitle}\n\n${announcementContent}`, setCopiedAnnouncement)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/15 text-white rounded-xl text-xs font-bold transition-all active:scale-95 border border-white/10"
                >
                  {copiedAnnouncement ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedAnnouncement ? 'Skopiowano!' : 'Kopiuj'}</span>
                </button>

                <button
                  onClick={handleSendToDiscord}
                  disabled={isSendingDiscord}
                  className="flex items-center gap-2 px-4 py-2.5 bg-[#5865F2] hover:bg-[#4752c4] text-white rounded-xl text-xs font-bold transition-all active:scale-95 shadow-md shadow-[#5865F2]/20 disabled:opacity-50"
                >
                  {isSendingDiscord ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  <span>Wyślij na Discord</span>
                </button>
              </div>
            </div>

            {/* Notification messages */}
            {sendSuccess && (
              <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2 animate-fade-in">
                <Check className="w-4 h-4 shrink-0" />
                <span>{sendSuccess}</span>
              </div>
            )}
            {sendError && (
              <div className="p-3.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs flex items-center gap-2 animate-fade-in">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{sendError}</span>
              </div>
            )}

            {/* Editor + Live Discord Embed Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Left: Inputs */}
              <div className="bg-[#181818] border border-white/5 rounded-2xl p-5 shadow-lg space-y-4">
                <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider">
                  Edycja Treści
                </h3>
                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1">
                    Tytuł Ogłoszenia
                  </label>
                  <input
                    type="text"
                    value={announcementTitle}
                    onChange={(e) => setAnnouncementTitle(e.target.value)}
                    className="w-full bg-[#121212] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#d4a574]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1">
                    Treść Ogłoszenia
                  </label>
                  <textarea
                    rows={10}
                    value={announcementContent}
                    onChange={(e) => setAnnouncementContent(e.target.value)}
                    className="w-full bg-[#121212] border border-white/10 rounded-xl p-3.5 font-sans text-xs sm:text-sm text-white/90 leading-relaxed focus:outline-none focus:border-[#d4a574] resize-none"
                  />
                </div>
              </div>

              {/* Right: Discord Embed Preview */}
              <div className="bg-[#181818] border border-white/5 rounded-2xl p-5 shadow-lg flex flex-col">
                <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Eye className="w-4 h-4 text-[#5865F2]" />
                  Podgląd Discord Embed
                </h3>
                <div className="bg-[#2f3136] rounded-xl p-4 border-l-4 border-[#d4a574] text-white flex-1 flex flex-col justify-between shadow-xl">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-white/50 mb-2">
                      <span className="font-bold text-white">^ON1PL^ Bot</span>
                      <span className="bg-[#5865F2] text-white text-[10px] px-1 rounded font-bold">
                        BOT
                      </span>
                      <span>Dzisiaj o {new Date().toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>

                    <h4 className="text-base font-bold text-white mb-2 leading-snug">
                      {announcementTitle}
                    </h4>
                    <p className="text-xs text-gray-300 whitespace-pre-wrap leading-relaxed">
                      {announcementContent}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-white/5 text-[10px] text-gray-400 flex items-center justify-between">
                    <span>Wysłano przez {user.name} via ^ON1PL^ Command Center</span>
                    <span>{new Date().toLocaleDateString('pl-PL')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── 3. RECRUITMENT TAB ── */}
        {activeTab === 'recruitment' && (
          <div className="space-y-5">
            <div className="bg-[#181818] border border-white/5 rounded-2xl p-4 sm:p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4 flex-wrap">
                <div>
                  <label className="text-xs font-semibold text-white/60 block mb-1.5">
                    Platforma docelowa:
                  </label>
                  <div className="flex items-center gap-1.5 bg-[#121212] border border-white/10 rounded-xl p-1">
                    {(['discord', 'forum', 'social'] as const).map((p) => (
                      <button
                        key={p}
                        onClick={() => setRecruitPlatform(p)}
                        className={cn(
                          'px-3 py-1 rounded-lg text-xs font-semibold transition-all',
                          recruitPlatform === p
                            ? 'bg-white/10 text-white'
                            : 'text-white/40 hover:text-white'
                        )}
                      >
                        {p === 'discord' ? 'Discord' : p === 'forum' ? 'Forum WT' : 'Social Media'}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-white/60 block mb-1.5">
                    Minimalny BR:
                  </label>
                  <select
                    value={minBR}
                    onChange={(e) => setMinBR(e.target.value)}
                    className="bg-[#121212] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#d4a574]"
                  >
                    <option value="8.0+">8.0+ (Mid Tier)</option>
                    <option value="10.0+">10.0+ (Top Tier)</option>
                    <option value="11.7+">11.7+ (End Game)</option>
                    <option value="Bez wymagań BR">Bez wymagań BR</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
                <button
                  onClick={() => handleCopy(recruitText, setCopiedRecruit)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-[#d4a574] hover:bg-[#c49360] text-black rounded-xl text-xs font-bold transition-all active:scale-95 shadow-md shadow-[#d4a574]/20"
                >
                  {copiedRecruit ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedRecruit ? 'Skopiowano!' : 'Kopiuj treść'}</span>
                </button>
                <button
                  onClick={() => handleSaveToArtifacts('Post_Rekrutacyjny_ON1PL.md', recruitText)}
                  className="flex items-center gap-2 px-3 py-2.5 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white rounded-xl text-xs font-medium border border-white/5"
                  title="Zapisz do Artefaktów"
                >
                  <FileBox className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="bg-[#181818] border border-white/5 rounded-2xl p-5 shadow-lg">
              <textarea
                rows={15}
                value={recruitText}
                onChange={(e) => setRecruitText(e.target.value)}
                className="w-full bg-[#121212] border border-white/10 rounded-xl p-4 font-mono text-xs sm:text-sm text-white/90 leading-relaxed focus:outline-none focus:border-[#d4a574] resize-none"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ContentGenerator;
