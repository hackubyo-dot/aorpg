/**
 * Formatador de Moeda (Kwanza - AOA)
 */

const currencyFormatter = {
    /**
     * Formata um número para o padrão: 1.250,00 Kz
     * @param {number|string} amount - O valor a ser formatado
     */
    formatKwanza: (amount) => {
        const value = typeof amount === 'string' ? parseFloat(amount) : amount;
        
        if (isNaN(value)) return '0,00 Kz';

        return new Intl.NumberFormat('pt-AO', {
            style: 'currency',
            currency: 'AOA',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(value).replace('Kz', ' Kz'); // Garante o espaço antes do símbolo
    },

    /**
     * Formata apenas o número com separadores de milhar e decimal angolano
     */
    formatNumber: (amount) => {
        const value = typeof amount === 'string' ? parseFloat(amount) : amount;
        if (isNaN(value)) return '0,00';

        return value.toLocaleString('pt-AO', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    },

    /**
     * Limpa uma string formatada para obter o número puro (para salvar no DB)
     */
    parseKwanza: (kwanzaStr) => {
        if (!kwanzaStr) return 0;
        return parseFloat(kwanzaStr.replace(/[^\d,.-]/g, '').replace(',', '.'));
    }
};

module.exports = currencyFormatter;