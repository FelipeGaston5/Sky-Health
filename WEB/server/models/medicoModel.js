const mongoose = require('mongoose');

const medSchema = new mongoose.Schema({
    
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
        cep: String
    },
    genero: {
        type: String,
        enum: ['Masculino', 'Feminino', 'Outro'],
    },


    //==== dados profissionais ====
    crm: {
        type: String,
        required: [true, ' CRM é obrigatório'],
        unique: true
    },
    especialidade: {
        type: String,
        required: [true, ' especialidade é obrigatória']
    },
    experienciaAnos: {
        type: Number,
        min: [0, ' experiência não pode ser negativa'],
    },
    hospitaisAfiliados: {
        type: [String],
    },
    consultasRealizadas: {
        type: Number,
    },
    pacientesAtendidos: {
        type: Number,
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

    //==== meta dados ====
    criadoEm: {
        type: Date,
        default: Date.now
    },
    atualizadoEm: {
        type: Date,
        default: Date.now
    }
});

medSchema.pre('save', function (next) {
    this.atualizadoEm = Date.now();
    next();
});

const Medico = mongoose.model('Medico', medSchema);

module.exports = Medico;