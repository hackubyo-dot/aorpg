/**
 * Utilitário de Logging para Produção
 * Formata mensagens de sistema com data, hora e nível de severidade.
 */

const logger = {
    info: (message, context = '') => {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] [INFO] ${context}: ${message}`);
    },

    warn: (message, context = '') => {
        const timestamp = new Date().toISOString();
        console.warn(`[${timestamp}] [WARN] ${context}: ${message}`);
    },

    error: (message, error = null, context = '') => {
        const timestamp = new Date().toISOString();
        console.error(`[${timestamp}] [ERROR] ${context}: ${message}`);
        if (error && error.stack) {
            console.error(error.stack);
        }
    },

    // Log especial para movimentações de dinheiro (Auditoria)
    transaction: (userId, type, amount, status) => {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] [TRANSACTION] User:${userId} | ${type} | Amount:${amount} | Status:${status}`);
    }
};

module.exports = logger;