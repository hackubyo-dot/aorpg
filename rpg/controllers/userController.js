const userModel = require('../models/userModel');
const validators = require('../utils/validators');

const userController = {
    /**
     * Renderiza o Dashboard principal (Home) com dados consolidados.
     */
    renderHome: async (req, res) => {
        try {
            const userData = await userModel.getUserFullProfile(req.session.user.id);
            res.render('pages/home', { 
                user: userData,
                pageTitle: 'Início - KwanzaRPG'
            });
        } catch (error) {
            console.error('[HOME_ERROR]', error);
            res.status(500).send('Erro ao carregar dashboard.');
        }
    },

    /**
     * Renderiza a página de perfil do usuário.
     */
    renderProfile: async (req, res) => {
        try {
            const userData = await userModel.getUserFullProfile(req.session.user.id);
            res.render('pages/profile', { 
                profile: userData,
                pageTitle: 'Meu Perfil - KwanzaRPG'
            });
        } catch (error) {
            res.status(500).send('Erro ao carregar perfil.');
        }
    },

    /**
     * Processa a atualização dos dados do usuário.
     */
    updateProfile: async (req, res) => {
        const userId = req.session.user.id;
        const { full_name, phone } = req.body;

        try {
            // Validações
            if (!full_name || full_name.length < 3) {
                throw new Error('Nome muito curto.');
            }
            if (!validators.isValidPhone(phone)) {
                throw new Error('Formato de telefone inválido (Angola).');
            }

            // Verifica duplicidade de contato
            const isDuplicate = await userModel.checkDuplicateContact(userId, '', phone);
            if (isDuplicate) throw new Error('Este telefone já está em uso por outra conta.');

            // Update no banco
            const updatedUser = await userModel.updateProfile(userId, { 
                full_name, 
                phone, 
                avatar_url: req.body.avatar_url || 'default-avatar.png' 
            });

            // Atualiza dados na sessão
            req.session.user.name = updatedUser.full_name;

            return res.status(200).json({ 
                success: true, 
                message: 'Perfil atualizado com sucesso!' 
            });
        } catch (error) {
            return res.status(400).json({ 
                success: false, 
                message: error.message || 'Erro ao atualizar perfil.' 
            });
        }
    },

    /**
     * Renderiza o ranking global.
     */
    renderRanking: async (req, res) => {
        try {
            const leaders = await userModel.getGlobalRanking(50);
            res.render('pages/ranking', { 
                leaders,
                pageTitle: 'Ranking Global - KwanzaRPG'
            });
        } catch (error) {
            res.status(500).send('Erro ao carregar ranking.');
        }
    }
};

module.exports = userController;