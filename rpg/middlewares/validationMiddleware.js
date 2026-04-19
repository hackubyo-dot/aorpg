const validators = require('../utils/validators');

/**
 * Middleware de Validação de Input
 * Garante que as requisições possuam dados válidos antes de chegar ao Controller.
 */
const validationMiddleware = {
    // Validação para o Registo de Utilizador
    validateRegister: (req, res, next) => {
        const { full_name, email, phone, password } = req.body;

        if (!full_name || full_name.length < 3) {
            return res.status(400).json({ success: false, message: 'O nome completo deve ter pelo menos 3 caracteres.' });
        }
        if (!validators.isValidEmail(email)) {
            return res.status(400).json({ success: false, message: 'O e-mail fornecido não é válido.' });
        }
        if (!validators.isValidPhone(phone)) {
            return res.status(400).json({ success: false, message: 'O número de telefone deve ser um formato válido de Angola.' });
        }
        if (!validators.isStrongPassword(password)) {
            return res.status(400).json({ success: false, message: 'A senha deve ter no mínimo 6 caracteres.' });
        }
        next();
    },

    // Validação para Transferências Financeiras
    validateTransfer: (req, res, next) => {
        const { contact, amount } = req.body;

        if (!contact) {
            return res.status(400).json({ success: false, message: 'O contacto do destinatário é obrigatório.' });
        }
        if (!validators.isValidAmount(amount)) {
            return res.status(400).json({ success: false, message: 'O valor da transferência deve ser um número positivo.' });
        }
        
        const numericAmount = parseFloat(amount);
        if (numericAmount < 100) {
            return res.status(400).json({ success: false, message: 'O valor mínimo para transferência é de 100 Kz.' });
        }
        next();
    },

    // Validação para Jogos (Ações de Combate)
    validateGameAction: (req, res, next) => {
        const { action } = req.body;
        const validActions = ['ATTACK', 'SKILL', 'DEFEND'];

        if (!action || !validActions.includes(action)) {
            return res.status(400).json({ success: false, message: 'Acção de combate inválida.' });
        }
        next();
    }
};

module.exports = validationMiddleware;