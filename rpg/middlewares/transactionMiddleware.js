const db = require('../config/db');

/**
 * Middleware de Integridade de Transação
 * Focado em prevenir ataques de concorrência em operações financeiras.
 */
const transactionMiddleware = {
    /**
     * Bloqueia a carteira do utilizador para atualização (SELECT FOR UPDATE)
     * Garante que nenhuma outra transação mexa no saldo enquanto esta está a correr.
     */
    lockWallet: async (req, res, next) => {
        const userId = req.session.user.id;
        const client = await db.getClient();

        try {
            // Inicia uma transação no DB para este request
            await client.query('BEGIN');
            
            // Bloqueia a linha da carteira para este utilizador específico
            const lockQuery = 'SELECT balance FROM wallets WHERE user_id = $1 FOR UPDATE';
            const result = await client.query(lockQuery, [userId]);

            if (result.rows.length === 0) {
                await client.query('ROLLBACK');
                client.release();
                return res.status(404).json({ success: false, message: 'Carteira não encontrada.' });
            }

            // Atribui o cliente da transação ao request para ser usado no Controller
            req.dbClient = client;
            next();
        } catch (error) {
            if (client) {
                await client.query('ROLLBACK');
                client.release();
            }
            res.status(500).json({ success: false, message: 'Erro ao processar transação financeira.' });
        }
    },

    /**
     * Middleware simples para verificar se o utilizador tem saldo mínimo antes de tentar a operação
     */
    hasMinBalance: (minAmount) => {
        return (req, res, next) => {
            const currentBalance = parseFloat(req.session.user.balance);
            if (currentBalance < minAmount) {
                return res.status(400).json({ 
                    success: false, 
                    message: `Saldo insuficiente. O valor mínimo para esta operação é ${minAmount} Kz.` 
                });
            }
            next();
        };
    }
};

module.exports = transactionMiddleware;