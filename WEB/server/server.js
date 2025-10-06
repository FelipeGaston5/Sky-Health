// === IMPORTAÇÕES ===
const express = require('express');
const mongoose = require('mongoose');

// === IMPORTAÇÃO DAS ROTAS ===
const userRoutes = require('./routes/users');
const medRoutes = require('./routes/medicos');
const presRoutes = require('./routes/prescricao');
const admRoutes = require('./routes/adm');
const farmRoutes = require('./routes/farmacias');
const agendRoutes = require('./routes/agendamentos');

// === CONFIGURAÇÕES DO EXPRESS ===
const app = express();
app.use(express.json());

// === CONEXÃO COM O MONGODB ATLAS ===
const uri = "mongodb+srv://FelipeGaston:Pca0e11%2A@sky-health.x4q5bub.mongodb.net/SkyHealth";

mongoose.connect(uri)
    .then(() => console.log('✅ Conectado ao MongoDB Atlas via Mongoose!'))
    .catch(err => console.error('❌ Erro na conexão:', err));

// === ROTAS ===
app.use('/pacientes', userRoutes);
app.use('/medicos', medRoutes);
app.use('/prescricao', presRoutes);
app.use('/administradores', admRoutes);
app.use('/farmacias', farmRoutes);
app.use('/agendamentos', agendRoutes);

// === ROTA RAIZ ===
app.get('/', (req, res) => {
    res.send('🚀 API SkyHealth rodando com Mongoose!');
});

// === TRATAMENTO DE ROTAS NÃO ENCONTRADAS ===
app.use((req, res) => {
    res.status(404).json({ message: 'Rota não encontrada' });
});

// === INICIA SERVIDOR ===
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🌐 Servidor em http://localhost:${PORT}`));
