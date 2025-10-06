const express = require('express');
const router = express.Router();
const Adm = require('../models/AdmModel');

// Criar administrador
router.post('/', async (req, res) => {
    try {
        const novoAdm = new Adm(req.body);
        await novoAdm.save();
        res.status(201).json({ message: '✅ Administrador criado com sucesso', administrador: novoAdm });
    } catch (erro) {
        console.error('Erro ao criar administrador:', erro);
        res.status(500).json({ message: 'Erro ao criar administrador', erro });
    }
});

// Listar todos os administradores
router.get('/', async (req, res) => {
    try {
        const admins = await Adm.find().select('-password'); // não retorna a senha
        res.json(admins);
    } catch (erro) {
        console.error('Erro ao listar administradores:', erro);
        res.status(500).json({ message: 'Erro ao listar administradores', erro });
    }
});

// Buscar administrador por ID
router.get('/:id', async (req, res) => {
    try {
        const admin = await Adm.findById(req.params.id).select('-password'); // não retorna a senha
        if (!admin) return res.status(404).json({ message: 'Administrador não encontrado' });
        res.json(admin);
    } catch (erro) {
        console.error('Erro ao buscar administrador:', erro);
        res.status(500).json({ message: 'Erro ao buscar administrador', erro });
    }
});

// Atualizar administrador por ID
router.put('/:id', async (req, res) => {
    try {
        const atualizado = await Adm.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!atualizado) return res.status(404).json({ message: 'Administrador não encontrado' });
        res.json({ message: 'Administrador atualizado', administrador: atualizado });
    } catch (erro) {
        console.error('Erro ao atualizar administrador:', erro);
        res.status(500).json({ message: 'Erro ao atualizar administrador', erro });
    }
});

// Deletar administrador por ID
router.delete('/:id', async (req, res) => {
    try {
        const deletado = await Adm.findByIdAndDelete(req.params.id);
        if (!deletado) return res.status(404).json({ message: 'Administrador não encontrado' });
        res.json({ message: 'Administrador removido com sucesso' });
    } catch (erro) {
        console.error('Erro ao deletar administrador:', erro);
        res.status(500).json({ message: 'Erro ao deletar administrador', erro });
    }
});

module.exports = router;
