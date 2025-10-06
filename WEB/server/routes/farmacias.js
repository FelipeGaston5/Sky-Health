const express = require('express');
const router = express.Router();
const Farmacia = require('../models/farmaciasModel');

// Criar farmácia
router.post('/', async (req, res) => {
    try {
        const novaFarmacia = new Farmacia(req.body);
        await novaFarmacia.save();
        res.status(201).json({ message: '✅ Farmácia criada com sucesso', farmacia: novaFarmacia });
    } catch (erro) {
        console.error('Erro ao criar farmácia:', erro);
        res.status(500).json({ message: 'Erro ao criar farmácia', erro });
    }
});

// Listar todas as farmácias
router.get('/', async (req, res) => {
    try {
        const farmacias = await Farmacia.find();
        res.json(farmacias);
    } catch (erro) {
        console.error('Erro ao listar farmácias:', erro);
        res.status(500).json({ message: 'Erro ao listar farmácias', erro });
    }
});

// Buscar farmácia por ID
router.get('/:id', async (req, res) => {
    try {
        const farmacia = await Farmacia.findById(req.params.id);
        if (!farmacia) return res.status(404).json({ message: 'Farmácia não encontrada' });
        res.json(farmacia);
    } catch (erro) {
        console.error('Erro ao buscar farmácia:', erro);
        res.status(500).json({ message: 'Erro ao buscar farmácia', erro });
    }
});

// Atualizar farmácia por ID
router.put('/:id', async (req, res) => {
    try {
        const atualizado = await Farmacia.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!atualizado) return res.status(404).json({ message: 'Farmácia não encontrada' });
        res.json({ message: 'Farmácia atualizada', farmacia: atualizado });
    } catch (erro) {
        console.error('Erro ao atualizar farmácia:', erro);
        res.status(500).json({ message: 'Erro ao atualizar farmácia', erro });
    }
});

// Deletar farmácia por ID
router.delete('/:id', async (req, res) => {
    try {
        const deletado = await Farmacia.findByIdAndDelete(req.params.id);
        if (!deletado) return res.status(404).json({ message: 'Farmácia não encontrada' });
        res.json({ message: 'Farmácia removida com sucesso' });
    } catch (erro) {
        console.error('Erro ao deletar farmácia:', erro);
        res.status(500).json({ message: 'Erro ao deletar farmácia', erro });
    }
});

module.exports = router;
