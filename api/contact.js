import { Pool } from 'pg';
import nodemailer from 'nodemailer';

// Database connection
const isLocal = !process.env.RAILWAY_ENVIRONMENT;
const pool = new Pool({
    connectionString: isLocal 
        ? 'postgresql://postgres:xSbMwKByqWxCbLHzfPnlLdpIfAUZyLwZ@tokaido.proxy.rlwy.net:19508/railway'
        : process.env.DATABASE_URL,
    ssl: isLocal ? { rejectUnauthorized: false } : false
});

export default async function handler(req, res) {
    try {
        // Parse URL and query parameters
        const url = new URL(req.url, `http://${req.headers.host}`);
        const pathname = url.pathname;
        
        console.log(`📨 ${req.method} ${pathname}`);
        
        // Handle different routes
        if (pathname === '/api/contact' || pathname === '/contact') {
            if (req.method === 'GET') {
                return await getConsultations(req, res);
            } else if (req.method === 'POST') {
                return await createConsultation(req, res);
            } else if (req.method === 'PUT') {
                return await updateStatus(req, res);
            }
        }
        
        // If no route matches
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
            error: 'Not found',
            path: pathname,
            method: req.method
        }));
    } catch (error) {
        console.error('Handler error:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Internal server error' }));
    }
}

// GET: Fetch all consultations
async function getConsultations(req, res) {
    try {
        const authHeader = req.headers.authorization;
        const expectedToken = process.env.ADMIN_TOKEN || 'h+MJQnLvM5z6Rv2ZWaLv0cdu325qn8CVnZRqL86krmY=';
        
        if (!authHeader || authHeader !== `Bearer ${expectedToken}`) {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: 'Unauthorized' }));
            return;
        }

        const result = await pool.query('SELECT * FROM consultations ORDER BY created_at DESC');
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, data: result.rows }));
    } catch (error) {
        console.error('Database error:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: error.message }));
    }
}

// POST: Create new consultation
async function createConsultation(req, res) {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', async () => {
        try {
            const data = JSON.parse(body);
            const { name, email, phone, service, message, timeframe, budget } = data;

            if (!name || !email || !message) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 
                    success: false, 
                    error: 'Name, email, and message are required' 
                }));
                return;
            }

            const result = await pool.query(
                `INSERT INTO consultations (name, email, phone, service, message, timeframe, budget)
                 VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
                [name, email, phone || null, service || null, message, timeframe || null, budget || null]
            );

            console.log(`✅ Saved consultation #${result.rows[0].id}`);

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: true,
                message: 'Consultation request received!',
                data: { name, email, service, id: result.rows[0].id }
            }));
        } catch (error) {
            console.error('Create error:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: error.message }));
        }
    });
}

// PUT: Update consultation status
async function updateStatus(req, res) {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const id = url.searchParams.get('id');
    
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', async () => {
        try {
            const authHeader = req.headers.authorization;
            const expectedToken = process.env.ADMIN_TOKEN || 'h+MJQnLvM5z6Rv2ZWaLv0cdu325qn8CVnZRqL86krmY=';
            
            if (!authHeader || authHeader !== `Bearer ${expectedToken}`) {
                res.writeHead(401, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: 'Unauthorized' }));
                return;
            }

            const { status } = JSON.parse(body);
            
            if (!id || !status) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: 'ID and status are required' }));
                return;
            }

            const result = await pool.query(
                'UPDATE consultations SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
                [status, id]
            );

            if (result.rows.length === 0) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: 'Consultation not found' }));
                return;
            }

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, data: result.rows[0] }));
        } catch (error) {
            console.error('Update error:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: error.message }));
        }
    });
}
