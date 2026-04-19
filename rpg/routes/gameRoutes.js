const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../config/auth');
const gameController = require('../controllers/gameController');
const gameModel = require('../models/gameModel');

// Página de listagem de todos os jogos
router.get('/', isAuthenticated, async (req, res) => {
    try {
        const games = await gameModel.getAllGames();
        res.render('pages/games-list', { 
            games, 
            user: req.session.user,
            pageTitle: 'Jogos Disponíveis'
        });
    } catch (error) {
        res.status(500).send('Erro ao carregar lista de jogos.');
    }
});

// Detalhes de um jogo específico
router.get('/:slug', isAuthenticated, async (req, res) => {
    // Busca detalhes do jogo e stats do jogador para o lobby
    res.render('pages/game-details', { user: req.session.user });
});

// API: Iniciar uma partida
router.post('/api/init', isAuthenticated, gameController.initMatch);

// API: Processar um turno de batalha
router.post('/api/play-turn', isAuthenticated, gameController.playTurn);

module.exports = router;