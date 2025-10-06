const mongoose = require('mongoose');

const farmaciaSchema = new mongoose.Schema({
    nome: {
        type: String,
        required: [true, 'Nome da farmácia é obrigatório'],
        trim: true
    },
    cnpj: {
        type: String,
        required: [true, 'CNPJ é obrigatório'],
        unique: true
    },
    endereco: {
        rua: { type: String, required: true },
        numero: { type: String, required: true },
        bairro: String,
        cidade: { type: String, required: true },
        estado: { type: String, required: true },
        cep: String
    },
    telefone: String,
    email: String,
    criadoEm: {
        type: Date,
        default: Date.now
    },
    atualizadoEm: {
        type: Date,
        default: Date.now
    }
});

// Atualiza automaticamente a data de modificação
farmaciaSchema.pre('save', function (next) {
    this.atualizadoEm = Date.now();
    next();
});

const Farmacia = mongoose.model('Farmacia', farmaciaSchema);

module.exports = Farmacia;
