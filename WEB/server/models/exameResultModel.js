const mongoose = require('mongoose');

const anexoSchema = new mongoose.Schema({
    nomeArquivo: String,
    mimeType: String,
    base64: String, // Armazenamento simples; ideal futuro: storage externo
}, { _id: false });

const exameResultSchema = new mongoose.Schema({
    paciente: { type: mongoose.Schema.Types.ObjectId, ref: 'Pacientes', required: true },
    medico: { type: mongoose.Schema.Types.ObjectId, ref: 'Medico', required: true },
    tipoExame: { type: String, required: [true, ' tipo do exame é obrigatório'] }, // ex: sangue, imagem, soro
    nomeExame: { type: String }, // ex: Hemograma Completo, Raio-X Tórax
    laudo: { type: String, required: false }, // laudo pode ser preenchido depois
    status: { type: String, enum: ['pendente', 'concluido'], default: 'pendente' },
    dataLaudo: { type: Date },
    justificativa: { type: String },
    descricaoDetalhada: { type: String },
    discussao: { type: String },
    conclusao: { type: String },
    analistaResponsavel: { type: String },
    diretorTecnico: { type: String },
    localNome: { type: String },
    localEndereco: { type: String },
    dataColeta: { type: Date },
    dataResultado: { type: Date, default: Date.now },
    valoresReferencia: { type: String }, // texto livre; futuro: estrutura por parâmetro
    anexos: [anexoSchema],
    criadoEm: { type: Date, default: Date.now },
    atualizadoEm: { type: Date, default: Date.now }
});

exameResultSchema.pre('findOneAndUpdate', function (next) { this._update.atualizadoEm = Date.now(); next(); });

const ExameResultado = mongoose.model('ExameResultado', exameResultSchema);
module.exports = ExameResultado;