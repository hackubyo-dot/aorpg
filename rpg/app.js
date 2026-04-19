/**
 * ============================================================
 * KWANZARPG - EXPRESS APPLICATION CONFIG
 * ============================================================
 */
const express = require('express');
const path = require('path');
const helmet = require('helmet');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const { pool } = require('./config/db');
const errorMiddleware = require('./middlewares/errorMiddleware');

const app = express();

// 1. SEGURANÇA (Configurado para permitir assets externos e inline scripts de jogos)
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
}));

// 2. PARSING (JSON e Formulários)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. STATIC FILES
app.use(express.static(path.join(__dirname, 'public')));

// 4. VIEW ENGINE (EJS)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 5. SESSION MANAGEMENT (Persistente no Neon)
app.use(session({
    store: new pgSession({
        pool: pool,
        tableName: 'session'
    }),
    name: 'kwanza_rpg_sid',
    secret: process.env.SESSION_SECRET || 'kwanza_rpg_ultra_secret_2025',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 7 * 24 * 60 * 60 * 1000, // 1 Semana
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'lax'
    }
}));

// 6. GLOBAL VIEW VARIABLES
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    res.locals.path = req.path;
    res.locals.success_msg = null;
    res.locals.error_msg = null;
    next();
});

// 7. ROUTING (Ajustado para o novo routes/routes.js)
const mainRouter = require('./routes/routes');
app.use('/', mainRouter);

// 8. ERROR HANDLING
app.use(errorMiddleware.notFound);
app.use(errorMiddleware.handler);

module.exports = app;
