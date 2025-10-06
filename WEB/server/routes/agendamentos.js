const express = require('express');
const router = express.Router();
const Agendamento = require('../models/agendModels');

// Criar agendamento
router.post('/', async (req, res) => {
    try {
        const agendamento = new Agendamento(req.body);
        await agendamento.save();

        const agendamentoPopulado = await Agendamento.findById(agendamento._id)
            .populate('paciente', 'nome cpf dataNascimento')
            .populate('medico', 'nome crm')
            .populate('prescricao', 'tipo descricao password');

        res.status(201).json({ message: '✅ Agendamento criado', agendamento: agendamentoPopulado });
    } catch (erro) {
        console.error('Erro ao criar agendamento:', erro);
        res.status(500).json({ message: 'Erro ao criar agendamento', erro });
    }
});

// Listar todos os agendamentos
router.get('/', async (req, res) => {
    try {
        const agendamentos = await Agendamento.find()
            .populate('paciente', 'nome cpf dataNascimento')
            .populate('medico', 'nome crm')
            .populate('prescricao', 'tipo descricao password');
        res.json(agendamentos);
    } catch (erro) {
        console.error('Erro ao listar agendamentos:', erro);
        res.status(500).json({ message: 'Erro ao listar agendamentos', erro });
    }
});

// Buscar agendamento por ID
router.get('/:id', async (req, res) => {
    try {
        const agendamento = await Agendamento.findById(req.params.id)
            .populate('paciente', 'nome cpf dataNascimento')
            .populate('medico', 'nome crm')
            .populate('prescricao', 'tipo descricao password');

        if (!agendamento) return res.status(404).json({ message: 'Agendamento não encontrado' });
        res.json(agendamento);
    } catch (erro) {
        console.error('Erro ao buscar agendamento:', erro);
        res.status(500).json({ message: 'Erro ao buscar agendamento', erro });
    }
});

// Atualizar agendamento por ID
router.put('/:id', async (req, res) => {
    try {
        const atualizado = await Agendamento.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!atualizado) return res.status(404).json({ message: 'Agendamento não encontrado' });
        res.json({ message: 'Agendamento atualizado', agendamento: atualizado });
    } catch (erro) {
        console.error('Erro ao atualizar agendamento:', erro);
        res.status(500).json({ message: 'Erro ao atualizar agendamento', erro });
    }
});

// Deletar agendamento por ID
router.delete('/:id', async (req, res) => {
    try {
        const deletado = await Agendamento.findByIdAndDelete(req.params.id);
        if (!deletado) return res.status(404).json({ message: 'Agendamento não encontrado' });
        res.json({ message: 'Agendamento removido com sucesso' });
    } catch (erro) {
        console.error('Erro ao deletar agendamento:', erro);
        res.status(500).json({ message: 'Erro ao deletar agendamento', erro });
    }
});

module.exports = router;
