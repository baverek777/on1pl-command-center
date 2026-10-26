const express = require('express');
const cors = require('cors');
const https = require('https');

const app = express();
app.use(cors());
app.use(express.json());

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const ON1PL_SYSTEM_PROMPT = `Jesteś inteligentnym AI centrum dowodzenia dywizjonu ^ON1PL^ w grze War Thunder.
Nazywasz się "ON1PL AI". Odpowiadasz po polsku, mądrze, zwięźle i profesjonalnie, jak sztab dywizjonu.

Informacje o klanie:
- Dywizjon: ^ON1PL^ (ONE NOVA PL) w War Thunder
- Dowódca: Paweł
- Discord: discord.gg/on1pl (~181 członków)
- TikTok: @.on1pl
- Arkusz dywizjonu: Google Sheets "ON1PL Akta"

Zasady:
1. Odpowiadaj mądrze, elastycznie i dokładnie na DOWOLNE pytanie użytkownika (geografia, historia, matematyka, gry, taktyka, życie, klan).
2. Gdy użytkownik pyta stricte o pogodę w danym mieście, wykorzystaj dostarczone w kontekście dane meteorologiczne i skomentuj je pod kątem War Thunder. Jeśli pytanie NIE dotyczy pogody (np. pytania o państwa, sąsiadów, historię), całkowicie zignoruj sekcję meteo i odpowiadaj normalnie na temat pytania!
3. Pisz po polsku, używaj estetycznego formatowania (pogrubienia, punkty, emoji).
4. Nigdy nie powtarzaj sztywnych szablonów — odpowiadaj naturalnie i inteligentnie na to, o co pyta Dowódca.`;

function httpRequest(url, options = {}, postData = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const reqOptions = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    };

    const req = https.request(reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          ok: res.statusCode >= 200 && res.statusCode < 300,
          status: res.statusCode,
          text: async () => data,
          json: async () => {
            try { return JSON.parse(data); } catch (e) { return {}; }
          }
        });
      });
    });

    req.on('error', reject);
    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

app.post('/api/chat', async (req, res) => {
  try {
    const { prompt, messages } = req.body;
    let chatMessages = messages || [];
    
    if (prompt && (!chatMessages.length || chatMessages[chatMessages.length - 1].content !== prompt)) {
      chatMessages.push({ role: 'user', content: prompt });
    }

    if (chatMessages.length === 0) {
      return res.status(400).json({ error: 'Brak wiadomości w żądaniu.' });
    }

    const lastUserMsg = chatMessages[chatMessages.length - 1].content;
    const q = lastUserMsg.toLowerCase();

    let weatherData = '';
    
    // Bardzo restrykcyjny warunek wykrywający pogodę - tylko gdy użytkownik o nią pyta
    const isWeatherQuery = /(?:jaka\s+jest\s+)?pogod[aa-z]*|temperatura|czy\s+pada|deszcz|śnieg|wiatr|ciepło\s+w\s+|zimno\s+w\s+/i.test(q);

    if (isWeatherQuery) {
      let city = 'Radom';
      if (/warszaw/i.test(q)) city = 'Warszawa';
      else if (/krakow/i.test(q)) city = 'Kraków';
      else if (/wrocław|wroclaw/i.test(q)) city = 'Wrocław';
      else if (/poznań|poznan/i.test(q)) city = 'Poznań';
      else if (/gdańsk|gdansk/i.test(q)) city = 'Gdańsk';
      else if (/łódź|lodz/i.test(q)) city = 'Łódź';
      else if (/szczecin/i.test(q)) city = 'Szczecin';
      else {
        const match = lastUserMsg.match(/(?:w|we|dla|miasto|miastach)\s+([a-ząćęłńóśźżA-ZĄĆĘŁŃÓŚŹŻ\-]+)/i);
        if (match) {
          let raw = match[1].trim();
          if (raw.toLowerCase() === 'warszawie') city = 'Warszawa';
          else if (raw.toLowerCase() === 'krakowie') city = 'Kraków';
          else city = raw.charAt(0).toUpperCase() + raw.slice(1);
        }
      }

      try {
        const wRes = await httpRequest(`https://wttr.in/${encodeURIComponent(city)}?format=%C+%t+%w+%h&lang=pl`);
        if (wRes.ok) {
          const wText = (await wRes.text()).trim();
          weatherData = `\n[DANE METEO DLA MIASTA: ${city}] Aktualne warunki: ${wText}. Uwzględnij te dane w odpowiedzi, komentując je pod kątem War Thunder!`;
        }
      } catch (err) {
        console.error('Weather fetch error:', err);
      }
    }

    if (!GEMINI_API_KEY) {
      return res.json({ reply: "⚠️ Brak skonfigurowanego klucza GEMINI_API_KEY na serwerze." });
    }

    const contents = chatMessages
      .filter(m => m.content && m.content.trim() !== '')
      .map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      }));

    const systemInstruction = ON1PL_SYSTEM_PROMPT + (weatherData ? `\n${weatherData}` : '');

    const geminiPayload = JSON.stringify({
      system_instruction: { parts: [{ text: systemInstruction }] },
      contents,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
      }
    });

    const geminiRes = await httpRequest(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: geminiPayload
      },
      geminiPayload
    );

    if (geminiRes.ok) {
      const data = await geminiRes.json();
      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (reply && reply.trim()) {
        return res.json({ reply: reply.trim() });
      }
    }

    return res.json({ reply: "Centrum Dowodzenia odebrało komunikat, ale AI nie wygenerowało odpowiedzi." });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Błąd wewnętrzny serwera AI.' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`ON1PL Backend running on port ${PORT}`);
});
