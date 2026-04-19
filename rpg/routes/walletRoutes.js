const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../config/auth');
const walletController = require('../controllers/walletController');

// Página da Carteira (Renderização via controller futuramente ou direta)
router.get('/wallet', isAuthenticated, async (req, res) => {
    // Esta rota prepara os dados para a página de carteira
    res.render('pages/wallet', { user: req.session.user });
});

// API: Obter dados de saldo e histórico
router.get('/api/wallet/data', isAuthenticated, walletController.getWalletData);

// API: Realizar Transferência
router.post('/api/wallet/transfer', isAuthenticated, walletController.handleTransfer);

// API: Realizar Depósito (Simulação)
router.post('/api/wallet/deposit', isAuthenticated, walletController.handleDeposit);

module.exports = router;