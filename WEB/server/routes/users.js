const express = require('express');
const routes = express.Router();
const User = require('../models/userModel');

// Rota para criar um novo usuário

routes.post('/', async (req, res) => {
    try {
        const novoUsuario = new User(req.body);
        await novoUsuario.save();
        res.status(201).json({ message: "Usuário criado com sucesso!", usuario: novoUsuario });
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ message: 'Erro ao criar usuário', erro });
    }
});

// Rota para obter todos os usuários

routes.get('/', async (req, res) => {
    try {
        const usuarios = await User.find();
        res.json(usuarios);
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ message: 'Erro ao obter usuários', erro });
    }
});

// Buscar por ID
routes.get('/:id', async (req, res) => {
    try {
        const usuario = await User.findById(req.params.id);
        if (!usuario) return res.status(404).json({ message: 'Usuário não encontrado' });
        res.json(usuario);
    } catch (erro) {
        res.status(500).json({ message: 'Erro ao buscar usuário', erro });
    }
});

// Atualizar
routes.put('/:id', async (req, res) => {
    try {
        const atualizado = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!atualizado) return res.status(404).json({ message: 'Usuário não encontrado' });
        res.json({ message: 'Usuário atualizado', usuario: atualizado });
    } catch (erro) {
        res.status(500).json({ message: 'Erro ao atualizar usuário', erro });
    }
});

// Deletar
routes.delete('/:id', async (req, res) => {
    try {
        const deletado = await User.findByIdAndDelete(req.params.id);
        if (!deletado) return res.status(404).json({ message: 'Usuário não encontrado' });
        res.json({ message: 'Usuário removido com sucesso' });
    } catch (erro) {
        res.status(500).json({ message: 'Erro ao deletar usuário', erro });
    }
});

module.exports = routes;