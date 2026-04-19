const bcrypt = require('bcrypt');
const db = require('../config/db');

class AuthService {
    /**
     * Registra um novo usuário e cria automaticamente sua carteira dentro de uma transação.
     */
    async registerUser(fullName, email, phone, password) {
        const client = await db.getClient();
        try {
            await client.query('BEGIN');

            // 1. Hash da senha
            const saltRounds = 12;
            const passwordHash = await bcrypt.hash(password, saltRounds);

            // 2. Inserir usuário
            const userQuery = `
                INSERT INTO users (full_name, email, phone, password_hash)
                VALUES ($1, $2, $3, $4) RETURNING id, full_name, email
            `;
            const userRes = await client.query(userQuery, [fullName, email, phone, passwordHash]);
            const newUser = userRes.rows[0];

            // 3. Criar Carteira inicial para o usuário
            const walletQuery = `INSERT INTO wallets (user_id, balance) VALUES ($1, 0.00)`;
            await client.query(walletQuery, [newUser.id]);

            await client.query('COMMIT');
            return newUser;
        } catch (error) {
            await client.query('ROLLBACK');
            if (error.code === '23505') { // Unique violation
                throw new Error('E-mail ou telefone já cadastrados no sistema.');
            }
            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * Autentica um usuário comparando o hash da senha.
     */
    async authenticateUser(email, password) {
        const query = `
            SELECT u.*, w.balance 
            FROM users u 
            JOIN wallets w ON u.id = w.user_id 
            WHERE u.email = $1 AND u.is_active = TRUE
        `;
        const res = await db.query(query, [email]);
        const user = res.rows[0];

        if (!user) {
            throw new Error('Usuário não encontrado ou conta desativada.');
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            throw new Error('Credenciais inválidas. Verifique sua senha.');
        }

        // Remover hash antes de retornar
        delete user.password_hash;
        return user;
    }
}

module.exports = new AuthService();