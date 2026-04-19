const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Rota de Login
router.get('/login', authController.renderLogin);
router.post('/login', authController.handleLogin);

// Rota de Cadastro
router.get('/register', (req, res) => res.render('pages/register', { error: null }));
router.post('/register', authController.handleRegister);

// Rota de Recuperação de Senha (Placeholder para a View)
router.get('/forgot-password', (req, res) => res.render('pages/forgot', { error: null }));

// Rota de Logout
router.get('/logout', authController.handleLogout);

module.exports = router;