const { Pool } = require('pg');
const { isAuthenticated } = require('./auth');

const ALLOWED_SERVICES = new Set(['mobile', 'web', 'backend', 'full']);
const ALLOWED_STATUSES = new Set(['pending', 'contacted', 'approved', 'rejected']);
const pool = process.env.DATABASE_URL
  ? new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false }, max: 1 })
  : null;

function clean(value, maxLength) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 254;
}

function requireAdmin(req, res) {
  if (isAuthenticated(req)) return true;
  res.status(401).json({ success: false, error: 'Authentication required' });
  return false;
}

async function createConsultation(req, res) {
  const name = clean(req.body?.name, 120);
  const email = clean(req.body?.email, 254).toLowerCase();
  const phone = clean(req.body?.phone, 40);
  const service = clean(req.body?.service, 40);
  const message = clean(req.body?.message, 4000);
  const timeframe = clean(req.body?.timeframe, 60);
  const source = clean(req.body?.source, 20) || 'website';

  if (clean(req.body?.website, 100)) {
    return res.status(200).json({ success: true, message: 'Request received.' });
  }
  if (name.length < 2 || !isValidEmail(email) || message.length < 10 || !ALLOWED_SERVICES.has(service)) {
    return res.status(400).json({ success: false, error: 'Please complete all required fields with valid information.' });
  }

  const result = await pool.query(
    `INSERT INTO consultations (name, email, phone, service, message, timeframe, source)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
    [name, email, phone || null, service, message, timeframe || null, source]
  );
  return res.status(201).json({
    success: true,
    message: 'Your consultation request was received. We will be in touch soon.',
    reference: String(result.rows[0].id),
  });
}

async function listConsultations(req, res) {
  if (!requireAdmin(req, res)) return;
  const result = await pool.query(
    `SELECT id, name, email, phone, service, message, timeframe, budget,
            status, source, created_at, updated_at
       FROM consultations ORDER BY created_at DESC LIMIT 500`
  );
  return res.status(200).json({ success: true, data: result.rows });
}

async function updateConsultation(req, res) {
  if (!requireAdmin(req, res)) return;
  const id = Number(req.query?.id);
  const status = clean(req.body?.status, 30);
  if (!Number.isInteger(id) || id <= 0 || !ALLOWED_STATUSES.has(status)) {
    return res.status(400).json({ success: false, error: 'Invalid consultation update' });
  }

  const result = await pool.query(
    'UPDATE consultations SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING id, status',
    [status, id]
  );
  if (!result.rowCount) {
    return res.status(404).json({ success: false, error: 'Consultation not found' });
  }
  return res.status(200).json({ success: true, data: result.rows[0] });
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  if (!pool) {
    return res.status(503).json({ success: false, error: 'Consultation database is not configured' });
  }

  try {
    if (req.method === 'POST') return await createConsultation(req, res);
    if (req.method === 'GET') return await listConsultations(req, res);
    if (req.method === 'PUT') return await updateConsultation(req, res);
    res.setHeader('Allow', 'GET, POST, PUT');
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  } catch (error) {
    console.error('Consultation API error:', error);
    return res.status(500).json({ success: false, error: 'The consultation service encountered an error' });
  }
};
