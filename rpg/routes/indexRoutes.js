const express = require('express');
const router = express.Router();
const { isAuthenticated, isGuest } = require('../middlewares/authMiddleware');
const userController = require('../controllers/userController');

/**
 * ROTAS DE NAVEGAÇÃO PRINCIPAL (VIEWS)
 */

// Splash Screen / Landing Page
router.get('/', isGuest, (req, res) => {
    res.render('pages/splash', { pageTitle: 'Bem-vindo ao KwanzaRPG' });
});

// Dashboard Principal (Página Inicial após login)
router.get('/home', isAuthenticated, userController.renderHome);

// Página de Perfil do Utilizador
router.get('/profile', isAuthenticated, userController.renderProfile);

// Página de Ranking Global
router.get('/ranking', isAuthenticated, userController.renderRanking);

// Página de Carteira (Wallet)
router.get('/wallet', isAuthenticated, (req, res) => {
    res.render('pages/wallet', { 
        user: req.session.user,
        pageTitle: 'Minha Carteira - KwanzaRPG'
    });
});

// Página de Todos os Jogos
router.get('/games', isAuthenticated, (req, res) => {
    res.render('pages/games-list', { 
        user: req.session.user,
        pageTitle: 'Arena de Jogos'
    });
});

// Página de Configurações
router.get('/settings', isAuthenticated, (req, res) => {
    res.render('pages/settings', { 
        user: req.session.user,
        pageTitle: 'Configurações de Conta'
    });
});

// Página de Torneios
router.get('/tournaments', isAuthenticated, (req, res) => {
    res.render('pages/ranking', { 
        user: req.session.user,
        pageTitle: 'Torneios KwanzaRPG'
    });
});

module.exports = router;