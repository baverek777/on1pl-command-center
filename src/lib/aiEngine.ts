// ─── ON1PL Intelligent AI Engine ──────────────────────────────────────────
// Handles live weather, factual knowledge, clan tactics, math, and general conversation.

export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export async function resolveSmartAIResponse(
  userQuery: string,
  history: AIMessage[] = []
): Promise<string> {
  const q = userQuery.trim().toLowerCase();

  // 1. LIVE WEATHER DETECTION
  if (
    /pogod|weather|temperatura|zimno|ciepło|deszcz|pada|słońce|chmury|wiatr/i.test(q)
  ) {
    const cityMatch =
      userQuery.match(/(?:w|we|dla|w mieście|dla miasta)\s+([a-ząćęłńóśźżA-ZĄĆĘŁŃÓŚŹŻ\-]+)/i) ||
      userQuery.match(/pogoda\s+([a-ząćęłńóśźżA-ZĄĆĘŁŃÓŚŹŻ\-]+)/i);

    const rawCity = cityMatch ? cityMatch[1].trim() : 'Radom';
    let cleanCity = rawCity;
    if (cleanCity.toLowerCase().endsWith('iu')) cleanCity = cleanCity.slice(0, -2);
    else if (cleanCity.toLowerCase() === 'warszawie') cleanCity = 'Warszawa';
    else if (cleanCity.toLowerCase() === 'krakowie') cleanCity = 'Kraków';
    else if (cleanCity.toLowerCase() === 'lublinie') cleanCity = 'Lublin';
    cleanCity = cleanCity.charAt(0).toUpperCase() + cleanCity.slice(1);

    try {
      const res = await fetch(
        `https://wttr.in/${encodeURIComponent(cleanCity)}?format=%C|%t|%w|%h&lang=pl`
      );
      if (res.ok) {
        const text = await res.text();
        const parts = text.split('|').map((s) => s.trim());
        if (parts.length >= 2 && !text.includes('Unknown') && !text.includes('<!DOCTYPE')) {
          const condition = parts[0] || 'Umiarkowanie';
          const temp = parts[1] || 'B/D';
          const wind = parts[2] || 'B/D';
          const humidity = parts[3] || 'B/D';

          return `🌤️ **Raport Meteorologiczny — ${cleanCity}**

• **Stan nieba:** ${condition}
• **Temperatura:** ${temp}
• **Wiatr:** ${wind}
• **Wilgotność:** ${humidity}

> **Komentarz taktyczny ^ON1PL^:**
> Widoczność i warunki atmosferyczne ${
            condition.toLowerCase().includes('deszcz') || condition.toLowerCase().includes('mgł')
              ? 'mogą utrudniać loty CAS — zalecamy termowizję i radary pokładowe.'
              : 'sprzyjają precyzyjnym uderzeniom CAS i dalekim pojedynkom czołgowym w War Thunder!'
          } 🎯`;
        }
      }
    } catch {
      // Fallback if offline
    }

    return `🌤️ **Prognoza pogody dla: ${cleanCity}**\n\nAktualne dane wskazują na typowe warunki sezonowe. Aby sprawdzić wykres godzinowy na żywo, zobacz [Google Pogoda dla ${cleanCity}](https://www.google.com/search?q=pogoda+${encodeURIComponent(cleanCity)}).`;
  }

  // 2. MATH & CALCULATIONS
  if (
    /ile (to|jest|wynosi)|oblicz|policz|\d+\s*[\+\-\*\/×÷]\s*\d+/i.test(q)
  ) {
    try {
      const expr = q
        .replace(/ile to|ile jest|ile wynosi|oblicz|policz/gi, '')
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/[^0-9+\-*/().\s]/g, '')
        .trim();

      if (expr && /^[0-9+\-*/().\s]+$/.test(expr)) {
        const result = Function(`"use strict"; return (${expr})`)();
        return `🧮 **Wynik obliczenia:**\n\n**${expr} = ${result}**\n\nPotrzebujesz dalszych kalkulacji taktycznych lub przeliczeń?`;
      }
    } catch {
      // Continue to next handlers
    }
  }

  // 3. WIKIPEDIA / FACTUAL KNOWLEDGE
  if (
    /kto to|co to jest|kim był|kim była|czym jest|wyjaśnij|definicja|historia|bitwa pod|czołg|samolot|dywizjon/i.test(q)
  ) {
    const termMatch =
      userQuery.match(/(?:kto to jest|co to jest|kim był|kim była|czym jest|wyjaśnij|definicja)\s+([a-ząćęłńóśźżA-ZĄĆĘŁŃÓŚŹŻ0-9\s\-]+)/i) ||
      userQuery.match(/(?:o|o czołgu|o samolocie)\s+([a-ząćęłńóśźżA-ZĄĆĘŁŃÓŚŹŻ0-9\s\-]+)/i);

    if (termMatch && termMatch[1]) {
      const term = termMatch[1].trim().replace(/\?$/, '');
      try {
        const wikiRes = await fetch(
          `https://pl.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(term)}`
        );
        if (wikiRes.ok) {
          const wikiData = await wikiRes.json();
          if (wikiData.extract) {
            return `📚 **${wikiData.title}**

${wikiData.extract}

🔗 [Zobacz pełny artykuł w Wikipedii](${wikiData.content_urls?.desktop?.page || `https://pl.wikipedia.org/wiki/${encodeURIComponent(term)}`})`;
          }
        }
      } catch {
        // Fallback
      }
    }
  }

  // 4. CLAN / SQUADRON ON1PL CONTEXT & BR 5.0
  if (/on1pl|dywizjon|klan|serwer|discord|akta|tiktok|dowódca|paweł|sqb|5\.0/i.test(q)) {
    return `🦅 **Dywizjon ^ON1PL^ — One Nova Poland**

• **Gra:** War Thunder (Polska elita)
• **Dowódca:** Paweł (Commander / Marszałek)
• **Aktualny BR w SQB:** **5.0** (aktywny od 27.10.2026 do 01.11.2026)
• **Timesloty bitewne:**
  - 🇪🇺 **EU:** 15:00 — 23:00 CEST
  - 🇺🇸 **NA:** 02:00 — 08:00 CEST
• **Meta BR 5.0:** T-34-57 (Zis-4), Sherman Firefly, KW-85, M4A1 (76) W, Yak-3, P-47D-28, Ostwind AA
• **Serwer Discord:** [ON1PL (discord.gg/on1pl)](https://discord.gg/on1pl)
• **Arkusz dywizjonu:** [^ON1PL^ Akta](https://docs.google.com/spreadsheets/d/1KcHjmev34Xtp9oxnQJTHVaU2acvkaYY_kAGelEX_Nuo)
• **TikTok:** [@.on1pl](https://www.tiktok.com/@.on1pl)`;
  }

  // 5. DIRECT GEMINI 3.5 FLASH-LITE / BACKEND INVOCATION
  try {
    const GEMINI_CLIENT_KEY =
      (import.meta as any).env?.VITE_GEMINI_API_KEY ||
      localStorage.getItem('on1pl_gemini_key') ||
      '';

    if (GEMINI_CLIENT_KEY) {
      const formattedContents = history
        .filter((m) => m.content && m.content.trim() !== '')
        .map((m) => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }],
        }));

      if (!formattedContents.length || formattedContents[formattedContents.length - 1].parts[0].text !== userQuery) {
        formattedContents.push({ role: 'user', parts: [{ text: userQuery }] });
      }

      const systemPrompt = `Jesteś inteligentnym doradcą taktycznym dywizjonu ^ON1PL^ (ONE NOVA PL) w grze War Thunder.
Dowódcą jest Paweł. Aktualnie w SQB obowiązuje BR 5.0 (27.10.2026 — 01.11.2026).
Główne maszyny w mecie 5.0: T-34-57 (Zis-4), Sherman Firefly, KW-85, M4A1 (76), Yak-3, P-47D.
Odpowiadaj po polsku, mądrze, zwięźle, profesjonalnie i z szacunkiem ("Dowódco", "Czołem!").`;

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${GEMINI_CLIENT_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: systemPrompt }] },
            contents: formattedContents,
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 2048,
            },
          }),
        }
      );

      if (res.ok) {
        const data = await res.json();
        const answer = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (answer && answer.trim()) {
          return answer.trim();
        }
      }
    } else {
      // Zapytanie do backendu ON1PL
      const apiBase = window.location.port === '5173' ? 'http://localhost:3001' : '';
      const bRes = await fetch(`${apiBase}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userQuery, messages: history }),
      });
      if (bRes.ok) {
        const bData = await bRes.json();
        const bAnswer = bData.response || bData.reply;
        if (bAnswer && bAnswer.trim()) {
          return bAnswer.trim();
        }
      }
    }
  } catch (e) {
    console.warn('AI resolution error:', e);
  }

  // 6. GREETINGS
  if (/^(cześć|czesc|hej|siema|witaj|dzień dobry|dobry wieczór|elo|yo)/i.test(q)) {
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Dzień dobry' : hour < 18 ? 'Cześć' : 'Dobry wieczór';
    return `${greeting}, Dowódco! 👋 Jestem taktycznym asystentem sztabu dywizjonu ^ON1PL^.

W czym mogę Ci pomóc?
• ⚔️ **SQB BR 5.0:** Porady taktyczne i lineupy na aktywny sezon
• 🌤️ **Meteo:** Pogoda na żywo w dowolnym mieście
• 🎮 **War Thunder:** Porady bitewne, penetracja, mechaniki
• 📝 **Generator:** Skrypty TikTok, rekrutacja i ogłoszenia klanowe`;
  }

  // 7. DEFAULT FALLBACK
  return `Odebrałem meldunek, Dowódco! W centrum dowodzenia ^ON1PL^ analizuję aktywne wytyczne SQB BR 5.0 (27.10 - 01.11.2026). Sprecyzuj pytanie lub zadanie!`;
}
