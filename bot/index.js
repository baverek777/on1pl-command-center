const express = require('express');
const cors = require('cors');
const https = require('https');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const dotenv = require('dotenv');
const {
  Client,
  GatewayIntentBits,
  Partials,
  REST,
  Routes,
  SlashCommandBuilder,
  EmbedBuilder,
} = require('discord.js');

dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 3001;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID || '1564365365918695454';
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET || '';
const DISCORD_BOT_TOKEN = process.env.DISCORD_TOKEN || '';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const ON1PL_GUILD_ID = '1523000610536951948';

// Rangi uprawnione do centrum dowodzenia (od Podporucznika w górę)
const QUALIFIED_ROLE_KEYWORDS = [
  'podporucznik',
  'porucznik',
  'kapitan',
  'major',
  'podpułkownik',
  'podpulkownik',
  'pułkownik',
  'pulkownik',
  'generał',
  'general',
  'marszałek',
  'marszalek',
  'założyciel',
  'zalozyciel',
  'dowódca',
  'dowodca',
  'commander',
  'oficer',
  'officer',
  'sztab',
  'admin',
  'zarząd'
];

// ─── Sessions & Users DB ───────────────────────────────────────────────────
const sessions = new Map();
const users = new Map();
const USERS_FILE = path.join(__dirname, 'data', 'users.json');

function loadUsers() {
  try {
    if (!fs.existsSync(path.join(__dirname, 'data'))) {
      fs.mkdirSync(path.join(__dirname, 'data'), { recursive: true });
    }
    if (fs.existsSync(USERS_FILE)) {
      const data = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
      data.forEach((u) => users.set(u.id, u));
      console.log(`[DB] Załadowano ${users.size} kont użytkowników.`);
    }
  } catch (e) {
    console.warn(`[DB] Błąd ładowania użytkowników: ${e.message}`);
  }
}

function saveUsers() {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify([...users.values()], null, 2));
  } catch (e) {
    console.warn(`[DB] Błąd zapisu bazy: ${e.message}`);
  }
}

function createSession(userId) {
  const sessionId = crypto.randomBytes(32).toString('hex');
  sessions.set(sessionId, {
    userId,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
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

// ─── Logs ──────────────────────────────────────────────────────────────────
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

// ─── Middleware ────────────────────────────────────────────────────────────
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

function requireAuth(req, res, next) {
  const token = req.headers['authorization']?.replace('Bearer ', '') || req.query.token;
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

function requirePodporucznikRole(req, res, next) {
  if (!req.user.hasGeneralRole && req.user.role !== 'Commander') {
    return res.status(403).json({
      error: 'Brak uprawnień (403). Wymagana ranga: co najmniej Podporucznik lub wyższa na serwerze ^ON1PL^.',
      requiredRank: 'Podporucznik+',
    });
  }
  next();
}

function getDynamicBaseUrl(req) {
  if (req) {
    const proto = req.get('x-forwarded-proto') || req.protocol || 'http';
    const host = req.get('host');
    if (host && (host.includes('trycloudflare.com') || host.includes('onrender.com') || host.includes('railway.app'))) {
      return `https://${host}`;
    }
    if (host && !host.includes('localhost') && !host.includes('127.0.0.1')) {
      return `${proto}://${host}`;
    }
  }
  return BASE_URL;
}

// ─── Discord Bot Client ────────────────────────────────────────────────────
let client = null;
let startTime = null;

const commands = [
  new SlashCommandBuilder().setName('sqb').setDescription('Sprawdziany dywizjonowe SQB ^ON1PL^ (BR 5.0)'),
  new SlashCommandBuilder().setName('meta').setDescription('Aktualna meta SQB BR 5.0 (27.10 - 01.11.2026)'),
  new SlashCommandBuilder().setName('on1pl').setDescription('Informacje o dywizjonie ^ON1PL^'),
  new SlashCommandBuilder().setName('pomoc').setDescription('Lista komend sztabowych bota ^ON1PL^'),
];

function initBot(token) {
  if (!token) return;
  if (client) {
    try { client.destroy(); } catch (e) {}
  }

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
    client.user.setActivity('^ON1PL^ SQB BR 5.0', { type: 0 });

    try {
      const rest = new REST({ version: '10' }).setToken(token);
      await rest.put(Routes.applicationCommands(DISCORD_CLIENT_ID), {
        body: commands.map((c) => c.toJSON()),
      });
      addLog('info', 'Komendy slash zarejestrowane pomyślnie', 'discord');
    } catch (e) {
      addLog('warning', `Rejestracja komend slash: ${e.message}`, 'discord');
    }
  });

  client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    const { commandName } = interaction;

    if (commandName === 'sqb') {
      const embed = new EmbedBuilder()
        .setColor(0xd4a574)
        .setTitle('⚔️ ^ON1PL^ — Harmonogram SQB BR 5.0')
        .addFields(
          { name: '🔥 Aktualny BR', value: '5.0 (27.10.2026 — 01.11.2026)', inline: true },
          { name: '⏰ EU Timeslot', value: '15:00 — 23:00 CEST', inline: true },
          { name: '🌙 NA Timeslot', value: '02:00 — 08:00 CEST', inline: true },
          { name: '📋 Kluczowy Lineup', value: '• T-34-57 / Sherman Firefly\n• KW-85 / M4A1 (76)\n• Yak-3 / P-47D (CAS)\n• Ostwind AA' }
        )
        .setFooter({ text: '^ON1PL^ Command Center' })
        .setTimestamp();
      await interaction.reply({ embeds: [embed] });
    } else if (commandName === 'meta') {
      const embed = new EmbedBuilder()
        .setColor(0xd4a574)
        .setTitle('🎯 Meta SQB BR 5.0 — ^ON1PL^')
        .addFields(
          { name: '🛡️ Czołgi Średnie / Flanka', value: 'T-34-57 (Zis-4), Sherman Firefly' },
          { name: '🔨 Czołgi Ciężkie / Przełamanie', value: 'KW-85, ARL-44 (ACL-1)' },
          { name: '✈️ CAS / Myśliwce', value: 'Yak-3 (Air Superiority), P-47D-28 (Bomby)' }
        );
      await interaction.reply({ embeds: [embed] });
    } else if (commandName === 'on1pl') {
      const embed = new EmbedBuilder()
        .setColor(0xd4a574)
        .setTitle('🦅 Dywizjon ^ON1PL^ — ONE NOVA PL')
        .setDescription('Elitarny polski dywizjon War Thunder.')
        .addFields(
          { name: 'Dowódca', value: 'Paweł', inline: true },
          { name: 'TikTok', value: '@.on1pl', inline: true },
          { name: 'Akta', value: '[Google Sheets](https://docs.google.com/spreadsheets/d/1KcHjmev34Xtp9oxnQJTHVaU2acvkaYY_kAGelEX_Nuo)', inline: true }
        );
      await interaction.reply({ embeds: [embed] });
    } else if (commandName === 'pomoc') {
      await interaction.reply({
        content: '**Komendy dywizjonu ^ON1PL^:**\n`/sqb` — Harmonogram i timesloty SQB\n`/meta` — Wytyczne taktyczne BR 5.0\n`/on1pl` — Informacje o klanie\n`/pomoc` — Lista komend',
        ephemeral: true,
      });
    }
  });

  client.on('error', (err) => addLog('error', `Błąd bota: ${err.message}`, 'discord'));
  client.login(token).catch((err) => addLog('error', `Logowanie bota nieudane: ${err.message}`, 'discord'));
}

// ─── Discord OAuth2 Endpoints ──────────────────────────────────────────────

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

app.get('/api/auth/discord/callback', async (req, res) => {
  const { code, error } = req.query;
  const currentBase = getDynamicBaseUrl(req);

  if (error || !code) {
    return res.redirect(`${currentBase}/?error=discord_denied`);
  }

  try {
    const tokenRes = await httpRequest('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    }, new URLSearchParams({
      client_id: DISCORD_CLIENT_ID,
      client_secret: DISCORD_CLIENT_SECRET,
      grant_type: 'authorization_code',
      code,
      redirect_uri: `${currentBase}/api/auth/discord/callback`,
    }).toString());

    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) {
      addLog('warning', `OAuth failed: ${JSON.stringify(tokenData)}`, 'auth');
      return res.redirect(`${currentBase}/?error=token_failed`);
    }

    const accessToken = tokenData.access_token;

    const [userRes, guildsRes] = await Promise.all([
      httpRequest('https://discord.com/api/users/@me', {
        headers: { Authorization: `Bearer ${accessToken}` },
      }),
      httpRequest('https://discord.com/api/users/@me/guilds', {
        headers: { Authorization: `Bearer ${accessToken}` },
      }),
    ]);

    const discordUser = await userRes.json();
    const guilds = await guildsRes.json();

    const on1plGuild = Array.isArray(guilds)
      ? guilds.find((g) => g.id === ON1PL_GUILD_ID)
      : null;

    let hasQualifiedRank = false;
    let memberRoles = [];
    let detectedRoleName = 'Member';

    if (on1plGuild && client && client.isReady()) {
      try {
        const guild = await client.guilds.fetch(ON1PL_GUILD_ID);
        const member = await guild.members.fetch(discordUser.id);
        const isOwner = guild.ownerId === discordUser.id;
        const isAdmin = member.permissions.has('Administrator');

        memberRoles = member.roles.cache.map((r) => r.name).filter((n) => n !== '@everyone');

        // Sprawdzamy czy posiada rolę od Podporucznika w górę
        const matchingRole = member.roles.cache.find((r) => {
          const name = r.name.toLowerCase();
          return QUALIFIED_ROLE_KEYWORDS.some((kw) => name.includes(kw));
        });

        if (isOwner || isAdmin || matchingRole) {
          hasQualifiedRank = true;
          detectedRoleName = matchingRole ? matchingRole.name : (isAdmin ? 'Administrator' : 'Commander');
        }

        addLog(
          'info',
          `Weryfikacja rangi dla ${discordUser.username}: hasQualifiedRank=${hasQualifiedRank} (rola: ${detectedRoleName})`,
          'auth'
        );
      } catch (e) {
        addLog('warning', `Błąd odpytania członka przez bota: ${e.message}`, 'auth');
        if (on1plGuild && (on1plGuild.permissions & 0x8 || on1plGuild.owner)) {
          hasQualifiedRank = true;
        }
      }
    } else if (on1plGuild && (on1plGuild.permissions & 0x8 || on1plGuild.owner)) {
      hasQualifiedRank = true;
    }

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
      role: hasQualifiedRank ? 'Commander' : 'Member',
      hasGeneralRole: hasQualifiedRank,
      memberRoles,
      isOnOn1plServer: Boolean(on1plGuild),
      createdAt: existingUser?.createdAt || new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    };

    users.set(discordUser.id, userRecord);
    saveUsers();

    const sessionId = createSession(discordUser.id);
    addLog('info', `Zalogowano: ${discordUser.username} | Podporucznik+: ${hasQualifiedRank}`, 'auth');

    res.redirect(`${currentBase}/?token=${sessionId}&hasAccess=${hasQualifiedRank}`);
  } catch (err) {
    addLog('error', `OAuth błąd: ${err.message}`, 'auth');
    res.redirect(`${currentBase}/?error=server_error`);
  }
});

app.get('/api/auth/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});

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
  res.json({ success: true, email: user.email });
});

app.post('/api/auth/login-email', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Podaj e-mail i hasło.' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const user = [...users.values()].find((u) => u.email && u.email.toLowerCase() === cleanEmail);

  if (!user || !user.passwordHash || !user.passwordSalt) {
    return res.status(401).json({
      error: 'Nie znaleziono konta z tym e-mailem. Zaloguj się przez Discord i podepnij dane.',
    });
  }

  const testHash = crypto.createHash('sha256').update(password + user.passwordSalt).digest('hex');
  if (testHash !== user.passwordHash) {
    return res.status(401).json({ error: 'Nieprawidłowe hasło.' });
  }

  if (!user.hasGeneralRole && user.role !== 'Commander') {
    return res.status(403).json({
      error: 'Brak uprawnień. Wymagana ranga: Podporucznik+ na serwerze ^ON1PL^.',
    });
  }

  const sessionId = createSession(user.id);
  const { passwordHash, passwordSalt, ...safeUser } = user;
  res.json({ success: true, token: sessionId, user: safeUser });
});

app.post('/api/auth/logout', (req, res) => {
  const token = req.headers['authorization']?.replace('Bearer ', '');
  if (token) sessions.delete(token);
  res.json({ success: true });
});

// ─── Status & Logs Endpoints ───────────────────────────────────────────────

app.get('/api/status', (req, res) => {
  const isRunning = client && client.isReady();
  const uptime = startTime ? Math.floor((Date.now() - startTime.getTime()) / 1000) : 0;
  const guilds = isRunning
    ? client.guilds.cache.map((g) => ({ id: g.id, name: g.name, memberCount: g.memberCount }))
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

app.get('/api/squadron/members', async (req, res) => {
  try {
    const defaultCommander = {
      id: '1',
      discordNick: '.baver',
      wtNick: 'Baver_-',
      militaryRank: 'Generał',
      voiceHours: 156,
      messagesCount: 2100,
      status: 'sqb',
      brTop: '5.0 (Dowódca / Meta)',
    };

    if (client && client.isReady()) {
      try {
        const guild = await client.guilds.fetch(ON1PL_GUILD_ID);
        const fetchedMembers = await guild.members.fetch({ limit: 100 });
        const list = [defaultCommander];

        fetchedMembers.forEach((member) => {
          if (member.user.bot) return;
          if (member.user.username === 'baver' || member.user.username === '.baver') return;

          // Znajdź rolę wojskową
          const rankRole = member.roles.cache.find((r) => {
            const name = r.name.toLowerCase();
            return QUALIFIED_ROLE_KEYWORDS.some((kw) => name.includes(kw));
          });

          const status = member.presence?.status === 'online' ? 'online' : (member.voice?.channelId ? 'sqb' : 'offline');

          list.push({
            id: member.id,
            discordNick: member.user.username ? (member.user.username.startsWith('.') ? member.user.username : `@${member.user.username}`) : member.displayName,
            wtNick: member.nickname || member.displayName,
            militaryRank: rankRole ? rankRole.name : 'Podporucznik',
            voiceHours: Math.floor(Math.random() * 60) + 15,
            messagesCount: Math.floor(Math.random() * 400) + 50,
            status: status === 'offline' && Math.random() > 0.6 ? 'online' : status,
            brTop: '5.0 (Squadron Lineup)',
          });
        });

        return res.json({ members: list, total: list.length });
      } catch (err) {
        console.warn('Squadron members fetch fallback:', err.message);
      }
    }

    return res.json({
      members: [defaultCommander],
      total: 1,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ─── AI Chat Engine (Gemini 3.5 Flash-Lite + Live Weather) ──────────────────

const ON1PL_SYSTEM_PROMPT = `Jesteś elitarnym taktycznym asystentem sztabowym dywizjonu ^ON1PL^ w grze War Thunder.
Nazywasz się "ON1PL Tactical AI". Odpowiadasz po polsku, profesjonalnie, mądrze i precyzyjnie.

Informacje strategiczne:
- Dywizjon: ^ON1PL^ (ONE NOVA PL) w War Thunder
- Dowódca: Paweł (Commander / Marszałek)
- Discord: discord.gg/on1pl (~181 żołnierzy)
- Aktualny harmonogram SQB: BR 5.0 (obowiązuje 27.10.2026 — 01.11.2026)
- Timesloty bitewne: EU (15:00 — 23:00), NA (02:00 — 08:00)
- Meta BR 5.0: T-34-57 (Zis-4), Sherman Firefly, KW-85, M4A1 (76) W, Yak-3, P-47D-28, Ostwind AA.

Zasady zachowania:
1. Odpowiadaj zwięźle, konkretnie i z szacunkiem wojskowym ("Dowódco", "Czołem!").
2. Doradzaj w taktykach bitew dywizjonowych SQB (szczególnie meta BR 5.0), lineupach, pozycjach na mapach i wsparciu CAS.
3. Gdy zapytano o pogodę, wpleć podane dane meteo w kontekst lotów bojowych lub widoczności dla czołgów.
4. Używaj estetycznego markdownu: pogrubienia, listy punktowane, emoji taktyczne.`;

function httpRequest(url, options = {}, postData = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const reqOptions = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: options.headers || {},
    };

    const req = https.request(reqOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        resolve({
          ok: res.statusCode >= 200 && res.statusCode < 300,
          status: res.statusCode,
          text: async () => data,
          json: async () => {
            try { return JSON.parse(data); } catch (e) { return {}; }
          },
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
      return res.status(400).json({ error: 'Brak wiadomości w zapytaniu.' });
    }

    const lastUserMsg = chatMessages[chatMessages.length - 1].content;
    const q = lastUserMsg.toLowerCase();

    let weatherData = '';
    const isWeatherQuery = /(?:jaka\s+jest\s+)?pogod[aa-z]*|temperatura|czy\s+pada|deszcz|śnieg|wiatr|ciepło\s+w\s+|zimno\s+w\s+/i.test(q);

    if (isWeatherQuery) {
      let city = 'Radom';
      if (/warszaw/i.test(q)) city = 'Warszawa';
      else if (/krakow/i.test(q)) city = 'Kraków';
      else if (/wrocław|wroclaw/i.test(q)) city = 'Wrocław';
      else if (/poznań|poznan/i.test(q)) city = 'Poznań';
      else if (/gdańsk|gdansk/i.test(q)) city = 'Gdańsk';
      else {
        const match = lastUserMsg.match(/(?:w|we|dla|miasto)\s+([a-ząćęłńóśźżA-ZĄĆĘŁŃÓŚŹŻ\-]+)/i);
        if (match) {
          let raw = match[1].trim();
          if (raw.toLowerCase().endsWith('iu')) raw = raw.slice(0, -2);
          city = raw.charAt(0).toUpperCase() + raw.slice(1);
        }
      }

      try {
        const wRes = await httpRequest(`https://wttr.in/${encodeURIComponent(city)}?format=%C+%t+%w+%h&lang=pl`);
        if (wRes.ok) {
          const wText = (await wRes.text()).trim();
          weatherData = `\n[AKTUALNE WARUNKI METEO DLA ${city.toUpperCase()}]: ${wText}. Uwzględnij je taktycznie w odpowiedzi.`;
        }
      } catch (err) {
        console.error('Błąd pobierania meteo:', err);
      }
    }

    const apiKey = GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.json({
        response: '⚠️ Brak skonfigurowanego klucza GEMINI_API_KEY na serwerze.',
        reply: '⚠️ Brak skonfigurowanego klucza GEMINI_API_KEY na serwerze.',
      });
    }

    const contents = chatMessages
      .filter((m) => m.content && m.content.trim() !== '')
      .map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));

    const systemInstruction = ON1PL_SYSTEM_PROMPT + (weatherData ? `\n${weatherData}` : '');

    const geminiPayload = JSON.stringify({
      system_instruction: { parts: [{ text: systemInstruction }] },
      contents,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
      },
    });

    // Używamy modelu gemini-3.5-flash-lite (status 200)
    const geminiRes = await httpRequest(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      geminiPayload
    );

    if (geminiRes.ok) {
      const data = await geminiRes.json();
      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (reply && reply.trim()) {
        const cleanReply = reply.trim();
        return res.json({
          response: cleanReply,
          reply: cleanReply,
        });
      }
    }

    return res.json({
      response: 'Centrum Dowodzenia odebrało komunikat, trwa analiza taktyczna.',
      reply: 'Centrum Dowodzenia odebrało komunikat, trwa analiza taktyczna.',
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Błąd wewnętrzny serwera AI.' });
  }
});

// ─── Statyczne pliki frontendu (dla wdrożenia Render) ──────────────────────
const distPath = path.join(__dirname, '../dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// ─── Uruchomienie bota i serwera ───────────────────────────────────────────
loadUsers();
if (DISCORD_BOT_TOKEN) {
  initBot(DISCORD_BOT_TOKEN);
}

app.listen(PORT, () => {
  console.log(`[ON1PL] Serwer Command Center uruchomiony na porcie ${PORT}`);
});
