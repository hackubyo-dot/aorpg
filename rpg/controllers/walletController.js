const walletService = require('../services/walletService');
const walletModel = require('../models/walletModel');

const walletController = {
    // Retorna os dados da carteira do usuário logado (Saldo e Histórico)
    getWalletData: async (req, res) => {
        try {
            const userId = req.session.user.id;
            const wallet = await walletModel.getBalance(userId);
            const history = await walletModel.getHistory(userId);

            return res.status(200).json({
                success: true,
                balance: wallet.balance,
                currency: wallet.currency,
                history: history
            });
        } catch (error) {
            return res.status(500).json({ success: false, message: 'Erro ao carregar carteira.' });
        }
    },

    // Processa o pedido de transferência
    handleTransfer: async (req, res) => {
        const { contact, amount } = req.body;
        const senderId = req.session.user.id;

        try {
            if (!contact || !amount) {
                return res.status(400).json({ success: false, message: 'Preencha todos os campos.' });
            }

            const result = await walletService.transferMoney(senderId, contact, parseFloat(amount));
            
            // Atualizar saldo na sessão para refletir na UI sem refresh
            req.session.user.balance = (parseFloat(req.session.user.balance) - parseFloat(amount)).toFixed(2);

            return res.status(200).json({
                success: true,
                message: `Transferência de ${amount} AOA para ${result.receiverName} concluída!`
            });
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: error.message || 'Erro ao processar transferência.'
            });
        }
    },

    // Processa simulação de depósito
    handleDeposit: async (req, res) => {
        const { amount } = req.body;
        const userId = req.session.user.id;

        try {
            await walletService.depositFunds(userId, parseFloat(amount));
            return res.status(200).json({ success: true, message: 'Depósito realizado com sucesso!' });
        } catch (error) {
            return res.status(400).json({ success: false, message: 'Erro ao depositar.' });
        }
    }
};

module.exports = walletController;