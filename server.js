const crypto = require('crypto');
const express = require('express');
const path = require('path');
const { Pool } = require('pg');
const nodemailer = require('nodemailer');

const app = express();
const PORT = Number(process.env.PORT || 3000);
const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const SESSION_TTL_MS = 8 * 60 * 60 * 1000;
const ALLOWED_STATUSES = new Set(['pending', 'contacted', 'approved', 'rejected']);
const ALLOWED_SERVICES = new Set(['mobile', 'web', 'backend', 'full']);
const rateLimits = new Map();

if (IS_PRODUCTION) app.set('trust proxy', 1);
const pool = process.env.DATABASE_URL
  ? new Pool({ connectionString: process.env.DATABASE_URL, ssl: IS_PRODUCTION ? { rejectUnauthorized: false } : false })
  : null;

app.disable('x-powered-by');
app.use(express.json({ limit: '32kb' }));
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
});

function clean(value, maxLength) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}
function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 254;
}
function safeEqual(left, right) {
  const a = Buffer.from(left || '');
  const b = Buffer.from(right || '');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
function parseCookies(req) {
  return Object.fromEntries((req.headers.cookie || '').split(';').map((item) => item.trim().split('=')).filter(([key, value]) => key && value).map(([key, value]) => [key, decodeURIComponent(value)]));
}
function signSession(expiresAt) {
  if (!process.env.SESSION_SECRET) return null;
  const payload = String(expiresAt);
  return `${payload}.${crypto.createHmac('sha256', process.env.SESSION_SECRET).update(payload).digest('hex')}`;
}
function requireAdmin(req, res, next) {
  const token = parseCookies(req).admin_session;
  const [expiresAt] = (token || '').split('.');
  const expected = expiresAt ? signSession(expiresAt) : null;
  if (!expected || !safeEqual(token, expected) || Number(expiresAt) < Date.now()) {
    return res.status(401).json({ success: false, error: 'Authentication required' });
  }
  next();
}
function limitRequests(req, res, next) {
  const now = Date.now();
  const recent = (rateLimits.get(req.ip) || []).filter((time) => now - time < 15 * 60 * 1000);
  if (recent.length >= 8) return res.status(429).json({ success: false, error: 'Too many requests. Please try again later.' });
  recent.push(now);
  rateLimits.set(req.ip, recent);
  next();
}
function requireSameOrigin(req, res, next) {
  const origin = req.get('origin');
  if (origin && origin !== `${req.protocol}://${req.get('host')}`) return res.status(403).json({ success: false, error: 'Invalid request origin' });
  next();
}

app.get(['/health', '/api/health'], async (_req, res) => {
  try {
    if (pool) await pool.query('SELECT 1');
    res.json({ status: 'ok', database: pool ? 'connected' : 'not_configured' });
  } catch (_error) {
    res.status(503).json({ status: 'degraded', database: 'unavailable' });
  }
});

app.post('/api/admin/login', limitRequests, (req, res) => {
  const configuredUser = process.env.ADMIN_USERNAME;
  const configuredPassword = process.env.ADMIN_PASSWORD;
  if (!configuredUser || !configuredPassword || !process.env.SESSION_SECRET) return res.status(503).json({ success: false, error: 'Admin login is not configured' });
  if (!safeEqual(clean(req.body?.username, 100), configuredUser) || !safeEqual(clean(req.body?.password, 200), configuredPassword)) return res.status(401).json({ success: false, error: 'Invalid credentials' });
  const expiresAt = Date.now() + SESSION_TTL_MS;
  res.setHeader('Set-Cookie', `admin_session=${encodeURIComponent(signSession(expiresAt))}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${SESSION_TTL_MS / 1000}${IS_PRODUCTION ? '; Secure' : ''}`);
  res.json({ success: true });
});

app.post('/api/admin/logout', requireSameOrigin, (_req, res) => {
  res.setHeader('Set-Cookie', 'admin_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0');
  res.json({ success: true });
});

app.post('/api/contact', limitRequests, async (req, res) => {
  const name = clean(req.body?.name, 120);
  const email = clean(req.body?.email, 254).toLowerCase();
  const phone = clean(req.body?.phone, 40);
  const service = clean(req.body?.service, 40);
  const message = clean(req.body?.message, 4000);
  const timeframe = clean(req.body?.timeframe, 60);
  const source = clean(req.body?.source, 20) || 'website';
  if (clean(req.body?.website, 100)) return res.status(200).json({ success: true, message: 'Request received.' });
  if (name.length < 2 || !isValidEmail(email) || message.length < 10 || !ALLOWED_SERVICES.has(service)) return res.status(400).json({ success: false, error: 'Please complete all required fields with valid information.' });
  if (!pool) return res.status(503).json({ success: false, error: 'Consultation service is temporarily unavailable.' });

  try {
    const result = await pool.query(
      `INSERT INTO consultations (name, email, phone, service, message, timeframe, source) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
      [name, email, phone || null, service, message, timeframe || null, source]
    );
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS && process.env.ADMIN_EMAIL) {
      const transporter = nodemailer.createTransport({ host: process.env.SMTP_HOST, port: Number(process.env.SMTP_PORT || 587), secure: Number(process.env.SMTP_PORT) === 465, auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } });
      transporter.sendMail({ from: process.env.SMTP_USER, to: process.env.ADMIN_EMAIL, replyTo: email, subject: `New consultation request #${result.rows[0].id}`, text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone || 'Not provided'}\nService: ${service}\nTimeframe: ${timeframe || 'Not provided'}\n\n${message}` }).catch(() => console.error('Consultation notification email failed'));
    }
    res.status(201).json({ success: true, message: 'Your consultation request was received. We will be in touch soon.', reference: String(result.rows[0].id) });
  } catch (_error) {
    console.error('Consultation storage failed');
    res.status(500).json({ success: false, error: 'We could not save your request. Please try again.' });
  }
});

app.get('/api/contact', requireAdmin, async (_req, res) => {
  if (!pool) return res.status(503).json({ success: false, error: 'Database is not configured' });
  try {
    const result = await pool.query('SELECT id, name, email, phone, service, message, timeframe, budget, status, source, created_at, updated_at FROM consultations ORDER BY created_at DESC LIMIT 500');
    res.json({ success: true, data: result.rows });
  } catch (_error) {
    res.status(500).json({ success: false, error: 'Unable to load consultations' });
  }
});

app.put('/api/contact', requireSameOrigin, requireAdmin, async (req, res) => {
  const id = Number(req.query.id);
  const status = clean(req.body?.status, 30);
  if (!Number.isInteger(id) || id <= 0 || !ALLOWED_STATUSES.has(status)) return res.status(400).json({ success: false, error: 'Invalid consultation update' });
  try {
    const result = await pool.query('UPDATE consultations SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING id, status', [status, id]);
    if (!result.rowCount) return res.status(404).json({ success: false, error: 'Consultation not found' });
    res.json({ success: true, data: result.rows[0] });
  } catch (_error) {
    res.status(500).json({ success: false, error: 'Unable to update consultation' });
  }
});

app.use('/assets', express.static(path.join(__dirname, 'assets'), { fallthrough: false }));
app.use('/css', express.static(path.join(__dirname, 'css'), { fallthrough: false }));
app.use('/js', express.static(path.join(__dirname, 'js'), { fallthrough: false }));
app.get('/', (_req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get(['/contact', '/support'], (_req, res) => res.sendFile(path.join(__dirname, 'contact.html')));
app.get('/:page([a-z0-9-]+.html)', (req, res, next) => {
  const publicPage = path.join(__dirname, req.params.page);
  res.sendFile(publicPage, (error) => error ? next() : undefined);
});
app.use((_req, res) => res.status(404).json({ error: 'Not found' }));
if (require.main === module) app.listen(PORT, '0.0.0.0', () => console.log(`ImagineMyApps listening on port ${PORT}`));
module.exports = app;
