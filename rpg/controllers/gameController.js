const gameModel = require('../models/gameModel');
const gameService = require('../services/gameService');

const gameController = {
    // Inicia uma nova sessão de jogo
    initMatch: async (req, res) => {
        try {
            const userId = req.session.user.id;
            const { gameId } = req.body;

            const playerStats = await gameModel.getPlayerStats(userId);
            
            // Define estado inicial da partida na sessão
            req.session.currentMatch = {
                gameId: gameId,
                player: {
                    id: userId,
                    name: req.session.user.name,
                    hp: playerStats.hp_max,
                    maxHp: playerStats.hp_max,
                    energy: playerStats.energy_max,
                    attack: playerStats.attack,
                    defense: playerStats.defense,
                    isDefending: false
                },
                cpu: {
                    name: 'Kwanza Boss',
                    hp: 80 + (playerStats.level * 10),
                    maxHp: 80 + (playerStats.level * 10),
                    energy: 50,
                    attack: 10 + (playerStats.level * 2),
                    defense: 5 + playerStats.level,
                    isDefending: false
                },
                turn: 1,
                log: []
            };

            return res.status(200).json({ 
                success: true, 
                gameState: req.session.currentMatch 
            });
        } catch (error) {
            return res.status(500).json({ success: false, message: 'Erro ao iniciar partida.' });
        }
    },

    // Processa a jogada do usuário e a resposta da CPU
    playTurn: async (req, res) => {
        const { action } = req.body;
        const match = req.session.currentMatch;

        if (!match) return res.status(400).json({ success: false, message: 'Nenhuma partida ativa.' });

        try {
            // 1. Turno do Jogador
            const playerTurn = gameService.processTurn(match.player, match.cpu, action);
            match.log.push(playerTurn.message);

            if (playerTurn.targetDead) {
                await gameModel.saveMatchResult({
                    playerId: match.player.id,
                    gameId: match.gameId,
                    result: 'WIN',
                    reward: 50.00, // Exemplo de prêmio fixo para jogo solo
                    xpGained: 100
                });
                const finalState = { ...match, status: 'FINISHED', winner: 'PLAYER' };
                req.session.currentMatch = null;
                return res.status(200).json({ success: true, gameState: finalState });
            }

            // 2. Turno da CPU
            const cpuAction = gameService.generateCPUMove(match.cpu);
            const cpuTurn = gameService.processTurn(match.cpu, match.player, cpuAction);
            match.log.push(cpuTurn.message);

            if (cpuTurn.targetDead) {
                await gameModel.saveMatchResult({
                    playerId: match.player.id,
                    gameId: match.gameId,
                    result: 'LOSS',
                    reward: 0,
                    xpGained: 10
                });
                const finalState = { ...match, status: 'FINISHED', winner: 'CPU' };
                req.session.currentMatch = null;
                return res.status(200).json({ success: true, gameState: finalState });
            }

            match.turn++;
            return res.status(200).json({ success: true, gameState: match });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ success: false, message: 'Erro ao processar turno.' });
        }
    }
};

module.exports = gameController;