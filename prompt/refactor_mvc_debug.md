# 代码工程信息
## 工程源代码结构
```
.
├── index.js
├── models
│   └── todo.js
├── public
│   ├── index.html
│   └── js
│       └── todo.js
└── routes
    └── todoController.js

```

## 各源代码内容

index.js:
```js
// index.js
const express = require('express');
const app = express();
const port = 3000;

app.use(express.static('public'));
app.use(express.json());

// Load the controllers/routes
const todoRoutes = require('./routes/todoController');
app.use('/api/todos', todoRoutes);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
```
models/todo.js:
```js
// models/todo.js
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(':memory:');

db.serialize(() => {
    db.run("CREATE TABLE todos (id INTEGER PRIMARY KEY AUTOINCREMENT, text TEXT, completed BOOLEAN)");
});

module.exports = {
    getAll: () => {
        return new Promise((resolve, reject) => {
            db.all("SELECT * FROM todos", (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    },
    create: (text) => {
        return new Promise((resolve, reject) => {
            db.run("INSERT INTO todos (text, completed) VALUES (?, ?)", [text, false], function(err) {
                if (err) reject(err);
                else resolve({ id: this.lastID, text, completed: false });
            });
        });
    },
    update: (id, completed) => {
        return new Promise((resolve, reject) => {
            db.run("UPDATE todos SET completed = ? WHERE id = ?", [completed, id], function(err) {
                if (err) reject(err);
                else resolve({ id, completed });
            });
        });
    },
    delete: (id) => {
        return new Promise((resolve, reject) => {
            db.run("DELETE FROM todos WHERE id = ?", [id], function(err) {
                if (err) reject(err);
                else resolve({ id });
            });
        });
    }
};
```
public/index.html:
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Todo App</title>
  <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">
</head>
<body>
  <div class="container mt-5">
    <h1 class="text-center">Todo List</h1>
    <div class="input-group mb-3">
      <input type="text" id="newTodo" class="form-control" placeholder="Add a new todo">
      <div class="input-group-append">
        <button class="btn btn-primary" onclick="addTodo()">Add</button>
      </div>
    </div>
    <ul id="todoList" class="list-group"></ul>
  </div>

  <script src="js/todo.js"></script>
</body>
</html>
```

public/js/todo.js:
```js
document.addEventListener('DOMContentLoaded', () => {
    fetch('/api/todos')
      .then(response => response.json())
      .then(todos => {
        todos.forEach(todo => {
          addTodoToList(todo);
        });
      });
  });
  
  function addTodo() {
    const todoText = document.getElementById('newTodo').value;
    if (todoText) {
      fetch('/api/todos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: todoText })
      })
        .then(response => response.json())
        .then(todo => {
          addTodoToList(todo);
          document.getElementById('newTodo').value = '';
        });
    }
  }
  
  function addTodoToList(todo) {
    const li = document.createElement('li');
    li.className = 'list-group-item d-flex justify-content-between align-items-center';
    li.textContent = todo.text;
    li.dataset.id = todo.id;
  
    const span = document.createElement('span');
    span.className = 'badge badge-primary badge-pill';
    span.textContent = todo.completed ? 'Completed' : 'Pending';
    span.style.cursor = 'pointer';
    span.onclick = () => toggleTodo(todo.id, !todo.completed);
  
    const deleteButton = document.createElement('button');
    deleteButton.className = 'btn btn-danger btn-sm';
    deleteButton.textContent = 'Delete';
    deleteButton.onclick = () => deleteTodo(todo.id);
  
    li.appendChild(span);
    li.appendChild(deleteButton);
    document.getElementById('todoList').appendChild(li);
  }
  
  function toggleTodo(id, completed) {
    fetch(`/api/todos/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ completed })
    })
      .then(response => response.json())
      .then(todo => {
        const li = document.querySelector(`li[data-id="${todo.id}"]`);
        if (li) {
          li.querySelector('span').textContent = todo.completed ? 'Completed' : 'Pending';
        }
      });
  }
  
  function deleteTodo(id) {
    fetch(`/api/todos/${id}`, {
      method: 'DELETE'
    })
      .then(response => response.json())
      .then(todo => {
        const li = document.querySelector(`li[data-id="${todo.id}"]`);
        if (li) {
          li.remove();
        }
      });
  }
```
routes/todoController.js:
```js
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
```
## 任务
1、请解释这个程序的功能
2、请按照MVC模式重构代码