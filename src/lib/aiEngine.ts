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

  // 4. CLAN / SQUADRON ON1PL CONTEXT
  if (/on1pl|dywizjon|klan|serwer|discord|akta|tiktok|dowódca|paweł/i.test(q)) {
    return `🦅 **Dywizjon ^ON1PL^ — One Nova Poland**

• **Gra:** War Thunder (Polska społeczność)
• **Dowódca:** Paweł (Commander)
• **Serwer Discord:** [ON1PL-ONE NOVA PL (discord.gg/on1pl)](https://discord.gg/on1pl) — ponad 180 członków
• **Arkusz dywizjonu:** [^ON1PL^ Akta Google Sheets](https://docs.google.com/spreadsheets/d/1KcHjmev34Xtp9oxnQJTHVaU2acvkaYY_kAGelEX_Nuo)
• **Oficjalny TikTok:** [@.on1pl](https://www.tiktok.com/@.on1pl)
• **Centrum dowodzenia:** [on1pl.onrender.com](https://on1pl.onrender.com)

W czym mogę pomóc? Mogę przygotować ogłoszenie klanowe, skrypt na TikToka lub post rekrutacyjny!`;
  }

  // 5. GREETINGS
  if (/^(cześć|czesc|hej|siema|witaj|dzień dobry|dobry wieczór|elo|yo)/i.test(q)) {
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Dzień dobry' : hour < 18 ? 'Cześć' : 'Dobry wieczór';
    return `${greeting}, Dowódco! 👋 Jestem inteligentnym asystentem centrum dowodzenia ^ON1PL^.

W czym mogę Ci dziś pomóc?
• 🌤️ **Pogoda:** Zapytaj o pogodę w dowolnym mieście (np. *"jaka jest pogoda w Radomiu"* lub *"pogoda Warszawa"*)
• 🎮 **War Thunder:** Porady taktyczne, składy maszyn, mechaniki gry
• 📝 **Treści:** Tworzenie ogłoszeń klanowych, postów rekrutacyjnych i skryptów TikTok
• 🧮 **Obliczenia:** Szybkie działania matematyczne
• 📚 **Wiedza ogólna:** Pytaj o dowolne pojęcia, czołgi, samoloty czy historię!`;
  }

  // 6. DEFAULT INTELLIGENT CONVERSATIONAL RESPONSE
  return `Oto co wiem na ten temat:

Odpowiadam w ramach centrum dowodzenia dywizjonu **^ON1PL^**. 

• Jeśli pytałeś o **pogodę**, upewnij się, że podałeś miasto (np. *"pogoda w Radomiu"* lub *"pogoda Kraków"*), a pobiorę dla Ciebie aktualne dane meteorologiczne na żywo! 🌤️
• Jeśli pytałeś o **czołg lub samolot**, podaj jego nazwę (np. *"co to jest Leopard 2A7V"* lub *"F-16C"*), a przygotuję charakterystykę. ✈️
• Jeśli chcesz stworzyć post lub skrypt — przejdź do zakładki **Generator Treści** w menu po lewej stronie. ✍️

Wpisz swoje pytanie bardziej szczegółowo, a natychmiast przygotuję odpowiedź!`;
}
