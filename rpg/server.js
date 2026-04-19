require('dotenv').config();
const app = require('./app');
const db = require('./config/db');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 3000;

/**
 * Inicialização do Servidor KwanzaRPG
 */
async function bootstrap() {
    try {
        logger.info('A iniciar KwanzaRPG Platform...', 'SYSTEM');

        // Testar conexão com o banco Neon
        const dbTest = await db.query('SELECT NOW()');
        logger.info(`Conexão com PostgreSQL Neon estabelecida. DB Time: ${dbTest.rows[0].now}`, 'DATABASE');

        // Ligar o servidor Express
        const server = app.listen(PORT, () => {
            logger.info(`Plataforma online em http://localhost:${PORT}`, 'SERVER');
            logger.info(`Modo: ${process.env.NODE_ENV || 'development'}`, 'SERVER');
        });

        // Graceful Shutdown (Encerramento limpo)
        process.on('SIGTERM', () => {
            logger.warn('SIGTERM recebido. A encerrar servidor...', 'SYSTEM');
            server.close(() => {
                db.pool.end();
                logger.info('Servidor e pool de banco de dados encerrados.', 'SYSTEM');
                process.exit(0);
            });
        });

    } catch (error) {
        logger.error('Falha crítica no arranque do sistema:', error, 'CRITICAL');
        process.exit(1);
    }
}

// Executar arranque
bootstrap();