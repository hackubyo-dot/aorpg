const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../config/auth');
const tournamentController = require('../controllers/tournamentController');

// Página principal de torneios
router.get('/', isAuthenticated, async (req, res) => {
    res.render('pages/ranking', { // Reaproveita ou usa view específica
        user: req.session.user,
        pageTitle: 'Torneios KwanzaRPG'
    });
});

// API: Listar torneios ativos
router.get('/api/list', isAuthenticated, tournamentController.listTournaments);

// API: Obter detalhes e participantes
router.get('/api/:id', isAuthenticated, tournamentController.getDetails);

// API: Inscrever-se num torneio
router.post('/api/join', isAuthenticated, tournamentController.joinTournament);

module.exports = router;