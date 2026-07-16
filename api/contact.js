import { Pool } from 'pg';
import nodemailer from 'nodemailer';

// Database connection - works both locally and on Railway
const isLocal = !process.env.RAILWAY_ENVIRONMENT;
const pool = new Pool({
    connectionString: isLocal 
        ? 'postgresql://postgres:xSbMwKByqWxCbLHzfPnlLdpIfAUZyLwZ@tokaido.proxy.rlwy.net:19508/railway'
        : process.env.DATABASE_URL,
    ssl: isLocal ? { rejectUnauthorized: false } : false
});

// Email transporter
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, PUT, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Health check endpoint
    if (req.url === '/health' || req.url === '/api/health') {
        try {
            const client = await pool.connect();
            await client.query('SELECT NOW()');
            client.release();
            return res.status(200).json({ 
                status: 'OK', 
                database: 'connected',
                environment: process.env.RAILWAY_ENVIRONMENT_NAME || 'local'
            });
        } catch (error) {
            return res.status(500).json({ 
                status: 'ERROR', 
                database: 'disconnected',
                error: error.message
            });
        }
    }

    // Handle GET requests (for admin dashboard)
    if (req.method === 'GET') {
        return await getConsultations(req, res);
    }

    // Handle POST requests (form submissions)
    if (req.method === 'POST') {
        return await createConsultation(req, res);
    }

    // Handle PUT requests (update status)
    if (req.method === 'PUT') {
        return await updateStatus(req, res);
    }

    return res.status(405).json({ error: 'Method not allowed' });
}

// GET: Fetch all consultations (with auth)
async function getConsultations(req, res) {
    try {
        // Auth check
        const authHeader = req.headers.authorization;
        const expectedToken = process.env.ADMIN_TOKEN || 'h+MJQnLvM5z6Rv2ZWaLv0cdu325qn8CVnZRqL86krmY=';
        
        if (!authHeader || authHeader !== `Bearer ${expectedToken}`) {
            return res.status(401).json({ 
                success: false, 
                error: 'Unauthorized - Invalid or missing token' 
            });
        }

        const result = await pool.query(
            'SELECT * FROM consultations ORDER BY created_at DESC'
        );

        return res.status(200).json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Database error:', error);
        return res.status(500).json({ 
            success: false, 
            error: 'Database error: ' + error.message 
        });
    }
}

// POST: Create new consultation
async function createConsultation(req, res) {
    const { name, email, phone, service, message, timeframe, budget } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({
            success: false,
            error: 'Name, email, and message are required'
        });
    }

    let dbSaved = false;
    let emailSent = false;
    let autoResponderSent = false;

    try {
        // Save to database
        const result = await pool.query(
            `INSERT INTO consultations (name, email, phone, service, message, timeframe, budget, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
             RETURNING id`,
            [name, email, phone || null, service || null, message, timeframe || null, budget || null]
        );

        dbSaved = true;
        const consultationId = result.rows[0].id;
        console.log(`✅ Saved consultation #${consultationId} to database`);

        // Send email notifications (only if SMTP is configured)
        if (process.env.SMTP_USER && process.env.SMTP_PASS && process.env.SMTP_USER !== 'your-email@gmail.com') {
            try {
                // Admin notification
                await transporter.sendMail({
                    from: `"ImagineMyApps" <${process.env.SMTP_USER}>`,
                    to: process.env.ADMIN_EMAIL || 'admin@imaginemyapps.com',
                    subject: `New Consultation: ${name}`,
                    html: `
                        <h2>New Consultation Request</h2>
                        <p><strong>Name:</strong> ${name}</p>
                        <p><strong>Email:</strong> ${email}</p>
                        <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
                        <p><strong>Service:</strong> ${service || 'Not specified'}</p>
                        <p><strong>Budget:</strong> ${budget || 'Not specified'}</p>
                        <p><strong>Timeframe:</strong> ${timeframe || 'Not specified'}</p>
                        <p><strong>Message:</strong></p>
                        <p style="background: #f5f5f5; padding: 15px; border-radius: 5px;">${message}</p>
                        <hr>
                        <p><a href="${process.env.ADMIN_URL || 'https://imaginemyapps.railway.app'}/admin.html">View in Admin Dashboard</a></p>
                    `
                });
                emailSent = true;
                console.log(`✅ Email sent to admin`);

                // Auto-responder to customer
                await transporter.sendMail({
                    from: `"ImagineMyApps" <${process.env.SMTP_USER}>`,
                    to: email,
                    subject: `Thank you for contacting ImagineMyApps, ${name}!`,
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center;">
                                <h2>Thank You, ${name}!</h2>
                            </div>
                            <div style="padding: 30px; background: #f9f9f9;">
                                <p>We've received your consultation request and will review it shortly.</p>
                                <p>We'll contact you within 24 hours to discuss your project in detail.</p>
                                <br>
                                <p>Best regards,</p>
                                <p><strong>The ImagineMyApps Team</strong></p>
                                <p style="font-size: 12px; color: #666;">admin@imaginemyapps.com | imaginemyapps.com</p>
                            </div>
                        </div>
                    `
                });
                autoResponderSent = true;
                console.log(`✅ Auto-responder sent to ${email}`);

            } catch (emailError) {
                console.error('Email error:', emailError);
            }
        } else {
            console.log('ℹ️ Email not configured - skipping email notifications');
        }

        return res.status(200).json({
            success: true,
            message: 'Consultation request received! Check your email for confirmation.',
            data: { name, email, service },
            notifications: { emailSent, autoResponderSent, dbSaved }
        });

    } catch (error) {
        console.error('Database error:', error);
        return res.status(500).json({
            success: false,
            error: 'Database error. Please try again.'
        });
    }
}

// PUT: Update consultation status
async function updateStatus(req, res) {
    try {
        // Auth check
        const authHeader = req.headers.authorization;
        const expectedToken = process.env.ADMIN_TOKEN || 'h+MJQnLvM5z6Rv2ZWaLv0cdu325qn8CVnZRqL86krmY=';
        
        if (!authHeader || authHeader !== `Bearer ${expectedToken}`) {
            return res.status(401).json({ 
                success: false, 
                error: 'Unauthorized' 
            });
        }

        const { id } = req.query;
        const { status } = req.body;

        if (!id || !status) {
            return res.status(400).json({
                success: false,
                error: 'ID and status are required'
            });
        }

        const result = await pool.query(
            'UPDATE consultations SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
            [status, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Consultation not found'
            });
        }

        return res.status(200).json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Update error:', error);
        return res.status(500).json({
            success: false,
            error: 'Database error: ' + error.message
        });
    }
}
