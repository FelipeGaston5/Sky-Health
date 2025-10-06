const mongoose = require('mongoose');

const admSchema = new mongoose.Schema({

    //==== dados pessoais ====
    nome: {
        type: String,
        required: [true, ' nome é obrigatório'],
        trim: true
    },
    cpf: {
        type: String,
        unique: true,
        sparse: true // permite criar depois
    },
    email: {
        type: String,
        required: [true, ' email é obrigatório'],
        unique: true,
        lowercase: true
    },
    telefone: String,
    dataNascimento: {
        type: Date,
        required: [true, ' data de nascimento é obrigatória']
    },
    endereco: {
        rua: String,
        numero: String,
        bairro: String,
        cidade: String,
        estado: String,
        cep: String,
    },
    genero: {
        type: String,
        enum: ['Masculino', 'Feminino', 'Outro'],
    },

    //==== dados de profissional ====

    cargo: {
        type: String,
        required: [true, ' cargo é obrigatório']
    },
    departamento: {
        type: String,
        required: [true, ' departamento é obrigatório']
    },
    dataContratacao: {
        type: Date,
        required: [true, ' data de contratação é obrigatória']
    },

    //==== dados de acesso ====
    username: {
        type: String,
        required: [true, ' username é obrigatório'],
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: [true, ' password é obrigatório']
    },

    //==== metadados do sistema ====
    criadoEm: {
        type: Date,
        default: Date.now
    },
    atualizadoEm: {
        type: Date,
        default: Date.now
    }
});

admSchema.pre('save', function (next) {
    this.atualizadoEm = Date.now();
    next();
});

const Adm = mongoose.model('Adm', admSchema);

module.exports = Adm;