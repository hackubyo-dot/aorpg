const db = require('../config/db');

/**
 * SQL Adicional para o Schema (Executar se não houver a tabela):
 * CREATE TABLE IF NOT EXISTS transactions (
 *    id SERIAL PRIMARY KEY,
 *    user_id INTEGER REFERENCES users(id),
 *    type VARCHAR(20) NOT NULL, -- 'DEPOSIT', 'WITHDRAW', 'TRANSFER_SENT', 'TRANSFER_RECEIVED', 'TOURNAMENT_FEE', 'PRIZE'
 *    amount DECIMAL(15, 2) NOT NULL,
 *    related_user_id INTEGER REFERENCES users(id), -- Para transferências
 *    status VARCHAR(20) DEFAULT 'COMPLETED',
 *    description TEXT,
 *    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
 * );
 */

const walletModel = {
    // Busca saldo atual do usuário
    getBalance: async (userId) => {
        const query = 'SELECT balance, currency FROM wallets WHERE user_id = $1';
        const res = await db.query(query, [userId]);
        return res.rows[0];
    },

    // Busca histórico de transações com detalhes do usuário relacionado (se houver)
    getHistory: async (userId) => {
        const query = `
            SELECT t.*, u.full_name as related_user_name 
            FROM transactions t
            LEFT JOIN users u ON t.related_user_id = u.id
            WHERE t.user_id = $1
            ORDER BY t.created_at DESC
            LIMIT 50
        `;
        const res = await db.query(query, [userId]);
        return res.rows;
    },

    // Encontra um usuário por e-mail ou telefone para transferência
    findUserByContact: async (contact) => {
        const query = 'SELECT id, full_name FROM users WHERE email = $1 OR phone = $2';
        const res = await db.query(query, [contact, contact]);
        return res.rows[0];
    }
};

module.exports = walletModel;