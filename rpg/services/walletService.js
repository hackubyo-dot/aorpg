const db = require('../config/db');
const walletModel = require('../models/walletModel');

class WalletService {
    /**
     * Realiza uma transferência entre dois usuários.
     * @param {number} senderId - ID de quem envia
     * @param {string} receiverContact - E-mail ou Telefone do destinatário
     * @param {number} amount - Valor em Kwanza (AOA)
     */
    async transferMoney(senderId, receiverContact, amount) {
        if (amount <= 0) throw new Error('O valor deve ser maior que zero.');

        const client = await db.getClient();
        try {
            await client.query('BEGIN');

            // 1. Verificar se o destinatário existe
            const receiver = await walletModel.findUserByContact(receiverContact);
            if (!receiver) throw new Error('Destinatário não encontrado no sistema.');
            if (receiver.id === senderId) throw new Error('Não podes transferir para ti mesmo.');

            // 2. Verificar saldo do remetente
            const senderWallet = await client.query('SELECT balance FROM wallets WHERE user_id = $1 FOR UPDATE', [senderId]);
            if (senderWallet.rows[0].balance < amount) {
                throw new Error('Saldo insuficiente para realizar esta transferência.');
            }

            // 3. Deduzir saldo do remetente
            await client.query('UPDATE wallets SET balance = balance - $1 WHERE user_id = $2', [amount, senderId]);

            // 4. Adicionar saldo ao destinatário
            await client.query('UPDATE wallets SET balance = balance + $1 WHERE user_id = $2', [amount, receiver.id]);

            // 5. Registrar logs de transação (Remetente)
            const logSender = `INSERT INTO transactions (user_id, type, amount, related_user_id, description) 
                               VALUES ($1, 'TRANSFER_SENT', $2, $3, $4)`;
            await client.query(logSender, [senderId, amount, receiver.id, `Transferência enviada para ${receiver.full_name}`]);

            // 6. Registrar logs de transação (Destinatário)
            const logReceiver = `INSERT INTO transactions (user_id, type, amount, related_user_id, description) 
                                 VALUES ($1, 'TRANSFER_RECEIVED', $2, $3, $4)`;
            await client.query(logReceiver, [receiver.id, amount, senderId, `Transferência recebida de outro usuário`]);

            await client.query('COMMIT');
            return { success: true, receiverName: receiver.full_name };
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * Simulação de depósito (Em produção seria integrado com API de pagamentos)
     */
    async depositFunds(userId, amount) {
        const query = 'UPDATE wallets SET balance = balance + $1 WHERE user_id = $2';
        await db.query(query, [amount, userId]);
        
        const logQuery = 'INSERT INTO transactions (user_id, type, amount, description) VALUES ($1, $2, $3, $4)';
        await db.query(logQuery, [userId, 'DEPOSIT', amount, 'Depósito via Voucher/Simulação']);
        
        return { success: true };
    }
}

module.exports = new WalletService();