/**
 * Utilitários de Validação para KwanzaRPG
 * Focado em integridade de dados e formatos Angolanos
 */

const validators = {
    // Valida formato de e-mail padrão
    isValidEmail: (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email).toLowerCase());
    },

    // Valida números de telefone (Padrão Unitel/Movicel/Africell +244)
    isValidPhone: (phone) => {
        // Aceita 9XXXXXXXX ou +2449XXXXXXXX
        const re = /^(?:\+244|00244)?[9][1-9][0-9]{7}$/;
        return re.test(String(phone).replace(/\s/g, ''));
    },

    // Valida força da senha (mínimo 6 caracteres)
    isStrongPassword: (password) => {
        return password && password.length >= 6;
    },

    // Valida se o valor para transação é numérico e positivo
    isValidAmount: (amount) => {
        const val = parseFloat(amount);
        return !isNaN(val) && val > 0;
    },

    // Sanitização básica de strings para evitar XSS simples na entrada
    sanitizeString: (str) => {
        if (!str) return '';
        return str.toString().replace(/[<>]/g, '').trim();
    }
};

module.exports = validators;