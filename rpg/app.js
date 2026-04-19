const express = require('express');
const path = require('path');
const helmet = require('helmet');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const { pool } = require('./config/db');
const errorMiddleware = require('./middlewares/errorMiddleware');

const app = express();

// 1. Segurança HTTP (Helmet)
app.use(helmet({
    contentSecurityPolicy: false, // Permitir scripts inline para lógica de jogos
    crossOriginEmbedderPolicy: false
}));

// 2. Parsing de dados (JSON e Formulários)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. Arquivos Estáticos (CSS, JS, Imagens)
app.use(express.static(path.join(__dirname, 'public')));

// 4. Configuração do View Engine (EJS)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 5. Gestão de Sessão (Persistência no DB Neon)
app.use(session({
    store: new pgSession({
        pool: pool,
        tableName: 'session',
        createTableIfMissing: true
    }),
    name: 'kwanza_rpg_sid',
    secret: process.env.SESSION_SECRET || 'a0rpg_ultra_secure_secret_2025',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'lax'
    }
}));

// 6. Variáveis Globais para EJS (Acessíveis em todos os .ejs)
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    res.locals.path = req.path;
    res.locals.success_msg = null;
    res.locals.error_msg = null;
    next();
});

// 7. Carregamento de Rotas Centralizadas
const mainRouter = require('./routes/routes'); 
app.use('/', mainRouter);

// 8. Tratamento de Erros (404 e 500)
app.use(errorMiddleware.notFound);
app.use(errorMiddleware.handler);

module.exports = app;