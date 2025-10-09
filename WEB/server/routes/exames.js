const express = require('express');
const routes = express.Router();
const ExameResultado = require('../models/exameResultModel');
const User = require('../models/userModel');
const Med = require('../models/medicoModel');

// Criar registro de exame (sem laudo obrigatório)
routes.post('/', async (req, res) => {
    try {
        const { pacienteCpf, medicoCrm, tipoExame, nomeExame, laudo, dataColeta, valoresReferencia, anexos } = req.body;
        if (!pacienteCpf || !medicoCrm || !tipoExame) {
            return res.status(400).json({ message: 'Campos obrigatórios ausentes (cpf, crm, tipoExame).' });
        }
        const paciente = await User.findOne({ cpf: pacienteCpf });
        if (!paciente) return res.status(404).json({ message: 'Paciente não encontrado pelo CPF' });
        const medico = await Med.findOne({ crm: medicoCrm });
        if (!medico) return res.status(404).json({ message: 'Médico não encontrado pelo CRM' });
        const exame = new ExameResultado({
            paciente: paciente._id,
            medico: medico._id,
            tipoExame,
            nomeExame,
            laudo: laudo || null,
            status: laudo ? 'concluido' : 'pendente',
            dataColeta: dataColeta ? new Date(dataColeta) : undefined,
            dataResultado: Date.now(),
            dataLaudo: laudo ? Date.now() : undefined,
            valoresReferencia,
            anexos: Array.isArray(anexos) ? anexos.slice(0, 5) : []
        });
        // Concluir laudo (preencher ou atualizar laudo pendente)
        routes.patch('/:id/laudo', async (req, res) => {
            try {
                const { id } = req.params;
                const { laudo, justificativa, descricaoDetalhada, discussao, conclusao, analistaResponsavel, diretorTecnico, valoresReferencia, anexos } = req.body;
                if (!laudo && !conclusao && !descricaoDetalhada) return res.status(400).json({ message: 'Necessário ao menos laudo, descrição detalhada ou conclusão.' });
                const update = {
                    status: 'concluido',
                    dataLaudo: Date.now(),
                    atualizadoEm: Date.now()
                };
                if (laudo) update.laudo = laudo;
                if (justificativa) update.justificativa = justificativa;
                if (descricaoDetalhada) update.descricaoDetalhada = descricaoDetalhada;
                if (discussao) update.discussao = discussao;
                if (conclusao) update.conclusao = conclusao;
                if (analistaResponsavel) update.analistaResponsavel = analistaResponsavel;
                if (diretorTecnico) update.diretorTecnico = diretorTecnico;
                if (valoresReferencia) update.valoresReferencia = valoresReferencia;
                if (Array.isArray(anexos)) update.anexos = anexos.slice(0, 5);
                const exame = await ExameResultado.findByIdAndUpdate(id, update, { new: true })
                    .populate('paciente', 'nome cpf')
                    .populate('medico', 'nome crm');
                if (!exame) return res.status(404).json({ message: 'Exame não encontrado.' });
                res.json({ message: 'Laudo concluído', exame });
            } catch (e) {
                console.error('Erro concluir laudo:', e);
                res.status(500).json({ message: 'Erro ao concluir laudo', erro: e.message });
            }
        });
        await exame.save();
        const populado = await ExameResultado.findById(exame._id)
            .populate('paciente', 'nome cpf')
            .populate('medico', 'nome crm');
        res.status(201).json({ message: 'Resultado de exame criado', exame: populado });
    } catch (e) {
        console.error('Erro criar exame:', e);
        res.status(500).json({ message: 'Erro ao criar exame', erro: e.message });
    }
});

// Listar todos (admin / debug) - poderia ter paginação
routes.get('/', async (req, res) => {
    try {
        const exames = await ExameResultado.find()
            .populate('paciente', 'nome cpf')
            .populate('medico', 'nome crm');
        res.json({ exames });
    } catch (e) { res.status(500).json({ message: 'Erro ao listar', erro: e.message }); }
});

// Por paciente (id)
routes.get('/paciente/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const exames = await ExameResultado.find({ paciente: id })
            .populate('paciente', 'nome cpf')
            .populate('medico', 'nome crm');
        res.json({ exames });
    } catch (e) { res.status(500).json({ message: 'Erro ao listar por paciente', erro: e.message }); }
});

// Por médico (id)
routes.get('/medico/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const exames = await ExameResultado.find({ medico: id })
            .populate('paciente', 'nome cpf')
            .populate('medico', 'nome crm');
        res.json({ exames });
    } catch (e) { res.status(500).json({ message: 'Erro ao listar por médico', erro: e.message }); }
});

module.exports = routes;