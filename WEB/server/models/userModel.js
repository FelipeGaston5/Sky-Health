const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
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
        //==== dados de saúde ====
        tipoSanguineo: {
            type: String,
            enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
            required: [true, ' tipo sanguíneo é obrigatório']
        },
        pesoKg: Number,
        alturaCm: Number,
        alergias: {
            type: [String],
            default: [],
            required: [true, ' alergias é obrigatório']
        },
        doencasCronicas: {
            type: [String],
            default: [],
            required: [true, ' doenças crônicas é obrigatório']
        },
        alergiamedicamentos: {
            type: [String],
            default: [],
            required: [true, ' alergia a medicamentos é obrigatório']
        },
        medicamentosUso: {
            type: [String],
            default: [],
            required: [true, ' medicamentos em uso é obrigatório']
        },
        historicoCirurgico: {
            type: [String],
            default: [],
            required: [true, ' histórico cirúrgico é obrigatório']
        },
        observacoesMedicas: {
            type: String,
            required: [true, ' observações médicas é obrigatório']
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

        //==== metadados sistema ====
        criadoEm: {
            type: Date,
            default: Date.now
        },
        atualizadoEm: {
            type: Date,
            default: Date.now
        }
    }
);

userSchema.pre('save', function (next) {
    this.atualizadoEm = Date.now();
    next();
});

const Paciente = mongoose.model('Pacientes', userSchema);

module.exports = Paciente;