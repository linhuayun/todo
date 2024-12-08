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
    const { text, detail } = req.body;
    const todo = await todoModel.create({ text, detail });
    res.json(todo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    console.log('Received PUT request with params:', req.params); // 打印路由参数
    console.log('Received PUT request with body:', req.body);     // 打印请求体
    const { id } = req.params;
    const { text, detail, completed } = req.body;
    console.log('Updating todo with:', { id, text, detail, completed }); // 打印准备更新的数据
    const todo = await todoModel.update(id, { text, detail, completed });
    res.json(todo);
  } catch (error) {

    console.error('Error during PUT request:', error); // 打印错误详情
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