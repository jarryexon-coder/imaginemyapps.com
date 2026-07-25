const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Simple logging
app.use((req, res, next) => {
    console.log(`📨 ${req.method} ${req.url}`);
    next();
});

app.use(express.json());

// Health check
app.get('/health', (req, res) => {
    res.send('OK');
});

app.get('/api/health', (req, res) => {
    res.send('OK');
});

app.get('/', (req, res) => {
    res.json({ status: 'ok' });
});

app.post('/api/contact', (req, res) => {
    try {
        const data = req.body;
        console.log('📩 Received:', data);
        res.json({ 
            success: true, 
            message: 'Received',
            data: data 
        });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server running on port ${PORT}`);
});
