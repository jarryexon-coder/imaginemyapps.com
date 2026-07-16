import { Pool } from 'pg';

// Use PUBLIC URL when running locally
const isLocal = !process.env.RAILWAY_ENVIRONMENT;
const connectionString = isLocal 
    ? 'postgresql://postgres:xSbMwKByqWxCbLHzfPnlLdpIfAUZyLwZ@tokaido.proxy.rlwy.net:19508/railway'
    : 'postgresql://postgres:xSbMwKByqWxCbLHzfPnlLdpIfAUZyLwZ@postgres.railway.internal:5432/railway';

const pool = new Pool({
    connectionString: connectionString,
    ssl: isLocal ? { rejectUnauthorized: false } : false
});

async function setupDatabase() {
    const client = await pool.connect();
    try {
        console.log('🔌 Connected to PostgreSQL...');
        console.log(`📍 Using ${isLocal ? 'PUBLIC' : 'INTERNAL'} connection`);
        
        // Create consultations table
        await client.query(`
            CREATE TABLE IF NOT EXISTS consultations (
                id SERIAL PRIMARY KEY,
                name TEXT NOT NULL,
                email TEXT NOT NULL,
                phone TEXT,
                service TEXT,
                message TEXT NOT NULL,
                timeframe TEXT,
                budget TEXT,
                status TEXT DEFAULT 'pending',
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                source TEXT DEFAULT 'website'
            );
        `);
        console.log('✅ Created consultations table');

        // Create indexes
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_consultations_email ON consultations(email);
            CREATE INDEX IF NOT EXISTS idx_consultations_status ON consultations(status);
            CREATE INDEX IF NOT EXISTS idx_consultations_created_at ON consultations(created_at);
        `);
        console.log('✅ Created indexes');

        // Create admin users table
        await client.query(`
            CREATE TABLE IF NOT EXISTS admin_users (
                id SERIAL PRIMARY KEY,
                username TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('✅ Created admin_users table');

        // Insert default admin
        await client.query(`
            INSERT INTO admin_users (username, password_hash) 
            VALUES ('admin', '$2a$10$8ZgQYcLLF9g9WXfLhQ9R7uVx2C5yF7jQ8wN1mXzYtR6sPvB3nK4') 
            ON CONFLICT (username) DO NOTHING;
        `);
        console.log('✅ Default admin created');

        // Create email logs table
        await client.query(`
            CREATE TABLE IF NOT EXISTS email_logs (
                id SERIAL PRIMARY KEY,
                to_email TEXT NOT NULL,
                subject TEXT,
                body TEXT,
                status TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('✅ Created email_logs table');

        console.log('🎉 Database schema setup complete!');
        
        // Verify tables
        const result = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name;
        `);
        console.log('📊 Tables in database:', result.rows.map(r => r.table_name).join(', '));

    } catch (error) {
        console.error('❌ Error setting up database:', error.message);
        if (error.message.includes('getaddrinfo')) {
            console.log('\n💡 Tip: Make sure you\'re using the correct connection string');
            console.log('   PUBLIC URL: postgresql://postgres:...@tokaido.proxy.rlwy.net:19508/railway');
        }
    } finally {
        client.release();
        await pool.end();
    }
}

setupDatabase();
