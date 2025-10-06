const mongoose = require('mongoose');

const agendamentoSchema = new mongoose.Schema({
    paciente: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Paciente é obrigatório']
    },
    medico: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Med',
        required: [true, 'Médico é obrigatório']
    },
    prescricao: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Prescricao'
    },
    dataAgendamento: {
        type: Date,
        required: [true, 'Data do agendamento é obrigatória']
    },
    tipo: {
        type: String,
        enum: ['Consulta', 'Exame'],
        required: [true, 'Tipo de agendamento é obrigatório']
    },
    status: {
        type: String,
        enum: ['Agendado', 'Realizado', 'Cancelado'],
        default: 'Agendado'
    },
    observacoes: String,
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
agendamentoSchema.pre('save', function (next) {
    this.atualizadoEm = Date.now();
    next();
});

const Agendamento = mongoose.model('Agendamento', agendamentoSchema);

module.exports = Agendamento;
