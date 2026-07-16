import { Pool } from 'pg';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    host: process.env.PGHOST || 'postgres.railway.internal',
    port: parseInt(process.env.PGPORT || '5432'),
    database: process.env.PGDATABASE || 'railway',
    user: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD,
    ssl: false
});

async function setupDatabase() {
    const client = await pool.connect();
    try {
        console.log('🔌 Connected to PostgreSQL...');
        
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
    } catch (error) {
        console.error('❌ Error setting up database:', error);
    } finally {
        client.release();
        await pool.end();
    }
}

setupDatabase();
