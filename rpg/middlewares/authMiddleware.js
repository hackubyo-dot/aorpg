/**
 * Middleware de Autenticação
 * Controla o acesso a rotas privadas e públicas.
 */
const authMiddleware = {
    // Protege rotas que exigem login (ex: /home, /wallet)
    isAuthenticated: (req, res, next) => {
        if (req.session && req.session.user) {
            return next();
        }

        // Se for uma chamada de API (AJAX), retorna JSON em vez de redirecionar
        if (req.xhr || req.headers.accept.indexOf('json') > -1) {
            return res.status(401).json({
                success: false,
                message: 'Sessão expirada. Por favor, faça login novamente.'
            });
        }

        // Redireciona para a página de login
        res.redirect('/login');
    },

    // Impede que utilizadores logados acedam a páginas de login/registo
    isGuest: (req, res, next) => {
        if (req.session && req.session.user) {
            return res.redirect('/home');
        }
        next();
    },

    // Restringe acesso apenas a utilizadores com permissões administrativas
    isAdmin: (req, res, next) => {
        if (req.session.user && req.session.user.role === 'ADMIN') {
            return next();
        }
        res.status(403).json({
            success: false,
            message: 'Acesso negado: Requer privilégios de administrador.'
        });
    }
};

module.exports = authMiddleware;