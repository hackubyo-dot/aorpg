const db = require('../config/db');

const gameModel = {
    // Lista todos os jogos ativos
    getAllGames: async () => {
        const res = await db.query('SELECT * FROM games WHERE is_active = TRUE ORDER BY id ASC');
        return res.rows;
    },

    // Obtém estatísticas de RPG do jogador
    getPlayerStats: async (userId) => {
        const query = 'SELECT * FROM player_stats WHERE user_id = $1';
        const res = await db.query(query, [userId]);
        
        // Se não existir (primeiro jogo), cria stats base
        if (res.rows.length === 0) {
            const insertQuery = `
                INSERT INTO player_stats (user_id) VALUES ($1) 
                RETURNING *
            `;
            const newStats = await db.query(insertQuery, [userId]);
            return newStats.rows[0];
        }
        return res.rows[0];
    },

    // Registra o fim de uma partida e atualiza XP/Stats
    saveMatchResult: async (matchData) => {
        const { playerId, gameId, result, reward, xpGained } = matchData;
        const client = await db.getClient();
        
        try {
            await client.query('BEGIN');

            // 1. Inserir registro da partida
            const matchQuery = `
                INSERT INTO game_matches (game_id, player_id, result, reward_amount)
                VALUES ($1, $2, $3, $4)
            `;
            await client.query(matchQuery, [gameId, playerId, result, reward]);

            // 2. Atualizar estatísticas do jogador
            const winIncrement = result === 'WIN' ? 1 : 0;
            const lossIncrement = result === 'LOSS' ? 1 : 0;
            
            const statsUpdate = `
                UPDATE player_stats 
                SET xp = xp + $1, 
                    wins = wins + $2, 
                    losses = losses + $3
                WHERE user_id = $4
            `;
            await client.query(statsUpdate, [xpGained, winIncrement, lossIncrement, playerId]);

            // 3. Se houver recompensa financeira, atualizar carteira
            if (reward > 0) {
                await client.query('UPDATE wallets SET balance = balance + $1 WHERE user_id = $2', [reward, playerId]);
                await client.query('INSERT INTO transactions (user_id, type, amount, description) VALUES ($1, $2, $3, $4)', 
                    [playerId, 'PRIZE', reward, 'Prêmio de Vitória em Jogo']);
            }

            await client.query('COMMIT');
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    }
};

module.exports = gameModel;