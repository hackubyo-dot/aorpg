const db = require('../config/db');
const tournamentModel = require('../models/tournamentModel');

class TournamentService {
    /**
     * Inscreve um usuário em um torneio com dedução de taxa.
     */
    async joinTournament(tournamentId, userId) {
        const client = await db.getClient();
        
        try {
            await client.query('BEGIN');

            // 1. Verificar se o torneio existe e está aberto
            const tRes = await client.query('SELECT * FROM tournaments WHERE id = $1 FOR UPDATE', [tournamentId]);
            const tournament = tRes.rows[0];

            if (!tournament || tournament.status !== 'OPEN') {
                throw new Error('Este torneio não está aceitando inscrições.');
            }

            // 2. Verificar se o usuário já está inscrito
            const alreadyIn = await tournamentModel.isUserInTournament(tournamentId, userId);
            if (alreadyIn) throw new Error('Já estás inscrito neste torneio.');

            // 3. Verificar limite de participantes
            const countRes = await client.query('SELECT COUNT(*) FROM tournament_participants WHERE tournament_id = $1', [tournamentId]);
            if (parseInt(countRes.rows[0].count) >= tournament.max_participants) {
                throw new Error('Este torneio já atingiu o limite máximo de jogadores.');
            }

            // 4. Verificar e deduzir saldo da carteira
            const walletRes = await client.query('SELECT balance FROM wallets WHERE user_id = $1 FOR UPDATE', [userId]);
            if (walletRes.rows[0].balance < tournament.entry_fee) {
                throw new Error('Saldo insuficiente para pagar a taxa de inscrição.');
            }

            // Deduzir valor
            await client.query('UPDATE wallets SET balance = balance - $1 WHERE user_id = $2', [tournament.entry_fee, userId]);

            // Registrar transação
            await client.query(`
                INSERT INTO transactions (user_id, type, amount, description) 
                VALUES ($1, 'TOURNAMENT_FEE', $2, $3)`, 
                [userId, tournament.entry_fee, `Inscrição no torneio: ${tournament.title}`]
            );

            // 5. Adicionar aos participantes
            await client.query('INSERT INTO tournament_participants (tournament_id, user_id) VALUES ($1, $2)', [tournamentId, userId]);

            await client.query('COMMIT');
            return { success: true };
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * Distribui prêmios aos vencedores (Lógica simplificada para Top 3)
     */
    async distributePrizes(tournamentId, winners) {
        // winners = [{userId: 1, pos: 1}, {userId: 2, pos: 2}...]
        const client = await db.getClient();
        try {
            await client.query('BEGIN');
            const tournament = (await client.query('SELECT * FROM tournaments WHERE id = $1', [tournamentId])).rows[0];
            
            for (const winner of winners) {
                let prize = 0;
                if (winner.pos === 1) prize = tournament.total_prize_pool * 0.7; // 70% para o primeiro
                if (winner.pos === 2) prize = tournament.total_prize_pool * 0.2; // 20% para o segundo
                if (winner.pos === 3) prize = tournament.total_prize_pool * 0.1; // 10% para o terceiro

                await client.query('UPDATE wallets SET balance = balance + $1 WHERE user_id = $2', [prize, winner.userId]);
                await client.query('INSERT INTO transactions (user_id, type, amount, description) VALUES ($1, $2, $3, $4)', 
                    [winner.userId, 'PRIZE', prize, `Prémio do Torneio ${tournament.title}`]);
                
                await client.query('UPDATE tournament_participants SET final_position = $1 WHERE tournament_id = $2 AND user_id = $3', 
                    [winner.pos, tournamentId, winner.userId]);
            }

            await client.query('UPDATE tournaments SET status = \'FINISHED\' WHERE id = $1', [tournamentId]);
            await client.query('COMMIT');
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    }
}

module.exports = new TournamentService();