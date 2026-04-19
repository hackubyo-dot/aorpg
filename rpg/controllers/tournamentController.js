const tournamentModel = require('../models/tournamentModel');
const tournamentService = require('../services/tournamentService');

const tournamentController = {
    // Lista torneios para a página de competições
    listTournaments: async (req, res) => {
        try {
            const tournaments = await tournamentModel.getActiveTournaments();
            return res.status(200).json({ success: true, tournaments });
        } catch (error) {
            return res.status(500).json({ success: false, message: 'Erro ao listar torneios.' });
        }
    },

    // Processa a inscrição do usuário
    joinTournament: async (req, res) => {
        const { tournamentId } = req.body;
        const userId = req.session.user.id;

        try {
            if (!tournamentId) throw new Error('ID do torneio é obrigatório.');

            await tournamentService.joinTournament(tournamentId, userId);

            return res.status(200).json({ 
                success: true, 
                message: 'Inscrição confirmada! Prepare-se para a batalha.' 
            });
        } catch (error) {
            return res.status(400).json({ 
                success: false, 
                message: error.message || 'Erro ao entrar no torneio.' 
            });
        }
    },

    // Detalhes do torneio para renderizar na página
    getDetails: async (req, res) => {
        const { id } = req.params;
        try {
            const data = await tournamentModel.getTournamentDetails(id);
            return res.status(200).json({ success: true, data });
        } catch (error) {
            return res.status(404).json({ success: false, message: 'Torneio não encontrado.' });
        }
    }
};

module.exports = tournamentController;