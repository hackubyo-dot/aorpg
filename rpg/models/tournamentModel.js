const db = require('../config/db');

const tournamentModel = {
    // Busca todos os torneios ativos e abertos
    getActiveTournaments: async () => {
        const query = `
            SELECT t.*, 
            (SELECT COUNT(*) FROM tournament_participants tp WHERE tp.tournament_id = t.id) as current_participants
            FROM tournaments t
            WHERE t.status != 'FINISHED'
            ORDER BY t.start_date ASC
        `;
        const res = await db.query(query);
        return res.rows;
    },

    // Obtém detalhes de um torneio específico e seus participantes
    getTournamentDetails: async (id) => {
        const tQuery = 'SELECT * FROM tournaments WHERE id = $1';
        const pQuery = `
            SELECT tp.*, u.full_name, u.avatar_url, ps.level 
            FROM tournament_participants tp
            JOIN users u ON tp.user_id = u.id
            JOIN player_stats ps ON u.id = ps.user_id
            WHERE tp.tournament_id = $1
            ORDER BY tp.joined_at ASC
        `;
        
        const tournament = await db.query(tQuery, [id]);
        const participants = await db.query(pQuery, [id]);
        
        return {
            info: tournament.rows[0],
            participants: participants.rows
        };
    },

    // Verifica se usuário já está inscrito
    isUserInTournament: async (tournamentId, userId) => {
        const query = 'SELECT id FROM tournament_participants WHERE tournament_id = $1 AND user_id = $2';
        const res = await db.query(query, [tournamentId, userId]);
        return res.rows.length > 0;
    }
};

module.exports = tournamentModel;