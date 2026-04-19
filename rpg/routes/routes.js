/**
 * ============================================================
 * KWANZARPG - CENTRAL ROUTE DISPATCHER
 * ============================================================
 * Descrição: Une todas as rotas individuais num único router.
 * ============================================================
 */
const express = require('express');
const router = express.Router();

// Importação dos Middlewares de Proteção
const { isAuthenticated } = require('../middlewares/authMiddleware');

// Importação das Rotas Individuais
const authRoutes = require('./authRoutes');
const indexRoutes = require('./indexRoutes');
const gameRoutes = require('./gameRoutes');
const walletRoutes = require('./walletRoutes');
const tournamentRoutes = require('./tournamentRoutes');

/**
 * MAPEAMENTO DE ROTAS
 */

// Rotas Públicas (Login, Registo, Splash)
router.use('/', authRoutes);

// Rotas de Navegação Principal (Dashboard, Perfil, Ranking)
// A proteção isAuthenticated é gerida dentro de indexRoutes ou aqui
router.use('/', indexRoutes);

// Rotas Financeiras (Proteção Global nesta sub-rota)
router.use('/wallet', isAuthenticated, walletRoutes);

// Rotas de Gameplay (Proteção Global nesta sub-rota)
router.use('/games', isAuthenticated, gameRoutes);

// Rotas de Torneios (Proteção Global nesta sub-rota)
router.use('/tournaments', isAuthenticated, tournamentRoutes);

// Fallback para Erros de Rota (404 manual se necessário)
router.get('*', (req, res) => {
    if (req.session.user) {
        res.status(404).render('pages/splash', { error: 'Página não encontrada na Arena.' });
    } else {
        res.redirect('/login');
    }
});

module.exports = router;
