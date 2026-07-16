import http from 'http';
import handler from './api/contact.js';

const PORT = process.env.PORT || 3000;

const server = http.createServer(async (req, res) => {
    console.log(`📨 ${req.method} ${req.url}`);
    
    const url = new URL(req.url, `http://${req.headers.host}`);
    req.query = Object.fromEntries(url.searchParams);
    req.url = url.pathname;
    
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }
    
    // Health check - respond immediately
    if (req.url === '/health' || req.url === '/api/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
            status: 'OK', 
            timestamp: new Date().toISOString(),
            uptime: process.uptime()
        }));
        return;
    }
    
    try {
        await handler(req, res);
    } catch (error) {
        console.error('Server error:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Internal server error' }));
    }
});

// Bind to all interfaces (0.0.0.0) for Railway
server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 Health check: http://0.0.0.0:${PORT}/health`);
    console.log(`📍 API endpoint: http://0.0.0.0:${PORT}/api/contact`);
    console.log(`📍 Environment: ${process.env.RAILWAY_ENVIRONMENT_NAME || 'local'}`);
});
