const { Pool } = require('pg');
require('dotenv').config();

// String de conexão fornecida pelo arquiteto
const connectionString = 'postgresql://neondb_owner:npg_onJF7pdt8EcM@ep-falling-voice-ans6ta4l-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require';

const pool = new Pool({
    connectionString: connectionString,
    ssl: {
        rejectUnauthorized: false // Necessário para conexões seguras com Neon/AWS
    },
    max: 20, // Máximo de conexões no pool
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

// Log de eventos do Pool
pool.on('connect', () => {
    console.log('[DATABASE] Pool de conexão estabelecido com o PostgreSQL.');
});

pool.on('error', (err) => {
    console.error('[DATABASE ERROR] Erro inesperado no cliente PostgreSQL:', err);
    process.exit(-1);
});

module.exports = {
    /**
     * Executa uma query SQL pura no banco de dados.
     * @param {string} text - A query SQL.
     * @param {Array} params - Parâmetros para prevenir SQL Injection.
     */
    query: (text, params) => pool.query(text, params),
    
    /**
     * Obtém um cliente individual do pool para transações ACID.
     */
    getClient: () => pool.connect(),
    
    pool: pool
};