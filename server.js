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

const requiredEnv = ['SESSION_SECRET', 'LOGIN_PASSWORD_HASH', 'DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'];
for (const key of requiredEnv) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

const port = Number.parseInt(process.env.PORT ?? '1311', 10);
const sessionMaxAgeMs = 7 * 24 * 60 * 60 * 1000;
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

const createSessionToken = (playerName) => {
  const payload = base64UrlEncode(
    JSON.stringify({
      playerName,
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
    if (!session.playerName || Number(session.exp) < Date.now()) return null;
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

const requireSession = (req, res, next) => {
  const cookies = parseCookies(req.get('cookie'));
  const session = verifySessionToken(cookies.ppt_terror_session);
  if (!session) return res.status(401).json({ error: 'Sesión requerida.' });
  req.session = session;
  return next();
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

const initDatabase = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS ppt_scores (
      id BIGSERIAL PRIMARY KEY,
      player_name TEXT NOT NULL CHECK (char_length(player_name) BETWEEN 2 AND 40),
      score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100000),
      won BOOLEAN NOT NULL DEFAULT FALSE,
      request_ip INET,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  await pool.query('CREATE INDEX IF NOT EXISTS idx_ppt_scores_created_at ON ppt_scores (created_at DESC);');
  await pool.query('CREATE INDEX IF NOT EXISTS idx_ppt_scores_score ON ppt_scores (score DESC);');
};

app.use('/api', requireAllowedHost);

app.get('/healthz', asyncHandler(async (_req, res) => {
  await pool.query('SELECT 1');
  res.json({ ok: true });
}));

app.get('/api/session', (req, res) => {
  const cookies = parseCookies(req.get('cookie'));
  const session = verifySessionToken(cookies.ppt_terror_session);
  if (!session) return res.json({ authenticated: false });
  return res.json({ authenticated: true, playerName: session.playerName });
});

app.post('/api/login', asyncHandler(async (req, res) => {
  let playerName;
  try {
    playerName = normalizePlayerName(req.body?.name);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }

  const password = String(req.body?.password ?? '');
  const isValidPassword = await bcrypt.compare(password, process.env.LOGIN_PASSWORD_HASH);
  if (!isValidPassword) {
    return res.status(401).json({ error: 'Nombre o contraseña inválidos.' });
  }

  setSessionCookie(res, createSessionToken(playerName));
  return res.json({ authenticated: true, playerName });
}));

app.post('/api/logout', (_req, res) => {
  clearSessionCookie(res);
  res.json({ ok: true });
});

app.post('/api/scores', requireSession, asyncHandler(async (req, res) => {
  const score = Number(req.body?.score);
  const won = Boolean(req.body?.won);

  if (!Number.isInteger(score) || score < 0 || score > 100000) {
    return res.status(400).json({ error: 'Puntaje inválido.' });
  }

  await pool.query(
    'INSERT INTO ppt_scores (player_name, score, won, request_ip) VALUES ($1, $2, $3, $4::inet)',
    [req.session.playerName, score, won, req.ip],
  );

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
