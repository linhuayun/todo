// routes/todoController.js
const express = require('express');
const router = express.Router();
const todoModel = require('../models/todo');

router.get('/', async (req, res) => {
  try {
    const todos = await todoModel.getAll();
    res.json(todos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { text } = req.body;
    const todo = await todoModel.create(text);
    res.json(todo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { completed } = req.body;
    const todo = await todoModel.update(id, completed);
    res.json(todo);
  } catch (error) {
    console.error("Error creating todo:", error); // 在这里添加日志以捕获错误详情
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const todo = await todoModel.delete(id);
    res.json(todo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;