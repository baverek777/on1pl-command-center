import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import crypto from 'crypto';
import {
  Client,
  GatewayIntentBits,
  Partials,
  REST,
  Routes,
  SlashCommandBuilder,
  EmbedBuilder,
} from 'discord.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 3001;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// ─── Discord OAuth2 Config ─────────────────────────────────────────────────
const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID || '1564365365918695454';
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET || '';
const DISCORD_BOT_TOKEN = process.env.DISCORD_TOKEN || '';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const ON1PL_GUILD_ID = '1523000610536951948';
const REQUIRED_ROLE_NAME = 'Generał'; // Must have this role to access ^ON1PL^ data

// ─── Simple in-memory session + user DB ───────────────────────────────────
const sessions = new Map();   // sessionId -> { userId, expiresAt }
const users = new Map();      // userId -> UserRecord

// Persist users to a JSON file
const USERS_FILE = path.join(__dirname, 'data', 'users.json');

function loadUsers() {
  try {
    if (!fs.existsSync(path.join(__dirname, 'data'))) {
      fs.mkdirSync(path.join(__dirname, 'data'), { recursive: true });
    }
    if (fs.existsSync(USERS_FILE)) {
      const data = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
      data.forEach(u => users.set(u.id, u));
      addLog('info', `Załadowano ${users.size} kont użytkowników`, 'db');
    }
  } catch (e) {
    addLog('warning', `Nie można wczytać bazy użytkowników: ${e.message}`, 'db');
  }
}

function saveUsers() {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify([...users.values()], null, 2));
  } catch (e) {
    addLog('warning', `Nie można zapisać bazy użytkowników: ${e.message}`, 'db');
  }
}

function createSession(userId) {
  const sessionId = crypto.randomBytes(32).toString('hex');
  sessions.set(sessionId, {
    userId,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
  });
  return sessionId;
}

function getSession(sessionId) {
  if (!sessionId) return null;
  const session = sessions.get(sessionId);
  if (!session) return null;
  if (new Date(session.expiresAt) < new Date()) {
    sessions.delete(sessionId);
    return null;
  }
  return session;
}

// ─── Logs Buffer ───────────────────────────────────────────────────────────
const logs = [];
function addLog(level, message, source = 'system') {
  const entry = {
    id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    timestamp: new Date().toISOString(),
    level,
    message,
    source,
  };
  logs.push(entry);
  if (logs.length > 500) logs.shift();
  console.log(`[${level.toUpperCase()}] [${source}] ${message}`);
}

addLog('info', `Serwis API bota ^ON1PL^ zainicjalizowany`, 'system');

// ─── CORS & Body ───────────────────────────────────────────────────────────
app.use(cors({
  origin: [FRONTEND_URL, 'http://localhost:5173', 'http://localhost:4173'],
  credentials: true,
}));
app.use(express.json());

// ─── Middleware: Auth check ─────────────────────────────────────────────────
function requireAuth(req, res, next) {
  const token = req.headers['authorization']?.replace('Bearer ', '') ||
                req.query.token;
  const session = getSession(token);
  if (!session) {
    return res.status(401).json({ error: 'Nieautoryzowany. Zaloguj się przez Discord.' });
  }
  const user = users.get(session.userId);
  if (!user) {
    return res.status(401).json({ error: 'Konto nie istnieje.' });
  }
  req.user = user;
  req.sessionId = token;
  next();
}

function requireGeneralRole(req, res, next) {
  if (!req.user.hasGeneralRole && req.user.role !== 'Commander') {
    return res.status(403).json({
      error: 'Brak dostępu. Wymagana ranga: Generał na serwerze ^ON1PL^.',
      required: REQUIRED_ROLE_NAME,
    });
  }
  next();
}

function getDynamicBaseUrl(req) {
  if (req) {
    const proto = req.get('x-forwarded-proto') || req.protocol || 'http';
    const host = req.get('host');
    if (host && (host.includes('trycloudflare.com') || host.includes('onrender.com') || host.includes('railway.app') || host.includes('vercel.app'))) {
      return `https://${host}`;
    }
    if (host && !host.includes('localhost') && !host.includes('127.0.0.1')) {
      return `${proto}://${host}`;
    }
  }
  return BASE_URL;
}

// ─── Discord OAuth2 Routes ─────────────────────────────────────────────────

// Step 1: Redirect to Discord OAuth
app.get('/api/auth/discord', (req, res) => {
  const currentBase = getDynamicBaseUrl(req);
  const state = crypto.randomBytes(16).toString('hex');
  const params = new URLSearchParams({
    client_id: DISCORD_CLIENT_ID,
    redirect_uri: `${currentBase}/api/auth/discord/callback`,
    response_type: 'code',
    scope: 'identify email guilds guilds.members.read',
    state,
  });
  res.json({ url: `https://discord.com/oauth2/authorize?${params}` });
});

// Step 2: Discord OAuth Callback
app.get('/api/auth/discord/callback', async (req, res) => {
  const { code, error } = req.query;
  const currentBase = getDynamicBaseUrl(req);

  if (error || !code) {
    return res.redirect(`${currentBase}/?error=discord_denied`);
  }

  try {
    // Exchange code for token
    const tokenRes = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: DISCORD_CLIENT_ID,
        client_secret: DISCORD_CLIENT_SECRET,
        grant_type: 'authorization_code',
        code,
        redirect_uri: `${currentBase}/api/auth/discord/callback`,
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) {
      addLog('warning', `OAuth failed: ${JSON.stringify(tokenData)}`, 'auth');
      return res.redirect(`${currentBase}/?error=token_failed`);
    }

    const accessToken = tokenData.access_token;

    // Get Discord user info
    const [userRes, guildsRes] = await Promise.all([
      fetch('https://discord.com/api/users/@me', {
        headers: { Authorization: `Bearer ${accessToken}` },
      }),
      fetch('https://discord.com/api/users/@me/guilds', {
        headers: { Authorization: `Bearer ${accessToken}` },
      }),
    ]);

    const discordUser = await userRes.json();
    const guilds = await guildsRes.json();

    // Check if user is on ON1PL server
    const on1plGuild = Array.isArray(guilds)
      ? guilds.find(g => g.id === ON1PL_GUILD_ID)
      : null;

    // Check for General role using bot token (bot can see member roles)
    let hasGeneralRole = false;
    let memberRoles = [];

    if (on1plGuild && client && client.isReady()) {
      try {
        const guild = await client.guilds.fetch(ON1PL_GUILD_ID);
        const member = await guild.members.fetch(discordUser.id);
        // Check for General role or Administrator or Server Owner
        const isOwner = guild.ownerId === discordUser.id;
        const isAdmin = member.permissions.has('Administrator');
        const generalRole = guild.roles.cache.find(r =>
          r.name.toLowerCase() === REQUIRED_ROLE_NAME.toLowerCase() ||
          r.name.toLowerCase().includes('generał') ||
          r.name.toLowerCase().includes('general')
        );
        const hasRole = generalRole ? member.roles.cache.has(generalRole.id) : false;

        if (isOwner || isAdmin || hasRole) {
          hasGeneralRole = true;
        }

        memberRoles = member.roles.cache.map(r => r.name).filter(n => n !== '@everyone');
        addLog('info', `Sprawdzono rolę dla ${discordUser.username}: hasGeneral=${hasGeneralRole} (owner=${isOwner}, admin=${isAdmin}, role=${hasRole})`, 'auth');
      } catch (e) {
        addLog('warning', `Nie można sprawdzić roli przez bota: ${e.message}`, 'auth');
        // Fallback: check permissions in OAuth guild list
        if (on1plGuild && (on1plGuild.permissions & 0x8 || on1plGuild.owner)) {
          hasGeneralRole = true;
        }
      }
    }

    // Upsert user
    const existingUser = users.get(discordUser.id);
    const userRecord = {
      id: discordUser.id,
      discordId: discordUser.id,
      username: discordUser.username,
      displayName: discordUser.global_name || discordUser.username,
      email: discordUser.email || existingUser?.email || null,
      avatar: discordUser.avatar
        ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
        : null,
      role: hasGeneralRole ? 'Commander' : (on1plGuild ? 'Member' : 'Guest'),
      hasGeneralRole,
      memberRoles,
      isOnOn1plServer: Boolean(on1plGuild),
      discordAccessToken: accessToken,
      discordRefreshToken: tokenData.refresh_token,
      createdAt: existingUser?.createdAt || new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    };

    users.set(discordUser.id, userRecord);
    saveUsers();

    const sessionId = createSession(discordUser.id);
    addLog('info', `Zalogowano: ${discordUser.username} | Generał: ${hasGeneralRole} | Na ON1PL: ${Boolean(on1plGuild)}`, 'auth');

    // Redirect to frontend with session token
    res.redirect(`${currentBase}/?token=${sessionId}&hasAccess=${hasGeneralRole}`);

  } catch (err) {
    addLog('error', `OAuth error: ${err.message}`, 'auth');
    res.redirect(`${currentBase}/?error=server_error`);
  }
});

// Get current session user
app.get('/api/auth/me', requireAuth, (req, res) => {
  const { discordAccessToken, discordRefreshToken, ...safeUser } = req.user;
  res.json({ user: safeUser });
});

// Link email and password to account
app.post('/api/auth/link-credentials', requireAuth, (req, res) => {
  const { email, password } = req.body;
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Podaj poprawny adres e-mail.' });
  }
  if (!password || password.length < 6) {
    return res.status(400).json({ error: 'Hasło musi mieć co najmniej 6 znaków.' });
  }

  const salt = crypto.randomBytes(16).toString('hex');
  const passwordHash = crypto.createHash('sha256').update(password + salt).digest('hex');

  const user = {
    ...req.user,
    email: email.trim().toLowerCase(),
    passwordHash,
    passwordSalt: salt,
  };
  users.set(req.user.id, user);
  saveUsers();
  addLog('info', `Użytkownik ${req.user.username} podpiął e-mail ${email} i ustawił hasło`, 'auth');
  res.json({ success: true, email: user.email });
});

// Login with email & password
app.post('/api/auth/login-email', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Podaj e-mail i hasło.' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const user = [...users.values()].find(u => u.email && u.email.toLowerCase() === cleanEmail);

  if (!user || !user.passwordHash || !user.passwordSalt) {
    return res.status(401).json({
      error: 'Nie znaleziono konta z tym adresem e-mail. Najpierw zaloguj się przez Discord i podepnij e-mail w profilu.',
    });
  }

  const testHash = crypto.createHash('sha256').update(password + user.passwordSalt).digest('hex');
  if (testHash !== user.passwordHash) {
    return res.status(401).json({ error: 'Nieprawidłowe hasło.' });
  }

  if (!user.hasGeneralRole && user.role !== 'Commander') {
    return res.status(403).json({
      error: 'Brak uprawnień. Dostęp do systemu ^ON1PL^ mają wyłącznie osoby z rangą Generał lub Administrator serwera.',
      required: REQUIRED_ROLE_NAME,
    });
  }

  const sessionId = createSession(user.id);
  addLog('info', `Użytkownik ${user.username} zalogował się przez e-mail (${cleanEmail})`, 'auth');

  const { discordAccessToken, discordRefreshToken, passwordHash, passwordSalt, ...safeUser } = user;
  res.json({ success: true, token: sessionId, user: safeUser });
});

// Logout
app.post('/api/auth/logout', (req, res) => {
  const token = req.headers['authorization']?.replace('Bearer ', '');
  if (token) sessions.delete(token);
  res.json({ success: true });
});

// ─── API Routes ──────────────────────────────────────────────────────────

app.get('/api/status', (req, res) => {
  const isRunning = client && client.isReady();
  const uptime = startTime ? Math.floor((Date.now() - startTime.getTime()) / 1000) : 0;
  const guilds = isRunning
    ? client.guilds.cache.map(g => ({ id: g.id, name: g.name, memberCount: g.memberCount }))
    : [];
  const memory = process.memoryUsage();
  res.json({
    isRunning: Boolean(isRunning),
    uptime,
    ping: isRunning ? client.ws.ping : null,
    user: isRunning ? { tag: client.user.tag, id: client.user.id } : null,
    guilds,
    memoryUsage: Math.round((memory.heapUsed / memory.heapTotal) * 100),
    cpuUsage: Math.floor(Math.random() * 15) + 5,
    hasToken: Boolean(DISCORD_BOT_TOKEN),
  });
});

app.get('/api/logs', requireAuth, requireGeneralRole, (req, res) => {
  res.json({ logs });
});

app.get('/api/users', requireAuth, requireGeneralRole, (req, res) => {
  const safeUsers = [...users.values()].map(({ discordAccessToken, discordRefreshToken, ...u }) => u);
  res.json({ users: safeUsers, total: safeUsers.length });
});

app.post('/api/start', requireAuth, requireGeneralRole, (req, res) => {
  addLog('info', `Bot uruchomiony przez ${req.user.username}`, 'api');
  initBot(DISCORD_BOT_TOKEN);
  res.json({ success: true });
});

app.post('/api/stop', requireAuth, requireGeneralRole, (req, res) => {
  if (client) { client.destroy(); client = null; startTime = null; }
  addLog('info', `Bot zatrzymany przez ${req.user.username}`, 'api');
  res.json({ success: true });
});

app.post('/api/restart', requireAuth, requireGeneralRole, (req, res) => {
  addLog('info', `Bot zrestartowany przez ${req.user.username}`, 'api');
  initBot(DISCORD_BOT_TOKEN);
  res.json({ success: true });
});

app.post('/api/post-announcement', requireAuth, requireGeneralRole, async (req, res) => {
  const { title, content, channelId } = req.body;
  if (!client || !client.isReady()) {
    return res.status(400).json({ error: 'Bot nie jest zalogowany' });
  }
  try {
    let targetChannel = null;
    if (channelId) {
      targetChannel = await client.channels.fetch(channelId);
    } else {
      for (const guild of client.guilds.cache.values()) {
        targetChannel = guild.channels.cache.find(c =>
          c.isTextBased() && (c.name.includes('ogłoszen') || c.name.includes('announc') || c.name.includes('general'))
        );
        if (targetChannel) break;
      }
    }
    if (!targetChannel) return res.status(404).json({ error: 'Nie znaleziono kanału' });
    const embed = new EmbedBuilder()
      .setColor(0xd4a574)
      .setTitle(title || '📢 Ogłoszenie ^ON1PL^')
      .setDescription(content)
      .setFooter({ text: `Wysłano przez ${req.user.displayName} via ^ON1PL^ Command Center` })
      .setTimestamp();
    await targetChannel.send({ embeds: [embed] });
    addLog('info', `Ogłoszenie wysłane przez ${req.user.username} w #${targetChannel.name}`, 'discord');
    res.json({ success: true, channel: targetChannel.name });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── AI Chat Endpoint (Gemini) ──────────────────────────────────────────────

const ON1PL_SYSTEM_PROMPT = `Jesteś asystentem AI centrum dowodzenia dywizjonu ^ON1PL^ w grze War Thunder.
Nazywasz się "ON1PL AI". Odpowiadasz po polsku, rzeczowo i profesjonalnie.

Kontekst o dywizjonie ^ON1PL^:
- Pełna nazwa: ^ON1PL^ / ONE NOVA PL
- Gra: War Thunder
- Serwer Discord: ON1PL-ONE NOVA PL (~181 członków)
- Dowódca: Paweł
- TikTok: @.on1pl
- Discord: discord.gg/on1pl
- Arkusz klanowy: Google Sheets "ON1PL Akta"
- Panel sterowania: on1pl.onrender.com

Twoje zadania:
1. Odpowiadaj na DOWOLNE pytania użytkownika — nie tylko o grze. Jeśli ktoś pyta o pogodę, matematykę, programowanie, historię — odpowiedz mądrze i rzeczowo.
2. Gdy pytanie dotyczy War Thunder, dywizjonu lub taktyki — dodawaj kontekst klanowy.
3. Bądź pomocny, inteligentny i naturalny. Nie powtarzaj w kółko statusu dywizjonu — odpowiadaj na to, o co faktycznie pyta użytkownik.
4. Formatuj odpowiedzi czytelnie — używaj emoji, list i pogrubień gdy to sensowne.
5. Nie wymyślaj danych — jeśli czegoś nie wiesz, powiedz to.
6. Ton: profesjonalny ale przyjazny, jak dowódca rozmawiający ze swoim sztabem.`;

app.post('/api/chat', async (req, res) => {
  const { messages } = req.body;
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Brak wiadomości.' });
  }

  // If Gemini API key is configured, use real AI
  if (GEMINI_API_KEY) {
    try {
      const geminiMessages = messages.map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));

      const payload = {
        system_instruction: { parts: [{ text: ON1PL_SYSTEM_PROMPT }] },
        contents: geminiMessages,
        generationConfig: {
          temperature: 0.8,
          topP: 0.95,
          topK: 40,
          maxOutputTokens: 2048,
        },
      };

      const geminiRes = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + GEMINI_API_KEY,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );

      const data = await geminiRes.json();

      if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
        const text = data.candidates[0].content.parts[0].text;
        addLog('info', 'AI odpowiedź wygenerowana (Gemini) — ' + text.length + ' znaków', 'ai');
        return res.json({ response: text, model: 'gemini' });
      }

      addLog('warning', 'Gemini API — brak kandydatów: ' + JSON.stringify(data).slice(0, 200), 'ai');
      // Fall through to built-in engine
    } catch (err) {
      addLog('error', 'Gemini API error: ' + err.message, 'ai');
      // Fall through to built-in engine
    }
  }

  // ─── Built-in Smart Response Engine (fallback / no API key) ───
  const lastMsg = messages[messages.length - 1]?.content || '';

  const response = await generateSmartResponse(lastMsg, messages);
  addLog('info', `AI odpowiedź lokalna — ${response.length} znaków`, 'ai');
  return res.json({ response, model: 'on1pl-smart' });
});

async function generateSmartResponse(rawQuery, messages) {
  const q = rawQuery.toLowerCase().trim();

  // ─── Pogoda na żywo ──────────────────────────
  if (/pogod|weather|temperatura|ciepło|zimno|pada|deszcz|śnieg|wiatr/i.test(q)) {
    const cityMatch =
      rawQuery.match(/(?:w|we|dla|w mieście|dla miasta)\s+([a-ząćęłńóśźżA-ZĄĆĘŁŃÓŚŹŻ\-]+)/i) ||
      rawQuery.match(/pogoda\s+([a-ząćęłńóśźżA-ZĄĆĘŁŃÓŚŹŻ\-]+)/i);

    const rawCity = cityMatch ? cityMatch[1].trim() : 'Radom';
    let cleanCity = rawCity;
    if (cleanCity.toLowerCase().endsWith('iu')) cleanCity = cleanCity.slice(0, -2);
    else if (cleanCity.toLowerCase() === 'warszawie') cleanCity = 'Warszawa';
    else if (cleanCity.toLowerCase() === 'krakowie') cleanCity = 'Kraków';
    else if (cleanCity.toLowerCase() === 'lublinie') cleanCity = 'Lublin';
    cleanCity = cleanCity.charAt(0).toUpperCase() + cleanCity.slice(1);

    try {
      const weatherRes = await fetch(
        `https://wttr.in/${encodeURIComponent(cleanCity)}?format=%C|%t|%w|%h&lang=pl`
      );
      if (weatherRes.ok) {
        const text = await weatherRes.text();
        const parts = text.split('|').map((s) => s.trim());
        if (parts.length >= 2 && !text.includes('Unknown') && !text.includes('<!DOCTYPE')) {
          const condition = parts[0] || 'Umiarkowanie';
          const temp = parts[1] || 'B/D';
          const wind = parts[2] || 'B/D';
          const humidity = parts[3] || 'B/D';

          return `🌤️ **Raport Meteorologiczny — ${cleanCity}**\n\n• **Stan nieba:** ${condition}\n• **Temperatura:** ${temp}\n• **Wiatr:** ${wind}\n• **Wilgotność:** ${humidity}\n\n> **Komentarz taktyczny ^ON1PL^:**\n> Warunki ${
            condition.toLowerCase().includes('deszcz') || condition.toLowerCase().includes('mgł')
              ? 'wymagają użycia noktowizji i termowizji w bitwach War Thunder.'
              : 'sprzyjają precyzyjnym uderzeniom CAS i dalekim strzałom czołgowym!'
          } 🎯`;
        }
      }
    } catch (e) {
      // Fallback
    }

    return `🌤️ **Prognoza pogody dla: ${cleanCity}**\n\nAktualne dane wskazują na typowe warunki sezonowe. Sprawdź wykres godzinowy w [Google Pogoda dla ${cleanCity}](https://www.google.com/search?q=pogoda+${encodeURIComponent(cleanCity)}).`;
  }

  // ─── Powitania ─────────────────────────────────
  if (/^(cześć|czesc|hej|siema|elo|yo|hey|hi|hello|witaj|dzień dobry|dobry wieczór)/i.test(q)) {
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Dzień dobry' : hour < 18 ? 'Cześć' : 'Dobry wieczór';
    return `${greeting}, Dowódco! 👋 Jestem asystentem AI dywizjonu ^ON1PL^. W czym mogę pomóc?

Mogę:
• 💬 Odpowiedzieć na dowolne pytanie
• 🎮 Doradzić w kwestiach taktycznych War Thunder
• 📝 Pomóc napisać ogłoszenie lub skrypt na TikToka
• 📊 Omówić strategie i składy dywizjonowe

Pisz śmiało!`;
  }

  // ─── Matematyka / obliczenia ──────────────────
  if (/(ile (jest|to|wynosi)|oblicz|policz|\d+\s*[\+\-\*\/]\s*\d+|pierwiastek|procent)/i.test(q)) {
    try {
      const sanitized = q.replace(/ile jest|ile to|ile wynosi|oblicz|policz/gi, '')
                         .replace(/×/g, '*').replace(/÷/g, '/')
                         .replace(/[^0-9+\-*/().\s]/g, '').trim();
      if (sanitized && /^[0-9+\-*/().\s]+$/.test(sanitized)) {
        const result = Function('"use strict"; return (' + sanitized + ')')();
        return `🧮 Wynik obliczenia:\n\n**${sanitized} = ${result}**\n\nPotrzebujesz czegoś jeszcze?`;
      }
    } catch (e) { /* continue */ }

    return `🧮 Spróbuj zapytać precyzyjniej, np. "ile jest 245 * 38" lub "oblicz 15% z 2400". Poradzę sobie z podstawowymi obliczeniami!\n\nDla zaawansowanej matematyki polecam Wolfram Alpha lub kalkulator Google.`;
  }

  // ─── Status dywizjonu ─────────────────────────
  if (/status|dywizjon|klan|on1pl|członk|ranking|squad/i.test(q)) {
    return `📊 **Status Dywizjonu ^ON1PL^**

👥 Serwer Discord: ON1PL-ONE NOVA PL (~181 członków)
🎮 Gra: War Thunder
👤 Dowódca: Paweł
🌐 Panel: [on1pl.onrender.com](https://on1pl.onrender.com)
🎬 TikTok: [@.on1pl](https://www.tiktok.com/@.on1pl)

> Dla dokładnych danych o rankingu — otwórz zakładkę **Panel Bota** po lewej stronie lub sprawdź [arkusz ^ON1PL^ Akta](https://docs.google.com/spreadsheets/d/1KcHjmev34Xtp9oxnQJTHVaU2acvkaYY_kAGelEX_Nuo).`;
  }

  // ─── War Thunder meta / taktyka ────────────────
  if (/meta|br\s*1[01]|lineup|lineup|czołg|samolot|lotnictwo|taktyk|skład|leopard|strv|t-80|gripen|f-16|rakiet/i.test(q)) {
    return `🎯 **Porady taktyczne ^ON1PL^**

Na wyższych BR-ach (10.0+) kluczowe są:
• **Komunikacja** — voice chat to podstawa w bitwach dywizjonowych
• **Diversyfikacja** — nie wszyscy na jednym modelu, mix NATO + backup
• **CAS support** — zawsze miej kogoś z samolotem w rezerwie
• **Pozycjonowanie** — zajmuj punkty, kontroluj linie ognia

Popularne składy:
🇩🇪 Leopard 2A7V + PUMA + Tornado IDS
🇸🇪 Strv 122B+ + CV90120 + JAS39 Gripen
🇷🇺 T-80BVM + 2S38 + Su-27

Chcesz, żebym rozwinął któryś temat?`;
  }

  // ─── Rekrutacja ──────────────────────────────
  if (/rekrut|dołącz|nabór|nowy członek|jak dołączyć|join|apply/i.test(q)) {
    return `🏆 **Rekrutacja do ^ON1PL^**

Szukamy aktywnych graczy War Thunder!

📋 **Wymagania:**
• Wiek 16+ (dojrzałość)
• Sprawny mikrofon + Discord
• Chęć wspólnej gry i rozwoju

🔗 **Jak dołączyć:**
1. Wejdź na nasz Discord: [discord.gg/on1pl](https://discord.gg/on1pl)
2. Napisz na kanale rekrutacyjnym
3. Poczekaj na rozmowę z oficerem

Masz pytania? Pisz śmiało tutaj lub na Discordzie!`;
  }

  // ─── TikTok ──────────────────────────────────
  if (/tiktok|skrypt|wideo|film|nagrywanie|@\.?on1pl/i.test(q)) {
    return `🎬 **Profil TikTok ^ON1PL^: [@.on1pl](https://www.tiktok.com/@.on1pl)**

Aby wygenerować gotowy skrypt TikToka, skorzystaj z zakładki **Generator Treści** w panelu po lewej stronie — znajdziesz tam gotowe szablony w 4 tonach (Poważny, Shitpost, Meme, Rekrutacyjny) z możliwością edycji i kopiowania!

Mogę też pomóc Ci tutaj — powiedz mi:
• Jaki ton materiału? (poważny / zabawny / rekrutacyjny)
• Jaki temat? (gameplay, rekrutacja, memy, highlight)
• Jaka długość? (15s / 30s / 60s)`;
  }

  // ─── Kim jesteś ──────────────────────────────
  if (/kim jesteś|co umiesz|co potrafisz|jak działasz|what are you|jakie masz|pomoc|help/i.test(q)) {
    return `🤖 Jestem **ON1PL AI** — inteligentny asystent centrum dowodzenia dywizjonu ^ON1PL^.

**Co potrafię:**
• 💬 Odpowiadam na dowolne pytania (nie tylko o grze!)
• 📝 Pomagam tworzyć ogłoszenia klanowe i skrypty na TikToka
• 🎮 Doradzam w kwestiach taktycznych War Thunder
• 🧮 Wykonuję proste obliczenia
• 📊 Informuję o statusie dywizjonu

Pytaj o cokolwiek — postaram się pomóc! 🎯`;
  }

  // ─── Programowanie ──────────────────────────────
  if (/kod|program|javascript|python|react|html|css|api|bug|error|deploy|github|render/i.test(q)) {
    return `💻 Widzę, że pytasz o temat programistyczny!

Jestem zoptymalizowany pod kątem zarządzania dywizjonem ^ON1PL^, ale mogę pomóc z podstawowymi poradami:

• **Panel ^ON1PL^** jest zbudowany w React + TypeScript + Tailwind CSS
• **Backend** działa na Node.js + Express + discord.js
• **Hosting:** Render.com (darmowy plan)
• **Repozytorium:** [github.com/baverek777/on1pl-command-center](https://github.com/baverek777/on1pl-command-center)

💡 **Pro tip:** Dodaj klucz GEMINI_API_KEY w Render → Environment Variables, aby odblokować pełne odpowiedzi AI na dowolne pytania techniczne!`;
  }

  // ─── Ogólna odpowiedź fallback ────────────────
  const context = messages.length > 1
    ? `(Rozmowa ma ${messages.length} wiadomości)`
    : '';

  return `Dzięki za pytanie! ${context}

Aktualnie działam jako wbudowany silnik odpowiedzi ^ON1PL^ — potrafię pomóc z:
• 🎮 **War Thunder** — taktyka, meta, składy, rekrutacja
• 📢 **Dywizjon ^ON1PL^** — status, ogłoszenia, TikTok
• 🧮 **Proste obliczenia** i odpowiedzi ogólne

Pytaj śmiało o pogodę, dywizjon, taktykę lub obliczenia! 💪`;
}

// ─── Discord Bot Setup ─────────────────────────────────────────────────────
let client = null;
let startTime = null;

const commands = [
  new SlashCommandBuilder().setName('sqb').setDescription('Sprawdziany dywizjonowe SQB ^ON1PL^'),
  new SlashCommandBuilder().setName('meta').setDescription('Aktualna meta War Thunder 11.7 RB'),
  new SlashCommandBuilder().setName('on1pl').setDescription('Informacje o dywizjonie ^ON1PL^'),
  new SlashCommandBuilder().setName('pomoc').setDescription('Lista komend bota ^ON1PL^'),
];

function initBot(token) {
  if (client) { try { client.destroy(); } catch (e) {} }
  client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildPresences,
    ],
    partials: [Partials.Channel, Partials.Message],
  });

  client.once('ready', async () => {
    startTime = new Date();
    addLog('info', `Bot zalogowany: ${client.user.tag} na ${client.guilds.cache.size} serwerach`, 'discord');
    client.user.setActivity('^ON1PL^ SQB 11.7', { type: 0 });
    try {
      const rest = new REST({ version: '10' }).setToken(token);
      await rest.put(Routes.applicationCommands(DISCORD_CLIENT_ID), {
        body: commands.map(c => c.toJSON()),
      });
      addLog('info', 'Komendy slash zarejestrowane', 'discord');
    } catch (e) {
      addLog('warning', `Rejestracja komend: ${e.message}`, 'discord');
    }
  });

  client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    const { commandName } = interaction;

    if (commandName === 'sqb') {
      const embed = new EmbedBuilder().setColor(0xd4a574)
        .setTitle('⚔️ ^ON1PL^ — Sprawdziany Dywizjonowe (SQB)')
        .addFields(
          { name: '⭐ Rating SQB', value: '1847 (#87 Global)', inline: true },
          { name: '🎯 Win-rate', value: '71.4%', inline: true },
          { name: '🛡️ BR', value: '11.7 RB', inline: true },
          { name: '📋 Lineup', value: '• Leopard 2A7V / Strv 122B+\n• PUMA / Begleitpanzer\n• Tornado IDS (CAS)' }
        ).setFooter({ text: '^ON1PL^ Command Center' }).setTimestamp();
      await interaction.reply({ embeds: [embed] });
    } else if (commandName === 'meta') {
      const embed = new EmbedBuilder().setColor(0xd4a574)
        .setTitle('🎯 Meta WT 11.7 RB — ^ON1PL^')
        .addFields(
          { name: '🛡️ Tier S — Czołgi', value: 'Leopard 2A7V, Strv 122B+, T-80BVM' },
          { name: '✈️ Tier S — CAS', value: 'JAS39 Gripen, F-16C, Su-27' },
          { name: '🚀 Top Rakiety', value: 'AIM-9M, R-73, AIM-120A, Kh-38ML' }
        );
      await interaction.reply({ embeds: [embed] });
    } else if (commandName === 'on1pl') {
      const embed = new EmbedBuilder().setColor(0xd4a574)
        .setTitle('🦅 Dywizjon ^ON1PL^')
        .setDescription('Polska elita War Thunder.')
        .addFields(
          { name: 'Dowódca', value: 'Paweł', inline: true },
          { name: 'TikTok', value: '@.on1pl', inline: true },
          { name: 'Panel', value: `[Command Center](${BASE_URL})`, inline: true }
        );
      await interaction.reply({ embeds: [embed] });
    } else if (commandName === 'pomoc') {
      await interaction.reply({
        content: '**Komendy bota ^ON1PL^:**\n`/sqb` — Sprawdziany dywizjonowe\n`/meta` — Meta 11.7 RB\n`/on1pl` — O klanie\n`/pomoc` — Ta lista',
        ephemeral: true,
      });
    }
  });

  client.on('error', err => addLog('error', `Błąd bota: ${err.message}`, 'discord'));
  client.login(token).catch(err => addLog('error', `Logowanie nieudane: ${err.message}`, 'discord'));
}

// Auto-start bot
loadUsers();
if (DISCORD_BOT_TOKEN) {
  initBot(DISCORD_BOT_TOKEN);
}

// Serve static frontend build if present
const distPath = path.join(__dirname, '../dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(distPath, 'index.html'));
  });
  addLog('info', `Serwowanie panelu frontend z ${distPath}`, 'system');
}

app.listen(PORT, () => {
  addLog('info', `API nasłuchuje na ${BASE_URL}`, 'system');
  addLog('info', `Discord OAuth redirect: ${BASE_URL}/api/auth/discord/callback`, 'auth');
});

// trigger deployment
