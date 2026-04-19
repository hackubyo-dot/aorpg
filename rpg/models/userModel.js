const db = require('../config/db');

const userModel = {
    /**
     * Busca informações completas do perfil, incluindo saldo e stats de RPG.
     */
    getUserFullProfile: async (userId) => {
        const query = `
            SELECT 
                u.id, u.full_name, u.email, u.phone, u.avatar_url, u.created_at,
                w.balance, w.currency,
                ps.level, ps.xp, ps.wins, ps.losses, ps.hp_max, ps.attack, ps.defense
            FROM users u
            JOIN wallets w ON u.id = w.user_id
            LEFT JOIN player_stats ps ON u.id = ps.user_id
            WHERE u.id = $1
        `;
        const res = await db.query(query, [userId]);
        return res.rows[0];
    },

    /**
     * Atualiza dados básicos do perfil.
     */
    updateProfile: async (userId, data) => {
        const { full_name, phone, avatar_url } = data;
        const query = `
            UPDATE users 
            SET full_name = $1, phone = $2, avatar_url = $3, updated_at = CURRENT_TIMESTAMP
            WHERE id = $4
            RETURNING id, full_name, avatar_url
        `;
        const res = await db.query(query, [full_name, phone, avatar_url, userId]);
        return res.rows[0];
    },

    /**
     * Busca o Ranking Global baseado em XP e Vitórias.
     */
    getGlobalRanking: async (limit = 10) => {
        const query = `
            SELECT 
                u.full_name, u.avatar_url, 
                ps.level, ps.xp, ps.wins
            FROM users u
            JOIN player_stats ps ON u.id = ps.user_id
            ORDER BY ps.xp DESC, ps.wins DESC
            LIMIT $1
        `;
        const res = await db.query(query, [limit]);
        return res.rows;
    },

    /**
     * Verifica se um email ou telefone já existe (excluindo o próprio usuário).
     */
    checkDuplicateContact: async (userId, email, phone) => {
        const query = `
            SELECT id FROM users 
            WHERE (email = $1 OR phone = $2) AND id != $3
        `;
        const res = await db.query(query, [email, phone, userId]);
        return res.rows.length > 0;
    }
};

module.exports = userModel;