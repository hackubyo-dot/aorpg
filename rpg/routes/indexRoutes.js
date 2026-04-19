/**
 * ============================================================
 * KWANZARPG - INDEX NAVIGATION ROUTES
 * ============================================================
 */
const express = require('express');
const router = express.Router();
const { isAuthenticated, isGuest } = require('../middlewares/authMiddleware');
const userController = require('../controllers/userController');

// Página Inicial (Splash Screen para Visitantes)
router.get('/', isGuest, (req, res) => {
    res.render('pages/splash', { pageTitle: 'Bem-vindo à Arena KwanzaRPG' });
});

// Dashboard Principal (Protegido)
router.get('/home', isAuthenticated, userController.renderHome);

// Perfil do Utilizador (Protegido)
router.get('/profile', isAuthenticated, userController.renderProfile);

// Ranking Global (Protegido)
router.get('/ranking', isAuthenticated, userController.renderRanking);

// Atividade Recente (Protegido)
router.get('/activity', isAuthenticated, (req, res) => {
    res.render('pages/home', { // Reaproveita home ou cria activity.ejs
        user: req.session.user,
        pageTitle: 'Minhas Atividades' 
    });
});

// Suporte Técnico (Protegido ou Público conforme necessidade)
router.get('/support', isAuthenticated, (req, res) => {
    res.render('pages/support', { 
        user: req.session.user,
        pageTitle: 'Centro de Suporte' 
    });
});

module.exports = router;
