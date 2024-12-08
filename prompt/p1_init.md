# 代码工程信息
## 工程源代码结构
```
.
├── index.js
├── package.json
└── public
    ├── index.html
    └── js
        └── todo.js

```

## 各源代码内容

index.js:
```js
const express = require('express');
const app = express();
const port = 3000;

app.use(express.static('public'));


app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});


//创建数据表
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(':memory:');
db.serialize(() => {
    db.run("CREATE TABLE todos (id INTEGER PRIMARY KEY AUTOINCREMENT, text TEXT, completed BOOLEAN)");
  })

//创建API接口
app.use(express.json());

app.get('/api/todos', (req, res) => {
  db.all("SELECT * FROM todos", (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.post('/api/todos', (req, res) => {
  const { text } = req.body;
  db.run("INSERT INTO todos (text, completed) VALUES (?, ?)", [text, false], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id: this.lastID, text, completed: false });
  });
});

app.put('/api/todos/:id', (req, res) => {
  const { id } = req.params;
  const { completed } = req.body;
  db.run("UPDATE todos SET completed = ? WHERE id = ?", [completed, id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id, completed });
  });
});

app.delete('/api/todos/:id', (req, res) => {
  const { id } = req.params;
  db.run("DELETE FROM todos WHERE id = ?", [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id });
  });
});
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
## 任务
1、请解释这个程序的功能
2、请按照MVC模式重构代码