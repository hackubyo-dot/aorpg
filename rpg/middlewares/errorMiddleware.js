/**
 * Middleware Global de Erros e 404
 */

const errorMiddleware = {
    // Manipulador para rotas não encontradas
    notFound: (req, res, next) => {
        const err = new Error(`Não encontrado - ${req.originalUrl}`);
        res.status(404);
        next(err);
    },

    // Manipulador de erro geral (500)
    handler: (err, req, res, next) => {
        const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
        
        console.error(`[SERVER_ERROR] ${err.message}`);
        console.error(err.stack);

        // Se for uma requisição API/AJAX, retorna JSON
        if (req.xhr || req.headers.accept.indexOf('json') > -1) {
            return res.status(statusCode).json({
                success: false,
                message: process.env.NODE_ENV === 'production' 
                    ? 'Ocorreu um erro interno no servidor.' 
                    : err.message
            });
        }

        // Se for navegação, renderiza uma página de erro genérica ou redireciona
        res.status(statusCode).render('pages/splash', { 
            error: 'Ocorreu um problema técnico. Por favor, tente novamente mais tarde.' 
        });
    }
};

module.exports = errorMiddleware;