const crypto = require('crypto');

const SESSION_TTL_MS = 8 * 60 * 60 * 1000;

function clean(value, maxLength) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

function safeEqual(left, right) {
  const a = Buffer.from(left || '');
  const b = Buffer.from(right || '');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function parseCookies(req) {
  return Object.fromEntries(
    (req.headers.cookie || '')
      .split(';')
      .map((item) => item.trim().split('='))
      .filter(([key, value]) => key && value)
      .map(([key, value]) => [key, decodeURIComponent(value)])
  );
}

function signSession(expiresAt) {
  const sessionSecret = process.env.SESSION_SECRET || process.env.ADMIN_TOKEN;
  if (!sessionSecret) return null;
  const payload = String(expiresAt);
  const signature = crypto.createHmac('sha256', sessionSecret)
    .update(payload)
    .digest('hex');
  return `${payload}.${signature}`;
}

function isAuthenticated(req) {
  const token = parseCookies(req).admin_session;
  const [expiresAt] = (token || '').split('.');
  const expected = expiresAt ? signSession(expiresAt) : null;
  return Boolean(expected && safeEqual(token, expected) && Number(expiresAt) >= Date.now());
}

module.exports = function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  if (req.method === 'GET') {
    const authenticated = isAuthenticated(req);
    return res.status(authenticated ? 200 : 401).json({ success: authenticated });
  }

  if (req.method === 'DELETE') {
    res.setHeader('Set-Cookie', 'admin_session=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0');
    return res.status(200).json({ success: true });
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST, DELETE');
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const configuredUser = process.env.ADMIN_USERNAME || 'admin_test';
  const configuredPassword = process.env.ADMIN_PASSWORD;
  if (!configuredPassword || !(process.env.SESSION_SECRET || process.env.ADMIN_TOKEN)) {
    return res.status(503).json({ success: false, error: 'Admin login is not configured' });
  }

  const username = clean(req.body?.username, 100);
  const password = clean(req.body?.password, 200);
  if (!safeEqual(username, configuredUser) || !safeEqual(password, configuredPassword)) {
    return res.status(401).json({ success: false, error: 'Invalid credentials' });
  }

  const expiresAt = Date.now() + SESSION_TTL_MS;
  res.setHeader('Set-Cookie', `admin_session=${encodeURIComponent(signSession(expiresAt))}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${SESSION_TTL_MS / 1000}`);
  return res.status(200).json({ success: true });
};

module.exports.isAuthenticated = isAuthenticated;
