const express = require('express');
const routes = express.Router();
const Prescricao = require('../models/presModel');
const User = require('../models/userModel');
const Med = require('../models/medicoModel');

// Criar prescrição usando CPF do paciente e CRM do médico
routes.post('/', async (req, res) => {
    try {
        const { pacienteCpf, medicoCrm, tipo, descricao, dataValidade } = req.body;

        // Buscar paciente pelo CPF
        const paciente = await User.findOne({ cpf: pacienteCpf });
        if (!paciente) return res.status(404).json({ message: 'Paciente não encontrado pelo CPF' });

        // Buscar médico pelo CRM
        const medico = await Med.findOne({ crm: medicoCrm });
        if (!medico) return res.status(404).json({ message: 'Médico não encontrado pelo CRM' });

        // Criar prescrição
        const pres = new Prescricao({
            paciente: paciente._id,
            medico: medico._id,
            tipo,
            descricao,
            dataValidade
        });

        await pres.save();

        // Retornar prescrição com populate reduzido
        const presPopulada = await Prescricao.findById(pres._id)
            .populate('paciente', 'nome cpf dataNascimento')
            .populate('medico', 'nome crm');

        res.status(201).json({ message: '✅ Prescrição criada', prescricao: presPopulada });

    } catch (erro) {
        console.error('Erro ao criar prescrição:', erro);
        res.status(500).json({ message: 'Erro ao criar prescrição', erro });
    }
});

// Listar todas as prescrições com dados populados
routes.get('/', async (req, res) => {
    try {
        const prescricoes = await Prescricao.find()
            .populate('paciente', 'nome cpf dataNascimento')
            .populate('medico', 'nome crm');

        res.status(200).json({ prescricoes });
    } catch (erro) {
        console.error('Erro ao buscar prescrições:', erro);
        res.status(500).json({ message: 'Erro ao buscar prescrições', erro });
    }
});

//buscar prescrição por id de paciente
routes.get('/paciente/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const prescricoes = await Prescricao.find({ paciente: id })
            .populate('paciente', 'nome cpf dataNascimento')
            .populate('medico', 'nome crm');

        res.status(200).json({ prescricoes });
    } catch (erro) {
        console.error('Erro ao buscar prescrições por paciente:', erro);
        res.status(500).json({ message: 'Erro ao buscar prescrições por paciente', erro });
    }
});

//buscar prescrição por id de médico
routes.get('/medico/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const prescricoes = await Prescricao.find({ medico: id })
            .populate('paciente', 'nome cpf dataNascimento')
            .populate('medico', 'nome crm');

        res.status(200).json({ prescricoes });
    } catch (erro) {
        console.error('Erro ao buscar prescrições por médico:', erro);
        res.status(500).json({ message: 'Erro ao buscar prescrições por médico', erro });
    }
});

module.exports = routes;
