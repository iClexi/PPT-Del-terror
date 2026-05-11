import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import pg from 'pg';
import path from 'path';
import { fileURLToPath } from 'url';

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const requiredEnv = ['SESSION_SECRET', 'DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'];
for (const key of requiredEnv) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

const port = Number.parseInt(process.env.PORT ?? '1311', 10);
const sessionMaxAgeMs = 7 * 24 * 60 * 60 * 1000;
const adminPlayerNames = new Set(
  (process.env.ADMIN_PLAYER_NAMES ?? 'iClexi')
    .split(',')
    .map((name) => name.trim().toLowerCase())
    .filter(Boolean),
);
const allowedHosts = new Set(
  (process.env.ALLOWED_HOSTS ?? 'terror.iclexi.tech,localhost,127.0.0.1,192.168.200.21,192.168.200.22,192.168.200.30')
    .split(',')
    .map((host) => host.trim().toLowerCase())
    .filter(Boolean),
);

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number.parseInt(process.env.DB_PORT ?? '5432', 10),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

const app = express();
app.set('trust proxy', ['loopback', 'linklocal', 'uniquelocal']);
app.disable('x-powered-by');

app.use(
  helmet({
    xFrameOptions: { action: 'deny' },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        baseUri: ["'self'"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        formAction: ["'self'"],
        frameAncestors: ["'none'"],
        imgSrc: ["'self'", 'data:'],
        objectSrc: ["'none'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        upgradeInsecureRequests: [],
      },
    },
    crossOriginEmbedderPolicy: false,
  }),
);

app.use(express.json({ limit: '10kb' }));

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 120,
  standardHeaders: true,
  legacyHeaders: false,
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 8,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiados intentos. Intenta de nuevo más tarde.' },
});

app.use('/api', apiLimiter);
app.use('/api/login', loginLimiter);
app.use('/api/register', loginLimiter);

const asyncHandler = (handler) => (req, res, next) => {
  Promise.resolve(handler(req, res, next)).catch(next);
};

const base64UrlEncode = (value) => Buffer.from(value).toString('base64url');
const base64UrlDecode = (value) => Buffer.from(value, 'base64url').toString('utf8');

const signValue = (value) =>
  crypto.createHmac('sha256', process.env.SESSION_SECRET).update(value).digest('base64url');

const timingSafeEqual = (left, right) => {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && crypto.timingSafeEqual(leftBuffer, rightBuffer);
};

const parseCookies = (header = '') =>
  Object.fromEntries(
    header
      .split(';')
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const index = part.indexOf('=');
        if (index === -1) return [part, ''];
        return [part.slice(0, index), decodeURIComponent(part.slice(index + 1))];
      }),
  );

const SCORE_HARD_CAP = 8000;
const SCORE_PER_SECOND_CAP = 80;
const MIN_RUN_MS = 4_000;
const MAX_RUN_MS = 20 * 60 * 1000;
const RUN_TOKEN_TTL_MS = MAX_RUN_MS + 5 * 60 * 1000;
const usedRunTokens = new Map();

const cleanupUsedRunTokens = () => {
  const now = Date.now();
  for (const [nonce, expiresAt] of usedRunTokens) {
    if (expiresAt < now) usedRunTokens.delete(nonce);
  }
};

const createRunToken = (playerId) => {
  const startedAt = Date.now();
  const nonce = crypto.randomBytes(12).toString('base64url');
  const payload = `${playerId}|${startedAt}|${nonce}`;
  const sig = signValue(payload);
  return { token: `${base64UrlEncode(payload)}.${sig}`, startedAt };
};

const verifyRunToken = (token, expectedPlayerId) => {
  if (typeof token !== 'string' || token.length < 16 || !token.includes('.')) return null;
  const [payloadB64, sig] = token.split('.');
  if (!payloadB64 || !sig) return null;
  let payload;
  try { payload = base64UrlDecode(payloadB64); } catch { return null; }
  const expectedSig = signValue(payload);
  if (!timingSafeEqual(sig, expectedSig)) return null;
  const [playerIdStr, startedAtStr, nonce] = payload.split('|');
  const playerId = Number(playerIdStr);
  const startedAt = Number(startedAtStr);
  if (!Number.isFinite(playerId) || !Number.isFinite(startedAt) || !nonce) return null;
  if (playerId !== expectedPlayerId) return null;
  return { playerId, startedAt, nonce };
};

const dummyPasswordHash = '$2a$12$CwhDRHGO7lAupjd3EtwtxePFqgFKb5EKnBPBmhLXeRry0KyUilgnq';

const createSessionToken = ({ playerId, playerName, isAdmin = false }) => {
  const payload = base64UrlEncode(
    JSON.stringify({
      playerId,
      playerName,
      isAdmin: Boolean(isAdmin),
      exp: Date.now() + sessionMaxAgeMs,
    }),
  );
  return `${payload}.${signValue(payload)}`;
};

const verifySessionToken = (token) => {
  if (!token || typeof token !== 'string') return null;
  const [payload, signature] = token.split('.');
  if (!payload || !signature || !timingSafeEqual(signValue(payload), signature)) return null;

  try {
    const session = JSON.parse(base64UrlDecode(payload));
    if (!Number.isInteger(Number(session.playerId)) || !session.playerName || Number(session.exp) < Date.now()) {
      return null;
    }
    return session;
  } catch {
    return null;
  }
};

const getRequestHost = (req) => {
  const forwardedHost = req.get('x-forwarded-host');
  const host = forwardedHost ? forwardedHost.split(',')[0] : req.get('host');
  return (host ?? '').split(':')[0].toLowerCase();
};

const getOriginHost = (req) => {
  const origin = req.get('origin');
  if (!origin) return '';
  try {
    return new URL(origin).hostname.toLowerCase();
  } catch {
    return 'invalid-origin';
  }
};

const requireAllowedHost = (req, res, next) => {
  const host = getRequestHost(req);
  if (host && !allowedHosts.has(host)) {
    return res.status(421).json({ error: 'Host no permitido.' });
  }

  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    const originHost = getOriginHost(req);
    if (originHost && !allowedHosts.has(originHost)) {
      return res.status(403).json({ error: 'Origen no permitido.' });
    }
  }

  return next();
};

const normalizePlayerName = (value) => {
  const playerName = String(value ?? '').trim().replace(/\s+/g, ' ');
  if (playerName.length < 2 || playerName.length > 40) {
    throw new Error('El nombre debe tener entre 2 y 40 caracteres.');
  }
  if (!/^[\p{L}\p{N}_. -]+$/u.test(playerName)) {
    throw new Error('El nombre contiene caracteres no permitidos.');
  }
  return playerName;
};

const normalizePassword = (value) => {
  const password = String(value ?? '');
  if (password.length < 8 || password.length > 128) {
    throw new Error('La contraseña debe tener entre 8 y 128 caracteres.');
  }
  return password;
};

const requireSession = (req, res, next) => {
  const cookies = parseCookies(req.get('cookie'));
  const session = verifySessionToken(cookies.ppt_terror_session);
  if (!session) return res.status(401).json({ error: 'Sesión requerida.' });
  req.session = session;
  return next();
};

const requireAdmin = (req, res, next) => {
  requireSession(req, res, () => {
    if (!req.session?.isAdmin) return res.status(403).json({ error: 'Panel de admin requerido.' });
    return next();
  });
};

const setSessionCookie = (res, token) => {
  const secure = process.env.COOKIE_SECURE !== 'false';
  res.cookie('ppt_terror_session', token, {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    maxAge: sessionMaxAgeMs,
    path: '/',
  });
};

const clearSessionCookie = (res) => {
  res.clearCookie('ppt_terror_session', {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE !== 'false',
    sameSite: 'lax',
    path: '/',
  });
};

const mapLeaderboardRows = (rows) =>
  rows.map((row) => ({
    playerName: row.player_name,
    bestScore: Number(row.best_score),
    games: Number(row.games),
    wins: Number(row.wins),
    lastPlayedAt: row.last_played_at,
  }));

const findPlayerByName = async (playerName) => {
  const result = await pool.query(
    'SELECT id, player_name, password_hash, is_admin FROM ppt_players WHERE LOWER(player_name) = LOWER($1) LIMIT 1',
    [playerName],
  );
  return result.rows[0] ?? null;
};

const safeText = (value, maxLength = 300) => {
  if (value === undefined || value === null) return null;
  const text = String(value).replace(/\u0000/g, '').replace(/[<>]/g, '').trim();
  return text ? text.slice(0, maxLength) : null;
};

const parseJsonObject = (value) => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return value;
};

const normalizeInputEvents = (value) => {
  if (!Array.isArray(value)) return [];
  return value.slice(-80).map((event) => {
    const item = parseJsonObject(event);
    return {
      type: safeText(item.type, 40),
      key: safeText(item.key, 32),
      code: safeText(item.code, 40),
      action: safeText(item.action, 40),
      at: Number.isFinite(Number(item.at)) ? Number(item.at) : Date.now(),
    };
  });
};

const normalizeBrowserInfo = (value) => {
  const browser = parseJsonObject(value);
  return {
    language: safeText(browser.language, 120),
    timezone: safeText(browser.timezone, 120),
    platform: safeText(browser.platform, 160),
    screen: safeText(browser.screen, 80),
    viewport: safeText(browser.viewport, 80),
  };
};

const getUserAgent = (req) => safeText(req.get('user-agent'), 600);
const getAcceptLanguage = (req) => safeText(req.get('accept-language'), 180);

const recordTrafficEvent = async (req, details = {}) => {
  const cookies = parseCookies(req.get('cookie'));
  const session = verifySessionToken(cookies.ppt_terror_session);
  const browser = normalizeBrowserInfo(details.browser);
  const inputEvents = normalizeInputEvents(details.inputEvents);

  await pool.query(
    `INSERT INTO ppt_traffic (
      player_id, player_name, event_type, path, method, status_code, request_ip,
      user_agent, accept_language, browser_language, browser_timezone, platform,
      screen, viewport, input_events
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7::inet, $8, $9, $10, $11, $12, $13, $14, $15::jsonb)`,
    [
      session?.playerId ?? null,
      session?.playerName ?? null,
      safeText(details.eventType, 80) ?? 'request',
      safeText(details.path, 300) ?? safeText(req.originalUrl || req.path, 300) ?? '/',
      safeText(req.method, 12),
      Number.isInteger(details.statusCode) ? details.statusCode : null,
      req.ip,
      getUserAgent(req),
      getAcceptLanguage(req),
      browser.language,
      browser.timezone,
      browser.platform,
      browser.screen,
      browser.viewport,
      JSON.stringify(inputEvents),
    ],
  );
};

const mapTrafficRows = (rows) =>
  rows.map((row) => ({
    id: Number(row.id),
    playerId: row.player_id === null ? null : Number(row.player_id),
    playerName: row.player_name,
    eventType: row.event_type,
    path: row.path,
    method: row.method,
    statusCode: row.status_code === null ? null : Number(row.status_code),
    requestIp: row.request_ip,
    userAgent: row.user_agent,
    acceptLanguage: row.accept_language,
    browserLanguage: row.browser_language,
    browserTimezone: row.browser_timezone,
    platform: row.platform,
    screen: row.screen,
    viewport: row.viewport,
    inputEvents: row.input_events ?? [],
    createdAt: row.created_at,
  }));

const initDatabase = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS ppt_players (
      id BIGSERIAL PRIMARY KEY,
      player_name TEXT NOT NULL CHECK (char_length(player_name) BETWEEN 2 AND 40),
      password_hash TEXT NOT NULL,
      is_admin BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      last_login_at TIMESTAMPTZ
    );
  `);
  await pool.query('ALTER TABLE ppt_players ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT FALSE;');
  await pool.query('CREATE UNIQUE INDEX IF NOT EXISTS idx_ppt_players_lower_name ON ppt_players (LOWER(player_name));');
  for (const adminName of adminPlayerNames) {
    await pool.query('UPDATE ppt_players SET is_admin = TRUE WHERE LOWER(player_name) = LOWER($1)', [adminName]);
  }

  await pool.query(`
    CREATE TABLE IF NOT EXISTS ppt_scores (
      id BIGSERIAL PRIMARY KEY,
      player_id BIGINT REFERENCES ppt_players(id) ON DELETE SET NULL,
      player_name TEXT NOT NULL CHECK (char_length(player_name) BETWEEN 2 AND 40),
      score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100000),
      won BOOLEAN NOT NULL DEFAULT FALSE,
      request_ip INET,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  await pool.query('ALTER TABLE ppt_scores ADD COLUMN IF NOT EXISTS player_id BIGINT REFERENCES ppt_players(id) ON DELETE SET NULL;');
  await pool.query('CREATE INDEX IF NOT EXISTS idx_ppt_scores_created_at ON ppt_scores (created_at DESC);');
  await pool.query('CREATE INDEX IF NOT EXISTS idx_ppt_scores_score ON ppt_scores (score DESC);');
  await pool.query('CREATE INDEX IF NOT EXISTS idx_ppt_scores_player_id ON ppt_scores (player_id);');

  await pool.query(`
    CREATE TABLE IF NOT EXISTS ppt_traffic (
      id BIGSERIAL PRIMARY KEY,
      player_id BIGINT REFERENCES ppt_players(id) ON DELETE SET NULL,
      player_name TEXT,
      event_type TEXT NOT NULL DEFAULT 'request',
      path TEXT,
      method TEXT,
      status_code INTEGER,
      request_ip INET,
      user_agent TEXT,
      accept_language TEXT,
      browser_language TEXT,
      browser_timezone TEXT,
      platform TEXT,
      screen TEXT,
      viewport TEXT,
      input_events JSONB NOT NULL DEFAULT '[]'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  await pool.query('CREATE INDEX IF NOT EXISTS idx_ppt_traffic_created_at ON ppt_traffic (created_at DESC);');
  await pool.query('CREATE INDEX IF NOT EXISTS idx_ppt_traffic_player ON ppt_traffic (player_id, created_at DESC);');
};

app.use('/api', requireAllowedHost);

app.use('/api', (req, res, next) => {
  if (req.path === '/telemetry' || req.path.startsWith('/admin')) return next();
  res.on('finish', () => {
    void recordTrafficEvent(req, {
      eventType: 'request',
      statusCode: res.statusCode,
      path: req.originalUrl,
    }).catch((error) => {
      console.error('[traffic]', error);
    });
  });
  return next();
});

app.get('/healthz', asyncHandler(async (_req, res) => {
  await pool.query('SELECT 1');
  res.json({ ok: true });
}));

app.get('/api/session', (req, res) => {
  const cookies = parseCookies(req.get('cookie'));
  const session = verifySessionToken(cookies.ppt_terror_session);
  if (!session) return res.json({ authenticated: false });
  return res.json({ authenticated: true, playerName: session.playerName, isAdmin: Boolean(session.isAdmin) });
});

app.post('/api/register', asyncHandler(async (req, res) => {
  let playerName;
  let password;
  if (req.body?.acceptTerms !== true) {
    return res.status(400).json({ error: 'Debes aceptar los Términos y Condiciones.' });
  }
  try {
    playerName = normalizePlayerName(req.body?.name);
    password = normalizePassword(req.body?.password);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const isAdmin = adminPlayerNames.has(playerName.toLowerCase());

  try {
    const result = await pool.query(
      `INSERT INTO ppt_players (player_name, password_hash, is_admin, last_login_at)
       VALUES ($1, $2, $3, NOW())
       RETURNING id, player_name, is_admin`,
      [playerName, passwordHash, isAdmin],
    );
    const player = result.rows[0];
    setSessionCookie(res, createSessionToken({ playerId: Number(player.id), playerName: player.player_name, isAdmin: player.is_admin }));
    return res.status(201).json({ authenticated: true, playerName: player.player_name, isAdmin: player.is_admin });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Ese nombre ya está registrado.' });
    }
    throw error;
  }
}));

app.post('/api/login', asyncHandler(async (req, res) => {
  let playerName;
  try {
    playerName = normalizePlayerName(req.body?.name);
    normalizePassword(req.body?.password);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }

  const password = String(req.body?.password ?? '');
  const player = await findPlayerByName(playerName);
  const passwordHash = player?.password_hash ?? dummyPasswordHash;
  const isValidPassword = await bcrypt.compare(password, passwordHash);

  if (!player || !isValidPassword) {
    return res.status(401).json({ error: 'Nombre o contraseña inválidos.' });
  }

  await pool.query('UPDATE ppt_players SET last_login_at = NOW() WHERE id = $1', [player.id]);

  setSessionCookie(res, createSessionToken({ playerId: Number(player.id), playerName: player.player_name, isAdmin: player.is_admin }));
  return res.json({ authenticated: true, playerName: player.player_name, isAdmin: player.is_admin });
}));

app.post('/api/logout', (_req, res) => {
  clearSessionCookie(res);
  res.json({ ok: true });
});

app.post('/api/game/start', requireSession, asyncHandler(async (req, res) => {
  const { token, startedAt } = createRunToken(req.session.playerId);
  return res.json({ runToken: token, startedAt });
}));

app.post('/api/scores', requireSession, asyncHandler(async (req, res) => {
  const score = Number(req.body?.score);
  const won = Boolean(req.body?.won);

  if (!Number.isInteger(score) || score < 0 || score > SCORE_HARD_CAP) {
    return res.status(400).json({ error: 'Puntaje inválido.' });
  }

  const verified = verifyRunToken(req.body?.runToken, req.session.playerId);
  if (!verified) {
    return res.status(400).json({ error: 'Run token inválido. Inicia una partida nueva.' });
  }

  cleanupUsedRunTokens();
  if (usedRunTokens.has(verified.nonce)) {
    return res.status(409).json({ error: 'Esta partida ya fue registrada.' });
  }

  const elapsedMs = Date.now() - verified.startedAt;
  if (elapsedMs < MIN_RUN_MS) {
    return res.status(400).json({ error: 'Partida demasiado corta.' });
  }
  if (elapsedMs > MAX_RUN_MS) {
    return res.status(400).json({ error: 'Run token expirado. Inicia una partida nueva.' });
  }

  const maxAllowedScore = Math.ceil((elapsedMs / 1000) * SCORE_PER_SECOND_CAP);
  if (score > maxAllowedScore) {
    return res.status(400).json({ error: 'Puntaje inconsistente con la duración.' });
  }

  usedRunTokens.set(verified.nonce, Date.now() + RUN_TOKEN_TTL_MS);

  await pool.query(
    'INSERT INTO ppt_scores (player_id, player_name, score, won, request_ip) VALUES ($1, $2, $3, $4, $5::inet)',
    [req.session.playerId, req.session.playerName, score, won, req.ip],
  );

  const best = await pool.query(
    'SELECT MAX(score) AS best_score FROM ppt_scores WHERE player_id = $1',
    [req.session.playerId],
  );

  return res.status(201).json({
    ok: true,
    bestScore: Number(best.rows[0]?.best_score ?? score),
    isPersonalBest: score >= Number(best.rows[0]?.best_score ?? score),
  });
}));

app.post('/api/telemetry', requireSession, asyncHandler(async (req, res) => {
  const body = req.body ?? {};
  await recordTrafficEvent(req, {
    eventType: safeText(body.eventType, 80) ?? 'client',
    statusCode: 200,
    path: safeText(body.path, 300) ?? req.originalUrl,
    browser: body.browser,
    inputEvents: body.inputEvents,
  });
  return res.status(201).json({ ok: true });
}));

app.get('/api/leaderboard', requireSession, asyncHandler(async (_req, res) => {
  const leaderboardSql = `
    SELECT
      player_name,
      MAX(score) AS best_score,
      COUNT(*) AS games,
      COUNT(*) FILTER (WHERE won) AS wins,
      MAX(created_at) AS last_played_at
    FROM ppt_scores
    WHERE ($1::BOOLEAN = FALSE OR created_at >= NOW() - INTERVAL '7 days')
    GROUP BY player_name
    ORDER BY best_score DESC, wins DESC, last_played_at ASC
    LIMIT 10;
  `;

  const [week, allTime] = await Promise.all([
    pool.query(leaderboardSql, [true]),
    pool.query(leaderboardSql, [false]),
  ]);

  return res.json({
    topWeek: mapLeaderboardRows(week.rows),
    topAllTime: mapLeaderboardRows(allTime.rows),
  });
}));

app.get('/api/admin/users', requireAdmin, asyncHandler(async (_req, res) => {
  const rows = await pool.query(`
    SELECT
      p.id,
      p.player_name,
      p.is_admin,
      p.created_at,
      p.last_login_at,
      COALESCE(MAX(s.score), 0) AS best_score,
      COUNT(s.id) AS games,
      MAX(s.created_at) AS last_played_at
    FROM ppt_players p
    LEFT JOIN ppt_scores s ON s.player_id = p.id
    GROUP BY p.id
    ORDER BY p.last_login_at DESC NULLS LAST, p.created_at DESC
    LIMIT 100;
  `);

  return res.json({
    users: rows.rows.map((row) => ({
      id: Number(row.id),
      playerName: row.player_name,
      isAdmin: Boolean(row.is_admin),
      bestScore: Number(row.best_score),
      games: Number(row.games),
      createdAt: row.created_at,
      lastLoginAt: row.last_login_at,
      lastPlayedAt: row.last_played_at,
    })),
  });
}));

app.get('/api/admin/traffic', requireAdmin, asyncHandler(async (req, res) => {
  const limit = Math.min(300, Math.max(20, Number(req.query.limit) || 150));
  const rows = await pool.query(
    `SELECT *
     FROM ppt_traffic
     ORDER BY created_at DESC
     LIMIT $1`,
    [limit],
  );
  return res.json({ traffic: mapTrafficRows(rows.rows) });
}));

app.get('/api/admin/users/:id/inputs', requireAdmin, asyncHandler(async (req, res) => {
  const userId = Number(req.params.id);
  if (!Number.isInteger(userId) || userId < 1) {
    return res.status(400).json({ error: 'Usuario inválido.' });
  }

  const rows = await pool.query(
    `SELECT *
     FROM ppt_traffic
     WHERE player_id = $1 AND jsonb_array_length(input_events) > 0
     ORDER BY created_at DESC
     LIMIT 80`,
    [userId],
  );
  return res.json({ events: mapTrafficRows(rows.rows) });
}));

const SITE_URL = process.env.SITE_URL ?? 'https://terror.iclexi.tech';

app.get('/robots.txt', (_req, res) => {
  res.type('text/plain').send(
    [
      'User-agent: *',
      'Allow: /',
      'Allow: /terminos',
      'Allow: /privacidad',
      'Disallow: /api/',
      `Sitemap: ${SITE_URL}/sitemap.xml`,
      `Host: ${SITE_URL}`,
      '',
    ].join('\n'),
  );
});

app.get('/sitemap.xml', (_req, res) => {
  const today = new Date().toISOString().slice(0, 10);
  const urls = ['/', '/terminos', '/privacidad'];
  const body =
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    urls
      .map(
        (u) =>
          `  <url><loc>${SITE_URL}${u}</loc><lastmod>${today}</lastmod><changefreq>monthly</changefreq></url>\n`,
      )
      .join('') +
    '</urlset>\n';
  res.type('application/xml').send(body);
});

app.get('/.well-known/security.txt', (_req, res) => {
  res.type('text/plain').send(
    [
      'Contact: mailto:security@iclexi.tech',
      'Expires: 2027-05-10T00:00:00.000Z',
      'Preferred-Languages: es, en',
      `Canonical: ${SITE_URL}/.well-known/security.txt`,
      `Policy: ${SITE_URL}/terminos`,
      '',
    ].join('\n'),
  );
});

const distDirectory = path.join(__dirname, 'dist');
app.use(
  express.static(distDirectory, {
    etag: true,
    maxAge: '1h',
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.html')) {
        res.setHeader('Cache-Control', 'no-store');
      }
    },
  }),
);

app.get('*', (_req, res) => {
  res.sendFile(path.join(distDirectory, 'index.html'));
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ error: 'Error interno del servidor.' });
});

await initDatabase();

const server = app.listen(port, '0.0.0.0', () => {
  console.log(`PPT del Terror listening on port ${port}`);
});

const shutdown = async () => {
  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
