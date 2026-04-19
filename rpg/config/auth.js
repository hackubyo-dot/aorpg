/**
 * Configurações de Autenticação e Segurança
 */
module.exports = {
    // Configurações de Hash (Bcrypt)
    saltRounds: parseInt(process.env.BCRYPT_SALT) || 12,

    // Configurações de Sessão
    sessionConfig: {
        name: 'kwanza_rpg_sid',
        secret: process.env.SESSION_SECRET || 'fallback_secret_kwanza_2025',
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: process.env.NODE_ENV === 'production',
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24 * 7, // 7 dias
            sameSite: 'lax'
        }
    },

    // Middleware para verificar se o usuário está autenticado
    isAuthenticated: (req, res, next) => {
        if (req.session && req.session.user) {
            return next();
        }
        
        // Se for uma requisição AJAX/API, retorna JSON
        if (req.xhr || req.headers.accept.indexOf('json') > -1) {
            return res.status(401).json({ 
                success: false, 
                message: 'Sessão expirada ou não autenticada. Por favor, faça login.' 
            });
        }
        
        // Se for navegação de página, redireciona para login
        res.redirect('/login');
    },

    // Middleware para restringir acesso apenas a administradores
    isAdmin: (req, res, next) => {
        if (req.session.user && req.session.user.role === 'ADMIN') {
            return next();
        }
        res.status(403).send('Acesso negado: Requer privilégios de administrador.');
    }
};