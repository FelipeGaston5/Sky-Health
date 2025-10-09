const mongoose = require('mongoose');

// Função para gerar uma senha aleatória de 6 dígitos
function gerarSenha6Digitos() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}


const presSchema = new mongoose.Schema({

    //==== prescição medica ====
    tipo: {
        type: String,
        required: [true, ' tipo é obrigatório'],
        enum: ['Receituário', 'Atestado', 'Outros', 'exames']
    },
    descricao: {
        type: String,
        required: [true, ' descrição é obrigatória'],
    },
    dataEmissao: {
        type: Date,
        required: [true, ' data de emissão é obrigatória'],
        default: Date.now
    },
    dataValidade: {
        type: Date,
        required: [true, ' data de validade é obrigatória'],
        validate: {
            validator: function (value) {
                return value > this.dataEmissao;
            },
            message: ' data de validade deve ser maior que a data de emissão'
        }
    },
    valida: {
        type: Boolean,
        default: false
    },
    //==== dados do paciente ====
    paciente: {
        type: mongoose.Schema.Types.ObjectId,
        // Ref corrigida: modelo definido como 'Pacientes' em userModel.js
        ref: 'Pacientes',
        required: [true, ' paciente é obrigatório']
    },

    //==== dados do médico ====
    medico: {
        type: mongoose.Schema.Types.ObjectId,
        // Ref corrigida: modelo definido como 'Medico' em medicoModel.js
        ref: 'Medico',
        required: [true, ' médico é obrigatório']
    },
    //==== consentimento explícito e assinaturas ====
    consentimentoExplicito: {
        type: Boolean,
        required: [true, ' consentimento explícito é obrigatório'],
        default: false
    },
    assinaturaMedico: {
        type: String,
        required: false,
        trim: true
    },
    assinaturaPacienteOuResponsavel: {
        type: String,
        required: false,
        trim: true
    },
    password: {
        type: String,
        default: gerarSenha6Digitos
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

presSchema.pre('findOneAndUpdate', function (next) {
    this._update.atualizadoEm = Date.now();
    next();
});

presSchema.pre('save', function (next) {
    if (!this.password) {
        this.password = gerarSenha6Digitos();
    }
    next();
});

const Prescricao = mongoose.model('Prescricao', presSchema);

module.exports = Prescricao;