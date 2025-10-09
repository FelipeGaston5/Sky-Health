// === IMPORTAÇÕES ===
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// === IMPORTAÇÃO DAS ROTAS ===
const userRoutes = require('./routes/users');
const medRoutes = require('./routes/medicos');
const presRoutes = require('./routes/prescricao');
const admRoutes = require('./routes/adm');
const farmRoutes = require('./routes/farmacias');
const agendRoutes = require('./routes/agendamentos');
const exameRoutes = require('./routes/exames');

// === CONFIGURAÇÕES DO EXPRESS ===
const app = express();
app.use(express.json());
app.use(cors());

// === CONEXÃO COM O MONGODB ATLAS ===
// Permite sobrescrever a URI via variável de ambiente para segurança/portabilidade
const uri = process.env.MONGODB_URI || "mongodb+srv://FelipeGaston:Pca0e11%2A@sky-health.x4q5bub.mongodb.net/SkyHealth";

// Opções para melhorar resiliência e facilitar troubleshooting
const connOptions = {
    dbName: 'SkyHealth',
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
};

// Forçar IPv4/IPv6 via env (MONGODB_FAMILY=4 ou 6); padrão 4 para evitar problemas comuns com IPv6
const familyEnv = process.env.MONGODB_FAMILY ? parseInt(process.env.MONGODB_FAMILY, 10) : 4;
if (familyEnv === 4 || familyEnv === 6) {
    connOptions.family = familyEnv;
}

// (Sem depuração TLS: certificados inválidos não são permitidos)

mongoose.connect(uri, connOptions)
    .then(() => console.log('✅ Conectado ao MongoDB Atlas via Mongoose!'))
    .catch(err => {
        console.error('❌ Erro na conexão com MongoDB:', err?.message || err);
        if (err?.reason) {
            console.error('ℹ️ Detalhes da razão:', err.reason);
        }
    });

// Logs do estado da conexão
mongoose.connection.on('connected', () => console.log('🔌 Mongoose conectado'));
mongoose.connection.on('error', (err) => console.error('🛑 Mongoose erro:', err?.message || err));
mongoose.connection.on('disconnected', () => console.warn('⚠️  Mongoose desconectado'));

// Middleware para garantir conexão com DB nas rotas que dependem de Mongoose
function requireDbConnected(req, res, next) {
    const state = mongoose.connection.readyState; // 0=disconnected, 1=connected, 2=connecting, 3=disconnecting
    if (state !== 1) {
        return res.status(503).json({
            message: 'Banco de dados indisponível. Tente novamente em instantes.',
            mongooseState: state,
        });
    }
    next();
}

// === ROTAS ===
app.use('/pacientes', requireDbConnected, userRoutes);
app.use('/medicos', requireDbConnected, medRoutes);
app.use('/prescricao', requireDbConnected, presRoutes);
app.use('/administradores', requireDbConnected, admRoutes);
app.use('/farmacias', requireDbConnected, farmRoutes);
app.use('/agendamentos', requireDbConnected, agendRoutes);
app.use('/exames', requireDbConnected, exameRoutes);

// === ROTA RAIZ ===
app.get('/', (req, res) => {
    res.send('🚀 API SkyHealth rodando com Mongoose!');
});

// Healthcheck simples do DB
app.get('/health', (req, res) => {
    const state = mongoose.connection.readyState; // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
    res.json({ status: state === 1 ? 'ok' : 'not_ok', mongooseState: state });
});

// === TRATAMENTO DE ROTAS NÃO ENCONTRADAS ===
app.use((req, res) => {
    res.status(404).json({ message: 'Rota não encontrada' });
});

// === INICIA SERVIDOR ===
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🌐 Servidor em http://localhost:${PORT}`));
