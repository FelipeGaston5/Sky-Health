const express = require('express');
const routes = express.Router();
const Medico = require('../models/medicoModel');

//==== Rota para criar um novo médico ====

routes.post('/medicos', async (req, res) => {
    try {
        const novoMedico = new Medico(req.body);
        await novoMedico.save();
        res.status(201).json({ message: "Médico criado com sucesso!", medico: novoMedico });
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ message: 'Erro ao criar médico', erro });
    }
});

//==== Rota para obter todos os médicos ====

routes.get('/medicos', async (req, res) => {
    try {
        const medicos = await Medico.find();
        res.json(medicos);
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ message: 'Erro ao obter médicos', erro });
    }
});

//==== Buscar médico por ID ====
routes.get('/medicos/:id', async (req, res) => {
    try {
        const medico = await Medico.findById(req.params.id);
        if (!medico) {
            return res.status(404).json({ message: 'Médico não encontrado' });
        }
        res.json(medico);
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ message: 'Erro ao buscar médico', erro });
    }
});

//==== Atualizar médico ====
routes.put('/medicos/:id', async (req, res) => {
    try {
        const atualizado = await Medico.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!atualizado) {
            return res.status(404).json({ message: 'Médico não encontrado' });
        }
        res.json(atualizado);
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ message: 'Erro ao atualizar médico', erro });
    }
});

//==== Deletar médico ====
routes.delete('/medicos/:id', async (req, res) => {
    try {
        const deletado = await Medico.findByIdAndDelete(req.params.id);
        if (!deletado) {
            return res.status(404).json({ message: 'Médico não encontrado' });
        }
        res.json({ message: 'Médico deletado com sucesso' });
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ message: 'Erro ao deletar médico', erro });
    }
});

module.exports = routes;