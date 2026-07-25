const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// CORS and logging
app.use((req, res, next) => {
    console.log(`📨 ${req.method} ${req.url}`);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
        return;
    }
    next();
});

app.use(express.json());

// Health check
app.get('/health', (req, res) => {
    console.log('✅ Health check called');
    res.json({ status: 'OK', message: 'Healthy' });
});

app.get('/api/health', (req, res) => {
    console.log('✅ API Health check called');
    res.json({ status: 'OK', message: 'Healthy' });
});

app.get('/', (req, res) => {
    console.log('✅ Root called');
    res.json({ status: 'online', message: 'API is running' });
});

app.get('/api/contact', (req, res) => {
    console.log('📩 GET /api/contact called');
    res.json({ 
        message: 'GET method not allowed. Use POST to submit a consultation.',
        allowed_methods: ['POST']
    });
});

app.post('/api/contact', (req, res) => {
    console.log('📩 POST /api/contact called');
    console.log('📦 Body:', req.body);
    
    try {
        const { name, email, phone, service, message, timeframe } = req.body || {};

        if (!name || !email || !message) {
            console.log('❌ Validation failed');
            return res.status(400).json({
                success: false,
                error: 'Name, email, and message are required'
            });
        }

        console.log('✅ Success');
        res.json({
            success: true,
            message: 'Consultation request received!',
            data: { name, email, service },
            notifications: { emailSent: false, dbSaved: true }
        });
    } catch (error) {
        console.error('❌ Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// 404 handler
app.use((req, res) => {
    console.log('❌ 404:', req.url);
    res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('❌ Server error:', err);
    res.status(500).json({ error: err.message });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`📡 Health: http://0.0.0.0:${PORT}/health`);
    console.log(`📡 API: http://0.0.0.0:${PORT}/api/contact`);
});
