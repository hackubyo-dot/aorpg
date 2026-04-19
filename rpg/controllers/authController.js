const authService = require('../services/authService');

const authController = {
    // Renderiza página de login
    renderLogin: (req, res) => {
        if (req.session.user) return res.redirect('/home');
        res.render('pages/login', { error: null });
    },

    // Executa o login
    handleLogin: async (req, res) => {
        const { email, password } = req.body;
        try {
            if (!email || !password) {
                throw new Error('Por favor, preencha todos os campos.');
            }

            const user = await authService.authenticateUser(email, password);
            
            // Criar sessão do usuário
            req.session.user = {
                id: user.id,
                name: user.full_name,
                email: user.email,
                balance: user.balance
            };

            return res.status(200).json({ 
                success: true, 
                message: 'Login realizado com sucesso! Redirecionando...',
                redirect: '/home'
            });
        } catch (error) {
            return res.status(401).json({ 
                success: false, 
                message: error.message || 'Erro ao realizar login.' 
            });
        }
    },

    // Executa o cadastro
    handleRegister: async (req, res) => {
        const { full_name, email, phone, password, confirm_password } = req.body;
        
        try {
            if (password !== confirm_password) {
                throw new Error('As senhas não coincidem.');
            }

            if (password.length < 6) {
                throw new Error('A senha deve ter pelo menos 6 caracteres.');
            }

            const newUser = await authService.registerUser(full_name, email, phone, password);

            return res.status(201).json({ 
                success: true, 
                message: 'Conta criada com sucesso! Você já pode fazer login.' 
            });
        } catch (error) {
            return res.status(400).json({ 
                success: false, 
                message: error.message || 'Erro ao criar conta.' 
            });
        }
    },

    // Logout
    handleLogout: (req, res) => {
        req.session.destroy((err) => {
            if (err) console.error('Erro ao destruir sessão:', err);
            res.redirect('/login');
        });
    }
};

module.exports = authController;