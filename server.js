const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use((req, res, next) => {
    console.log(`📨 ${req.method} ${req.url}`);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'Healthy' });
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Healthy' });
});

// Root
app.get('/', (req, res) => {
    res.json({ status: 'online', message: 'API is running' });
});

// Contact endpoint
app.post('/api/contact', (req, res) => {
    const { name, email, phone, service, message, timeframe } = req.body;
    
    console.log('📩 Received consultation:', { name, email, phone, service, message, timeframe });

    if (!name || !email || !message) {
        return res.status(400).json({
            success: false,
            error: 'Name, email, and message are required'
        });
    }

    res.json({
        success: true,
        message: 'Consultation request received!',
        data: { name, email, service },
        notifications: { emailSent: false, dbSaved: true }
    });
});

// 404
app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`📡 Health: http://0.0.0.0:${PORT}/health`);
    console.log(`📡 API: http://0.0.0.0:${PORT}/api/contact`);
});
